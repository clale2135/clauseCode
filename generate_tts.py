#!/usr/bin/env python3
"""
Generate TTS audio for pitch deck slides using ElevenLabs API
Voice: Clare
"""

import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get API key from environment or Google Secrets
try:
    from config import config
    ELEVENLABS_API_KEY = config.ELEVENLABS_API_KEY or os.getenv('ELEVENLABS_API_KEY')
except:
    ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')

# ElevenLabs API endpoint
VOICE_ID = "bCONBOmslvjFF1PGmw6C"  # Clare's voice
API_URL = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"

# Slide narrations (from PITCH_NARRATION.md)
SLIDE_NARRATIONS = {
    1: """Hey everyone! We're ClauseCode AI, and we're here to solve a problem that literally EVERYONE has but nobody talks about. Have you ever actually read the Terms and Conditions before clicking 'Accept'? Yeah, nobody does. We're high school students who built an AI to read the boring stuff so you don't have to. Let's dive in.""",
    
    2: """So here's the thing - we all just scroll to the bottom and hit 'Accept' without reading anything. It's basically a running joke at this point. But the problem is, companies know this, and some of them hide really sketchy stuff in there. Like, you might be agreeing to give away your data or losing your right to sue them. And if you actually wanted to understand what you're signing? You'd need to hire a lawyer, which costs hundreds of dollars. As students, that's just not happening. So we're stuck either trusting random companies or just... not using their apps.""",
    
    3: """That's where ClauseCode AI comes in. We built an AI that reads all the boring legal stuff for you, but here's the cool part - it has personality. You can get serious analysis from our 'Lawyer' mode when you need it professional, or switch to 'Brainrot' mode when you want it explained like a chaotic TikTok video. It works everywhere - Chrome extension, web app, iPhone app - wherever you need it. You upload a document or paste a link, pick your vibe, and boom - you get instant results about what's sketchy, what's fine, and whether you should actually sign it.""",
    
    4: """Under the hood, we're using ChatGPT 5.2 with a massive 400,000 token context window. That means it can read even the longest, most insane Terms and Conditions in one go. We've trained it specifically to spot legal red flags and explain them in plain English. You can upload pretty much anything - PDFs, Word docs, website links, or just copy-paste text. The whole thing runs in the cloud, so it works on your phone or computer, and it's fast. Like, you'll get your analysis in seconds, not hours.""",
    
    5: """Let's talk money - specifically, how much it costs us to run this. This is important because it shows we actually understand our economics. Fixed costs are about $30 per month. That's Google Cloud storage, our domain and SSL certificate, plus administrative costs like accounting and basic legal stuff. These stay constant no matter how many users we have. Variable costs scale with usage. First, server costs - about $8 per month for every 100 users because of increased API requests and bandwidth. Second, the AI costs. For a typical 3-page Terms and Conditions - that's about 500 words per page, or 2,250 tokens total - it costs us about 1 cent per analysis. That includes both the input processing and the output generation. So if we have 100 users doing 5 documents each, that's $30 fixed, plus $8 for servers, plus $5 in AI costs = $43 total per month. At 1,000 users? We're at $160 per month. With our $5 student tier, we hit profitability fast and margins improve as we scale.""",
    
    6: """Okay, so how do we make money? We're doing a freemium model that works for everyone - students, professionals, anyone who needs to read legal documents. Free tier gives you 5 documents a month with all the fun personas - that's enough for most people to try it and realize they need it. Then we have Pro for just $5 a month. We're pricing it at student-affordable levels because that's our superpower - being accessible to everyone. That's like, one boba tea. You get unlimited analyses, you can save and export your results, all the features unlocked. And eventually we want to partner with businesses and schools for team licenses. Companies analyzing vendor contracts, schools teaching students about digital literacy. That's the B2B play down the line.""",
    
    7: """Here's where being high school students is actually our biggest advantage. We're not marketing just to students - we're marketing to EVERYONE. But we're doing it with an authentic high school perspective that cuts through all the corporate BS. Think about it - when a high schooler makes a TikTok exposing how some app's Terms and Conditions lets them sell your data to advertisers, people actually watch it. It's not boring corporate content. It's real, it's relatable, and it resonates with everyone from teenagers to 40-year-old parents. We start by building community through TikTok, Instagram, Reddit. We're making content that exposes sketchy Terms and Conditions and it goes viral because it's genuinely interesting. Then we scale to mainstream with Chrome Store, App Store, and Product Hunt launches. The secret weapon is our unique voice. We're not trying to sound like a Silicon Valley startup. We ARE high school students calling out corporate BS, and everyone can relate to that.""",
    
    8: """So what about competition? Traditional lawyers are obviously way too expensive and slow. Other AI tools exist, but they're super generic and boring. They're built for lawyers, not for normal people. What makes us different is personality. We're the only ones making legal stuff actually fun and relatable. You can get the same document analyzed as a serious legal brief or as a chaotic meme explanation. That's our edge - we meet people where they are, and we make something scary into something approachable.""",
    
    9: """Quick intro to the team. I'm Clare Lee, I'm the founder. I built this because I got frustrated trying to understand app permissions and Terms of Conditions when I was building my own projects. Our dev team handled the Python backend and trained all the AI personas. They're the ones who made 'Brainrot mode' actually work, which was harder than you'd think. And our marketing team is running our TikTok and building community on Reddit and Discord. We're also getting help from our CS teachers, some legal professionals who think this is a good idea, and our school's entrepreneurship club. Shoutout to them.""",
    
    10: """So what are we shooting for? We're being realistic here. Year one, we want to hit 1,000 users. That's launching on Chrome Store and App Store and getting traction through viral social media content. Year two, 10,000 users and about $3,000 a month in revenue. That's when we really hit mainstream adoption with the general public - not just students, but anyone who needs to understand legal documents. Year three, 50,000 users and $15,000 monthly revenue. At that point we're partnering with businesses, schools, and maybe even getting into enterprise deals. The math works out - if we can convert 5% of free users to paid at $5/month, and keep our costs around $0.01 per document, we're profitable quickly and margins improve as we scale.""",
    
    11: """So where are we right now? We've already built the Chrome extension with all five AI personas - including brainrot mode, yes. We've got the iOS app working, the web version is live, and it's all deployed on Google Cloud, so it's actually out there in the world. Next six months, we're launching on Chrome Web Store and App Store officially. We're aiming for 1,000 users through viral social content. And we're adding the payment system so people can actually subscribe to Pro. Bottom line - we built this because we were tired of legal documents being scary and inaccessible. Being high school students, we bring an authentic perspective that resonates with everyone. We're not trying to sound corporate - we're calling out corporate BS in a way that people actually want to engage with. This isn't just for students. This is for everyone who's ever clicked 'Accept' without reading. Which is basically everyone. Thanks for listening. Any questions?"""
}

