"use strict";

import { openDB, deleteDB, wrap, unwrap } from 'idb'
import '../img/on.png'
import '../img/off.png'

//ON CLICK OF BROWSER ICON, LAUNCH MAIN AND CHANGE ICON
let toggle = true;
chrome.browserAction.onClicked.addListener(function(activeTab)
{
  switch(toggle){
    case true:
      chrome.browserAction.setIcon({path: "off.png"});
      toggle = false;
      break;
    case false:
      chrome.browserAction.setIcon({path: "on.png"});
      toggle = true;
      break;
    }

 let newurl = "main.html";
  chrome.tabs.create({ url: newurl });
});

if (!('indexedDB' in window)) {
    alert('This browser doesn\'t support IndexedDB, and cannot support this extension');
}

const DBPROMISE = openDB('wonderland', 1, { upgrade(db) {
    console.log("DB | UPGRADING");
    db.createObjectStore("navigation", {keyPath: 'id'});
    db.createObjectStore("structure", {keyPath: 'id'});
  }});


  //USING CHROME LOCAL STORAGE
  function storeLocal (type, handler, sevent, data) {
    chrome.storage.local.set(
      {[type +"_"+Date.now()] : {
        time: Date.now(),
        handler: handler,
        event: sevent,
        data: data
      }});
  }

  function log(type, handler, sevent, data) {
    switch (type){
      case "nav" :
        // console.log("NAVIGATION");
        DBPROMISE.then(function(db){
          var tx = db.transaction('navigation', 'readwrite');
          var navs = tx.objectStore('navigation');
          var now = Date.now();
          var item = [{
                id: now,
                handler: handler,
                event: sevent,
                data: data
              }];

          return Promise.all(item.map(function(item) {
              // console.log("adding item: "+item);
              return navs.add(item);
            })
          ).catch(function(e) {
            tx.abort();
            console.log(e);
          }).then(function() {
            // console.log("All items added successfully");
          });
        });
        break;
      case "structure":
        console.log("DB | LOGGING STRUCTURE");
        DBPROMISE.then(function(db){
          var tx = db.transaction('structure', 'readwrite');
          var navs = tx.objectStore('structure');
          var now = Date.now();
          var item = [{
                id: now,
                handler: handler,
                event: sevent,
                data: data
              }];

          return Promise.all(item.map(function(item) {
              // console.log("adding item: "+item);
              return navs.add(item);
            })
          ).catch(function(e) {
            tx.abort();
            console.log(e);
          }).then(function() {
            // console.log("All items added successfully");
          });
        });
        break;
    }
  }

const WINDOW_TYPES = [
  "normal","popup","panel","app","devtools"
];
const OPTS = {
  "populate" : true,
  "windowTypes": WINDOW_TYPES
};

let BrowserAPI = {
  getAllWindows: function(){
    return new Promise(
      function (resolve, reject){
        chrome.windows.getAll(OPTS, function(result){
          resolve(result);
          reject("window retrieval error");
        });
      });
  }
}

//GET STRUCTURE
BrowserAPI.getAllWindows().then (
   result => (log("structure", "initialize", "", result)),
   error => console.log("error!")
 );


// HANDLE WINDOW EVENTS
const WINDOW_EVENTS = [ //https://developer.chrome.com/extensions/windows#event-onCreated
    'onCreated', //Fired when a window is created.
    'onRemoved', //Fired when a window is removed (closed).
    'onFocusChanged' //Fired when the currently focused window changes.
                    //Returns chrome.windows.WINDOW_ID_NONE if all Chrome windows have lost focus.
];
WINDOW_EVENTS.forEach(function(e) {
  chrome.windows[e].addListener(function(data) {
    if (typeof data) {
      let currData = {windowId:data}
      log("nav", "windows", e, currData);
      console.log(chrome.i18n.getMessage('inWindowsHandler'), e, data);
    }
    else {
      console.error(chrome.i18n.getMessage('inWindowsHandlerError'), e);}
  });
});

