// One collection supplies both the homepage and the complete archive.
(() => {
  const notes = [...(window.SITE_CONTENT?.fieldNotes || [])].sort((a, b) =>
    (b.date || '').localeCompare(a.date || ''));
  const make = (tag, className, text) => {
    const el = document.createElement(tag);
    el.className = className;
    if (text) el.textContent = text;
    return el;
  };
  function dateLabel(note) {
    if (note.dateLabel) return note.dateLabel;
    if (!note.date) return 'Date not recorded';
    if (note.date.length === 4) return note.date;
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric', month: 'long',
      ...(note.date.length === 10 ? {day: 'numeric'} : {}), timeZone: 'UTC'
    }).format(new Date(note.date.length === 7 ? note.date + '-01' : note.date));
  }
  function entry(note, compact = false) {
    const article = make('article', 'field-note');
    if (!compact) article.id = 'note-' + note.id;
    const meta = make('p', 'field-note-meta');
    const time = make(note.date ? 'time' : 'span', '', dateLabel(note));
    if (note.date) time.dateTime = note.date;
    const icons = {'Talk': '🗣', 'Game jam': '🎮', 'Game': '🎮', 'Paper': '✍️', 'Publication': '✍️', 'Community': '🤝', 'Event': '🤝', 'Workshop': '🛠️'};
    if (compact && icons[note.category]) { const icon = make('span', 'activity-icon', icons[note.category]); icon.setAttribute('aria-hidden', 'true'); meta.append(icon, ' '); }
    meta.append(time, ' · ', note.category);
    article.append(meta, make(compact ? 'h3' : 'h4', '', note.title), make('p', 'field-note-description', note.description));
    if (note.link) {
      const link = make('a', 'field-note-link', note.linkLabel || 'Read more →');
      link.href = note.link;
      if (/^https?:/.test(note.link)) { link.target = '_blank'; link.rel = 'noopener'; }
      article.append(link);
    }
    return article;
  }
  const latest = document.getElementById('latest-field-notes');
  if (!latest) return;
  latest.replaceChildren(...notes.filter(note => note.date).slice(0, 3).map(note => entry(note, true)));
  const archive = document.getElementById('field-note-archive');
  const filters = document.getElementById('field-note-filters');
  function render(yearFilter) {
    const selected = notes.filter(note => yearFilter === 'All' || (note.date?.slice(0, 4) || 'Undated') === yearFilter);
    archive.replaceChildren();
    const years = [...new Set(selected.map(note => note.date?.slice(0, 4) || 'Undated'))];
    for (const year of years) {
      const section = make('section', 'journal-year');
      section.append(make('h3', 'journal-year-heading', year));
      section.append(...selected.filter(note => (note.date?.slice(0, 4) || 'Undated') === year).map(note => entry(note)));
      archive.append(section);
    }
    document.getElementById('field-note-count').textContent = `${selected.length} ${selected.length === 1 ? 'entry' : 'entries'} · ${yearFilter === 'All' ? 'All years' : yearFilter}`;
    for (const button of filters.children) button.setAttribute('aria-pressed', String(button.textContent === yearFilter));
  }
  for (const yearFilter of ['All', ...new Set(notes.map(note => note.date?.slice(0, 4) || 'Undated'))]) {
    const button = make('button', 'journal-tab', yearFilter);
    button.type = 'button';
    button.addEventListener('click', () => render(yearFilter));
    filters.append(button);
  }
  render('All');
  // Talks are curated from the same entries, so recordings only need updating once.
  const talks = document.getElementById('talk-list');
  for (const [category, title] of [['Video', 'Recorded talks'], ['Audio', 'Interviews & audio']]) {
    const group = make('section', 'inner-box');
    group.append(make('h3', '', title));
    for (const note of notes.filter(note => note.recording?.kind === category)) {
      const item = entry({...note, link: note.recording.link, linkLabel: category === 'Video' ? 'Watch the recording ↗' : 'Listen to the interview ↗'}, false);
      item.removeAttribute('id');
      item.classList.add('broadcast-entry');
      const link = item.querySelector('a');
      if (link) link.classList.add('btn');
      group.append(item);
    }
    talks.append(group);
  }
})();
