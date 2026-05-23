const KEY = 'preferredLanguage';
const base = document.documentElement.dataset.base || '/';
const route = document.documentElement.dataset.route || '/';
const fromCookie = document.cookie
  .split('; ')
  .find((row) => row.startsWith(`${KEY}=`))
  ?.split('=')[1];
const fromStorage = localStorage.getItem(KEY);
const fromBrowser = navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
const lang = ['en', 'fr'].includes(fromStorage) ? fromStorage : ['en', 'fr'].includes(fromCookie) ? fromCookie : fromBrowser;
const normalizedBase = base.endsWith('/') ? base : `${base}/`;
const normalizedRoute = route.replace(/^\//, '').replace(/\/$/, '');
const target = `${normalizedBase}${normalizedRoute ? `${normalizedRoute}/` : ''}${lang}/`;
window.location.replace(target);
