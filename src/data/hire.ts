// data/hireData.ts
import {
  Users,
  Clock,
  Shield,
  BadgeCheck,
  Eye,
  Rocket,
  MessageSquare,
  Users2,
  TrendingUp,
  Calendar,
  TargetIcon,
  Trophy,
  Award,
  Headphones,
} from "lucide-react";

export const whyHireUs = [
  {
    title: "55+ Expert Engineers",
    description: "A diverse team of skilled developers, designers, and QA professionals with 5+ years average experience.",
    icon: "Users",
  },
  {
    title: "650+ Projects Delivered",
    description: "Proven track record of successful deliveries across 25+ countries for startups and enterprises.",
    icon: "Trophy",
  },
  {
    title: "ISO 9001:2015 Certified",
    description: "Certified quality management systems ensuring consistent, high-quality deliverables.",
    icon: "Award",
  },
  {
    title: "24/7 Support",
    description: "Round-the-clock support with dedicated account managers and technical teams.",
    icon: "Headphones",
  },
];

export const hireBenefits = [
  {
    title: "Dedicated Team",
    description: "Get a fully dedicated team of developers, designers, and project managers who work exclusively on your project with complete focus and commitment.",
    icon: "Users",
    stats: "55+ Experts Available",
  },
  {
    title: "Flexible Engagement",
    description: "Choose from hourly, monthly, or project-based engagement models. Scale your team up or down as your project requirements evolve.",
    icon: "Clock",
    stats: "Flexible Models",
  },
  {
    title: "Cost-Effective Solutions",
    description: "Access top-tier talent at competitive rates. Save up to 60% on development costs compared to hiring in Western markets.",
    icon: "Shield",
    stats: "60% Cost Savings",
  },
  {
    title: "Quality Assurance",
    description: "Rigorous testing, code reviews, and quality checks at every stage. We deliver bug-free, scalable, and secure solutions.",
    icon: "BadgeCheck",
    stats: "98% Client Retention",
  },
  {
    title: "Transparent Process",
    description: "Daily standups, weekly reports, and real-time project tracking. Full visibility into progress, challenges, and milestones.",
    icon: "Eye",
    stats: "100% Transparency",
  },
  {
    title: "Quick Onboarding",
    description: "Get started within 48 hours. We have pre-vetted developers ready to join your project immediately.",
    icon: "Rocket",
    stats: "48hr Onboarding",
  },
];

export const hireProcess = [
  {
    step: "01",
    title: "Share Your Requirements",
    desc: "Tell us about your project goals, technical needs, timeline, and budget. We'll analyze and prepare a tailored solution.",
    icon: "MessageSquare",
    details: ["Project Brief", "Technical Requirements", "Budget & Timeline"],
  },
  {
    step: "02",
    title: "Choose Your Team",
    desc: "We present a curated team of experts matching your requirements. You review profiles and select the perfect fit.",
    icon: "Users2",
    details: ["Team Selection", "Skill Matching", "Profile Reviews"],
  },
  {
    step: "03",
    title: "Onboard & Start",
    desc: "Seamless onboarding with NDA signing, project setup, and tool access. Your team starts delivering from day one.",
    icon: "Rocket",
    details: ["NDA & Contracts", "Project Setup", "Development Begins"],
  },
  {
    step: "04",
    title: "Scale As You Grow",
    desc: "Easily scale your team up or down based on project needs. Add new skills or resources at any time.",
    icon: "TrendingUp",
    details: ["Team Scaling", "Skill Expansion", "Continuous Delivery"],
  },
];

export const techStack = [
  { name: "React", icon: "⚛️", category: "frontend" },
  { name: "Next.js", icon: "▲", category: "frontend" },
  { name: "Vue.js", icon: "🟩", category: "frontend" },
  { name: "Angular", icon: "🅰️", category: "frontend" },
  { name: "TypeScript", icon: "📘", category: "frontend" },
  { name: "Node.js", icon: "🟢", category: "backend" },
  { name: "Python", icon: "🐍", category: "backend" },
  { name: "GraphQL", icon: "🔮", category: "backend" },
  { name: "AWS", icon: "☁️", category: "cloud" },
  { name: "Docker", icon: "🐳", category: "cloud" },
  { name: "MongoDB", icon: "🍃", category: "database" },
  { name: "PostgreSQL", icon: "🐘", category: "database" },
];

export const engagementModels = [
  {
    title: "Hourly",
    price: "$25-45",
    desc: "Flexible engagement for short-term tasks and maintenance.",
    features: [
      "No long-term commitment",
      "Pay for actual hours worked",
      "Weekly reporting",
      "Suitable for support & maintenance",
    ],
    icon: "Clock",
  },
  {
    title: "Monthly",
    price: "$3,000-8,000",
    desc: "Full-time dedication with predictable monthly billing.",
    features: [
      "160+ hours per month",
      "Dedicated team members",
      "Monthly sprint planning",
      "Regular progress reviews",
    ],
    icon: "Calendar",
  },
  {
    title: "Project-Based",
    price: "Custom Quote",
    desc: "Complete solution delivery with fixed scope and timeline.",
    features: [
      "Fixed price guarantee",
      "Clear deliverables",
      "Structured project plan",
      "Post-launch support",
    ],
    icon: "TargetIcon",
  },
];

export const faqs = [
  {
    q: "How quickly can I hire a developer?",
    a: "We can onboard developers within 48 hours. We maintain a pool of pre-vetted professionals ready to start immediately. The timeline depends on your specific requirements and the complexity of skills needed.",
  },
  {
    q: "What engagement models do you offer?",
    a: "We offer flexible engagement models: Hourly (for short-term tasks), Monthly (for full-time dedication), and Project-Based (for complete solution delivery). You can choose based on your budget and project requirements.",
  },
  {
    q: "How do you ensure quality?",
    a: "We follow rigorous quality assurance processes including code reviews, automated testing, manual QA, security audits, and performance optimization. Our ISO 9001:2015 certification ensures consistent quality standards.",
  },
  {
    q: "Can I scale my team up or down?",
    a: "Absolutely! You can scale your team at any time. We offer flexible team scaling options - add more developers, designers, or specialists as your project grows, or reduce team size when needed.",
  },
  {
    q: "What technologies do you specialize in?",
    a: "Our expertise spans React, Next.js, Node.js, Python, TypeScript, AWS, Docker, MongoDB, PostgreSQL, GraphQL, Vue.js, Angular, and more. We can also work with other technologies based on your requirements.",
  },
  {
    q: "How do you handle confidentiality and IP?",
    a: "We sign comprehensive NDAs and confidentiality agreements. All code, designs, and intellectual property belong to you. We take data security and IP protection very seriously.",
  },
];