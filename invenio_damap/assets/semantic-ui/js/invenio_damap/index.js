// This file is part of Invenio-DAMAP
// Copyright (C) 2023-2024 Graz University of Technology.
// Copyright (C) 2023-2024 TU Wien.
//
// Invenio-DAMAP is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import ReactDOM from "react-dom";
import React from "react";
import { Grid } from "semantic-ui-react";
import { DMPButton } from "./DMPButton";

const element = document.getElementById("invenio-damap-render");

const recordManagementAppDiv = document.getElementById("recordManagement");
const record = JSON.parse(recordManagementAppDiv.dataset.record);

// the render element won't be available if we're not the record owner
element &&
  ReactDOM.render(
    <Grid.Column className="pt-5">
      <DMPButton open={false} disabled={false} record={record} />
    </Grid.Column>,
    element
  );
