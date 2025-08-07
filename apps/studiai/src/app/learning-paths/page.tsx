'use client'

import React, { useState } from 'react'
import { 
  MapPin,
  Search,
  Filter,
  Grid,
  List,
  Star,
  Clock,
  Users,
  Play,
  Award,
  Bookmark,
  Heart,
  Share2,
  Download,
  Eye,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Check,
  X,
  ArrowRight,
  BarChart3,
  Target,
  Zap,
  Brain,
  Globe,
  Video,
  FileText,
  Headphones,
  Code,
  Palette,
  Calculator,
  Microscope,
  Music,
  Camera,
  TrendingUp,
  Calendar,
  BookOpen,
  Tag,
  Info,
  ExternalLink,
  RefreshCw,
  Route,
  Navigation,
  Compass,
  Flag,
  Layers,
  TrendingDown,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  Workflow,
  GitBranch,
  CheckCircle,
  Circle,
  Lock,
  Unlock
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function LearningPathsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState('all')
  const [selectedDuration, setSelectedDuration] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const pathStats = [
    { icon: Route, label: 'Learning Paths', value: '127', change: '+12', color: 'text-blue-600' },
    { icon: Users, label: 'Active Learners', value: '8.9K', change: '+847', color: 'text-green-600' },
    { icon: CheckCircle, label: 'Completed Paths', value: '2,156', change: '+234', color: 'text-purple-600' },
    { icon: Award, label: 'Certificates Earned', value: '1,789', change: '+156', color: 'text-yellow-600' }
  ]

  const pathCategories = [
    { id: 'all', name: 'All Paths', icon: Grid, count: 127, color: 'bg-gray-500' },
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: Brain, count: 18, color: 'bg-purple-500' },
    { id: 'web-dev', name: 'Web Development', icon: Code, count: 23, color: 'bg-blue-500' },
    { id: 'data-science', name: 'Data Science', icon: BarChart3, count: 15, color: 'bg-green-500' },
    { id: 'design', name: 'Design & UX', icon: Palette, count: 12, color: 'bg-pink-500' },
    { id: 'business', name: 'Business Skills', icon: Target, count: 16, color: 'bg-orange-500' },
    { id: 'cybersecurity', name: 'Cybersecurity', icon: Zap, count: 9, color: 'bg-red-500' },
    { id: 'mobile', name: 'Mobile Development', icon: Globe, count: 11, color: 'bg-indigo-500' },
    { id: 'devops', name: 'DevOps & Cloud', icon: Activity, count: 13, color: 'bg-teal-500' },
    { id: 'management', name: 'Project Management', icon: Workflow, count: 10, color: 'bg-yellow-500' }
  ]

  const learningPaths = [
    {
      id: 1,
      title: 'Complete AI Engineer',
      description: 'Master artificial intelligence from foundations to advanced applications with hands-on projects and real-world implementations.',
      category: 'ai-ml',
      difficulty: 'intermediate',
      duration: '6 months',
      totalCourses: 12,
      completedCourses: 3,
      totalHours: 180,
      studentsCount: 2847,
      rating: 4.9,
      reviewsCount: 1256,
      price: 299,
      originalPrice: 499,
      thumbnail: '🤖',
      instructor: 'Dr. Sarah Chen',
      instructorImage: '👩‍💻',
      skills: ['Python', 'TensorFlow', 'PyTorch', 'Neural Networks', 'Deep Learning', 'Computer Vision'],
      prerequisites: ['Basic Programming', 'Mathematics'],
      lastUpdated: '1 week ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      isBookmarked: false,
      isEnrolled: true,
      progress: 25,
      discount: 40,
      featured: true,
      bestseller: true,
      milestones: [
        { id: 1, title: 'Python Fundamentals', status: 'completed', courses: 2 },
        { id: 2, title: 'Machine Learning Basics', status: 'in-progress', courses: 3 },
        { id: 3, title: 'Deep Learning', status: 'locked', courses: 4 },
        { id: 4, title: 'AI Applications', status: 'locked', courses: 3 }
      ],
      nextMilestone: 'Complete Linear Algebra course',
      estimatedCompletion: '4 months'
    },
    {
      id: 2,
      title: 'Full Stack Web Developer',
      description: 'Become a professional web developer with modern technologies including React, Node.js, and cloud deployment.',
      category: 'web-dev',
      difficulty: 'beginner',
      duration: '8 months',
      totalCourses: 15,
      completedCourses: 0,
      totalHours: 240,
      studentsCount: 4521,
      rating: 4.8,
      reviewsCount: 2134,
      price: 249,
      originalPrice: 399,
      thumbnail: '🌐',
      instructor: 'Prof. Alex Rodriguez',
      instructorImage: '👨‍💼',
      skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
      prerequisites: ['Basic Computer Skills'],
      lastUpdated: '3 days ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      isBookmarked: true,
      isEnrolled: false,
      progress: 0,
      discount: 38,
      featured: false,
      bestseller: true,
      milestones: [
        { id: 1, title: 'Frontend Foundations', status: 'locked', courses: 4 },
        { id: 2, title: 'JavaScript Mastery', status: 'locked', courses: 3 },
        { id: 3, title: 'React Development', status: 'locked', courses: 4 },
        { id: 4, title: 'Backend & Deployment', status: 'locked', courses: 4 }
      ],
      nextMilestone: 'Start with HTML & CSS Fundamentals',
      estimatedCompletion: '8 months'
    },
    {
      id: 3,
      title: 'Data Science Professional',
      description: 'Learn data analysis, visualization, and machine learning to become a data science expert with Python and R.',
      category: 'data-science',
      difficulty: 'intermediate',
      duration: '5 months',
      totalCourses: 10,
      completedCourses: 6,
      totalHours: 150,
      studentsCount: 1876,
      rating: 4.7,
      reviewsCount: 892,
      price: 199,
      originalPrice: 329,
      thumbnail: '📊',
      instructor: 'Dr. Emily Watson',
      instructorImage: '👩‍🔬',
      skills: ['Python', 'R', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn', 'SQL'],
      prerequisites: ['Statistics Basics', 'Programming Knowledge'],
      lastUpdated: '5 days ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      isBookmarked: false,
      isEnrolled: true,
      progress: 60,
      discount: 39,
      featured: true,
      bestseller: false,
      milestones: [
        { id: 1, title: 'Data Analysis Foundations', status: 'completed', courses: 3 },
        { id: 2, title: 'Statistical Modeling', status: 'completed', courses: 3 },
        { id: 3, title: 'Machine Learning', status: 'in-progress', courses: 2 },
        { id: 4, title: 'Advanced Analytics', status: 'locked', courses: 2 }
      ],
      nextMilestone: 'Complete Decision Trees module',
      estimatedCompletion: '2 months'
    },
    {
      id: 4,
      title: 'UX/UI Design Master',
      description: 'Master user experience and interface design with industry-standard tools and design thinking methodologies.',
      category: 'design',
      difficulty: 'beginner',
      duration: '4 months',
      totalCourses: 8,
      completedCourses: 8,
      totalHours: 120,
      studentsCount: 2156,
      rating: 4.8,
      reviewsCount: 1078,
      price: 179,
      originalPrice: 299,
      thumbnail: '🎨',
      instructor: 'Maria Gonzalez',
      instructorImage: '👩‍🎨',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research', 'Design Systems'],
      prerequisites: ['Creative Thinking'],
      lastUpdated: '1 week ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      isBookmarked: true,
      isEnrolled: true,
      progress: 100,
      discount: 40,
      featured: false,
      bestseller: false,
      milestones: [
        { id: 1, title: 'Design Fundamentals', status: 'completed', courses: 2 },
        { id: 2, title: 'User Research', status: 'completed', courses: 2 },
        { id: 3, title: 'Interface Design', status: 'completed', courses: 2 },
        { id: 4, title: 'Advanced Prototyping', status: 'completed', courses: 2 }
      ],
      nextMilestone: 'Path completed! Claim certificate',
      estimatedCompletion: 'Completed'
    },
    {
      id: 5,
      title: 'Cybersecurity Specialist',
      description: 'Protect digital assets with comprehensive cybersecurity training covering ethical hacking and defense strategies.',
      category: 'cybersecurity',
      difficulty: 'advanced',
      duration: '7 months',
      totalCourses: 14,
      completedCourses: 0,
      totalHours: 210,
      studentsCount: 1247,
      rating: 4.9,
      reviewsCount: 634,
      price: 349,
      originalPrice: 549,
      thumbnail: '🔒',
      instructor: 'Dr. Michael Zhang',
      instructorImage: '👨‍💼',
      skills: ['Network Security', 'Ethical Hacking', 'Penetration Testing', 'Risk Assessment', 'Incident Response'],
      prerequisites: ['Networking Basics', 'System Administration'],
      lastUpdated: '2 weeks ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      isBookmarked: false,
      isEnrolled: false,
      progress: 0,
      discount: 36,
      featured: true,
      bestseller: false,
      milestones: [
        { id: 1, title: 'Security Fundamentals', status: 'locked', courses: 3 },
        { id: 2, title: 'Network Security', status: 'locked', courses: 4 },
        { id: 3, title: 'Ethical Hacking', status: 'locked', courses: 4 },
        { id: 4, title: 'Advanced Defense', status: 'locked', courses: 3 }
      ],
      nextMilestone: 'Begin with Security Fundamentals',
      estimatedCompletion: '7 months'
    },
    {
      id: 6,
      title: 'DevOps Engineer',
      description: 'Master DevOps practices with containerization, CI/CD pipelines, and cloud infrastructure automation.',
      category: 'devops',
      difficulty: 'intermediate',
      duration: '6 months',
      totalCourses: 11,
      completedCourses: 2,
      totalHours: 165,
      studentsCount: 1892,
      rating: 4.6,
      reviewsCount: 756,
      price: 269,
      originalPrice: 429,
      thumbnail: '⚙️',
      instructor: 'James Thompson',
      instructorImage: '👨‍💻',
      skills: ['Docker', 'Kubernetes', 'Jenkins', 'AWS', 'Terraform', 'Ansible', 'Git'],
      prerequisites: ['Linux Basics', 'Programming Experience'],
      lastUpdated: '4 days ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      isBookmarked: false,
      isEnrolled: true,
      progress: 18,
      discount: 37,
      featured: false,
      bestseller: true,
      milestones: [
        { id: 1, title: 'Infrastructure Basics', status: 'in-progress', courses: 3 },
        { id: 2, title: 'Containerization', status: 'locked', courses: 3 },
        { id: 3, title: 'CI/CD Pipelines', status: 'locked', courses: 3 },
        { id: 4, title: 'Cloud Automation', status: 'locked', courses: 2 }
      ],
      nextMilestone: 'Complete Docker fundamentals',
      estimatedCompletion: '5 months'
    }
  ]

  const filteredPaths = learningPaths.filter(path => {
    const matchesSearch = path.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         path.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || path.category === selectedCategory
    const matchesDifficulty = selectedDifficulty === 'all' || path.difficulty === selectedDifficulty
    const matchesDuration = selectedDuration === 'all' || 
                           (selectedDuration === 'short' && parseInt(path.duration) <= 4) ||
                           (selectedDuration === 'medium' && parseInt(path.duration) > 4 && parseInt(path.duration) <= 6) ||
                           (selectedDuration === 'long' && parseInt(path.duration) > 6)
    const matchesStatus = selectedStatus === 'all' ||
                         (selectedStatus === 'not-started' && path.progress === 0) ||
                         (selectedStatus === 'in-progress' && path.progress > 0 && path.progress < 100) ||
                         (selectedStatus === 'completed' && path.progress === 100)

    return matchesSearch && matchesCategory && matchesDifficulty && matchesDuration && matchesStatus
  })

  const sortedPaths = [...filteredPaths].sort((a, b) => {
    switch (sortBy) {
      case 'popular':
        return b.studentsCount - a.studentsCount
      case 'rating':
        return b.rating - a.rating
      case 'newest':
        return new Date(b.lastUpdated) - new Date(a.lastUpdated)
      case 'price-low':
        return a.price - b.price
      case 'price-high':
        return b.price - a.price
      case 'progress':
        return b.progress - a.progress
      default:
        return 0
    }
  })

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress':
        return <Activity className="h-4 w-4 text-blue-500" />
      case 'locked':
        return <Lock className="h-4 w-4 text-gray-400" />
      default:
        return <Circle className="h-4 w-4 text-gray-300" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <Route className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Learning Paths
                </h1>
                <p className="text-sm text-gray-600">Structured journeys to mastery</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search learning paths..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm w-80"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                <Filter className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Path Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {pathStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 hover:border-blue-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
                <span className="text-green-600 text-sm font-medium">{stat.change}</span>
              </div>
              <div className="mt-4">
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <p className="text-gray-600 text-sm">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Categories */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {pathCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-3 p-3 rounded-lg text-left transition-all ${
                  selectedCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className={`w-8 h-8 ${category.color} rounded-lg flex items-center justify-center`}>
                  <category.icon className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{category.name}</div>
                  <div className="text-xs text-gray-500">{category.count} paths</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Any Duration</option>
                  <option value="short">Short (≤4 months)</option>
                  <option value="medium">Medium (5-6 months)</option>
                  <option value="long">Long (7+ months)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="not-started">Not Started</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="popular">Most Popular</option>
                  <option value="rating">Highest Rated</option>
                  <option value="newest">Newest</option>
                  <option value="progress">My Progress</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">View</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Learning Paths Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {sortedPaths.length} Learning Path{sortedPaths.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-gray-600 text-sm">
                {selectedCategory !== 'all' && `in ${pathCategories.find(c => c.id === selectedCategory)?.name}`}
              </p>
            </div>
          </div>

          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-4'}`}>
            {sortedPaths.map((path) => (
              <motion.div
                key={path.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-all group cursor-pointer"
              >
                {viewMode === 'grid' ? (
                  <div>
                    {/* Path Header */}
                    <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl">
                          {path.thumbnail}
                        </div>
                        <div className="flex items-center space-x-2">
                          {path.bestseller && (
                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Bestseller
                            </span>
                          )}
                          {path.featured && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2 group-hover:text-yellow-200 transition-colors">
                        {path.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-3">{path.instructor}</p>
                      <div className="flex items-center space-x-4 text-white/80 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{path.rating}</span>
                          <span>({path.reviewsCount})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{path.studentsCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Path Body */}
                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{path.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{path.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4" />
                          <span>{path.totalCourses} courses</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4" />
                          <span>{path.difficulty}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>{path.totalHours}h total</span>
                        </div>
                      </div>

                      {/* Progress */}
                      {path.isEnrolled && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{path.progress}% ({path.completedCourses}/{path.totalCourses})</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${path.progress}%` }}
                            ></div>
                          </div>
                          
                          {/* Milestones */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">Learning Milestones</h4>
                            <div className="space-y-1">
                              {path.milestones.map((milestone) => (
                                <div key={milestone.id} className="flex items-center space-x-2 text-xs">
                                  {getStatusIcon(milestone.status)}
                                  <span className={`${
                                    milestone.status === 'completed' ? 'text-green-700' :
                                    milestone.status === 'in-progress' ? 'text-blue-700' :
                                    'text-gray-500'
                                  }`}>
                                    {milestone.title} ({milestone.courses} courses)
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Skills */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {path.skills.slice(0, 4).map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {path.skills.length > 4 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{path.skills.length - 4} more
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900">${path.price}</span>
                          {path.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${path.originalPrice}</span>
                          )}
                          {path.discount && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              {path.discount}% off
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Heart className={`h-4 w-4 ${path.isBookmarked ? 'fill-current text-red-500' : ''}`} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <button className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        path.isEnrolled
                          ? path.progress === 100
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-purple-600 text-white hover:bg-purple-700'
                      }`}>
                        {path.isEnrolled 
                          ? path.progress === 100 
                            ? 'View Certificate' 
                            : 'Continue Learning'
                          : 'Start Learning Path'
                        }
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-6 p-4">
                    <div className="w-24 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                      {path.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{path.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{path.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {path.instructor} • {path.duration} • {path.totalCourses} courses
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{path.studentsCount.toLocaleString()} students</span>
                        {path.isEnrolled && (
                          <span className="text-blue-600">{path.progress}% complete</span>
                        )}
                        <span className="text-lg font-bold text-gray-900">${path.price}</span>
                        <button className={`px-4 py-1 rounded text-sm transition-colors ${
                          path.isEnrolled 
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-purple-600 text-white hover:bg-purple-700'
                        }`}>
                          {path.isEnrolled ? 'Continue' : 'Start Path'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {sortedPaths.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No learning paths found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedDifficulty('all')
                  setSelectedDuration('all')
                  setSelectedStatus('all')
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-blue-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Route className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudiAI Learning Paths
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Your journey to expertise starts with a single step
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">All Paths</a>
              <a href="#" className="hover:text-blue-600 transition-colors">My Progress</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Certificates</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Career Guide</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
