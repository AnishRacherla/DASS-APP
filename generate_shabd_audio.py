import os
from gtts import gTTS

# Create directory if it doesn't exist
output_dir = "backend/assets/audio/shabd"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Shabd Vocabulary
hindi_vocab = [
    {"word": "कुत्ता", "filename": "dog_hi.mp3"},
    {"word": "बिल्ली", "filename": "cat_hi.mp3"},
    {"word": "हाथी", "filename": "elephant_hi.mp3"},
    {"word": "शेर", "filename": "lion_hi.mp3"},
    {"word": "घर", "filename": "house_hi.mp3"},
    {"word": "फूल", "filename": "flower_hi.mp3"},
    {"word": "कार", "filename": "car_hi.mp3"},
    {"word": "सूरज", "filename": "sun_hi.mp3"}
]

telugu_vocab = [
    {"word": "కుక్క", "filename": "dog_te.mp3"},
    {"word": "పిల్లి", "filename": "cat_te.mp3"},
    {"word": "ఏనుగు", "filename": "elephant_te.mp3"},
    {"word": "సింహం", "filename": "lion_te.mp3"},
    {"word": "ఇల్లు", "filename": "house_te.mp3"},
    {"word": "పువ్వు", "filename": "flower_te.mp3"},
    {"word": "కారు", "filename": "car_te.mp3"},
    {"word": "సూర్యుడు", "filename": "sun_te.mp3"}
]

def generate_audio(vocab, lang, suffix):
    for item in vocab:
        word = item["word"]
        filename = item["filename"]
        filepath = os.path.join(output_dir, filename)
        
        print(f"Generating {filepath} ({lang})...")
        try:
            tts = gTTS(text=word, lang=lang)
            tts.save(filepath)
        except Exception as e:
            print(f"Error generating {filename}: {e}")

if __name__ == "__main__":
    print("Generating Hindi Shabd Audio...")
    generate_audio(hindi_vocab, 'hi', '_hi')
    
    print("\nGenerating Telugu Shabd Audio...")
    generate_audio(telugu_vocab, 'te', '_te')
    
    print("\nDone! All Shabd audio generated successfully.")
