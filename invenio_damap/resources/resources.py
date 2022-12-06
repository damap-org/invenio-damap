# -*- coding: utf-8 -*-
#
# Copyright (C) 2022 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Invenio-DAMAP resource."""

from flask import g
from flask_resources import Resource, resource_requestctx, response_handler, route
from invenio_records_resources.resources.errors import ErrorHandlersMixin
from invenio_records_resources.resources.records.resource import (
    request_data,
    request_search_args,
    request_view_args,
)


class InvenioDAMAPResource(ErrorHandlersMixin, Resource):
    """Invenio-DAMAP server resource."""

    def __init__(self, config, service):
        """Constructor."""
        super().__init__(config)
        self.service = service

    def create_url_rules(self):
        """Create the URL rules for the Invenio-DAMAP server resource."""
        routes = self.config.routes
        url_rules = [
            route("GET" , routes["damap-prefix"] + routes["dmp-prefix"] + routes["list"], self.search),
            route("POST", routes["damap-prefix"] + routes["dmp-prefix"]                 , self.create),
            route("GET" , routes["damap-prefix"] + routes["dmp-prefix"] + routes["item"], self.read),
        ]

        return url_rules

    #
    # Primary Interface
    #
    @request_search_args
    @response_handler(many=True)
    def search(self):
        """Perform a search over the items."""
        identity = g.identity
        hits = self.service.search(
            identity=identity,
            params=resource_requestctx.args,
        )
        return hits.to_dict(), 200

    @request_data
    @response_handler()
    def create(self):
        """Create an item."""
        item = self.service.create(
            g.identity,
            resource_requestctx.data or {},
        )
        return item.to_dict(), 201

    # @request_read_args
    @request_view_args
    @response_handler()
    def read(self):
        """Read an item."""
        item = self.service.read(
            g.identity,
            resource_requestctx.view_args["id"],
        )
        return item.to_dict(), 200
