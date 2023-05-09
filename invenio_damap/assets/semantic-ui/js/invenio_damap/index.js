// This file is part of InvenioRDM
// Copyright (C) 2023 Graz University of Technology.
// Copyright (C) 2023 TU Wien.
//
// invenio-damap is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

// import React from "react";
import ReactDOM from "react-dom";

import $ from "jquery";

// import { DMPButton } from "./dmpButton";

import React, { useState } from "react";
import { Grid, Icon, Button, Popup, Modal } from "semantic-ui-react";
import { http } from "react-invenio-forms";
import PropTypes from "prop-types";

// DMP Item begin

export class DMPEntry extends React.Component {
  async onAddUpdateDataset(dmp_id, recid) {
    try {
      // TODO: Fill with selected answers
      let body = {};
      await http.post(
        `/api/invenio_damap/damap/dmp/${dmp_id}/dataset/${recid}`,
        body
      );
    } catch (error) {
      alert(error);
      console.log(error);
      // this.onError(error.response.data.message);
    }
  }

  render() {
    const { dmp, recid } = this.props;
    const alreadyAddedToDMP = this.props.dmp.datasets?.some(
      (ds) => ds.datasetId?.identifier === window.location.href
    );

    return (
      <div id={`dmp-${dmp.id}`}>
        <Button
          onClick={() => {
            this.onAddUpdateDataset(dmp.id, recid);
          }}
        >
          {alreadyAddedToDMP ? "Update DMP dataset" : "Add to DMP"}
        </Button>
      </div>
    );
  }
}

DMPEntry.propTypes = {
  recid: PropTypes.string.isRequired,
  dmp: PropTypes.object.isRequired,
  alreadyAddedToDMP: PropTypes,
};

// DMP Item end

// Modal begin

export class DMPModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: props.loading,
    };
  }

  setLoading(loading) {
    // TODO
    this.setState({ loading });
  }

  onError(message) {
    return null;
  }

  async fetchDMPs() {
    this.setLoading(true);
    try {
      let dmpSearchResult = await http.get("/api/invenio_damap/damap/dmp");
      this.setState({
        dmps: dmpSearchResult.data.hits.hits,
      });
    } catch (error) {
      this.setLoading(false);
      console.log(error);
      // this.onError(error.response.data.message);
    }
  }

  componentDidMount() {
    this.fetchDMPs();
  }

  render() {
    const { open, handleClose, dmps, recid, loading } = this.props;

    return (
      <Modal
        open={open}
        onClose={handleClose}
        className="share-modal"
        role="dialog"
        aria-labelledby="access-link-modal-header"
        aria-modal="true"
        tab-index="-1"
      >
        <Modal.Header id="dmp-modal-header">
          <Icon name="share alternate" />
          {"Link record to DMP"}
        </Modal.Header>

        <Modal.Content>
          <Modal.Description>
            <p className="share-description rel-m-1">
              <Icon name="warning circle" />
              {
                "No link has been created. Click on 'Get a Link' to make a new link."
              }
            </p>

            {dmps.map((dmp, index) => (
              <DMPEntry dmp={dmp} recid={recid}></DMPEntry>
            ))}

            <p>We have {dmps.length} DMPs </p>
          </Modal.Description>
        </Modal.Content>

        <Modal.Actions>
          {
            <Button
              size="small"
              negative
              floated="left"
              onClick={handleClose}
              icon
            >
              <Icon name="trash alternate outline" />
              {"Close action"}
            </Button>
          }
          <Button size="small" onClick={handleClose}>
            {"Done"}
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

DMPModal.propTypes = {
  recid: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  dmps: PropTypes.array,
};

DMPModal.defaultProps = {
  dmps: [],
};

// Modal end

// =====================================================

// DMPButton begin

export class DMPButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      recid: props.recid,
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
    const { disabled, open, recid } = this.state;

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
          <Icon name="share square" />
          {"Add to DMP"}
        </Button>

        <DMPModal open={open} handleClose={this.handleClose} recid={recid} />
      </>
    );
  }
}

DMPButton.propTypes = {
  disabled: PropTypes.bool,
  recid: PropTypes.string.isRequired,
  open: PropTypes.bool,
};

DMPButton.defaultProps = {
  disabled: false,
  open: false,
};

// =========================================

const element = document.getElementById("invenio-damap-render");
const recid = "not-set";

// the render element won't be available if we're not the record owner
if (element) {
  ReactDOM.render(
    <Grid.Column className="pt-5">
      <DMPButton open={false} disabled={false} recid={recid} />
    </Grid.Column>,
    element
  );
}
