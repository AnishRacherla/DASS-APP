const mongoose = require('mongoose');
const Game = require('../models/Game');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected for seeding scrambled sentences');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Simple sentences for age group 3-8
const sentencesByLanguage = {
  hindi: [
    'मैं एक लड़का हूँ',
    'मेरा नाम राज है',
    'मुझे खेलना पसंद है',
    'यह एक कुत्ता है',
    'गाय काला है',
    'मैं स्कूल जाता हूँ',
    'मेरे पास एक किताब है',
    'आप कहाँ रहते हैं',
    'मुझे आम खाना पसंद है',
    'रीता बहुत चतुर है',
    'वह एक शिक्षक है',
    'मेरी माँ बहुत अच्छी है',
    'आकाश नीला है',
    'सूरज बहुत चमकता है',
    'चाँद रात में निकलता है',
    'पक्षी पेड़ पर बैठते हैं',
    'फूल बहुत सुंदर हैं',
    'मछली पानी में रहती है',
    'मेरी बहन छोटी है',
    'भाई घर पर है',
    'हम खेल को खेलते हैं',
    'वह गीत गाती है',
    'मैं चित्र बनाता हूँ',
    'यह एक बिल्ली है',
    'दादा दादी के साथ रहते हैं',
    'मेरे दोस्त मेरे पास आते हैं',
    'हम एक साथ खेलते हैं',
    'माता जी खाना बनाती हैं',
    'पिता जी काम करते हैं',
    'मैं सो जाता हूँ',
    'सुबह मैं उठता हूँ',
    'दांत साफ करना जरूरी है',
    'मुझे दूध पीना पसंद है',
    'चावल खाना स्वस्थ है',
    'सेब लाल है',
    'केला पीला है',
    'अनार मीठा है',
    'तरबूज बड़ा है',
    'पपीता को मैं खाता हूँ',
    'बादाम स्वास्थ्यकर है',
    'दिन में सूरज उजागर करता है',
    'रात में तारे चमकते हैं',
    'बारिश पानी लाती है',
    'ठंड में हम गर्म कपड़े पहनते हैं',
    'गर्मी में हम पसीना बहाते हैं',
    'हवा चलती है',
    'बादल आकाश में होते हैं',
    'इंद्रधनुष बहुत रंगीन है',
    'पर्वत बहुत ऊँचे हैं',
    'नदी पानी में बहती है',
    'समुद्र बहुत गहरा है',
    'समुद्र तट सुंदर है',
    'झील शांत होती है',
    'जंगल में जानवर रहते हैं',
    'शेर राजा होता है',
    'हाथी बहुत बड़ा है',
    'ऊँट रेगिस्तान में रहता है',
    'जिराफ लंबी गर्दन वाला है',
    'तितली रंगीन होती है',
    'मधुमक्खी शहद बनाती है',
    'चींटी मेहनती होती है',
    'मकड़ी जाला बनाती है',
    'चिड़िया गीत गाती है',
    'तोता हरा होता है',
    'उल्लू रात में देखता है',
    'चूहा छोटा होता है',
    'खरगोश तेज दौड़ता है',
    'लोमड़ी चतुर होती है',
    'भेड़ ऊन से ढकी होती है',
    'बकरी दूध देती है',
    'मुर्गा सुबह आवाजें करता है',
    'बत्तख पानी में रहती है',
    'मेंढक तालाब में रहता है',
    'सांप रेंगता है',
    'कछुआ धीरे चलता है',
    'बिच्छू जहरीला होता है',
    'तिलचट्टा कीड़ा है',
    'पेड़ों के पत्ते हरे हैं',
    'फूलों की सुगंध अच्छी है',
    'आम का पेड़ बड़ा है',
    'नीम औषधि है',
    'तुलसी पवित्र है',
    'महीने में चाँद पूरा होता है',
    'महीने के दिनों को हम गिनते हैं',
    'हफ्ते में सात दिन होते हैं',
    'साल में बारह महीने होते हैं',
    'मेरा जन्मदिन बहुत खुशी लाता है',
    'त्योहार हमारे लिए खुशी लाते हैं',
    'दिवाली बहुत रोशन है',
    'होली रंगीन त्योहार है',
    'मैं नाच सकता हूँ',
    'मैं गा सकता हूँ',
    'मैं दौड़ सकता हूँ',
    'मैं कूद सकता हूँ',
    'मैं पढ़ सकता हूँ',
    'मैं लिख सकता हूँ',
    'मैं गणना कर सकता हूँ'
  ],
  english: [
    'I am a boy',
    'My name is Raj',
    'I like playing games',
    'This is a dog',
    'The cow is black',
    'I go to school',
    'I have a book',
    'Where do you live',
    'I like eating mango',
    'Rita is very clever',
    'He is a teacher',
    'My mother is very good',
    'The sky is blue',
    'The sun shines bright',
    'The moon comes at night',
    'Birds sit on trees',
    'Flowers are beautiful',
    'Fish live in water',
    'My sister is small',
    'Brother is at home',
    'We play the game',
    'She sings a song',
    'I draw pictures',
    'This is a cat',
    'Grandparents live with us',
    'My friends come to me',
    'We play together',
    'Mother cooks food',
    'Father works hard',
    'I go to sleep',
    'I wake up early',
    'Brushing teeth is important',
    'I like drinking milk',
    'Eating rice is healthy',
    'The apple is red',
    'The banana is yellow',
    'The pomegranate is sweet',
    'The watermelon is big',
    'I eat papaya',
    'Almonds are healthy',
    'The sun lights the day',
    'Stars shine at night',
    'Rain brings water',
    'We wear warm clothes in winter',
    'We sweat in summer',
    'The wind blows strong',
    'Clouds are in the sky',
    'The rainbow is colorful',
    'Mountains are very high',
    'The river flows water',
    'The ocean is very deep',
    'The beach is beautiful',
    'The lake is calm',
    'Animals live in the jungle',
    'The lion is the king',
    'The elephant is very big',
    'The camel lives in the desert',
    'The giraffe has a long neck',
    'The butterfly is colorful',
    'The bee makes honey',
    'The ant is hardworking',
    'The spider makes a web',
    'The bird sings songs',
    'The parrot is green',
    'The owl sees at night',
    'The mouse is small',
    'The rabbit runs fast',
    'The fox is clever',
    'The sheep is covered with wool',
    'The goat gives milk',
    'The rooster makes sounds',
    'The duck lives in water',
    'The frog lives in a pond',
    'The snake crawls around',
    'The tortoise walks slowly',
    'The scorpion is poisonous',
    'The cockroach is an insect',
    'The leaves of trees are green',
    'Flowers smell good',
    'The mango tree is big',
    'The neem tree has medicine',
    'Tulsi is sacred',
    'The month has a full moon',
    'We count the days in a month',
    'A week has seven days',
    'A year has twelve months',
    'My birthday brings joy',
    'Festivals bring happiness',
    'Diwali is very bright',
    'Holi is a colorful festival',
    'I can dance well',
    'I can sing songs',
    'I can run fast',
    'I can jump high',
    'I can read books',
    'I can write letters',
    'I can count numbers'
  ],
  telugu: [
    'నేను ఒక బాలుడిని',
    'నా పేరు రాజు',
    'నాకు ఆటలు ఆడటం ఇష్టం',
    'ఇది ఒక కుక్క',
    'ఆవు నలుపు రంగులో ఉంది',
    'నేను పాఠశాలకు వెళ్లాను',
    'నా దగ్గర ఒక పుస్తకం ఉంది',
    'మీరు ఎక్కడ నివసిస్తున్నారు',
    'నాకు మామిడిని తినటం ఇష్టం',
    'రీత చాలా తెలివైనది',
    'అతను ఒక ఉపాధ్యాయుడు',
    'నా ఆమ్మ చాలా మంచిది',
    'ఆకాశం నీలం',
    'సూర్యుడు ప్రకాశవంతంగా ఉంది',
    'చంద్రుడు రాత్రిలో ఎదుగుతాడు',
    'పక్షులు చెట్ల మీద కూర్చొంటాయి',
    'పువ్వులు చాలా అందమైనవి',
    'చేపలు నీటిలో నివసిస్తాయి',
    'నా సోదరి చిన్నది',
    'సోదరుడు ఇంట్లో ఉన్నాడు',
    'మనం ఆటను ఆడుకుంటాము',
    'ఆమె పాట పాడుతుంది',
    'నేను చిత్రాలు గీస్తాను',
    'ఇది ఒక పిల్లి',
    'తాతయ్య అమ్మమ్మలు మనతో నివసిస్తారు',
    'నా మిత్రులు నా వద్దకు వచ్చారు',
    'మనం కలిసి ఆడుకుంటాము',
    'అమ్మ ఆహారం తయారు చేస్తుంది',
    'నాన్న కష్టపడి పని చేస్తాడు',
    'నేను పడుకుని పోతాను',
    'నేను ఉదయం లేస్తాను',
    'దంతాలు శుభ్రం చేయడం ముఖ్యం',
    'నాకు పాలు కాలం ఇష్టం',
    'చాలు తినటం ఆరోగ్యకరం',
    'ఆపిల్ ఎరుపు',
    'అరటి పసిపై',
    'దానిమ్మ తీపిగా ఉంది',
    'పుండ్రుమ్మ పెద్దది',
    'నేను పప్పాయిని తินను',
    'బాదამ ఆరోగ్యకరం',
    'రోజు సూర్యుడు ప్రకాశవంతమైనది',
    'రాత్రిలో నక్షత్రాలు నిమిషిస్తాయి',
    'వర్షం నీరు తీసుకువస్తుంది',
    'శీతకాలంలో మనం వెదురు వస్త్రాలు ధరిస్తాము',
    'వేసవిలో మనం చెమట బుద్దిని',
    'గాలి తీవ్రంగా చేస్తుంది',
    'మేఘాలు ఆకాశంలో ఉన్నాయి',
    'ఇంద్రధనువు చాలా రంగారంగ',
    'కొండలు చాలా ఎత్తైనవి',
    'నది నీటిని ప్రవహిస్తుంది',
    'సముద్రం చాలా లోతుగా ఉంది',
    'సముద్ర తీరం అందమైనది',
    'సరస్సు శాంతియుతమైనది',
    'అడవిలో జంతువులు నివసిస్తాయి',
    'సింహం రాజు',
    'ఏనుగు చాలా పెద్దది',
    'ఒంటె ఎడారిలో నివసిస్తుంది',
    'జిరాఫీ దీర్ఘ గొంతు కలిగి ఉంటుంది',
    'సీతాకోకచిలుక రంగారంగ',
    'తేనెటీగ తేనె తయారు చేస్తుంది',
    'చీమ కష్టపడుతుంది',
    'సాలెపురుగు జాలం తయారు చేస్తుంది',
    'చిన్న పక్షి పాట పాడుతుంది',
    'చిలుకఎర ఆకుపచ్చ',
    'గుడ్లగూబ రాత్రిలో చూస్తుంది',
    'మీకు చిన్నది',
    'మొharmニokა వేగంగా పరిగెత్తుతుంది',
    'నక్క తెలివైనది',
    'గొర్రె ఉన్నను నుండి కప్పబడి ఉంది',
    'ఆకు నుండు ఇస్తుంది',
    'రూస్టర్ బాధ్యత చేస్తుంది',
    'బాతు నీటిలో నివసిస్తుంది',
    'కప్ప చెందాలో నివసిస్తుంది',
    'పాము రెంగుతుంది',
    'తర్తుస్ धीमం నడుస్తుంది',
    'కందిరీవిధి విషపూరితం',
    'బెండ కీటకం',
    'చెట్ల ఆకులు ఆకుపచ్చ',
    'పువ్వులు మంచి సువాసనలో ఉన్నాయి',
    'మామిడి చెట్టు పెద్దది',
    'వేపచెట్టు ఔషధం',
    'తులసి పవిత్రం',
    'నెలలో చంద్రుడు పూర్తిగా ఉంటాడు',
    'నెలలో రోజులను లెక్కిస్తాము',
    'వారంలో ఏడు రోజులు ఉన్నాయి',
    'సంవత్సరంలో పన్నెండు నెలలు ఉన్నాయి',
    'నా పుట్టినరోజు సంతోషం తీసుకువస్తుంది',
    'పండుగలు సంతోషం తీసుకువస్తాయి',
    'దీపావళి చాలా ప్రకాశవంతం',
    'హోలీ చాలా రంగారంగ పండుగ',
    'నేను నాట్యం చేయగలను',
    'నేను పాటలు పాడగలను',
    'నేను వేగంగా పరిగెత్తగలను',
    'నేను ఎత్తుగా దూకగలను',
    'నేను పుస్తకాలు చదువగలను',
    'నేను అక్షరాలు రాయగలను',
    'నేను సంఖ్యలను లెక్కించగలను'
  ]
};

