# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

from .config import InvenioDAMAPServiceConfig
from .services import InvenioDAMAPService

"""Invenio-DAMAP services for InvenioRDM."""


__all__ = ("InvenioDAMAPService", "InvenioDAMAPServiceConfig")
