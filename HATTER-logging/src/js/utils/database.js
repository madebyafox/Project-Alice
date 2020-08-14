import Dexie from 'dexie';
import {exportDB} from "dexie-export-import";
import streamSaver from '../utils/streamsaver'; //for generating files


const DB = new Dexie('hatter');

//CREATE 3 collections
DB.version(1).stores({
  navigation: 'id, handler, event',
  structure:'id,handler, event',
  meta:'id,handler, event'
});

//EXPORT database to a file
async function dumpDB(){
  const dump = await exportDB(DB);
  // console.log(blob);
  let file = JSON.stringify(dump);
  const FILESTREAM = streamSaver.createWriteStream('hatter_'+Date.now()+'.json', {});
  new Response(dump).body
      .pipeTo(FILESTREAM)
      // .then(success, error)
      // .then(alert("wrote file"));
}

//ERASE all data in database
async function eraseDB(){
  DB.navigation.clear();
  DB.structure.clear();
  DB.meta.clear();
  alert("Your logging data has been erased");
}

//LOG to the database
async function log(time, type, handler, sevent, data) {
    // console.log("DB | trying to logToDB | "+type);
    switch(type){
      case "navigation":
        var logged = await DB.navigation.put({
          id: time,
          handler: handler,
          event: sevent,
          data: data.result
        });
        // console.log("LOGGED NAV:" + logged);
        break;
      case "structure":
      var logged = await DB.structure.put({
        id: time,
        handler: handler,
        event: sevent,
        data: data
      });
        // console.log("LOGGED STRUCTURE:" + logged);
        break;
      case "meta":
        var logged = await DB.meta.put({
          id: time,
          handler: handler,
          event: sevent,
          data: data
        });
        // console.log("LOGGED META:" + logged);
        break;
    }
  }

//RETRIEVE all annotations
async function getAnnotations(){

  const annotations = await DB.meta
    .where('event')
    .anyOf(["annotation","goal"])
    .toArray();

  //sort in descending order of timestamp (id)
  annotations.sort(function(a, b){return b.id - a.id}); 
  console.log("DB | "+ annotations);
  return annotations;

}


export {dumpDB, eraseDB, log, getAnnotations};
//TODO: figure out correct export format
