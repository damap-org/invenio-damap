<!---
    Copyright (C) 2022-2024 TU Wien.

    Invenio-DAMAP is free software; you can redistribute it and/or modify
    it under the terms of the MIT License; see LICENSE file for more details.
-->

# invenio-damap

Module for connecting InvenioRDM-based repositories to DAMAP.

**_NOTE:_** The current module is overriding the detail sidebar to add an extra button. At the moment, there is no guarantee that the configuration of this module will come after the one from invenio-app-rdm. Thus, the following line must be added to your `invenio.cfg` file:

```
from invenio_app_rdm.config import APP_RDM_DETAIL_SIDE_BAR_TEMPLATES

APP_RDM_DETAIL_SIDE_BAR_TEMPLATES = APP_RDM_DETAIL_SIDE_BAR_TEMPLATES + [
    # custom templates
    "invenio_damap/damap_sidebar.html",
]
```

### Config for local setup

In order to test the integration locally, a few configs have to be set.

#### Invenio side

##### OAuth setup to easily link a user

```py
from invenio_db import db
from invenio_oauthclient.models import RemoteAccount
from invenio_oauthclient.oauth import oauth_link_external_id, oauth_unlink_external_id
from invenio_oauthclient.contrib.keycloak.helpers import get_user_info


# setup handler to add person id used in damap
def setup_handler(remote, token, resp):
    """Perform additional setup after the user has been logged in."""
    token_user_info, _ = get_user_info(remote, resp, from_token_only=True)

    with db.session.begin_nested():
        # fetch the user's Keycloak ID and set it in extra_data
        keycloak_id = token_user_info["sub"]
        token.remote_account.extra_data = {
            "keycloak_id": keycloak_id,
            # setting person id for DMP retrieval
            "person_id": token_user_info["personID"]
        }

        user = token.remote_account.user
        external_id = {"id": keycloak_id, "method": remote.name}

        # link account with external Keycloak ID
        oauth_link_external_id(user, external_id)



from invenio_oauthclient.contrib import keycloak as k
helper = k.KeycloakSettingsHelper(
    title="DAMAP Login",
    description="DAMAP Keycloak",
    base_url="http://localhost:8087",
    realm="damap",
    legacy_url_path=False, # set to True when still using `/auth` in keycloak realm url
)

# create the configuration for Keycloak
# because the URLs usually follow a certain schema, the settings helper
# can be used to more easily build the configuration values:
OAUTHCLIENT_DAMAP_REALM_URL = helper.realm_url
OAUTHCLIENT_DAMAP_USER_INFO_URL = helper.user_info_url
OAUTHCLIENT_DAMAP_USER_INFO_FROM_ENDPOINT = False

# enable/disable checking if the JWT signature has expired
OAUTHCLIENT_DAMAP_VERIFY_EXP = True


keycloak_oauth = helper.remote_app
keycloak_oauth["signup_handler"]["setup"] = setup_handler


# not used but have to be specified
KEYCLOAK_APP_CREDENTIALS = dict(
    consumer_key='damap',
    consumer_secret='no secret',
)

OAUTHCLIENT_REMOTE_APPS = dict(
    damap={
            **keycloak_oauth,
        },
)

from invenio_app_rdm.config import APP_RDM_DETAIL_SIDE_BAR_TEMPLATES

APP_RDM_DETAIL_SIDE_BAR_TEMPLATES = APP_RDM_DETAIL_SIDE_BAR_TEMPLATES + [
    # custom templates
    "invenio_damap/damap_sidebar.html",
]

```

#### DAMAP side

In DAMAP, the users do not have an email set right now but an `email` field will be accessed by the oauth client.
In order to fix this, login to the DAMAP keycloak admin console (usually at http://localhost:8087) and set the email values for the users.
This should not be necessary on a proper keycloak instance. Also should be fixed in DAMAP to have a email value for the default keycloak instance.
