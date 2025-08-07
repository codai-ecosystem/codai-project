'use client'

import React, { useState } from 'react'
import { 
  BookOpen,
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
  MapPin,
  Tag,
  Info,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { motion } from 'framer-motion'

export default function CoursesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [selectedDuration, setSelectedDuration] = useState('all')
  const [selectedRating, setSelectedRating] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const courseStats = [
    { icon: BookOpen, label: 'Total Courses', value: '856', change: '+47', color: 'text-blue-600' },
    { icon: Users, label: 'Enrolled Students', value: '12.4K', change: '+1.2K', color: 'text-green-600' },
    { icon: Award, label: 'Certificates Issued', value: '3,247', change: '+189', color: 'text-purple-600' },
    { icon: Star, label: 'Average Rating', value: '4.8', change: '+0.2', color: 'text-yellow-600' }
  ]

  const categories = [
    { id: 'all', name: 'All Categories', icon: Grid, count: 856, color: 'bg-gray-500' },
    { id: 'ai-ml', name: 'AI & Machine Learning', icon: Brain, count: 124, color: 'bg-purple-500' },
    { id: 'web-dev', name: 'Web Development', icon: Code, count: 186, color: 'bg-blue-500' },
    { id: 'data-science', name: 'Data Science', icon: BarChart3, count: 97, color: 'bg-green-500' },
    { id: 'design', name: 'Design & UX', icon: Palette, count: 73, color: 'bg-pink-500' },
    { id: 'business', name: 'Business', icon: Target, count: 89, color: 'bg-orange-500' },
    { id: 'science', name: 'Science', icon: Microscope, count: 65, color: 'bg-indigo-500' },
    { id: 'arts', name: 'Arts & Media', icon: Music, count: 52, color: 'bg-red-500' },
    { id: 'languages', name: 'Languages', icon: Globe, count: 87, color: 'bg-teal-500' },
    { id: 'math', name: 'Mathematics', icon: Calculator, count: 83, color: 'bg-yellow-500' }
  ]

  const courses = [
    {
      id: 1,
      title: 'Complete Machine Learning Bootcamp',
      instructor: 'Dr. Sarah Chen',
      instructorImage: '👩‍💻',
      category: 'ai-ml',
      level: 'intermediate',
      duration: '12 weeks',
      lessonsCount: 48,
      studentsCount: 2847,
      rating: 4.9,
      reviewsCount: 1256,
      price: 89,
      originalPrice: 149,
      thumbnail: '🤖',
      description: 'Master machine learning algorithms, neural networks, and deep learning with hands-on projects and real-world applications.',
      skills: ['Python', 'TensorFlow', 'Neural Networks', 'Data Analysis'],
      lastUpdated: '2 weeks ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      difficulty: 'Intermediate',
      progress: 0,
      isBookmarked: false,
      isEnrolled: false,
      discount: 40,
      bestseller: true,
      featured: true
    },
    {
      id: 2,
      title: 'React & Next.js Full Stack Development',
      instructor: 'Prof. Alex Rodriguez',
      instructorImage: '👨‍💼',
      category: 'web-dev',
      level: 'advanced',
      duration: '16 weeks',
      lessonsCount: 64,
      studentsCount: 3921,
      rating: 4.8,
      reviewsCount: 2134,
      price: 99,
      originalPrice: 179,
      thumbnail: '⚛️',
      description: 'Build modern web applications with React, Next.js, TypeScript, and deploy to production with best practices.',
      skills: ['React', 'Next.js', 'TypeScript', 'Node.js'],
      lastUpdated: '1 week ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      difficulty: 'Advanced',
      progress: 25,
      isBookmarked: true,
      isEnrolled: true,
      discount: 45,
      bestseller: true,
      featured: false
    },
    {
      id: 3,
      title: 'Data Science with Python',
      instructor: 'Dr. Emily Watson',
      instructorImage: '👩‍🔬',
      category: 'data-science',
      level: 'beginner',
      duration: '10 weeks',
      lessonsCount: 35,
      studentsCount: 1876,
      rating: 4.7,
      reviewsCount: 892,
      price: 79,
      originalPrice: 129,
      thumbnail: '📊',
      description: 'Learn data analysis, visualization, and statistical modeling using Python, pandas, and scikit-learn.',
      skills: ['Python', 'Pandas', 'Matplotlib', 'Statistics'],
      lastUpdated: '3 days ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      difficulty: 'Beginner',
      progress: 0,
      isBookmarked: false,
      isEnrolled: false,
      discount: 39,
      bestseller: false,
      featured: true
    },
    {
      id: 4,
      title: 'UX/UI Design Fundamentals',
      instructor: 'Maria Gonzalez',
      instructorImage: '👩‍🎨',
      category: 'design',
      level: 'beginner',
      duration: '8 weeks',
      lessonsCount: 28,
      studentsCount: 2156,
      rating: 4.8,
      reviewsCount: 1078,
      price: 69,
      originalPrice: 119,
      thumbnail: '🎨',
      description: 'Master user experience and interface design principles with hands-on projects using Figma and Adobe XD.',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
      lastUpdated: '5 days ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      difficulty: 'Beginner',
      progress: 0,
      isBookmarked: true,
      isEnrolled: false,
      discount: 42,
      bestseller: false,
      featured: false
    },
    {
      id: 5,
      title: 'Digital Marketing Mastery',
      instructor: 'James Thompson',
      instructorImage: '👨‍💼',
      category: 'business',
      level: 'intermediate',
      duration: '14 weeks',
      lessonsCount: 42,
      studentsCount: 3247,
      rating: 4.6,
      reviewsCount: 1534,
      price: 85,
      originalPrice: 155,
      thumbnail: '📈',
      description: 'Complete digital marketing course covering SEO, social media, content marketing, and analytics.',
      skills: ['SEO', 'Google Analytics', 'Social Media', 'Content Marketing'],
      lastUpdated: '1 week ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      difficulty: 'Intermediate',
      progress: 60,
      isBookmarked: false,
      isEnrolled: true,
      discount: 45,
      bestseller: true,
      featured: false
    },
    {
      id: 6,
      title: 'Advanced Physics: Quantum Mechanics',
      instructor: 'Dr. Robert Kim',
      instructorImage: '👨‍🔬',
      category: 'science',
      level: 'advanced',
      duration: '18 weeks',
      lessonsCount: 54,
      studentsCount: 892,
      rating: 4.9,
      reviewsCount: 456,
      price: 129,
      originalPrice: 199,
      thumbnail: '⚛️',
      description: 'Explore quantum mechanics principles, wave functions, and quantum field theory with mathematical rigor.',
      skills: ['Quantum Theory', 'Mathematics', 'Physics', 'Research Methods'],
      lastUpdated: '4 days ago',
      language: 'English',
      hasSubtitles: true,
      hasCertificate: true,
      difficulty: 'Advanced',
      progress: 0,
      isBookmarked: false,
      isEnrolled: false,
      discount: 35,
      bestseller: false,
      featured: true
    }
  ]

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel
    const matchesDuration = selectedDuration === 'all' || 
                           (selectedDuration === 'short' && parseInt(course.duration) <= 8) ||
                           (selectedDuration === 'medium' && parseInt(course.duration) > 8 && parseInt(course.duration) <= 16) ||
                           (selectedDuration === 'long' && parseInt(course.duration) > 16)
    const matchesRating = selectedRating === 'all' || 
                         (selectedRating === '4.5+' && course.rating >= 4.5) ||
                         (selectedRating === '4.0+' && course.rating >= 4.0)

    return matchesSearch && matchesCategory && matchesLevel && matchesDuration && matchesRating
  })

  const sortedCourses = [...filteredCourses].sort((a, b) => {
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
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-blue-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Course Catalog
                </h1>
                <p className="text-sm text-gray-600">Discover AI-powered learning experiences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search courses, instructors, skills..."
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
        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {courseStats.map((stat, index) => (
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
            {categories.map((category) => (
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
                  <div className="text-xs text-gray-500">{category.count} courses</div>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
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
                  <option value="short">Short (≤8 weeks)</option>
                  <option value="medium">Medium (9-16 weeks)</option>
                  <option value="long">Long (17+ weeks)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Any Rating</option>
                  <option value="4.5+">4.5+ Stars</option>
                  <option value="4.0+">4.0+ Stars</option>
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
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}

        {/* Course Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {sortedCourses.length} Course{sortedCourses.length !== 1 ? 's' : ''} Found
              </h2>
              <p className="text-gray-600 text-sm">
                {selectedCategory !== 'all' && `in ${categories.find(c => c.id === selectedCategory)?.name}`}
              </p>
            </div>
            
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

          <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
            {sortedCourses.map((course) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-all group cursor-pointer ${
                  viewMode === 'list' ? 'flex items-center space-x-6 p-4' : ''
                }`}
              >
                {viewMode === 'grid' ? (
                  <div>
                    {/* Course Header */}
                    <div className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-white text-2xl">
                          {course.thumbnail}
                        </div>
                        <div className="flex items-center space-x-2">
                          {course.bestseller && (
                            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Bestseller
                            </span>
                          )}
                          {course.featured && (
                            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-lg mb-2 group-hover:text-yellow-200 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-white/80 text-sm mb-3">{course.instructor}</p>
                      <div className="flex items-center space-x-4 text-white/80 text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{course.rating}</span>
                          <span>({course.reviewsCount})</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.studentsCount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Course Body */}
                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {course.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                        {course.skills.length > 3 && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                            +{course.skills.length - 3} more
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{course.lessonsCount} lessons</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Award className="h-4 w-4" />
                          <span>{course.difficulty}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Globe className="h-4 w-4" />
                          <span>{course.language}</span>
                        </div>
                      </div>

                      {course.isEnrolled && course.progress > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{course.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-gray-900">${course.price}</span>
                          {course.originalPrice && (
                            <span className="text-sm text-gray-500 line-through">${course.originalPrice}</span>
                          )}
                          {course.discount && (
                            <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                              {course.discount}% off
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                            <Heart className={`h-4 w-4 ${course.isBookmarked ? 'fill-current text-red-500' : ''}`} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                            <Share2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <button className={`w-full mt-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        course.isEnrolled
                          ? 'bg-green-600 text-white hover:bg-green-700'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}>
                        {course.isEnrolled ? 'Continue Learning' : 'Enroll Now'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-6 w-full">
                    <div className="w-24 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0">
                      {course.thumbnail}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 truncate">{course.title}</h3>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm">{course.rating}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{course.instructor} • {course.duration} • {course.lessonsCount} lessons</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{course.studentsCount.toLocaleString()} students</span>
                        <span className="text-lg font-bold text-gray-900">${course.price}</span>
                        <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700 transition-colors">
                          {course.isEnrolled ? 'Continue' : 'Enroll'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {sortedCourses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedLevel('all')
                  setSelectedDuration('all')
                  setSelectedRating('all')
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
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                StudiAI Course Catalog
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Discover your next learning adventure with AI-powered recommendations
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-blue-600 transition-colors">All Categories</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Free Courses</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Certificates</a>
              <a href="#" className="hover:text-blue-600 transition-colors">Help Center</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
