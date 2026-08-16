export interface Service {
  id: string
  slug: string
  title: string
  description: string
  icon: string
  image: string
  shortDescription: string
  features: string[]
  benefits: string[]
  process: {
    title: string
    description: string
  }[]
  technologies: string[]
  caseStudies?: string[]
  ctaText?: string
}

export const services: Service[] = [
  {
    id: '1',
    slug: 'it-services',
    title: 'IT Services',
    description: 'Comprehensive IT solutions for your business needs',
    shortDescription: 'Enterprise-grade IT infrastructure and support',
    icon: '💻',
    image: '/images/it-services.jpg',
    features: [
      'Cloud Infrastructure Management',
      'Cybersecurity Solutions',
      'Network Configuration & Optimization',
      'Server & Database Management',
      'Disaster Recovery Planning',
      'IT Consulting & Strategy',
    ],
    benefits: [
      'Improved System Reliability',
      'Enhanced Security Posture',
      'Reduced Downtime & Costs',
      '24/7 Technical Support',
      'Scalable Solutions',
      'Compliance Management',
    ],
    process: [
      {
        title: 'Assessment',
        description: 'Analyze your current IT infrastructure and identify gaps.',
      },
      {
        title: 'Planning',
        description: 'Create a comprehensive roadmap for your IT transformation.',
      },
      {
        title: 'Implementation',
        description: 'Deploy solutions with minimal disruption to operations.',
      },
      {
        title: 'Support & Optimization',
        description: 'Provide ongoing support and continuous optimization.',
      },
    ],
    technologies: [
      'AWS',
      'Microsoft Azure',
      'Kubernetes',
      'Docker',
      'Linux',
      'Windows Server',
    ],
  },
  {
    id: '2',
    slug: 'digital-marketing',
    title: 'Digital Marketing',
    description: 'Strategic digital marketing to boost your online presence',
    shortDescription: 'Drive growth with data-driven marketing strategies',
    icon: '📱',
    image: '/images/digital-marketing.jpg',
    features: [
      'SEO Optimization',
      'Content Marketing',
      'Social Media Management',
      'PPC Advertising',
      'Email Marketing',
      'Analytics & Reporting',
    ],
    benefits: [
      'Increased Website Traffic',
      'Higher Conversion Rates',
      'Improved Brand Awareness',
      'Cost-Effective Campaigns',
      'Real-time Analytics',
      'Better ROI',
    ],
    process: [
      {
        title: 'Strategy Development',
        description: 'Develop a customized digital marketing strategy.',
      },
      {
        title: 'Campaign Creation',
        description: 'Create engaging content and campaigns across channels.',
      },
      {
        title: 'Execution',
        description: 'Launch campaigns with precision targeting.',
      },
      {
        title: 'Analysis & Optimization',
        description: 'Monitor performance and optimize for better results.',
      },
    ],
    technologies: [
      'Google Analytics',
      'SEMrush',
      'HubSpot',
      'Mailchimp',
      'Facebook Ads',
      'Google Ads',
    ],
  },
  {
    id: '3',
    slug: 'graphic-design',
    title: 'Graphic Design',
    description: 'Creative graphic design services for visual excellence',
    shortDescription: 'Transform your brand vision into stunning visuals',
    icon: '🎨',
    image: '/images/graphic-design.jpg',
    features: [
      'Logo Design',
      'Brand Identity',
      'Web Design',
      'Print Design',
      'Packaging Design',
      'Illustration & Animation',
    ],
    benefits: [
      'Professional Brand Image',
      'Increased Brand Recognition',
      'Better User Engagement',
      'Competitive Advantage',
      'Consistent Visual Identity',
      'Modern & Timeless Design',
    ],
    process: [
      {
        title: 'Discovery & Briefing',
        description: 'Understand your brand and design requirements.',
      },
      {
        title: 'Concept Development',
        description: 'Create multiple design concepts and prototypes.',
      },
      {
        title: 'Refinement',
        description: 'Refine designs based on feedback and objectives.',
      },
      {
        title: 'Finalization & Delivery',
        description: 'Deliver final designs in all required formats.',
      },
    ],
    technologies: [
      'Adobe Creative Suite',
      'Figma',
      'Sketch',
      'InDesign',
      'Photoshop',
      'Illustrator',
    ],
  },
    {
    id: '4',
    slug: 'graphic-design',
    title: 'Graphic Design',
    description: 'Creative graphic design services for visual excellence',
    shortDescription: 'Transform your brand vision into stunning visuals',
    icon: '🎨',
    image: '/images/graphic-design.jpg',
    features: [
      'Logo Design',
      'Brand Identity',
      'Web Design',
      'Print Design',
      'Packaging Design',
      'Illustration & Animation',
    ],
    benefits: [
      'Professional Brand Image',
      'Increased Brand Recognition',
      'Better User Engagement',
      'Competitive Advantage',
      'Consistent Visual Identity',
      'Modern & Timeless Design',
    ],
    process: [
      {
        title: 'Discovery & Briefing',
        description: 'Understand your brand and design requirements.',
      },
      {
        title: 'Concept Development',
        description: 'Create multiple design concepts and prototypes.',
      },
      {
        title: 'Refinement',
        description: 'Refine designs based on feedback and objectives.',
      },
      {
        title: 'Finalization & Delivery',
        description: 'Deliver final designs in all required formats.',
      },
    ],
    technologies: [
      'Adobe Creative Suite',
      'Figma',
      'Sketch',
      'InDesign',
      'Photoshop',
      'Illustrator',
    ],
  }
]
