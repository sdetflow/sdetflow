"use client";

import type { SiteContent } from "@/lib/types";
import {
  ArrowUpRight, BrainCircuit, CloudCog, Gauge, Github, Linkedin, Mail,
  Sparkles, Workflow, Instagram, ExternalLink
} from "lucide-react";

const iconMap: Record<string, any> = { BrainCircuit, CloudCog, Gauge, Workflow };

function SmartLink(props: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  const { href, children, className = "", ...rest } = props;
  const external = href.startsWith("http") || href.startsWith("mailto:");
  return <a {...rest} className={className} href={href} target={external && !href.startsWith("mailto:") ? "_blank" : undefined} rel="noreferrer">{children}</a>;
}

function SocialIcon({ label }: { label: string }) {
  const key = label.toLowerCase();
  if (key.includes("linkedin")) return <Linkedin size={18}/>;
  if (key.includes("github")) return <Github size={18}/>;
  if (key.includes("instagram")) return <Instagram size={18}/>;
  if (key.includes("email")) return <Mail size={18}/>;
  return <ExternalLink size={18}/>;
}

export default function SiteShell({ content }: { content: SiteContent }) {
  const style = {
    "--accent": content.theme.accent,
    "--accent-2": content.theme.accent2,
    "--bg": content.theme.background,
    "--surface": content.theme.surface,
    "--hero-image": content.theme.heroImage ? `url("${content.theme.heroImage}")` : "none"
  } as React.CSSProperties;

  return <div style={style}>
    <header className="topbar">
      <SmartLink href="#" className="brand"><span>SG</span><b>.</b></SmartLink>
      <nav>{content.nav.map((item) => <SmartLink key={item.label} href={item.href}>{item.label}</SmartLink>)}</nav>
      <div className="social-mini">
        {content.socials.filter(x=>x.url).slice(0,4).map(x => <SmartLink key={x.label} href={x.url} className="icon-link" aria-label={x.label}><SocialIcon label={x.label}/></SmartLink>)}
      </div>
    </header>

    <main>
      <section className="hero shell" id="home">
        <div className="hero-glow" />
        <div className="hero-copy-wrap">
          <p className="eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <div className="hero-highlight"><Sparkles size={18}/>{content.hero.highlight}</div>
          <p className="lead">{content.hero.body}</p>
          <div className="actions">
            <SmartLink href={content.hero.primaryCta.url} className="btn primary">{content.hero.primaryCta.label}<ArrowUpRight size={17}/></SmartLink>
            <SmartLink href={content.hero.secondaryCta.url} className="btn ghost">{content.hero.secondaryCta.label}</SmartLink>
          </div>
          <div className="stats">
            {content.hero.stats.map(s => <div className="stat" key={s.label}><strong>{s.value}</strong><span>{s.label}</span></div>)}
          </div>
        </div>

        <div className="hero-panel" aria-label="SDETFlow quality engineering focus">
          <div className="panel-kicker">SDETFlow // Engineering System</div>
          <div className="signal-row">
            <span className="signal live">OPEN SOURCE</span>
            <span className="signal">GENAI</span>
            <span className="signal">AGENTIC AI</span>
          </div>
          <div className="terminal">
            <div className="terminal-head"><span/><span/><span/></div>
            <div className="terminal-body">
              <p><em>01</em> deterministic automation</p>
              <p><em>02</em> reusable libraries & SDKs</p>
              <p><em>03</em> test intelligence & diagnostics</p>
              <p><em>04</em> governed AI tool orchestration</p>
              <p><em>05</em> human approval for sensitive actions</p>
            </div>
          </div>
          <div className="mini-grid">
            <div><b>npm</b><span>TypeScript</span></div>
            <div><b>Maven</b><span>Java</span></div>
            <div><b>RubyGems</b><span>Ruby</span></div>
            <div><b>CI/CD</b><span>Release-ready</span></div>
          </div>
        </div>
      </section>

      <section className="ticker">
        <div>PLAYWRIGHT</div><span>•</span><div>SELENIUM</div><span>•</span><div>API</div><span>•</span><div>PERFORMANCE</div><span>•</span><div>GENAI</div><span>•</span><div>AGENTIC AI</div><span>•</span><div>CI/CD</div>
      </section>

      <section className="shell section" id="work">
        <div className="section-heading">
          <p className="eyebrow">Engineering focus</p>
          <h2>{content.innovation.title}</h2>
          <p>{content.innovation.body}</p>
        </div>
        <div className="capability-grid">
          {content.capabilities.map(c => {
            const Icon = iconMap[c.icon] || Workflow;
            return <article className="capability" key={c.title}><Icon/><h3>{c.title}</h3><p>{c.description}</p></article>
          })}
        </div>
        <div className="principle-rail">
          {content.innovation.points.map((p,i)=><div key={p}><span>{String(i+1).padStart(2,"0")}</span><p>{p}</p></div>)}
        </div>
      </section>

      <section className="shell section" id="sdetflow">
        <div className="section-heading split-heading">
          <div><p className="eyebrow">Creator & Maintainer</p><h2>SDETFlow</h2></div>
          <p>Public engineering artifacts across TypeScript/JavaScript, Java, and Ruby — with deterministic automation at the core and AI where it adds measurable value.</p>
        </div>
        <div className="project-grid">
          {content.projects.map((p) => <article className={p.featured ? "project featured" : "project"} key={p.title}>
            <p className="project-eyebrow">{p.eyebrow}</p>
            <h3>{p.title}</h3>
            <p>{p.description}</p>
            <div className="tags">{p.tags.map(t=><span key={t}>{t}</span>)}</div>
            <div className="project-links">{p.links.filter(x=>x.url).map(l=><SmartLink href={l.url} key={l.label}>{l.label}<ArrowUpRight size={15}/></SmartLink>)}</div>
          </article>)}
        </div>
      </section>

      <section className="shell section" id="experience">
        <div className="section-heading">
          <p className="eyebrow">Selected experience</p>
          <h2>Enterprise engineering, architecture, and automation transformation.</h2>
        </div>
        <div className="timeline">
          {content.experience.map((e,i)=><article className="timeline-row" key={e.company}>
            <div className="timeline-index">{String(i+1).padStart(2,"0")}</div>
            <div className="timeline-main"><div className="timeline-title"><h3>{e.company}</h3><span>{e.period}</span></div><p className="muted-line">{e.role} · {e.context}</p><ul>{e.highlights.map(h=><li key={h}>{h}</li>)}</ul></div>
          </article>)}
        </div>
      </section>

      <section className="shell section about" id="about">
        <div>
          <p className="eyebrow">About</p>
          <h2>{content.about.title}</h2>
        </div>
        <div className="about-copy">
          {content.about.body.map(p=><p key={p}>{p}</p>)}
          <blockquote>{content.about.mindset}</blockquote>
        </div>
      </section>

      <section className="shell contact">
        <p className="eyebrow">{content.contact.eyebrow}</p>
        <h2>{content.contact.title}</h2>
        <p>{content.contact.body}</p>
        <SmartLink href={`mailto:${content.identity.email}`} className="btn primary">{content.contact.buttonLabel}<Mail size={17}/></SmartLink>
      </section>
    </main>

    <footer className="shell footer">
      <div><b>{content.identity.name}</b><span>{content.identity.role} · {content.identity.secondaryRole}</span></div>
      <div className="footer-links">{content.socials.filter(x=>x.url).map(x=><SmartLink key={x.label} href={x.url}>{x.label}</SmartLink>)}</div>
    </footer>
  </div>;
}
