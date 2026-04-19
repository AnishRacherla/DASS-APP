const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const Game = require('../models/Game');

const fillStoryData = [
  // ===================== HINDI STORIES =====================
  {
    gameType: 'fill-story',
    gameId: 'fill-story-hindi-1',
    title: 'चिड़िया का सफ़र',
    description: 'एक छोटी चिड़िया की मज़ेदार कहानी',
    language: 'hindi',
    level: 1,
    difficulty: 'easy',
    gameData: {
      storyTemplate: 'एक {{blank_1}} चिड़िया थी। वह रोज़ {{blank_2}} पर बैठती थी। एक दिन उसने एक {{blank_3}} देखा। चिड़िया बहुत {{blank_4}} हो गई।',
      blanks: {
        blank_1: {
          correctAnswer: 'छोटी',
          options: ['छोटी', 'लंबी', 'गोल', 'चौकोर'],
          hint: 'चिड़िया कैसी थी?'
        },
        blank_2: {
          correctAnswer: 'पेड़',
          options: ['पेड़', 'छत', 'बादल', 'पहाड़'],
          hint: 'चिड़िया कहाँ बैठती थी?'
        },
        blank_3: {
          correctAnswer: 'तितली',
          options: ['तितली', 'हाथी', 'ट्रेन', 'रॉकेट'],
          hint: 'उसने क्या देखा?'
        },
        blank_4: {
          correctAnswer: 'खुश',
          options: ['खुश', 'ऊँची', 'नीली', 'मोटी'],
          hint: 'चिड़िया कैसी हो गई?'
        }
      },
      theme: 'nature',
      mascot: '🐦'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 4
    }
  },
  {
    gameType: 'fill-story',
    gameId: 'fill-story-hindi-2',
    title: 'बिल्ली और दूध',
    description: 'बिल्ली को दूध बहुत पसंद है!',
    language: 'hindi',
    level: 2,
    difficulty: 'easy',
    gameData: {
      storyTemplate: 'एक {{blank_1}} बिल्ली थी। उसे {{blank_2}} बहुत पसंद था। वह {{blank_3}} में गई। वहाँ उसने {{blank_4}} पिया। बिल्ली ने कहा — "{{blank_5}}!"',
      blanks: {
        blank_1: {
          correctAnswer: 'सफ़ेद',
          options: ['सफ़ेद', 'बड़ी', 'उड़ने वाली', 'लकड़ी की'],
          hint: 'बिल्ली कैसी थी?'
        },
        blank_2: {
          correctAnswer: 'दूध',
          options: ['दूध', 'पानी', 'चाय', 'रंग'],
          hint: 'बिल्ली को क्या पसंद था?'
        },
        blank_3: {
          correctAnswer: 'रसोई',
          options: ['रसोई', 'स्कूल', 'बाग़', 'नदी'],
          hint: 'बिल्ली कहाँ गई?'
        },
        blank_4: {
          correctAnswer: 'दूध',
          options: ['दूध', 'जूस', 'स्याही', 'शरबत'],
          hint: 'उसने क्या पिया?'
        },
        blank_5: {
          correctAnswer: 'म्याऊँ',
          options: ['म्याऊँ', 'भौं-भौं', 'कूकू', 'गरर'],
          hint: 'बिल्ली क्या बोली?'
        }
      },
      theme: 'animals',
      mascot: '🐱'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 5
    }
  },
  {
    gameType: 'fill-story',
    gameId: 'fill-story-hindi-3',
    title: 'बंदर का केला',
    description: 'बंदर और उसके केले की हँसी-मज़ाक कहानी',
    language: 'hindi',
    level: 3,
    difficulty: 'medium',
    gameData: {
      storyTemplate: 'एक {{blank_1}} बंदर पेड़ पर बैठा था। उसे एक {{blank_2}} केला दिखा। बंदर {{blank_3}} से नीचे आया। उसने केला {{blank_4}}। केला बहुत {{blank_5}} था!',
      blanks: {
        blank_1: {
          correctAnswer: 'शरारती',
          options: ['शरारती', 'उदास', 'सोने वाला', 'पत्थर जैसा'],
          hint: 'बंदर कैसा था?'
        },
        blank_2: {
          correctAnswer: 'पीला',
          options: ['पीला', 'नीला', 'काला', 'चमकीला'],
          hint: 'केला कैसा था?'
        },
        blank_3: {
          correctAnswer: 'कूदकर',
          options: ['कूदकर', 'उड़कर', 'गाड़ी से', 'रोकर'],
          hint: 'बंदर कैसे आया?'
        },
        blank_4: {
          correctAnswer: 'खाया',
          options: ['खाया', 'फेंका', 'छुपाया', 'बेचा'],
          hint: 'बंदर ने केला क्या किया?'
        },
        blank_5: {
          correctAnswer: 'मीठा',
          options: ['मीठा', 'खट्टा', 'कड़वा', 'नमकीन'],
          hint: 'केला कैसा था?'
        }
      },
      theme: 'animals',
      mascot: '🐒'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 5
    }
  },
  {
    gameType: 'fill-story',
    gameId: 'fill-story-hindi-4',
    title: 'बारिश का दिन',
    description: 'बारिश में खेलने की मस्ती!',
    language: 'hindi',
    level: 4,
    difficulty: 'medium',
    gameData: {
      storyTemplate: 'आज {{blank_1}} का दिन था। आसमान में {{blank_2}} थे। ज़ोर से {{blank_3}} हुई। बच्चे {{blank_4}} में खेलने लगे। सबने {{blank_5}} कागज़ की नाव बनाई। क्या {{blank_6}} दिन था!',
      blanks: {
        blank_1: {
          correctAnswer: 'बारिश',
          options: ['बारिश', 'धूप', 'ठंड', 'गर्मी'],
          hint: 'कैसा दिन था?'
        },
        blank_2: {
          correctAnswer: 'बादल',
          options: ['बादल', 'तारे', 'पतंग', 'गुब्बारे'],
          hint: 'आसमान में क्या थे?'
        },
        blank_3: {
          correctAnswer: 'बारिश',
          options: ['बारिश', 'हवा', 'आवाज़', 'रोशनी'],
          hint: 'ज़ोर से क्या हुई?'
        },
        blank_4: {
          correctAnswer: 'पानी',
          options: ['पानी', 'रेत', 'बर्फ़', 'कीचड़'],
          hint: 'बच्चे किसमें खेले?'
        },
        blank_5: {
          correctAnswer: 'मिलकर',
          options: ['मिलकर', 'अकेले', 'रोकर', 'सोकर'],
          hint: 'सबने कैसे नाव बनाई?'
        },
        blank_6: {
          correctAnswer: 'मज़ेदार',
          options: ['मज़ेदार', 'उबाऊ', 'डरावना', 'लंबा'],
          hint: 'दिन कैसा था?'
        }
      },
      theme: 'nature',
      mascot: '🌧️'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 6
    }
  },
  {
    gameType: 'fill-story',
    gameId: 'fill-story-hindi-5',
    title: 'हाथी की सैर',
    description: 'हाथी बाज़ार गया — क्या हुआ?',
    language: 'hindi',
    level: 5,
    difficulty: 'medium',
    gameData: {
      storyTemplate: 'एक {{blank_1}} हाथी {{blank_2}} गया। उसने {{blank_3}} खरीदे। रास्ते में एक {{blank_4}} मिला। हाथी ने उसे {{blank_5}} दिया। दोनों बहुत {{blank_6}} हुए!',
      blanks: {
        blank_1: {
          correctAnswer: 'मोटा',
          options: ['मोटा', 'पतला', 'छोटा', 'उड़ता'],
          hint: 'हाथी कैसा था?'
        },
        blank_2: {
          correctAnswer: 'बाज़ार',
          options: ['बाज़ार', 'स्कूल', 'चाँद', 'समुद्र'],
          hint: 'हाथी कहाँ गया?'
        },
        blank_3: {
          correctAnswer: 'गन्ने',
          options: ['गन्ने', 'जूते', 'किताबें', 'सितारे'],
          hint: 'हाथी ने क्या खरीदा?'
        },
        blank_4: {
          correctAnswer: 'खरगोश',
          options: ['खरगोश', 'रॉकेट', 'पहाड़', 'समोसा'],
          hint: 'रास्ते में कौन मिला?'
        },
        blank_5: {
          correctAnswer: 'गन्ना',
          options: ['गन्ना', 'टिकट', 'फोन', 'छाता'],
          hint: 'हाथी ने क्या दिया?'
        },
        blank_6: {
          correctAnswer: 'खुश',
          options: ['खुश', 'नाराज़', 'ऊँचे', 'गीले'],
          hint: 'दोनों कैसे हुए?'
        }
      },
      theme: 'animals',
      mascot: '🐘'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 6
    }
  },

  // ===================== TELUGU STORIES =====================
  {
    gameType: 'fill-story',
    gameId: 'fill-story-telugu-1',
    title: 'చిన్న పిల్లి',
    description: 'ఒక చిన్న పిల్లి కథ',
    language: 'telugu',
    level: 1,
    difficulty: 'easy',
    gameData: {
      storyTemplate: 'ఒక {{blank_1}} పిల్లి ఉంది. అది {{blank_2}} తాగింది. పిల్లి {{blank_3}} మీద కూర్చుంది. అది చాలా {{blank_4}} గా ఉంది.',
      blanks: {
        blank_1: {
          correctAnswer: 'చిన్న',
          options: ['చిన్న', 'పెద్ద', 'పొడవు', 'చదరపు'],
          hint: 'పిల్లి ఎలాంటిది?'
        },
        blank_2: {
          correctAnswer: 'పాలు',
          options: ['పాలు', 'నీళ్లు', 'టీ', 'రంగు'],
          hint: 'పిల్లి ఏమి తాగింది?'
        },
        blank_3: {
          correctAnswer: 'కుర్చీ',
          options: ['కుర్చీ', 'చెట్టు', 'మేఘం', 'కొండ'],
          hint: 'పిల్లి ఎక్కడ కూర్చుంది?'
        },
        blank_4: {
          correctAnswer: 'సంతోషం',
          options: ['సంతోషం', 'బాధ', 'ఎత్తు', 'నీలం'],
          hint: 'పిల్లి ఎలా ఉంది?'
        }
      },
      theme: 'animals',
      mascot: '🐱'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 4
    }
  },
  {
    gameType: 'fill-story',
    gameId: 'fill-story-telugu-2',
    title: 'కోతి మరియు అరటి',
    description: 'కోతికి అరటి పండు ఇష్టం!',
    language: 'telugu',
    level: 2,
    difficulty: 'easy',
    gameData: {
      storyTemplate: 'ఒక {{blank_1}} కోతి చెట్టు మీద ఉంది. దానికి ఒక {{blank_2}} అరటి కనిపించింది. కోతి {{blank_3}} దిగింది. అది అరటి {{blank_4}}. అరటి చాలా {{blank_5}} గా ఉంది!',
      blanks: {
        blank_1: {
          correctAnswer: 'అల్లరి',
          options: ['అల్లరి', 'బాధగా', 'నిద్రపోతున్న', 'రాతి'],
          hint: 'కోతి ఎలాంటిది?'
        },
        blank_2: {
          correctAnswer: 'పసుపు',
          options: ['పసుపు', 'నీలం', 'నలుపు', 'మెరిసే'],
          hint: 'అరటి ఏ రంగు?'
        },
        blank_3: {
          correctAnswer: 'దూకి',
          options: ['దూకి', 'ఎగిరి', 'కారులో', 'ఏడ్చి'],
          hint: 'కోతి ఎలా దిగింది?'
        },
        blank_4: {
          correctAnswer: 'తిన్నది',
          options: ['తిన్నది', 'విసిరింది', 'దాచింది', 'అమ్మింది'],
          hint: 'కోతి అరటి ఏమి చేసింది?'
        },
        blank_5: {
          correctAnswer: 'తియ్యగా',
          options: ['తియ్యగా', 'పుల్లగా', 'చేదుగా', 'ఉప్పగా'],
          hint: 'అరటి ఎలా ఉంది?'
        }
      },
      theme: 'animals',
      mascot: '🐒'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 5
    }
  },
  {
    gameType: 'fill-story',
    gameId: 'fill-story-telugu-3',
    title: 'వర్షం వచ్చింది',
    description: 'వర్షంలో ఆడుకోవడం ఎంత మజా!',
    language: 'telugu',
    level: 3,
    difficulty: 'medium',
    gameData: {
      storyTemplate: 'ఈ రోజు {{blank_1}} వచ్చింది. ఆకాశంలో {{blank_2}} ఉన్నాయి. పిల్లలు {{blank_3}} లో ఆడారు. వాళ్ళు కాగితపు {{blank_4}} చేశారు. ఎంత {{blank_5}} రోజు!',
      blanks: {
        blank_1: {
          correctAnswer: 'వర్షం',
          options: ['వర్షం', 'ఎండ', 'చలి', 'వేడి'],
          hint: 'ఏమి వచ్చింది?'
        },
        blank_2: {
          correctAnswer: 'మేఘాలు',
          options: ['మేఘాలు', 'నక్షత్రాలు', 'గాలిపటాలు', 'బెలూన్లు'],
          hint: 'ఆకాశంలో ఏమి ఉన్నాయి?'
        },
        blank_3: {
          correctAnswer: 'నీళ్లు',
          options: ['నీళ్లు', 'ఇసుక', 'మంచు', 'బురద'],
          hint: 'పిల్లలు దేనిలో ఆడారు?'
        },
        blank_4: {
          correctAnswer: 'పడవలు',
          options: ['పడవలు', 'విమానాలు', 'బంతులు', 'పూలు'],
          hint: 'వాళ్ళు ఏమి చేశారు?'
        },
        blank_5: {
          correctAnswer: 'మజా',
          options: ['మజా', 'బోరు', 'భయం', 'పొడవు'],
          hint: 'రోజు ఎలా ఉంది?'
        }
      },
      theme: 'nature',
      mascot: '🌧️'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 5
    }
  },
  {
    gameType: 'fill-story',
    gameId: 'fill-story-telugu-4',
    title: 'ఏనుగు బజారుకు వెళ్ళింది',
    description: 'ఏనుగు బజారుకు వెళ్తే ఏమి జరిగింది?',
    language: 'telugu',
    level: 4,
    difficulty: 'medium',
    gameData: {
      storyTemplate: 'ఒక {{blank_1}} ఏనుగు {{blank_2}} కు వెళ్ళింది. అది {{blank_3}} కొన్నది. దారిలో ఒక {{blank_4}} కలిసింది. ఏనుగు దానికి {{blank_5}} ఇచ్చింది. ఇద్దరూ చాలా {{blank_6}} గా ఉన్నారు!',
      blanks: {
        blank_1: {
          correctAnswer: 'లావు',
          options: ['లావు', 'సన్నని', 'చిన్న', 'ఎగిరే'],
          hint: 'ఏనుగు ఎలాంటిది?'
        },
        blank_2: {
          correctAnswer: 'బజారు',
          options: ['బజారు', 'బడి', 'చంద్రుడు', 'సముద్రం'],
          hint: 'ఏనుగు ఎక్కడికి వెళ్ళింది?'
        },
        blank_3: {
          correctAnswer: 'చెరకు',
          options: ['చెరకు', 'బూట్లు', 'పుస్తకాలు', 'నక్షత్రాలు'],
          hint: 'ఏనుగు ఏమి కొన్నది?'
        },
        blank_4: {
          correctAnswer: 'కుందేలు',
          options: ['కుందేలు', 'రాకెట్', 'కొండ', 'సమోసా'],
          hint: 'దారిలో ఎవరు కలిశారు?'
        },
        blank_5: {
          correctAnswer: 'చెరకు',
          options: ['చెరకు', 'టికెట్', 'ఫోన్', 'గొడుగు'],
          hint: 'ఏనుగు ఏమి ఇచ్చింది?'
        },
        blank_6: {
          correctAnswer: 'సంతోషం',
          options: ['సంతోషం', 'కోపం', 'ఎత్తు', 'తడి'],
          hint: 'ఇద్దరూ ఎలా ఉన్నారు?'
        }
      },
      theme: 'animals',
      mascot: '🐘'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 6
    }
  },
  {
    gameType: 'fill-story',
    gameId: 'fill-story-telugu-5',
    title: 'పిట్ట ప్రయాణం',
    description: 'ఒక చిన్న పిట్ట యొక్క సాహసం',
    language: 'telugu',
    level: 5,
    difficulty: 'medium',
    gameData: {
      storyTemplate: 'ఒక {{blank_1}} పిట్ట ఉంది. అది ప్రతిరోజు {{blank_2}} మీద కూర్చునేది. ఒక రోజు అది {{blank_3}} చూసింది. పిట్ట చాలా {{blank_4}} గా ఎగిరింది. అది {{blank_5}} తో ఆడింది. ఎంత {{blank_6}} రోజు!',
      blanks: {
        blank_1: {
          correctAnswer: 'అందమైన',
          options: ['అందమైన', 'పెద్ద', 'గుండ్రని', 'చదరపు'],
          hint: 'పిట్ట ఎలాంటిది?'
        },
        blank_2: {
          correctAnswer: 'చెట్టు',
          options: ['చెట్టు', 'ఇంటి పై', 'మేఘం', 'కొండ'],
          hint: 'పిట్ట ఎక్కడ కూర్చునేది?'
        },
        blank_3: {
          correctAnswer: 'సీతాకోక చిలుక',
          options: ['సీతాకోక చిలుక', 'ఏనుగు', 'రైలు', 'రాకెట్'],
          hint: 'అది ఏమి చూసింది?'
        },
        blank_4: {
          correctAnswer: 'వేగం',
          options: ['వేగం', 'నెమ్మది', 'బాధ', 'కోపం'],
          hint: 'పిట్ట ఎలా ఎగిరింది?'
        },
        blank_5: {
          correctAnswer: 'సీతాకోక చిలుక',
          options: ['సీతాకోక చిలుక', 'రాయి', 'పుస్తకం', 'గడియారం'],
          hint: 'పిట్ట దేనితో ఆడింది?'
        },
        blank_6: {
          correctAnswer: 'మజా',
          options: ['మజా', 'బోరు', 'భయం', 'చలి'],
          hint: 'రోజు ఎలా ఉంది?'
        }
      },
      theme: 'nature',
      mascot: '🐦'
    },
    config: {
      pointsPerCorrect: 10,
      pointsPerIncorrect: 0,
      numberOfRounds: 6
    }
  }
];

async function seedFillStory() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Remove existing fill-story games
    const deleted = await Game.deleteMany({ gameType: 'fill-story' });
    console.log(`Deleted ${deleted.deletedCount} existing fill-story games`);

    // Insert new data
    const result = await Game.insertMany(fillStoryData);
    console.log(`Seeded ${result.length} fill-story games successfully!`);

    result.forEach(game => {
      console.log(`  ✓ ${game.gameId} — ${game.title} (${game.language})`);
    });

    await mongoose.disconnect();
    console.log('Done!');
  } catch (error) {
    console.error('Error seeding fill-story games:', error);
    process.exit(1);
  }
}

seedFillStory();
