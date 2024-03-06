# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
# Copyright (C) 2024 TU Wien.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Invenio-DAMAP configuration for InvenioRDM."""


def defaultDAMAPPersonIDFetcher(*args, **kwargs):
    return 123456


def defaultCustomHeaderFunction(*args, **kwargs):
    return {}


DAMAP_BASE_URL = "http://localhost:8085"

DAMAP_PERSON_ID_FUNCTION = defaultDAMAPPersonIDFetcher

DAMAP_SHARED_SECRET = "secret stuff or token"

DAMAP_CUSTOM_HEADER_FUNCTION = defaultCustomHeaderFunction

DAMAP_DMP_DATASET_DISTRIBUTION_HOST = {
    "availability": None,
    "backup_frequency": None,
    "backup_type": None,
    "certified_with": None,
    "description": None,
    "geo_location": None,
    "pid_system": None,
    "storage_type": None,
    "support_versioning": None,
}
