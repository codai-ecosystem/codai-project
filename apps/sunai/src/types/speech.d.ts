// SunAI Speech Recognition Types
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition
        webkitSpeechRecognition: typeof SpeechRecognition
    }
}

export interface SpeechRecognition extends EventTarget {
    continuous: boolean
    interimResults: boolean
    lang: string
    maxAlternatives: number

    start(): void
    stop(): void
    abort(): void

    onstart: ((this: SpeechRecognition, ev: Event) => any) | null
    onend: ((this: SpeechRecognition, ev: Event) => any) | null
    onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null
    onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null
}

export interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList
    resultIndex: number
}

export interface SpeechRecognitionErrorEvent extends Event {
    error: string
    message: string
}

export interface SpeechRecognitionResultList {
    readonly length: number
    item(index: number): SpeechRecognitionResult
    [index: number]: SpeechRecognitionResult
}

export interface SpeechRecognitionResult {
    readonly length: number
    readonly isFinal: boolean
    item(index: number): SpeechRecognitionAlternative
    [index: number]: SpeechRecognitionAlternative
}

export interface SpeechRecognitionAlternative {
    readonly transcript: string
    readonly confidence: number
}

declare var SpeechRecognition: {
    prototype: SpeechRecognition
    new(): SpeechRecognition
}

declare var webkitSpeechRecognition: {
    prototype: SpeechRecognition
    new(): SpeechRecognition
}