const createScrambledSentenceGames = async () => {
  try {
    await connectDB();

    // Clear existing scrambled sentence games
    await Game.deleteMany({ gameType: 'scrambled-sentences' });

    const games = [];

    // Create games for each language
    ['hindi', 'english', 'telugu'].forEach((language) => {
      const sentences = sentencesByLanguage[language];
      const sentencesPerLevel = Math.ceil(sentences.length / 3);

      // Create 3 levels
      for (let level = 1; level <= 3; level++) {
        const startIdx = (level - 1) * sentencesPerLevel;
        const endIdx = Math.min(level * sentencesPerLevel, sentences.length);
        const levelSentences = sentences.slice(startIdx, endIdx);

        const gameData = levelSentences.map((sentence, index) => {
          const words = sentence.split(' ');
          // Shuffle the words
          const shuffledWords = [...words].sort(() => Math.random() - 0.5);

          return {
            sentenceId: index + 1,
            originalSentence: sentence,
            words: words,
            scrambledWords: shuffledWords.map((word, idx) => ({
              id: idx,
              text: word,
              position: null // User will set this
            }))
          };
        });

        games.push({
          gameType: 'scrambled-sentences',
          gameId: `scrambled-${language}-${level}-${Date.now()}-${Math.random()}`,
          title: `${language === 'hindi' ? 'वाक्य को ठीक करें' : language === 'telugu' ? 'వాక్యను సరిచేసుకోండి' : 'Fix the Sentence'} - Level ${level}`,
          description: language === 'hindi' 
            ? `बिखरे हुए शब्दों को सही क्रम में रखकर वाक्य बनाएं।`
            : language === 'telugu'
            ? `గజిబిన్న పదాలను సరైన క్రమంలో ఏర్రాండి.`
            : `Arrange the scrambled words to form correct sentences.`,
          language: language,
          level: level,
          difficulty: level === 1 ? 'easy' : level === 2 ? 'medium' : 'hard',
          gameData: gameData,
          config: {
            timeLimit: 0, // No time limit
            pointsPerCorrect: 10,
            pointsPerIncorrect: -5,
            numberOfRounds: levelSentences.length,
            speed: 'medium'
          },
          assets: {
            images: [],
            audio: []
          }
        });
      }
    });

    // Insert all games
    await Game.insertMany(games);
    console.log(`✓ Created ${games.length} scrambled sentence games`);
    console.log(`  - Hindi: 3 levels (${Math.ceil(sentencesByLanguage.hindi.length / 3)} sentences each)`);
    console.log(`  - English: 3 levels (${Math.ceil(sentencesByLanguage.english.length / 3)} sentences each)`);
    console.log(`  - Telugu: 3 levels (${Math.ceil(sentencesByLanguage.telugu.length / 3)} sentences each)`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding scrambled sentences:', error);
    process.exit(1);
  }
};

createScrambledSentenceGames();
