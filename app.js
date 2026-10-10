(() => {
  const $ = id => document.getElementById(id);
  const cfg = window.LH_CONFIG || {};
  const ready = cfg.SUPABASE_URL && cfg.SUPABASE_ANON_KEY &&
    !cfg.SUPABASE_URL.includes("PASTE_") && !cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  const db = ready && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const toast = msg => { const el=$("status"); el.textContent=msg; el.classList.add("show"); setTimeout(()=>el.classList.remove("show"),4500); };
  const safeUrl = (url) => { try { const u = new URL(url); return ["http:","https:"].includes(u.protocol) ? u.href : "#"; } catch { return "#"; } };
  const waUrl = (number, msg) => { const n=(number||"").replace(/\D/g,""); return n ? `https://wa.me/${n}?text=${encodeURIComponent(msg)}` : "#"; };
  const setText = (id,val) => { $(id).textContent=val || ""; };
  const linkBtn = (label,href) => { const a=document.createElement("a"); a.className="btn";a.textContent=label;a.href=href||"#";if(a.href.startsWith("http")){a.target="_blank";a.rel="noopener";}return a; };
  function setBrandImage(url, name) {
    // Update browser tab icon and share metadata where clients execute page JavaScript.
    let icon = document.querySelector('link[rel="icon"]');
    if (!icon) { icon = document.createElement('link'); icon.rel = 'icon'; document.head.appendChild(icon); }
    if (url) icon.href = url;
    const tags = [
      ['property','og:title', name || 'Lamination Hub'],
      ['property','og:description','Customised Gifts & Mobile Skins — Tera Style, Teri Choice'],
      ['property','og:image',url || ''],
      ['name','twitter:card','summary_large_image'],
      ['name','twitter:title',name || 'Lamination Hub'],
      ['name','twitter:description','Customised Gifts & Mobile Skins'],
      ['name','twitter:image',url || '']
    ];
    tags.forEach(([attr,key,value]) => {
      let meta = document.querySelector(`meta[${attr}="${key}"]`);
      if (!meta) { meta = document.createElement('meta'); meta.setAttribute(attr,key); document.head.appendChild(meta); }
      meta.content = value;
    });
  }
  function render(profile, services) {
    setText("name",profile.name); setText("tagline",profile.tagline);
    document.title = (profile.name || 'Lamination Hub') + ' | Digital Business Card';
    setBrandImage(profile.logo_url || '', profile.name);
    const logo=$("logo");logo.innerHTML="";
    if(profile.logo_url){const img=document.createElement("img");img.src=profile.logo_url;img.alt=(profile.name||"Lamination Hub")+" logo";img.onload=()=>{logo.setAttribute('aria-label',(profile.name||'Lamination Hub')+' logo');};img.onerror=()=>{logo.textContent=profile.logo_text||"LH";toast("Logo could not load. Use a public direct image URL or upload it in Admin.");};logo.append(img);}else logo.textContent=profile.logo_text||"LH";
    setText("location",profile.address); setText("about",profile.about); setText("footerName",profile.name);
    const nav=$("quickLinks");nav.innerHTML="";
    const whatsapp=waUrl(profile.whatsapp,"Hello "+(profile.name||"Lamination Hub")+", I scanned your QR code and want to know about your products and services.");
    if(profile.whatsapp) nav.append(linkBtn("💬 WhatsApp",whatsapp));
    if(profile.instagram) nav.append(linkBtn("📸 Instagram",safeUrl(profile.instagram)));
    if(profile.phone){const a=linkBtn("📞 Call Now","tel:"+profile.phone.replace(/[^\d+]/g,""));nav.append(a);}
    if(profile.website) nav.append(linkBtn("🌐 Website",safeUrl(profile.website)));
    if(profile.maps_url) nav.append(linkBtn("📍 Get Directions",safeUrl(profile.maps_url)));
    const save=document.createElement("button");save.className="btn";save.textContent="👤 Save Contact";save.onclick=()=>downloadVcard(profile);nav.append(save);
    const social=[["📘 Facebook",profile.facebook],["▶️ YouTube",profile.youtube]].filter(x=>x[1]);
    social.forEach(([label,url])=>nav.append(linkBtn("↗ "+label,safeUrl(url))));
    const grid=$("services");grid.innerHTML="";
    if(!services.length) grid.innerHTML='<p class="muted">Services will appear here soon.</p>';
    services.forEach(s=>{
      const card=document.createElement("article");card.className="service";
      const emoji=document.createElement("div");emoji.className="emoji";emoji.textContent=s.emoji||"✨";
      const h=document.createElement("h3");h.textContent=s.title||"Service";
      const p=document.createElement("p");p.textContent=s.description||"";
      card.append(emoji,h,p);
      if(s.price){const price=document.createElement("div");price.className="price";price.textContent=s.price;card.append(price);}
      const a=document.createElement("a");a.className="enquire";a.textContent="Enquire on WhatsApp →";a.href=waUrl(profile.whatsapp,`Hello ${profile.name||"Lamination Hub"}, I want to enquire about ${s.title}.`);if(a.href.startsWith("http")){a.target="_blank";a.rel="noopener";}card.append(a);grid.append(card);
    });
    const contact=$("contact");contact.innerHTML="";
    [["Phone",profile.phone],["WhatsApp",profile.whatsapp],["Address",profile.address],["Opening hours",profile.hours]].filter(x=>x[1]).forEach(([label,value])=>{
      const row=document.createElement("div");row.className="contact-row";const l=document.createElement("span");l.className="contact-label";l.textContent=label;const v=document.createElement("strong");v.textContent=value;row.append(l,v);contact.append(row);
    });
    const qr=$("qr");qr.className="qr-box";qr.innerHTML="";
    if(window.QRCode){new QRCode(qr,{text:location.href.split("#")[0],width:130,height:130,colorDark:"#111111",colorLight:"#ffffff",correctLevel:QRCode.CorrectLevel.H});}
    else qr.textContent="QR library unavailable";
  }
  function downloadVcard(p){
    const rows=["BEGIN:VCARD","VERSION:3.0","FN:"+ (p.name||"Lamination Hub"),"ORG:"+(p.name||"Lamination Hub")];
    if(p.phone)rows.push("TEL;TYPE=CELL:"+p.phone);
    if(p.address)rows.push("ADR;TYPE=WORK:;;"+p.address.replace(/,/g,"\\,")+";;;;");
    if(p.website)rows.push("URL:"+p.website);
    rows.push("END:VCARD");
    const url=URL.createObjectURL(new Blob([rows.join("\r\n")],{type:"text/vcard;charset=utf-8"}));
    const a=document.createElement("a");a.href=url;a.download="Lamination-Hub.vcf";a.click();URL.revokeObjectURL(url);
  }
  $("downloadQr").addEventListener("click",()=>{
    const qr=$("qr"),canvas=qr.querySelector("canvas"),img=qr.querySelector("img");
    if(canvas){const a=document.createElement("a");a.download="lamination-hub-qr.png";a.href=canvas.toDataURL("image/png");a.click();}
    else if(img){const a=document.createElement("a");a.download="lamination-hub-qr.png";a.href=img.src;a.click();}
    else toast("QR code is not ready. Check your internet connection.");
  });
  // Hidden admin access: tap/click the logo five times within a short sequence.
  let logoTaps=0,logoTapTimer;
  $("logo").addEventListener("click",()=>{logoTaps++;clearTimeout(logoTapTimer);if(logoTaps>=5){$("hiddenAdminLink").classList.add("revealed");toast("Admin link unlocked.");logoTaps=0;}else logoTapTimer=setTimeout(()=>logoTaps=0,1800);});
  document.addEventListener("keydown",e=>{if(e.altKey&&e.shiftKey&&e.key.toLowerCase()==="a"){$("hiddenAdminLink").classList.add("revealed");}});
  $("year").textContent=new Date().getFullYear();
  const defaults={id:"main",name:"LAMINATION HUB",logo_text:"LH",logo_url:"",tagline:"Tera Style, Teri Choice — Lamination Hub Always Right",about:"Your destination for personalised gifts, stylish mobile skins and quality printing services.",phone:"",whatsapp:"",instagram:"",facebook:"",youtube:"",website:"",address:"Kurebhar, Sultanpur, Uttar Pradesh, India",maps_url:"https://www.google.com/maps/search/?api=1&query=Kurebhar%2C%20Sultanpur%2C%20Uttar%20Pradesh",hours:"Please contact us for opening hours"};
  const demoServices=[
    {id:"d1",title:"Photo Frames",emoji:"🖼️",description:"Custom photo frames in multiple sizes and styles.",price:""},
    {id:"d2",title:"Customised Mugs",emoji:"☕",description:"Photo mugs, magic mugs and personalised gifts.",price:""},
    {id:"d3",title:"Mobile & Laptop Skins",emoji:"📱",description:"Stylish skins with custom designs.",price:""},
    {id:"d4",title:"Personalised Gifts",emoji:"🎁",description:"T-shirts, keychains, pillows and bottles.",price:""},
    {id:"d5",title:"PVC & ID Cards",emoji:"🪪",description:"PVC printing, ID cards and lamination.",price:""},
    {id:"d6",title:"Printing Services",emoji:"🖨️",description:"Document cropping and printing assistance.",price:""}
  ];
  async function load(){
    if(!db){render(defaults,demoServices);toast("Demo mode: add your Supabase URL and anon key in config.js to enable live online updates.");return;}
    try{
      const [p,s]=await Promise.all([
        db.from("business_profile").select("*").eq("id","main").maybeSingle(),
        db.from("services").select("*").eq("is_active",true).order("sort_order",{ascending:true})
      ]);
      if(p.error)throw p.error;if(s.error)throw s.error;
      render({...defaults,...(p.data||{})},s.data||[]);
    }catch(e){console.error(e);render(defaults,demoServices);toast("Could not load live content. Check Supabase setup and database policies.");}
  }
  load();
})();