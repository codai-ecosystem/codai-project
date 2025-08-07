'use client';

import React, { useState } from 'react';
import {
    User,
    Edit,
    Camera,
    Mail,
    Phone,
    MapPin,
    Globe,
    Calendar,
    Shield,
    Award,
    Star,
    Github,
    Linkedin,
    Twitter,
    Link,
    Eye,
    EyeOff,
    Upload,
    Download,
    Save,
    X,
    Plus,
    Trash2,
    Settings,
    Bell,
    Lock,
    Key,
    Clock,
    Activity,
    BarChart3,
    Code,
    GitBranch,
    Target,
    Zap,
    Heart,
    Coffee,
    Briefcase,
    GraduationCap,
    Building,
    Users,
    MessageSquare,
    FileText,
    Database,
    Server,
    Layers,
    Monitor,
    Smartphone,
    Palette,
    Cpu,
    HardDrive,
    Network,
    Cloud,
    Terminal,
    Package,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    Flame,
    Tag,
    Bookmark
} from 'lucide-react';

interface ProfileData {
    personal: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        location: string;
        timezone: string;
        bio: string;
        title: string;
        company: string;
        website: string;
        avatar: string;
    };
    social: {
        github: string;
        linkedin: string;
        twitter: string;
        portfolio: string;
    };
    preferences: {
        theme: string;
        language: string;
        notifications: boolean;
        privacy: string;
        twoFactor: boolean;
    };
    skills: string[];
    experience: Array<{
        id: number;
        title: string;
        company: string;
        period: string;
        description: string;
    }>;
    education: Array<{
        id: number;
        degree: string;
        institution: string;
        period: string;
        description: string;
    }>;
    achievements: Array<{
        id: number;
        title: string;
        description: string;
        date: string;
        type: string;
    }>;
}

