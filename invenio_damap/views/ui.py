# -*- coding: utf-8 -*-
#
# This file is part of Invenio-DAMAP.
# Copyright (C) 2022 Graz University of Technology.
# Copyright (C) 2024 TU Wien.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""UI views."""

from flask import Blueprint, current_app, g
from requests.exceptions import HTTPError


#
# Registration
#
def create_ui_blueprint(app):
    """Register blueprint routes on app."""
    blueprint = Blueprint(
        "invenio_damap",
        __name__,
        template_folder="../templates",
        static_folder="../static",
    )

    @blueprint.app_template_global("damap_integration_enabled")
    def damap_enabled():
        """Helper function to get DAMAP_INTEGRATION_ENABLED."""
        return current_app.config.get("DAMAP_INTEGRATION_ENABLED", "")

    @blueprint.app_template_global("create_auth_jwt")
    def create_auth_jwt():
        """Helper function for jinja templates to create a JWT token for the user."""
        jwt = current_app.extensions[
            "invenio-damap"
        ].invenio_damap_service._create_auth_jwt(g.identity)

        return jwt

    @blueprint.app_template_global("query_damap_madmps")
    def query_damap_madmps(user_jwt):
        """Helper function for jinja templates to fetch maDMPs."""
        # The logic here is as follows:
        # - dmps=None indicates general errors (connection, 5xx, 4xx errors)
        # - dmps=[] indicates AuthN/-Z errors
        # - on successful request, the dmps list is populated
        dmps = None
        try:
            dmps = (
                current_app.extensions["invenio-damap"]
                .invenio_damap_service.search(g.identity, params={}, jwt=user_jwt)
                .to_dict()
            )

        except HTTPError as http_err:
            if http_err.response.status_code in [401, 403]:
                dmps = []
            current_app.logger.warning(f"Connection to DAMAP failed: {http_err}")

        except Exception as exc:
            current_app.logger.error(f"Connection to DAMAP failed: {exc}")

        return dmps

    @blueprint.app_template_global("get_damap_url")
    def get_damap_url():
        """Helper function to get DAMAP URL."""
        return current_app.config.get("DAMAP_BASE_URL", "")

    return blueprint
