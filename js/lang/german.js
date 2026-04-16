// German phonetic mapping
import { decompose, isKoreanSyllable, isKoreanConsonant, isKoreanVowel, getChosungIndex, getJungsungIndex } from '../decompose.js';

const CHOSUNG_TO = ['g','g','n','d','d','l','m','b','b','ß','ß','','z','z','ch','k','t','p','h'];
const JUNGSUNG_TO = ['a','ä','ja','ä','u','ä','u','ä','o','a','ä','ö','jo','u','u','ä','i','ju','u','i','i'];
const JONGSUNG_TO = ['','g','g','g','n','n','n','d','l','g','m','b','d','d','b','l','m','b','b','d','d','ng','d','d','g','d','b','d'];

export function convert(text) {
    let result = '';
    for (const char of text) {
        if (char === ' ') {
            result += '-';
        } else if (isKoreanSyllable(char)) {
            const { initial, medial, final: f } = decompose(char);
            result += CHOSUNG_TO[initial] + JUNGSUNG_TO[medial] + JONGSUNG_TO[f];
        } else if (isKoreanConsonant(char)) {
            const idx = getChosungIndex(char);
            if (idx >= 0) result += CHOSUNG_TO[idx];
        } else if (isKoreanVowel(char)) {
            const idx = getJungsungIndex(char);
            if (idx >= 0) result += JUNGSUNG_TO[idx];
        } else {
            result += char;
        }
    }
    return result;
}

export const langCode = 'de-DE';
