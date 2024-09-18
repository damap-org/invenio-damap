// This file is part of Invenio-DAMAP
// Copyright (C) 2023-2024 Graz University of Technology.
// Copyright (C) 2023-2024 TU Wien.
//
// Invenio-DAMAP is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import ReactDOM from "react-dom";
import React from "react";
import { Grid } from "semantic-ui-react";

import { DMPAddButton } from "./DMPAddButton";
import { DMPAuthButton } from "./DMPAuthButton";

const element = document.getElementById("dmps-container");

if (element) {
  const availableDmps = element.dataset.dmps;
  const damapUrl = element.dataset.damapUrl;

  const parsedAvailableDmps = availableDmps ? JSON.parse(availableDmps) : [];
  const recordManagementAppDiv = document.getElementById("recordManagement");
  const record = JSON.parse(recordManagementAppDiv.dataset.record);

  const ButtonComponent =
    parsedAvailableDmps.length > 0 ? (
      <DMPAddButton
        open={false}
        disabled={false}
        record={record}
        dmps={parsedAvailableDmps}
      />
    ) : (
      <DMPAuthButton loading={false} damapUrl={damapUrl} />
    );

  // TODO: 'render()' is deprecated, use 'root.render()'
  ReactDOM.render(
    <Grid.Column className="pt-5">{ButtonComponent}</Grid.Column>,
    element
  );
}
