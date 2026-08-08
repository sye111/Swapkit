import { useState, useRef, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const C = {
  olive:"#2D3A1F",oliveMid:"#3E5029",oliveFaint:"#EFF2EA",oliveBorder:"#C5D0B8",
  gold:"#F0B429",goldDark:"#8A6A00",goldFaint:"#FEF8DC",goldBorder:"#E8C94A",
  white:"#FFFFFF",surface:"#F5F6F1",ink:"#1A2010",inkMid:"#445238",inkLight:"#7A8C6A",
  border:"#DDE3D4",adBg:"#FFFBEA",adBorder:"#E8C94A",adInk:"#7A5C00",
  red:"#DC2626",redFaint:"#FEF2F2",green:"#16A34A",greenFaint:"#F0FDF4",greenBorder:"#86EFAC",
};
const F = { b:"system-ui,-apple-system,'Segoe UI',sans-serif", s:"Georgia,'Times New Roman',serif" };
const CAMPS=["Abia — Umunna Camp","Adamawa — Kolere Camp","Akwa Ibom — Ikot Itie Udung","Anambra — Mbaukwu Camp","Bauchi — Wailo Camp","Bayelsa — Kaiama Camp","Benue — Wannune Camp","Borno — Maiduguri Camp","Cross River — Wadata Camp","Delta — Issele-Uku Camp","Ebonyi — Afikpo Camp","Edo — Benin City Camp","Ekiti — Ise-Ekiti Camp","Enugu — Awgu Camp","FCT — Kubwa Camp","Gombe — Gombe Camp","Imo — Nekede Camp","Jigawa — Dutse Camp","Kaduna — Mando Camp","Kano — Kano Camp","Katsina — Katsina Camp","Kebbi — Kalgo Camp","Kogi — Ayangba Camp","Kwara — Yikpata Camp","Lagos — Iyana-Ipaja Camp","Nasarawa — Keffi Camp","Niger — Bida Camp","Ogun — Sagamu Camp","Ondo — Ikare Camp","Osun — Ede Camp","Oyo — Iseyin Camp","Plateau — Mangu Camp","Rivers — Nonwa Camp","Sokoto — Sokoto Camp","Taraba — Jalingo Camp","Yobe — Damaturu Camp","Zamfara — Gusau Camp"];
const PLATOONS=Array.from({length:12},(_,i)=>`Platoon ${i+1}`);
const ITEMS=[
  {label:"Jungle boots",emoji:"👟",sizes:"boots"},
  {label:"Crested vest",emoji:"🦺",sizes:"cloth"},
  {label:"Khaki jacket",emoji:"🧥",sizes:"cloth"},
  {label:"Khaki trousers",emoji:"👖",sizes:"cloth"},
  {label:"White vest",emoji:"👕",sizes:"cloth"},
  {label:"Head-dress",emoji:"🪖",sizes:"cloth"},
];
const BOOT_SIZES=["36","37","38","39","40","41","42","43","44","45","46"];
const CLOTH_SIZES=["XS","S","M","L","XL","XXL"];
const getSizes=i=>ITEMS.find(x=>x.label===i)?.sizes==="boots"?BOOT_SIZES:CLOTH_SIZES;
const getEmoji=i=>ITEMS.find(x=>x.label===i)?.emoji||"📦";
const newItem=()=>({item:"",has:"",wants:""});
const AVC=[[C.oliveFaint,C.olive],[C.goldFaint,C.goldDark],["#E8F0FE","#1A3E7A"],["#FAE8F0","#7A1A42"]];
const SEL=v=>({width:"100%",padding:"12px 34px 12px 13px",border:`0.5px solid ${C.border}`,borderRadius:12,fontSize:14,color:v?C.ink:C.inkLight,background:C.white,outline:"none",fontFamily:F.b,boxSizing:"border-box",appearance:"none",backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 6 5-6' stroke='%237A8C6A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,backgroundRepeat:"no-repeat",backgroundPosition:"right 12px center"});
const INP={width:"100%",padding:"12px 14px",border:`0.5px solid ${C.border}`,borderRadius:12,fontSize:14,color:C.ink,background:C.white,outline:"none",fontFamily:F.b,boxSizing:"border-box"};
const LBL={fontSize:11,fontWeight:700,color:C.inkMid,letterSpacing:"0.07em",textTransform:"uppercase",display:"block",marginBottom:6,fontFamily:F.b};
const WRAP={maxWidth:420,margin:"0 auto",minHeight:"100vh",background:C.surface,fontFamily:F.b,display:"flex",flexDirection:"column"};

function timeAgo(ts){
  if(!ts)return"just now";
  const d=Math.floor((Date.now()-new Date(ts))/1000);
  if(d<60)return`${d}s ago`;if(d<3600)return`${Math.floor(d/60)}m ago`;
  if(d<86400)return`${Math.floor(d/3600)}h ago`;return`${Math.floor(d/86400)}d ago`;
}

// ── WHATSAPP SHARE HELPERS ────────────────────────────────────────────────────
const APP_URL = "https://swapkit.app"; // update to your deployed URL

// Message a poster to request their swap — sent from requester to poster
function waRequestMessage({ requesterName, posterName, items, platoon }) {
  const itemLines = items.map(i => `• ${i.item}: has size ${i.has}, wants size ${i.wants}`).join("\n");
  return `Hi ${posterName.split(" ")[0]}! 👋 I'm ${requesterName} and I saw your SwapKit listing.\n\n${itemLines}\n\nI think we can swap! I'm in ${platoon}. Let's meet up in camp 🤝`;
}

// Message to broadcast your own listing to your platoon group
function waBroadcastMessage({ name, items, platoon, camp }) {
  const campShort = camp.split("—")[1]?.trim() || camp;
  const itemLines = items.map(i => `• ${i.item}: have size *${i.has}*, need size *${i.wants}*`).join("\n");
  return `🔄 *Khaki swap needed!*\n\nHi ${platoon}! I'm ${name} and I need a swap:\n\n${itemLines}\n\nIf you have what I need (or know someone), let's swap! 👕\n\n📱 Post your own swap → ${APP_URL}\n📍 ${campShort}`;
}

function waLink(phone, message) {
  // Strip leading 0, add Nigeria country code
  const intlPhone = phone?.startsWith("0") ? `234${phone.slice(1)}` : phone;
  return `https://wa.me/${intlPhone}?text=${encodeURIComponent(message)}`;
}

function waGroupLink(message) {
  // Opens WhatsApp with message pre-filled but no recipient — user picks their platoon group
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}

// Show an in-app toast notification
function showInAppToast(msg, setter) {
  setter(msg);
  setTimeout(() => setter(null), 4500);
}

// ── ATOMS ─────────────────────────────────────────────────────────────────────
function Avatar({name,size=36}){
  const ini=(name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const[bg,fg]=AVC[(name||"A").charCodeAt(0)%AVC.length];
  return <div style={{width:size,height:size,borderRadius:"50%",background:bg,border:`1.5px solid ${fg}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.36,fontWeight:700,color:fg,flexShrink:0,fontFamily:F.b}}>{ini}</div>;
}

// ── LOGO — inline SVG so it always renders in PWA (no external img dependency) ─
function Logo({size=32}){
  return(
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="32" height="32" rx="8" fill={C.olive}/>
      <path d="M7 21L11 15L15.5 18L20.5 11L25 15.5" stroke={C.gold} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="25" cy="10.5" r="2.8" fill={C.gold}/>
      <line x1="9" y1="25" x2="23" y2="25" stroke={C.gold} strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function Tag({children,variant="olive"}){
  const s={olive:{bg:C.oliveFaint,c:C.olive,b:C.oliveBorder},gold:{bg:C.goldFaint,c:C.goldDark,b:C.goldBorder},pending:{bg:"#FEF3C7",c:"#7C5200",b:"#FDE068"},done:{bg:C.greenFaint,c:C.green,b:C.greenBorder}}[variant]||{bg:C.oliveFaint,c:C.olive,b:C.oliveBorder};
  return <span style={{background:s.bg,color:s.c,border:`0.5px solid ${s.b}`,borderRadius:6,padding:"3px 9px",fontSize:11,fontWeight:700,fontFamily:F.b,letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{children}</span>;
}
function PBtn({children,onClick,disabled=false,gold=false}){
  return <button onClick={onClick} disabled={disabled} onMouseDown={e=>{if(!disabled)e.currentTarget.style.transform="scale(0.98)"}} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} style={{width:"100%",padding:"14px",borderRadius:14,border:"none",fontSize:15,fontWeight:700,cursor:disabled?"not-allowed":"pointer",fontFamily:F.b,background:gold?C.gold:C.olive,color:gold?C.goldDark:C.white,opacity:disabled?0.38:1,transition:"opacity 0.2s,transform 0.1s"}}>{children}</button>;
}
function GBtn({children,onClick}){
  return <button onClick={onClick} onMouseDown={e=>e.currentTarget.style.transform="scale(0.98)"} onMouseUp={e=>e.currentTarget.style.transform="scale(1)"} style={{width:"100%",padding:"13px",borderRadius:14,border:`0.5px solid ${C.border}`,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F.b,background:C.white,color:C.inkMid,transition:"transform 0.1s"}}>{children}</button>;
}

// ── IN-APP TOAST ───────────────────────────────────────────────────────────────
function Toast({msg}){
  if(!msg)return null;
  return(
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:C.olive,color:C.white,borderRadius:14,padding:"12px 20px",fontSize:13,fontWeight:700,fontFamily:F.b,boxShadow:"0 4px 20px #0003",maxWidth:340,textAlign:"center",lineHeight:1.5}}>
      {msg}
    </div>
  );
}

// ── ADS ───────────────────────────────────────────────────────────────────────
function FeedAd(){return <div style={{background:C.adBg,border:`0.5px solid ${C.adBorder}`,borderRadius:14,padding:"11px 14px",display:"flex",alignItems:"center",gap:12,marginBottom:10}}><div style={{width:40,height:40,borderRadius:10,background:C.goldBorder+"55",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0}}>✂️</div><div style={{flex:1}}><div style={{fontSize:9,fontWeight:700,color:C.adInk,letterSpacing:"0.09em",fontFamily:F.b,marginBottom:2}}>SPONSORED</div><div style={{fontSize:13,fontWeight:700,color:C.adInk,fontFamily:F.b}}>Khaki not fitting? Get it tailored today</div><div style={{fontSize:11,color:C.adInk+"BB",fontFamily:F.b,marginTop:2}}>📍 5 mins from camp gate · Open 7am–8pm</div></div></div>;}
function InlineAd(){return <div style={{background:C.adBg,border:`0.5px solid ${C.adBorder}`,borderRadius:12,padding:"10px 13px",display:"flex",alignItems:"center",gap:10,margin:"10px 0"}}><span style={{fontSize:20,flexShrink:0}}>💸</span><div style={{flex:1}}><div style={{fontSize:9,fontWeight:700,color:C.adInk,letterSpacing:"0.09em",fontFamily:F.b}}>SPONSORED</div><div style={{fontSize:12,fontWeight:700,color:C.adInk,fontFamily:F.b}}>OPay — Send money to any corper instantly</div></div><div style={{fontSize:10,color:C.adInk,border:`0.5px solid ${C.adBorder}`,borderRadius:6,padding:"3px 8px",fontWeight:700,fontFamily:F.b,flexShrink:0}}>Open</div></div>;}
function StickyAd(){return <div style={{background:C.adBg,borderTop:`0.5px solid ${C.adBorder}`,padding:"8px 16px",display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:14}}>🏪</span><div style={{flex:1}}><div style={{fontSize:9,fontWeight:700,color:C.adInk,letterSpacing:"0.08em",fontFamily:F.b}}>SPONSORED</div><div style={{fontSize:11,fontWeight:600,color:C.adInk,fontFamily:F.b}}>Mammy market specials — freshest food in camp</div></div><div style={{fontSize:10,color:C.adInk,border:`0.5px solid ${C.adBorder}`,borderRadius:6,padding:"3px 8px",fontWeight:700,fontFamily:F.b,flexShrink:0}}>See deals</div></div>;}

// ── PHOTO BOX ─────────────────────────────────────────────────────────────────
function PhotoBox({image,onChange,itemCount=1}){
  const ref=useRef();
  return(
    <div style={{border:`2px dashed ${C.goldBorder}`,borderRadius:16,minHeight:170,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",background:C.goldFaint+"88",overflow:"hidden"}} onClick={()=>ref.current.click()}>
      {image
        ?<div style={{width:"100%",position:"relative"}}>
            <img src={image} alt="items" style={{width:"100%",height:220,objectFit:"cover"}}/>
            <button onClick={e=>{e.stopPropagation();onChange(null,null);}} style={{position:"absolute",top:8,right:8,background:"#000a",border:"none",color:C.white,borderRadius:"50%",width:28,height:28,fontSize:16,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
          </div>
        :<div style={{textAlign:"center",padding:"28px 20px"}}>
            <div style={{fontSize:36,marginBottom:10}}>📷</div>
            <div style={{fontSize:14,fontWeight:700,color:C.goldDark,fontFamily:F.b,marginBottom:6}}>{itemCount>1?"Lay all items side by side and snap one photo":"Tap to add a photo"}</div>
            <div style={{fontSize:12,color:C.inkLight,fontFamily:F.b,lineHeight:1.6}}>Choose from your gallery or take a new one</div>
          </div>
      }
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){const r=new FileReader();r.onload=ev=>onChange(ev.target.result,f);r.readAsDataURL(f);}}}/>
    </div>
  );
}

// ── LISTING CARD ──────────────────────────────────────────────────────────────
function ListingCard({listing,onTap}){
  const[p,setP]=useState(false);
  const primary=listing.items[0];
  if(!primary)return null;
  const extra=listing.items.length-1;
  const isDone=listing.status==="done";
  return(
    <div onClick={()=>!isDone&&onTap(listing)} onMouseDown={()=>setP(true)} onMouseUp={()=>setP(false)} onMouseLeave={()=>setP(false)} onTouchStart={()=>setP(true)} onTouchEnd={()=>setP(false)}
      style={{background:isDone?"#F9FAF7":C.white,border:`0.5px solid ${C.border}`,borderRadius:18,padding:14,cursor:isDone?"default":"pointer",marginBottom:10,transform:p&&!isDone?"scale(0.985)":"scale(1)",transition:"transform 0.12s",opacity:isDone?0.5:1}}>
      <div style={{display:"flex",gap:12}}>
        {listing.img?<img src={listing.img} alt={primary.item} style={{width:78,height:78,borderRadius:12,objectFit:"cover",flexShrink:0}}/>
          :<div style={{width:78,height:78,borderRadius:12,background:C.oliveFaint,border:`0.5px solid ${C.oliveBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0}}>{getEmoji(primary.item)}</div>}
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.ink,fontFamily:F.s}}>{primary.item}</div>
              {extra>0&&<div style={{fontSize:11,color:C.gold,fontWeight:700,fontFamily:F.b}}>+{extra} more item{extra>1?"s":""}</div>}
            </div>
            <span style={{fontSize:10,color:C.inkLight,fontFamily:F.b,flexShrink:0,marginLeft:6}}>{listing.time}</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8,flexWrap:"wrap"}}>
            <Tag variant="olive">Has {primary.has}</Tag>
            <span style={{color:C.inkLight,fontSize:12}}>→</span>
            <Tag variant="gold">Wants {primary.wants}</Tag>
            {listing.status==="pending"&&<Tag variant="pending">Pending</Tag>}
            {listing.status==="done"&&<Tag variant="done">Swapped ✓</Tag>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7}}>
            <Avatar name={listing.name} size={20}/>
            <span style={{fontSize:12,color:C.inkLight,fontFamily:F.b}}>{listing.name.split(" ")[0]}<span style={{color:C.gold,fontWeight:700}}> · {listing.platoon}</span></span>
          </div>
        </div>
      </div>
      {listing.items.length>1&&(
        <div style={{marginTop:10,paddingTop:10,borderTop:`0.5px solid ${C.border}`,display:"flex",gap:6,flexWrap:"wrap"}}>
          {listing.items.slice(1).map((it,i)=>(
            <div key={i} style={{background:C.surface,border:`0.5px solid ${C.border}`,borderRadius:8,padding:"4px 10px",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:13}}>{getEmoji(it.item)}</span>
              <span style={{fontSize:11,fontWeight:600,color:C.inkMid,fontFamily:F.b}}>{it.item}</span>
              <span style={{fontSize:10,color:C.inkLight,fontFamily:F.b}}>{it.has}→{it.wants}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ITEM ROW ──────────────────────────────────────────────────────────────────
function ItemRow({pItem,idx,onChange,onRemove,canRemove}){
  const sizes=pItem.item?getSizes(pItem.item):[];
  return(
    <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:16,padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:11,fontWeight:700,color:C.inkMid,fontFamily:F.b,letterSpacing:"0.06em"}}>ITEM {idx+1}</span>
        {canRemove&&<button onClick={onRemove} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.inkLight,padding:0}}>✕</button>}
      </div>
      <div style={{marginBottom:12}}>
        <label style={{...LBL,marginBottom:8}}>Khaki item</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          {ITEMS.map(({label,emoji})=>(
            <button key={label} onClick={()=>onChange(idx,"item",label)}
              style={{padding:"10px 8px",borderRadius:12,border:pItem.item===label?`2px solid ${C.gold}`:`0.5px solid ${C.border}`,background:pItem.item===label?C.goldFaint:C.surface,fontSize:12,fontWeight:700,color:pItem.item===label?C.goldDark:C.inkMid,cursor:"pointer",fontFamily:F.b,textAlign:"left",display:"flex",alignItems:"center",gap:6,transition:"all 0.12s"}}>
              <span style={{fontSize:18}}>{emoji}</span><span style={{lineHeight:1.3}}>{label}</span>
            </button>
          ))}
        </div>
      </div>
      {pItem.item&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <div>
            <label style={LBL}>I have</label>
            <select value={pItem.has} onChange={e=>onChange(idx,"has",e.target.value)} style={{...SEL(!!pItem.has),padding:"10px 30px 10px 10px"}}>
              <option value="">Size...</option>
              {sizes.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={LBL}>I want</label>
            <select value={pItem.wants} onChange={e=>onChange(idx,"wants",e.target.value)} style={{...SEL(!!pItem.wants),padding:"10px 30px 10px 10px"}}>
              <option value="">Size...</option>
              {sizes.filter(s=>s!==pItem.has).map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ── LAYOUT ────────────────────────────────────────────────────────────────────
function TopBar({onBack,title,steps,step,right}){
  return(
    <div style={{background:C.white,borderBottom:`0.5px solid ${C.border}`,padding:"13px 18px 11px",display:"flex",alignItems:"center",gap:10,flexShrink:0}}>
      {onBack&&<button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",padding:"0 4px 0 0",fontSize:22,color:C.ink,lineHeight:1}}>←</button>}
      <span style={{flex:1,fontWeight:700,fontSize:15,color:C.ink,fontFamily:F.b}}>{title}</span>
      {steps&&<div style={{display:"flex",gap:5}}>{[1,2,3].map(i=><div key={i} style={{width:20,height:4,borderRadius:2,background:i<=step?C.gold:C.border,transition:"background 0.2s"}}/>)}</div>}
      {right}
    </div>
  );
}
function BottomBar({children}){
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,background:C.white,borderTop:`0.5px solid ${C.border}`,zIndex:99}}>
      <StickyAd/>
      <div style={{padding:"10px 18px 24px"}}>{children}</div>
    </div>
  );
}
function BottomNav({tab,setTab,onPost,showAd=false}){
  return(
    <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:420,zIndex:99}}>
      {showAd&&<StickyAd/>}
      <div style={{background:C.white,borderTop:`0.5px solid ${C.border}`,display:"flex",alignItems:"center"}}>
        <button onClick={()=>setTab("feed")} style={{flex:1,padding:"10px 0 16px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab==="feed"?C.olive:C.inkLight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <span style={{fontSize:10,fontWeight:700,color:tab==="feed"?C.olive:C.inkLight,fontFamily:F.b}}>Feed</span>
          {tab==="feed"&&<div style={{width:20,height:3,borderRadius:2,background:C.gold,marginTop:1}}/>}
        </button>
        {onPost&&<button onClick={onPost} style={{flex:1,padding:"8px 0 14px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <div style={{width:52,height:32,borderRadius:10,background:C.olive,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 14px ${C.olive}55`}}>
            <span style={{fontSize:12,fontWeight:800,color:C.white,fontFamily:F.b,letterSpacing:"0.02em"}}>POST</span>
          </div>
        </button>}
        <button onClick={()=>setTab("profile")} style={{flex:1,padding:"10px 0 16px",background:"none",border:"none",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={tab==="profile"?C.olive:C.inkLight} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
          <span style={{fontSize:10,fontWeight:700,color:tab==="profile"?C.olive:C.inkLight,fontFamily:F.b}}>Profile</span>
          {tab==="profile"&&<div style={{width:20,height:3,borderRadius:2,background:C.gold,marginTop:1}}/>}
        </button>
      </div>
    </div>
  );
}
function SettingRow({emoji,label,sub,right,onClick,danger=false}){
  return(
    <div onClick={onClick} style={{display:"flex",alignItems:"center",gap:13,padding:"13px 16px",cursor:onClick?"pointer":"default",borderBottom:`0.5px solid ${C.border}`}}>
      <div style={{width:36,height:36,borderRadius:10,background:danger?C.redFaint:C.oliveFaint,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{emoji}</div>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:14,fontWeight:600,color:danger?C.red:C.ink,fontFamily:F.b}}>{label}</div>
        {sub&&<div style={{fontSize:12,color:C.inkLight,fontFamily:F.b,marginTop:1}}>{sub}</div>}
      </div>
      {right!==undefined?right:(onClick?<span style={{color:C.inkLight,fontSize:18}}>›</span>:null)}
    </div>
  );
}
function Toggle({on,onToggle}){
  return(
    <div onClick={onToggle} style={{width:44,height:26,borderRadius:13,background:on?C.olive:C.border,position:"relative",cursor:"pointer",transition:"background 0.2s",flexShrink:0}}>
      <div style={{width:20,height:20,borderRadius:"50%",background:C.white,position:"absolute",top:3,left:on?21:3,transition:"left 0.2s",boxShadow:"0 1px 4px #0002"}}/>
    </div>
  );
}

// ── INSTALL PROMPT (PWA) ──────────────────────────────────────────────────────
function InstallBanner({onInstall,onDismiss}){
  return(
    <div style={{background:C.olive,margin:"12px 0 8px",borderRadius:16,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
      <Logo size={36}/>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:700,color:C.white,fontFamily:F.b}}>Add SwapKit to home screen</div>
        <div style={{fontSize:11,color:C.white+"88",fontFamily:F.b,marginTop:2}}>Quick access without the browser</div>
      </div>
      <div style={{display:"flex",gap:6}}>
        <button onClick={onInstall} style={{padding:"7px 12px",borderRadius:10,border:"none",background:C.gold,color:C.goldDark,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.b}}>Add</button>
        <button onClick={onDismiss} style={{padding:"7px 8px",borderRadius:10,border:"none",background:C.white+"22",color:C.white,fontSize:12,cursor:"pointer",fontFamily:F.b}}>✕</button>
      </div>
    </div>
  );
}

// ── MATCH NOTIFICATION BANNER ─────────────────────────────────────────────────
// Shown in-feed when a new listing matches what YOU want
function MatchBanner({match,onTap,onDismiss}){
  if(!match)return null;
  return(
    <div style={{background:C.goldFaint,border:`1.5px solid ${C.gold}`,borderRadius:16,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"center",gap:12,cursor:"pointer"}} onClick={onTap}>
      <div style={{fontSize:28,flexShrink:0}}>🎯</div>
      <div style={{flex:1}}>
        <div style={{fontSize:13,fontWeight:700,color:C.goldDark,fontFamily:F.b}}>New match for your swap!</div>
        <div style={{fontSize:12,color:C.goldDark,fontFamily:F.b,marginTop:2}}>{match.name.split(" ")[0]} posted {match.items[0]?.item} size {match.items[0]?.has} → {match.items[0]?.wants}</div>
      </div>
      <button onClick={e=>{e.stopPropagation();onDismiss();}} style={{background:"none",border:"none",fontSize:18,color:C.goldDark,cursor:"pointer",padding:0,flexShrink:0}}>✕</button>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const[screen,setScreen]     = useState(()=>localStorage.getItem("sk_uid")?"main":"onboard");
  const[loading,setLoading]   = useState(false);
  const[refreshing,setRefreshing] = useState(false);
  const[tab,setTab]           = useState("feed");
  const[pView,setPView]       = useState("main");
  const[userName,setUserName] = useState(()=>localStorage.getItem("sk_name")||"");
  const[phone,setPhone]       = useState(()=>localStorage.getItem("sk_phone")||"");
  const[camp,setCamp]         = useState(()=>localStorage.getItem("sk_camp")||"");
  const[platoon,setPlatoon]   = useState(()=>localStorage.getItem("sk_platoon")||"");
  const[uid,setUid]           = useState(()=>localStorage.getItem("sk_uid")||null);
  const[filter,setFilter]     = useState("All");
  const[search,setSearch]     = useState("");
  const[listings,setListings] = useState([]);
  const[selected,setSelected] = useState(null);
  const[step,setStep]         = useState(1);
  const[postItems,setPostItems] = useState([newItem()]);
  const[postImg,setPostImg]   = useState(null);
  const[postFile,setPostFile] = useState(null);
  const[postPlat,setPostPlat] = useState("");
  const[showPlatoon,setShowPlatoon] = useState(true);
  const[confirmDelete,setConfirmDelete] = useState(false);
  const[toast,setToast]       = useState(null);
  const[matchBanner,setMatchBanner] = useState(null);
  const[waShareItems,setWaShareItems] = useState(null); // items just posted, for share screen

  // PWA install prompt
  const[installPrompt,setInstallPrompt] = useState(null);
  const[showInstallBanner,setShowInstallBanner] = useState(false);

  // Edit profile
  const[editName,setEditName] = useState("");
  const[editPhone,setEditPhone] = useState("");
  const[editPlatoon,setEditPlatoon] = useState("");
  const[editCamp,setEditCamp] = useState("");
  const[editSaving,setEditSaving] = useState(false);

  // Notifications
  const[notifGranted,setNotifGranted] = useState(()=>typeof Notification!=="undefined"&&Notification.permission==="granted");

  // Keep a ref to current listings so realtime handler can diff without stale closure
  const listingsRef = useRef([]);
  useEffect(()=>{ listingsRef.current = listings; },[listings]);

  // Keep a ref to current uid/camp for realtime handler
  const uidRef = useRef(uid);
  const campRef = useRef(camp);
  useEffect(()=>{ uidRef.current=uid; },[uid]);
  useEffect(()=>{ campRef.current=camp; },[camp]);

  // ── PWA: capture install prompt ────────────────────────────────────────────
  useEffect(()=>{
    const handler=e=>{e.preventDefault();setInstallPrompt(e);if(!localStorage.getItem("sk_install_dismissed"))setShowInstallBanner(true);};
    window.addEventListener("beforeinstallprompt",handler);
    return()=>window.removeEventListener("beforeinstallprompt",handler);
  },[]);

  // ── SERVICE WORKER registration ────────────────────────────────────────────
  useEffect(()=>{
    if("serviceWorker" in navigator){
      navigator.serviceWorker.register("/sw.js").catch(e=>console.warn("SW reg failed:",e));
    }
  },[]);

  // ── FETCH listings ─────────────────────────────────────────────────────────
  // FIX: fetchListings now takes an explicit campArg so it never reads stale state.
  // It also fetches ALL statuses (not just non-done) so realtime diff works,
  // then filters out "done" for display.
  const fetchListings = useCallback(async(campArg)=>{
    const c = campArg || localStorage.getItem("sk_camp") || "";
    if(!c){ console.warn("fetchListings: no camp"); return; }
    const{data,error}=await supabase
      .from("listings")
      .select(`id,status,img_url,created_at,camp,platoon,requested_at,
        listing_items(item,has_size,wants_size),
        users!listings_user_id_fkey(id,name,phone,platoon)`)
      .eq("camp",c)
      .neq("status","done")
      .order("created_at",{ascending:false})
      .limit(50);
    if(error){ console.error("fetch error:",error.message); return; }
    setListings((data||[]).map(l=>{
      const u = l["users!listings_user_id_fkey"] || {};
      return {
        id:l.id, status:l.status, img:l.img_url, camp:l.camp,
        platoon:u.platoon||l.platoon, requestedAt:l.requested_at,
        userId:u.id, name:u.name||"Corper", phone:u.phone||"",
        time:timeAgo(l.created_at),
        items:(l.listing_items||[]).map(i=>({item:i.item,has:i.has_size,wants:i.wants_size}))
      };
    }));
  },[]);

  // ── CHECK FOR MATCHES (new listings that match user's posted wants) ─────────
  // A "match" = someone just posted a listing where their `has` = size I `want`
  // for the same item I want.
  const checkForMatches = useCallback((newListings, prevListings)=>{
    const myUid = uidRef.current;
    if(!myUid || !prevListings) return;

    // What sizes am I currently looking for? (from my own active listings)
    const myWants = prevListings
      .filter(l=>l.userId===myUid && l.status!=="done")
      .flatMap(l=>l.items.map(i=>({item:i.item, wants:i.wants})));

    if(!myWants.length) return;

    // Find new listings (not in prevListings) that aren't mine and match my wants
    const prevIds = new Set(prevListings.map(l=>l.id));
    const brandNew = newListings.filter(l=>!prevIds.has(l.id) && l.userId!==myUid && l.status!=="done");

    for(const listing of brandNew){
      for(const item of listing.items){
        const hit = myWants.find(w=>w.item===item.item && w.wants===item.has);
        if(hit){
          // Show in-app match banner
          setMatchBanner(listing);
          // Also fire a browser notification if granted
          if(typeof Notification!=="undefined" && Notification.permission==="granted"){
            new Notification("🎯 SwapKit match!", {
              body:`${listing.name.split(" ")[0]} has ${item.item} size ${item.has} — exactly what you need!`,
              icon:"/icons/icon-192.png",
              badge:"/icons/icon-192.png",
              tag:`match-${listing.id}`,
            });
          }
          break;
        }
      }
    }
  },[]);

  // ── REALTIME subscription ──────────────────────────────────────────────────
  // FIX: subscribe once per camp. On any change, re-fetch and diff for matches.
  useEffect(()=>{
    if(!camp) return;

    // Expire stale pending listings (fire and forget)
    supabase.from("listings").update({status:"done"})
      .eq("status","pending")
      .lt("requested_at", new Date(Date.now()-86400000).toISOString())
      .then(()=>{});

    fetchListings(camp);

    const ch = supabase.channel(`listings_camp_${camp.replace(/\s/g,"_").replace(/[^a-zA-Z0-9_]/g,"_")}`)
      .on("postgres_changes",{event:"*",schema:"public",table:"listings"},
        async()=>{
          const prev = listingsRef.current;
          const next = await fetchListings(camp);
          if(next) checkForMatches(next, prev);
        })
      .subscribe((status)=>{
        if(status==="SUBSCRIBED") console.log("Realtime connected for camp:",camp);
        if(status==="CHANNEL_ERROR") console.warn("Realtime error, will poll");
      });

    // Fallback: poll every 30s in case realtime isn't available
    const poll = setInterval(()=>fetchListings(camp), 30000);

    return()=>{
      supabase.removeChannel(ch);
      clearInterval(poll);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[camp]);

  async function manualRefresh(){
    setRefreshing(true);
    await fetchListings(camp);
    setRefreshing(false);
    showInAppToast("Feed refreshed ✓", setToast);
  }

  // ── SIGNUP ─────────────────────────────────────────────────────────────────
  async function handleSignup(){
    setLoading(true);
    try{
      const{data:existing}=await supabase.from("users").select("id,name,camp,platoon,phone").eq("phone",phone).single();
      if(existing){
        setUid(existing.id);setUserName(existing.name);setCamp(existing.camp);setPlatoon(existing.platoon);
        localStorage.setItem("sk_uid",existing.id);localStorage.setItem("sk_name",existing.name);
        localStorage.setItem("sk_camp",existing.camp);localStorage.setItem("sk_platoon",existing.platoon);
        localStorage.setItem("sk_phone",phone);
        setScreen("main");return;
      }
      const{data,error}=await supabase.from("users").insert({phone,name:userName,camp,platoon}).select().single();
      if(error){alert(error.message);return;}
      setUid(data.id);
      localStorage.setItem("sk_uid",data.id);localStorage.setItem("sk_name",userName);
      localStorage.setItem("sk_camp",camp);localStorage.setItem("sk_platoon",platoon);
      localStorage.setItem("sk_phone",phone);
      setScreen("main");
    }finally{setLoading(false);}
  }

  // ── SAVE PROFILE EDITS (now includes phone) ────────────────────────────────
  async function saveProfileEdits(){
    setEditSaving(true);
    try{
      const updates={};
      if(editName && editName!==userName) updates.name=editName;
      if(editPlatoon && editPlatoon!==platoon) updates.platoon=editPlatoon;
      if(editCamp && editCamp!==camp) updates.camp=editCamp;
      if(editPhone && editPhone.length===11 && editPhone!==phone) updates.phone=editPhone;

      if(Object.keys(updates).length){
        // Check new phone not already taken by another user
        if(updates.phone){
          const{data:taken}=await supabase.from("users").select("id").eq("phone",updates.phone).neq("id",uid).single();
          if(taken){ alert("That phone number is already registered."); return; }
        }
        const{error}=await supabase.from("users").update(updates).eq("id",uid);
        if(error){alert(error.message);return;}
        if(updates.name){setUserName(updates.name);localStorage.setItem("sk_name",updates.name);}
        if(updates.platoon){setPlatoon(updates.platoon);localStorage.setItem("sk_platoon",updates.platoon);}
        if(updates.camp){setCamp(updates.camp);localStorage.setItem("sk_camp",updates.camp);}
        if(updates.phone){setPhone(updates.phone);localStorage.setItem("sk_phone",updates.phone);}
        showInAppToast("Profile updated ✓", setToast);
      }

      setPView("settings");
      if(updates.camp) fetchListings(updates.camp);
    }finally{setEditSaving(false);}
  }

  // ── NOTIFICATIONS ──────────────────────────────────────────────────────────
  async function requestNotifications(){
    if(!("Notification" in window)){alert("Your browser doesn't support notifications.");return;}
    const perm=await Notification.requestPermission();
    setNotifGranted(perm==="granted");
    if(perm==="granted"){
      // Show confirmation notification
      new Notification("SwapKit 🎯",{
        body:"You'll get notified when a new listing matches what you need!",
        icon:"/icons/icon-192.png"
      });
      // Subscribe to push (for background notifications when app is closed)
      const ok = await subscribeToPush(uid);
      if(ok) showInAppToast("Push notifications enabled 🔔", setToast);
      else showInAppToast("In-app notifications enabled 🔔", setToast);
    }
  }

  // ── COMPRESS IMAGE ─────────────────────────────────────────────────────────
  function compressImage(file){
    return new Promise(resolve=>{
      const img=new Image();const url=URL.createObjectURL(file);
      img.onload=()=>{
        const MAX=800;let w=img.width,h=img.height;
        if(w>MAX){h=Math.round(h*MAX/w);w=MAX;}if(h>MAX){w=Math.round(w*MAX/h);h=MAX;}
        const canvas=document.createElement("canvas");canvas.width=w;canvas.height=h;
        canvas.getContext("2d").drawImage(img,0,0,w,h);URL.revokeObjectURL(url);
        canvas.toBlob(blob=>resolve(blob||file),"image/jpeg",0.82);
      };
      img.onerror=()=>resolve(file);img.src=url;
    });
  }

  // ── POST LISTING ───────────────────────────────────────────────────────────
  async function postListing(){
    setLoading(true);
    try{
      let imgUrl=null;
      if(postFile){
        try{
          const compressed=await compressImage(postFile);
          const path=`${uid}/${Date.now()}.jpg`;
          const{error:upErr}=await supabase.storage.from("listing-images").upload(path,compressed,{contentType:"image/jpeg",upsert:false});
          if(!upErr){const{data:u}=supabase.storage.from("listing-images").getPublicUrl(path);imgUrl=u.publicUrl;}
          else console.warn("Upload skipped:",upErr.message);
        }catch(e){console.warn("Compress failed:",e);}
      }
      const{data:listing,error}=await supabase.from("listings").insert({user_id:uid,camp,platoon:postPlat||platoon,img_url:imgUrl}).select().single();
      if(error){alert("Post failed: "+error.message);return;}
      await supabase.from("listing_items").insert(postItems.map(i=>({listing_id:listing.id,item:i.item,has_size:i.has,wants_size:i.wants})));

      // Optimistic update
      const optimistic={id:listing.id,status:"available",img:imgUrl,camp,platoon:postPlat||platoon,
        requestedAt:null,userId:uid,name:userName,phone,time:"just now",
        items:postItems.map(i=>({item:i.item,has:i.has,wants:i.wants}))
      };
      setListings(prev=>[optimistic,...prev]);
      setPostItems([newItem()]);setPostImg(null);setPostFile(null);setPostPlat("");setStep(1);
      setScreen("main");setTab("feed");
      showInAppToast("Listing posted! 🎉", setToast);
      setTimeout(()=>fetchListings(camp),2000);
    }finally{setLoading(false);}
  }

  // ── REQUEST SWAP ───────────────────────────────────────────────────────────
  async function handleRequest(listing){
    const now=new Date().toISOString();
    await supabase.from("listings").update({status:"pending",requested_at:now,requested_by:uid}).eq("id",listing.id);
    setListings(prev=>prev.map(l=>l.id===listing.id?{...l,status:"pending",requestedAt:now}:l));
    setSelected({...listing,status:"pending"});

    // Notify the listing owner in-app (they'll see it next time they open the app)
    // We write a notification row — the owner's app reads it on mount/realtime
    try{
      await supabase.from("notifications").insert({
        user_id: listing.userId,
        type: "swap_request",
        listing_id: listing.id,
        from_name: userName,
        message: `${userName} wants to swap ${listing.items[0]?.item} with you!`,
        read: false,
      });
    }catch(e){ /* notifications table optional */ }

    setScreen("contact");
  }

  // ── MARK DONE ──────────────────────────────────────────────────────────────
  async function handleDone(listing){
    await supabase.from("listings").update({status:"done"}).eq("id",listing.id);
    setListings(prev=>prev.filter(l=>l.id!==listing.id));
    setScreen("main");setSelected(null);
    showInAppToast("Swap marked done! 🤝", setToast);
  }

  // ── DELETE ACCOUNT ─────────────────────────────────────────────────────────
  async function handleDeleteAccount(){
    await supabase.from("users").delete().eq("id",uid);
    ["sk_uid","sk_name","sk_camp","sk_platoon","sk_phone"].forEach(k=>localStorage.removeItem(k));
    setScreen("onboard");setUserName("");setPhone("");setCamp("");setPlatoon("");setUid(null);setListings([]);setConfirmDelete(false);
  }

  // ── PWA install ────────────────────────────────────────────────────────────
  async function handleInstall(){
    if(!installPrompt)return;
    installPrompt.prompt();
    const{outcome}=await installPrompt.userChoice;
    if(outcome==="accepted"){setShowInstallBanner(false);setInstallPrompt(null);}
  }

  // ── FILTERED FEED (exclude own listings from main feed, exclude done) ───────
  const filtered=listings.filter(l=>{
    if(l.status==="done") return false;
    const im=filter==="All"||l.items.some(i=>i.item===filter);
    const sm=!search||l.items.some(i=>
      i.item.toLowerCase().includes(search.toLowerCase())||
      i.has.toLowerCase().includes(search.toLowerCase())||
      i.wants.toLowerCase().includes(search.toLowerCase())
    );
    return im&&sm;
  });

  const allValid=postItems.every(i=>i.item&&i.has&&i.wants);
  const updateItem=(idx,field,val)=>setPostItems(prev=>prev.map((it,i)=>i===idx?{...it,[field]:val,...(field==="item"?{has:"",wants:""}:{})}:it));
  const myListings=listings.filter(l=>l.userId===uid);
  const doneCount=myListings.filter(l=>l.status==="done").length;
  const activeCount=myListings.filter(l=>l.status==="available").length;
  const pendingCount=myListings.filter(l=>l.status==="pending").length;

  // ══ ONBOARD ════════════════════════════════════════════════════════════════
  if(screen==="onboard")return(
    <div style={WRAP}>
      <Toast msg={toast}/>
      <div style={{background:C.olive,padding:"52px 28px 40px",position:"relative",overflow:"hidden",flexShrink:0}}>
        <div style={{position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",background:C.gold+"18"}}/>
        <div style={{position:"absolute",bottom:-40,left:-40,width:140,height:140,borderRadius:"50%",background:C.gold+"0C"}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:28,position:"relative"}}>
          <Logo size={40}/><span style={{fontFamily:F.s,fontWeight:700,fontSize:26,color:C.white}}>Swap<span style={{color:C.gold}}>Kit</span></span>
        </div>
        <div style={{fontFamily:F.s,fontWeight:700,fontSize:28,color:C.white,lineHeight:1.25,marginBottom:10,position:"relative"}}>Find your fit.<br/>Swap your khakis.</div>
        <div style={{fontSize:13,color:C.white+"88",lineHeight:1.7,fontFamily:F.b,position:"relative"}}>Connect with corpers at your camp who have the sizes you need.</div>
      </div>
      <div style={{flex:1,padding:"28px 24px 32px",overflowY:"auto",textAlign:"left"}}>
        <div style={{marginBottom:16}}>
          <label style={LBL}>Name</label>
          <input style={INP} placeholder="Amaka Adamu" value={userName} onChange={e=>setUserName(e.target.value)}/>
        </div>
        <div style={{marginBottom:16}}>
          <label style={LBL}>Phone number</label>
          <input type="tel" maxLength={11} placeholder="08012345678 (call & WhatsApp)" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,"").slice(0,11))} style={INP}/>
          {phone.length>0&&phone.length<11&&<div style={{fontSize:11,color:C.gold,marginTop:5,fontFamily:F.b}}>{11-phone.length} more digit{11-phone.length!==1?"s":""} needed</div>}
        </div>
        <div style={{marginBottom:16}}>
          <label style={LBL}>NYSC camp</label>
          <select value={camp} onChange={e=>setCamp(e.target.value)} style={SEL(!!camp)}>
            <option value="">Select your camp...</option>
            {CAMPS.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div style={{marginBottom:8}}>
          <label style={LBL}>Platoon</label>
          <select value={platoon} onChange={e=>setPlatoon(e.target.value)} style={SEL(!!platoon)}>
            <option value="">Select your platoon...</option>
            {PLATOONS.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div style={{fontSize:11,color:C.inkLight,marginBottom:24,lineHeight:1.6,fontFamily:F.b}}>Platoon helps corpers find you faster in camp.</div>
        <PBtn onClick={handleSignup} disabled={!userName||phone.length!==11||!camp||!platoon||loading}>{loading?"Setting up...":"Enter camp feed →"}</PBtn>
        <div style={{textAlign:"center",marginTop:14,fontSize:11,color:C.inkLight,lineHeight:1.6,fontFamily:F.b}}>Your number is only visible to corpers who request your swap.</div>
      </div>
    </div>
  );

  // ══ CONTACT REVEAL ═════════════════════════════════════════════════════════
  if(screen==="contact"&&selected)return(
    <div style={WRAP}>
      <Toast msg={toast}/>
      <TopBar onBack={()=>setScreen("main")} title="Swap request sent"/>
      <div style={{flex:1,display:"flex",flexDirection:"column",padding:"24px 22px",overflowY:"auto"}}>
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:24,textAlign:"center"}}>
          <div style={{width:80,height:80,borderRadius:"50%",background:C.goldFaint,border:`2px solid ${C.goldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:14,fontSize:38}}>🤝</div>
          <div style={{fontFamily:F.s,fontWeight:700,fontSize:22,color:C.ink,marginBottom:6}}>Contact revealed!</div>
          <div style={{fontSize:13,color:C.inkLight,lineHeight:1.7,fontFamily:F.b}}>Reach out to {selected.name.split(" ")[0]} directly to arrange the swap in camp.</div>
        </div>
        <div style={{background:C.goldFaint,border:`0.5px solid ${C.goldBorder}`,borderRadius:13,padding:"11px 14px",fontSize:12,color:C.goldDark,fontFamily:F.b,fontWeight:600,marginBottom:16,display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:16}}>👁️</span>This listing is now marked <strong>Pending</strong>. Auto-clears in 24hrs if not marked done.
        </div>
        <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:20,padding:18,marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingBottom:16,borderBottom:`0.5px solid ${C.border}`}}>
            <Avatar name={selected.name} size={48}/>
            <div>
              <div style={{fontWeight:700,fontSize:16,color:C.ink,fontFamily:F.b}}>{selected.name}</div>
              <div style={{fontSize:12,color:C.gold,fontWeight:700,fontFamily:F.b,marginTop:2}}>{selected.platoon}</div>
              <div style={{fontSize:11,color:C.inkLight,fontFamily:F.b}}>{(selected.camp||camp).split("—")[1]?.trim()}</div>
            </div>
          </div>
          {selected.items.map((it,i)=>(
            <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:i<selected.items.length-1?10:0,paddingBottom:i<selected.items.length-1?10:0,borderBottom:i<selected.items.length-1?`0.5px solid ${C.border}`:"none"}}>
              <span style={{fontSize:13,color:C.inkMid,fontFamily:F.b}}>{getEmoji(it.item)} {it.item}</span>
              <div style={{display:"flex",gap:5,alignItems:"center"}}>
                <Tag variant="olive">{it.has}</Tag><span style={{color:C.inkLight,fontSize:12}}>→</span><Tag variant="gold">{it.wants}</Tag>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:C.olive,borderRadius:20,padding:"20px 22px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:C.white+"66",letterSpacing:"0.09em",marginBottom:8,fontFamily:F.b}}>PHONE NUMBER</div>
          <div style={{fontSize:30,fontWeight:800,color:C.gold,fontFamily:F.b,letterSpacing:"0.04em"}}>{selected.phone||"—"}</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
          <a href={`tel:${selected.phone}`} style={{padding:"14px",borderRadius:14,border:`0.5px solid ${C.border}`,background:C.white,fontSize:13,fontWeight:700,color:C.inkMid,cursor:"pointer",fontFamily:F.b,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>📞 Call</a>
          <a href={`https://wa.me/234${selected.phone?.slice(1)}`} target="_blank" rel="noreferrer" style={{padding:"14px",borderRadius:14,border:"none",background:"#25D366",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",fontFamily:F.b,textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>💬 WhatsApp</a>
        </div>
        <PBtn gold onClick={()=>handleDone(selected)}>Mark swap as done ✓</PBtn>
        <div style={{marginTop:10}}><GBtn onClick={()=>{setScreen("main");setSelected(null);}}>Back to feed</GBtn></div>
      </div>
    </div>
  );

  // ══ DETAIL ═════════════════════════════════════════════════════════════════
  if(screen==="detail"&&selected)return(
    <div style={WRAP}>
      <Toast msg={toast}/>
      <TopBar onBack={()=>setScreen("main")} title="Listing detail"/>
      <div style={{flex:1,padding:"16px 16px 130px",overflowY:"auto"}}>
        {selected.img?<img src={selected.img} alt="item" style={{width:"100%",height:210,objectFit:"cover",borderRadius:18,marginBottom:16}}/>
          :<div style={{width:"100%",height:160,borderRadius:18,background:C.oliveFaint,border:`0.5px solid ${C.oliveBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:72,marginBottom:16}}>{getEmoji(selected.items[0].item)}</div>}
        <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:20,padding:18,marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12,paddingBottom:14,marginBottom:14,borderBottom:`0.5px solid ${C.border}`}}>
            <Avatar name={selected.name} size={44}/>
            <div>
              <div style={{fontWeight:700,fontSize:15,color:C.ink,fontFamily:F.b}}>{selected.name}</div>
              <div style={{fontSize:12,color:C.gold,fontWeight:700,fontFamily:F.b}}>{selected.platoon}</div>
              <div style={{fontSize:11,color:C.inkLight,fontFamily:F.b}}>{(selected.camp||camp).split("—")[1]?.trim()}</div>
            </div>
          </div>
          {selected.items.map((it,i)=>(
            <div key={i}>
              {i>0&&<InlineAd/>}
              <div style={{marginBottom:i<selected.items.length-1?14:0,paddingBottom:i<selected.items.length-1?14:0,borderBottom:i<selected.items.length-1?`0.5px solid ${C.border}`:"none"}}>
                <div style={{fontFamily:F.s,fontWeight:700,fontSize:16,color:C.ink,marginBottom:10}}>{getEmoji(it.item)} {it.item}</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div style={{background:C.oliveFaint,border:`0.5px solid ${C.oliveBorder}`,borderRadius:12,padding:"12px",textAlign:"center"}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.oliveMid,letterSpacing:"0.09em",marginBottom:3,fontFamily:F.b}}>HAS</div>
                    <div style={{fontSize:22,fontWeight:800,color:C.olive,fontFamily:F.b}}>Size {it.has}</div>
                  </div>
                  <div style={{background:C.goldFaint,border:`0.5px solid ${C.goldBorder}`,borderRadius:12,padding:"12px",textAlign:"center"}}>
                    <div style={{fontSize:10,fontWeight:700,color:C.gold,letterSpacing:"0.09em",marginBottom:3,fontFamily:F.b}}>WANTS</div>
                    <div style={{fontSize:22,fontWeight:800,color:C.goldDark,fontFamily:F.b}}>Size {it.wants}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomBar>
        {selected.userId===uid
          ?<GBtn onClick={()=>handleDone(selected)}>Mark as done — remove from feed</GBtn>
          :selected.status==="pending"
            ?<div style={{padding:"14px",borderRadius:14,background:C.surface,border:`0.5px solid ${C.border}`,textAlign:"center",fontSize:14,fontWeight:600,color:C.inkMid,fontFamily:F.b}}>⏳ Someone is already in contact</div>
            :<PBtn onClick={()=>handleRequest(selected)}>Request swap — see contact →</PBtn>
        }
      </BottomBar>
    </div>
  );

  // ══ MAIN ══════════════════════════════════════════════════════════════════
  if(screen==="main"){

    // ── FEED ─────────────────────────────────────────────────────────────────
    if(tab==="feed")return(
      <div style={WRAP}>
        <Toast msg={toast}/>
        <div style={{background:C.white,borderBottom:`0.5px solid ${C.border}`,padding:"14px 18px 12px",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:9}}><Logo size={30}/><span style={{fontFamily:F.s,fontWeight:700,fontSize:20,color:C.olive}}>Swap<span style={{color:C.gold}}>Kit</span></span></div>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <button onClick={manualRefresh} style={{background:"none",border:`0.5px solid ${C.border}`,borderRadius:20,padding:"3px 10px",cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={C.olive} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{transform:refreshing?"rotate(360deg)":"none",transition:refreshing?"transform 0.6s linear":"none"}}><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                <span style={{fontSize:11,fontWeight:700,color:C.olive,fontFamily:F.b}}>{refreshing?"...":"Refresh"}</span>
              </button>
              <span onClick={()=>{setTab("profile");setPView("settings");}} style={{fontSize:11,color:C.olive,background:C.oliveFaint,border:`0.5px solid ${C.oliveBorder}`,borderRadius:20,padding:"3px 10px",fontWeight:700,fontFamily:F.b,cursor:"pointer"}}>{camp.split("—")[1]?.trim()||camp} ›</span>
            </div>
          </div>
          <div style={{position:"relative",marginBottom:10}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:14,color:C.inkLight}}>🔍</span>
            <input placeholder="Search item or size..." value={search} onChange={e=>setSearch(e.target.value)} style={{...INP,paddingLeft:36,background:C.surface,fontSize:13}}/>
          </div>
          <div style={{display:"flex",gap:7,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none",msOverflowStyle:"none"}} className="hide-scroll">
            {["All",...ITEMS.map(i=>i.label)].map(it=>(
              <button key={it} onClick={()=>setFilter(it)} style={{flexShrink:0,padding:"7px 16px",borderRadius:24,border:`0.5px solid ${filter===it?C.gold:C.border}`,fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F.b,background:filter===it?C.gold:C.white,color:filter===it?C.white:C.inkMid,transition:"all 0.15s",whiteSpace:"nowrap"}}>{it}</button>
            ))}
          </div>
          <style>{`.hide-scroll::-webkit-scrollbar{display:none}`}</style>
        </div>
        <div style={{flex:1,padding:"14px 16px 160px",overflowY:"auto"}}>
          {showInstallBanner&&<InstallBanner onInstall={handleInstall} onDismiss={()=>{setShowInstallBanner(false);localStorage.setItem("sk_install_dismissed","1");}}/>}
          {/* Match notification banner */}
          {matchBanner&&<MatchBanner match={matchBanner} onTap={()=>{setSelected(matchBanner);setScreen("detail");setMatchBanner(null);}} onDismiss={()=>setMatchBanner(null)}/>}
          {filtered.length===0?(
            <div style={{textAlign:"center",padding:"56px 24px",color:C.inkLight}}>
              <div style={{fontSize:44,marginBottom:14}}>🔍</div>
              <div style={{fontSize:16,fontWeight:700,color:C.inkMid,fontFamily:F.s,marginBottom:6}}>Nothing here yet</div>
              <div style={{fontSize:13,fontFamily:F.b}}>Be the first to post this item in camp.</div>
            </div>
          ):filtered.map((l,idx)=>(
            <div key={l.id}>
              <ListingCard listing={l} onTap={l=>{setSelected(l);setScreen("detail");}}/>
              {(idx+1)%4===0&&<FeedAd/>}
            </div>
          ))}
        </div>
        <BottomNav tab={tab} setTab={setTab} showAd onPost={()=>{setPostItems([newItem()]);setPostImg(null);setPostFile(null);setPostPlat("");setStep(1);setScreen("post");}}/>
      </div>
    );

    // ── PROFILE ───────────────────────────────────────────────────────────────
    if(tab==="profile"){

      // ABOUT
      if(pView==="about")return(
        <div style={WRAP}>
          <Toast msg={toast}/>
          <TopBar onBack={()=>setPView("main")} title="About SwapKit"/>
          <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
            <div style={{background:C.olive,padding:"36px 24px 32px",textAlign:"center",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-40,right:-40,width:140,height:140,borderRadius:"50%",background:C.gold+"14"}}/>
              <div style={{display:"flex",justifyContent:"center",marginBottom:14}}><Logo size={56}/></div>
              <div style={{fontFamily:F.s,fontWeight:700,fontSize:24,color:C.white,marginBottom:4}}>Swap<span style={{color:C.gold}}>Kit</span></div>
              <div style={{fontSize:12,color:C.white+"77",fontFamily:F.b}}>Version 1.1 · NYSC Camp Edition</div>
            </div>
            <div style={{padding:"20px 18px"}}>
              <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:18,padding:18,marginBottom:12}}>
                <div style={{fontFamily:F.s,fontWeight:700,fontSize:17,color:C.ink,marginBottom:10}}>Why SwapKit exists</div>
                <div style={{fontSize:13,color:C.inkMid,lineHeight:1.75,fontFamily:F.b}}>Every year, 350,000+ Nigerian graduates enter NYSC camp and receive khakis and boots — almost none in the right size. Corpers spend their first days running around desperately searching for someone with their size.<br/><br/>SwapKit fixes that. Post what you have. Find what you need. Swap in minutes.</div>
              </div>
              <InlineAd/>
              <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:18,padding:18,marginBottom:12}}>
                <div style={{fontFamily:F.s,fontWeight:700,fontSize:17,color:C.ink,marginBottom:14}}>How it works</div>
                {[["📋","Post your listing","Tell us what you were given and what size you need."],["🔍","Browse the feed","Scroll listings from your camp only."],["📞","Request a swap","Tap request — contact revealed immediately."],["🔔","Get notified","Enable notifications to be alerted when your match posts."]].map(([em,t,d],i)=>(
                  <div key={i} style={{display:"flex",gap:13,marginBottom:i<3?14:0,paddingBottom:i<3?14:0,borderBottom:i<3?`0.5px solid ${C.border}`:"none"}}>
                    <div style={{width:38,height:38,borderRadius:10,background:C.goldFaint,border:`0.5px solid ${C.goldBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{em}</div>
                    <div><div style={{fontWeight:700,fontSize:13,color:C.ink,fontFamily:F.b,marginBottom:3}}>{t}</div><div style={{fontSize:12,color:C.inkLight,fontFamily:F.b,lineHeight:1.6}}>{d}</div></div>
                  </div>
                ))}
              </div>
              <div style={{background:C.goldFaint,border:`0.5px solid ${C.goldBorder}`,borderRadius:14,padding:"13px 15px",display:"flex",gap:10,alignItems:"flex-start"}}>
                <span style={{fontSize:18,flexShrink:0}}>✉️</span>
                <div><div style={{fontWeight:700,fontSize:13,color:C.goldDark,fontFamily:F.b,marginBottom:3}}>Get in touch</div><div style={{fontSize:12,color:C.goldDark,fontFamily:F.b,lineHeight:1.6}}>Advertise, partner, or feedback — <a href="mailto:subeyeapp@gmail.com" style={{color:C.goldDark}}>subeyeapp@gmail.com</a></div></div>
              </div>
            </div>
          </div>
          <BottomNav tab={tab} setTab={t=>{setTab(t);setPView("main");}}/>
        </div>
      );

      // EDIT PROFILE — now includes phone number
      if(pView==="editprofile")return(
        <div style={WRAP}>
          <Toast msg={toast}/>
          <TopBar onBack={()=>setPView("settings")} title="Edit profile"/>
          <div style={{flex:1,padding:"24px 20px 100px",overflowY:"auto"}}>
            <div style={{marginBottom:16}}>
              <label style={LBL}>Name</label>
              <input style={INP} value={editName} onChange={e=>setEditName(e.target.value)} placeholder={userName}/>
            </div>
            <div style={{marginBottom:16}}>
              <label style={LBL}>Phone number</label>
              <input type="tel" maxLength={11} value={editPhone} onChange={e=>setEditPhone(e.target.value.replace(/\D/g,"").slice(0,11))} placeholder={phone} style={INP}/>
              {editPhone.length>0&&editPhone.length<11&&(
                <div style={{fontSize:11,color:C.gold,marginTop:5,fontFamily:F.b}}>{11-editPhone.length} more digit{11-editPhone.length!==1?"s":""} needed</div>
              )}
              {editPhone.length===11&&editPhone!==phone&&(
                <div style={{fontSize:11,color:C.green,marginTop:5,fontFamily:F.b}}>✓ New number looks good</div>
              )}
              <div style={{fontSize:11,color:C.inkLight,marginTop:5,fontFamily:F.b,lineHeight:1.5}}>Only shown to corpers who request your swap.</div>
            </div>
            <div style={{marginBottom:16}}>
              <label style={LBL}>Camp</label>
              <select value={editCamp||camp} onChange={e=>setEditCamp(e.target.value)} style={SEL(true)}>
                {CAMPS.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
              <div style={{fontSize:11,color:C.gold,marginTop:5,fontFamily:F.b}}>⚠️ Changing camp will reload your feed</div>
            </div>
            <div style={{marginBottom:24}}>
              <label style={LBL}>Platoon</label>
              <select value={editPlatoon||platoon} onChange={e=>setEditPlatoon(e.target.value)} style={SEL(true)}>
                {PLATOONS.map(p=><option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <PBtn onClick={saveProfileEdits} disabled={editSaving}>{editSaving?"Saving...":"Save changes"}</PBtn>
          </div>
          <BottomNav tab={tab} setTab={t=>{setTab(t);setPView("main");}}/>
        </div>
      );

      // SETTINGS
      if(pView==="settings")return(
        <div style={WRAP}>
          <Toast msg={toast}/>
          <TopBar onBack={()=>{setPView("main");setConfirmDelete(false);}} title="Settings"/>
          <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
            <div style={{padding:"16px 16px 6px"}}><div style={{fontSize:11,fontWeight:700,color:C.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.b}}>Account</div></div>
            <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:16,margin:"8px 16px 14px",overflow:"hidden"}}>
              <SettingRow emoji="✏️" label="Edit profile" sub="Name, phone, camp, platoon" onClick={()=>{setEditName(userName);setEditPhone(phone);setEditPlatoon(platoon);setEditCamp(camp);setPView("editprofile");}}/>
              <SettingRow emoji="🏕️" label="Camp" sub={camp.split("—")[1]?.trim()||camp}/>
              <SettingRow emoji="⚔️" label="Platoon" sub={platoon}/>
              <SettingRow emoji="📱" label="Phone" sub={phone.length===11?`${phone.slice(0,4)}****${phone.slice(-3)}`:"—"}/>
            </div>
            <div style={{padding:"4px 16px 6px"}}><div style={{fontSize:11,fontWeight:700,color:C.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.b}}>Notifications</div></div>
            <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:16,margin:"8px 16px 14px",overflow:"hidden"}}>
              <SettingRow emoji="🔔" label="Swap match alerts"
                sub={notifGranted?"On — you'll be notified when your size is posted":"Get alerted when someone posts the size you need"}
                right={notifGranted
                  ?<Tag variant="done">On</Tag>
                  :<button onClick={requestNotifications} style={{padding:"6px 12px",borderRadius:8,border:"none",background:C.olive,color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.b}}>Enable</button>
                }
              />
              <SettingRow emoji="📩" label="Swap request alerts" sub="In-app banner when someone requests your listing" right={<Tag variant="done">On</Tag>}/>
            </div>
            <div style={{padding:"4px 16px 6px"}}><div style={{fontSize:11,fontWeight:700,color:C.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.b}}>Privacy</div></div>
            <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:16,margin:"8px 16px 14px",overflow:"hidden"}}>
              <SettingRow emoji="👥" label="Show platoon on listings" right={<Toggle on={showPlatoon} onToggle={()=>setShowPlatoon(v=>!v)}/>}/>
              <SettingRow emoji="🔒" label="Number visibility" sub="Shown only when someone requests your swap"/>
            </div>
            <div style={{padding:"4px 16px 6px"}}><div style={{fontSize:11,fontWeight:700,color:C.inkLight,letterSpacing:"0.07em",textTransform:"uppercase",fontFamily:F.b}}>Support</div></div>
            <div style={{background:C.white,border:`0.5px solid ${C.border}`,borderRadius:16,margin:"8px 16px 14px",overflow:"hidden"}}>
              <SettingRow emoji="🚩" label="Report a listing" sub="Flag fake or misleading posts" onClick={()=>window.open("mailto:subeyeapp@gmail.com?subject=Report a listing","_blank")}/>
              <SettingRow emoji="💬" label="Send feedback" sub="subeyeapp@gmail.com" onClick={()=>window.open("mailto:subeyeapp@gmail.com?subject=SwapKit feedback","_blank")}/>
              <SettingRow emoji="📄" label="Privacy policy" onClick={()=>alert("Privacy policy coming soon.")}/>
            </div>
            <div style={{margin:"0 16px 24px"}}>
              {!confirmDelete
                ?<button onClick={()=>setConfirmDelete(true)} style={{width:"100%",padding:"13px",borderRadius:14,border:`0.5px solid ${C.red}44`,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:F.b,background:C.redFaint,color:C.red}}>Delete account</button>
                :<div style={{background:C.redFaint,border:`0.5px solid ${C.red}44`,borderRadius:14,padding:"16px"}}>
                  <div style={{fontSize:14,fontWeight:700,color:C.red,fontFamily:F.b,marginBottom:6}}>Are you sure?</div>
                  <div style={{fontSize:12,color:C.red,fontFamily:F.b,marginBottom:14,lineHeight:1.5}}>This permanently deletes your account and all listings. Cannot be undone.</div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={()=>setConfirmDelete(false)} style={{flex:1,padding:"11px",borderRadius:12,border:`0.5px solid ${C.border}`,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:F.b,background:C.white,color:C.inkMid}}>Cancel</button>
                    <button onClick={handleDeleteAccount} style={{flex:1,padding:"11px",borderRadius:12,border:"none",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:F.b,background:C.red,color:C.white}}>Yes, delete</button>
                  </div>
                </div>
              }
            </div>
          </div>
          <BottomNav tab={tab} setTab={t=>{setTab(t);setPView("main");}}/>
        </div>
      );

      // MY LISTINGS
      if(pView==="mylistings")return(
        <div style={WRAP}>
          <Toast msg={toast}/>
          <TopBar onBack={()=>setPView("main")} title="My listings"/>
          <div style={{flex:1,padding:"14px 16px 90px",overflowY:"auto"}}>
            {myListings.length===0?(
              <div style={{textAlign:"center",padding:"52px 24px",color:C.inkLight}}>
                <div style={{fontSize:40,marginBottom:12}}>📋</div>
                <div style={{fontSize:15,fontWeight:700,color:C.inkMid,fontFamily:F.s,marginBottom:6}}>No listings yet</div>
                <div style={{fontSize:13,fontFamily:F.b}}>Your swap posts will appear here.</div>
              </div>
            ):myListings.map(l=><ListingCard key={l.id} listing={l} onTap={l=>{setSelected(l);setScreen("detail");}}/>)}
          </div>
          <BottomNav tab={tab} setTab={t=>{setTab(t);setPView("main");}}/>
        </div>
      );

      // PROFILE MAIN
      return(
        <div style={WRAP}>
          <Toast msg={toast}/>
          <div style={{background:C.white,borderBottom:`0.5px solid ${C.border}`,padding:"14px 18px",flexShrink:0}}>
            <span style={{fontFamily:F.s,fontWeight:700,fontSize:20,color:C.olive}}>Swap<span style={{color:C.gold}}>Kit</span></span>
          </div>
          <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
            <div style={{background:C.olive,margin:16,borderRadius:20,padding:"24px 20px",position:"relative",overflow:"hidden"}}>
              <div style={{position:"absolute",top:-30,right:-30,width:120,height:120,borderRadius:"50%",background:C.gold+"18"}}/>
              <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:16}}>
                <Avatar name={userName||"You"} size={54}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:700,fontSize:18,color:C.white,fontFamily:F.b}}>{userName||"Corper"}</div>
                  <div style={{fontSize:12,color:C.gold,fontWeight:700,fontFamily:F.b,marginTop:2}}>{platoon}</div>
                  <div style={{fontSize:11,color:C.white+"77",fontFamily:F.b,marginTop:1}}>{camp.split("—")[1]?.trim()||camp}</div>
                </div>
                <button onClick={()=>{setEditName(userName);setEditPhone(phone);setEditPlatoon(platoon);setEditCamp(camp);setPView("editprofile");}} style={{background:C.white+"22",border:"none",borderRadius:10,padding:"7px 12px",color:C.white,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:F.b}}>Edit</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
                {[[activeCount,"Active"],[pendingCount,"Pending"],[doneCount,"Done"]].map(([n,l],i)=>(
                  <div key={i} style={{background:C.white+"14",borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <div style={{fontSize:20,fontWeight:800,color:C.gold,fontFamily:F.b}}>{n}</div>
                    <div style={{fontSize:10,color:C.white+"88",fontFamily:F.b,marginTop:2}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{margin:"0 16px",background:C.white,border:`0.5px solid ${C.border}`,borderRadius:18,overflow:"hidden",marginBottom:14}}>
              <SettingRow emoji="📋" label="My listings" sub="View and manage your swap posts" onClick={()=>setPView("mylistings")}/>
              <SettingRow emoji="⚙️" label="Settings" sub="Privacy, notifications and account" onClick={()=>setPView("settings")}/>
              <SettingRow emoji="ℹ️" label="About SwapKit" sub="Our story and how it works" onClick={()=>setPView("about")}/>
            </div>
            <div style={{margin:"0 16px"}}><InlineAd/></div>
            <div style={{margin:"12px 16px 0",fontSize:11,color:C.inkLight,textAlign:"center",fontFamily:F.b,lineHeight:1.6}}>SwapKit v1.1 · Made for Nigerian corpers 🇳🇬<br/>subeyeapp@gmail.com</div>
          </div>
          <BottomNav tab={tab} setTab={setTab}/>
        </div>
      );
    }
  }

  // ══ POST ═══════════════════════════════════════════════════════════════════
  if(screen==="post")return(
    <div style={WRAP}>
      <Toast msg={toast}/>
      <TopBar onBack={()=>step>1?setStep(s=>s-1):setScreen("main")} title="Post a swap" steps step={step}/>
      <div style={{flex:1,padding:"22px 18px 160px",overflowY:"auto"}}>
        {step===1&&<>
          <div style={{fontFamily:F.s,fontWeight:700,fontSize:21,color:C.ink,marginBottom:4}}>What are you swapping?</div>
          <div style={{fontSize:13,color:C.inkLight,marginBottom:20,lineHeight:1.55,fontFamily:F.b}}>Add one or more items. Each needs the size you have and the size you want.</div>
          {postItems.map((pItem,idx)=>(
            <div key={idx}>
              {idx>0&&<InlineAd/>}
              <ItemRow pItem={pItem} idx={idx} onChange={updateItem} onRemove={()=>setPostItems(prev=>prev.filter((_,i)=>i!==idx))} canRemove={postItems.length>1}/>
            </div>
          ))}
          {postItems.length<4&&<button onClick={()=>setPostItems(prev=>[...prev,newItem()])} style={{width:"100%",padding:"13px",borderRadius:13,border:`2px dashed ${C.goldBorder}`,background:C.goldFaint,fontSize:13,fontWeight:700,color:C.goldDark,cursor:"pointer",fontFamily:F.b,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>+ Add another item</button>}
        </>}
        {step===2&&<>
          <div style={{fontFamily:F.s,fontWeight:700,fontSize:21,color:C.ink,marginBottom:4}}>Your platoon</div>
          <div style={{fontSize:13,color:C.inkLight,marginBottom:20,lineHeight:1.55,fontFamily:F.b}}>Helps corpers find you in camp.</div>
          <label style={LBL}>Platoon</label>
          <select value={postPlat||platoon} onChange={e=>setPostPlat(e.target.value)} style={{...SEL(!!(postPlat||platoon)),marginBottom:16}}>
            <option value="">Select platoon...</option>
            {PLATOONS.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
          <div style={{background:C.goldFaint,border:`0.5px solid ${C.goldBorder}`,borderRadius:13,padding:"13px 14px",fontSize:12,color:C.goldDark,fontFamily:F.b,lineHeight:1.65,fontWeight:500,display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:18,flexShrink:0}}>🤝</span>
            <span>Corpers in the same platoon train and eat together — your platoon tag makes meetups easier.</span>
          </div>
        </>}
        {step===3&&<>
          <div style={{fontFamily:F.s,fontWeight:700,fontSize:21,color:C.ink,marginBottom:4}}>Add a photo</div>
          <div style={{fontSize:13,color:C.inkLight,marginBottom:16,lineHeight:1.55,fontFamily:F.b}}>Optional{postItems.length>1?` — lay all ${postItems.length} items side by side and snap one photo`:""}. Helps others trust your listing.</div>
          <PhotoBox image={postImg} onChange={(base64,file)=>{setPostImg(base64);setPostFile(file);}} itemCount={postItems.length}/>
          {postImg&&<div style={{marginTop:10,fontSize:13,color:C.olive,fontWeight:700,textAlign:"center",fontFamily:F.b}}>✓ Photo added — looking good!</div>}
        </>}
      </div>
      <BottomBar>
        {step<3
          ?<PBtn disabled={step===1&&!allValid} onClick={()=>setStep(s=>s+1)}>Continue →</PBtn>
          :<div style={{display:"flex",flexDirection:"column",gap:8}}>
            <PBtn disabled={loading} onClick={postListing}>{loading?"Posting...":"Post listing ✓"}</PBtn>
            {!postImg&&<button onClick={postListing} disabled={loading} style={{background:"none",border:"none",fontSize:13,color:C.inkLight,cursor:"pointer",fontFamily:F.b,padding:"6px 0",fontWeight:600,textAlign:"center"}}>Skip photo — post without one</button>}
          </div>
        }
      </BottomBar>
    </div>
  );

  return null;
}