const copyIcon = `
  <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v12h2V3h12V1Zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm0 16H8V7h11v14Z"/>
  </svg>
`;

const checkIcon = `
  <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
    <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2Z"/>
  </svg>
`;

document.querySelectorAll('pre').forEach((pre) => {
  const code = pre.querySelector('code');
  if (!code) return;

  const button = document.createElement('button');
  button.className = 'copy-code-button';
  button.type = 'button';
  button.innerHTML = copyIcon;

  button.addEventListener('click', async () => {
    await navigator.clipboard.writeText(code.innerText);

    button.innerHTML = checkIcon;
    button.classList.add('copied');

    setTimeout(() => {
      button.innerHTML = copyIcon;
      button.classList.remove('copied');
    }, 1500);
  });

  pre.classList.add('code-block-with-copy');
  pre.appendChild(button);
});