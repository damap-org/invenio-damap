# -*- coding: utf-8 -*-
#
# This file is part of Invenio.
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# under the terms of the MIT License; see LICENSE file for more details.

"""Errors for InvenioDAMAP."""

from flask_babelex import lazy_gettext as _


class InvenioDAMAPError(Exception):
    """Base class for InvenioDAMAP errors."""

    def __init__(self, *args: object):
        """Constructor."""
        super().__init__(*args)


class InvenioDAMAPDMPNotFoundError(InvenioDAMAPError):
    """Class when a DMP can not be found."""

    def __init__(self, id, *args: object):
        """Constructor."""
        super().__init__(_("Can not find DMP with id `{}`".format(id)), *args)
