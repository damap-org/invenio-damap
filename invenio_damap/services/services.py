# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
# Copyright (C) 2023-2024 TU Wien.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Invenio-DAMAP service."""

from time import time

import jwt
import requests
from flask_security import current_user
from invenio_db import db
from invenio_rdm_records.proxies import current_rdm_records_service
from invenio_records_resources.services import Service
from invenio_records_resources.services.base import LinksTemplate
from invenio_records_resources.services.records.schema import ServiceSchemaWrapper

from invenio_damap import export as InvenioDAMAPExport


def _paginate(*args, **kwargs):
    """Compatibility layer for pagination between Flask-SQLAlchemy v2 and v3."""
    try:
        # first try the v3 approach
        return db.paginate(*args, **kwargs)

    except AttributeError:
        from flask_sqlalchemy import Pagination

        return Pagination(*args, **kwargs)


class InvenioDAMAPService(Service):
    """Invenio-DAMAP service."""

    def __init__(self, config):
        """Init service with config."""
        super().__init__(config)

    @property
    def schema(self):
        """Returns the data schema instance."""
        return ServiceSchemaWrapper(self, schema=self.config.schema)

    @property
    def links_item_tpl(self):
        """Item links template."""
        return LinksTemplate(
            self.config.links_item,
        )

    def _create_auth_jwt(self, identity, expires_in=600):
        """Creates an authorization jwt token for DAMAP."""
        person_data = self.config.damap_person_function(identity)

        # more info about JWT claims: https://www.rfc-editor.org/rfc/rfc7519.html#section-4
        return jwt.encode(
            {
                "sub": str(current_user.id),
                "exp": int(time()) + expires_in,
                "iat": int(time()),
                "invenio-damap": {
                    "identifiers": {
                        **person_data,
                    }
                },
            },
            self.config.damap_shared_secret,
            self.config.damap_jwt_encode_algorithm,
        )

    def _create_headers(self, identity, jwt=None, *args, **kwargs):
        """Creates the auth header and additional ones, if defined."""
        headers = self.config.damap_custom_header_function(identity=identity)
        headers.update(
            {"X-Auth": (f"{jwt}" if jwt else f"{self._create_auth_jwt(identity)}")}
        )
        return headers

    def search(self, identity, params, jwt=None, **kwargs):
        """Perform search for DMPs."""
        self.require_permission(identity, "read")

        search_params = self._get_search_params(params)
        headers = self._create_headers(identity, jwt)

        r = requests.get(
            url=self.config.damap_base_url + "/api/madmps",
            headers=headers,
            params=search_params,
        )
        r.raise_for_status()

        dmps = _paginate(
            query=None,
            items=r.json(),
            page=search_params["page"],
            per_page=search_params["size"],
            total=10,
        )

        return self.result_list(
            self,
            identity,
            dmps,
            params=search_params,
            links_tpl=LinksTemplate(self.config.links_search, context={"args": params}),
            links_item_tpl=self.links_item_tpl,
        )

    def add_record_to_dmp(self, identity, recid, dmp_id, data, jwt=None, **kwargs):
        """Add the provided record to the DMP."""

        headers = self._create_headers(identity, jwt)

        # this will also perform permission checks, ensuring the user may access the record.
        record = current_rdm_records_service.read(identity, recid)
        exported_record = InvenioDAMAPExport.export_as_madmp(record, **data)

        r = requests.post(
            url=self.config.damap_base_url + "/api/madmps",
            headers=headers,
            json={"dmp_id": dmp_id, "dataset": exported_record},
        )
        r.raise_for_status()

        return record

    def _get_search_params(self, params):
        page = params.get("page", 1)
        size = params.get(
            "size",
            self.config.search.pagination_options.get("default_results_per_page"),
        )

        _search_cls = self.config.search

        _sort_name = (
            params.get("sort")
            if params.get("sort") in _search_cls.sort_options
            else _search_cls.sort_default
        )
        _sort_direction_name = (
            params.get("sort_direction")
            if params.get("sort_direction") in _search_cls.sort_direction_options
            else _search_cls.sort_direction_default
        )

        sort = _search_cls.sort_options.get(_sort_name)
        sort_direction = _search_cls.sort_direction_options.get(_sort_direction_name)

        query_params = params.get("q", "")

        return {
            "page": page,
            "size": size,
            "sort": sort.get("fields"),
            "sort_direction": sort_direction.get("fn"),
            "q": query_params,
        }
