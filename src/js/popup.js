import "../css/popup.css";
import { dumpDB, eraseDB, log } from "./database/database";

window.addEventListener("load", function() {
      let state = localStorage.getItem('state');
      if (state == "true"){
          document.getElementById("doLogToggle").innerHTML="Stop Logging";
      }
      else { document.getElementById("doLogToggle").innerHTML="Start Logging";}

      document.getElementById("doExport").onclick = function(){uDownloadFile()};
      document.getElementById("doLogToggle").onclick = function(){uTLog()};
      document.getElementById("doErase").onclick = function(){uErase();};



});

function uDownloadFile() {
  alert("Downloading File");
  dumpDB()
    .catch (err => {
        console.error ("DB | EXPORT ERROR" + err.stack);
        alert(("DB | EXPORT ERROR" + err.stack));
    });
}

function utLog(){
  let state = localStorage.getItem('state');
  // alert (typeof(state));
  if (state == "true"){
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
