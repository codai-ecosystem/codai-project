import React from 'react';

const TestStyles: React.FC = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                <h1 className="text-4xl font-bold text-white mb-4 animate-fade-in">
                    Tailwind CSS Test
                </h1>
                <p className="text-white/80 text-lg mb-6 animate-fade-in-up">
                    If you can see this styled correctly, Tailwind CSS is working!
                </p>
                <button className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 animate-pulse-glow">
                    Test Button
                </button>
            </div>
        </div>
    );
};

export default TestStyles;