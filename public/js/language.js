const KEY = 'preferredLanguage';
const MAX_AGE = 60 * 60 * 24 * 365;

function setCookie(name, value) {
  document.cookie = `${name}=${value}; path=/; max-age=${MAX_AGE}; SameSite=Lax`;
}

function storeLanguage(lang) {
  if (!['en', 'fr'].includes(lang)) return;
  localStorage.setItem(KEY, lang);
  setCookie(KEY, lang);
}

for (const link of document.querySelectorAll('[data-language-toggle]')) {
  link.addEventListener('click', () => {
    storeLanguage(link.dataset.language);
  });
}

const currentLang = document.body?.dataset?.lang;
if (currentLang) storeLanguage(currentLang);
