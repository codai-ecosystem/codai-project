declare module 'uuid' {
    export function v4(): string;
}

declare module 'ws' {
    interface WebSocketOptions {
        headers?: Record<string, string>;
    }

    class WebSocket {
        constructor(url: string, options?: WebSocketOptions);

        on(event: 'open', listener: () => void): this;
        on(event: 'message', listener: (data: Buffer | string) => void): this;
        on(event: 'close', listener: (code: number, reason: Buffer) => void): this;
        on(event: 'error', listener: (error: Error) => void): this;

        send(data: string | Buffer): void;
        close(code?: number, reason?: string): void;

        readyState: number;

        static readonly CONNECTING: number;
        static readonly OPEN: number;
        static readonly CLOSING: number;
        static readonly CLOSED: number;
    }

    namespace WebSocket {
        type Data = Buffer | string;
    }

    export = WebSocket;
}
