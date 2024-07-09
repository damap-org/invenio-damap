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
