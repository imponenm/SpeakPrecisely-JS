// src/index.ts
export enum TranscriptionEvents {
    Connected = 'connected',
    Disconnected = 'disconnected',
    Error = 'error',
    Transcript = 'transcript',
    MaxConnectionsReached = 'maxConnectionsReached'
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
  
  export class SpeakPrecisely {
    private ws: WebSocket | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private stream: MediaStream | null = null;
    private eventHandlers: Map<TranscriptionEvents, Set<Function>> = new Map();
    private readonly baseUrl = 'wss://prod.speakprecisely.com/subtitles';
  
    constructor(private readonly publicKey: string) {
      // Initialize event handler sets for each event type
      Object.values(TranscriptionEvents).forEach(event => {
        this.eventHandlers.set(event as TranscriptionEvents, new Set());
      });
    }
  
    public on(event: TranscriptionEvents, callback: Function): void {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.add(callback);
      }
    }
  
    public off(event: TranscriptionEvents, callback: Function): void {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.delete(callback);
      }
    }
  
    private emit(event: TranscriptionEvents, ...args: any[]): void {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        handlers.forEach(handler => handler(...args));
      }
    }
  
    public async start({ spokenLanguage, targetLanguages }: TranscriptionOptions): Promise<void> {
      try {
        // Get microphone access
        this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Build WebSocket URL with parameters
        const params = new URLSearchParams({
          spokenLanguage,
          targetLanguages: targetLanguages.join(','),
          publicKey: this.publicKey
        });
        
        // Initialize WebSocket
        this.ws = new WebSocket(`${this.baseUrl}?${params}`);
        
        // Set up WebSocket event handlers
        this.ws.onopen = () => {
          this.setupMediaRecorder();
          this.emit(TranscriptionEvents.Connected);
        };
  
        this.ws.onclose = () => {
          this.emit(TranscriptionEvents.Disconnected);
        };
  
        this.ws.onerror = (error) => {
          this.emit(TranscriptionEvents.Error, error);
        };
  
        this.ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          
          if (data.type === "MAX_CONNECTIONS_REACHED") {
            this.emit(TranscriptionEvents.MaxConnectionsReached);
            this.stop();
            return;
          }
  
          if (data.type === "Results") {
            this.emit(TranscriptionEvents.Transcript, data);
          }
        };
  
      } catch (error) {
        this.emit(TranscriptionEvents.Error, error);
        throw error;
      }
    }
  
    private setupMediaRecorder(): void {
      if (!this.stream) return;
  
      this.mediaRecorder = new MediaRecorder(this.stream);
      
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && this.ws?.readyState === WebSocket.OPEN) {
          this.ws.send(event.data);
        }
      };
  
      this.mediaRecorder.start(250); // Send chunks every 250ms
    }
  
    public stop(): void {
      // Stop media recorder
      if (this.mediaRecorder?.state !== 'inactive') {
        this.mediaRecorder?.stop();
      }
  
      // Stop all tracks in the stream
      this.stream?.getTracks().forEach(track => track.stop());
  
      // Close WebSocket connection
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
  
      // Clear references
      this.mediaRecorder = null;
      this.stream = null;
      this.ws = null;
    }
  
    public isConnected(): boolean {
      return this.ws?.readyState === WebSocket.OPEN;
    }
  }