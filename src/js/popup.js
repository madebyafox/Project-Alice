import "../css/popup.css";
import { dumpDB, eraseDB, log } from "./database/database";

window.addEventListener("load", function() {
  let logging = localStorage.getItem('state');
  let recording = localStorage.getItem('recording');

  //ADD EVENT LISTENERS
  document.getElementById("doExport").onclick = function(){uDownloadFile()};
  document.getElementById("doLogToggle").onclick = function(){uTLog()};
  document.getElementById("doErase").onclick = function(){uErase();};
  document.getElementById("doRecord").onclick = function(){uRecord();};
  document.getElementById("doSave").onclick = function(){uSave();};

  //SET TOGGLE TEXT
  if (logging == "true"){
    document.getElementById("doLogToggle").innerHTML="Stop Logging";}
  else { document.getElementById("doLogToggle").innerHTML="Start Logging";}

  if (recording == "true"){
    document.getElementById("doPurpose").style.display="flex";
    document.getElementById("doRecord").innerHTML="Stop Recording";
    document.getElementById("doRecord").classList.remove("btn-outline-dark");
    document.getElementById("doRecord").classList.add("btn-outline-danger");
    document.getElementById("doWrite").placeholder="Enter annotations here";
  }
  else { document.getElementById("doPurpose").style.display="none";}

});

function uDownloadFile() {
  alert("Downloading File");
  dumpDB()
    .catch (err => {
        console.error ("DB | EXPORT ERROR" + err.stack);
        alert(("DB | EXPORT ERROR" + err.stack));
    });
}

function uTLog(){
  let logging = localStorage.getItem('state');
  // alert (typeof(state));
  if (logging == "true"){
      chrome.browserAction.setIcon({
        path : "off.png"
      });
      document.getElementById("doLogToggle").innerHTML="Start Logging";
      localStorage.setItem('state', false);
      log("navigation", "ui", "STOP LOGGING", {time:Date.now()})
        .catch(err => {console.error ("DB | ERROR" + err.stack);});
    }
  else {
      chrome.browserAction.setIcon({
        path : "on.png"
      });
      document.getElementById("doLogToggle").innerHTML="Stop Logging";
      localStorage.setItem('state', true);
      log("navigation", "ui", "START LOGGING", {time:Date.now()})
        .catch(err => {console.error ("DB | ERROR" + err.stack);});
    }
  }

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

function uRecord(){
  let logging = localStorage.getItem('recording');
  switch(logging){
    case "false": //start recording!

      //LOG STRUCTURE
      log("structure", "recording", "start", {time:Date.now()})
        .catch(err => {console.error ("DB | ERROR" + err.stack);});
      localStorage.setItem('recording', true);

      //UPDATE RECORDING BUTTON
      document.getElementById("doRecord").classList.remove("btn-outline-dark");
      document.getElementById("doRecord").classList.add("btn-outline-danger");

      //UPDATE INPUT UI
      document.getElementById("doPurpose").style.display="flex";
      document.getElementById("doRecord").innerHTML="Stop Recording";

      break;
    case "true": //stop recording!

      //LOG STRUCTURE
      log("structure", "recording", "stop", {time:Date.now()})
        .catch(err => {console.error ("DB | ERROR" + err.stack);});
      localStorage.setItem('recording', false);

      //UPDATE RECORDING BUTTON
      document.getElementById("doRecord").classList.add("btn-outline-dark");
      document.getElementById("doRecord").classList.remove("btn-outline-danger");

      //UPDATE INPUT UI
      document.getElementById("doPurpose").style.display="none";
      document.getElementById("doRecord").innerHTML="Record Session";

      break;
  }
}

function uSave(){
  let text = document.getElementById("doWrite").value;

  //is this the start of the session? or continuation?
  let stage = (document.getElementById("doWrite").placeholder);
  if (stage == "Enter annotations here"){
    //LOG AS ANNOTATION
    log("recording", "ui", "annotation", {time:Date.now(), result:text})
      .catch(err => {console.error ("DB | ERROR" + err.stack);});
    window.close();
  }
  else {
    //LOG AS GOAL
    log("recording", "ui", "goal", {time:Date.now(), result:text})
      .catch(err => {console.error ("DB | ERROR" + err.stack);});

    //UPDATE INPUT UI
    document.getElementById("doWrite").value=null;
    document.getElementById("doWrite").placeholder="Enter annotations here";
  }
}
