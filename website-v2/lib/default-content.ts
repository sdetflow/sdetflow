import type { SiteContent } from "./types";

export const defaultContent: SiteContent = {
  seo: {
    title: "Sumanth Gumedelli | Senior SDET, QA Automation Architect & Creator of SDETFlow",
    description: "Senior SDET and QA Automation Architect building reusable automation platforms, open-source Quality Engineering libraries, GenAI tools, and governed Agentic AI workflows.",
    ogImage: ""
  },
  identity: {
    name: "Sumanth Gumedelli",
    role: "Senior SDET",
    secondaryRole: "QA Automation Architect",
    location: "Dallas–Fort Worth, Texas",
    email: "sumantthh@gmail.com"
  },
  socials: [
    { label: "LinkedIn", url: "https://www.linkedin.com/in/sumanth-gumedelli-ba763191/" },
    { label: "GitHub", url: "https://github.com/sdetflow/sdetflow" },
    { label: "SDETFlow", url: "https://sdetflow.github.io/sdetflow/" },
    { label: "Instagram", url: "" }
  ],
  nav: [
    { label: "Work", href: "#work" },
    { label: "SDETFlow", href: "#sdetflow" },
    { label: "Experience", href: "#experience" },
    { label: "About", href: "#about" }
  ],
  hero: {
    eyebrow: "Senior SDET · QA Automation Architect · Open Source Builder",
    title: "Engineering quality systems that teams can actually reuse.",
    highlight: "Creator of SDETFlow",
    body: "14+ years across test automation, architecture, performance, API, CI/CD, accessibility, and enterprise Quality Engineering — now extending that foundation with GenAI and governed Agentic AI.",
    primaryCta: { label: "Explore SDETFlow", url: "#sdetflow" },
    secondaryCta: { label: "View GitHub", url: "https://github.com/sdetflow/sdetflow" },
    stats: [
      { value: "14+", label: "Years in software & quality engineering" },
      { value: "5", label: "Public multi-language SDETFlow packages" },
      { value: "UI · API · Mobile", label: "Automation architecture" }
    ]
  },
  innovation: {
    title: "Build once. Reuse everywhere.",
    body: "My strongest work is not a test script — it is the engineering system around the test: architecture, reusable libraries, diagnostics, CI/CD, observability, and increasingly AI-assisted quality workflows.",
    points: [
      "Deterministic automation first; AI is additive, not a hard dependency.",
      "Provider-agnostic GenAI with routing, fallback, budgets, privacy controls, and human approval.",
      "Public packages across npm, Maven Central, and RubyGems with consumer smoke verification.",
      "Frameworks and utilities designed for adoption by teams, not just demos."
    ]
  },
  capabilities: [
    { title: "Automation Architecture", description: "Playwright, Selenium, WebDriverIO, Appium, Cucumber, Karate, reusable framework design and end-to-end engineering.", icon: "Workflow" },
    { title: "GenAI & Agentic AI", description: "LLM integration, tool calling, model routing, governed agents, failure analysis, privacy controls and human-in-the-loop workflows.", icon: "BrainCircuit" },
    { title: "API & Performance", description: "REST automation, Rest Assured, MuleSoft, JMeter, LoadRunner, diagnostics, backend validation and performance engineering.", icon: "Gauge" },
    { title: "CI/CD & Cloud", description: "GitHub, GitLab, Jenkins, Bamboo, Nexus, Sauce Labs, Kubernetes, AWS and delivery-pipeline integration.", icon: "CloudCog" }
  ],
  projects: [
    {
      title: "SDETFlow AI",
      eyebrow: "GenAI + Agentic AI",
      description: "Provider-agnostic Quality Engineering AI toolkit with OpenAI and Gemini adapters, model routing and fallback, failure triage, log analysis, privacy redaction, cost controls, registered tools, execution limits, and human approval gates.",
      tags: ["GenAI", "Agentic AI", "OpenAI", "Gemini", "Human-in-the-loop"],
      links: [
        { label: "AI landing page", url: "https://sdetflow.github.io/sdetflow/ai.html" },
        { label: "Source", url: "https://github.com/sdetflow/sdetflow/tree/main/packages/ai" }
      ],
      featured: true
    },
    {
      title: "SDETFlow Playwright",
      eyebrow: "Browser automation",
      description: "Reusable Playwright engineering for deterministic locator fallback, diagnostics, evidence capture, retries, test data, telemetry, and optional AI-assisted analysis.",
      tags: ["Playwright", "TypeScript", "Diagnostics", "CI/CD"],
      links: [{ label: "Project page", url: "https://sdetflow.github.io/sdetflow/playwright.html" }]
    },
    {
      title: "SDETFlow Insights",
      eyebrow: "Test intelligence",
      description: "Normalized results, explainable flaky-test scoring, recurring failure clustering, run summaries, trends, and a foundation for actionable quality analytics.",
      tags: ["Analytics", "Flakiness", "Failure clusters", "Reporting"],
      links: [{ label: "Project page", url: "https://sdetflow.github.io/sdetflow/insights.html" }]
    },
    {
      title: "SDETFlow Java API SDK",
      eyebrow: "Java",
      description: "Java 17 API automation SDK with authentication strategies, safe retries, JSON assertions, telemetry, and lightweight contract validation.",
      tags: ["Java", "API", "Maven Central", "Retries"],
      links: [{ label: "Project page", url: "https://sdetflow.github.io/sdetflow/java-api.html" }]
    },
    {
      title: "SDETFlow Ruby",
      eyebrow: "Ruby",
      description: "Reusable Ruby Quality Engineering utilities for API automation, retries, redaction, JSON assertions, and framework-neutral integration with Capybara and Watir-style suites.",
      tags: ["Ruby", "RubyGems", "API", "Capybara", "Watir"],
      links: [{ label: "Project page", url: "https://sdetflow.github.io/sdetflow/ruby.html" }]
    }
  ],
  experience: [
    {
      company: "Fannie Mae",
      role: "Senior SDET",
      period: "2026 – Present",
      context: "Financial Services · PropertyDataRunner",
      highlights: [
        "Automation transformation and legacy-framework modernization.",
        "Reusable end-to-end Quality Engineering architecture and delivery improvements."
      ]
    },
    {
      company: "Charles Schwab",
      role: "SDET",
      period: "2024 – 2026",
      context: "Financial Services · Disruptors",
      highlights: [
        "Re-architected WebDriverIO automation using TypeScript and reusable Page Object Model design.",
        "Integrated accessibility, database validation, reporting, Bamboo/Nexus/Sauce Labs CI/CD, and team enablement."
      ]
    },
    {
      company: "AT&T",
      role: "SDET",
      period: "2022 – 2024",
      context: "Telecommunications · C360 / Customer Connect",
      highlights: [
        "Java/Rest Assured and MuleSoft API automation architecture across PAPI/SAPI/EAPI layers.",
        "Reusable utilities, JMeter performance testing, pipeline automation, and team adoption."
      ]
    },
    {
      company: "Dell Technologies",
      role: "Senior Software Engineer · R&D / CoE",
      period: "2019 – 2022",
      context: "Enterprise Engineering",
      highlights: [
        "Reusable C#/SpecFlow/Selenium/API automation architecture, UiPath, GitLab CI, Sauce Labs, AWS and PowerShell tooling.",
        "Cross-team framework adoption, automation standards, technical problem solving, and mentoring."
      ]
    }
  ],
  about: {
    title: "Senior test engineering with a builder’s mindset.",
    body: [
      "Software Automation Testing is my strongest area, but my work has evolved far beyond writing automated test cases. Across CoE, R&D, and enterprise programs, I have focused on reusable automation architecture, engineering utilities, CI/CD integration, mentoring, and quality strategy.",
      "My current focus includes Generative AI and Agentic AI for Quality Engineering — AI-assisted testing, intelligent diagnostics, failure analysis, LLM integration, tool calling, model routing, privacy controls, human-in-the-loop approvals, and developer productivity."
    ],
    mindset: "I believe almost every problem can be cracked. Most systems were designed by people like us — understand the rules, logic, and constraints, and there is usually a way through."
  },
  contact: {
    eyebrow: "Connect",
    title: "Building quality engineering that scales beyond one project.",
    body: "Open to Senior SDET, QA Automation Architect, Quality Engineering, platform, open-source, and AI-enabled testing conversations.",
    buttonLabel: "Email Sumanth"
  },
  theme: {
    accent: "#35f2b1",
    accent2: "#42b8ff",
    background: "#06111f",
    surface: "#0b1b2c",
    heroImage: ""
  }
};
