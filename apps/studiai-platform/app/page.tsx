'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  BookOpen,
  Brain,
  GraduationCap,
  Users,
  Target,
  Zap,
  CheckCircle,
  Star,
  ArrowRight,
  Play,
  Award,
  TrendingUp,
  Clock,
  Shield
} from 'lucide-react'

export default function StudiAIHomepage() {
  const [activeFeature, setActiveFeature] = useState<keyof typeof features>('ai-tutoring')

  const features = {
    'ai-tutoring': {
      title: 'AI-Powered Personal Tutoring',
      description: 'Get personalized, one-on-one tutoring from our advanced AI tutor that adapts to your learning style and pace.',
      icon: Brain,
      benefits: ['24/7 availability', 'Adaptive learning', 'Instant feedback', 'Multi-subject support'],
      demo: 'Experience intelligent tutoring that understands exactly how you learn best.'
    },
    'course-creation': {
      title: 'Intelligent Course Creation',
      description: 'Create comprehensive, engaging courses with AI assistance that structures content optimally for learning.',
      icon: BookOpen,
      benefits: ['Auto-generated curriculum', 'Interactive content', 'Assessment creation', 'Progress tracking'],
      demo: 'Build professional courses in minutes with AI-powered content generation.'
    },
    'study-assistant': {
      title: 'Smart Study Assistant',
      description: 'Your AI study companion that helps with homework, research, note-taking, and exam preparation.',
      icon: GraduationCap,
      benefits: ['Homework help', 'Research assistance', 'Note organization', 'Exam preparation'],
      demo: 'Get instant help with any academic challenge, from simple questions to complex projects.'
    },
    'learning-analytics': {
      title: 'Advanced Learning Analytics',
      description: 'Track your progress with detailed analytics that identify strengths, weaknesses, and learning patterns.',
      icon: TrendingUp,
      benefits: ['Performance insights', 'Learning patterns', 'Goal tracking', 'Recommendation engine'],
      demo: 'Understand your learning journey with comprehensive analytics and personalized insights.'
    }
  }

  const stats = [
    { label: 'Active Learners', value: '100K+', icon: Users },
    { label: 'Courses Created', value: '50K+', icon: BookOpen },
    { label: 'Study Sessions', value: '1M+', icon: Brain },
    { label: 'Success Rate', value: '95%', icon: Target }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Computer Science Student',
      content: 'StudiAI helped me understand complex algorithms in ways my professors couldn\'t. The personalized approach is incredible.',
      rating: 5
    },
    {
      name: 'Marcus Johnson',
      role: 'High School Teacher',
      content: 'I use StudiAI to create engaging lesson plans. It saves hours of preparation time and my students love the interactive content.',
      rating: 5
    },
    {
      name: 'Dr. Elena Rodriguez',
      role: 'University Professor',
      content: 'The analytics help me understand how my students learn. StudiAI has revolutionized my teaching approach.',
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="relative z-20 px-6 py-4">
        <nav className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-studiai-500 to-education-500 rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold studiai-text-gradient">StudiAI</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 hover:text-studiai-600 transition-colors">Features</a>
            <a href="#courses" className="text-gray-700 hover:text-studiai-600 transition-colors">Courses</a>
            <a href="#analytics" className="text-gray-700 hover:text-studiai-600 transition-colors">Analytics</a>
            <a href="#pricing" className="text-gray-700 hover:text-studiai-600 transition-colors">Pricing</a>
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-studiai-600 hover:text-studiai-700 font-medium">Sign In</button>
            <button className="studiai-button">Get Started</button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="studiai-text-gradient">Transform Learning</span>
              <br />
              <span className="text-gray-800">with AI Excellence</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
              Experience the future of education with StudiAI's advanced AI platform.
              Personalized tutoring, intelligent course creation, and comprehensive study assistance
              that adapts to your unique learning style.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button className="studiai-button text-lg px-8 py-4">
                Start Learning Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="flex items-center text-studiai-600 hover:text-studiai-700 font-semibold">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="flex justify-center mb-3">
                    <stat.icon className="w-8 h-8 text-studiai-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="studiai-text-gradient">Powerful AI Features</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover how StudiAI's advanced features revolutionize the learning experience
              with personalized, intelligent, and adaptive educational tools.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Feature Selector */}
            <div className="space-y-4">
              {Object.entries(features).map(([key, feature]) => (
                <motion.div
                  key={key}
                  className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${activeFeature === key
                      ? 'studiai-card border-studiai-300 shadow-lg'
                      : 'bg-white/70 border border-gray-200 hover:shadow-md'
                    }`}
                  onClick={() => setActiveFeature(key as keyof typeof features)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-lg ${activeFeature === key ? 'bg-studiai-100' : 'bg-gray-100'
                      }`}>
                      <feature.icon className={`w-6 h-6 ${activeFeature === key ? 'text-studiai-600' : 'text-gray-600'
                        }`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <div className="grid grid-cols-2 gap-2">
                        {feature.benefits.map((benefit) => (
                          <div key={benefit} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="w-4 h-4 text-learning-500 mr-2" />
                            {benefit}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Feature Demo */}
            <div className="studiai-card p-8">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center mb-6">
                  <div className="p-4 bg-studiai-100 rounded-xl mr-4">
                    {React.createElement(features[activeFeature].icon, {
                      className: "w-8 h-8 text-studiai-600"
                    })}
                  </div>
                  <h3 className="text-2xl font-bold">{features[activeFeature].title}</h3>
                </div>

                <p className="text-lg text-gray-700 mb-6">
                  {features[activeFeature].demo}
                </p>

                <div className="bg-gradient-to-br from-studiai-50 to-education-50 p-6 rounded-xl mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-studiai-600">Demo Session</span>
                    <Clock className="w-4 h-4 text-studiai-600" />
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg text-sm">
                      <strong>Student:</strong> "Can you help me understand calculus derivatives?"
                    </div>
                    <div className="bg-studiai-100 p-3 rounded-lg text-sm">
                      <strong>StudiAI:</strong> "I'll create a personalized lesson based on your current level. Let's start with the concept of rate of change..."
                    </div>
                  </div>
                </div>

                <button className="studiai-button w-full">
                  Try {features[activeFeature].title}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="studiai-text-gradient">Loved by Educators</span>
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of students, teachers, and institutions transforming education with StudiAI
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="studiai-card p-6"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-gray-600 text-sm">{testimonial.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 studiai-gradient text-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join StudiAI today and experience the future of personalized education.
              Start your free trial and see the difference AI can make in your learning journey.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="bg-white text-studiai-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-lg transition-all duration-200 hover:scale-105">
                Start Free Trial
                <Award className="w-5 h-5 ml-2 inline" />
              </button>
              <button className="border-2 border-white text-white hover:bg-white hover:text-studiai-600 font-semibold py-4 px-8 rounded-lg transition-all duration-200">
                Schedule Demo
              </button>
            </div>

            <div className="flex items-center justify-center mt-8 text-sm opacity-80">
              <Shield className="w-4 h-4 mr-2" />
              No credit card required • 14-day free trial • Cancel anytime
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-studiai-500 to-education-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">StudiAI</span>
              </div>
              <p className="text-gray-400 mb-4">
                Transforming education through advanced AI technology and personalized learning experiences.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">AI Tutoring</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Course Creation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Study Assistant</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Analytics</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 StudiAI. All rights reserved. | Powered by CODAI Technology</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
