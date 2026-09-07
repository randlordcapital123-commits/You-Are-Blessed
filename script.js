import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_BUCKET } from './supabase-config.js';

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const STORE_TABLE = 'yb_merch_store';
const ROW_ID = 1;
const ADMIN_KEY = 'yb_merch_admin_session';
const LOCAL_CACHE = 'yb_merch_cloud_cache_v1';
const configured = !SUPABASE_URL.includes('PASTE_YOUR') && !SUPABASE_ANON_KEY.includes('PASTE_YOUR');
const supabase = configured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const svgProduct = (title, subtitle, type='MERCH') => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100"><rect width="100%" height="100%" fill="#191919"/><circle cx="450" cy="430" r="250" fill="#282828"/><text x="450" y="390" fill="#f3eee3" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="42">${type}</text><text x="450" y="470" fill="#c9aa5a" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="30">YOU ARE BLESSED</text><text x="450" y="540" fill="#fff" text-anchor="middle" font-family="Arial" font-size="24">${subtitle}</text><text x="450" y="970" fill="#c9aa5a" text-anchor="middle" font-family="Arial" font-size="22">${title}</text></svg>`)}`;

const defaults = {
  site:{brand_name:'YOU ARE BLESSED MERCH',phone:'+27 69 545 9282',email:'',address:'59 Da Vinci St, Witbank, eMalahleni, 1049, Mpumalanga, South Africa',about_text:'You Are Blessed Merch is a South African clothing brand built around faith, confidence and purpose. Our pieces turn powerful messages into everyday streetwear.',hero_image:'assets/img1.jpeg'},
  products:[
    {id:'p1',name:'Blessed Classic Tee',description:'Premium faith-inspired everyday streetwear.',price:'R350',image_url:svgProduct('Blessed Classic Tee','FAITH • STYLE • PURPOSE','PREMIUM TEE')},
    {id:'p2',name:'Faith Hoodie',description:'Warm, comfortable and made to carry the message.',price:'R650',image_url:svgProduct('Faith Hoodie','WALK BY FAITH','HOODIE')},
    {id:'p3',name:'Purpose Cap',description:'A clean finishing touch for your everyday look.',price:'R250',image_url:svgProduct('Purpose Cap','PURPOSE','CAP')}
  ],gallery:[]
};
let data = loadCache(); let editingImage = null;
function clone(v){return JSON.parse(JSON.stringify(v));}
function loadCache(){try{return {...clone(defaults),...JSON.parse(localStorage.getItem(LOCAL_CACHE)||'{}'),site:{...defaults.site,...(JSON.parse(localStorage.getItem(LOCAL_CACHE)||'{}').site||{})}}}catch{return clone(defaults)}}
function cache(){localStorage.setItem(LOCAL_CACHE,JSON.stringify(data));}
function uid(){return `${Date.now()}_${Math.random().toString(36).slice(2,9)}`}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function wa(msg){let n=(data.site.phone||'').replace(/\D/g,'');if(n.startsWith('0'))n='27'+n.slice(1);return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`}
function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),3500)}

async function loadRemote(){
 if(!supabase){toast('Cloud storage is not configured yet.');return;}
 const {data:row,error}=await supabase.from(STORE_TABLE).select('data').eq('id',ROW_ID).maybeSingle();
 if(error){console.error(error);toast('Could not load online data. Check Supabase setup.');return;}
 if(row?.data){data={...clone(defaults),...row.data,site:{...defaults.site,...(row.data.site||{})}};cache();}
 else await saveRemote(true);
 render();
}
async function saveRemote(silent=false){
 cache();
 if(!supabase){if(!silent)toast('Add your Supabase details to enable online sync.');return false;}
 const {error}=await supabase.from(STORE_TABLE).upsert({id:ROW_ID,data,updated_at:new Date().toISOString()});
 if(error){console.error(error);if(!silent)toast('Online save failed. Check your Supabase policies.');return false;}
 if(!silent)toast('Saved online — available on your other devices.');return true;
}
async function uploadImage(file,folder='products'){
 if(!file) return null;
 if(!file.type.startsWith('image/')) throw new Error('Please choose an image file.');
 if(!supabase) throw new Error('Configure your free online storage first.');
 if(file.size>8*1024*1024) throw new Error('Please use an image smaller than 8 MB.');
 const ext=(file.name.split('.').pop()||'jpg').toLowerCase();
 const path=`${folder}/${uid()}.${ext}`;
 const {error}=await supabase.storage.from(STORAGE_BUCKET).upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
 if(error) throw new Error(error.message);
 const {data:url}=supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
 return url.publicUrl;
}

function render(){
 const s=data.site;
 $('#brandName').textContent=(s.brand_name||'YOU ARE BLESSED MERCH').replace(/ MERCH$/i,'');
 $('#businessAddress').textContent=s.address||'';$('#businessPhone').textContent=s.phone||'';$('#businessEmail').textContent=s.email||'Add your email in Admin';
 $('#heroMedia').style.backgroundImage=`url("${s.hero_image||'assets/img1.jpeg'}")`;
 ['heroWhatsapp','aboutWhatsapp','contactWhatsapp'].forEach(id=>$('#'+id).href=wa('Hi You Are Blessed Merch! I would like to place an order.'));
 $('#heroCall').href=`tel:${(s.phone||'').replace(/\s/g,'')}`;$('#contactCall').href=`tel:${(s.phone||'').replace(/\s/g,'')}`;
 $('#servicesGrid').innerHTML=data.products.length?data.products.map(p=>`<article class="product-card"><div class="product-image"><img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy"></div><div class="product-info"><div class="product-meta"><h3>${esc(p.name)}</h3><span class="price">${esc(p.price)}</span></div><p>${esc(p.description)}</p><a class="product-whatsapp btn" target="_blank" rel="noopener" href="${wa(`Hi You Are Blessed Merch! I would like to place an order for ${p.name}. Please send me the ordering details.`)}">PLACE AN ORDER ↗</a></div></article>`).join(''):'<div class="loading-card">No products yet.</div>';
 $('#galleryGrid').innerHTML=data.gallery.length?data.gallery.map((g,i)=>`<figure class="gallery-item"><img src="${esc(g.image_url)}" alt="Gallery image ${i+1}" loading="lazy"></figure>`).join(''):'<div class="loading-card">Gallery images will appear here.</div>';
 $('#year').textContent=new Date().getFullYear();renderAdmin();
}
function renderAdmin(){
 if(!$('#adminServices'))return;
 $('#adminServices').innerHTML=data.products.map(p=>`<div class="admin-service"><img src="${esc(p.image_url)}" alt=""><div><strong>${esc(p.name)}</strong><small>${esc(p.price)}</small></div><div class="admin-service-actions"><button class="icon-btn" data-edit="${p.id}">✎</button><button class="icon-btn" data-del-product="${p.id}">×</button></div></div>`).join('')||'<p class="muted">No products yet.</p>';
 $('#adminGallery').innerHTML=data.gallery.map(g=>`<div class="admin-gallery-item"><img src="${esc(g.image_url)}" alt=""><span>Image</span><button class="icon-btn" data-del-gallery="${g.id}">×</button></div>`).join('');
 $('#heroPreview').innerHTML=`<img src="${esc(data.site.hero_image)}" alt="Hero preview">`;
 $('#siteBrand').value=data.site.brand_name||'';$('#sitePhone').value=data.site.phone||'';$('#siteEmail').value=data.site.email||'';$('#siteAddress').value=data.site.address||'';$('#siteAbout').value=data.site.about_text||'';
 $$('[data-edit]').forEach(b=>b.onclick=()=>openEditor(data.products.find(p=>p.id===b.dataset.edit)));
 $$('[data-del-product]').forEach(b=>b.onclick=async()=>{if(confirm('Delete this product?')){data.products=data.products.filter(p=>p.id!==b.dataset.delProduct);await saveRemote();render();}});
 $$('[data-del-gallery]').forEach(b=>b.onclick=async()=>{if(confirm('Remove this image?')){data.gallery=data.gallery.filter(g=>g.id!==b.dataset.delGallery);await saveRemote();render();}});
}
function openAdmin(){ $('#adminModal').classList.add('open');$('#adminModal').setAttribute('aria-hidden','false');sessionStorage.getItem(ADMIN_KEY)==='true'?showDashboard():showLogin();}
function closeAdmin(){$('#adminModal').classList.remove('open')}
function showLogin(){$('#loginView').classList.remove('hidden');$('#dashboardView').classList.add('hidden')}
function showDashboard(){$('#loginView').classList.add('hidden');$('#dashboardView').classList.remove('hidden');renderAdmin()}
function openEditor(p){$('#serviceEditor').classList.add('open');$('#serviceId').value=p?.id||'';$('#serviceName').value=p?.name||'';$('#serviceDescription').value=p?.description||'';$('#servicePrice').value=p?.price||'';$('#serviceImage').value='';editingImage=p?.image_url||null;$('#serviceImagePreview').innerHTML=editingImage?`<img src="${esc(editingImage)}" alt="">`:'';$('#editorTitle').innerHTML=p?'Edit <em>product</em>':'Add <em>product</em>'}
function closeEditor(){$('#serviceEditor').classList.remove('open')}

