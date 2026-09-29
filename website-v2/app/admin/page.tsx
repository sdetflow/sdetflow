"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { defaultContent } from "@/lib/default-content";
import type { SiteContent, LinkItem, Project, Experience } from "@/lib/types";
import { LogOut, Save, Plus, Trash2, ArrowUp, ArrowDown, ExternalLink } from "lucide-react";
import "./admin.css";

type Tab = "profile"|"hero"|"social"|"innovation"|"projects"|"experience"|"seo"|"theme"|"advanced";

const supabase = getSupabase();

function Field({ label, value, onChange, textarea=false }: { label:string; value:string; onChange:(v:string)=>void; textarea?:boolean }) {
  return <label className="admin-field"><span>{label}</span>{textarea ? <textarea value={value} onChange={e=>onChange(e.target.value)} rows={4}/> : <input value={value} onChange={e=>onChange(e.target.value)}/>}</label>
}

function ListEditor({ items, onChange, placeholder="Item" }: { items:string[]; onChange:(v:string[])=>void; placeholder?:string }) {
  const move=(i:number,d:number)=>{const n=[...items]; const j=i+d;if(j<0||j>=n.length)return;[n[i],n[j]]=[n[j],n[i]];onChange(n)};
  return <div className="stack">{items.map((v,i)=><div className="row-edit" key={i}><input value={v} placeholder={placeholder} onChange={e=>{const n=[...items];n[i]=e.target.value;onChange(n)}}/><button onClick={()=>move(i,-1)}><ArrowUp size={15}/></button><button onClick={()=>move(i,1)}><ArrowDown size={15}/></button><button onClick={()=>onChange(items.filter((_,x)=>x!==i))}><Trash2 size={15}/></button></div>)}<button className="admin-secondary" onClick={()=>onChange([...items,""])}><Plus size={15}/>Add item</button></div>
}

