# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Invenio-DAMAP configuration for InvenioRDM."""


def defaultDAMAPPersonIDFetcher(*args, **kwargs):
    return 123456


def defaultCustomHeaderFunction(*args, **kwargs):
    return {}


INVENIO_DAMAP_DAMAP_BASE_URL = "http://localhost:8080"

INVENIO_DAMAP_PERSON_ID_FUNCTION = defaultDAMAPPersonIDFetcher

INVENIO_DAMAP_SHARED_SECRET = "secret stuff or token"

INVENIO_DAMAP_CUSTOM_HEADER_FUNCTION = defaultCustomHeaderFunction
