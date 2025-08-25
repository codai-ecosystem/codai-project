// Jest setup file for METU app - JSDOM environment
import '@testing-library/jest-dom'

// Add React globals for JSX
import React from 'react'
global.React = React

// Mock Web Speech API
global.SpeechRecognition = jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    continuous: false,
    interimResults: false,
    lang: 'en-US'
}));

global.webkitSpeechRecognition = global.SpeechRecognition;

global.SpeechSynthesis = jest.fn().mockImplementation(() => ({
    speak: jest.fn(),
    cancel: jest.fn(),
    pause: jest.fn(),
    resume: jest.fn(),
    getVoices: jest.fn(() => []),
    addEventListener: jest.fn()
}));

global.speechSynthesis = new global.SpeechSynthesis();

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
    text: text || '',
    voice: null,
    volume: 1,
    rate: 1,
    pitch: 1,
    lang: 'en-US',
    addEventListener: jest.fn()
}));

// Mock Audio Context
global.AudioContext = jest.fn().mockImplementation(() => ({
    createAnalyser: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
        getByteFrequencyData: jest.fn(),
        frequencyBinCount: 1024,
        fftSize: 2048,
    })),
    createMediaStreamSource: jest.fn(() => ({
        connect: jest.fn(),
        disconnect: jest.fn(),
    })),
    resume: jest.fn(),
    close: jest.fn(),
    state: 'running',
}));

global.webkitAudioContext = global.AudioContext;

// Mock localStorage
global.localStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

// Mock sessionStorage
global.sessionStorage = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};

// Mock fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        status: 200,
        statusText: 'OK'
    })
);

// Mock console methods to reduce noise in tests
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
    if (
        typeof args[0] === 'string' &&
        (args[0].includes('canvas') ||
            args[0].includes('JSDOM'))
    ) {
        return;
    }
    originalConsoleWarn.apply(console, args);
};
