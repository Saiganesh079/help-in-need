import { toast, getPosition, dataURLtoBlob } from './app.js';
const client = window.supabaseClient;

const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const preview = document.getElementById('preview');
const snapBtn = document.getElementById('snap');

async function initCamera(){
  try{
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
    video.srcObject = stream;
  }catch(e){ toast('Camera unavailable: ' + e.message); }
}

function captureFrame(){
  const w = video.videoWidth, h = video.videoHeight;
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, w, h);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  preview.src = dataUrl; preview.classList.remove('hidden');
  return dataURLtoBlob(dataUrl);
}

snapBtn.addEventListener('click', ()=>{ captureFrame(); });

const form = document.getElementById('reportForm');
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  toast('Submitting...');
  try{
    const category = form.category.value;
    const description = form.description.value.trim();
    const pos = await getPosition();

    let blob;
    if(preview.src){ blob = dataURLtoBlob(preview.src); } else { blob = captureFrame(); }

    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
    const { data: up, error: upErr } = await client.storage.from('reports').upload(fileName, blob, { upsert: false, contentType: 'image/jpeg' });
    if(upErr) throw upErr;
    const { data: pub } = client.storage.from('reports').getPublicUrl(up.path);

    const { error: insErr } = await client.from('reports').insert({
      category, description, lat: pos.lat, lng: pos.lng, image_url: pub.publicUrl
    });
    if(insErr) throw insErr;

    toast('Report submitted. Thank you!');
    form.reset(); preview.classList.add('hidden');
  }catch(err){ toast('Error: ' + err.message); }
});

initCamera();
