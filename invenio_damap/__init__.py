# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
# Copyright (C) 2024-2025 TU Wien.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Invenio-DAMAP API for InvenioRDM."""

from .ext import InvenioDAMAP

__version__ = "0.2.0"

__all__ = ("__version__", "InvenioDAMAP")