//HANDLE TAB EVENTS
const TAB_EVENTS = [
    'onCreated', //Fired when a tab is created. Note that the tab's URL may not be set at the time this event is fired, but you can listen to onUpdated events so as to be notified when a URL is set.
    'onUpdated', //Fired when a tab is updated.
    'onMoved',  //Fired when a tab is moved within a window. Only one move event is fired, representing the tab the user directly moved. Move events are not fired for the other tabs that must move in response to the manually-moved tab. This event is not fired when a tab is moved between windows; for details, see tabs.onDetached.
    'onActivated', //Fires when the active tab in a window changes. Note that the tab's URL may not be set at the time this event fired, but you can listen to onUpdated events so as to be notified when a URL is set.
    // 'onHighlighted', //Fired when the highlighted or selected tabs in a window changes.
    'onDetached', //Fired when a tab is detached from a window; for example, because it was moved between windows.
    'onAttached', //Fired when a tab is attached to a window; for example, because it was moved between windows.
    'onRemoved', //Fired when a tab is closed.
    // 'onReplaced', //Fired when a tab is replaced with another tab due to prerendering or instant.
    // 'onZoomChange' //Fired when a tab is zoomed.
];
TAB_EVENTS.forEach(function(e) {
  chrome.tabs[e].addListener(function (p1, p2, p3) {
    if (typeof data) {
      switch (e){
        case "onCreated" :
          log("nav", "tabs", e, {tab:p1});
          console.log(chrome.i18n.getMessage('inTabsHandler'), e, p1);
          break;

        case "onActivated" :
          log("nav", "tabs", e, {activeInfo:p1});
          console.log(chrome.i18n.getMessage('inTabsHandler'), e, p1);
          break;

        case "onUpdated" :
          if (p2.url) {
            log("nav", "tabs", "onUpdated", {tabId:p1, changeInfo:p2, tab:p3});
            console.log(chrome.i18n.getMessage('inTabsHandler'), e, p1);
          }
          else {
            console.log(chrome.i18n.getMessage('inTabsHandler'), "NOTLOGGED—onUpdated", {tabId:p1})};
          break;

        case "onMoved" :
        case "onDetached" :
        case "onAttached" :
        case "onRemoved" :
        case "onReplaced" :
          log("nav", "tabs", e, {tabId:p1, DELTAS:p2 });
          console.log(chrome.i18n.getMessage('inTabsHandler'), e, p1);
          break;

        default:
          console.log("fell through case: ", e);
      }
     }
    else {
      console.error(chrome.i18n.getMessage('inTabsHandlerError'), e);}
  });
});

//HANDLE WEBNAVIGATION EVENTS
const TRANSITION_TYPE = [
  "link", "typed", "auto_bookmark", "auto_subframe", "manual_subframe", "generated", "start_page", "form_submit", "reload", "keyword", "keyword_generated"
];
const TRANSITION_QUALIFIER = [
  "client_redirect", "server_redirect", "forward_back", "from_address_bar"
];
const WEBNAV_EVENTS = [
  // 'onBeforeNavigate', //Fired when a navigation is about to occur.
  'onCreatedNavigationTarget', //Fired when a new window, or a new tab in an existing window, is created to host a navigation. HAS SOURCE TAB information
  'onCommitted',  //Fired when a navigation is committed. HAS TRANSITIONTYPE The document (and the resources it refers to, such as images and subframes) might still be downloading, but at least part of the document has been received from the server and the browser has decided to switch to the new document.
  'onCompleted',  //Fired when a document, including the resources it refers to, is completely loaded and initialized.
  // 'onDOMContentLoaded', //Fired when the page's DOM is fully constructed, but the referenced resources may not finish loading.
  'onErrorOccurred', //Fired when an error occurs and the navigation is aborted. This can happen if either a network error occurred, or the user aborted the navigation.
  'onReferenceFragmentUpdated', //Fired when the reference fragment of a frame was updated. All future events for that frame will use the updated URL.
  'onTabReplaced',  //Fired when the contents of the tab is replaced by a different (usually previously pre-rendered) tab.
  'onHistoryStateUpdated' //Fired when the frame's history was updated to a new URL. All future events for that frame will use the updated URL.
];
WEBNAV_EVENTS.forEach(function(e) {
  chrome.webNavigation[e].addListener(function(data) {
    if (typeof data){
      if (data.frameId == 0) {
        log("nav", "webNav", e, data);
        console.log(chrome.i18n.getMessage('inNavHandler'), e, data);
      }
      else {
        console.log(chrome.i18n.getMessage('inNavHandler'), "NOTLOGGED"+e, data);
      }
    }
    else {
      console.error(chrome.i18n.getMessage('inNavHandlerError'), e);}
  });
});
