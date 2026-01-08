# Text-to-Speech Setup for Pitch Deck

## Overview

The pitch deck now includes TTS narration for all 11 slides using ElevenLabs API. Each slide has audio that auto-plays when you navigate to it, with Clare's voice reading the narration.

## Setup Instructions

### 1. Get ElevenLabs API Key

1. Go to [https://elevenlabs.io/](https://elevenlabs.io/)
2. Sign up for an account (free tier available)
3. Go to your Profile Settings
4. Copy your API key

### 2. Add API Key to Environment

Add the ElevenLabs API key to your `.env` file:

```bash
ELEVENLABS_API_KEY="your-api-key-here"
```

### 3. Get Clare's Voice ID (Optional)

If you want to use a specific voice called "Clare":

1. Log into ElevenLabs
2. Go to Voice Library
3. Find or create the "Clare" voice
4. Copy the Voice ID
5. Update `generate_tts.py` line 23:

```python
VOICE_ID = "your-clare-voice-id-here"
```

Default voice is "Rachel" (ID: `21m00Tcm4TlvDq8ikWAM`)

### 4. Generate Audio Files

Run the TTS generation script:

```bash
# Activate virtual environment
source venv/bin/activate

# Run the generator
python3 generate_tts.py
```

This will:
- Read all 11 slide narrations from the script
- Call ElevenLabs API to generate audio
- Save MP3 files to `static/audio/`
- Create files: `slide_1.mp3` through `slide_11.mp3`

**Time:** Takes about 2-3 minutes to generate all files
**Cost:** Free tier includes 10,000 characters/month (should cover the pitch deck)

### 5. Test the Pitch Deck

1. Start the server:
```bash
python3 server.py
```

2. Open pitch deck:
```
http://localhost:5001/pitch-deck.html
```

3. Audio should auto-play on each slide
4. Use the 🔊 button to toggle audio on/off

## Features

### Auto-Play Audio
- Audio automatically plays when navigating to a new slide
- 300ms delay for smooth transition
- Previous slide's audio stops automatically

### Audio Controls
- 🔊 button in top right to toggle audio on/off
- Click to mute/unmute
- Audio pauses when you switch browser tabs

### Navigation
- Arrow keys: Next/previous slide (audio plays automatically)
- Click dots: Jump to specific slide
- Swipe on mobile: Navigate with touch

## Troubleshooting

### Audio Not Playing
**Problem:** Browser blocking autoplay
**Solution:** Click the 🔊 button or anywhere on the slide to enable audio

### "API Key Not Found" Error
**Problem:** Environment variable not set
**Solution:** Make sure `.env` file has `ELEVENLABS_API_KEY="..."`

### Audio Files Missing
**Problem:** Script hasn't been run yet
**Solution:** Run `python3 generate_tts.py`

### Poor Audio Quality
**Problem:** Voice settings need adjustment
**Solution:** Edit `generate_tts.py` lines 58-62:
```python
"voice_settings": {
    "stability": 0.5,      # 0-1: Higher = more consistent
    "similarity_boost": 0.75,  # 0-1: Voice accuracy
    "style": 0.5,          # 0-1: Expressiveness
    "use_speaker_boost": True
}
```

### Rate Limiting
**Problem:** Free tier limit reached (10k chars/month)
**Solution:** Upgrade to paid plan or wait until next month

## Cost Estimate

**Free Tier:**
- 10,000 characters/month
- Pitch deck uses ~8,500 characters
- Can regenerate 1-2 times per month

**Paid Tier ($5/month):**
- 30,000 characters/month
- Regenerate multiple times
- Higher quality voices available

## File Structure

```
gwc/
├── generate_tts.py          # Script to generate audio
├── static/
│   ├── audio/               # Generated audio files (gitignored)
│   │   ├── slide_1.mp3
│   │   ├── slide_2.mp3
│   │   └── ... (through slide_11.mp3)
│   ├── pitch-deck.css       # Includes audio button styles
│   └── pitch-deck.js        # Audio playback logic
├── pitch-deck.html          # Includes <audio> elements
└── PITCH_NARRATION.md       # Source text for all narrations
```

## Regenerating Audio

If you update the narration text:

1. Edit the text in `PITCH_NARRATION.md`
2. Copy updated text to `generate_tts.py` (SLIDE_NARRATIONS dict)
3. Run `python3 generate_tts.py` again
4. New audio files will overwrite old ones

## Alternative: Manual Upload

If you prefer to generate audio elsewhere:

1. Use any TTS service to create MP3 files
2. Name them: `slide_1.mp3` through `slide_11.mp3`
3. Place in `static/audio/` directory
4. Audio will work automatically

## Notes

- Audio files are excluded from git (add `static/audio/` to `.gitignore`)
- Total audio length: ~9 minutes
- Each file is ~1-2MB
- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