export default function ProfilePage() {
    const [selectedTab, setSelectedTab] = useState('overview');
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);

    const [profileData, setProfileData] = useState<ProfileData>({
        personal: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@codai.dev',
            phone: '+1 (555) 123-4567',
            location: 'San Francisco, CA',
            timezone: 'PST (UTC-8)',
            bio: 'Full-stack developer passionate about AI and modern web technologies. Building the future of intelligent development tools.',
            title: 'Senior AI Developer',
            company: 'CODAI',
            website: 'https://johndoe.dev',
            avatar: '/api/placeholder/120/120'
        },
        social: {
            github: 'johndoe',
            linkedin: 'john-doe-dev',
            twitter: '@johndoe_dev',
            portfolio: 'https://johndoe.dev'
        },
        preferences: {
            theme: 'dark',
            language: 'en',
            notifications: true,
            privacy: 'public',
            twoFactor: true
        },
        skills: [
            'TypeScript', 'React', 'Node.js', 'Python', 'AI/ML', 'Docker',
            'Kubernetes', 'AWS', 'GraphQL', 'PostgreSQL', 'Redis', 'Next.js'
        ],
        experience: [
            {
                id: 1,
                title: 'Senior AI Developer',
                company: 'CODAI',
                period: '2023 - Present',
                description: 'Leading AI development initiatives and building intelligent coding tools.'
            },
            {
                id: 2,
                title: 'Full Stack Developer',
                company: 'TechCorp',
                period: '2021 - 2023',
                description: 'Developed scalable web applications using React, Node.js, and cloud technologies.'
            },
            {
                id: 3,
                title: 'Software Engineer',
                company: 'StartupXYZ',
                period: '2019 - 2021',
                description: 'Built MVP products and contributed to rapid growth from 0 to 100k users.'
            }
        ],
        education: [
            {
                id: 1,
                degree: 'Master of Science in Computer Science',
                institution: 'Stanford University',
                period: '2017 - 2019',
                description: 'Specialized in Machine Learning and Artificial Intelligence.'
            },
            {
                id: 2,
                degree: 'Bachelor of Science in Software Engineering',
                institution: 'UC Berkeley',
                period: '2013 - 2017',
                description: 'Graduated Magna Cum Laude with focus on software architecture.'
            }
        ],
        achievements: [
            {
                id: 1,
                title: 'AI Innovation Award',
                description: 'Recognized for breakthrough contributions to automated code generation',
                date: '2024',
                type: 'award'
            },
            {
                id: 2,
                title: 'Open Source Contributor',
                description: '500+ contributions to major open source projects',
                date: '2023',
                type: 'milestone'
            },
            {
                id: 3,
                title: 'Tech Conference Speaker',
                description: 'Keynote speaker at 5+ international technology conferences',
                date: '2023',
                type: 'recognition'
            }
        ]
    });

    const profileStats = {
        projectsCompleted: 156,
        codeCommits: 2847,
        teamCollaborations: 23,
        achievementsEarned: 18,
        profileViews: 1234,
        connectionsCount: 456
    };

    const skillCategories = {
        'Frontend': ['React', 'TypeScript', 'Next.js', 'Vue.js', 'Angular'],
        'Backend': ['Node.js', 'Python', 'GraphQL', 'PostgreSQL', 'Redis'],
        'AI/ML': ['TensorFlow', 'PyTorch', 'OpenAI', 'Hugging Face', 'LangChain'],
        'DevOps': ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
        'Tools': ['Git', 'VS Code', 'Figma', 'Slack', 'Jira']
    };

    const handleSaveProfile = () => {
        // Save profile logic here
        setIsEditing(false);
    };

    const handleAddSkill = (skill: string) => {
        if (!profileData.skills.includes(skill)) {
            setProfileData(prev => ({
                ...prev,
                skills: [...prev.skills, skill]
            }));
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        setProfileData(prev => ({
            ...prev,
            skills: prev.skills.filter(skill => skill !== skillToRemove)
        }));
    };

    const getAchievementIcon = (type: string) => {
        switch (type) {
            case 'award': return <Award className="w-5 h-5 text-yellow-600" />;
            case 'milestone': return <Target className="w-5 h-5 text-blue-600" />;
            case 'recognition': return <Star className="w-5 h-5 text-purple-600" />;
            default: return <CheckCircle className="w-5 h-5 text-green-600" />;
        }
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-1">
                        Manage your personal information and professional profile
                    </p>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                    </button>
                    <button
                        onClick={() => setShowPrivacyModal(true)}
                        className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Shield className="w-4 h-4 mr-2" />
                        Privacy
                    </button>
                    <button
                        onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                        className="flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        {isEditing ? (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        ) : (
                            <>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Profile
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
                <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            {isEditing && (
                                <button
                                    onClick={() => setShowAvatarModal(true)}
                                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700"
                                >
                                    <Camera className="w-4 h-4 text-white" />
                                </button>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center space-x-3">
                                <h2 className="text-2xl font-bold">
                                    {profileData.personal.firstName} {profileData.personal.lastName}
                                </h2>
                                <div className="flex items-center space-x-2">
                                    {profileData.preferences.twoFactor && (
                                        <Shield className="w-5 h-5 text-green-300" />
                                    )}
                                    <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                                        {profileData.preferences.privacy === 'public' ? 'Public' : 'Private'}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center space-x-4 text-blue-100">
                                <span className="flex items-center">
                                    <Briefcase className="w-4 h-4 mr-1" />
                                    {profileData.personal.title}
                                </span>
                                <span className="flex items-center">
                                    <Building className="w-4 h-4 mr-1" />
                                    {profileData.personal.company}
                                </span>
                                <span className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {profileData.personal.location}
                                </span>
                            </div>

                            <p className="text-blue-100 max-w-2xl">
                                {profileData.personal.bio}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                            <div className="text-2xl font-bold">{profileStats.projectsCompleted}</div>
                            <div className="text-blue-200 text-sm">Projects</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{profileStats.codeCommits}</div>
                            <div className="text-blue-200 text-sm">Commits</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{profileStats.teamCollaborations}</div>
                            <div className="text-blue-200 text-sm">Teams</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { id: 'overview', name: 'Overview', icon: User },
                            { id: 'personal', name: 'Personal Info', icon: FileText },
                            { id: 'professional', name: 'Professional', icon: Briefcase },
                            { id: 'skills', name: 'Skills & Expertise', icon: Code },
                            { id: 'activity', name: 'Activity', icon: Activity }
                        ].map((tab) => {
                            const TabIcon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setSelectedTab(tab.id)}
                                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${selectedTab === tab.id
                                            ? 'border-blue-500 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <TabIcon className="w-4 h-4 mr-2" />
                                    {tab.name}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-6">
                    {selectedTab === 'overview' && (
                        <div className="space-y-6">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-blue-50 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600">{profileStats.profileViews}</div>
                                            <div className="text-sm text-blue-600">Profile Views</div>
                                        </div>
                                        <Eye className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">{profileStats.connectionsCount}</div>
                                            <div className="text-sm text-green-600">Connections</div>
                                        </div>
                                        <Users className="w-8 h-8 text-green-600" />
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-purple-600">{profileStats.achievementsEarned}</div>
                                            <div className="text-sm text-purple-600">Achievements</div>
                                        </div>
                                        <Award className="w-8 h-8 text-purple-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Recent Achievements */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h3>
                                <div className="space-y-4">
                                    {profileData.achievements.slice(0, 3).map((achievement) => (
                                        <div key={achievement.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                                {getAchievementIcon(achievement.type)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                                                <p className="text-sm text-gray-600">{achievement.description}</p>
                                                <p className="text-xs text-gray-500 mt-1">{achievement.date}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Top Skills */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Skills</h3>
                                <div className="flex flex-wrap gap-2">
                                    {profileData.skills.slice(0, 8).map((skill, index) => (
                                        <span
                                            key={index}
                                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {profileData.skills.length > 8 && (
                                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                                            +{profileData.skills.length - 8} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                                <div className="flex items-center space-x-4">
                                    {profileData.social.github && (
                                        <a
                                            href={`https://github.com/${profileData.social.github}`}
                                            className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
                                        >
                                            <Github className="w-4 h-4 mr-2" />
                                            GitHub
                                        </a>
                                    )}
                                    {profileData.social.linkedin && (
                                        <a
                                            href={`https://linkedin.com/in/${profileData.social.linkedin}`}
                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            <Linkedin className="w-4 h-4 mr-2" />
                                            LinkedIn
                                        </a>
                                    )}
                                    {profileData.social.twitter && (
                                        <a
                                            href={`https://twitter.com/${profileData.social.twitter.replace('@', '')}`}
                                            className="flex items-center px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
                                        >
                                            <Twitter className="w-4 h-4 mr-2" />
                                            Twitter
                                        </a>
                                    )}
                                    {profileData.social.portfolio && (
                                        <a
                                            href={profileData.social.portfolio}
                                            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                                        >
                                            <Link className="w-4 h-4 mr-2" />
                                            Portfolio
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'personal' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.personal.firstName}
                                        onChange={(e) => setProfileData(prev => ({
                                            ...prev,
                                            personal: { ...prev.personal, firstName: e.target.value }
                                        }))}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.personal.lastName}
                                        onChange={(e) => setProfileData(prev => ({
                                            ...prev,
                                            personal: { ...prev.personal, lastName: e.target.value }
                                        }))}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        value={profileData.personal.email}
                                        onChange={(e) => setProfileData(prev => ({
                                            ...prev,
                                            personal: { ...prev.personal, email: e.target.value }
                                        }))}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        value={profileData.personal.phone}
                                        onChange={(e) => setProfileData(prev => ({
                                            ...prev,
                                            personal: { ...prev.personal, phone: e.target.value }
                                        }))}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location
                                    </label>
                                    <input
                                        type="text"
                                        value={profileData.personal.location}
                                        onChange={(e) => setProfileData(prev => ({
                                            ...prev,
                                            personal: { ...prev.personal, location: e.target.value }
                                        }))}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Timezone
                                    </label>
                                    <select
                                        value={profileData.personal.timezone}
                                        onChange={(e) => setProfileData(prev => ({
                                            ...prev,
                                            personal: { ...prev.personal, timezone: e.target.value }
                                        }))}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                    >
                                        <option value="PST (UTC-8)">PST (UTC-8)</option>
                                        <option value="EST (UTC-5)">EST (UTC-5)</option>
                                        <option value="GMT (UTC+0)">GMT (UTC+0)</option>
                                        <option value="CET (UTC+1)">CET (UTC+1)</option>
                                        <option value="JST (UTC+9)">JST (UTC+9)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bio
                                </label>
                                <textarea
                                    rows={4}
                                    value={profileData.personal.bio}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        personal: { ...prev.personal, bio: e.target.value }
                                    }))}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                    placeholder="Tell us about yourself..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Website
                                </label>
                                <input
                                    type="url"
                                    value={profileData.personal.website}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        personal: { ...prev.personal, website: e.target.value }
                                    }))}
                                    disabled={!isEditing}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>
                        </div>
                    )}

                    {selectedTab === 'professional' && (
                        <div className="space-y-8">
                            {/* Current Position */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Position</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Job Title
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.personal.title}
                                            onChange={(e) => setProfileData(prev => ({
                                                ...prev,
                                                personal: { ...prev.personal, title: e.target.value }
                                            }))}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Company
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.personal.company}
                                            onChange={(e) => setProfileData(prev => ({
                                                ...prev,
                                                personal: { ...prev.personal, company: e.target.value }
                                            }))}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Work Experience */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
                                    {isEditing && (
                                        <button className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Experience
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {profileData.experience.map((exp) => (
                                        <div key={exp.id} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                                                    <p className="text-sm text-blue-600">{exp.company}</p>
                                                    <p className="text-sm text-gray-500">{exp.period}</p>
                                                    <p className="text-sm text-gray-600 mt-2">{exp.description}</p>
                                                </div>
                                                {isEditing && (
                                                    <div className="flex items-center space-x-2">
                                                        <button className="p-1 text-gray-400 hover:text-blue-600">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-gray-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Education */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Education</h3>
                                    {isEditing && (
                                        <button className="flex items-center px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg">
                                            <Plus className="w-4 h-4 mr-1" />
                                            Add Education
                                        </button>
                                    )}
                                </div>
                                <div className="space-y-4">
                                    {profileData.education.map((edu) => (
                                        <div key={edu.id} className="p-4 border border-gray-200 rounded-lg">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                                    <p className="text-sm text-blue-600">{edu.institution}</p>
                                                    <p className="text-sm text-gray-500">{edu.period}</p>
                                                    <p className="text-sm text-gray-600 mt-2">{edu.description}</p>
                                                </div>
                                                {isEditing && (
                                                    <div className="flex items-center space-x-2">
                                                        <button className="p-1 text-gray-400 hover:text-blue-600">
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button className="p-1 text-gray-400 hover:text-red-600">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Social Links */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            GitHub Username
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.social.github}
                                            onChange={(e) => setProfileData(prev => ({
                                                ...prev,
                                                social: { ...prev.social, github: e.target.value }
                                            }))}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                            placeholder="johndoe"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            LinkedIn Profile
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.social.linkedin}
                                            onChange={(e) => setProfileData(prev => ({
                                                ...prev,
                                                social: { ...prev.social, linkedin: e.target.value }
                                            }))}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                            placeholder="john-doe-dev"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Twitter Handle
                                        </label>
                                        <input
                                            type="text"
                                            value={profileData.social.twitter}
                                            onChange={(e) => setProfileData(prev => ({
                                                ...prev,
                                                social: { ...prev.social, twitter: e.target.value }
                                            }))}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                            placeholder="@johndoe_dev"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Portfolio URL
                                        </label>
                                        <input
                                            type="url"
                                            value={profileData.social.portfolio}
                                            onChange={(e) => setProfileData(prev => ({
                                                ...prev,
                                                social: { ...prev.social, portfolio: e.target.value }
                                            }))}
                                            disabled={!isEditing}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
                                            placeholder="https://johndoe.dev"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'skills' && (
                        <div className="space-y-8">
                            {/* Current Skills */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Your Skills</h3>
                                    <span className="text-sm text-gray-500">{profileData.skills.length} skills</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profileData.skills.map((skill, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm font-medium"
                                        >
                                            <span>{skill}</span>
                                            {isEditing && (
                                                <button
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    className="ml-2 text-blue-400 hover:text-blue-600"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skill Categories */}
                            {isEditing && (
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Skills</h3>
                                    <div className="space-y-4">
                                        {Object.entries(skillCategories).map(([category, skills]) => (
                                            <div key={category}>
                                                <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {skills.map((skill) => (
                                                        <button
                                                            key={skill}
                                                            onClick={() => handleAddSkill(skill)}
                                                            disabled={profileData.skills.includes(skill)}
                                                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${profileData.skills.includes(skill)
                                                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-600'
                                                                }`}
                                                        >
                                                            {profileData.skills.includes(skill) ? (
                                                                <CheckCircle className="w-3 h-3 inline mr-1" />
                                                            ) : (
                                                                <Plus className="w-3 h-3 inline mr-1" />
                                                            )}
                                                            {skill}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Achievements */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
                                <div className="space-y-4">
                                    {profileData.achievements.map((achievement) => (
                                        <div key={achievement.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                                {getAchievementIcon(achievement.type)}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{achievement.title}</h4>
                                                <p className="text-sm text-gray-600">{achievement.description}</p>
                                                <div className="flex items-center space-x-2 mt-2">
                                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${achievement.type === 'award' ? 'bg-yellow-100 text-yellow-600' :
                                                            achievement.type === 'milestone' ? 'bg-blue-100 text-blue-600' :
                                                                'bg-purple-100 text-purple-600'
                                                        }`}>
                                                        {achievement.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500">{achievement.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {selectedTab === 'activity' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-blue-50 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-blue-600">2,847</div>
                                            <div className="text-sm text-blue-600">Code Commits</div>
                                        </div>
                                        <Code className="w-8 h-8 text-blue-600" />
                                    </div>
                                </div>

                                <div className="bg-green-50 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-green-600">156</div>
                                            <div className="text-sm text-green-600">Projects</div>
                                        </div>
                                        <Briefcase className="w-8 h-8 text-green-600" />
                                    </div>
                                </div>

                                <div className="bg-purple-50 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-purple-600">23</div>
                                            <div className="text-sm text-purple-600">Teams</div>
                                        </div>
                                        <Users className="w-8 h-8 text-purple-600" />
                                    </div>
                                </div>

                                <div className="bg-orange-50 rounded-xl p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-2xl font-bold text-orange-600">1,234</div>
                                            <div className="text-sm text-orange-600">Code Reviews</div>
                                        </div>
                                        <MessageSquare className="w-8 h-8 text-orange-600" />
                                    </div>
                                </div>
                            </div>

                            {/* Activity Timeline */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                                <div className="space-y-4">
                                    {[
                                        {
                                            action: 'Completed project',
                                            target: 'AI Code Assistant v2.0',
                                            time: '2 hours ago',
                                            icon: CheckCircle,
                                            color: 'text-green-600'
                                        },
                                        {
                                            action: 'Pushed commits to',
                                            target: 'codai-ui-components',
                                            time: '4 hours ago',
                                            icon: Code,
                                            color: 'text-blue-600'
                                        },
                                        {
                                            action: 'Reviewed pull request for',
                                            target: 'Memory optimization improvements',
                                            time: '1 day ago',
                                            icon: MessageSquare,
                                            color: 'text-purple-600'
                                        },
                                        {
                                            action: 'Earned achievement',
                                            target: 'AI Innovation Award',
                                            time: '2 days ago',
                                            icon: Award,
                                            color: 'text-yellow-600'
                                        },
                                        {
                                            action: 'Joined team',
                                            target: 'Advanced AI Research',
                                            time: '1 week ago',
                                            icon: Users,
                                            color: 'text-green-600'
                                        }
                                    ].map((activity, index) => {
                                        const ActivityIcon = activity.icon;
                                        return (
                                            <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                                                    <ActivityIcon className={`w-5 h-5 ${activity.color}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm">
                                                        <span className="text-gray-600">{activity.action} </span>
                                                        <span className="font-medium text-gray-900">{activity.target}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">{activity.time}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Avatar Upload Modal */}
            {showAvatarModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Upload Profile Picture</h3>
                            <button
                                onClick={() => setShowAvatarModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600 mb-2">Upload a new profile picture</p>
                                <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                    Choose File
                                </button>
                            </div>

                            <div className="flex items-center justify-end space-x-3">
                                <button
                                    onClick={() => setShowAvatarModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                                    Upload
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Privacy Settings Modal */}
            {showPrivacyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 w-full max-w-lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Privacy Settings</h3>
                            <button
                                onClick={() => setShowPrivacyModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Profile Visibility
                                </label>
                                <select
                                    value={profileData.preferences.privacy}
                                    onChange={(e) => setProfileData(prev => ({
                                        ...prev,
                                        preferences: { ...prev.preferences, privacy: e.target.value }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="public">Public - Anyone can view</option>
                                    <option value="team">Team Only - Team members can view</option>
                                    <option value="private">Private - Only you can view</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                                    <div className="text-sm text-gray-600">Add an extra layer of security</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profileData.preferences.twoFactor}
                                        onChange={(e) => setProfileData(prev => ({
                                            ...prev,
                                            preferences: { ...prev.preferences, twoFactor: e.target.checked }
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="font-medium text-gray-900">Email Notifications</div>
                                    <div className="text-sm text-gray-600">Receive updates about your profile</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={profileData.preferences.notifications}
                                        onChange={(e) => setProfileData(prev => ({
                                            ...prev,
                                            preferences: { ...prev.preferences, notifications: e.target.checked }
                                        }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-end space-x-3 pt-4">
                                <button
                                    onClick={() => setShowPrivacyModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => setShowPrivacyModal(false)}
                                    className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
