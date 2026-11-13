const prefix='comfort-nomad-v2:';
export const storage={
  read<T>(key:string,fallback:T):T{try{const raw=window.localStorage.getItem(prefix+key);return raw?JSON.parse(raw) as T:fallback;}catch{return fallback;}},
  write<T>(key:string,value:T):void{try{window.localStorage.setItem(prefix+key,JSON.stringify(value));}catch{/* Browser storage can be disabled; session still works in memory. */}},
  remove(key:string):void{try{window.localStorage.removeItem(prefix+key);}catch{/* Ignore unavailable storage. */}},
};

export const wait=(milliseconds=480)=>new Promise<void>(resolve=>setTimeout(resolve,milliseconds));
