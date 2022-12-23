// This file is part of Invenio-DAMAP
// Copyright (C) 2022 TU Wien.
//
// Invenio-DAMAP is free software; you can redistribute it and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import $ from "jquery";
import { http } from "react-invenio-forms";

document.addEventListener("DOMContentLoaded", function() {
  
  $("#damap-button").on("click", function(e) {
    $.ajax({
      type: "GET",
      url: "/api/invenio_damap/damap/dmp",
      success: function(response) {
        removeDamapPopup();
        initDamapPopup();
        showDamapPopup();
        fillDamapPopup(response);
      }
    });
  });


  function showDamapPopup() {
    let $popup = $("#popup")
    $popup.modal("show");
  }

  function removeDamapPopup() {
    let $popup = $("#popup")
    $popup.remove();

  }

  function initDamapPopup() {
    // render the containers first
    let $popup = $("<div></div>", {"id": "popup", "class": "ui modal"}).appendTo("body");
    // popup header
    let $header = $("<div></div>", {"class": "header"}).appendTo($popup);
    $header.text("Link record to DMP");
    // popup content
    $("<div></div>", {"class": "content"}).appendTo("#popup");
    // render the popup
    $popup.modal("setting", "transition", "horizontal flip");
  }

  function fillDamapPopup(response) {
    // define variables
    let $questions_label = "Answer the questions, then select the corresponding DMP.";
    let $question_types = ["personal_data", "sensitive_data", "ethical_issues"];
    let $choices = ["yes", "no", "unknown"];
    // get record id from hidden input
    let $recid = $("#recid").val()

    // add label for the questions and container
    $("#popup .content").append($("<label><strong>" + $questions_label + "</strong></label>"));
    $("<div></div>", {"id": "radios"}).appendTo("#popup .content");

    // `question_types` groups * number of choices
    for (var type of $question_types) {
      let $question = `Does the dataset contain ${type}? *`.replace("_", " ");
      // fill question text
      $("<div></div>").attr({"id": `group-${type}`}).append($question).appendTo("#radios");
      // radio group wrapper (to apply styling)
      $("<div></div>").attr({"id": `group-${type}-wrapper`}).appendTo(`#group-${type}`);

      for (var choice of $choices) {
        // add radio button and corresponding label
        $(`#group-${type}-wrapper`)
          .append(`<input type="radio" id="${type + "-" + choice}" name="${type}" value="${choice}">`)
          .append(`<label for="${type + "-" + choice}">${choice}</label>`);
      }
      // apply right padding to odd children (namely the labels)
      $(`#group-${type}-wrapper`).children().odd().css("padding-right", "20px");
      // set "unknown" as default checked
      $(`input:radio[name="${type}"]`).filter('[value="unknown"]').attr("checked", true);
      // move wrapper to right-handside
      $(`#group-${type}-wrapper`).css({"float": "right"});
    }

    // DMPs container, gets filled from values fetched from the REST API
    $("<div></div>").attr({"id": "dmp-list", class: "ui celled list"}).appendTo("#popup .content");

    // iterate response (array of objects)
    $.each(response["hits"]["hits"], function(k, v) {
      // create current dmp container
      $("<div></div>").attr({"id": "dmp-" + v.id, "class": "item"}).appendTo("#dmp-list");

      // define button wrapper, float it right-handside and append to current container
      let $buttonDiv = $('<div class="right floated middle aligned content"></div>');
      $("#dmp-" + v.id).append($buttonDiv);

      // define the "add" button and append it to the wrapper
      let $add_button = $('<button class="ui button" type="button"><i aria-hidden="true" class="plus icon"></i>Add</button>');
      $buttonDiv.append($add_button);

      // attach onclick with varying url on each button
      $add_button.on("click", function(e) {
        http.post(`/api/invenio_damap/damap/dmp/${v.id}/dataset/` + $recid, {});
        alert("Success");
      });

      // add row header as the project title and content as the project description
      // must be appended after button wrapper is appended
      $("<div class='header'>"+ v.project.title +"</div>").appendTo("#dmp-" + v.id);
      $("<div class='description'>"+ v.project.description +"</div>").appendTo("#dmp-" + v.id);
    });
  }
});
