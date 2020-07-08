import "../css/popup.css";

import $ from 'jquery'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// import {makeAnnotation} from "./utils/helper"
import {makeAnnotation} from "./background";
import { dumpDB, eraseDB, log } from "./utils/database";
import {getAllWindows, getIdentity} from "./utils/browserAPI";

import '../img/on.png';
import '../img/off.png';

window.addEventListener("load", function() {

  //ADD EVENT LISTENERS
  document.querySelector("#doLogToggle").onclick = function(){uToggleLogging()};
  document.querySelector("#doExport").onclick = function(){uDownloadFile()};
  document.querySelector("#doErase").onclick = function(){uErase();};
  document.querySelector("#doView").onclick = function(){
    window.open('view.html', '_blank');
  };
  document.querySelector("#doAnnotate").onclick = function(){uAnnotate();}

  //IS user currenting logging and recording?
  let logging = localStorage.getItem('logging');

  //SET LOGGING TOGGLE BUTTON TEXT
  if (logging == "true"){
    document.querySelector("#doLogToggle").innerHTML="Stop Logging";}
  else { document.querySelector("#doLogToggle").innerHTML="Start Logging";}
});

//DOWNLOAD all date to json file
function uDownloadFile() {
  alert("Downloading File");
  log(Date.now(), "meta", "file", "download")
  .catch(err => {console.error ("DB | ERROR" + err.stack);});
  dumpDB()
    .catch (err => {
        console.error ("DB | EXPORT ERROR" + err.stack);
        alert(("DB | EXPORT ERROR" + err.stack));
    });
}

//TOGGLE status of logging
function uToggleLogging(){
  let logging = localStorage.getItem('logging');
  // alert (typeof(state));

  if (logging == "true"){
      //STOP LOGGING
      chrome.browserAction.setIcon({path : "off.png"});
      document.querySelector("#doLogToggle").innerHTML="Start Logging";
      localStorage.setItem('logging', false);
      log(Date.now(), "meta", "logging", "stop","")
        .catch(err => {console.error ("DB | ERROR" + err.stack);});

      //LOG STRUCTURE
      getAllWindows()
        .then (
           result => (
             log(Date.now(),"structure", "logging", "start", {result})
              .catch(err => {console.error ("DB | ERROR" + err.stack);})
           ),
           error => console.log("error! "+error)
      );
    }
  else {
      chrome.browserAction.setIcon({path : "on.png"});
      document.querySelector("#doLogToggle").innerHTML="Stop Logging";
      localStorage.setItem('logging', true);

      //LOG STATUS
      log(Date.now(),"meta", "logging", "start","")
        .catch(err => {console.error ("DB | ERROR" + err.stack);});

      //LOG STRUCTURE
      getAllWindows()
        .then (
           result => (
             log(Date.now(),"structure", "logging", "stop", {result})
              .catch(err => {console.error ("DB | ERROR" + err.stack);})
           ),
           error => console.log("error! "+error)
      );
    }

}

//ERASE all data from the indexedDB
function uErase(){
  if ( window.confirm("Are you sure you want to erase your navigation log?")) {
    alert("Your data will be saved to a file and then erased");

    //log database dump
    log(Date.now(), "meta", "database", "erase")
    .catch(err => {console.error ("DB | ERROR" + err.stack);});

    //dump database contents to file
    dumpDB()
      .catch (err => {
          console.error ("DB | EXPORT ERROR" + err.stack);
          alert(("DB | EXPORT ERROR" + err.stack));
      });
    //erase database content
    eraseDB()
      .catch (err => {
        console.error ("DB | ERASE ERROR" + err.stack);
        alert(("DB | ERASE ERROR" + err.stack));
      });

    //initialize database for further logging
    getIdentity()
      .then (
        result => (
          log(Date.now(), "meta", "initialize", "postErase",
            { extension: chrome.runtime.getManifest().version,
              userAgent:window.navigator.userAgent,
              user: result
            })
            .catch(err => {console.error ("DB | ERROR" + err.stack);})
        )
      );

    getAllWindows()
      .then (
         result => (
           log(Date.now(),"structure", "initialize", "postErase", {result})
            .catch(err => {console.error ("DB | ERROR" + err.stack);})
         ),
         error => console.log("error! "+error)
    );
  }
}

//ANNOTATE
function uAnnotate(){
  makeAnnotation();
  // window.close();
}