def generate_audio(slide_num, text):
    """Generate audio for a slide using ElevenLabs API"""
    
    if not ELEVENLABS_API_KEY:
        print(f"Error: ELEVENLABS_API_KEY not found in environment")
        print("Please add ELEVENLABS_API_KEY to your .env file")
        return False
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY
    }
    
    data = {
        "text": text,
        "model_id": "eleven_monolingual_v1",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.5,
            "use_speaker_boost": True
        }
    }
    
    print(f"Generating audio for Slide {slide_num}...")
    
    try:
        response = requests.post(API_URL, json=data, headers=headers)
        
        if response.status_code == 200:
            # Save audio file
            output_dir = "static/audio"
            os.makedirs(output_dir, exist_ok=True)
            
            output_file = f"{output_dir}/slide_{slide_num}.mp3"
            with open(output_file, "wb") as f:
                f.write(response.content)
            
            print(f"✓ Saved: {output_file}")
            return True
        else:
            print(f"✗ Error {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"✗ Exception: {e}")
        return False

def main():
    print("=" * 60)
    print("ClauseCode AI - TTS Audio Generator")
    print("=" * 60)
    print()
    
    if not ELEVENLABS_API_KEY:
        print("ERROR: ELEVENLABS_API_KEY not found!")
        print("\nPlease add your ElevenLabs API key to .env file:")
        print('ELEVENLABS_API_KEY="your-api-key-here"')
        print("\nGet your API key from: https://elevenlabs.io/")
        return
    
    print(f"Voice ID: {VOICE_ID}")
    print(f"Total slides: {len(SLIDE_NARRATIONS)}")
    print()
    
    # Generate audio for each slide
    success_count = 0
    for slide_num in sorted(SLIDE_NARRATIONS.keys()):
        text = SLIDE_NARRATIONS[slide_num]
        if generate_audio(slide_num, text):
            success_count += 1
        print()
    
    print("=" * 60)
    print(f"Completed: {success_count}/{len(SLIDE_NARRATIONS)} audio files generated")
    print("=" * 60)
    
    if success_count == len(SLIDE_NARRATIONS):
        print("\n✓ All audio files generated successfully!")
        print("Audio files saved to: static/audio/")
    else:
        print(f"\n⚠ Warning: Only {success_count} files generated")

if __name__ == "__main__":
    main()
