// Turkish phonetic mapping
import { decompose, isKoreanSyllable, isKoreanConsonant, isKoreanVowel, getChosungIndex, getJungsungIndex } from '../decompose.js';

const CHOSUNG_TO = ['g','g','n','d','d','l','m','b','b','s','s','','c','c','ç','k','t','p','h'];
const JUNGSUNG_TO = ['a','e','ya','ye','ö','e','yö','ye','o','va','ve','ve','yo','u','vo','ve','vi','yü','ü','üi','i'];
const JONGSUNG_TO = ['','k','k','k','n','n','n','t','l','k','m','b','t','t','b','l','m','b','b','t','t','ng','t','t','k','t','b','t'];

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

export const langCode = 'tr-TR';
