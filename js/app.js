// Main application controller
import { convert, getLangCode, converters, labelToKey, getAvailableLanguages } from './converter.js';

let selectedLang = 'japanese';

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function init() {
    const input = $('#input');
    const output = $('#output');
    const mainBtns = $$('.main-lang-btn');
    const copyBtn = $('#copy-btn');
    const ttsBtn = $('#tts-btn');
    const themeBtn = $('#theme-btn');

    // Theme
    const savedTheme = localStorage.getItem('hanbon-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    // Input -> real-time conversion
    input.addEventListener('input', () => doConvert());

    // Main language buttons (3 icons)
    mainBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.dataset.lang;
            if (selectedLang === lang) return;

            // Clear chatbot override
            clearChatbotOverride();

            mainBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedLang = lang;
            doConvert();

            const hint = $('#hint-chinese');
            if (hint) hint.style.display = lang === 'chinese' ? 'block' : 'none';
        });
    });

    // Copy
    copyBtn.addEventListener('click', async () => {
        const text = output.value;
        if (!text) return;
        try {
            await navigator.clipboard.writeText(text);
            showToast('복사되었습니다!');
        } catch {
            output.select();
            document.execCommand('copy');
            showToast('복사되었습니다!');
        }
    });

    // TTS (female voice only - matches donation TTS)
    ttsBtn.addEventListener('click', () => {
        if (!selectedLang) { showToast('언어를 선택하세요'); return; }
        const text = output.value;
        if (!text) return;
        speakFemale(text, getLangCode(selectedLang));
    });

    // Theme toggle
    themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('hanbon-theme', next);
        updateThemeIcon(next);
    });

    // Preload voices
    if (window.speechSynthesis) {
        window.speechSynthesis.getVoices();
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }

    // Chatbot
    initChatbot();

    input.focus();
}

function doConvert() {
    const input = $('#input');
    const output = $('#output');
    if (!selectedLang) { output.value = ''; return; }
    output.value = convert(input.value, selectedLang);
}

// Switch the main converter to a chatbot-selected language
function switchToLanguage(langKey) {
    const conv = converters[langKey];
    if (!conv) return;

    selectedLang = langKey;

    // Deactivate main 3 buttons
    $$('.main-lang-btn').forEach(b => b.classList.remove('active'));

    // Show override badge on card
    let badge = $('#lang-override-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.id = 'lang-override-badge';
        badge.className = 'lang-override-badge';
        $('.main-langs').after(badge);
    }
    badge.innerHTML = `${conv.flag} <strong>${conv.label}</strong> 모드 <button class="badge-close" onclick="document.dispatchEvent(new CustomEvent('clear-override'))">✕</button>`;
    badge.classList.add('show');

    // Add glow effect to card
    $('.card').classList.add('chatbot-active');

    // Convert with new language
    doConvert();
}

function clearChatbotOverride() {
    const badge = $('#lang-override-badge');
    if (badge) {
        badge.classList.remove('show');
    }
    $('.card').classList.remove('chatbot-active');
}

// Listen for clear override event
document.addEventListener('clear-override', () => {
    clearChatbotOverride();
    // Re-activate Japanese as default
    selectedLang = 'japanese';
    $$('.main-lang-btn').forEach(b => {
        b.classList.toggle('active', b.dataset.lang === 'japanese');
    });
    doConvert();
});

function updateThemeIcon(theme) {
    const btn = $('#theme-btn');
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
    btn.title = theme === 'dark' ? '라이트 모드' : '다크 모드';
}

