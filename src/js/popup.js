import "../css/popup.css";
import { dumpDB, eraseDB, log } from "./database/database";
import '../img/record.png';
import '../img/on.png';
import '../img/off.png';

window.addEventListener("load", function() {

  //ADD EVENT LISTENERS
  document.getElementById("doLogToggle").onclick = function(){uToggleLogging()};
  document.getElementById("doExport").onclick = function(){uDownloadFile()};
  document.getElementById("doErase").onclick = function(){uErase();};
  document.getElementById("doRecord").onclick = function(){uRecord();};
  document.getElementById("doSave").onclick = function(){uSave();};

  //IS user currenting logging and recording?
  let logging = localStorage.getItem('logging');
  let recording = localStorage.getItem('recording');

  //SET LOGGING TOGGLE BUTTON TEXT
  if (logging == "true"){
    document.getElementById("doLogToggle").innerHTML="Stop Logging";}
  else { document.getElementById("doLogToggle").innerHTML="Start Logging";}

  //SET BUTTON VISIBILITY
  if (recording == "true"){
    //hide all but recording button
    document.getElementById("doLogToggle").style.display="none";
    document.getElementById("doExport").style.display="none";
    document.getElementById("doErase").style.display="none";

    document.getElementById("doPurpose").style.display="flex";
    document.getElementById("doRecord").innerHTML="Stop Recording";
    document.getElementById("doRecord").classList.remove("btn-outline-dark");
    document.getElementById("doRecord").classList.add("btn-outline-danger");
    document.getElementById("doWrite").placeholder="Enter annotations here";
  }
  else { document.getElementById("doPurpose").style.display="none";}

});

//DOWNLOAD all date to json file
function uDownloadFile() {
  alert("Downloading File");
  dumpDB()
    .catch (err => {
        console.error ("DB | EXPORT ERROR" + err.stack);
        alert(("DB | EXPORT ERROR" + err.stack));
    });
}

//TOGGLE status of logging
function uToggleLogging(){
  let logging = localStorage.getItem('logging');
  let recording = localStorage.getItem('recording');
  // alert (typeof(state));

  if (logging == "true"){
      //STOP LOGGING
      chrome.browserAction.setIcon({path : "off.png"});
      document.getElementById("doLogToggle").innerHTML="Start Logging";
      localStorage.setItem('logging', false);
      log(Date.now(), "meta", "logging", "stop")
        .catch(err => {console.error ("DB | ERROR" + err.stack);});

      //TODO: LOG STRUCTURE

    }
  else {
      chrome.browserAction.setIcon({path : "on.png"});
      document.getElementById("doLogToggle").innerHTML="Stop Logging";
      localStorage.setItem('logging', true);

      //LOG STATUS
      log(Date.now(),"meta", "logging", "start")
        .catch(err => {console.error ("DB | ERROR" + err.stack);});

      //TODO: LOG STRUCTURE

    }


  }

//ERASE all data from the indexedDB
function uErase(){
  alert("Downloading your data first");
  dumpDB()
    .catch (err => {
        console.error ("DB | EXPORT ERROR" + err.stack);
        alert(("DB | EXPORT ERROR" + err.stack));
    });
  eraseDB()
    .catch (err => {
      console.error ("DB | ERASE ERROR" + err.stack);
      alert(("DB | ERASE ERROR" + err.stack));
    });
}

//SAVE the annotation
function uSave(){
  let text = document.getElementById("doWrite").value;

  //is this the start of the session? or continuation?
  let stage = (document.getElementById("doWrite").placeholder);
  if (stage == "Enter annotations here"){
    //LOG AS ANNOTATION
    log(Date.now(), "meta", "recording", "annotation", {result:text})
      .catch(err => {console.error ("DB | ERROR" + err.stack);});
    window.close();
  }
  else {
    //LOG AS GOAL
    log(Date.now(),"meta", "recording", "goal", {result:text})
      .catch(err => {console.error ("DB | ERROR" + err.stack);});

    //UPDATE INPUT UI
    document.getElementById("doWrite").value=null;
    document.getElementById("doWrite").placeholder="Enter annotations here";
  }
}

//TOGGLE status of session recording
function uRecord(){
  let recording = localStorage.getItem('recording');

  switch(recording){
    case "false": //start recording!

      //LOG STATUS
      log(Date.now(), "meta", "recording", "start")
      .catch(err => {console.error ("DB | ERROR" + err.stack);});
      localStorage.setItem('recording', true);
      localStorage.setItem('logging', true);

      //TODO: LOG STRUCTURE
      // log("structure", "recording", "start", {time:Date.now()})
        // .catch(err => {console.error ("DB | ERROR" + err.stack);});


      //SET RECORDING ICON
      chrome.browserAction.setIcon({
        path : "record.png"
      });

      //UPDATE RECORDING BUTTON
      document.getElementById("doRecord").classList.remove("btn-outline-dark");
      document.getElementById("doRecord").classList.add("btn-outline-danger");

      //UPDATE INPUT UI
      document.getElementById("doPurpose").style.display="flex";
      document.getElementById("doRecord").innerHTML="Stop Recording";

      //REMOVE OTHER BUTTONS
      document.getElementById("doLogToggle").style.display="none";
      document.getElementById("doExport").style.display="none";
      document.getElementById("doErase").style.display="none";

      break;
    case "true": //stop recording but keep logging

      //TODO LOG STRUCTURE
      // log("structure", "recording", "stop", {time:Date.now()})
        // .catch(err => {console.error ("DB | ERROR" + err.stack);});

      //LOG STATUS
      log(Date.now(), "meta", "recording", "stop")
        .catch(err => {console.error ("DB | ERROR" + err.stack);});
      localStorage.setItem('recording', false);

      //SET LOGGING
      chrome.browserAction.setIcon({path : "on.png"});
      localStorage.setItem('logging', true);
      document.getElementById("doLogToggle").innerHTML="Stop Logging";

      //UPDATE RECORDING BUTTON
      document.getElementById("doRecord").classList.add("btn-outline-dark");
      document.getElementById("doRecord").classList.remove("btn-outline-danger");

      //UPDATE INPUT UI
      document.getElementById("doPurpose").style.display="none";
      document.getElementById("doRecord").innerHTML="Record Session";

      //ADD OTHER BUTTONS
      document.getElementById("doLogToggle").style.display="flex";
      document.getElementById("doExport").style.display="flex";
      document.getElementById("doErase").style.display="flex";
      break;
  }
}
