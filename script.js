(() => {
  'use strict';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const KEY = 'yb_merch_offline_store_v1';
  const ADMIN_KEY = 'yb_merch_admin_session';

  const svgProduct = (title, subtitle) => `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1100" viewBox="0 0 900 1100"><rect width="900" height="1100" fill="#e9e5df"/><rect x="100" y="90" width="700" height="900" rx="24" fill="#191919"/><text x="450" y="480" text-anchor="middle" fill="#fff" font-family="Arial" font-size="52" font-weight="700">YOU ARE</text><text x="450" y="545" text-anchor="middle" fill="#fff" font-family="Arial" font-size="52" font-weight="700">BLESSED</text><text x="450" y="620" text-anchor="middle" fill="#c9b27c" font-family="Arial" font-size="22">${subtitle}</text><text x="450" y="1035" text-anchor="middle" fill="#555" font-family="Arial" font-size="20">${title}</text></svg>`)}`;

  const defaults = {
    site: { brand_name:'YOU ARE BLESSED MERCH', phone:'+27 69 545 9282', email:'', address:'59 Da Vinci St, Witbank, eMalahleni, 1049, Mpumalanga, South Africa', about_text:'You Are Blessed Merch is a South African clothing brand built around faith, confidence and purpose. Our pieces turn powerful messages into everyday streetwear.', hero_image:'assets/img1.jpeg' },
    products: [
      {id:'p1',name:'Blessed Classic Tee',description:'Premium faith-inspired everyday streetwear.',price:'R350',image_url:svgProduct('Blessed Classic Tee','FAITH • STYLE • PURPOSE')},
      {id:'p2',name:'Faith Hoodie',description:'Warm, comfortable and made to carry the message.',price:'R650',image_url:svgProduct('Faith Hoodie','WALK BY FAITH')},
      {id:'p3',name:'Purpose Cap',description:'A clean finishing touch for your everyday look.',price:'R250',image_url:svgProduct('Purpose Cap','PURPOSE')}
    ],
    gallery: []
  };

  let data = load();
  let editingImage = null;
  function load(){ try { return {...defaults, ...JSON.parse(localStorage.getItem(KEY)||'{}'), site:{...defaults.site,...(JSON.parse(localStorage.getItem(KEY)||'{}').site||{})}}; } catch(e){ return structuredClone(defaults); } }
  function save(){ localStorage.setItem(KEY, JSON.stringify(data)); }
  function uid(){ return `${Date.now()}_${Math.random().toString(36).slice(2,8)}`; }
  function esc(v){ return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }
  function wa(msg){ const n=(data.site.phone||'').replace(/\D/g,'').replace(/^0/,'27'); return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`; }
  function toast(msg){ const t=$('#toast'); t.textContent=msg; t.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>t.classList.remove('show'),3000); }

  function render(){
    const s=data.site;
    $('#brandName').textContent=(s.brand_name||'YOU ARE BLESSED MERCH').replace(/ MERCH$/i,'');
    $('#businessAddress').textContent=s.address||''; $('#businessPhone').textContent=s.phone||''; $('#businessEmail').textContent=s.email||'Add your email in Admin';
    $('#heroMedia').style.backgroundImage=`url("${s.hero_image||'assets/img1.jpeg'}")`;
    ['heroWhatsapp','aboutWhatsapp','contactWhatsapp'].forEach(id=>{ const a=$('#'+id); a.href=wa('Hi You Are Blessed Merch! I would like to enquire about your clothing.'); });
    $('#heroCall').href=`tel:${(s.phone||'').replace(/\s/g,'')}`; $('#contactCall').href=`tel:${(s.phone||'').replace(/\s/g,'')}`;
    $('#servicesGrid').innerHTML=data.products.length?data.products.map(p=>`<article class="product-card"><div class="product-image"><img src="${esc(p.image_url)}" alt="${esc(p.name)}" loading="lazy"></div><div class="product-info"><div class="product-meta"><h3>${esc(p.name)}</h3><span class="price">${esc(p.price)}</span></div><p>${esc(p.description)}</p><a class="product-whatsapp btn" target="_blank" rel="noopener" href="${wa(`Hi You Are Blessed Merch! I'm interested in ${p.name}. Please send ordering details.`)}">ENQUIRE ON WHATSAPP ↗</a></div></article>`).join(''):'<div class="loading-card">No products yet.</div>';
    $('#galleryGrid').innerHTML=data.gallery.length?data.gallery.map((g,i)=>`<figure class="gallery-item"><img src="${esc(g.image_url)}" alt="Gallery image ${i+1}" loading="lazy"></figure>`).join(''):'<div class="loading-card">Gallery images will appear here.</div>';
    $('#year').textContent=new Date().getFullYear(); renderAdmin();
  }

  function renderAdmin(){
    if(!$('#adminServices')) return;
    $('#adminServices').innerHTML=data.products.map(p=>`<div class="admin-service"><img src="${esc(p.image_url)}" alt=""><div><strong>${esc(p.name)}</strong><small>${esc(p.price)}</small></div><div class="admin-service-actions"><button class="icon-btn" data-edit="${p.id}">✎</button><button class="icon-btn" data-del-product="${p.id}">×</button></div></div>`).join('')||'<p class="muted">No products yet.</p>';
    $('#adminGallery').innerHTML=data.gallery.map(g=>`<div class="admin-gallery-item"><img src="${esc(g.image_url)}" alt=""><span>Image</span><button class="icon-btn" data-del-gallery="${g.id}">×</button></div>`).join('');
    $('#heroPreview').innerHTML=`<img src="${esc(data.site.hero_image)}" alt="Hero preview">`;
    $('#siteBrand').value=data.site.brand_name||''; $('#sitePhone').value=data.site.phone||''; $('#siteEmail').value=data.site.email||''; $('#siteAddress').value=data.site.address||''; $('#siteAbout').value=data.site.about_text||'';
    $$('[data-edit]').forEach(b=>b.onclick=()=>openEditor(data.products.find(p=>p.id===b.dataset.edit)));
    $$('[data-del-product]').forEach(b=>b.onclick=()=>{ if(confirm('Delete this product?')){data.products=data.products.filter(p=>p.id!==b.dataset.delProduct);save();render();toast('Product deleted.');} });
    $$('[data-del-gallery]').forEach(b=>b.onclick=()=>{ if(confirm('Remove this image?')){data.gallery=data.gallery.filter(g=>g.id!==b.dataset.delGallery);save();render();toast('Gallery image removed.');} });
  }

  function readImage(file){ return new Promise((resolve,reject)=>{ if(!file) return resolve(null); if(!file.type.startsWith('image/')) return reject(new Error('Please choose an image file.')); const r=new FileReader(); r.onload=()=>resolve(r.result); r.onerror=()=>reject(new Error('Could not read image.')); r.readAsDataURL(file); }); }
  function safeSave(){ try{save();return true;}catch(e){toast('Storage is full. Use smaller images or remove old gallery images.');return false;} }

  function openAdmin(){ $('#adminModal').classList.add('open'); $('#adminModal').setAttribute('aria-hidden','false'); if(sessionStorage.getItem(ADMIN_KEY)==='true') showDashboard(); else showLogin(); }
  function closeAdmin(){ $('#adminModal').classList.remove('open'); }
  function showLogin(){ $('#loginView').classList.remove('hidden'); $('#dashboardView').classList.add('hidden'); }
  function showDashboard(){ $('#loginView').classList.add('hidden'); $('#dashboardView').classList.remove('hidden'); renderAdmin(); }
  function openEditor(p){ $('#serviceEditor').classList.add('open'); $('#serviceId').value=p?.id||''; $('#serviceName').value=p?.name||''; $('#serviceDescription').value=p?.description||''; $('#servicePrice').value=p?.price||''; $('#serviceImage').value=''; editingImage=p?.image_url||null; $('#serviceImagePreview').innerHTML=editingImage?`<img src="${esc(editingImage)}" alt="">`:''; $('#editorTitle').innerHTML=p?'Edit <em>product</em>':'Add <em>product</em>'; }
  function closeEditor(){ $('#serviceEditor').classList.remove('open'); }

  $('#openAdminBtn').onclick=openAdmin; $('#closeAdminBtn').onclick=closeAdmin; $('#adminBackdrop').onclick=closeAdmin; $('#closeEditorBtn').onclick=closeEditor; $('#editorBackdrop').onclick=closeEditor;
  $('#navToggle').onclick=()=>$('#mainNav').classList.toggle('open');
  $('#loginForm').onsubmit=e=>{ e.preventDefault(); const pass=$('#adminPassword').value; if(pass.length<4){$('#loginError').textContent='Enter your local admin password.';return;} localStorage.setItem('yb_merch_local_admin_password',pass); sessionStorage.setItem(ADMIN_KEY,'true'); $('#loginError').textContent=''; showDashboard(); toast('Local admin unlocked.'); };
  $('#logoutBtn').onclick=()=>{sessionStorage.removeItem(ADMIN_KEY);showLogin();};
  $$('.tab').forEach(t=>t.onclick=()=>{$$('.tab').forEach(x=>x.classList.remove('active'));$('.tab-panel.active')?.classList.remove('active');t.classList.add('active');$('#'+t.dataset.tab).classList.add('active');});

  $('#siteForm').onsubmit=e=>{e.preventDefault(); data.site={...data.site,brand_name:$('#siteBrand').value.trim(),phone:$('#sitePhone').value.trim(),email:$('#siteEmail').value.trim(),address:$('#siteAddress').value.trim(),about_text:$('#siteAbout').value.trim()};if(safeSave()){render();toast('Saved on this device.');}};
  $('#addServiceBtn').onclick=()=>openEditor();
  $('#serviceForm').onsubmit=async e=>{e.preventDefault(); try{const f=$('#serviceImage').files[0]; const img=f?await readImage(f):(editingImage||svgProduct('You Are Blessed','FAITH • STYLE • PURPOSE')); const p={id:$('#serviceId').value||uid(),name:$('#serviceName').value.trim(),description:$('#serviceDescription').value.trim(),price:$('#servicePrice').value.trim(),image_url:img}; const i=data.products.findIndex(x=>x.id===p.id); if(i>=0)data.products[i]=p;else data.products.push(p);if(safeSave()){closeEditor();render();toast('Product saved locally.');}}catch(err){$('#serviceError').textContent=err.message;}};

  $('#heroFile').onchange=async e=>{try{const img=await readImage(e.target.files[0]);if(img){data.site.hero_image=img;if(safeSave()){render();toast('Hero image saved locally.');}}}catch(err){toast(err.message)}};
  $('#galleryFiles').onchange=async e=>{for(const f of e.target.files){try{const img=await readImage(f);data.gallery.push({id:uid(),image_url:img});}catch(err){toast(err.message)}}if(safeSave()){render();toast('Gallery saved locally.');}};
  $('#addGalleryBtn').onclick=()=>$('#galleryFiles').click();

  function drop(box,input,handler){const b=$(box),i=$(input);['dragenter','dragover'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();b.classList.add('drag-over')}));['dragleave','drop'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();b.classList.remove('drag-over')}));b.addEventListener('drop',e=>handler(e.dataTransfer.files));b.addEventListener('click',()=>i.click());}
  drop('#heroDrop','#heroFile',async files=>{if(!files[0])return;try{data.site.hero_image=await readImage(files[0]);if(safeSave()){render();toast('Hero image saved locally.');}}catch(e){toast(e.message)}});
  drop('#galleryDrop','#galleryFiles',async files=>{for(const f of files){try{data.gallery.push({id:uid(),image_url:await readImage(f)})}catch(e){toast(e.message)}}if(safeSave()){render();toast('Gallery saved locally.');}});

  render();
})();
