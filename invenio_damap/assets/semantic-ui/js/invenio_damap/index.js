// This file is part of InvenioRDM
// Copyright (C) 2023 CERN.
//
// Invenio RDM is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

// import React from "react";
import ReactDOM from "react-dom";

import $ from "jquery";

// import { DMPButton } from "./dmpButton";


import React, { useState } from "react";
import { Grid, Icon, Button, Popup, Modal } from "semantic-ui-react";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";


// Modal begin

export const DMPModal = ({ recid, open, handleClose }) => {

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
        {i18next.t("Link record to DMP")}
      </Modal.Header>

      <Modal.Content>
         
        <Modal.Description>
          <p className="share-description rel-m-1">
            <Icon name="warning circle" />
             {
              i18next.t(
                  "No link has been created. Click on 'Get a Link' to make a new link."
                )
              }
          </p>
        </Modal.Description>
      </Modal.Content>

      <Modal.Actions>
        {(
          <Button size="small" negative floated="left" onClick={handleClose} icon>
            <Icon name="trash alternate outline" />
            {i18next.t("Close action")}
          </Button>
        )}
        <Button size="small" onClick={handleClose}>
          {i18next.t("Done")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

DMPModal.propTypes = {
  recid: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

// Modal end




export const DMPButton = ({ disabled, recid }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  return (
    <>
        <Button
        fluid
        onClick={handleOpen}
        disabled={disabled}
        primary
        size="medium"
        aria-haspopup="dialog"
        icon
        labelPosition="left"
        >
        <Icon name="share square" />
        {i18next.t("Add to DMP")}
        </Button>

        <DMPModal open={modalOpen} handleClose={handleClose} recid={recid} />
    </>
  );
};

DMPButton.propTypes = {
  disabled: PropTypes.bool,
  recid: PropTypes.string.isRequired,
};

DMPButton.defaultProps = {
  disabled: false,
};

// =========================================

let element = document.getElementById("invenio-damap-render");

// the render element won't be available if we're not the record owner
if (element) { 
  ReactDOM.render(
    (
      <Grid.Column className="pt-5">
        <DMPButton disabled={false} recid={"not-set"} />
      </Grid.Column>
    ),
    element,
  );
}
