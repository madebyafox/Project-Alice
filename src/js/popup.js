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

  //SET TOGGLE TEXT
  if (logging == "true"){
    document.getElementById("doLogToggle").innerHTML="Stop Logging";}
  else { document.getElementById("doLogToggle").innerHTML="Start Logging";}

  if (recording == "true"){
    document.getElementById("doPurpose").style.display="flex";
    document.getElementById("doRecord").innerHTML="Stop Recording";
    document.getElementById("doRecord").classList.remove("btn-outline-dark");
    document.getElementById("doRecord").classList.add("btn-outline-danger");
  }
  else { document.getElementById("doPurpose").style.display="none";}

      // document.getElementById("doPurpose").style.display="none";

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
      log("navigation", "system", "STOP LOGGING", {time:Date.now()})
        .catch(err => {console.error ("DB | ERROR" + err.stack);});
    }
  else {
      chrome.browserAction.setIcon({
        path : "on.png"
      });
      document.getElementById("doLogToggle").innerHTML="Stop Logging";
      localStorage.setItem('state', true);
      log("navigation", "system", "START LOGGING", {time:Date.now()})
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
    case "false":
      document.getElementById("doPurpose").style.display="flex";
      document.getElementById("doRecord").innerHTML="Stop Recording";
      document.getElementById("doRecord").classList.remove("btn-outline-dark");
      document.getElementById("doRecord").classList.add("btn-outline-danger");
      localStorage.setItem('recording', true);
      break;
    case "true":
      document.getElementById("doPurpose").style.display="none";
      document.getElementById("doRecord").innerHTML="Record Session";
      document.getElementById("doRecord").classList.add("btn-outline-dark");
      document.getElementById("doRecord").classList.remove("btn-outline-danger");
      localStorage.setItem('recording', false);

      break;
  }
}
