// Publication topics overlap; each paper appears only once in the year list.
(() => {
  const data = window.SITE_CONTENT;
  const make = (tag, text, className = '') => {
    const node = document.createElement(tag);
    node.textContent = text;
    node.className = className;
    return node;
  };
  const themes = document.getElementById('research-themes');
  data.research.themes.forEach(theme => {
    const card = make('section', '', 'research-theme');
    card.append(make('h4', theme.title), make('p', theme.description));
    themes.append(card);
  });
  function row(item) {
    const article = make('article', '', 'publication-entry');
    article.append(make('h4', item.title));
    article.append(make('p', [item.venue.replace(/,\s*$/, ''), item.year, item.status].filter(Boolean).join(' · '), 'publication-meta'));
    if (item.link) {
      const link = make('a', 'Read publication ↗', 'publication-link');
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', 'Read ' + item.title);
      article.append(link);
    }
    return article;
  }
  const list = document.getElementById('publication-list');
  const filters = document.getElementById('publication-filters');
  const computingTopic = 'ML & Swarm Intelligence';
  const publications = [...data.publications, ...data.additionalPublications.map(p => ({...p, topics: [computingTopic]}))];
  let expanded = false;
  let currentTopic = 'All';
  const expand = document.getElementById('publication-expand');
  function render(topic) {
    currentTopic = topic;
    const entries = publications.filter(p => topic === 'All' || p.topics.includes(topic)).sort((a,b) => b.year-a.year);
    const shown = expanded ? entries : entries.slice(0, 5);
    list.replaceChildren();
    for (const year of [...new Set(shown.map(p => p.year))]) {
      const section = make('section', '', 'publication-year');
      section.append(make('h4', String(year), 'publication-year-title'));
      section.append(...shown.filter(p => p.year === year).map(row));
      list.append(section);
    }
    expand.hidden = entries.length <= 5;
    expand.textContent = expanded ? 'Show recent publications' : 'Show all publications';
    expand.setAttribute('aria-expanded', String(expanded));
    for (const button of filters.children) button.setAttribute('aria-pressed', String(button.textContent === topic));
    document.getElementById('publication-count').textContent = 'Showing ' + shown.length + ' of ' + entries.length + ' publications · ' + topic;
  }
  expand.addEventListener('click', () => { expanded = !expanded; render(currentTopic); });
  for (const topic of ['All', ...data.research.themes.map(t => t.title), computingTopic]) {
    const button = make('button', topic, 'journal-tab');
    button.type = 'button';
    button.addEventListener('click', () => render(topic));
    filters.append(button);
  }
  render('All');
  document.getElementById('tys-publications').replaceChildren(...data.publications.filter(p => p.featuredTys).map(row));
})();