export default function AdminPage(){
  const [content,setContent]=useState<SiteContent>(defaultContent);
  const [tab,setTab]=useState<Tab>("profile");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [session,setSession]=useState<any>(null);
  const [message,setMessage]=useState("");
  const [saving,setSaving]=useState(false);
  const [rawJson,setRawJson]=useState("");

  useEffect(()=>{
    if(!supabase) return;
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const {data:sub}=supabase.auth.onAuthStateChange((_e,s)=>setSession(s));
    return ()=>sub.subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(tab==="advanced") setRawJson(JSON.stringify(content,null,2));
  },[tab]);

  useEffect(()=>{
    if(!session||!supabase)return;
    supabase.from("site_content").select("content").eq("id","main").maybeSingle().then(({data})=>{
      if(data?.content)setContent({...defaultContent,...data.content} as SiteContent);
    });
  },[session]);

  const save=async()=>{
    if(!supabase)return setMessage("Supabase is not configured.");
    setSaving(true);setMessage("");
    const {error}=await supabase.from("site_content").upsert({id:"main",content,updated_at:new Date().toISOString()});
    setSaving(false);
    setMessage(error?error.message:"Saved. Public site will use the updated content.");
  };

  const login=async(e:React.FormEvent)=>{
    e.preventDefault();
    if(!supabase)return setMessage("Add Supabase environment variables first.");
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error)setMessage(error.message);
  };

  if(!session) return <main className="admin-login"><form onSubmit={login} className="login-card"><p className="eyebrow">SDETFlow Admin</p><h1>Content control center.</h1><p>Edit the portfolio without touching code.</p><Field label="Email" value={email} onChange={setEmail}/><label className="admin-field"><span>Password</span><input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="admin-primary" type="submit">Sign in</button>{message&&<p className="admin-message">{message}</p>}</form></main>;

  const updateSocial=(i:number,k:keyof LinkItem,v:string)=>{const n=[...content.socials];n[i]={...n[i],[k]:v};setContent({...content,socials:n})};
  const moveArray=<T,>(a:T[],i:number,d:number)=>{const n=[...a],j=i+d;if(j<0||j>=n.length)return a;[n[i],n[j]]=[n[j],n[i]];return n};

  return <main className="admin-shell">
    <aside className="admin-side"><div><p className="eyebrow">SDETFlow Admin</p><h2>Website Editor</h2></div>{(["profile","hero","social","innovation","projects","experience","seo","theme","advanced"] as Tab[]).map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>)}<a href="/" target="_blank">Open website <ExternalLink size={14}/></a><button onClick={()=>supabase?.auth.signOut()}><LogOut size={14}/>Sign out</button></aside>
    <section className="admin-main">
      <div className="admin-toolbar"><div><h1>{tab[0].toUpperCase()+tab.slice(1)}</h1><p>Every value here is stored in the admin-managed site content.</p></div><button className="admin-primary" onClick={save} disabled={saving}><Save size={16}/>{saving?"Saving...":"Save changes"}</button></div>
      {message&&<div className="admin-message">{message}</div>}
      <div className="admin-card">
        {tab==="profile"&&<div className="admin-grid"><Field label="Name" value={content.identity.name} onChange={v=>setContent({...content,identity:{...content.identity,name:v}})}/><Field label="Primary role" value={content.identity.role} onChange={v=>setContent({...content,identity:{...content.identity,role:v}})}/><Field label="Secondary role" value={content.identity.secondaryRole} onChange={v=>setContent({...content,identity:{...content.identity,secondaryRole:v}})}/><Field label="Location" value={content.identity.location} onChange={v=>setContent({...content,identity:{...content.identity,location:v}})}/><Field label="Email" value={content.identity.email} onChange={v=>setContent({...content,identity:{...content.identity,email:v}})}/><Field label="About title" value={content.about.title} onChange={v=>setContent({...content,about:{...content.about,title:v}})}/><Field label="Mindset quote" value={content.about.mindset} textarea onChange={v=>setContent({...content,about:{...content.about,mindset:v}})}/><div className="full"><span className="admin-label">About paragraphs</span><ListEditor items={content.about.body} onChange={v=>setContent({...content,about:{...content.about,body:v}})}/></div></div>}
        {tab==="hero"&&<div className="admin-grid"><Field label="Eyebrow" value={content.hero.eyebrow} onChange={v=>setContent({...content,hero:{...content.hero,eyebrow:v}})}/><Field label="Headline" value={content.hero.title} textarea onChange={v=>setContent({...content,hero:{...content.hero,title:v}})}/><Field label="Highlight pill" value={content.hero.highlight} onChange={v=>setContent({...content,hero:{...content.hero,highlight:v}})}/><Field label="Intro body" value={content.hero.body} textarea onChange={v=>setContent({...content,hero:{...content.hero,body:v}})}/><Field label="Primary CTA label" value={content.hero.primaryCta.label} onChange={v=>setContent({...content,hero:{...content.hero,primaryCta:{...content.hero.primaryCta,label:v}}})}/><Field label="Primary CTA URL" value={content.hero.primaryCta.url} onChange={v=>setContent({...content,hero:{...content.hero,primaryCta:{...content.hero.primaryCta,url:v}}})}/><Field label="Secondary CTA label" value={content.hero.secondaryCta.label} onChange={v=>setContent({...content,hero:{...content.hero,secondaryCta:{...content.hero.secondaryCta,label:v}}})}/><Field label="Secondary CTA URL" value={content.hero.secondaryCta.url} onChange={v=>setContent({...content,hero:{...content.hero,secondaryCta:{...content.hero.secondaryCta,url:v}}})}/></div>}
        {tab==="social"&&<div className="stack">{content.socials.map((s,i)=><div className="social-edit" key={i}><Field label="Network" value={s.label} onChange={v=>updateSocial(i,"label",v)}/><Field label="URL" value={s.url} onChange={v=>updateSocial(i,"url",v)}/><button onClick={()=>setContent({...content,socials:content.socials.filter((_,x)=>x!==i)})}><Trash2 size={16}/></button></div>)}<button className="admin-secondary" onClick={()=>setContent({...content,socials:[...content.socials,{label:"New link",url:""}]})}><Plus size={15}/>Add social link</button></div>}
        {tab==="innovation"&&<div className="admin-grid"><Field label="Section title" value={content.innovation.title} onChange={v=>setContent({...content,innovation:{...content.innovation,title:v}})}/><Field label="Section body" value={content.innovation.body} textarea onChange={v=>setContent({...content,innovation:{...content.innovation,body:v}})}/><div className="full"><span className="admin-label">Principles / contributions</span><ListEditor items={content.innovation.points} onChange={v=>setContent({...content,innovation:{...content.innovation,points:v}})}/></div><div className="full"><span className="admin-label">Capabilities</span>{content.capabilities.map((c,i)=><div className="nested-card" key={i}><Field label="Title" value={c.title} onChange={v=>{const n=[...content.capabilities];n[i]={...n[i],title:v};setContent({...content,capabilities:n})}}/><Field label="Description" value={c.description} textarea onChange={v=>{const n=[...content.capabilities];n[i]={...n[i],description:v};setContent({...content,capabilities:n})}}/><Field label="Icon key (Workflow, BrainCircuit, Gauge, CloudCog)" value={c.icon} onChange={v=>{const n=[...content.capabilities];n[i]={...n[i],icon:v};setContent({...content,capabilities:n})}}/></div>)}</div></div>}
        {tab==="projects"&&<div className="stack">{content.projects.map((p,i)=><div className="nested-card" key={i}><div className="nested-toolbar"><b>Project {i+1}</b><span/><button onClick={()=>setContent({...content,projects:moveArray(content.projects,i,-1)})}><ArrowUp size={15}/></button><button onClick={()=>setContent({...content,projects:moveArray(content.projects,i,1)})}><ArrowDown size={15}/></button><button onClick={()=>setContent({...content,projects:content.projects.filter((_,x)=>x!==i)})}><Trash2 size={15}/></button></div><Field label="Title" value={p.title} onChange={v=>{const n=[...content.projects];n[i]={...n[i],title:v};setContent({...content,projects:n})}}/><Field label="Eyebrow" value={p.eyebrow} onChange={v=>{const n=[...content.projects];n[i]={...n[i],eyebrow:v};setContent({...content,projects:n})}}/><Field label="Description" value={p.description} textarea onChange={v=>{const n=[...content.projects];n[i]={...n[i],description:v};setContent({...content,projects:n})}}/><span className="admin-label">Tags</span><ListEditor items={p.tags} onChange={v=>{const n=[...content.projects];n[i]={...n[i],tags:v};setContent({...content,projects:n})}}/></div>)}<button className="admin-secondary" onClick={()=>setContent({...content,projects:[...content.projects,{title:"New project",eyebrow:"Project",description:"",tags:[],links:[]}]})}><Plus size={15}/>Add project</button></div>}
        {tab==="experience"&&<div className="stack">{content.experience.map((e,i)=><div className="nested-card" key={i}><div className="nested-toolbar"><b>{e.company||`Experience ${i+1}`}</b><span/><button onClick={()=>setContent({...content,experience:moveArray(content.experience,i,-1)})}><ArrowUp size={15}/></button><button onClick={()=>setContent({...content,experience:moveArray(content.experience,i,1)})}><ArrowDown size={15}/></button><button onClick={()=>setContent({...content,experience:content.experience.filter((_,x)=>x!==i)})}><Trash2 size={15}/></button></div><div className="admin-grid"><Field label="Company" value={e.company} onChange={v=>{const n=[...content.experience];n[i]={...n[i],company:v};setContent({...content,experience:n})}}/><Field label="Role" value={e.role} onChange={v=>{const n=[...content.experience];n[i]={...n[i],role:v};setContent({...content,experience:n})}}/><Field label="Period" value={e.period} onChange={v=>{const n=[...content.experience];n[i]={...n[i],period:v};setContent({...content,experience:n})}}/><Field label="Context" value={e.context} onChange={v=>{const n=[...content.experience];n[i]={...n[i],context:v};setContent({...content,experience:n})}}/><div className="full"><span className="admin-label">Highlights</span><ListEditor items={e.highlights} onChange={v=>{const n=[...content.experience];n[i]={...n[i],highlights:v};setContent({...content,experience:n})}}/></div></div></div>)}<button className="admin-secondary" onClick={()=>setContent({...content,experience:[...content.experience,{company:"New company",role:"",period:"",context:"",highlights:[]}]})}><Plus size={15}/>Add experience</button></div>}
        {tab==="seo"&&<div className="admin-grid"><Field label="SEO title" value={content.seo.title} onChange={v=>setContent({...content,seo:{...content.seo,title:v}})}/><Field label="SEO description" value={content.seo.description} textarea onChange={v=>setContent({...content,seo:{...content.seo,description:v}})}/><Field label="Open Graph image URL" value={content.seo.ogImage} onChange={v=>setContent({...content,seo:{...content.seo,ogImage:v}})}/><Field label="Contact eyebrow" value={content.contact.eyebrow} onChange={v=>setContent({...content,contact:{...content.contact,eyebrow:v}})}/><Field label="Contact title" value={content.contact.title} onChange={v=>setContent({...content,contact:{...content.contact,title:v}})}/><Field label="Contact body" value={content.contact.body} textarea onChange={v=>setContent({...content,contact:{...content.contact,body:v}})}/><Field label="Contact button" value={content.contact.buttonLabel} onChange={v=>setContent({...content,contact:{...content.contact,buttonLabel:v}})}/></div>}
        {tab==="theme"&&<div className="admin-grid"><Field label="Accent color" value={content.theme.accent} onChange={v=>setContent({...content,theme:{...content.theme,accent:v}})}/><Field label="Secondary accent" value={content.theme.accent2} onChange={v=>setContent({...content,theme:{...content.theme,accent2:v}})}/><Field label="Background" value={content.theme.background} onChange={v=>setContent({...content,theme:{...content.theme,background:v}})}/><Field label="Surface" value={content.theme.surface} onChange={v=>setContent({...content,theme:{...content.theme,surface:v}})}/><Field label="Hero image URL" value={content.theme.heroImage} onChange={v=>setContent({...content,theme:{...content.theme,heroImage:v}})}/><div className="full theme-preview" style={{background:content.theme.background,borderColor:content.theme.accent}}><span style={{color:content.theme.accent}}>Primary accent</span><span style={{color:content.theme.accent2}}>Secondary accent</span></div></div>}
        {tab==="advanced"&&<div className="stack"><p className="admin-help">Advanced editor exposes the full website content object, including navigation, hero statistics, project links, featured flags, and any future fields.</p><textarea className="json-editor" value={rawJson} onChange={e=>setRawJson(e.target.value)} rows={34}/><button className="admin-secondary" onClick={()=>{try{setContent(JSON.parse(rawJson));setMessage("Advanced JSON applied locally. Click Save changes to publish.");}catch{setMessage("JSON is not valid. Fix the syntax before applying.");}}}>Apply JSON</button></div>}
      </div>
    </section>
  </main>
}
