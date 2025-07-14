# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
# Copyright (C) 2023-2024 TU Wien.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# under the terms of the MIT License; see LICENSE file for more details.

"""Errors for InvenioDAMAP."""


class InvenioDAMAPError(Exception):
    """Base class for InvenioDAMAP errors."""

    def __init__(self, *args: object):
        """Constructor."""
        super().__init__(*args)
