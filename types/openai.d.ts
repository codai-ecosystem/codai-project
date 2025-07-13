declare module 'openai' {
    export class OpenAI {
        constructor(options?: { apiKey?: string });

        chat: {
            completions: {
                create: (params: any) => Promise<any>;
            };
        };
    }
}
