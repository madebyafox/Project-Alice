import $ from 'jquery'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import { log } from "./utils/database"

//On injection, add modal to the DOM and bind listener
function initialize() {

  console.log("INITIALIZING CONTENT SCRIPT");

  //DEFINE ANNOTATION MODAL
  let modal = document.createElement("div");
  modal.setAttribute("id","annotateModal");
  modal.classList.add("modal");
  modal.style.zIndex = '99999999';

  /* modal.classList.add("fadeIn"); */
  modal.setAttribute("tabindex","-1");
  modal.setAttribute("role" ,"dialog");
  modal.setAttribute("aria-labelledby", "exampleModalCenterTitle");
  modal.setAttribute("aria-hidden","true");

  let dialog = document.createElement("div");
  dialog.classList.add("modal-dialog","modal-dialog-centered","modal-lg");
  dialog.setAttribute("role","document");

  let content = document.createElement("div");
  content.classList.add("modal-content");
  content.style.backgroundColor="rgba(0,0,0,0)";

  let form = document.createElement("div");
  form.classList.add("row","with-margin");

  let col = document.createElement("div");
  col.classList.add("col-md-12");

  let inputgroup = document.createElement("div");
  inputgroup.classList.add("input-group","input-group-md");

  let annotation = document.createElement("input")
  annotation.id = "annotation";
  annotation.classList.add("form-control","input-md");
  annotation.setAttribute("type","text");
  annotation.setAttribute("placeholder",
  "What are you thinking at the moment?");
  annotation.autofocus=true;

  let span = document.createElement("span");
  span.classList.add("input-group-btn");

  let saveButton = document.createElement("button");
  saveButton.classList.add("btn", "btn-primary", "btn-md");
  saveButton.setAttribute("type","submit");
  saveButton.innerHTML="Save";
  saveButton.addEventListener("click",function(){
    //send message to background script to log annotation
    chrome.runtime.sendMessage({type:"annotation", result:annotation.value}, function(response) {
      // console.log(annotation.value);
      return true;
    });
    $("#annotateModal").modal('hide');
  });

  //CONSTRUCT THE DOM
  modal.append(dialog);
  dialog.append(content);
  content.append(form);
  form.append(col);
  col.append(inputgroup);
  inputgroup.append(annotation);
  inputgroup.append(span);
  span.append(saveButton);

  //inject modal into the DOM
  document.body.append(modal);

  //divert focus to input element
  //clear annotation value
  //(html5 autofocus not working with boostrap modals)
  $("#annotateModal").on('shown.bs.modal', function () {
      $(this).find("input:visible:first").focus();
      annotation.value="";
  });

}

//Listen for messages from background.js
let backgroundListener = function (request, sender, sendResponse) {
  console.log("I got a message: "+ request.type);

  switch (request.type) {
    case "are_you_there_content_script?":
      // console.log("CS | already here");
      //respond so script isn't re-injected
      sendResponse({status: "script_is_here"});
      break;
    case "open_modal":
      //OPEN the annotation modal
      // console.log("CS | Open Modal")
      $('#annotateModal').modal({
        backdrop: true, //close modal on click background
        keyboard: true, //close modal on esc
        focus:true,
        show:true
      });
      sendResponse({status: "Opened Modal"});
      break;
    }
  }
chrome.runtime.onMessage.addListener(backgroundListener);

//On destruction, remove everything
function destructor() {

    // Tear down content script: Unbind events, clear timers, restore DOM, etc. Destruction is needed only once
    console.log("DESTRUCTING CONTENT SCRIPT");

    //UNIND EVENTS
    document.removeEventListener(destructionEvent, destructor);
    chrome.runtime.onMessage.removeListener(backgroundListener);

    //restore DOM
    $('#annotateModal').remove();
    $('.modal-backdrop').remove();
}

// Unload previous content script if needed
var destructionEvent = 'destructmyextension_' + chrome.runtime.id;
document.dispatchEvent(new CustomEvent(destructionEvent));
document.addEventListener(destructionEvent, destructor);

// Finally, initialize the script
initialize();