$('#openAdminBtn').onclick=openAdmin;$('#closeAdminBtn').onclick=closeAdmin;$('#adminBackdrop').onclick=closeAdmin;$('#closeEditorBtn').onclick=closeEditor;$('#editorBackdrop').onclick=closeEditor;
$('#navToggle').onclick=()=>$('#mainNav').classList.toggle('open');
$('#loginForm').onsubmit=e=>{e.preventDefault();const pass=$('#adminPassword').value;if(pass.length<4){$('#loginError').textContent='Enter a password with at least 4 characters.';return;}sessionStorage.setItem(ADMIN_KEY,'true');$('#loginError').textContent='';showDashboard();toast('Admin unlocked.');};
$('#logoutBtn').onclick=()=>{sessionStorage.removeItem(ADMIN_KEY);showLogin()};
$$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));$('.tab-panel.active')?.classList.remove('active');t.classList.add('active');$('#'+t.dataset.tab).classList.add('active')});
$('#siteForm').onsubmit=async e=>{e.preventDefault();data.site={...data.site,brand_name:$('#siteBrand').value.trim(),phone:$('#sitePhone').value.trim(),email:$('#siteEmail').value.trim(),address:$('#siteAddress').value.trim(),about_text:$('#siteAbout').value.trim()};await saveRemote();render()};
$('#addServiceBtn').onclick=()=>openEditor();
$('#serviceImage').onchange=e=>{const f=e.target.files[0];if(f)$('#serviceImagePreview').innerHTML=`<p class="muted">Image selected: ${esc(f.name)}. It will upload when you save.</p>`};
$('#serviceForm').onsubmit=async e=>{e.preventDefault();try{const f=$('#serviceImage').files[0];const img=f?await uploadImage(f,'products'):(editingImage||svgProduct('You Are Blessed','FAITH • STYLE • PURPOSE'));const p={id:$('#serviceId').value||uid(),name:$('#serviceName').value.trim(),description:$('#serviceDescription').value.trim(),price:$('#servicePrice').value.trim(),image_url:img};const i=data.products.findIndex(x=>x.id===p.id);if(i>=0)data.products[i]=p;else data.products.push(p);if(await saveRemote()){closeEditor();render();}}catch(err){$('#serviceError').textContent=err.message}};
$('#heroFile').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;data.site.hero_image=await uploadImage(f,'hero');if(await saveRemote())render()}catch(err){toast(err.message)}};
async function addGallery(files){try{for(const f of files){data.gallery.push({id:uid(),image_url:await uploadImage(f,'gallery')})}if(await saveRemote())render()}catch(err){toast(err.message)}}
$('#galleryFiles').onchange=e=>addGallery(e.target.files);$('#addGalleryBtn').onclick=()=>$('#galleryFiles').click();
function drop(box,input,handler){const b=$(box),i=$(input);['dragenter','dragover'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();b.classList.add('drag-over')}));['dragleave','drop'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();b.classList.remove('drag-over')}));b.addEventListener('drop',e=>handler(e.dataTransfer.files));b.addEventListener('click',()=>i.click())}
drop('#heroDrop','#heroFile',async files=>{try{if(files[0]){data.site.hero_image=await uploadImage(files[0],'hero');if(await saveRemote())render()}}catch(e){toast(e.message)}});drop('#galleryDrop','#galleryFiles',addGallery);

render();loadRemote();
