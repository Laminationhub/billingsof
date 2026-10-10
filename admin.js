(() => {
  const $=id=>document.getElementById(id), cfg=window.LH_CONFIG||{};
  const ready=cfg.SUPABASE_URL&&cfg.SUPABASE_ANON_KEY&&!cfg.SUPABASE_URL.includes("PASTE_")&&!cfg.SUPABASE_ANON_KEY.includes("PASTE_");
  const db=ready&&window.supabase?window.supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY):null;
  const toast=msg=>{const el=$("status");el.textContent=msg;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),5000);};
  const fields={name:"f_name",logo_text:"f_logo",tagline:"f_tagline",about:"f_about",phone:"f_phone",whatsapp:"f_whatsapp",instagram:"f_instagram",facebook:"f_facebook",youtube:"f_youtube",website:"f_website",address:"f_address",maps_url:"f_maps",hours:"f_hours"};
  let currentServices=[], currentLogoUrl="";
  function formProfile(p){Object.entries(fields).forEach(([k,id])=>$(id).value=p[k]||"");currentLogoUrl=p.logo_url||"";$("logoDriveUrl").value=currentLogoUrl;const preview=$("logoPreview");if(currentLogoUrl){preview.src=currentLogoUrl;preview.hidden=false;}else{preview.removeAttribute("src");preview.hidden=true;}$("logoUploadStatus").textContent=currentLogoUrl?"Current logo is published. Choose another file to replace it.":"Choose a file, then save the profile to publish it.";$("logoFile").value="";}
  function readProfile(){const p={id:"main",logo_url:currentLogoUrl};Object.entries(fields).forEach(([k,id])=>p[k]=$(id).value.trim());return p;}
  async function requireSession(){
    if(!db){$("loginPanel").hidden=false;$("dashboard").hidden=true;toast("Add your Supabase URL and anon key in config.js first.");return;}
    const {data:{session}}=await db.auth.getSession();
    if(!session){$("loginPanel").hidden=false;$("dashboard").hidden=true;return;}
    const {data:admin,error}=await db.from("admin_users").select("user_id").eq("user_id",session.user.id).maybeSingle();
    if(error||!admin){await db.auth.signOut();$("loginPanel").hidden=false;$("dashboard").hidden=true;toast("This account is not authorised as an admin. Add its user ID to admin_users in Supabase.");return;}
    $("loginPanel").hidden=true;$("dashboard").hidden=false;await loadData();
  }
  async function loadData(){
    const [p,s]=await Promise.all([db.from("business_profile").select("*").eq("id","main").maybeSingle(),db.from("services").select("*").order("sort_order",{ascending:true})]);
    if(p.error||s.error){toast("Could not load data. Check schema.sql and Row Level Security policies.");return;}
    formProfile(p.data||{name:"LAMINATION HUB",logo_text:"LH",tagline:"Tera Style, Teri Choice — Lamination Hub Always Right",address:"Kurebhar, Sultanpur, Uttar Pradesh, India"});
    currentServices=s.data||[];renderServices();
  }
  $("loginForm").addEventListener("submit",async e=>{e.preventDefault();if(!db){toast("Configure Supabase in config.js first.");return;}const {error}=await db.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){toast("Login failed: "+error.message);return;}await requireSession();});
  $("logout").addEventListener("click",async()=>{await db.auth.signOut();await requireSession();});
  $("logoFile").addEventListener("change",()=>{const file=$("logoFile").files[0];if(!file)return;if(file.size>3*1024*1024){$("logoFile").value="";toast("Logo must be 3 MB or smaller.");return;}const preview=$("logoPreview");preview.src=URL.createObjectURL(file);preview.hidden=false;$("logoUploadStatus").textContent="Ready to upload: "+file.name;});
  function normalizeDriveLogoUrl(raw){
    const value=(raw||"").trim(); if(!value)return "";
    // Drive share URLs are not direct image URLs; use the public thumbnail endpoint.
    const m=value.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?[^#]*?id=)([a-zA-Z0-9_-]+)/) || value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if(m)return "https://drive.google.com/thumbnail?id="+m[1]+"&sz=w1200";
    return value;
  }
  $("logoDriveUrl").addEventListener("change",()=>{const url=normalizeDriveLogoUrl($("logoDriveUrl").value);if(url){const preview=$("logoPreview");preview.onload=()=>{$("logoUploadStatus").textContent="Logo preview loaded. Save profile to publish it.";};preview.onerror=()=>{$("logoUploadStatus").textContent="Drive image unavailable. Set Anyone with the link → Viewer, or upload the file directly below.";};preview.src=url;preview.hidden=false;$("logoUploadStatus").textContent="Checking logo link…";}});
  $("profileForm").addEventListener("submit",async e=>{e.preventDefault();const file=$("logoFile").files[0];let profile=readProfile();const driveUrl=normalizeDriveLogoUrl($("logoDriveUrl").value);
    if(file){const ext=(file.name.split(".").pop()||"png").toLowerCase().replace(/[^a-z0-9]/g,"")||"png";const path="main/logo-"+Date.now()+"."+ext;const upload=await db.storage.from("business-logos").upload(path,file,{upsert:true,contentType:file.type||"image/png",cacheControl:"3600"});if(upload.error){toast("Logo upload failed: "+upload.error.message+". Check Storage setup in README.");return;}profile.logo_url=db.storage.from("business-logos").getPublicUrl(path).data.publicUrl;} else if(driveUrl){profile.logo_url=driveUrl;}
    const {error}=await db.from("business_profile").upsert(profile);if(error){toast("Save failed: "+error.message+". Run the logo setup SQL in README if logo_url is missing.");return;}currentLogoUrl=profile.logo_url||"";formProfile(profile);toast("Profile and logo saved online. Refresh the public page to see changes.");});
  function renderServices(){
    const root=$("serviceEditor");root.innerHTML="";
    if(!currentServices.length){const p=document.createElement("p");p.className="muted";p.textContent="No services yet. Select Add service to create one.";root.append(p);}
    currentServices.forEach(s=>{
      const card=document.createElement("div");card.className="editor-card";
      const row=document.createElement("div");row.className="row";
      const title=field("Service name",s.title),emoji=field("Emoji",s.emoji||"✨"),price=field("Price (optional)",s.price||""),order=field("Sort order",s.sort_order??0,"number");
      const desc=field("Description",s.description||"","textarea");
      row.append(title.wrap,emoji.wrap);
      const row2=document.createElement("div");row2.className="row";row2.append(price.wrap,order.wrap);
      const actions=document.createElement("div");actions.className="actions";
      const save=document.createElement("button");save.className="btn orange";save.textContent="Save service";
      save.onclick=async()=>{const payload={title:title.input.value.trim(),emoji:emoji.input.value.trim()||"✨",price:price.input.value.trim(),sort_order:Number(order.input.value)||0,description:desc.input.value.trim(),is_active:true};if(!payload.title){toast("Service name is required.");return;}let result=s.id?await db.from("services").update(payload).eq("id",s.id).select().single():await db.from("services").insert(payload).select().single();if(result.error){toast("Service save failed: "+result.error.message);return;}toast("Service saved.");await loadData();};
      const del=document.createElement("button");del.className="btn";del.textContent="Delete";del.onclick=async()=>{if(!confirm("Delete this service?"))return;const {error}=await db.from("services").delete().eq("id",s.id);if(error){toast("Delete failed: "+error.message);return;}toast("Service deleted.");await loadData();};
      actions.append(save);if(s.id)actions.append(del);
      card.append(row,desc.wrap,row2,actions);root.append(card);
    });
  }
  function field(labelText,value,type="text"){
    const wrap=document.createElement("label");wrap.textContent=labelText;
    const input=type==="textarea"?document.createElement("textarea"):document.createElement("input");
    if(type==="number")input.type="number";else if(type!=="textarea")input.type=type;
    input.value=value??"";wrap.append(input);return {wrap,input};
  }
  $("addService").addEventListener("click",()=>{currentServices.push({title:"New service",emoji:"✨",description:"",price:"",sort_order:currentServices.length});renderServices();});
  if(db)db.auth.onAuthStateChange(()=>{setTimeout(requireSession,0);});
  requireSession();
})();