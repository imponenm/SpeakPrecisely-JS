'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// src/index.ts
exports.TranscriptionEvents = void 0;
(function (TranscriptionEvents) {
    TranscriptionEvents["Connected"] = "connected";
    TranscriptionEvents["Disconnected"] = "disconnected";
    TranscriptionEvents["Error"] = "error";
    TranscriptionEvents["Transcript"] = "transcript";
    TranscriptionEvents["MaxConnectionsReached"] = "maxConnectionsReached";
})(exports.TranscriptionEvents || (exports.TranscriptionEvents = {}));
class SpeakPrecisely {
    constructor(publicKey) {
        this.publicKey = publicKey;
        this.ws = null;
        this.mediaRecorder = null;
        this.stream = null;
        this.eventHandlers = new Map();
        this.baseUrl = 'wss://prod.speakprecisely.com/subtitles';
        // Initialize event handler sets for each event type
        Object.values(exports.TranscriptionEvents).forEach(event => {
            this.eventHandlers.set(event, new Set());
        });
    }
    on(event, callback) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.add(callback);
        }
    }
    off(event, callback) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.delete(callback);
        }
    }
    emit(event, ...args) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
            handlers.forEach(handler => handler(...args));
        }
    }
    async start({ spokenLanguage, targetLanguages }) {
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
                this.emit(exports.TranscriptionEvents.Connected);
            };
            this.ws.onclose = () => {
                this.emit(exports.TranscriptionEvents.Disconnected);
            };
            this.ws.onerror = (error) => {
                this.emit(exports.TranscriptionEvents.Error, error);
            };
            this.ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === "MAX_CONNECTIONS_REACHED") {
                    this.emit(exports.TranscriptionEvents.MaxConnectionsReached);
                    this.stop();
                    return;
                }
                if (data.type === "Results") {
                    this.emit(exports.TranscriptionEvents.Transcript, data);
                }
            };
        }
        catch (error) {
            this.emit(exports.TranscriptionEvents.Error, error);
            throw error;
        }
    }
    setupMediaRecorder() {
        if (!this.stream)
            return;
        this.mediaRecorder = new MediaRecorder(this.stream);
        this.mediaRecorder.ondataavailable = (event) => {
            var _a;
            if (event.data.size > 0 && ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN) {
                this.ws.send(event.data);
            }
        };
        this.mediaRecorder.start(250); // Send chunks every 250ms
    }
    stop() {
        var _a, _b, _c, _d;
        // Stop media recorder
        if (((_a = this.mediaRecorder) === null || _a === void 0 ? void 0 : _a.state) !== 'inactive') {
            (_b = this.mediaRecorder) === null || _b === void 0 ? void 0 : _b.stop();
        }
        // Stop all tracks in the stream
        (_c = this.stream) === null || _c === void 0 ? void 0 : _c.getTracks().forEach(track => track.stop());
        // Close WebSocket connection
        if (((_d = this.ws) === null || _d === void 0 ? void 0 : _d.readyState) === WebSocket.OPEN) {
            this.ws.close();
        }
        // Clear references
        this.mediaRecorder = null;
        this.stream = null;
        this.ws = null;
    }
    isConnected() {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) === WebSocket.OPEN;
    }
}

exports.SpeakPrecisely = SpeakPrecisely;
//# sourceMappingURL=index.js.map
