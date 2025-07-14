'use client';

import React, { useState } from 'react';
import {
    User, Settings, Bell, Shield, Mail, Calendar, Palette,
    Save, Eye, EyeOff, Plus, Search, Edit, Trash2, Star,
    Phone, Building, MapPin, Globe, Download, Upload
} from 'lucide-react';

interface Contact {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    location?: string;
    avatar?: string;
    starred: boolean;
    tags: string[];
    lastContact: Date;
}

export default function SettingsAndContacts() {
    const [activeTab, setActiveTab] = useState('profile');
    const [searchContacts, setSearchContacts] = useState('');
    const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    // Mock contacts data
    const [contacts, setContacts] = useState<Contact[]>([
        {
            id: '1',
            name: 'Adrian Popescu',
            email: 'adrian@techstart.ro',
            phone: '+40 752 123 456',
            company: 'TechStart Romania',
            location: 'București',
            starred: true,
            tags: ['client', 'tech'],
            lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2)
        },
        {
            id: '2',
            name: 'Maria Ionescu',
            email: 'maria@designcorp.ro',
            phone: '+40 723 456 789',
            company: 'Design Corp',
            location: 'Cluj-Napoca',
            starred: false,
            tags: ['designer', 'freelancer'],
            lastContact: new Date(Date.now() - 1000 * 60 * 60 * 6)
        },
        {
            id: '3',
            name: 'Andrei Dumitrescu',
            email: 'andrei@innovation.ro',
            company: 'Innovation Hub',
            location: 'Timișoara',
            starred: true,
            tags: ['partner', 'business'],
            lastContact: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
        }
    ]);

    const [userSettings, setUserSettings] = useState({
        name: 'Ion Popescu',
        email: 'ion@codai.ro',
        phone: '+40 751 234 567',
        company: 'CODAI',
        position: 'Developer',
        timezone: 'Europe/Bucharest',
        language: 'ro',
        notifications: {
            email: true,
            desktop: true,
            sound: false,
            digest: true
        },
        privacy: {
            readReceipts: true,
            onlineStatus: true,
            emailTracking: false
        },
        appearance: {
            theme: 'light',
            density: 'comfortable',
            fontSize: 'medium'
        }
    });

    const tabs = [
        { id: 'profile', name: 'Profil', icon: <User className="h-4 w-4" /> },
        { id: 'notifications', name: 'Notificări', icon: <Bell className="h-4 w-4" /> },
        { id: 'privacy', name: 'Confidențialitate', icon: <Shield className="h-4 w-4" /> },
        { id: 'appearance', name: 'Aspect', icon: <Palette className="h-4 w-4" /> },
        { id: 'contacts', name: 'Contacte', icon: <Mail className="h-4 w-4" /> }
    ];

    const filteredContacts = contacts.filter(contact =>
        contact.name.toLowerCase().includes(searchContacts.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchContacts.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchContacts.toLowerCase())
    );

    const handleSettingChange = (section: string, key: string, value: any) => {
        setUserSettings(prev => ({
            ...prev,
            [section]: {
                ...(prev[section as keyof typeof prev] as any),
                [key]: value
            }
        }));
    };

    const handleContactAction = (action: string, contactId: string) => {
        switch (action) {
            case 'star':
                setContacts(prev => prev.map(contact =>
                    contact.id === contactId ? { ...contact, starred: !contact.starred } : contact
                ));
                break;
            case 'delete':
                setContacts(prev => prev.filter(contact => contact.id !== contactId));
                break;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-xl font-semibold text-gray-900">Setări și Contacte</h1>
                        <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <Save className="h-4 w-4" />
                            <span>Salvează</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Navigation Tabs */}
                    <div className="col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                                : 'hover:bg-gray-50 text-gray-700'
                                            }`}
                                    >
                                        {tab.icon}
                                        <span>{tab.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-9">
                        {/* Profile Settings */}
                        {activeTab === 'profile' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Informații Profil</h3>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Nume complet</label>
                                        <input
                                            type="text"
                                            value={userSettings.name}
                                            onChange={(e) => setUserSettings(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={userSettings.email}
                                            onChange={(e) => setUserSettings(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                                        <input
                                            type="tel"
                                            value={userSettings.phone}
                                            onChange={(e) => setUserSettings(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Compania</label>
                                        <input
                                            type="text"
                                            value={userSettings.company}
                                            onChange={(e) => setUserSettings(prev => ({ ...prev, company: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Poziția</label>
                                        <input
                                            type="text"
                                            value={userSettings.position}
                                            onChange={(e) => setUserSettings(prev => ({ ...prev, position: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Fus orar</label>
                                        <select
                                            value={userSettings.timezone}
                                            onChange={(e) => setUserSettings(prev => ({ ...prev, timezone: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="Europe/Bucharest">România (UTC+2)</option>
                                            <option value="Europe/London">Londra (UTC+0)</option>
                                            <option value="Europe/Berlin">Berlin (UTC+1)</option>
                                            <option value="America/New_York">New York (UTC-5)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h4 className="text-sm font-medium text-gray-900 mb-4">Schimbă parola</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Parola curentă</label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="Introdu parola curentă"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                                >
                                                    {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Parola nouă</label>
                                            <input
                                                type="password"
                                                placeholder="Introdu parola nouă"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Notifications Settings */}
                        {activeTab === 'notifications' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Setări Notificări</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Notificări email</h4>
                                            <p className="text-sm text-gray-600">Primește notificări prin email pentru emailuri noi</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={userSettings.notifications.email}
                                                onChange={(e) => handleSettingChange('notifications', 'email', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Notificări desktop</h4>
                                            <p className="text-sm text-gray-600">Afișează notificări pe desktop</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={userSettings.notifications.desktop}
                                                onChange={(e) => handleSettingChange('notifications', 'desktop', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Sunet notificări</h4>
                                            <p className="text-sm text-gray-600">Redă sunete pentru notificări noi</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={userSettings.notifications.sound}
                                                onChange={(e) => handleSettingChange('notifications', 'sound', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Rezumat zilnic</h4>
                                            <p className="text-sm text-gray-600">Primește un rezumat zilnic cu activitatea email</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={userSettings.notifications.digest}
                                                onChange={(e) => handleSettingChange('notifications', 'digest', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Contacts Management */}
                        {activeTab === 'contacts' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Gestionare Contacte</h3>
                                        <div className="flex items-center space-x-3">
                                            <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                                <Upload className="h-4 w-4" />
                                                <span>Import</span>
                                            </button>
                                            <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                                <Download className="h-4 w-4" />
                                                <span>Export</span>
                                            </button>
                                            <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                <Plus className="h-4 w-4" />
                                                <span>Contact nou</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Caută contacte..."
                                            value={searchContacts}
                                            onChange={(e) => setSearchContacts(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {filteredContacts.map((contact) => (
                                        <div
                                            key={contact.id}
                                            onClick={() => setSelectedContact(contact)}
                                            className="p-4 hover:bg-gray-50 cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-900">{contact.name}</h4>
                                                        <p className="text-sm text-gray-600">{contact.email}</p>
                                                        {contact.company && (
                                                            <p className="text-xs text-gray-500">{contact.company}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex flex-wrap gap-1">
                                                        {contact.tags.map((tag, index) => (
                                                            <span
                                                                key={index}
                                                                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleContactAction('star', contact.id);
                                                        }}
                                                        className={`p-1 rounded ${contact.starred ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'}`}
                                                    >
                                                        <Star className={`h-4 w-4 ${contact.starred ? 'fill-current' : ''}`} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setSelectedContact(contact);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-blue-600 rounded"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleContactAction('delete', contact.id);
                                                        }}
                                                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Other tabs content would go here */}
                        {activeTab === 'privacy' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Setări Confidențialitate</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Confirmări de citire</h4>
                                            <p className="text-sm text-gray-600">Permite destinatarilor să vadă când citești emailurile</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={userSettings.privacy.readReceipts}
                                                onChange={(e) => handleSettingChange('privacy', 'readReceipts', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Status online</h4>
                                            <p className="text-sm text-gray-600">Afișează când ești online altor utilizatori</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={userSettings.privacy.onlineStatus}
                                                onChange={(e) => handleSettingChange('privacy', 'onlineStatus', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-sm font-medium text-gray-900">Urmărire emailuri</h4>
                                            <p className="text-sm text-gray-600">Permite urmărirea emailurilor trimise</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={userSettings.privacy.emailTracking}
                                                onChange={(e) => handleSettingChange('privacy', 'emailTracking', e.target.checked)}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'appearance' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Setări Aspect</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Temă</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['light', 'dark', 'auto'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => handleSettingChange('appearance', 'theme', theme)}
                                                    className={`p-3 border rounded-lg text-sm ${userSettings.appearance.theme === theme
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {theme === 'light' ? 'Deschis' : theme === 'dark' ? 'Întunecat' : 'Automat'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Densitate</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['compact', 'comfortable', 'spacious'].map((density) => (
                                                <button
                                                    key={density}
                                                    onClick={() => handleSettingChange('appearance', 'density', density)}
                                                    className={`p-3 border rounded-lg text-sm ${userSettings.appearance.density === density
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {density === 'compact' ? 'Compact' : density === 'comfortable' ? 'Confortabil' : 'Spațios'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-3">Mărime font</label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {['small', 'medium', 'large'].map((fontSize) => (
                                                <button
                                                    key={fontSize}
                                                    onClick={() => handleSettingChange('appearance', 'fontSize', fontSize)}
                                                    className={`p-3 border rounded-lg text-sm ${userSettings.appearance.fontSize === fontSize
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                            : 'border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                >
                                                    {fontSize === 'small' ? 'Mic' : fontSize === 'medium' ? 'Mediu' : 'Mare'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
