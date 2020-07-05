


const WINDOW_TYPES = [
  "normal","popup","panel","app","devtools"
];
const OPTS = {
  "populate" : true,
  "windowTypes": WINDOW_TYPES
};

async function getAllWindows (){
    return new Promise(
      function (resolve, reject){
        chrome.windows.getAll(OPTS, function(result){
          resolve({time:Date.now(), result:result});
          reject("window retrieval error: "+result);
        });
      });
}

async function getIdentity(){
  return new Promise(
    function (resolve, reject){
      chrome.identity.getProfileUserInfo(function(result) {
        console.log(result);
        resolve(result);
        reject("identity error:" +result);
      });
    })
}

export {getAllWindows, getIdentity};
