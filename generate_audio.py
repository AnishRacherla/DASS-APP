import os
from gtts import gTTS

print("Generating Swara Audio files using gTTS...")

# Create directories if they don't exist
os.makedirs('backend/assets/audio/hindi', exist_ok=True)
os.makedirs('backend/assets/audio/telugu', exist_ok=True)

# Format: (filename_prefix, letter_text, word_text)
hindi_pairs = [
    ('h_a', 'अ', 'अनार'),
    ('h_aa', 'आ', 'आम'),
    ('h_i', 'इ', 'इमली'),
    ('h_ee', 'ई', 'ईख'),
    ('h_u', 'उ', 'उल्लू'),
    ('h_oo', 'ऊ', 'ऊन'),
    ('h_ri', 'ऋ', 'ऋषि'),
    ('h_e', 'ए', 'एड़ी'),
    ('h_ai', 'ऐ', 'ऐनक'),
    ('h_o', 'ओ', 'ओखली'),
    ('h_au', 'औ', 'औरत'),
    ('h_ang', 'अं', 'अंगूर'),
    ('h_ah', 'अः', 'प्रातः')
]

telugu_pairs = [
    ('t_a', 'అ', 'అమ్మ'),
    ('t_aa', 'ఆ', 'ఆవు'),
    ('t_i', 'ఇ', 'ఇల్లు'),
    ('t_ee', 'ఈ', 'ఈగ'),
    ('t_u', 'ఉ', 'ఉడత'),
    ('t_oo', 'ఊ', 'ఊయల'),
    ('t_ru', 'ఋ', 'ఋషి'),
    ('t_e', 'ఎ', 'ఎలుక'),
    ('t_eelong', 'ఏ', 'ఏనుగు'),
    ('t_ai', 'ఐ', 'ఐదు'),
    ('t_o', 'ఒ', 'ఒంటె'),
    ('t_oolong', 'ఓ', 'ఓడ'),
    ('t_au', 'ఔ', 'ఔషధం'),
    ('t_am', 'అం', 'అంకెలు'),
    ('t_aha', 'అః', 'అంతఃపురం')
]

def generate_language_audio(pairs, lang_code, folder_name):
    for prefix, letter, word in pairs:
        letter_path = f'backend/assets/audio/{folder_name}/{prefix}.mp3'
        word_path = f'backend/assets/audio/{folder_name}/{prefix}_word.mp3'
        
        # We named the word files differently in SwaraData.js (e.g. h_a_anar.mp3)
        # Wait, in SwaraData.js they are named: h_a.mp3 and h_a_anar.mp3
        word_filename = f"{prefix}_{word_path_from_prefix(prefix, word, lang_code)}.mp3"
        actual_word_path = f'backend/assets/audio/{folder_name}/{word_filename}'

        if not os.path.exists(letter_path):
            print(f"Generating {letter_path}...")
            gTTS(text=letter, lang=lang_code).save(letter_path)
            
        if not os.path.exists(actual_word_path):
            print(f"Generating {actual_word_path}...")
            gTTS(text=word, lang=lang_code).save(actual_word_path)

def word_path_from_prefix(prefix, word, lang):
    # Mapping exact filenames used in SwaraData.js
    mapping = {
        'h_a': 'anar', 'h_aa': 'aam', 'h_i': 'imli', 'h_ee': 'eekh', 'h_u': 'ullu', 'h_oo': 'oon',
        'h_ri': 'rishi', 'h_e': 'edi', 'h_ai': 'ainak', 'h_o': 'okhli', 'h_au': 'aurat', 'h_ang': 'angoor', 'h_ah': 'pratah',
        
        't_a': 'amma', 't_aa': 'aavu', 't_i': 'illu', 't_ee': 'eega', 't_u': 'udata', 't_oo': 'ooyala',
        't_ru': 'rushi', 't_e': 'eluka', 't_eelong': 'eenugu', 't_ai': 'aidu', 't_o': 'onte', 't_oolong': 'ooda',
        't_au': 'aushadham', 't_am': 'ankelu', 't_aha': 'anthahpuram'
    }
    return mapping[prefix]

print("Generating Hindi...")
generate_language_audio(hindi_pairs, 'hi', 'hindi')

print("Generating Telugu...")
generate_language_audio(telugu_pairs, 'te', 'telugu')

print("Done! All audio generated successfully.")
