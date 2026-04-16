// Russian (Cyrillic) phonetic mapping
import { decompose, isKoreanSyllable, isKoreanConsonant, isKoreanVowel, getChosungIndex, getJungsungIndex } from '../decompose.js';

const CHOSUNG_TO = ['г','г','н','д','т','л','м','б','п','с','с','','дж','дж','ч','к','т','п','х'];
const JUNGSUNG_TO = ['а','э','я','э','о','э','ё','е','о','уа','уэ','уэ','ё','у','уо','уэ','ви','ю','ы','ый','и'];
const JONGSUNG_TO = ['','к','к','к','н','н','н','т','л','к','м','б','т','т','б','л','м','б','б','т','т','нг','т','т','к','т','б','т'];

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

export const langCode = 'ru-RU';
