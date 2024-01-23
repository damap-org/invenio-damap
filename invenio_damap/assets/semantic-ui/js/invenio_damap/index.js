// This file is part of InvenioRDM
// Copyright (C) 2023-2024 Graz University of Technology.
// Copyright (C) 2023 TU Wien.
//
// invenio-damap is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import ReactDOM from "react-dom";
import React, { useState } from "react";
import {
  Grid,
  Icon,
  Item,
  Button,
  Modal,
  Radio,
  Form,
  Checkbox,
  Label,
} from "semantic-ui-react";
import { http } from "react-invenio-forms";

import PropTypes from "prop-types";

export class RadioGroupQuestion extends React.Component {
  render() {
    const { title, optionsAndValues, onChange, selectedValue } = this.props;
    return (
      <Form>
        <Form.Group inline>
          <label>{title}</label>

          {Object.entries(optionsAndValues).map(([question, value]) => (
            <Form.Radio
              key={question + value}
              label={question}
              name={`radioGroup$title${title}`}
              value={value}
              checked={selectedValue === value}
              onChange={() => {
                onChange(value);
              }}
            />
          ))}
        </Form.Group>
      </Form>
    );
  }
}

RadioGroupQuestion.propTypes = {
  title: PropTypes.string.isRequired,
  optionsAndValues: PropTypes.objectOf(PropTypes.any).isRequired,
  onChange: PropTypes.func.isRequired,
  selectedValue: PropTypes.any.isRequired,
};

export class UserQuestions extends React.Component {
  question_types = ["personal_data", "sensitive_data"];

  constructor(props) {
    super(props);
    this.state = {
      selectedValues: {
        personal_data: "unknown",
        sensitive_data: "unknown",
      },
    };
  }

  onChange = (key, value) => {
    let newSelectedValues = { ...this.state.selectedValues };
    newSelectedValues[key] = value;
    this.setState({
      selectedValues: newSelectedValues,
    });
    this.props.onChange(this.state.selectedValues);
  };

  render() {
    return (
      <div>
        {this.question_types.map((question) => (
          <RadioGroupQuestion
            key={question}
            title={`Does the dataset contain ${question}? *`.replace("_", " ")}
            optionsAndValues={structuredClone({
              Yes: "yes",
              No: "no",
              Unknown: "unknown",
            })}
            selectedValue={this.state.selectedValues[question]}
            onChange={(value) => {
              this.onChange(question, value);
            }}
          ></RadioGroupQuestion>
        ))}
      </div>
    );
  }
}
UserQuestions.propTypes = {
  onChange: PropTypes.func.isRequired,
};

// DMP Item begin

export class DMPEntry extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  async onAddUpdateDataset(dmp_id, record) {
    this.setLoading(true);
    try {
      // TODO: Fill with selected answers
      let body = {};
      await http.post(
        `/api/invenio_damap/damap/dmp/${dmp_id}/dataset/${record.id}`,
        body
      );
      this.props.onUpdate();
    } catch (error) {
      alert(error);
      console.log(error);
    }
    this.setLoading(false);
  }

  setLoading(loading) {
    this.setState({ loading: loading });
  }

  render() {
    const { dmp, record, onDmpSelected, checked } = this.props;

    const alreadyAddedToDMP = this.props.dmp.datasets?.some((ds) => {
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
              <Label icon="check" content="Already added" color="green" />
            </Item.Extra>
          )}
        </Item.Content>
      </Item>
    );
  }
}

DMPEntry.propTypes = {
  record: PropTypes.object.isRequired,
  dmp: PropTypes.object.isRequired,
  onUpdate: PropTypes.func.isRequired,
  onDmpSelected: PropTypes.func.isRequired,
  checked: PropTypes.bool.isRequired,
};

// DMP Item end

// Modal begin

export class DMPModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: props.loading,
      dmps: [],
      selectedDmps: [],
      userQuestions: {},
    };
  }

  setLoading(loading) {
    this.setState({ loading: loading });
  }

  onError(message) {
    console.log("ERROR", message);
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
    this.resetSelectedDmps();

    this.setLoading(false);
  }

  componentDidMount() {
    this.fetchDMPs();
  }

  onUserQuestionsChange = (questionsAndAnswers) => {
    this.setState({
      userQuestions: questionsAndAnswers,
    });
  };

  onDmpSelected = (dmp, selected) => {
    let x = this.state.selectedDmps.filter((d) => d !== dmp);
    if (selected) {
      x.push(dmp);
    }

    this.setState({
      selectedDmps: x,
    });
  };

  async onAddUpdateDataset(dmp_id, record) {
    // TODO: Fill with selected answers
    let userQuestions = this.state;
    let body = userQuestions;

    let response = http.post(
      `/api/invenio_damap/damap/dmp/${dmp_id}/dataset/${record.id}`,
      body
    );

    return response;
  }

  addDatasetToDmps = async () => {
    this.setLoading(true);
    let { selectedDmps } = this.state;
    let { record } = this.props;

    let errors = [];
    let responses = [];

    let promises = selectedDmps.map(async (dmp) => {
      try {
        responses.push(this.onAddUpdateDataset(dmp.id, record));
      } catch (e) {
        errors.push(e);
      }
    });
    await Promise.all(promises);
    console.log(errors);

    this.setLoading(false);
  };

  resetSelectedDmps = () => {
    this.setState({
      selectedDmps: [],
    });
  };

  render() {
    const { open, handleClose, record } = this.props;
    let { dmps, loading, selectedDmps } = this.state;

    let buttonText = `Add or update dataset for ${selectedDmps.length} DMP(s)`;
    let buttonIcon = "plus";

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
            <UserQuestions
              onChange={this.onUserQuestionsChange}
            ></UserQuestions>
            <Item.Group divided>
              {dmps.map((dmp, index) => (
                <DMPEntry
                  key={dmp.id}
                  checked={selectedDmps.indexOf(dmp) > -1}
                  onDmpSelected={this.onDmpSelected}
                  floated="right"
                  dmp={dmp}
                  record={record}
                  loading={loading}
                  onUpdate={(event) => {
                    this.fetchDMPs();
                  }}
                ></DMPEntry>
              ))}
            </Item.Group>
          </Modal.Description>
        </Modal.Content>

        <Modal.Actions>
          <Button
            size="small"
            floated="left"
            onClick={(event) => {
              this.fetchDMPs();
            }}
            icon
            loading={loading}
            labelPosition="left"
          >
            <Icon name="sync" />
            {"Refresh DMPs"}
          </Button>

          <Button size="small" onClick={handleClose}>
            {"Done"}
          </Button>

          <Button
            primary
            floated="right"
            icon
            loading={loading}
            labelPosition="left"
            onClick={async () => {
              await this.addDatasetToDmps();
              this.resetSelectedDmps();
              this.fetchDMPs();
            }}
          >
            <Icon name={buttonIcon} />
            {buttonText}
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

DMPModal.defaultProps = {
  dmps: [],
};

DMPModal.propTypes = {
  record: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
};

// Modal end

// =====================================================

// DMPButton begin

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
          <Icon name="share square" />
          {"Add to DMP"}
        </Button>

        <DMPModal open={open} handleClose={this.handleClose} record={record} />
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

// =========================================

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
