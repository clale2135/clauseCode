# ClauseCode AI - Pitch Deck with TTS

## What's Been Created

Your pitch deck now has professional TTS narration using ElevenLabs API!

### Files Created/Modified:

1. **`generate_tts.py`** - Python script to generate all audio files
2. **`pitch-deck.html`** - Updated with `<audio>` elements for all 11 slides
3. **`static/pitch-deck.js`** - Audio playback controls and auto-play logic
4. **`static/pitch-deck.css`** - Audio toggle button styling
5. **`config.py`** - Added ElevenLabs API key support
6. **`TTS_SETUP.md`** - Complete setup instructions
7. **`PITCH_NARRATION.md`** - Updated with all slide narrations
8. **`static/audio/`** - Directory created for audio files (empty until you run the script)

## Quick Start

### Step 1: Get ElevenLabs API Key

```bash
# Sign up at https://elevenlabs.io/
# Copy your API key from Profile Settings
```

### Step 2: Add to Environment

Add to your `.env` file:

```bash
ELEVENLABS_API_KEY="your-api-key-here"
```

### Step 3: Generate Audio Files

```bash
# Activate virtual environment
source venv/bin/activate

# Run TTS generator
python3 generate_tts.py
```

This will create 11 audio files in `static/audio/`:
- `slide_1.mp3` through `slide_11.mp3`
- Total generation time: ~2-3 minutes
- Uses your ElevenLabs free tier (10k chars/month)

### Step 4: Test It Out

```bash
# Start the server
python3 server.py

# Open in browser
# http://localhost:5001/pitch-deck.html
```

## Features

### ✅ Auto-Play Narration
- Audio plays automatically when navigating to each slide
- Smooth 300ms transition delay
- Previous slide audio stops automatically

### ✅ Audio Controls
- **🔊 Button**: Toggle audio on/off (top right corner)
- **Keyboard**: Arrow keys to navigate + auto-play
- **Touch**: Swipe on mobile devices
- **Dots**: Click to jump to any slide

### ✅ Smart Behavior
- Audio pauses when you switch browser tabs
- Autoplay respects browser policies
- If blocked, click 🔊 to enable

## File Structure

```
gwc/
├── pitch-deck.html           # Main presentation (with audio elements)
├── generate_tts.py           # TTS generation script
├── TTS_SETUP.md             # Detailed setup guide
├── PITCH_NARRATION.md        # Source narration text
├── static/
│   ├── audio/                # Generated MP3 files (11 slides)
│   │   ├── slide_1.mp3
│   │   ├── slide_2.mp3
│   │   └── ...
│   ├── pitch-deck.css        # Styles + audio button
│   └── pitch-deck.js         # Audio playback logic
└── config.py                 # API key configuration
```

## Customization

### Change Voice

Edit `generate_tts.py` line 23:

```python
VOICE_ID = "your-voice-id-here"
```

Find voice IDs in your ElevenLabs Voice Library.

### Update Narration

1. Edit text in `PITCH_NARRATION.md`
2. Copy changes to `generate_tts.py` (SLIDE_NARRATIONS dict)
3. Run `python3 generate_tts.py` again

### Adjust Voice Settings

Edit `generate_tts.py` lines 58-62:

```python
"voice_settings": {
    "stability": 0.5,          # 0-1: Higher = more consistent
    "similarity_boost": 0.75,  # 0-1: Voice accuracy  
    "style": 0.5,              # 0-1: Expressiveness
    "use_speaker_boost": True  # Boost clarity
}
```

## Troubleshooting

### "API Key Not Found"
- Make sure `.env` has `ELEVENLABS_API_KEY="..."`
- Check the key is valid on elevenlabs.io

### Audio Won't Play
- Browser blocked autoplay → Click 🔊 button
- Check browser console for errors
- Verify audio files exist in `static/audio/`

### Poor Quality
- Try different voice from Voice Library
- Adjust voice settings (stability, similarity_boost)
- Use paid tier for premium voices

### Rate Limited
- Free tier: 10k chars/month
- Your pitch deck: ~8,500 chars
- Upgrade to paid plan ($5/mo) for more

## Cost

**Free Tier (Recommended for Testing):**
- 10,000 characters/month
- Can generate pitch deck 1-2 times/month
- Perfect for development

**Starter Plan ($5/month):**
- 30,000 characters/month
- Multiple regenerations
- Access to more voices

## Production Deployment

### Option 1: Pre-generate Audio
1. Generate audio files locally
2. Commit to git: `git add static/audio/`
3. Deploy with audio files included

### Option 2: Generate on Server
1. Add `ELEVENLABS_API_KEY` to Google Secrets Manager
2. Run `generate_tts.py` during deployment
3. Audio files persist on server

### Recommended: Option 1
- Faster page loads (no generation delay)
- No API costs in production
- Files are small (~1-2MB each)

## Next Steps

1. ✅ Generate audio files (`python3 generate_tts.py`)
2. ✅ Test locally (`python3 server.py`)
3. ✅ Fine-tune voice settings if needed
4. ✅ Add `static/audio/` to git (or .gitignore)
5. ✅ Deploy with audio included

## Links

- **ElevenLabs:** https://elevenlabs.io/
- **Voice Library:** https://elevenlabs.io/voice-library
- **API Docs:** https://elevenlabs.io/docs/
- **Pricing:** https://elevenlabs.io/pricing

---

**Need Help?** Check `TTS_SETUP.md` for detailed instructions and troubleshooting.
