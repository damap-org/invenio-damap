// This file is part of Invenio-DAMAP
// Copyright (C) 2023-2024 Graz University of Technology.
// Copyright (C) 2023-2024 TU Wien.
//
// Invenio-DAMAP is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import PropTypes from "prop-types";

import { Button, Form, Icon, Item, Message, Modal } from "semantic-ui-react";
import { http } from "react-invenio-forms";

import { DMPEntry } from "./DMPEntry";

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
        personal_data: "no",
        sensitive_data: "no",
      },
    };
  }

  onChange = (key, value) => {
    this.setState((prevState, props) => {
      let newSelectedValues = { ...prevState.selectedValues };
      newSelectedValues[key] = value;
      props.onChange(newSelectedValues);
      return { selectedValues: newSelectedValues };
    });
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
  };

  render() {
    const { icon, visible, type, header, content, errors } = this.state.message;
    return (
      <>
        {visible && (
          <Message
            // We override the icon size because it's not controllable when used in a <Message>.
            // Related bug: https://github.com/Semantic-Org/Semantic-UI/issues/6441
            icon={<Icon name={icon} style={{ fontSize: "2em" }} />}
            info={type === "info"}
            warning={type === "warning"}
            success={type === "success"}
            error={type === "error"}
            onDismiss={this.handleDismiss}
            header={header}
            content={content}
            list={errors.map((error) => error.dmp.project.title)}
          />
        )}
      </>
    );
  }
}

GenericMessage.propTypes = {
  message: PropTypes.object,
};

export class DMPModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      dmps: props.dmps,
      selectedDmps: [],
      userQuestions: {},
      message: {
        visible: false,
        icon: null,
        type: null,
        header: null,
        content: null,
        errors: [],
      },
    };
  }

  setLoading(loading) {
    this.setState({ loading: loading });
  }

  onError(message) {
    console.error(message);
    return null;
  }

  async fetchDMPs() {
    this.setLoading(true);
    try {
      let dmpSearchResult = await http.get("/api/invenio_damap/damap/dmp");
      const newDmps = dmpSearchResult.data.hits.hits;
      this.setState({ dmps: newDmps });
      // Pass the updated DMPs back to the button
      this.props.updateDmps(newDmps);
    } catch (error) {
      this.onError(error);
    }
    this.resetSelectedDmps();
    this.setLoading(false);
  }

  onUserQuestionsChange = (questionsAndAnswers) => {
    this.setState({
      userQuestions: questionsAndAnswers,
    });
  };

  onDmpSelected = (dmp, selected) => {
    this.setState((prevState) => {
      return {
        selectedDmps: selected
          ? [...prevState.selectedDmps, dmp]
          : prevState.selectedDmps.filter((d) => d !== dmp),
      };
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

  showMessage(icon, type, header, content, errors) {
    this.setState({
      message: {
        visible: true,
        icon: icon,
        type: type || "info",
        header: header,
        content: content,
        errors: errors || [],
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
      responses.push(
        this.onAddUpdateDataset(dmp.id, record).catch((e) => {
          errors.push({ dmp, error: e });
        })
      );
    }
    await Promise.all(responses);

    if (errors.length === 0) {
      this.showMessage(
        "check circle outline",
        "success",
        "Success!",
        "Record was linked to DMP(s)."
      );
    } else if (errors.length === selectedDmps.length) {
      this.showMessage(
        "times circle outline",
        "error",
        "Error",
        "Linking record to DMP(s) failed."
      );
    } else {
      this.showMessage(
        "warning sign",
        "warning",
        "Record was linked to DMP(s) with errors. Not linked/updated:",
        "",
        errors
      );
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
        icon: null,
        type: null,
        header: null,
        content: null,
        errors: [],
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
            <GenericMessage message={this.state.message}></GenericMessage>
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

DMPModal.defaultProps = {};

DMPModal.propTypes = {
  record: PropTypes.object.isRequired,
  open: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  dmps: PropTypes.array.isRequired,
  updateDmps: PropTypes.func.isRequired,
};
