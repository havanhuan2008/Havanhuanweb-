export const STORE_KEY = "shopacc_state_v3";

export function loadState(){
  try{
    return JSON.parse(localStorage.getItem(STORE_KEY) || "null");
  }catch{ return null; }
}
export function saveState(state){
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}
export function initStateIfNeeded(seed){
  let s = loadState();
  if(!s){
    s = seed();
    saveState(s);
  }
  return s;
}
export function setState(updater){
  const s = loadState();
  const next = updater(structuredClone ? structuredClone(s) : JSON.parse(JSON.stringify(s)));
  saveState(next);
  return next;
}
export function getState(){
  return loadState();
}