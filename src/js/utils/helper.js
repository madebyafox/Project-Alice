//NOT CURRENTLY BEING USED 
async function makeAnnotation(){
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  console.log("annotating: "+ tabs[0].url);

  if (tabs[0] == undefined){
    console.log("HS | current tab is undefined!");
  }

  //coming from a chrome page (history, dev tools, newtab)
  else if (tabs[0].url.match(/chrome:\/\/\w+\//g))
  {
    console.log ("CHROME PAGE WORKAROUND");
    chrome.tabs.create({url:"annotate.html"}, function(newtab){
      chrome.tabs.sendMessage(newtab.id, {type: "open_modal"});
      console.log("HS | Open Workaround");
    });
  }

  else { //current tab is not devTools or other extension-specific page

    //is content script is already there?
    chrome.tabs.sendMessage(tabs[0].id, {type: "are_you_there_content_script?"}, function(msg) {
      console.log("BS | pinged CS in: "+ tabs[0].id);
      msg = msg || {};
      if (msg.status != 'script_is_here') {
        console.log("BS | Injecting contentscript to: "+tabs[0].id);
        chrome.tabs.executeScript(null,{file:"contentscript.bundle.js"});
      }
      else {
        console.log("BS | Content script already there");
        chrome.tabs.sendMessage(tabs[0].id, {type: "open_modal"});
        console.log("HS | Open Modal");
      }
    });
  }
});
}

export {makeAnnotation};
