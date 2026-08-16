export const techCategories = [
    { id: "frontend", label: "Frontend", icon: "Code2", color: "from-blue-500 to-cyan-500" },
    { id: "backend", label: "Backend", icon: "Server", color: "from-green-500 to-emerald-500" },
    { id: "mobile", label: "Mobile", icon: "Smartphone", color: "from-purple-500 to-pink-500" },
    { id: "cloud-devops", label: "Cloud & DevOps", icon: "Cloud", color: "from-orange-500 to-red-500" },
    { id: "database", label: "Database", icon: "Database", color: "from-yellow-500 to-amber-500" },
    { id: "ai-ml", label: "AI & ML", icon: "Cpu", color: "from-indigo-500 to-violet-500" },
    { id: "design", label: "Design & UX", icon: "Palette", color: "from-pink-500 to-rose-500" },
    { id: "marketing", label: "Marketing Tech", icon: "BarChart3", color: "from-teal-500 to-green-500" },
];

export const technologies = [
    // Frontend
    {
        id: "react",
        name: "React.js",
        category: "frontend",
        description:
            "The industry-standard library for building interactive user interfaces using a component-based architecture.",
        features: ["Virtual DOM", "Component-Based", "Huge Ecosystem", "Server Components (Next.js)"],
        useCases: ["Single Page Apps", "Dashboards", "Social Networks", "E-commerce Frontends"],
        proficiency: 100,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
        details:
            "React allows us to build reusable UI components. Combined with Next.js, it provides SEO-friendly server-side rendering.",
    },
    {
        id: "nextjs",
        name: "Next.js",
        category: "frontend",
        description:
            "The React framework for production, offering hybrid static & server rendering, TypeScript support, and more.",
        features: ["SSR/SSG", "API Routes", "Image Optimization", "Automatic Code Splitting"],
        useCases: ["Corporate Websites", "Blogs", "E-commerce", "SaaS Platforms"],
        proficiency: 100,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
        details:
            "We use Next.js for 90% of our web projects due to its superior performance, SEO capabilities, and developer experience.",
    },
    {
        id: "vue",
        name: "Vue.js",
        category: "frontend",
        description:
            "A progressive JavaScript framework that is approachable, versatile, and performant.",
        features: ["Reactive Data Binding", "Component System", "Virtual DOM", "Easy Integration"],
        useCases: ["Legacy Modernization", "Interactive Widgets", "SPAs"],
        proficiency: 90,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg",
        details:
            "Vue offers a gentle learning curve and is perfect for integrating into existing projects or building lightweight SPAs.",
    },
    {
        id: "typescript",
        name: "TypeScript",
        category: "frontend",
        description: "JavaScript with syntax for types. It catches errors early and enhances code maintainability.",
        features: ["Static Typing", "IntelliSense", "Refactoring Safety", "ES6+ Support"],
        useCases: ["Large Scale Apps", "Team Collaboration", "Library Development"],
        proficiency: 100,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
        details: "We write 100% of our modern code in TypeScript to ensure type safety and reduce runtime bugs.",
    },
    {
        id: "tailwind",
        name: "Tailwind CSS",
        category: "frontend",
        description:
            "A utility-first CSS framework packed with classes that can be composed to build any design.",
        features: ["Utility Classes", "Responsive Design", "Dark Mode", "Customizable"],
        useCases: ["Rapid Prototyping", "Custom Designs", "Design Systems"],
        proficiency: 100,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
        details:
            "Tailwind allows us to build custom designs faster without leaving our HTML, ensuring consistency across the project.",
    },
    // Backend
    {
        id: "nodejs",
        name: "Node.js",
        category: "backend",
        description:
            "A JavaScript runtime built on Chrome's V8 engine, perfect for scalable network applications.",
        features: ["Non-blocking I/O", "Event Driven", "NPM Ecosystem", "Cross-Platform"],
        useCases: ["APIs", "Real-time Apps", "Microservices", "Streaming"],
        proficiency: 100,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
        details:
            "Node.js is our go-to for backend services, allowing us to use JavaScript across the entire stack (MERN/MEAN).",
    },
    {
        id: "python",
        name: "Python",
        category: "backend",
        description:
            "A versatile, high-level programming language known for readability and extensive libraries.",
        features: ["Django/Flask/FastAPI", "Data Science Libs", "Automation", "AI Integration"],
        useCases: ["AI/ML Backends", "Data Processing", "Enterprise Apps", "Scripting"],
        proficiency: 95,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg",
        details:
            "Python powers our AI initiatives and data-heavy backends, leveraging frameworks like FastAPI for high performance.",
    },
    {
        id: "dotnet",
        name: ".NET Core",
        category: "backend",
        description: "A free, open-source, cross-platform framework for building modern apps.",
        features: ["High Performance", "Strong Typing", "Enterprise Ready", "Azure Integration"],
        useCases: ["Enterprise Systems", "Financial Apps", "Legacy Migration"],
        proficiency: 85,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/dot-net/dot-net-original.svg",
        details:
            "Used for enterprise clients requiring robust security, strict typing, and deep integration with Microsoft ecosystems.",
    },
    {
        id: "go",
        name: "Go (Golang)",
        category: "backend",
        description:
            "An open source programming language supported by Google, designed for simplicity and concurrency.",
        features: ["Concurrency", "Fast Compilation", "Static Typing", "Minimal Syntax"],
        useCases: ["Microservices", "Cloud Native Apps", "High-Performance APIs"],
        proficiency: 80,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/go/go-original.svg",
        details:
            "We utilize Go for high-throughput microservices where performance and concurrency are critical.",
    },
    // Mobile
    {
        id: "flutter",
        name: "Flutter",
        category: "mobile",
        description:
            "Google's UI toolkit for building natively compiled applications for mobile, web, and desktop from a single codebase.",
        features: ["Hot Reload", "Widget Library", "Native Performance", "Single Codebase"],
        useCases: ["Startups", "MVPs", "Cross-Platform Apps"],
        proficiency: 95,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/flutter/flutter-original.svg",
        details:
            "Flutter is our primary choice for cross-platform mobile development, delivering near-native performance with 40% less code.",
    },
    {
        id: "react-native",
        name: "React Native",
        category: "mobile",
        description: "A framework for building native apps using React.",
        features: ["Learn Once Write Anywhere", "Native Modules", "Live Reload", "Community Support"],
        useCases: ["Social Apps", "E-commerce", "Existing React Teams"],
        proficiency: 90,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
        details:
            "Ideal for teams already familiar with React, allowing code sharing between web and mobile platforms.",
    },
    {
        id: "swift",
        name: "Swift",
        category: "mobile",
        description:
            "A powerful and intuitive programming language for iOS, iPadOS, macOS, tvOS, and watchOS.",
        features: ["Safe by Design", "Fast", "Modern Syntax", "Apple Ecosystem"],
        useCases: ["Premium iOS Apps", "AR Applications", "Apple Watch Apps"],
        proficiency: 85,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/swift/swift-original.svg",
        details:
            "For mission-critical iOS apps requiring deep hardware integration, we build native solutions with Swift.",
    },
    {
        id: "kotlin",
        name: "Kotlin",
        category: "mobile",
        description: "A concise, safe, and interoperable programming language for Android.",
        features: ["Null Safety", "Coroutines", "Java Interop", "Concise"],
        useCases: ["Android Apps", "Server-side (Ktor)", "Multiplatform"],
        proficiency: 85,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg",
        details:
            "The official language for Android, offering modern features that make development faster and safer than Java.",
    },
    // Cloud & DevOps
    {
        id: "aws",
        name: "Amazon Web Services",
        category: "cloud-devops",
        description:
            "The world's most comprehensive and broadly adopted cloud platform.",
        features: ["EC2", "Lambda", "S3", "RDS", "Global Infrastructure"],
        useCases: ["Scalable Hosting", "Serverless", "Storage", "Machine Learning"],
        proficiency: 100,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazonwebservices/amazonwebservices-original-wordmark.svg",
        details:
            "We are an AWS Advanced Partner, utilizing the full suite of services to build resilient, scalable architectures.",
    },
    {
        id: "docker",
        name: "Docker",
        category: "cloud-devops",
        description: "A platform for developing, shipping, and running applications in containers.",
        features: ["Containerization", "Consistency", "Isolation", "Portability"],
        useCases: ["Microservices", "CI/CD", "Development Environments"],
        proficiency: 100,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg",
        details:
            "Docker ensures our applications run identically in development, testing, and production environments.",
    },
    {
        id: "kubernetes",
        name: "Kubernetes",
        category: "cloud-devops",
        description:
            "An open-source system for automating deployment, scaling, and management of containerized applications.",
        features: ["Auto Scaling", "Self Healing", "Load Balancing", "Orchestration"],
        useCases: ["Large Scale Systems", "Microservices Orchestration"],
        proficiency: 90,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg",
        details:
            "For enterprise clients with complex microservices, we orchestrate containers using Kubernetes for maximum uptime.",
    },
    // Database
    {
        id: "mongodb",
        name: "MongoDB",
        category: "database",
        description:
            "A document database built for modern application developers and for the cloud.",
        features: ["NoSQL", "Flexible Schema", "Scalability", "JSON-like Documents"],
        useCases: ["Content Management", "Catalogs", "Real-time Analytics"],
        proficiency: 100,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg",
        details: "Perfect for agile development where schema flexibility is required, often paired with Node.js.",
    },
    {
        id: "postgresql",
        name: "PostgreSQL",
        category: "database",
        description: "A powerful, open source object-relational database system.",
        features: ["ACID Compliant", "Complex Queries", "JSON Support", "Extensible"],
        useCases: ["Financial Systems", "ERP", "Complex Data Relations"],
        proficiency: 95,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
        details:
            "Our choice for relational data requiring strict integrity, complex joins, and transactional safety.",
    },
    {
        id: "redis",
        name: "Redis",
        category: "database",
        description:
            "An open source, in-memory data structure store, used as a database, cache, and message broker.",
        features: ["In-Memory", "Low Latency", "Pub/Sub", "Data Structures"],
        useCases: ["Caching", "Session Management", "Real-time Leaderboards"],
        proficiency: 90,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg",
        details: "Used extensively for caching layers to speed up application response times by milliseconds.",
    },
    // AI & ML
    {
        id: "tensorflow",
        name: "TensorFlow",
        category: "ai-ml",
        description: "An end-to-end open source platform for machine learning.",
        features: ["Neural Networks", "Deep Learning", "Production Ready", "Flexible"],
        useCases: ["Image Recognition", "NLP", "Predictive Analytics"],
        proficiency: 85,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tensorflow/tensorflow-original.svg",
        details: "We leverage TensorFlow for building and deploying complex deep learning models at scale.",
    },
    {
        id: "pytorch",
        name: "PyTorch",
        category: "ai-ml",
        description: "An optimized tensor library for deep learning using GPUs and CPUs.",
        features: ["Dynamic Graphs", "Pythonic", "Research Friendly", "TorchServe"],
        useCases: ["Computer Vision", "Research Prototypes", "NLP"],
        proficiency: 85,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/pytorch/pytorch-original.svg",
        details: "Preferred for research-heavy projects and computer vision tasks due to its flexibility.",
    },
    // Design
    {
        id: "figma",
        name: "Figma",
        category: "design",
        description: "The collaborative interface design tool.",
        features: ["Real-time Collaboration", "Prototyping", "Design Systems", "Dev Mode"],
        useCases: ["UI/UX Design", "Wireframing", "Prototyping"],
        proficiency: 100,
        logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg",
        details: "Our design team works exclusively in Figma, allowing seamless handoff to developers.",
    },
    // Marketing
    {
        id: "google-analytics",
        name: "Google Analytics 4",
        category: "marketing",
        description: "Web analytics service offered by Google that tracks and reports website traffic.",
        features: ["Event Tracking", "User Journey", "Conversion Analysis", "Integration"],
        useCases: ["Traffic Analysis", "ROI Measurement", "User Behavior"],
        proficiency: 95,
        logo: "https://www.vectorlogo.zone/logos/google_analytics/google_analytics-icon.svg",
        details: "We implement advanced GA4 tracking to provide clients with actionable insights into user behavior.",
    },
];
