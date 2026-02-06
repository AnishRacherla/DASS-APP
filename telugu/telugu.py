from gtts import gTTS

telugu_letters = [
    "అ","ఆ","ఇ","ఈ","ఉ","ఊ","ఋ","ఎ","ఏ","ఐ","ఒ","ఓ","ఔ",
    "క","ఖ","గ","ఘ","ఙ",
    "చ","ఛ","జ","ఝ","ఞ",
    "ట","ఠ","డ","ఢ","ణ",
    "త","థ","ద","ధ","న",
    "ప","ఫ","బ","భ","మ",
    "య","ర","ల","వ",
    "శ","ష","స","హ","ళ","క్ష","ఱ"
]

for letter in telugu_letters:
    tts = gTTS(text=letter, lang="te")
    tts.save(f"te_{letter}.mp3")
