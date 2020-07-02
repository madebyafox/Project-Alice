import Dexie from 'dexie';
import {exportDB} from "dexie-export-import";
import streamSaver from '../database/streamsaver'; //for generating files


const DB = new Dexie('hatter');

//CREATE 3 collections
DB.version(1).stores({
  navigation: 'id, handler, event',
  structure:'id,handler, event',
  recording:'id,handler, event'
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
  DB.recording.clear();
  alert("Your logging data has been erased");
}

//LOG to the database
async function log(type, handler, sevent, data) {
    // console.log("DB | trying to logToDB | "+type);
    switch(type){
      case "navigation":
        var logged = await DB.navigation.put({
          id: data.time,
          handler: handler,
          event: sevent,
          data: data.result
        });
        // console.log("LOGGED :" + logged);
        break;
      case "structure":
      var logged = await DB.structure.put({
        id: data.time,
        handler: handler,
        event: sevent,
        data: data.result
      });
        break;
      case "recording":
        var logged = await DB.recording.put({
          id: data.time,
          handler: handler,
          event: sevent,
          data: data.result
        });
      // console.log("LOGGED :" + logged);
        break;
    }
  }

export {DB, dumpDB, eraseDB, log};
//TODO: figure out correct export format
