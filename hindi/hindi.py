from gtts import gTTS

hindi_letters = [
    "अ","आ","इ","ई","उ","ऊ","ऋ","ए","ऐ","ओ","औ",
    "क","ख","ग","घ","ङ",
    "च","छ","ज","झ","ञ",
    "ट","ठ","ड","ढ","ण",
    "त","थ","द","ध","न",
    "प","फ","ब","भ","म",
    "य","र","ल","व",
    "श","ष","स","ह"
]

for letter in hindi_letters:
    tts = gTTS(text=letter, lang="hi")
    tts.save(f"hi_{letter}.mp3")
