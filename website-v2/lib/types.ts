export type LinkItem = { label: string; url: string };
export type StatItem = { value: string; label: string };
export type Capability = { title: string; description: string; icon: string };
export type Project = {
  title: string;
  eyebrow: string;
  description: string;
  tags: string[];
  links: LinkItem[];
  featured?: boolean;
};
export type Experience = {
  company: string;
  role: string;
  period: string;
  context: string;
  highlights: string[];
};
export type SiteContent = {
  seo: { title: string; description: string; ogImage: string };
  identity: {
    name: string;
    role: string;
    secondaryRole: string;
    location: string;
    email: string;
  };
  socials: LinkItem[];
  nav: { label: string; href: string }[];
  hero: {
    eyebrow: string;
    title: string;
    highlight: string;
    body: string;
    primaryCta: LinkItem;
    secondaryCta: LinkItem;
    stats: StatItem[];
  };
  innovation: {
    title: string;
    body: string;
    points: string[];
  };
  capabilities: Capability[];
  projects: Project[];
  experience: Experience[];
  about: {
    title: string;
    body: string[];
    mindset: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    buttonLabel: string;
  };
  theme: {
    accent: string;
    accent2: string;
    background: string;
    surface: string;
    heroImage: string;
  };
};
