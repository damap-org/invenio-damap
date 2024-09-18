// This file is part of Invenio-DAMAP
// Copyright (C) 2023-2024 Graz University of Technology.
// Copyright (C) 2023-2024 TU Wien.
//
// Invenio-DAMAP is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";

import { Button, Icon } from "semantic-ui-react";

import { DMPModal } from "./DMPModal";

export class DMPAddButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      record: props.record,
      disabled: props.disabled,
      open: props.open,
      linkedAccount: null,
      loading: false,
      dmps: props.dmps,
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

  updateDmps = (newDmps) => {
    this.setState({ dmps: newDmps });
  };

  render() {
    const { disabled, open, record, loading, dmps } = this.state;

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
            dmps={dmps}
            updateDmps={this.updateDmps}
          />
        )}
      </>
    );
  }
}

DMPAddButton.propTypes = {
  disabled: PropTypes.bool,
  record: PropTypes.object.isRequired,
  open: PropTypes.bool,
  loading: PropTypes.bool,
  dmps: PropTypes.array.isRequired,
};

DMPAddButton.defaultProps = {
  disabled: false,
  open: false,
};
