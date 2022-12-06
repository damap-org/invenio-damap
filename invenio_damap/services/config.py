# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Invenio-DAMAP service API configuration."""

from flask_babelex import gettext as _
from invenio_records_resources.services import ServiceConfig
from invenio_records_resources.services.base import Link
from invenio_records_resources.services.base.config import ConfiguratorMixin, FromConfig
from invenio_records_resources.services.records.links import pagination_links
from sqlalchemy import asc, desc

from invenio_damap.services.schema import (
    InvenioDAMAPSchema,
)

from ..services.links import InvenioDAMAPSetLink
from ..services.permissions import InvenioDAMAPPermissionPolicy
from ..services.results import (
    DMPItem,
    DMPList,
)


class SearchOptions:
    """Search options."""

    sort_default = "created"
    sort_direction_default = "asc"

    sort_direction_options = {
        "asc": dict(
            title=_("Ascending"),
            fn=asc,
        ),
        "desc": dict(
            title=_("Descending"),
            fn=desc,
        ),
    }

    sort_options = {
        "name": dict(
            title=_("Name"),
            fields=["name"],
        ),
        "spec": dict(
            title=_("Spec"),
            fields=["spec"],
        ),
        "created": dict(
            title=_("Created"),
            fields=["created"],
        ),
        "updated": dict(
            title=_("Updated"),
            fields=["updated"],
        ),
    }
    pagination_options = {
        "default_results_per_page": 25,
    }


def defaultDAMAPPersonIDFetcher(*args, **kwargs):
    return 123456

class InvenioDAMAPServiceConfig(ServiceConfig, ConfiguratorMixin):
    """Service factory configuration."""

    damap_base_url = FromConfig("INVENIO_DAMAP_DAMAP_BASE_URL", "")
    damap_person_id_func = FromConfig("INVENIO_DAMAP_PERSON_ID", defaultDAMAPPersonIDFetcher)

    service_id = "invenio_damap"

    # Common configuration
    permission_policy_cls = InvenioDAMAPPermissionPolicy
    result_item_cls = DMPItem
    result_list_cls = DMPList

    # Search configuration
    search = SearchOptions

    # Service schema
    schema = InvenioDAMAPSchema


    links_item = {
    }

    links_search = {
        **pagination_links("{+api}/invenio_damap/damap/dmp{?args*}"),
    }


