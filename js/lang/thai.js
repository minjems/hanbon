// Thai phonetic mapping
import { decompose, isKoreanSyllable, isKoreanConsonant, isKoreanVowel, getChosungIndex, getJungsungIndex } from '../decompose.js';

const CHOSUNG_TO = ['ก','ก','น','ด','ต','ล','ม','บ','ป','ซ','ซ','','จ','จ','ช','ค','ท','พ','ฮ'];
const JUNGSUNG_TO = ['า','แ','ยา','แย','โ','เ','โย','เย','โ','วา','แว','เว','โย','อู','โว','เว','วี','ยู','อู','อือ','อี'];
const JONGSUNG_TO = ['','ก','ก','ก','น','น','น','ด','ล','ก','ม','บ','ด','ด','บ','ล','ม','บ','บ','ด','ด','ง','ด','ด','ก','ด','บ','ด'];

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

export const langCode = 'th-TH';
