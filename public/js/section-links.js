const headings = document.querySelectorAll(
  '.prose h1[id], .prose h2[id], .prose h3[id], .prose h4[id]'
);

headings.forEach((heading) => {
  heading.tabIndex = 0;
  heading.classList.add('clickable-heading');

  heading.addEventListener('click', () => {
    history.pushState(null, '', `#${heading.id}`);
  });

  heading.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      history.pushState(null, '', `#${heading.id}`);
    }
  });
});

const observer = new IntersectionObserver(
  (entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    const id = visible.target.id;
    history.replaceState(null, '', `#${id}`);
  },
  {
    rootMargin: '-20% 0px -70% 0px',
    threshold: [0.1, 0.5, 1]
  }
);

headings.forEach((heading) => observer.observe(heading));
