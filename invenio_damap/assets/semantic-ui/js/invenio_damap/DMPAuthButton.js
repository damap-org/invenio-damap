// This file is part of Invenio-DAMAP
// Copyright (C) 2023-2024 Graz University of Technology.
// Copyright (C) 2023-2024 TU Wien.
//
// Invenio-DAMAP is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";

import { Button, Icon, Popup } from "semantic-ui-react";

// TODO: Make overridable
// TODO: We could render an extra dialog instead of redirecting. This should be possible when
// DAMAP offers a way to check between null (no identity) vs empty list (no DMPs created).
export class DMPAuthButton extends React.Component {
  openDAMAP = () => {
    const { damapUrl } = this.props;
    window.open(damapUrl, "_blank");
  };

  render() {
    const { loading } = this.props;
    return (
      <div style={{ display: "flex", alignItems: "center" }}>
        <Button
          fluid
          onClick={this.openDAMAP}
          disabled={false}
          primary
          size="medium"
          aria-haspopup="dialog"
          icon
          labelPosition="left"
          loading={loading}
        >
          <Icon name="key" />
          {"Authenticate with DAMAP"}
        </Button>
        <Popup
          content={
            "Almost there! To proceed, make sure that you've created at least one DMP in DAMAP, or check that your eligibilty requirements are fully met."
          }
          trigger={<Icon name="info circle" aria-hidden="true" />}
        />
      </div>
    );
  }
}

DMPAuthButton.propTypes = {
  loading: PropTypes.bool.isRequired,
  damapUrl: PropTypes.string.isRequired,
};
