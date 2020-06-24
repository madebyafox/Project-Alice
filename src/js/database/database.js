import Dexie from 'dexie';
import {exportDB} from "dexie-export-import";
import streamSaver from '../database/streamsaver'; //for generating files


const DB = new Dexie('hatter');

DB.version(1).stores({
  navigation: 'id, handler, event',
  structure:'id,handler, event'
});

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

async function eraseDB(){
  DB.navigation.clear();
  DB.structure.clear();
  alert("Your logging data has been erased");
}

export {DB, dumpDB, eraseDB};
//TODO: figure out correct export format
