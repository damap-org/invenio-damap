# -*- coding: utf-8 -*-
#
# Copyright (C) 2024 TU Wien.
# Copyright (C) 2024 Graz University of Technology.
#
# Invenio-DAMAP is free software; you can redistribute it and/or modify
# it under the terms of the MIT License; see LICENSE file for more details.

"""Identity generators."""

from flask_principal import AnonymousIdentity


def default_namespaced_id_generator(identity, *args, **kwargs) -> dict[str, str]:
    """
    Generates user identities mapped to namespace names.
    This is the default generator, which returns the user email as the primary identity.
    Modify it according to your needs.

    Parameters:
        identity: The user identity.

    Returns:
        dict: Namespaces with the user identifiers.
    """
    identifiers = {}
    if identity and not isinstance(identity, AnonymousIdentity):
        user = identity.user
        # default identifier is the user email
        identifiers["invenio_email"] = user.email
        # for each remote acount, add possible identifiers
        for ra in user.remote_accounts:
            # for each field in extra data, add a namespaced entry
            # (e.g. {damap_keycloak_id: ..., damap_person_id: ...})
            for k, v in ra.extra_data.items():
                identifiers[f"{ra.client_id}_{k}"] = v

    return identifiers
