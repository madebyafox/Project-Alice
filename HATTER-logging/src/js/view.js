"use strict";

import $ from 'jquery'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import { getAnnotations } from "./utils/database"

import "../css/timeline.css";

getAnnotations()
.then( result => {
    console.log("doing something");
    console.log(result);
    result.forEach(
    // element=>console.log(element);
    element => {

      //convert time
      let time = new Date(element.id);
      let localDate = time.toLocaleDateString();
      let localTime = time.toLocaleTimeString();

      let annotation = document.createElement("li");
      annotation.classList.add("timeline-inverted");

      // let badge = document.createElement("div");
      // badge.classList.add("timeline-badge");

      let icon = document.createElement("i");
      icon.classList.add("glyphicon","glyphicon-check");

      let panel = document.createElement("div");
      panel.classList.add("timeline-panel");

      let heading = document.createElement("div");
      heading.classList.add("timeline-heading");

      let title = document.createElement("h4");
      title.innerHTML = localDate +" "+ localTime ;

      let body = document.createElement("div");
      body.classList.add("timeline-body");

      let content = document.createElement("p");
      content.innerHTML = element.data.result;

      let timeline = document.querySelector(".timeline");
      timeline.append(annotation);
      // annotation.append(badge);
      annotation.append(panel);
      panel.append(heading);
      heading.append(title);
      panel.append(body);
      body.append(content);
    }
  );
  },
  error => console.log("OOPS there was a data retrieval error")
 );
