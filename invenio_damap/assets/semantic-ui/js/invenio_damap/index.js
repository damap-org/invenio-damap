// This file is part of InvenioRDM
// Copyright (C) 2023-2024 Graz University of Technology.
// Copyright (C) 2023-2024 TU Wien.
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
  Message,
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
    this.props.onChange(newSelectedValues);
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

export class GenericMessage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: props.message,
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.message.visible !== prevProps.message.visible) {
      this.setState({
        message: {
          ...this.props.message,
        },
      });
    }
  }

  handleDismiss = () => {
    this.setState((prevState) => ({
      message: {
        ...prevState.message,
        visible: false,
      },
    }));
  }

  render() {
    const { visible, type, header, content } = this.state.message;
    return (
      <>
        {visible && (
          <Message
            info={type === 'info'}
            warning={type === 'warning'}
            success={type === 'success'}
            error={type === 'error'}
            onDismiss={this.handleDismiss}
            header={header}
            content={content}
          />
        )}
      </>
    );
  }
}

// Modal begin

export class DMPModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: props.loading,
      dmps: [],
      selectedDmps: [],
      userQuestions: {},
      message: {
        visible: false,
        type: null,
        header: null,
      },
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
    let { userQuestions } = this.state;
    let body = userQuestions;

    let response = await http.post(
      `/api/invenio_damap/damap/dmp/${dmp_id}/dataset/${record.id}`,
      body
    );

    return response;
  }

  showMessage(type, header, content) {
    this.setState({
      message: {
        visible: true,
        type: type || 'info',
        header: header,
        content: content,
      },
    });
  }

  async addDatasetToDmps() {
    this.setLoading(true);
    this.resetMessage();
    let { selectedDmps } = this.state;
    let { record } = this.props;

    let errors = [];
    let responses = [];

    for (let dmp of selectedDmps) {
      try {
        responses.push(this.onAddUpdateDataset(dmp.id, record));
      } catch (e) {
        errors.push(e);
      }
    }
    try {
      await Promise.all(responses);
      this.showMessage('success', 'Success!', 'Record was linked to the DMP(s).');
    } catch {
      console.error(errors);
      this.showMessage('error', 'Error', 'An error occurred while adding to DMP(s).');
    }
    this.setLoading(false);
  }

  resetSelectedDmps = () => {
    this.setState({
      selectedDmps: [],
    });
  };

  resetMessage() {
    this.setState({
      message: {
        visible: false,
        type: null,
        header: null,
        content: null,
      },
    });
  }

  handleModalClose = () => {
    this.resetMessage();
  };

  render() {
    const { open, handleClose, record } = this.props;
    let { dmps, loading, selectedDmps } = this.state;

    let buttonText = `Add or update dataset for ${selectedDmps.length} DMP(s)`;
    let buttonIcon = "plus";
    const isAddDMPButtonDisabled = selectedDmps.length === 0;

    return (
      <Modal
        open={open}
        onClose={handleClose}
        onUnmount={this.handleModalClose}
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
            <GenericMessage
              message={this.state.message}
            ></GenericMessage>
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
              if (!isAddDMPButtonDisabled) {
                await this.addDatasetToDmps();
                this.resetSelectedDmps();
                this.fetchDMPs();
              }
            }}
            disabled={isAddDMPButtonDisabled}
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
          <Icon name="plus square" />
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
