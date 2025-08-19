'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
    User,
    Mail,
    Phone,
    MapPin,
    Building,
    Calendar,
    Camera,
    Save,
    Edit,
    Eye,
    EyeOff,
    Globe,
    Clock,
    Award,
    Target
} from 'lucide-react'

interface UserProfile {
    firstName: string
    lastName: string
    email: string
    phone: string
    jobTitle: string
    department: string
    company: string
    location: string
    timezone: string
    language: string
    dateFormat: string
    bio: string
    avatar: string
    joinDate: string
    lastLogin: string
}

export default function ProfileSettings() {
    const [isEditing, setIsEditing] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [profile, setProfile] = useState<UserProfile>({
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@company.com',
        phone: '+1 (555) 123-4567',
        jobTitle: 'Senior Analytics Manager',
        department: 'Data Analytics',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        timezone: 'PST (UTC-8)',
        language: 'English',
        dateFormat: 'MM/DD/YYYY',
        bio: 'Experienced analytics professional with 8+ years in data science and business intelligence.',
        avatar: 'SJ',
        joinDate: 'January 15, 2024',
        lastLogin: '2 hours ago'
    })

    const [formData, setFormData] = useState(profile)

    const handleSave = () => {
        setProfile(formData)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setFormData(profile)
        setIsEditing(false)
    }

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
                    <p className="text-gray-600">Manage your personal information and preferences</p>
                </div>
                <div className="flex items-center space-x-3">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                            >
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <Edit className="w-4 h-4" />
                            <span>Edit Profile</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
            >
                {/* Avatar Section */}
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-8">
                    <div className="flex items-center space-x-6">
                        <div className="relative">
                            <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {profile.avatar}
                            </div>
                            {isEditing && (
                                <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
                                    <Camera className="w-4 h-4 text-gray-600" />
                                </button>
                            )}
                        </div>
                        <div className="text-white">
                            <h3 className="text-2xl font-bold">{profile.firstName} {profile.lastName}</h3>
                            <p className="text-blue-100">{profile.jobTitle}</p>
                            <p className="text-blue-200 text-sm">{profile.department} • {profile.company}</p>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-blue-100">
                                <span>Joined {profile.joinDate}</span>
                                <span>•</span>
                                <span>Last login {profile.lastLogin}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                <User className="w-5 h-5 text-blue-500" />
                                <span>Personal Information</span>
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.firstName}
                                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{profile.firstName}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={formData.lastName}
                                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{profile.lastName}</div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center space-x-2">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                        <span>{profile.email}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center space-x-2">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                        <span>{profile.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                                {isEditing ? (
                                    <textarea
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{profile.bio}</div>
                                )}
                            </div>
                        </div>

                        {/* Work Information */}
                        <div className="space-y-4">
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                                <Building className="w-5 h-5 text-green-500" />
                                <span>Work Information</span>
                            </h4>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.jobTitle}
                                        onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center space-x-2">
                                        <Award className="w-4 h-4 text-gray-500" />
                                        <span>{profile.jobTitle}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{profile.department}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900">{profile.company}</div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center space-x-2">
                                        <MapPin className="w-4 h-4 text-gray-500" />
                                        <span>{profile.location}</span>
                                    </div>
                                )}
                            </div>

                            {/* Preferences */}
                            <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 mt-6">
                                <Target className="w-5 h-5 text-purple-500" />
                                <span>Preferences</span>
                            </h4>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                                    {isEditing ? (
                                        <select
                                            value={formData.timezone}
                                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="PST (UTC-8)">PST (UTC-8)</option>
                                            <option value="MST (UTC-7)">MST (UTC-7)</option>
                                            <option value="CST (UTC-6)">CST (UTC-6)</option>
                                            <option value="EST (UTC-5)">EST (UTC-5)</option>
                                        </select>
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center space-x-2">
                                            <Clock className="w-4 h-4 text-gray-500" />
                                            <span>{profile.timezone}</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                                    {isEditing ? (
                                        <select
                                            value={formData.language}
                                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="English">English</option>
                                            <option value="Spanish">Spanish</option>
                                            <option value="French">French</option>
                                            <option value="German">German</option>
                                        </select>
                                    ) : (
                                        <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center space-x-2">
                                            <Globe className="w-4 h-4 text-gray-500" />
                                            <span>{profile.language}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date Format</label>
                                {isEditing ? (
                                    <select
                                        value={formData.dateFormat}
                                        onChange={(e) => setFormData({ ...formData, dateFormat: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
                                ) : (
                                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-gray-900 flex items-center space-x-2">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                        <span>{profile.dateFormat}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
