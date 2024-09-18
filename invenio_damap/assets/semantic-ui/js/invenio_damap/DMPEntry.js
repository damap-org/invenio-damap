// This file is part of Invenio-DAMAP
// Copyright (C) 2023-2024 Graz University of Technology.
// Copyright (C) 2023-2024 TU Wien.
//
// Invenio-DAMAP is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";

import { Checkbox, Item, Label, Popup } from "semantic-ui-react";

export class DMPEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  render() {
    const { dmp, onDmpSelected, checked } = this.props;

    const alreadyAddedToDMP = dmp.datasets?.some((ds) => {
      return (
        ds.datasetId?.identifier === window.location.href ||
        ds.datasetId?.identifier?.replace("uploads", "records") ===
          window.location.href
      );
    });

    return (
      <Item>
        <Item.Image size="mini">
          <Checkbox
            onChange={(e, data) => onDmpSelected(dmp, data.checked)}
            checked={checked}
          />
        </Item.Image>
        <Item.Content>
          <Item.Header as="a">
            {dmp.project?.title ?? "DMP ID: " + dmp.id}
          </Item.Header>
          <Item.Description>
            {(dmp.project?.description ?? "").substring(0, 255)}
          </Item.Description>
          {alreadyAddedToDMP && (
            <Item.Extra>
              <Popup
                content={
                  "If you link the record to this DMP, a new version will be created in DAMAP."
                }
                trigger={
                  <Label icon="check" content="Already added" color="green" />
                }
              />
            </Item.Extra>
          )}
        </Item.Content>
      </Item>
    );
  }
}

DMPEntry.propTypes = {
  dmp: PropTypes.object.isRequired,
  onDmpSelected: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};
