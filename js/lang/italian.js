// Italian phonetic mapping
import { decompose, isKoreanSyllable, isKoreanConsonant, isKoreanVowel, getChosungIndex, getJungsungIndex, JUNGSUNG } from '../decompose.js';

// Base mappings (indices 0,1,14,15,18 use exception table)
const CHOSUNG_TO = ['','','n','d','t','l','m','b','p','s','s','','z','z','','','t','p',''];
const JUNGSUNG_TO = ['a','e','ya','e','o','e','u','e','o','a','e','e','yo','u','uo','e','i','yu','u','i','i'];
const JONGSUNG_TO = ['','k','k','k','n','n','n','t','l','k','m','v','t','t','v','l','m','v','v','t','t','n','t','t','k','t','v','t'];

// Exception: consonants that change based on following vowel (ㄱ,ㄲ,ㅊ,ㅋ,ㅎ)
// Italian uses c/g before a,o,u but ch/gh before e,i
const FRONT_VOWELS = new Set([1,3,5,7,10,15,19,20]); // ㅐ,ㅒ,ㅔ,ㅖ,ㅙ,ㅞ,ㅢ,ㅣ

// Exception lookup: chosung index -> {front vowel sound, back vowel sound}
const EXCEPT_MAP = {
    0:  { front: 'gh', back: 'g' },   // ㄱ
    1:  { front: 'gh', back: 'g' },   // ㄲ
    14: { front: 'c',  back: 'ch' },  // ㅊ → ci/ce vs cho/cha
    15: { front: 'ch', back: 'c' },   // ㅋ → chi/che vs ca/co
    18: { front: '',   back: '' },     // ㅎ (silent in Italian style)
};

export function convert(text) {
    let result = '';
    for (const char of text) {
        if (char === ' ') {
            result += '-';
        } else if (isKoreanSyllable(char)) {
            const { initial, medial, final: f } = decompose(char);
            let cho;
            if (initial in EXCEPT_MAP) {
                const isFront = FRONT_VOWELS.has(medial);
                cho = isFront ? EXCEPT_MAP[initial].front : EXCEPT_MAP[initial].back;
            } else {
                cho = CHOSUNG_TO[initial];
            }
            result += cho + JUNGSUNG_TO[medial] + JONGSUNG_TO[f];
        } else if (isKoreanConsonant(char)) {
            const idx = getChosungIndex(char);
            if (idx >= 0) {
                if (idx in EXCEPT_MAP) {
                    result += EXCEPT_MAP[idx].back;
                } else {
                    result += CHOSUNG_TO[idx];
                }
            }
        } else if (isKoreanVowel(char)) {
            const idx = getJungsungIndex(char);
            if (idx >= 0) result += JUNGSUNG_TO[idx];
        } else {
            result += char;
        }
    }
    return result;
}

export const langCode = 'it-IT';
