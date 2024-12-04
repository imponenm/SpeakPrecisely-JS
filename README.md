# SpeakPrecisely SDK

A Javascript SDK for connecting to the Speak Precisely Websocket API.

This API is for real-time transcription + translation. It's very fast, very accurate, and very easy to use. Just specify the speaker's language and the translation languages, then call the `start()` function.

The original transcript and all the translations are returned as the speaker talks. Latency has generally been <500ms from initial testing.

You'll need to create an account on the [Speak Precisely Dashboard](https://dashboard.speakprecisely.com) to get a public key for use with the API. In the future, we will also be supporting OAuth token validation for a wide range of identity providers.

### iOS, Android, and Websockets

If you'd like to implement on iOS, Android, or directly via websocket, please view our [API reference](https://docs.speakprecisely.com/docs/transcribe) instead.

## Supported languages

Please take a look at our docs page for [supported languages and language codes](https://docs.speakprecisely.com/docs/languages).

## Installation

### NPM
```bash
npm install speak-precisely-sdk
```

### CDN
```html
<script src="https://unpkg.com/speak-precisely-sdk"></script>
```

## Usage

### ES Modules
```javascript
import { SpeakPrecisely, TranscriptionEvents } from 'speak-precisely-sdk';

const client = new SpeakPrecisely('your-public-key');

client.on(TranscriptionEvents.Connected, () => {
  console.log('Connected to service');
});

client.on(TranscriptionEvents.Transcript, (result) => {
  console.log('Received transcript:', result);
});

await client.start({
  spokenLanguage: 'en-US',
  targetLanguages: ['es', 'fr']
});
```

### Browser Script
```html
<script src="https://unpkg.com/speak-precisely-sdk"></script>
<script>
  const client = new SpeakPrecisely('your-public-key');
  
  client.on(SpeakPrecisely.TranscriptionEvents.Connected, () => {
    console.log('Connected to service');
  });

  // Start transcription
  client.start({
    spokenLanguage: 'en-US',
    targetLanguages: ['es', 'fr']
  });
</script>
```

## Example Response
```json
{
  "type": "Results",
  "spokenLanguage": "Hello, how are you today?",
  "targetLanguages": {
    "es": "Hola, ¿cómo estás hoy?",
    "fr": "Bonjour, comment allez-vous aujourd'hui?",
    "de": "Hallo, wie geht es dir heute?"
  }
}
```

## API Reference

### `new SpeakPrecisely(publicKey: string)`
Creates a new instance of the SpeakPrecisely client.

### Methods
- `start(options: TranscriptionOptions): Promise<void>`
- `stop(): void`
- `on(event: TranscriptionEvents, callback: Function): void`
- `off(event: TranscriptionEvents, callback: Function): void`
- `isConnected(): boolean`

### Events
- `TranscriptionEvents.Connected`
- `TranscriptionEvents.Disconnected`
- `TranscriptionEvents.Error`
- `TranscriptionEvents.Transcript`
- `TranscriptionEvents.MaxConnectionsReached`

## License

MIT
