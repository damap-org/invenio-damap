# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Invenio-DAMAP API schemas."""

from marshmallow import EXCLUDE, Schema, fields, validate
from marshmallow_utils.fields import NestedAttribute, SanitizedUnicode


class InvenioDAMAPProjectSchema(Schema):
    """Marshmallow schema for Invenio-DAMAP."""

    description = SanitizedUnicode(load_default=None, dump_default=None)
    title = SanitizedUnicode(
        required=True, validate=validate.Length(min=1, max=255)
    )
    # created = fields.DateTime(dump_only=True)
    # updated = fields.DateTime(dump_only=True)
    id = fields.Int()

    class Meta:
        """Meta attributes for the schema."""

        unknown = EXCLUDE
        ordered = True


class InvenioDAMAPSchema(Schema):
    """Marshmallow schema for Invenio-DAMAP."""

    # created = fields.DateTime(dump_only=True)
    # updated = fields.DateTime(dump_only=True)
    id = fields.Int()
    created = fields.Str()
    project = fields.Nested(nested=InvenioDAMAPProjectSchema)

    class Meta:
        """Meta attributes for the schema."""

        unknown = EXCLUDE
        ordered = True
