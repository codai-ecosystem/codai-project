'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, gradients } from '../../design-system/colors';
import { durations, easings } from '../../design-system/animations';

interface AboutSectionProps {
  className?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ className }) => {
  const { theme } = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: durations.normal,
        staggerChildren: 0.2,
        ease: easings.smooth,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: durations.slow,
        ease: easings.smooth,
      },
    },
  };

  const missionValues = [
    {
      icon: '🚀',
      title: 'Innovation Leadership',
      description: 'Pioneering the next generation of AI-powered development tools and platforms.',
    },
    {
      icon: '🤝',
      title: 'Developer Experience', 
      description: 'Creating intuitive, powerful tools that enhance productivity and creativity.',
    },
    {
      icon: '🌍',
      title: 'Global Impact',
      description: 'Building solutions that empower developers worldwide to create better software.',
    },
    {
      icon: '🔒',
      title: 'Security First',
      description: 'Enterprise-grade security and compliance built into every solution.',
    },
  ];

  const achievements = [
    { metric: '42+', label: 'Active Projects', icon: '📊' },
    { metric: '99.9%', label: 'Uptime SLA', icon: '⚡' },
    { metric: '50ms', label: 'Response Time', icon: '🚀' },
    { metric: '24/7', label: 'Global Support', icon: '🌍' },
  ];

  return (
    <section
      id="about"
      className={`relative py-24 lg:py-32 ${className}`}
      style={{
        background: gradients.background.section,
      }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, ${colors.primary[500]}15 0%, transparent 50%), radial-gradient(circle at 75% 75%, ${colors.secondary[500]}15 0%, transparent 50%)`,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center max-w-3xl mx-auto">
            <h2 
              className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-6"
              style={{
                background: gradients.text.primary,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Transforming Development with Intelligent AI
            </h2>
            <p 
              className="text-lg leading-relaxed"
              style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
            >
              CODAI represents the future of software development—an comprehensive ecosystem 
              of AI-powered tools designed to accelerate innovation, enhance productivity, 
              and democratize access to enterprise-grade development capabilities.
            </p>
          </motion.div>

          {/* Vision & Mission */}
          <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Vision */}
            <div 
              className="rounded-2xl p-8 border backdrop-blur-sm"
              style={{
                background: theme === 'dark' 
                  ? 'rgba(15, 23, 42, 0.8)' 
                  : 'rgba(255, 255, 255, 0.8)',
                borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: gradients.primary.main,
                  }}
                >
                  🔮
                </div>
                <h3 
                  className="text-xl font-semibold"
                  style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                >
                  Our Vision
                </h3>
              </div>
              <p 
                className="text-base leading-relaxed"
                style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
              >
                To create an AI-first development ecosystem where intelligent automation, 
                sophisticated reasoning, and seamless integration empower developers to 
                build the next generation of software solutions with unprecedented speed 
                and quality.
              </p>
            </div>

            {/* Mission */}
            <div 
              className="rounded-2xl p-8 border backdrop-blur-sm"
              style={{
                background: theme === 'dark' 
                  ? 'rgba(15, 23, 42, 0.8)' 
                  : 'rgba(255, 255, 255, 0.8)',
                borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
              }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{
                    background: gradients.ai.main,
                  }}
                >
                  🎯
                </div>
                <h3 
                  className="text-xl font-semibold"
                  style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                >
                  Our Mission
                </h3>
              </div>
              <p 
                className="text-base leading-relaxed"
                style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
              >
                We deliver production-ready AI development tools that combine cutting-edge 
                technology with enterprise reliability. From intelligent code generation 
                to autonomous testing and deployment, CODAI transforms complex development 
                workflows into streamlined, intelligent processes.
              </p>
            </div>
          </motion.div>

          {/* Core Values */}
          <motion.div variants={itemVariants}>
            <div className="text-center mb-12">
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
              >
                What Drives Us
              </h3>
              <p 
                className="text-base"
                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
              >
                The principles that guide our development philosophy and product decisions
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {missionValues.map((value, index) => (
                <motion.div
                  key={value.title}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: durations.slow,
                        delay: index * 0.1,
                        ease: easings.smooth,
                      },
                    },
                  }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: durations.fast, ease: easings.smooth }
                  }}
                  className="text-center group"
                >
                  <div 
                    className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center text-3xl mb-6 transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: theme === 'dark' 
                        ? `linear-gradient(135deg, ${colors.primary[600]}40, ${colors.secondary[600]}40)` 
                        : `linear-gradient(135deg, ${colors.primary[100]}80, ${colors.secondary[100]}80)`,
                      borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                    }}
                  >
                    {value.icon}
                  </div>
                  <h4 
                    className="text-lg font-semibold mb-3"
                    style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                  >
                    {value.title}
                  </h4>
                  <p 
                    className="text-sm leading-relaxed"
                    style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                  >
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Technology Leadership */}
          <motion.div variants={itemVariants}>
            <div 
              className="rounded-3xl p-12 border backdrop-blur-sm"
              style={{
                background: theme === 'dark' 
                  ? `linear-gradient(135deg, ${colors.primary[900]}30, ${colors.secondary[900]}20)` 
                  : `linear-gradient(135deg, ${colors.primary[50]}80, ${colors.secondary[50]}60)`,
                borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
              }}
            >
              <div className="text-center max-w-4xl mx-auto">
                <h3 
                  className="text-2xl lg:text-3xl font-bold mb-6"
                  style={{
                    background: gradients.text.primary,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Leading the AI Development Revolution
                </h3>
                <p 
                  className="text-lg leading-relaxed mb-8"
                  style={{ color: theme === 'dark' ? colors.text.secondary : colors.gray[600] }}
                >
                  Our comprehensive ecosystem spans from intelligent code generation and 
                  autonomous reasoning to financial AI and memory management systems. 
                  With enterprise-grade security, real-time collaboration, and advanced 
                  machine learning capabilities, CODAI is architecting the future of 
                  software development.
                </p>

                {/* Key Differentiators */}
                <div className="grid md:grid-cols-3 gap-8 mt-12">
                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                      style={{
                        background: gradients.primary.main,
                      }}
                    >
                      🧠
                    </div>
                    <h4 
                      className="text-base font-semibold mb-2"
                      style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                    >
                      Advanced AI Reasoning
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                    >
                      Multi-modal AI systems with autonomous problem-solving capabilities
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                      style={{
                        background: gradients.ai.main,
                      }}
                    >
                      ⚡
                    </div>
                    <h4 
                      className="text-base font-semibold mb-2"
                      style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                    >
                      Real-Time Performance
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                    >
                      Sub-50ms response times with distributed caching and optimization
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div 
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                      style={{
                        background: gradients.button.secondary,
                      }}
                    >
                      🔐
                    </div>
                    <h4 
                      className="text-base font-semibold mb-2"
                      style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
                    >
                      Enterprise Security
                    </h4>
                    <p 
                      className="text-sm"
                      style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                    >
                      SOC 2 compliance with advanced encryption and audit capabilities
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievement Metrics */}
          <motion.div variants={itemVariants} className="pt-8">
            <div className="text-center mb-12">
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: theme === 'dark' ? colors.text.primary : colors.gray[900] }}
              >
                Platform Performance
              </h3>
              <p 
                className="text-base"
                style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
              >
                Enterprise-grade metrics that define our commitment to excellence
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.label}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      transition: {
                        duration: durations.slow,
                        delay: index * 0.1,
                        ease: easings.smooth,
                      },
                    },
                  }}
                  whileHover={{ 
                    y: -4,
                    transition: { duration: durations.fast }
                  }}
                  className="text-center p-8 rounded-2xl border backdrop-blur-sm group"
                  style={{
                    background: theme === 'dark' 
                      ? 'rgba(15, 23, 42, 0.4)' 
                      : 'rgba(255, 255, 255, 0.4)',
                    borderColor: theme === 'dark' ? colors.border.primary : colors.gray[300],
                  }}
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {achievement.icon}
                  </div>
                  <div 
                    className="text-3xl font-bold mb-2"
                    style={{
                      background: gradients.primary.main,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {achievement.metric}
                  </div>
                  <div 
                    className="text-base font-medium"
                    style={{ color: theme === 'dark' ? colors.text.tertiary : colors.gray[600] }}
                  >
                    {achievement.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;