// This file is part of InvenioRDM
// Copyright (C) 2021 CERN.
// Copyright (C) 2021 Northwestern University.
// Copyright (C) 2021 Graz University of Technology.
//
// Invenio RDM Records is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React, { useState } from "react";
import { Icon, Button, Popup } from "semantic-ui-react";
import { ShareModal } from "./ShareModal";
import { i18next } from "@translations/invenio_app_rdm/i18next";
import PropTypes from "prop-types";

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
        
      
      <ShareModal open={modalOpen} handleClose={handleClose} recid={recid} />
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
