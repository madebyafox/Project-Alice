//FROM manifest.json
"content_scripts": [
 {
   "matches": ["<all_urls>"],
   "js":["contentscript.bundle.js"],
   "run_at":"document_idle"
 }
],



FROM BACKGROUND, WHEN INJECTION WAS ON UPDATE CREATE AND COMMIT
//CONDITIONS for injecting contentscript for annotation modal
// function tryInjection(tabId){
//   console.log("BS | request to inject: "+ tabId)
//   //GET URL of tab
//   chrome.tabs.get(tabId, function(tab) {
//     // console.log("getting active tab: "+ tab.id);
//
//     //if the current tab is NOT a chrome tab, inject  the content script
//     if (tab.url.match(/chrome:\/\/\w+\//g)) {
//         //do nothing. can't inject into chrome pages
//         console.log("BS | Can't inject contentscript into: " + tab.url);
//       }
//     else {
//       //make sure content script is not already injected
//       chrome.tabs.sendMessage(tab.id, {type: "are_you_there_content_script?"}, function(msg) {
//         console.log("BS | pinged CS in: "+tab.id);
//         msg = msg || {};
//         if (msg.status != 'script_is_here') {
//           console.log("BS | Injecting contentscript to: "+tab.id);
//           chrome.tabs.executeScript(null,{file:"contentscript.bundle.js"});
//         }
//     });
//     }
//   });
// }


//LISTEN for tab events and trigger contentscript
// chrome.tabs.onActivated.addListener(function (activeInfo){
//
//   //GET URL of tab
//   chrome.tabs.get(activeInfo.tabId, function(tab) {
//     // console.log("getting active tab: "+ tab.id);
//
//     //if the current tab is NOT a chrome tab, inject  the content script
//     if (tab.url.match(/chrome:\/\/\w+\//g)) {
//         //do nothing. can't inject into chrome pages
//         console.log("BS | Can't inject contentscript into: " + tab.url);
//       }
//     else {
//       //make sure content script is not already injected
//       chrome.tabs.sendMessage(tab.id, {type: "are_you_there_content_script?"}, function(msg) {
//         console.log("BS | pinged CS in: "+tab.id);
//         msg = msg || {};
//         if (msg.status != 'script_is_here') {
//           console.log("BS | Injecting contentscript: "+tab.id);
//           chrome.tabs.executeScript(null,{file:"contentscript.bundle.js"});
//         }
//     });
//     }
//   });
// });

//FROM BACKGROUND.js re: injecting script on initialization
//SEEMS  to work but drags to the system to a halt
//ON EXTENSION INITIALIZATION inject contentscript into all tabs
// chrome.tabs.query( {}, function(tabs) {
//   for (let i in tabs)
//   {
//     console.log(tabs[i])
//     chrome.tabs.executeScript(tabs[i].id,{file:"contentscript.bundle.js"},function(){console.log("running")});
//     chrome.tabs.sendMessage(tabs[i].id, {type: "refresh"});
//     console.log("I sent a message");
//   }
// });



//FROM background.js BEFORE refactor BrowserAPI into util

//NOTE: MAIN PAGE CURRENTLY DISABLED
// chrome.browserAction.onClicked.addListener(function(activeTab)
// {
//  let newurl = "main.html";
//   chrome.tabs.create({ url: newurl });
// });

// let newurl = "main.html";
// chrome.tabs.create({ url: newurl });




//OLD SYNTAX
const BrowserAPI = {
  getAllWindows: function(){
    return new Promise(
      function (resolve, reject){
        chrome.windows.getAll(OPTS, function(result){
          resolve({time:Date.now(), result:result});
          reject("window retrieval error");
        });
      });
  }
}

// LOG BROWSER and USER information
chrome.identity.getProfileUserInfo(function(UserInfo) {
    console.log(UserInfo);
    // return result;
    log(Date.now(),"meta", "initialize", "initialize",
        {extension: chrome.runtime.getManifest().version,
          userAgent:window.navigator.userAgent,
          user: UserInfo
        })
        .catch(err => {console.error ("DB | ERROR" + err.stack);})
  });


  // GET BROWSER WINDOW & TAB STRUCTURE
  BrowserAPI.getAllWindows()
    .then (
     result => (
       log(Date.now(),"structure", "initialize", "initialize", {result})
        .catch(err => {console.error ("DB | ERROR" + err.stack);})
     ),
     error => console.log("error!")
    )
