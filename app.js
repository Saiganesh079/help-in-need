const { url, anonKey } = window.__SUPABASE__;
window.supabaseClient = supabase.createClient(url, anonKey);

export function toast(msg){
  const el = document.getElementById('status');
  if(el){ el.textContent = msg; }
}

export function haversineKm(a, b){
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI/180;
  const dLon = (b.lng - a.lng) * Math.PI/180;
  const la1 = a.lat * Math.PI/180;
  const la2 = b.lat * Math.PI/180;
  const h = Math.sin(dLat/2)**2 + Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

export async function getPosition(){
  return new Promise((resolve, reject)=>{
    if(!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition(
      pos=>resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err=>reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

export function dataURLtoBlob(dataUrl){
  const [meta, b64] = dataUrl.split(',');
  const mime = /:(.*?);/.exec(meta)[1];
  const bin = atob(b64); const len = bin.length; const u8 = new Uint8Array(len);
  for(let i=0;i<len;i++) u8[i]=bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}
