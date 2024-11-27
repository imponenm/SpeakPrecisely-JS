export declare enum TranscriptionEvents {
    Connected = "connected",
    Disconnected = "disconnected",
    Error = "error",
    Transcript = "transcript",
    MaxConnectionsReached = "maxConnectionsReached"
}
export interface TranscriptionResult {
    spokenLanguage: string;
    targetLanguages: Record<string, string>;
    is_final: boolean;
    speech_final: boolean;
}
export interface TranscriptionOptions {
    spokenLanguage: string;
    targetLanguages: string[];
}
export declare class SpeakPrecisely {
    private readonly publicKey;
    private ws;
    private mediaRecorder;
    private stream;
    private eventHandlers;
    private readonly baseUrl;
    constructor(publicKey: string);
    on(event: TranscriptionEvents, callback: Function): void;
    off(event: TranscriptionEvents, callback: Function): void;
    private emit;
    start({ spokenLanguage, targetLanguages }: TranscriptionOptions): Promise<void>;
    private setupMediaRecorder;
    stop(): void;
    isConnected(): boolean;
}
