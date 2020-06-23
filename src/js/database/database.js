import Dexie from 'dexie';

//DEXIE IMPLEMENTATION

const DB = new Dexie('hatter');
DB.version(1).stores({
  navigation: 'id, handler, event',
  structure:'id,handler, event'
});

export default DB;
