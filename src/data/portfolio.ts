export interface PortfolioProject {
  id: string
  slug: string
  title: string
  description: string
  image: string
  category: string
  technologies: string[]
  challenge: string
  solution: string
  results: string[]
  link?: string
}

export const portfolioProjects: PortfolioProject[] = [
  {
    id: '1',
    slug: 'ecommerce-platform',
    title: 'E-Commerce Platform Redesign',
    description: 'Complete redesign and optimization of an e-commerce platform',
    image: '/images/portfolio-1.jpg',
    category: 'Digital Marketing',
    technologies: ['Next.js', 'React', 'Tailwind CSS', 'Stripe'],
    challenge: 'The client\'s old e-commerce platform had high bounce rates and poor conversion.',
    solution: 'We redesigned the entire user experience with modern UI/UX principles and optimized the checkout flow.',
    results: [
      '45% increase in conversion rate',
      '30% reduction in cart abandonment',
      '200% growth in sales',
    ],
    link: '#',
  },
  {
    id: '2',
    slug: 'brand-identity',
    title: 'Complete Brand Identity Design',
    description: 'Full branding and visual identity for a tech startup',
    image: '/images/portfolio-2.jpg',
    category: 'Graphic Design',
    technologies: ['Figma', 'Adobe Creative Suite', 'Branding Strategy'],
    challenge: 'New tech startup needed a compelling brand identity to stand out in the market.',
    solution: 'Created a cohesive brand system including logo, color palette, typography, and brand guidelines.',
    results: [
      'Award-winning brand identity',
      'Increased brand recognition by 150%',
      'Strong market differentiation',
    ],
    link: '#',
  },
  {
    id: '3',
    slug: 'cloud-migration',
    title: 'Enterprise Cloud Migration',
    description: 'Successful migration of on-premise systems to cloud infrastructure',
    image: '/images/portfolio-3.jpg',
    category: 'IT Services',
    technologies: ['AWS', 'Docker', 'Kubernetes', 'DevOps'],
    challenge: 'Legacy on-premise infrastructure was expensive and difficult to scale.',
    solution: 'Migrated all systems to AWS with containerization and orchestration.',
    results: [
      '60% reduction in infrastructure costs',
      '99.99% uptime achieved',
      'Improved deployment speed by 5x',
    ],
    link: '#',
  },
  {
    id: '4',
    slug: 'seo-growth',
    title: 'Digital Marketing Campaign - SEO Growth',
    description: 'Comprehensive SEO and content marketing strategy',
    image: '/images/portfolio-4.jpg',
    category: 'Digital Marketing',
    technologies: ['SEO', 'Content Marketing', 'Analytics'],
    challenge: 'Local business struggled with online visibility and customer acquisition.',
    solution: 'Implemented comprehensive SEO strategy with content marketing and local optimization.',
    results: [
      '400% increase in organic traffic',
      '1st page ranking for 50+ keywords',
      '3x increase in qualified leads',
    ],
    link: '#',
  },
  {
    id: '5',
    slug: 'web-application',
    title: 'Custom Web Application Development',
    description: 'Built a custom web application for project management',
    image: '/images/portfolio-5.jpg',
    category: 'IT Services',
    technologies: ['React', 'Node.js', 'MongoDB', 'Next.js'],
    challenge: 'Team needed a custom solution for complex project management needs.',
    solution: 'Developed a full-stack web application with real-time collaboration features.',
    results: [
      'Improved team productivity by 40%',
      'Reduced project delays',
      'Positive team feedback',
    ],
    link: '#',
  },
  {
    id: '6',
    slug: 'packaging-design',
    title: 'Premium Packaging Design',
    description: 'Luxury packaging design for premium product line',
    image: '/images/portfolio-6.jpg',
    category: 'Graphic Design',
    technologies: ['Packaging Design', 'Adobe InDesign', 'Brand Strategy'],
    challenge: 'Premium brand needed distinctive packaging to justify higher price point.',
    solution: 'Created luxurious packaging design reflecting premium brand positioning.',
    results: [
      'Increased perceived value',
      '35% premium price acceptance',
      'Social media buzz and unboxing content',
    ],
    link: '#',
  },
]
