# AudioGuard - Smart Audio Watermarking System

A professional web application for securely embedding and extracting hidden audio within audio files using AI-powered transcription and reversible watermarking technology.

![AudioGuard](https://lovable.dev/opengraph-image-p98pqg.png)

## 🚀 Features

### Encoder
- **Dual Audio Upload**: Upload main audio and secret audio files
- **AI Transcription**: Automatic transcription of secret audio using OpenAI Whisper
- **Watermark Embedding**: Embed transcript as reversible metadata watermark
- **Unique Key Generation**: Generate secure decoding keys for extraction
- **Audio Preview**: Play and preview uploaded audio files
- **Download Output**: Download watermarked audio files

### Decoder
- **Watermark Extraction**: Extract hidden watermark from audio files
- **Key Validation**: Verify decoding keys against watermarked audio
- **Audio Reconstruction**: Reconstruct original secret audio using AI text-to-speech
- **Authenticity Check**: Validate audio authenticity and integrity
- **Smart Error Handling**: Comprehensive error messages for invalid inputs

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Beautiful component library
- **Vite** - Lightning-fast build tool
- **React Router** - Client-side routing

### Backend (Lovable Cloud)
- **Supabase Edge Functions** - Serverless backend
- **OpenAI Whisper** - Speech-to-text transcription
- **OpenAI TTS** - Text-to-speech synthesis
- **In-Memory Processing** - No permanent file storage

## 📋 Prerequisites

- Node.js 18+ and npm
- OpenAI API key (for Whisper STT and TTS)
- Lovable Cloud account (automatically configured)

### Python audio utilities

This repository includes a small Python helper for audio processing located at `scripts/process_audio.py`.
It uses `pydub` and `soundfile` (libsndfile) for resampling, channel conversion, and high-quality exports.

If you plan to use the CLI from the project root, install the Python dependencies listed in `python-requirements.txt` and the system packages `ffmpeg` and `libsndfile` (see `scripts/README_AUDIO.md` for details).

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd audioguard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure API Keys

The OpenAI API key is securely stored in Lovable Cloud. If you need to update it:

1. Go to your Lovable project
2. Navigate to Settings → Secrets
3. Update the `OPENAI_API_KEY` secret

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## 🎯 How It Works

### Encoding Process

1. **Upload**: User uploads main audio and secret audio files
2. **Transcription**: Secret audio is transcribed using OpenAI Whisper API
3. **Watermarking**: Transcript is embedded as metadata watermark in the main audio
4. **Key Generation**: Unique decoding key is generated containing:
   - Encrypted transcript
   - Audio hash for verification
   - Timestamp and metadata
5. **Output**: Watermarked audio and decoding key are provided for download

### Decoding Process

1. **Upload**: User uploads watermarked audio and enters decoding key
2. **Extraction**: System decodes the key to extract watermark data
3. **Validation**: Verifies key authenticity and watermark integrity
4. **Reconstruction**: Uses OpenAI TTS to synthesize the original secret audio from transcript
5. **Output**: Original secret audio is reconstructed and available for download

## 🔒 Security Features

- **Encrypted Keys**: Decoding keys use Base64 encoding with JSON structure
- **Hash Verification**: SHA-256 hashing for audio integrity checks
- **No Permanent Storage**: All processing happens in-memory
- **CORS Protection**: Secure CORS headers on all endpoints
- **Input Validation**: Comprehensive validation for all user inputs

## 📁 Project Structure

```
audioguard/
├── src/
│   ├── components/
│   │   ├── ui/              # Shadcn UI components
│   │   ├── AudioPlayer.tsx  # Audio playback component
│   │   └── FileUpload.tsx   # File upload component
│   ├── pages/
│   │   ├── Home.tsx         # Landing page
│   │   ├── Encoder.tsx      # Encoding interface
│   │   └── Decoder.tsx      # Decoding interface
│   ├── integrations/
│   │   └── supabase/        # Supabase client config
│   ├── App.tsx              # Main app component
│   └── index.css            # Global styles & design system
├── supabase/
│   └── functions/
│       ├── encode-audio/    # Encoding edge function
│       └── decode-audio/    # Decoding edge function
└── public/                  # Static assets
```

## 🎨 Design System

AudioGuard uses a professional audio production aesthetic:

- **Color Palette**: Dark background with electric blue accents
- **Typography**: Clean, modern font stack with excellent readability
- **Animations**: Smooth transitions and hover effects
- **Gradients**: Dynamic gradient backgrounds for emphasis
- **Shadows**: Glow effects for primary interactive elements

## 🚀 Deployment

### Deploy to Production

1. Open your Lovable project
2. Click **Publish** button (top-right on desktop, bottom-right on mobile)
3. Click **Update** to deploy frontend changes
4. Backend functions deploy automatically

### Custom Domain

1. Navigate to Project → Settings → Domains
2. Click "Connect Domain"
3. Follow DNS configuration instructions

Note: Custom domains require a paid Lovable plan.

## 📊 API Endpoints

### Encode Audio
```
POST /functions/v1/encode-audio
Content-Type: application/json

{
  "mainAudio": "<base64-encoded-audio>",
  "secretAudio": "<base64-encoded-audio>",
  "mainFileName": "main.mp3",
  "secretFileName": "secret.mp3"
}
```

**Response:**
```json
{
  "watermarkedAudio": "<base64-encoded-audio>",
  "decodingKey": "<base64-encoded-key>"
}
```

### Decode Audio
```
POST /functions/v1/decode-audio
Content-Type: application/json

{
  "watermarkedAudio": "<base64-encoded-audio>",
  "decodingKey": "<base64-key>",
  "fileName": "watermarked.mp3"
}
```

**Response:**
```json
{
  "valid": true,
  "extractedAudio": "<base64-encoded-audio>",
  "message": "Successfully decoded..."
}
```

## ⚠️ Error Handling

The application handles the following error cases:

- **Missing Files**: Validates all required files are uploaded
- **Invalid Keys**: Detects corrupted or incorrect decoding keys
- **API Failures**: Gracefully handles OpenAI API errors
- **Unsupported Formats**: Validates audio file formats
- **Network Issues**: Timeout handling and retry logic

## 🔮 Future Enhancements

- **Advanced DSP**: Implement frequency-domain watermarking
- **Multiple Codecs**: Support for WAV, FLAC, AAC formats
- **Batch Processing**: Process multiple files simultaneously
- **Key Management**: Store and manage decoding keys securely
- **Audio Analysis**: Visualize waveforms and spectrograms
- **Compression Resistant**: Watermarks that survive audio compression

## 📝 Technical Notes

### Watermarking Approach

Currently uses a **metadata-based approach** for simplicity:
- Transcript stored in encrypted form
- Key contains all necessary extraction data
- Audio reconstruction via TTS ensures high fidelity

For production deployment, consider:
- **LSB Steganography**: Hide data in least significant bits
- **Spread Spectrum**: Embed in frequency domain
- **Phase Encoding**: Use phase manipulation
- **Echo Hiding**: Add imperceptible echoes

### Audio Formats

Supported formats:
- MP3 (recommended)
- WAV
- M4A
- OGG
- WebM

## 🤝 Contributing

This project is built with [Lovable](https://lovable.dev) - an AI-powered development platform.

To contribute:
1. Make changes via Lovable prompts or your preferred IDE
2. Test thoroughly in development
3. Submit for review

## 📄 License

This project is private. All rights reserved.

## 🆘 Support

For issues or questions:
- Open an issue in the repository
- Contact via Lovable support
- Check [Lovable Documentation](https://docs.lovable.dev)

## 🌟 Acknowledgments

Built with:
- [Lovable](https://lovable.dev) - AI development platform
- [OpenAI](https://openai.com) - Whisper & TTS APIs
- [Supabase](https://supabase.com) - Backend infrastructure
- [Shadcn UI](https://ui.shadcn.com) - Component library

---

**AudioGuard** - Secure your audio, protect your content
