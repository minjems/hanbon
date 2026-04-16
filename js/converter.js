// Language conversion orchestrator
import { convert as toJapanese, langCode as jaCode } from './lang/japanese.js';
import { convert as toGerman, langCode as deCode } from './lang/german.js';
import { convert as toGreek, langCode as elCode } from './lang/greek.js';
import { convert as toItalian, langCode as itCode } from './lang/italian.js';
import { convert as toChinese, langCode as zhCode } from './lang/chinese.js';
import { convert as toSpanish, langCode as esCode } from './lang/spanish.js';
import { convert as toFrench, langCode as frCode } from './lang/french.js';
import { convert as toRussian, langCode as ruCode } from './lang/russian.js';
import { convert as toPortuguese, langCode as ptCode } from './lang/portuguese.js';
import { convert as toThai, langCode as thCode } from './lang/thai.js';
import { convert as toTurkish, langCode as trCode } from './lang/turkish.js';
import { convert as toEnglish, langCode as enCode } from './lang/english.js';

export const converters = {
    japanese:   { convert: toJapanese,   langCode: jaCode, label: '일본어', flag: '🇯🇵' },
    chinese:    { convert: toChinese,    langCode: zhCode, label: '중국어', flag: '🇨🇳' },
    english:    { convert: toEnglish,    langCode: enCode, label: '영어',   flag: '🇺🇸' },
    german:     { convert: toGerman,     langCode: deCode, label: '독일어', flag: '🇩🇪' },
    greek:      { convert: toGreek,      langCode: elCode, label: '그리스어', flag: '🇬🇷' },
    italian:    { convert: toItalian,    langCode: itCode, label: '이탈리아어', flag: '🇮🇹' },
    spanish:    { convert: toSpanish,    langCode: esCode, label: '스페인어', flag: '🇪🇸' },
    french:     { convert: toFrench,     langCode: frCode, label: '프랑스어', flag: '🇫🇷' },
    russian:    { convert: toRussian,    langCode: ruCode, label: '러시아어', flag: '🇷🇺' },
    portuguese: { convert: toPortuguese, langCode: ptCode, label: '포르투갈어', flag: '🇧🇷' },
    thai:       { convert: toThai,       langCode: thCode, label: '태국어', flag: '🇹🇭' },
    turkish:    { convert: toTurkish,    langCode: trCode, label: '터키어', flag: '🇹🇷' },
};

// Label -> key lookup for chatbot
export const labelToKey = {};
for (const [key, val] of Object.entries(converters)) {
    labelToKey[val.label] = key;
}

export function convert(text, language) {
    const conv = converters[language];
    if (!conv) return text;
    return conv.convert(text);
}

export function getLangCode(language) {
    return converters[language]?.langCode || '';
}

export function getLabel(language) {
    return converters[language]?.label || '';
}

export function getAvailableLanguages() {
    return Object.entries(converters).map(([key, val]) => ({
        key,
        label: val.label,
        flag: val.flag,
    }));
}
