// Swara data for the Memory Card game
// Uses the dedicated Hindi and Telugu images/audio from backend assets

const API_BASE = 'http://localhost:5001';

export const HINDI_SWARAS = [
    { id: 1, letter: 'अ', word: 'अनार', image: `${API_BASE}/images/swara/hindi/h_a_anar.png`, audio: `${API_BASE}/audio/hindi/h_a_anar.mp3` },
    { id: 2, letter: 'आ', word: 'आम', image: `${API_BASE}/images/swara/hindi/h_aa_aam.png`, audio: `${API_BASE}/audio/hindi/h_aa_aam.mp3` },
    { id: 3, letter: 'इ', word: 'इमली', image: `${API_BASE}/images/swara/hindi/h_i_imli.png`, audio: `${API_BASE}/audio/hindi/h_i_imli.mp3` },
    { id: 4, letter: 'ई', word: 'ईख', image: `${API_BASE}/images/swara/hindi/h_ee_eekh.png`, audio: `${API_BASE}/audio/hindi/h_ee_eekh.mp3` },
    { id: 5, letter: 'उ', word: 'उल्लू', image: `${API_BASE}/images/swara/hindi/h_u_ullu.png`, audio: `${API_BASE}/audio/hindi/h_u_ullu.mp3` },
    { id: 6, letter: 'ऊ', word: 'ऊन', image: `${API_BASE}/images/swara/hindi/h_oo_oon.png`, audio: `${API_BASE}/audio/hindi/h_oo_oon.mp3` },
    { id: 7, letter: 'ऋ', word: 'ऋषि', image: `${API_BASE}/images/swara/hindi/h_ri_rishi.png`, audio: `${API_BASE}/audio/hindi/h_ri_rishi.mp3` },
    { id: 8, letter: 'ए', word: 'एड़ी', image: `${API_BASE}/images/swara/hindi/h_e_edi.png`, audio: `${API_BASE}/audio/hindi/h_e_edi.mp3` },
    { id: 9, letter: 'ऐ', word: 'ऐनक', image: `${API_BASE}/images/swara/hindi/h_ai_ainak.png`, audio: `${API_BASE}/audio/hindi/h_ai_ainak.mp3` },
    { id: 10, letter: 'ओ', word: 'ओखली', image: `${API_BASE}/images/swara/hindi/h_o_okhli.png`, audio: `${API_BASE}/audio/hindi/h_o_okhli.mp3` },
    { id: 11, letter: 'औ', word: 'औरत', image: `${API_BASE}/images/swara/hindi/h_au_aurat.png`, audio: `${API_BASE}/audio/hindi/h_au_aurat.mp3` },
    { id: 12, letter: 'अं', word: 'अंगूर', image: `${API_BASE}/images/swara/hindi/h_ang_angoor.png`, audio: `${API_BASE}/audio/hindi/h_ang_angoor.mp3` },
];

export const TELUGU_SWARAS = [
    { id: 1, letter: 'అ', word: 'అమ్మ', image: `${API_BASE}/images/swara/telugu/t_a_amma.png`, audio: `${API_BASE}/audio/telugu/t_a_amma.mp3` },
    { id: 2, letter: 'ఆ', word: 'ఆవు', image: `${API_BASE}/images/swara/telugu/t_aa_aavu.png`, audio: `${API_BASE}/audio/telugu/t_aa_aavu.mp3` },
    { id: 3, letter: 'ఇ', word: 'ఇల్లు', image: `${API_BASE}/images/swara/telugu/t_i_illu.png`, audio: `${API_BASE}/audio/telugu/t_i_illu.mp3` },
    { id: 4, letter: 'ఈ', word: 'ఈగ', image: `${API_BASE}/images/swara/telugu/t_ee_eega.png`, audio: `${API_BASE}/audio/telugu/t_ee_eega.mp3` },
    { id: 5, letter: 'ఉ', word: 'ఉడత', image: `${API_BASE}/images/swara/telugu/t_u_udata.png`, audio: `${API_BASE}/audio/telugu/t_u_udata.mp3` },
    { id: 6, letter: 'ఊ', word: 'ఊయల', image: `${API_BASE}/images/swara/telugu/t_oo_ooyala.png`, audio: `${API_BASE}/audio/telugu/t_oo_ooyala.mp3` },
    { id: 7, letter: 'ఋ', word: 'ఋషి', image: `${API_BASE}/images/swara/telugu/t_ru_rushi.png`, audio: `${API_BASE}/audio/telugu/t_ru_rushi.mp3` },
    { id: 8, letter: 'ఎ', word: 'ఎలుక', image: `${API_BASE}/images/swara/telugu/t_e_eluka.png`, audio: `${API_BASE}/audio/telugu/t_e_eluka.mp3` },
    { id: 9, letter: 'ఏ', word: 'ఏనుగు', image: `${API_BASE}/images/swara/telugu/t_eelong_eenugu.png`, audio: `${API_BASE}/audio/telugu/t_eelong_eenugu.mp3` },
    { id: 10, letter: 'ఐ', word: 'ఐదు', image: `${API_BASE}/images/swara/telugu/t_ai_aidu.png`, audio: `${API_BASE}/audio/telugu/t_ai_aidu.mp3` },
    { id: 11, letter: 'ఒ', word: 'ఒంటె', image: `${API_BASE}/images/swara/telugu/t_o_onte.png`, audio: `${API_BASE}/audio/telugu/t_o_onte.mp3` },
    { id: 12, letter: 'ఓ', word: 'ఓడ', image: `${API_BASE}/images/swara/telugu/t_oolong_ooda.png`, audio: `${API_BASE}/audio/telugu/t_oolong_ooda.mp3` },
    { id: 13, letter: 'ఔ', word: 'ఔషధం', image: `${API_BASE}/images/swara/telugu/t_au_aushadham.png`, audio: `${API_BASE}/audio/telugu/t_au_aushadham.mp3` },
    { id: 14, letter: 'అం', word: 'అంకెలు', image: `${API_BASE}/images/swara/telugu/t_am_ankelu.png`, audio: `${API_BASE}/audio/telugu/t_am_ankelu.mp3` },
    { id: 15, letter: 'అః', word: 'అంతఃపురం', image: `${API_BASE}/images/swara/telugu/t_aha_anthahpuram.png`, audio: `${API_BASE}/audio/telugu/t_aha_anthahpuram.mp3` },
];

// Difficulty levels for the memory game
export const LEVELS = [
    { id: 1, name: 'Easy', pairs: 4, description: '4 pairs (8 cards)' },
    { id: 2, name: 'Medium', pairs: 6, description: '6 pairs (12 cards)' },
    { id: 3, name: 'Hard', pairs: 8, description: '8 pairs (16 cards)' },
];

export default HINDI_SWARAS;
