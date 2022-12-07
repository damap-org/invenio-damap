# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Invenio-DAMAP service."""

import re
import requests

from flask_babelex import lazy_gettext as _

from invenio_records_resources.services import Service
from invenio_records_resources.services.base import LinksTemplate
from invenio_records_resources.services.records.schema import (
    ServiceSchemaWrapper,
)
from marshmallow import ValidationError
from sqlalchemy import or_
from sqlalchemy.orm.exc import NoResultFound
from sqlalchemy.sql import text

from flask_sqlalchemy import Pagination

from invenio_damap.services.errors import (
    InvenioDAMAPError,
    InvenioDAMAPDMPNotFoundError,
)


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

    def _create_headers(self, identity):
        headers = {
            "Authorization": self.config.damap_shared_secret,
        }

        headers.update(
            self.config.damap_custom_header_function(identity=identity)
        )

        return headers

    def search(self, identity, params):
        """Perform search for DMPs."""
        self.require_permission(identity, "read")

        search_params = self._get_search_params(params)

        query_param = search_params["q"]
        filters = []

        person_id = self.config.damap_person_id_function(identity=identity)
        r = requests.get(
            url=self.config.damap_base_url
            + "/api/invenio-damap/dmps/person/{}".format(person_id),
            headers=self._create_headers(identity),
            params=search_params,
        )

        r.raise_for_status()

        dmps = Pagination(
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
            links_tpl=LinksTemplate(
                self.config.links_search, context={"args": params}
            ),
            links_item_tpl=self.links_item_tpl,
        )

    def _get_search_params(self, params):
        page = params.get("page", 1)
        size = params.get(
            "size",
            self.config.search.pagination_options.get(
                "default_results_per_page"
            ),
        )

        _search_cls = self.config.search

        _sort_name = (
            params.get("sort")
            if params.get("sort") in _search_cls.sort_options
            else _search_cls.sort_default
        )
        _sort_direction_name = (
            params.get("sort_direction")
            if params.get("sort_direction")
            in _search_cls.sort_direction_options
            else _search_cls.sort_direction_default
        )

        sort = _search_cls.sort_options.get(_sort_name)
        sort_direction = _search_cls.sort_direction_options.get(
            _sort_direction_name
        )

        query_params = params.get("q", "")

        return {
            "page": page,
            "size": size,
            "sort": sort.get("fields"),
            "sort_direction": sort_direction.get("fn"),
            "q": query_params,
        }
