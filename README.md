<!---
    Copyright (C) 2022 TU Wien.

    Invenio-DAMAP is free software; you can redistribute it and/or modify 
    it under the terms of the MIT License; see LICENSE file for more details.
-->

# invenio-damap

**_NOTE:_** The current module is overriding the detail sidebar to add an extra button. At the moment, there is no guarantee that the configuration of this module will come after the one from invenio-app-rdm. Thus, the following line must be added to your invenio.cfg file:

APP_RDM_DETAIL_SIDE_BAR_TEMPLATES = [<br>
&nbsp;&nbsp;&nbsp;&nbsp;'invenio_app_rdm/records/details/side_bar/manage_menu.html',<br>
&nbsp;&nbsp;&nbsp;&nbsp;'invenio_app_rdm/records/details/side_bar/metrics.html',<br>
&nbsp;&nbsp;&nbsp;&nbsp;'invenio_app_rdm/records/details/side_bar/versions.html',<br>
&nbsp;&nbsp;&nbsp;&nbsp;'invenio_app_rdm/records/details/side_bar/keywords_subjects.html',<br>
&nbsp;&nbsp;&nbsp;&nbsp;'invenio_app_rdm/records/details/side_bar/details.html',<br>
&nbsp;&nbsp;&nbsp;&nbsp;'invenio_app_rdm/records/details/side_bar/licenses.html',<br>
&nbsp;&nbsp;&nbsp;&nbsp;'invenio_app_rdm/records/details/side_bar/export.html',<br>
&nbsp;&nbsp;&nbsp;&nbsp;# custom templates<br>
&nbsp;&nbsp;&nbsp;&nbsp;'invenio_damap/damap_sidebar.html',<br>
]
