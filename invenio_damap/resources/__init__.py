# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

from .config import InvenioDAMAPResourceConfig
from .resources import InvenioDAMAPResource

"""Invenio-DAMAP resources for InvenioRDM."""

__all__ = ("InvenioDAMAPResource", "InvenioDAMAPResourceConfig")
