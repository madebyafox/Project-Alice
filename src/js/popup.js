import "../css/popup.css";
import { dumpDB, eraseDB, log } from "./database/database";

window.addEventListener("load", function() {
      let state = localStorage.getItem('state');
      if (state == "true"){
          document.getElementById("doLogToggle").innerHTML="Stop";
      }
      else { document.getElementById("doLogToggle").innerHTML="Start";}

      document.getElementById("doExport").onclick = function(){downloadFile()};
      document.getElementById("doLogToggle").onclick = function(){tLog()};
      document.getElementById("doErase").onclick = function(){eraseDB()};

});

function downloadFile() {
  alert("Downloading File");
  dumpDB()
    .catch (err => {
        console.error ("DB | EXPORT ERROR" + err.stack);
        alert(("DB | EXPORT ERROR" + err.stack));
    });
}

function tLog(){
  let state = localStorage.getItem('state');
  // alert (typeof(state));
  if (state == "true"){
      chrome.browserAction.setIcon({
        path : "off.png"
      });
      document.getElementById("doLogToggle").innerHTML="Start";
      localStorage.setItem('state', false);
      alert("STOP LOGGING");
      log("navigation", "system", "STOP LOGGING", {time:Date.now()})
        .catch(err => {console.error ("DB | ERROR" + err.stack);});
    }
    else {
      chrome.browserAction.setIcon({
        path : "on.png"
      });
      document.getElementById("doLogToggle").innerHTML="Stop";
      localStorage.setItem('state', true);
      alert("START LOGGING");
      log("navigation", "system", "START LOGGING", {time:Date.now()})
        .catch(err => {console.error ("DB | ERROR" + err.stack);});
    }
  }
