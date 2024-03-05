// This file is part of Invenio-DAMAP
// Copyright (C) 2023-2024 Graz University of Technology.
// Copyright (C) 2023-2024 TU Wien.
//
// Invenio-DAMAP is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { Button, Icon } from "semantic-ui-react";

import PropTypes from "prop-types";

import { DMPModal } from "./DMPModal";

export class DMPButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: props.record,
      disabled: props.disabled,
      open: props.open,
    };
  }

  handleOpen = () => {
    this.setState({
      open: true,
    });
  };

  handleClose = () => {
    this.setState({
      open: false,
    });
  };

  render() {
    const { disabled, open, record } = this.state;

    return (
      <>
        <Button
          fluid
          onClick={this.handleOpen}
          disabled={disabled}
          primary
          size="medium"
          aria-haspopup="dialog"
          icon
          labelPosition="left"
        >
          <Icon name="plus square" />
          {"Add to DMP"}
        </Button>
        {open && (
          <DMPModal
            open={open}
            handleClose={this.handleClose}
            record={record}
          />
        )}
      </>
    );
  }
}

DMPButton.propTypes = {
  disabled: PropTypes.bool,
  record: PropTypes.object.isRequired,
  open: PropTypes.bool,
};

DMPButton.defaultProps = {
  disabled: false,
  open: false,
};
