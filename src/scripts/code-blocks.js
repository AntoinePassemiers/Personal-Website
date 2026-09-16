const LONG_CODE_LINE_THRESHOLD = 18;

const languageIcons = {
  js: '🟨',
  javascript: '🟨',
  ts: '🔷',
  typescript: '🔷',
  python: '🐍',
  py: '🐍',
  bash: '💻',
  sh: '💻',
  shell: '💻',
  html: '🌐',
  css: '🎨',
  json: '🧩',
  astro: '🚀',
  markdown: '📝',
  md: '📝',
  latex: '∑',
  tex: '∑'
};

const copyIcon = `
  <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/>
  </svg>
  <span class="sr-only">Copy code</span>
`;

const checkIcon = `
  <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z"/>
  </svg>
  <span class="sr-only">Copied</span>
`;

function getLanguage(pre, code) {
  const candidates = [
    ...code.classList,
    ...pre.classList
  ];

  const className = candidates.find((name) =>
    name.startsWith('language-')
  );

  if (className) {
    return className.replace('language-', '');
  }

  const dataLanguage =
    code.dataset.language ||
    pre.dataset.language ||
    code.getAttribute('data-language') ||
    pre.getAttribute('data-language');

  if (dataLanguage) {
    return dataLanguage.toLowerCase();
  }

  return 'text';
}

function countLines(code) {
  return code.innerText.trimEnd().split('\n').length;
}

document.querySelectorAll('pre').forEach((pre) => {
  const code = pre.querySelector('code');
  if (!code) return;

  if (pre.dataset.enhanced === 'true') return;
  pre.dataset.enhanced = 'true';

  const language = getLanguage(pre, code);
  const icon = languageIcons[language] ?? '📄';
  const lineCount = countLines(code);

  pre.classList.add('enhanced-code-block');

  const header = document.createElement('div');
  header.className = 'code-block-header';

  const label = document.createElement('span');
  label.className = 'code-block-language';
  label.textContent = `${icon} ${language}`;

  const actions = document.createElement('div');
  actions.className = 'code-block-actions';

  if (lineCount >= LONG_CODE_LINE_THRESHOLD) {
    pre.classList.add('is-collapsed');

    const collapseButton = document.createElement('button');
    collapseButton.className = 'code-block-button';
    collapseButton.type = 'button';
    collapseButton.textContent = 'Expand';

    collapseButton.addEventListener('click', () => {
      const isCollapsed = pre.classList.toggle('is-collapsed');
      collapseButton.textContent = isCollapsed ? 'Expand' : 'Collapse';
    });

    const bottomExpandButton = document.createElement('button');
    bottomExpandButton.className = 'code-gradient-expand';
    bottomExpandButton.type = 'button';
    bottomExpandButton.setAttribute('aria-label', 'Expand code block');

    bottomExpandButton.addEventListener('click', () => {
      pre.classList.remove('is-collapsed');
      collapseButton.textContent = 'Collapse';
    });

    pre.appendChild(bottomExpandButton);
    actions.appendChild(collapseButton);
  }

  const copyButton = document.createElement('button');
  copyButton.className = 'code-block-button code-copy-button';
  copyButton.type = 'button';
  copyButton.innerHTML = copyIcon;

  copyButton.addEventListener('click', async () => {
    await navigator.clipboard.writeText(code.innerText);

    copyButton.innerHTML = checkIcon;
    copyButton.classList.add('copied');

    setTimeout(() => {
      copyButton.innerHTML = copyIcon;
      copyButton.classList.remove('copied');
    }, 1500);
  });

  actions.appendChild(copyButton);

  header.append(label, actions);
  pre.prepend(header);
});
