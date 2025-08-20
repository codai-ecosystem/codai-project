/**
 * Common English translations for the CODAI ecosystem
 * Base translations that are shared across all applications
 */

export const commonTranslations = {
  // Common UI elements
  common: {
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    warning: 'Warning',
    info: 'Information',
    save: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    remove: 'Remove',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    next: 'Next',
    previous: 'Previous',
    continue: 'Continue',
    back: 'Back',
    finish: 'Finish',
    submit: 'Submit',
    reset: 'Reset',
    refresh: 'Refresh',
    clear: 'Clear',
    select: 'Select',
    selectAll: 'Select All',
    deselectAll: 'Deselect All',
    copy: 'Copy',
    paste: 'Paste',
    cut: 'Cut',
    download: 'Download',
    upload: 'Upload',
    import: 'Import',
    export: 'Export',
    print: 'Print',
    share: 'Share',
    settings: 'Settings',
    preferences: 'Preferences',
    profile: 'Profile',
    account: 'Account',
    logout: 'Logout',
    login: 'Login',
    signup: 'Sign Up',
    register: 'Register',
    language: 'Language',
    theme: 'Theme',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    systemMode: 'System',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    done: 'Done',
    help: 'Help',
    about: 'About',
    contact: 'Contact',
    support: 'Support',
    documentation: 'Documentation',
    tutorials: 'Tutorials',
    examples: 'Examples',
    getStarted: 'Get Started',
    learnMore: 'Learn More',
    viewAll: 'View All',
    showMore: 'Show More',
    showLess: 'Show Less',
    expand: 'Expand',
    collapse: 'Collapse',
    minimize: 'Minimize',
    maximize: 'Maximize',
    fullscreen: 'Fullscreen',
    home: 'Home',
    dashboard: 'Dashboard',
    projects: 'Projects',
    team: 'Team',
    notifications: 'Notifications',
    messages: 'Messages',
    inbox: 'Inbox',
    archive: 'Archive',
    trash: 'Trash',
    favorites: 'Favorites',
    recent: 'Recent',
    popular: 'Popular',
    trending: 'Trending',
    new: 'New',
    updated: 'Updated',
    version: 'Version',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    enabled: 'Enabled',
    disabled: 'Disabled',
    public: 'Public',
    private: 'Private',
    draft: 'Draft',
    published: 'Published',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    completed: 'Completed',
    inProgress: 'In Progress',
    todo: 'To Do',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    urgent: 'Urgent',
    normal: 'Normal',
    optional: 'Optional',
    required: 'Required',
    recommended: 'Recommended',
    beta: 'Beta',
    alpha: 'Alpha',
    stable: 'Stable',
    experimental: 'Experimental',
    deprecated: 'Deprecated'
  },

  // Form validation messages
  validation: {
    required: 'This field is required',
    email: 'Please enter a valid email address',
    password: 'Password must be at least 8 characters long',
    passwordConfirm: 'Passwords do not match',
    url: 'Please enter a valid URL',
    phone: 'Please enter a valid phone number',
    minLength: 'Must be at least {{min}} characters',
    maxLength: 'Must be no more than {{max}} characters',
    min: 'Must be at least {{min}}',
    max: 'Must be no more than {{max}}',
    pattern: 'Please enter a valid format',
    numeric: 'Please enter a valid number',
    integer: 'Please enter a whole number',
    positive: 'Must be a positive number',
    negative: 'Must be a negative number',
    unique: 'This value already exists',
    invalid: 'Invalid value',
    fileSize: 'File size must be less than {{size}}MB',
    fileType: 'Only {{types}} files are allowed'
  },

  // Error messages
  errors: {
    general: 'An unexpected error occurred. Please try again.',
    network: 'Network error. Please check your connection.',
    timeout: 'Request timed out. Please try again.',
    unauthorized: 'You are not authorized to perform this action.',
    forbidden: 'Access denied.',
    notFound: 'The requested resource was not found.',
    serverError: 'Server error. Please try again later.',
    validationFailed: 'Please check your input and try again.',
    uploadFailed: 'File upload failed. Please try again.',
    downloadFailed: 'File download failed. Please try again.',
    connectionLost: 'Connection lost. Attempting to reconnect...',
    sessionExpired: 'Your session has expired. Please log in again.',
    rateLimited: 'Too many requests. Please wait and try again.',
    maintenance: 'Service temporarily unavailable for maintenance.'
  },

  // Success messages
  success: {
    saved: 'Changes saved successfully',
    created: 'Created successfully',
    updated: 'Updated successfully',
    deleted: 'Deleted successfully',
    uploaded: 'File uploaded successfully',
    downloaded: 'File downloaded successfully',
    copied: 'Copied to clipboard',
    sent: 'Sent successfully',
    invited: 'Invitation sent successfully',
    published: 'Published successfully',
    archived: 'Archived successfully',
    restored: 'Restored successfully',
    activated: 'Activated successfully',
    deactivated: 'Deactivated successfully',
    verified: 'Verified successfully',
    confirmed: 'Confirmed successfully',
    approved: 'Approved successfully',
    rejected: 'Rejected successfully',
    completed: 'Completed successfully',
    cancelled: 'Cancelled successfully'
  },

  // Date and time
  datetime: {
    now: 'Now',
    today: 'Today',
    yesterday: 'Yesterday',
    tomorrow: 'Tomorrow',
    thisWeek: 'This Week',
    lastWeek: 'Last Week',
    nextWeek: 'Next Week',
    thisMonth: 'This Month',
    lastMonth: 'Last Month',
    nextMonth: 'Next Month',
    thisYear: 'This Year',
    lastYear: 'Last Year',
    nextYear: 'Next Year',
    seconds: 'seconds',
    minutes: 'minutes',
    hours: 'hours',
    days: 'days',
    weeks: 'weeks',
    months: 'months',
    years: 'years',
    ago: 'ago',
    in: 'in',
    justNow: 'Just now',
    lessThanMinute: 'Less than a minute ago',
    about: 'About',
    over: 'Over',
    almost: 'Almost',
    am: 'AM',
    pm: 'PM'
  },

  // Navigation
  navigation: {
    menu: 'Menu',
    mainMenu: 'Main Menu',
    userMenu: 'User Menu',
    breadcrumb: 'Breadcrumb',
    pagination: 'Pagination',
    firstPage: 'First Page',
    lastPage: 'Last Page',
    nextPage: 'Next Page',
    previousPage: 'Previous Page',
    pageOf: 'Page {{current}} of {{total}}',
    itemsPerPage: 'Items per page',
    showingItems: 'Showing {{start}} to {{end}} of {{total}} items',
    noItems: 'No items to display'
  },

  // Accessibility
  accessibility: {
    skipToContent: 'Skip to main content',
    skipToNavigation: 'Skip to navigation',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    toggleMenu: 'Toggle menu',
    openDialog: 'Open dialog',
    closeDialog: 'Close dialog',
    openDropdown: 'Open dropdown',
    closeDropdown: 'Close dropdown',
    expandSection: 'Expand section',
    collapseSection: 'Collapse section',
    sortAscending: 'Sort ascending',
    sortDescending: 'Sort descending',
    loading: 'Loading content',
    searchResults: 'Search results',
    noResults: 'No results found',
    selectedOption: 'Selected option',
    currentPage: 'Current page',
    errorMessage: 'Error message',
    successMessage: 'Success message',
    warningMessage: 'Warning message',
    infoMessage: 'Information message'
  },
  
  // AIDE Application specific translations
  aide: {
    hero: {
      badge: 'Now Available: AI-Native Development Platform',
      title: {
        part1: 'The Future of',
        part2: 'AI Development'
      },
      subtitle: 'AIDE is the first truly autonomous development environment. Build, deploy, and scale applications with AI that thinks, codes, and ships for you.',
      features: {
        aiPowered: 'AI-Powered Coding',
        vscodeIntegration: 'VS Code Integration',
        oneClickDeploy: 'One-Click Deploy',
        realTimeCollab: 'Real-time Collaboration'
      },
      cta: {
        tryWeb: 'Try Web Version',
        viewGithub: 'View on GitHub'
      },
      terminal: {
        title: 'AIDE Terminal',
        analyzing: '✨ Analyzing requirements...',
        generating: '🤖 AI generating optimized Next.js structure...',
        installing: '📦 Installing dependencies...',
        deploying: '🚀 Setting up deployment pipeline...',
        success: '✅ Project created successfully!',
        liveUrl: '🌐 Live at: https://my-project.aide.dev'
      }
    },
    features: {
      badge: 'Core Features',
      title: {
        part1: 'Everything you need to',
        part2: 'build faster'
      },
      subtitle: 'AIDE combines the power of AI with modern development tools to create the most advanced development environment ever built.',
      categories: {
        aiPowered: 'AI-Powered',
        development: 'Development',
        devops: 'DevOps',
        data: 'Data',
        collaboration: 'Collaboration',
        security: 'Security',
        infrastructure: 'Infrastructure',
        performance: 'Performance'
      },
      autonomous: {
        title: 'Autonomous AI Agent',
        description: 'AI that understands context, writes code, fixes bugs, and makes architectural decisions independently.'
      },
      vscode: {
        title: 'VS Code Integration',
        description: 'Seamless integration with your favorite editor. Work in familiar environment with AI superpowers.'
      },
      deployment: {
        title: 'One-Click Deployment',
        description: 'Deploy to production with a single command. Automatic scaling, monitoring, and rollbacks included.'
      },
      database: {
        title: 'Smart Database Management',
        description: 'AI-optimized database schemas, migrations, and queries. Supports PostgreSQL, MongoDB, and more.'
      },
      versionControl: {
        title: 'Intelligent Version Control',
        description: 'AI-powered git workflows with automatic branch management, conflict resolution, and code reviews.'
      },
      security: {
        title: 'Built-in Security',
        description: 'Automated security scanning, vulnerability detection, and compliance checks in your development workflow.'
      },
      multiCloud: {
        title: 'Multi-Cloud Support',
        description: 'Deploy to AWS, Google Cloud, Azure, or any cloud provider with optimized configurations.'
      },
      collaboration: {
        title: 'Team Collaboration',
        description: 'Real-time collaboration with shared AI context, live coding sessions, and team knowledge bases.'
      },
      performance: {
        title: 'Lightning Fast',
        description: 'Optimized development workflows that are 10x faster than traditional development processes.'
      },
      cta: {
        title: 'Ready to experience the future?',
        description: 'Join thousands of developers who are already building with AI. Start your free trial today and see the difference.',
        noCreditCard: 'No credit card required',
        freeTrial: 'Free 14-day trial',
        cancelAnytime: 'Cancel anytime'
      }
    },
    pricing: {
      badge: 'Pricing Plans',
      title: {
        part1: 'Choose your',
        part2: 'perfect plan'
      },
      subtitle: 'Start building for free, then scale as you grow. All plans include core AI features and VS Code integration.',
      mostPopular: 'Most Popular',
      processing: 'Processing...',
      billing: {
        monthly: 'Monthly',
        yearly: 'Yearly',
        month: 'month',
        save: 'Save 20%',
        billedAnnually: 'Billed annually (${{amount}}/year)'
      },
      plans: {
        starter: {
          name: 'Starter',
          description: 'Perfect for individual developers and small projects',
          cta: 'Start Free',
          features: {
            requests: '5,000 AI requests/month',
            projects: '2 active projects',
            integration: 'Basic VS Code integration',
            support: 'Community support',
            deployment: 'Standard deployment',
            storage: '1GB storage'
          }
        },
        professional: {
          name: 'Professional',
          description: 'For growing teams and production applications',
          cta: 'Start Trial',
          features: {
            requests: '50,000 AI requests/month',
            projects: 'Unlimited projects',
            advanced: 'Advanced AI features',
            support: 'Priority support',
            deployment: 'Auto-scaling deployment',
            storage: '100GB storage',
            collaboration: 'Team collaboration',
            integrations: 'Custom integrations'
          }
        },
        enterprise: {
          name: 'Enterprise',
          description: 'For large organizations with custom needs',
          cta: 'Contact Sales',
          features: {
            requests: 'Unlimited AI requests',
            projects: 'Unlimited projects',
            models: 'Custom AI models',
            support: '24/7 dedicated support',
            deployment: 'Multi-cloud deployment',
            storage: 'Unlimited storage',
            security: 'Advanced security',
            integrations: 'Custom integrations',
            sla: 'SLA guarantee',
            onPremise: 'On-premise option'
          }
        }
      },
      enterprise: {
        title: 'Need a custom solution?',
        description: 'Get in touch with our sales team to discuss enterprise features, custom deployments, and volume pricing.',
        scheduleDemo: 'Schedule a Demo',
        contactSales: 'Contact Sales'
      }
    },
    testimonials: {
      badge: 'What Developers Say',
      title: {
        part1: 'Loved by developers',
        part2: 'worldwide'
      },
      subtitle: 'Join thousands of developers who have already transformed their development workflow with AIDE\'s AI-powered platform.',
      testimonial1: {
        content: 'AIDE has completely revolutionized how I write code. The AI suggestions are incredibly accurate and save me hours every day.',
        author: 'Alex Rodriguez',
        role: 'Senior Frontend Developer',
        company: 'TechCorp Inc.'
      },
      testimonial2: {
        content: 'The productivity boost is unreal. What used to take days now takes hours. AIDE is like having a senior developer pair programming with you.',
        author: 'Sarah Chen',
        role: 'Full Stack Developer',
        company: 'StartupXYZ'
      },
      testimonial3: {
        content: 'As a team lead, I can see the immediate impact on our delivery speed and code quality. AIDE is a game-changer.',
        author: 'Michael Johnson',
        role: 'Engineering Manager',
        company: 'Enterprise Solutions'
      },
      testimonial4: {
        content: 'The debugging assistance is phenomenal. AIDE helps me catch issues before they become problems.',
        author: 'Emma Thompson',
        role: 'Backend Developer',
        company: 'CloudFirst'
      },
      testimonial5: {
        content: 'I\'ve tried many AI coding tools, but AIDE\'s understanding of context and project structure is unmatched.',
        author: 'David Kumar',
        role: 'DevOps Engineer',
        company: 'ScaleOps'
      },
      testimonial6: {
        content: 'The learning curve was zero. AIDE just works out of the box and integrates seamlessly with our existing workflow.',
        author: 'Lisa Park',
        role: 'Mobile Developer',
        company: 'AppStudio'
      },
      stats: {
        developers: '10K+',
        developersLabel: 'Active Developers',
        linesOfCode: '50M+',
        linesOfCodeLabel: 'Lines of Code Generated',
        uptime: '99.9%',
        uptimeLabel: 'Uptime',
        fasterDev: '60%',
        fasterDevLabel: 'Faster Development'
      }
    },
    cta: {
      badge: 'Ready to Get Started?',
      title: {
        part1: 'Ready to Transform Your',
        part2: 'Development Workflow?'
      },
      subtitle: 'Join thousands of developers already using AIDE to build, deploy, and scale applications faster than ever before. Start your AI-powered development journey today.',
      primaryButton: 'Start Building for Free',
      primaryButtonSubtext: 'No credit card required • Free tier available',
      emailPlaceholder: 'Enter your email',
      getStarted: 'Get Started',
      trust: {
        moneyBack: '30-day money-back guarantee',
        security: 'Enterprise-grade security',
        support: '24/7 support'
      },
      socialProof: {
        title: 'Trusted by developers at leading companies'
      }
    },
    footer: {
      badge: 'v2.0',
      description: 'The complete AI-powered development platform for modern software teams. Build, deploy, and scale with autonomous AI assistance.',
      newsletter: {
        title: 'Stay Updated',
        placeholder: 'Enter your email',
        subscribe: 'Subscribe'
      },
      sections: {
        product: 'Product',
        company: 'Company',
        support: 'Support',
        legal: 'Legal'
      },
      product: {
        features: 'Features',
        pricing: 'Pricing',
        documentation: 'Documentation',
        api: 'API Reference'
      },
      company: {
        about: 'About',
        blog: 'Blog',
        careers: 'Careers',
        contact: 'Contact'
      },
      support: {
        helpCenter: 'Help Center',
        community: 'Community',
        status: 'Status',
        security: 'Security'
      },
      legal: {
        privacy: 'Privacy Policy',
        terms: 'Terms of Service',
        cookies: 'Cookie Policy'
      },
      copyright: '© {{year}} AIDE. All rights reserved.',
      language: 'Language',
      madeWith: 'Made with ❤️ by the AIDE team'
    }
  },
  docs: {
    dashboard: {
      title: "DOCS Dashboard",
      subtitle: "Documentation and Knowledge Management Hub",
      metrics: {
        totalDocs: "Total Documents",
        totalViews: "Total Views",
        recentUpdates: "Recent Updates", 
        pendingReviews: "Pending Reviews",
        searchQueries: "Search Queries",
        contributors: "Contributors",
        weekGrowth: "+12 this week",
        monthlyGrowth: "+8.2% from last month",
        last24Hours: "Last 24 hours",
        needsAttention: "Needs attention",
        today: "Today",
        activeMonth: "Active this month"
      },
      quickActions: {
        createDoc: {
          title: "Create New Document",
          description: "Start writing a new documentation page",
          button: "New Document"
        },
        search: {
          title: "Search Knowledge Base",
          description: "Find information across all documents",
          placeholder: "Search documents..."
        },
        review: {
          title: "Review Queue",
          description: "Review pending documentation changes",
          button: "Review Documents"
        }
      },
      recentDocs: {
        title: "Recent Documents",
        description: "Latest updates to your documentation",
        filter: "Filter",
        status: {
          published: "published",
          draft: "draft",
          review: "review"
        },
        actions: {
          edit: "Edit",
          star: "Star"
        },
        metadata: {
          views: "views"
        }
      },
      categories: {
        api: {
          title: "API Documentation",
          description: "Technical API references and guides"
        },
        userGuides: {
          title: "User Guides", 
          description: "End-user documentation and tutorials"
        },
        processes: {
          title: "Internal Processes",
          description: "Company procedures and workflows"
        },
        knowledge: {
          title: "Knowledge Base",
          description: "FAQs and troubleshooting guides"
        },
        documents: "Documents"
      }
    }
  }
}

export default commonTranslations
