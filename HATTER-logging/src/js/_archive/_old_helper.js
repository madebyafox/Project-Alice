


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
    // chrome.tabs.sendMessage(tabs[0].id, {type: "openModal"});
    chrome.tabs.sendMessage(tabs[0].id, {type: "open_modal"});
    console.log("HS | Open Modal");
  }
});
}

export {makeAnnotation};