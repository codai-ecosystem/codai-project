/**
 * Type declarations for @xenova/transformers
 */
declare module '@xenova/transformers' {
    export interface Pipeline {
        (input: string | string[]): Promise<number[][]>;
    }

    export function pipeline(
        task: string,
        model?: string,
        options?: {
            device?: string;
            dtype?: string;
            progress_callback?: (progress: any) => void;
        }
    ): Promise<Pipeline>;

    export interface PreTrainedTokenizer {
        encode(text: string): Promise<number[]>;
        decode(tokens: number[]): Promise<string>;
    }

    export interface AutoTokenizer {
        from_pretrained(model: string): Promise<PreTrainedTokenizer>;
    }

    export const AutoTokenizer: AutoTokenizer;
}
