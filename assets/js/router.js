export function parseHash(){
  const hash = location.hash || "#/home";
  const raw = hash.slice(1);
  const [path, qs] = raw.split("?");
  const parts = path.replace(/^\//,"").split("/").filter(Boolean);
  const query = {};
  if(qs){
    qs.split("&").forEach(p=>{
      const [k,v] = p.split("=");
      query[decodeURIComponent(k)] = decodeURIComponent(v||"");
    });
  }
  return { parts, query };
}

export function go(hash){
  location.hash = hash;
}