// TTS - female voice only
function speakFemale(text, langCode) {
    if (typeof SpeechSynthesisUtterance === 'undefined' || !window.speechSynthesis) {
        showToast('이 브라우저는 TTS를 지원하지 않습니다');
        return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langCode;
    utterance.rate = 1;
    utterance.pitch = 1;

    // Find female voice for this language
    const voices = window.speechSynthesis.getVoices();
    const langPrefix = langCode.split('-')[0];
    const femaleVoice = voices.find(v =>
        v.lang.startsWith(langPrefix) &&
        (v.name.toLowerCase().includes('female') ||
         v.name.toLowerCase().includes('woman') ||
         v.name.includes('Haruka') || v.name.includes('Sayaka') ||  // Japanese female
         v.name.includes('Huihui') || v.name.includes('Yaoyao') ||  // Chinese female
         v.name.includes('Zira') ||   // English female
         v.name.includes('Hedda') ||  // German female
         v.name.includes('Elsa') ||   // Italian female
         v.name.includes('Helena') || // Spanish female
         v.name.includes('Hortense') || // French female
         v.name.includes('Irina') ||  // Russian female
         v.name.includes('Pattara') || // Thai female
         v.name.includes('Maria') ||  // Portuguese female
         v.name.includes('Google') && !v.name.toLowerCase().includes('male'))
    );

    if (femaleVoice) {
        utterance.voice = femaleVoice;
    }

    window.speechSynthesis.speak(utterance);
}

function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// ===== Rule-based Chatbot (state machine) =====
function initChatbot() {
    const input = $('#chatbot-input');
    const sendBtn = $('#chatbot-send');
    const messages = $('#chatbot-messages');

    // State: null = waiting for language, { key, label, flag } = waiting for Korean text
    let chatState = null;

    addBotMessage('안녕하세요! 변환하고 싶은 언어를 입력해주세요.\n\n지원: 독일어, 그리스어, 이탈리아어, 스페인어, 프랑스어, 러시아어, 포르투갈어, 태국어, 터키어');

    sendBtn.addEventListener('click', () => processChatInput());
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') processChatInput();
    });

    function processChatInput() {
        const text = input.value.trim();
        if (!text) return;
        input.value = '';

        addUserMessage(text);

        if (chatState === null) {
            // State: waiting for language
            handleLanguageInput(text);
        } else {
            // State: waiting for Korean text
            handleKoreanInput(text);
        }
    }

    function handleLanguageInput(text) {
        // Check for language switch commands even in Korean-input state
        const matched = matchLanguage(text);

        if (matched) {
            chatState = matched;
            switchToLanguage(matched.key);
            addBotMessage(`${matched.flag} ${matched.label} 모드!\n\n변환할 한국어를 입력해주세요.\n(다른 언어로 바꾸려면 언어 이름을 입력)`);
            input.placeholder = '한국어 입력...';
        } else if (text.includes('목록') || text.includes('언어') || text.includes('뭐') || text.includes('도움') || text.includes('help')) {
            addBotMessage('지원하는 언어 목록:\n\n🇩🇪 독일어\n🇬🇷 그리스어\n🇮🇹 이탈리아어\n🇪🇸 스페인어\n🇫🇷 프랑스어\n🇷🇺 러시아어\n🇧🇷 포르투갈어\n🇹🇭 태국어\n🇹🇷 터키어');
        } else if (text === '취소' || text === '초기화' || text === '리셋') {
            chatState = null;
            clearChatbotOverride();
            selectedLang = 'japanese';
            $$('.main-lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === 'japanese'));
            doConvert();
            input.placeholder = '언어 입력 (예: 독일어)';
            addBotMessage('초기화되었습니다. 변환할 언어를 입력해주세요.');
        } else {
            addBotMessage(`"${text}" 는 지원하지 않는 언어입니다.\n\n지원: 독일어, 그리스어, 이탈리아어, 스페인어, 프랑스어, 러시아어, 포르투갈어, 태국어, 터키어`);
        }
    }

    function handleKoreanInput(text) {
        // First check if it's a language switch
        const langSwitch = matchLanguage(text);
        if (langSwitch) {
            chatState = langSwitch;
            switchToLanguage(langSwitch.key);
            addBotMessage(`${langSwitch.flag} ${langSwitch.label} 모드로 전환!\n\n변환할 한국어를 입력해주세요.`);
            return;
        }

        // Check for reset
        if (text === '취소' || text === '초기화' || text === '리셋') {
            chatState = null;
            clearChatbotOverride();
            selectedLang = 'japanese';
            $$('.main-lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === 'japanese'));
            doConvert();
            input.placeholder = '언어 입력 (예: 독일어)';
            addBotMessage('초기화되었습니다. 변환할 언어를 입력해주세요.');
            return;
        }

        // Convert Korean text
        const result = convert(text, chatState.key);
        addBotMessage(`${chatState.flag} ${result}`);
        addBotAction(chatState.key, result);

        // Also update the main converter input & output
        $('#input').value = text;
        doConvert();
    }

    function matchLanguage(text) {
        const normalized = text.replace(/\s/g, '').toLowerCase();

        for (const [key, val] of Object.entries(converters)) {
            if (['japanese', 'chinese', 'english'].includes(key)) continue;
            if (normalized.includes(val.label.replace('어', '')) || normalized === val.label) {
                return { key, ...val };
            }
        }

        const enMap = {
            'german': 'german', 'deutsch': 'german',
            'greek': 'greek', 'greece': 'greek',
            'italian': 'italian', 'italy': 'italian',
            'spanish': 'spanish', 'spain': 'spanish',
            'french': 'french', 'france': 'french',
            'russian': 'russian', 'russia': 'russian',
            'portuguese': 'portuguese', 'portugal': 'portuguese',
            'thai': 'thai', 'thailand': 'thai',
            'turkish': 'turkish', 'turkey': 'turkish',
        };

        for (const [en, key] of Object.entries(enMap)) {
            if (normalized.includes(en)) return { key, ...converters[key] };
        }

        return null;
    }

    function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'chat-msg user';
        div.textContent = text;
        messages.appendChild(div);
        scrollToBottom();
    }

    function addBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'chat-msg bot';
        div.textContent = text;
        messages.appendChild(div);
        scrollToBottom();
    }

    function addBotAction(langKey, result) {
        const div = document.createElement('div');
        div.className = 'chat-msg bot chat-actions';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'chat-action-btn';
        copyBtn.textContent = '📋 복사';
        copyBtn.onclick = async () => {
            try {
                await navigator.clipboard.writeText(result);
                showToast('복사되었습니다!');
            } catch { showToast('복사 실패'); }
        };

        const ttsBtn = document.createElement('button');
        ttsBtn.className = 'chat-action-btn';
        ttsBtn.textContent = '🔊 듣기';
        ttsBtn.onclick = () => {
            if (!window.speechSynthesis) return;
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(result);
            u.lang = getLangCode(langKey);
            window.speechSynthesis.speak(u);
        };

        div.appendChild(copyBtn);
        div.appendChild(ttsBtn);
        messages.appendChild(div);
        scrollToBottom();
    }

    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }
}

document.addEventListener('DOMContentLoaded', init);
