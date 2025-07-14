'use client';

import React, { useState, useRef } from 'react';
import {
    Send, Paperclip, Bold, Italic, Link, List, Type,
    Sparkles, Wand2, RotateCcw, Save, X, User, Clock,
    Smile, ImageIcon, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

interface AIFeature {
    id: string;
    title: string;
    description: string;
    prompt: string;
    icon: React.ReactNode;
}

export default function AIComposer() {
    const [recipient, setRecipient] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [isAIAssisting, setIsAIAssisting] = useState(false);
    const [showAIFeatures, setShowAIFeatures] = useState(false);
    const [selectedTone, setSelectedTone] = useState('professional');
    const [isComposing, setIsComposing] = useState(false);

    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const aiFeatures: AIFeature[] = [
        {
            id: 'professional',
            title: 'Ton Profesional',
            description: 'Reformulează mesajul cu un ton profesional și formal',
            prompt: 'Reformulează acest text într-un stil profesional și formal:',
            icon: <Type className="h-4 w-4" />
        },
        {
            id: 'friendly',
            title: 'Ton Prietenos',
            description: 'Reformulează mesajul cu un ton prietenos și relaxat',
            prompt: 'Reformulează acest text într-un stil prietenos și accesibil:',
            icon: <Smile className="h-4 w-4" />
        },
        {
            id: 'improve',
            title: 'Îmbunătățește',
            description: 'Îmbunătățește claritatea și impactul mesajului',
            prompt: 'Îmbunătățește claritatea și impactul acestui text:',
            icon: <Sparkles className="h-4 w-4" />
        },
        {
            id: 'shorten',
            title: 'Scurtează',
            description: 'Creează o versiune mai scurtă și concisă',
            prompt: 'Scurtează acest text păstrând ideile principale:',
            icon: <RotateCcw className="h-4 w-4" />
        },
        {
            id: 'expand',
            title: 'Extinde',
            description: 'Adaugă detalii și contexte suplimentare',
            prompt: 'Extinde acest text cu detalii și contexte relevante:',
            icon: <Wand2 className="h-4 w-4" />
        }
    ];

    const tones = [
        { id: 'professional', name: 'Profesional', color: 'blue' },
        { id: 'friendly', name: 'Prietenos', color: 'green' },
        { id: 'formal', name: 'Formal', color: 'gray' },
        { id: 'casual', name: 'Casual', color: 'purple' }
    ];

    const templates = [
        {
            name: 'Întâlnire de lucru',
            subject: 'Programare întâlnire - {{topic}}',
            content: `Bună ziua,

Sper că acest email vă găsește în cea mai bună dispoziție. Aș dori să programez o întâlnire pentru a discuta despre {{topic}}.

Sunt disponibil(ă) în următoarele intervale:
- {{time1}}
- {{time2}}
- {{time3}}

Vă rog să-mi confirmați ce oră vă convine cel mai bine.

Cu respect,
{{name}}`
        },
        {
            name: 'Propunere colaborare',
            subject: 'Propunere de colaborare - {{project}}',
            content: `Bună ziua,

Mă numesc {{name}} și lucrez în domeniul {{domain}}. Am citit despre proiectul dumneavoastră {{project}} și sunt foarte interesat(ă) de o posibilă colaborare.

Experiența mea include:
- {{experience1}}
- {{experience2}}
- {{experience3}}

Aș aprecia foarte mult o discuție pentru a explora oportunitățile de colaborare.

Cu stimă,
{{name}}`
        },
        {
            name: 'Mulțumire',
            subject: 'Mulțumesc pentru {{reason}}',
            content: `Bună ziua,

Doresc să vă mulțumesc pentru {{reason}}. Apreciez foarte mult {{details}}.

{{additional_thanks}}

Cu recunoștință,
{{name}}`
        }
    ];

    const handleAIEnhancement = async (feature: AIFeature) => {
        if (!message.trim()) {
            alert('Vă rog să scrieți mai întâi un mesaj pentru a putea fi îmbunătățit de AI.');
            return;
        }

        setIsAIAssisting(true);

        // Simulate AI processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Mock AI enhancement
        let enhancedMessage = message;

        switch (feature.id) {
            case 'professional':
                enhancedMessage = `Stimată domnule/doamnă,

Prin prezenta doresc să vă transmit următoarele informații: ${message.toLowerCase()}

Vă mulțumesc pentru timpul acordat și rămân în așteptarea unui răspuns din partea dumneavoastră.

Cu deosebită considerație,
[Numele dumneavoastră]`;
                break;
            case 'friendly':
                enhancedMessage = `Salut!

${message} 😊

Sper să avem curând ocazia să discutăm mai mult despre acest subiect!

O zi frumoasă,
[Numele tău]`;
                break;
            case 'improve':
                enhancedMessage = `${message}\n\nPentru mai multe detalii, vă stau la dispoziție să clarific orice aspect.`;
                break;
            case 'shorten':
                enhancedMessage = message.split('.')[0] + '.';
                break;
            case 'expand':
                enhancedMessage = `${message}\n\nÎn plus, consider că ar fi util să menționez că acest subiect are o importanță deosebită pentru proiectul nostru comun. De asemenea, doresc să subliniez că sunt disponibil(ă) pentru orice clarificări suplimentare pe care le-ați putea avea.`;
                break;
        }

        setMessage(enhancedMessage);
        setIsAIAssisting(false);
        setShowAIFeatures(false);
    };

    const handleTemplateSelect = (template: any) => {
        setSubject(template.subject);
        setMessage(template.content);
    };

    const handleSend = () => {
        if (!recipient || !subject || !message) {
            alert('Vă rog să completați toate câmpurile.');
            return;
        }

        setIsComposing(true);
        // Simulate sending
        setTimeout(() => {
            alert('Email trimis cu succes!');
            setRecipient('');
            setSubject('');
            setMessage('');
            setIsComposing(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-semibold text-gray-900">Compune Email Nou</h1>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setShowAIFeatures(!showAIFeatures)}
                                className="flex items-center space-x-2 px-3 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                            >
                                <Sparkles className="h-4 w-4" />
                                <span>Asistent AI</span>
                            </button>
                            <button className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                <Save className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Main Composer */}
                    <div className="col-span-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {/* Email Form */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Către:
                                    </label>
                                    <input
                                        type="email"
                                        value={recipient}
                                        onChange={(e) => setRecipient(e.target.value)}
                                        placeholder="nume@exemplu.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Subiect:
                                    </label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Introduceți subiectul emailului"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                {/* Tone Selector */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tonul mesajului:
                                    </label>
                                    <div className="flex space-x-2">
                                        {tones.map((tone) => (
                                            <button
                                                key={tone.id}
                                                onClick={() => setSelectedTone(tone.id)}
                                                className={`px-3 py-1 text-sm rounded-full border transition-colors ${selectedTone === tone.id
                                                        ? `bg-${tone.color}-100 border-${tone.color}-300 text-${tone.color}-700`
                                                        : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {tone.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message Composer */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mesaj:
                                    </label>

                                    {/* Formatting Toolbar */}
                                    <div className="border border-gray-300 border-b-0 rounded-t-lg p-2 bg-gray-50 flex items-center space-x-2">
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <Bold className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <Italic className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <Link className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <div className="border-l border-gray-300 h-6 mx-2"></div>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <AlignLeft className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <AlignCenter className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <AlignRight className="h-4 w-4 text-gray-600" />
                                        </button>
                                        <div className="border-l border-gray-300 h-6 mx-2"></div>
                                        <button className="p-1 hover:bg-gray-200 rounded">
                                            <List className="h-4 w-4 text-gray-600" />
                                        </button>
                                    </div>

                                    <textarea
                                        ref={textareaRef}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Scrieți mesajul aici..."
                                        rows={12}
                                        className="w-full px-3 py-3 border border-gray-300 border-t-0 rounded-b-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* Attachments */}
                                <div className="flex items-center space-x-4">
                                    <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <Paperclip className="h-4 w-4" />
                                        <span>Atașează fișier</span>
                                    </button>
                                    <button className="flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                        <ImageIcon className="h-4 w-4" />
                                        <span>Inserează imagine</span>
                                    </button>
                                </div>

                                {/* Send Buttons */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="flex items-center space-x-2">
                                        <Clock className="h-4 w-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">Salvat automat</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <button className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                                            Salvează ca draft
                                        </button>
                                        <button
                                            onClick={handleSend}
                                            disabled={isComposing}
                                            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            <Send className="h-4 w-4" />
                                            <span>{isComposing ? 'Se trimite...' : 'Trimite'}</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-4 space-y-6">
                        {/* AI Features Panel */}
                        {showAIFeatures && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Asistent AI</h3>
                                    <button
                                        onClick={() => setShowAIFeatures(false)}
                                        className="p-1 hover:bg-gray-100 rounded"
                                    >
                                        <X className="h-4 w-4 text-gray-400" />
                                    </button>
                                </div>

                                {isAIAssisting && (
                                    <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <div className="animate-spin">
                                                <Sparkles className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <span className="text-sm text-purple-700">AI îmbunătățește textul...</span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    {aiFeatures.map((feature) => (
                                        <button
                                            key={feature.id}
                                            onClick={() => handleAIEnhancement(feature)}
                                            disabled={isAIAssisting || !message.trim()}
                                            className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <div className="flex items-start space-x-3">
                                                <div className="flex-shrink-0 mt-0.5 text-purple-600">
                                                    {feature.icon}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">{feature.title}</h4>
                                                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Templates */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-4">Șabloane Email</h3>
                            <div className="space-y-2">
                                {templates.map((template, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleTemplateSelect(template)}
                                        className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Quick Tips */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                            <h3 className="font-semibold text-gray-900 mb-4">Sfaturi Rapide</h3>
                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p>Folosește un subiect clar și concis</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p>Alege tonul potrivit pentru destinatar</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p>Lasă AI-ul să îmbunătățească mesajul</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p>Verifică de două ori adresa destinatarului</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
