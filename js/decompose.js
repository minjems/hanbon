// Korean syllable decomposition engine
// 한글 유니코드: 가(0xAC00) ~ 힣(0xD7A3)
// 초성 19개, 중성 21개, 종성 28개 (0 = 종성 없음)

export const CHOSUNG = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
export const JUNGSUNG = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
export const JONGSUNG = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

const HANGUL_START = 0xAC00;
const HANGUL_END = 0xD7A3;
const JAMO_CHOSUNG_START = 0x3131; // ㄱ
const JAMO_CHOSUNG_END = 0x314E;   // ㅎ
const JAMO_JUNGSUNG_START = 0x314F; // ㅏ
const JAMO_JUNGSUNG_END = 0x3163;   // ㅣ

export function isKoreanSyllable(char) {
    const code = char.charCodeAt(0);
    return code >= HANGUL_START && code <= HANGUL_END;
}

export function isKoreanConsonant(char) {
    const code = char.charCodeAt(0);
    return code >= JAMO_CHOSUNG_START && code <= JAMO_CHOSUNG_END;
}

export function isKoreanVowel(char) {
    const code = char.charCodeAt(0);
    return code >= JAMO_JUNGSUNG_START && code <= JAMO_JUNGSUNG_END;
}

// Decompose a Korean syllable into initial, medial, final indices
export function decompose(char) {
    if (!isKoreanSyllable(char)) return null;

    const code = char.charCodeAt(0) - HANGUL_START;
    const initial = Math.floor(code / 588);       // 21 * 28 = 588
    const medial = Math.floor((code % 588) / 28);
    const final_ = code % 28;

    return { initial, medial, final: final_ };
}

// Compose indices back into a Korean syllable character
export function compose(initial, medial, final_ = 0) {
    const code = HANGUL_START + (initial * 588) + (medial * 28) + final_;
    return String.fromCharCode(code);
}

// Map standalone jamo to chosung index
const JAMO_TO_CHOSUNG = {
    'ㄱ':0,'ㄲ':1,'ㄴ':2,'ㄷ':3,'ㄸ':4,'ㄹ':5,'ㅁ':6,'ㅂ':7,'ㅃ':8,
    'ㅅ':9,'ㅆ':10,'ㅇ':11,'ㅈ':12,'ㅉ':13,'ㅊ':14,'ㅋ':15,'ㅌ':16,'ㅍ':17,'ㅎ':18
};

// Map standalone jamo to jungsung index
const JAMO_TO_JUNGSUNG = {
    'ㅏ':0,'ㅐ':1,'ㅑ':2,'ㅒ':3,'ㅓ':4,'ㅔ':5,'ㅕ':6,'ㅖ':7,'ㅗ':8,
    'ㅘ':9,'ㅙ':10,'ㅚ':11,'ㅛ':12,'ㅜ':13,'ㅝ':14,'ㅞ':15,'ㅟ':16,'ㅠ':17,'ㅡ':18,'ㅢ':19,'ㅣ':20
};

export function getChosungIndex(jamo) {
    return JAMO_TO_CHOSUNG[jamo] ?? -1;
}

export function getJungsungIndex(jamo) {
    return JAMO_TO_JUNGSUNG[jamo] ?? -1;
}
