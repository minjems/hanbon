// Greek phonetic mapping
import { decompose, isKoreanSyllable, isKoreanConsonant, isKoreanVowel, getChosungIndex, getJungsungIndex } from '../decompose.js';

const CHOSUNG_TO = ['γ','γκ','ν','δ','θ','ρ','μ','β','β','σ','ξ','','ζ','τζ','τζ','χ','τ','φ','χ'];
const JUNGSUNG_TO = ['α','ε','ια','ε','ο','ε','ιο','ιε','ο','ο','ε','ε','ιο','ου','ουά','ε','η','ιου','ου','η','η'];
const JONGSUNG_TO = ['','γκ','γκ','γκ','ν','ν','ν','θ','λ','γκ','μ','β','θ','θ','β','λ','μ','β','β','θ','θ','γγ','θ','θ','γκ','θ','β','θ'];

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

export const langCode = 'el-GR';
