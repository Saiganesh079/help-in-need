import { getPosition, haversineKm } from './app.js';
const client = window.supabaseClient;

let map, markers = [];

async function init(){
  try{
    const you = await getPosition();
    map = L.map('map').setView([you.lat, you.lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(map);
    L.marker([you.lat, you.lng]).addTo(map).bindPopup('You are here');

    await loadReports(you);

    document.getElementById('filterCategory').addEventListener('change', ()=>loadReports(you));
    document.getElementById('filterRadius').addEventListener('change', ()=>loadReports(you));
  }catch(e){ console.error(e); }
}

async function loadReports(you){
  markers.forEach(m=>m.remove()); markers = [];
  const cat = document.getElementById('filterCategory').value;
  const radius = parseFloat(document.getElementById('filterRadius').value);

  const { data, error } = await client.from('reports').select('*').order('created_at', { ascending: false }).limit(200);
  if(error){ console.error(error); return; }

  const list = document.getElementById('list'); list.innerHTML = '';

  data
    .filter(r => cat === 'all' ? true : r.category === cat)
    .map(r => ({ ...r, distance: haversineKm(you, { lat: r.lat, lng: r.lng }) }))
    .filter(r => r.distance <= radius)
    .forEach(r => {
      const m = L.marker([r.lat, r.lng]).addTo(map).bindPopup(
        `<img src="${r.image_url}" style="max-width:150px;display:block"/><b>${r.category}</b><br/>${r.description ?? ''}<br/><small>${r.distance.toFixed(1)} km away</small>`
      );
      markers.push(m);
      const li = document.createElement('li');
      li.innerHTML = `<b>${r.category}</b> — ${r.description ?? ''} <small>(${r.distance.toFixed(1)} km)</small>`;
      list.appendChild(li);
    });
}

init();
