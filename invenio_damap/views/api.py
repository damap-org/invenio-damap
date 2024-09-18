# -*- coding: utf-8 -*-
#
# This file is part of Invenio-DAMAP.
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""API views."""

from flask import Blueprint

blueprint = Blueprint("invenio_damap", __name__)


@blueprint.record_once
def init(state):
    """Init app."""
    app = state.app
    # Register services - cannot be done in extension because
    # Invenio-Records-Resources might not have been initialized.
    rr_ext = app.extensions["invenio-records-resources"]
    # ext = app.extensions["invenio-damap"]

    # NOTE: Could be interesting with regards to user sign up and updating user data
    # change notification handlers
    # rr_ext.notification_registry.register("users", ext.service.on_relation_update)


def create_invenio_damap_api_blueprint(app):
    """Create invenio-damap api blueprint."""
    ext = app.extensions["invenio-damap"]
    # control blueprint endpoints registration
    return ext.invenio_damap_resource.as_blueprint()
