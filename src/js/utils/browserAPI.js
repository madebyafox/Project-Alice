
//ACCESS TO BROWSER APIS



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

export {getAllWindows};

//OLD SYNTAX
//const BrowserAPI = {
//   getAllWindows: function(){
//     return new Promise(
//       function (resolve, reject){
//         chrome.windows.getAll(OPTS, function(result){
//           resolve({time:Date.now(), result:result});
//           reject("window retrieval error");
//         });
//       });
//   }
// }
