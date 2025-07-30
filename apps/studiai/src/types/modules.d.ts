// Module declarations for packages without TypeScript definitions

declare module '@tinymce/tinymce-react' {
    import * as React from 'react';

    export interface EditorProps {
        id?: string;
        initialValue?: string;
        value?: string;
        disabled?: boolean;
        tagName?: string;
        onEditorChange?: (content: string, editor: any) => void;
        onBeforeAddUndo?: (evt: any, editor: any) => void;
        onBlur?: (evt: any, editor: any) => void;
        onFocus?: (evt: any, editor: any) => void;
        onKeyDown?: (evt: any, editor: any) => void;
        onKeyPress?: (evt: any, editor: any) => void;
        onKeyUp?: (evt: any, editor: any) => void;
        onNodeChange?: (evt: any, editor: any) => void;
        onSelectionChange?: (evt: any, editor: any) => void;
        tinymceScriptSrc?: string;
        outputFormat?: 'html' | 'text';
        init?: any;
        [key: string]: any;
    }

    export const Editor: React.ComponentType<EditorProps>;
}

declare module 'firewand' {
    export interface FirewandOptions {
        apiKey?: string;
        debug?: boolean;
        baseUrl?: string;
    }

    export class Firewand {
        constructor(options?: FirewandOptions);
        init(): Promise<void>;
        execute(command: string): Promise<any>;
    }

    export default Firewand;
}

declare module '@codai/logai-sdk' {
    export interface LogAIConfig {
        apiKey: string;
        environment?: 'development' | 'production';
        debug?: boolean;
    }

    export interface LogEntry {
        level: 'debug' | 'info' | 'warn' | 'error';
        message: string;
        timestamp?: Date;
        metadata?: Record<string, any>;
    }

    export class LogAIClient {
        constructor(config: LogAIConfig);
        log(entry: LogEntry): Promise<void>;
        debug(message: string, metadata?: Record<string, any>): Promise<void>;
        info(message: string, metadata?: Record<string, any>): Promise<void>;
        warn(message: string, metadata?: Record<string, any>): Promise<void>;
        error(message: string, metadata?: Record<string, any>): Promise<void>;
    }

    export default LogAIClient;
}

declare module '@/utils/firebase/firebase.config' {
    import { FirebaseApp } from 'firebase/app';
    import { Firestore } from 'firebase/firestore';
    import { Auth } from 'firebase/auth';
    import { FirebaseStorage } from 'firebase/storage';

    export const firebaseApp: FirebaseApp | null;
    export const firestoreDB: Firestore | null;
    export const firebaseAuth: Auth | null;
    export const firebaseStorage: FirebaseStorage | null;

    // Safe access functions
    export function getFirebaseAuth(): Auth;
    export function getFirestoreDB(): Firestore;
    export function getFirebaseStorage(): FirebaseStorage;
    export function isFirebaseInitialized(): boolean;
}
