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

# Slide narrations (from PITCH_NARRATION.md - Updated to match actual 8-slide deck)
SLIDE_NARRATIONS = {
    1: """Hey everyone! We're ClauseCode AI - Clare, Clare, and Adeline from Nardin Academy. We're here to solve a problem that literally everyone has but nobody talks about. Have you ever actually read the Terms and Conditions before clicking 'Accept'? Yeah, we didn't think so. According to a 2017 Deloitte survey, 91% of consumers don't read them, and for our age group it's 97%. We're high school students who built an AI to read all the legal stuff so you don't have to. Let's dive in.""",
    
    2: """So here's what we're dealing with: First, nobody actually reads Terms and Conditions. That 91% statistic is real - from Deloitte. For people 18 to 34, it jumps to 97%. Second, even if you wanted to read them, they're absurdly long. TikTok's terms alone are 11,698 words - that would take over an hour and a half to read. A 2019 Pew Research study found only 9% of adults always read privacy policies. Companies are hiding sketchy clauses in there because they know we're not reading. And third, if you actually want legal help understanding this stuff? You're looking at hundreds of dollars for a lawyer. A 2024 survey found 39% of people sign contracts without understanding them, often because legal help is just too expensive. As students, we definitely can't afford that.""",
    
    3: """That's where ClauseCode AI comes in. We've got four key features that make us different. First, AI with personality. You can get serious analysis from our Lawyer mode, or switch to brainrot mode when you want it explained like a TikTok video. Your choice. Second, instant results. We're talking seconds, not days or hours. Third, actually helpful output. We find the sketchy stuff, summarize everything, and give you real advice on whether you should sign. And fourth, it works everywhere. Chrome, Safari, web app, mobile - wherever you are. But here's the best part - our users love it. We tested with 11 students and got 100% saying they liked it, 100% saying it was easy to use, and an average rating of 4.9 out of 5. One student said 'nothing, it's so cool' when asked what to improve. Another loved the brainrot personality because 'everyone's on TikTok so it uses terms all ages can understand.'""",
    
    4: """Here's how it works in three simple steps. Step one: Upload or paste your document. PDFs, Word docs, website links, or just copy-paste text directly into the extension. Step two: Choose your persona. We have five different AI personalities - from serious lawyer to full brainrot mode. Step three: Get instant analysis. You'll receive a comprehensive breakdown in seconds - red flags highlighted, plain-English summaries, and clear explanations of what everything actually means. We have a 30-second demo available if you want to see it in action analyzing a real Terms and Conditions document.""",
    
    5: """Let's talk about what goes in and what comes out. On the input side, we handle legal documents - PDFs, Word files, text files. We take website URLs for Terms and Conditions or Privacy Policies. You can paste text from any source. And you select which AI persona you want. For outputs, you get a plain-English summary of the whole document. Red flag warnings for any sketchy clauses. Key terms explained in simple language. Recommendations on whether you should actually sign this thing. And you can export the full analysis report to save or share.""",
    
    6: """We surveyed 10 students from grades 6 through 12, and the results speak for themselves. 100% liked the extension. 100% found it easy to use. 100% liked the design. Average rating: 4.9 out of 5. Now here's what's really interesting - personality matters. Brainrot was the most popular with 5 votes. Bob came in second with 4 votes. Why? Listen to what students said: One grade 11 student said 'Nothing its so cool' when asked what to change. A grade 12 student explained that brainrot works 'because everyone's on TikTok so it uses terms all ages can understand.' About Bob, students said 'I liked the emojis and humor' and even a 6th grader said 'because hes bob duh.' Students also suggested features we're now building - audio narration, visual elements, bold key terms, and loading animations. This feedback directly shaped our roadmap. The fact that students across such a wide age range - from 6th to 12th grade - all got value from the extension proves our solution works for everyone.""",
    
    7: """So how do we stack up against the competition? Speed: We give results in seconds. Traditional lawyers take days. Other AI tools are fast too, but... Cost: We're free or $5 to $19 per month. Traditional lawyers cost $200 to $500 or more. Other AI tools run $10 to $50 a month. Personality: We have 5 unique personas. Traditional lawyers are formal only. Other AI tools are generic and boring. Accessibility: Anyone can use our tool. Traditional legal is complex. Other AI tools are mainly for tech users. What makes us different? We're the only ones making legal stuff actually fun and relatable. Research shows 91% of consumers accept terms without reading - we're solving a real problem that everyone has.""",
    
    8: """So what's next for ClauseCode AI? In the immediate future - zero to three months - we're launching on Chrome Web Store and the App Store. We're aiming for 1,000 users through our school community and social media. We're adding a payment system for the Pro tier subscription. And we're expanding user testing to gather even more feedback. Three to six months out, we're adding support for more document types like contracts and leases. Developing mobile app improvements based on user feedback. Creating educational partnerships with schools. And building an API for third-party integrations. Long-term vision? We want to become the go-to tool for understanding any legal document. Partner with educational institutions for digital literacy programs. Expand to serve businesses analyzing vendor contracts. And ultimately, make legal understanding accessible to everyone, everywhere. Thanks for listening! Any questions?"""
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
