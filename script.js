// Builds repeatable entries from content.js. No server or build step required.
(() => {
  'use strict';
  const data = window.SITE_CONTENT;
  if (!data) {
    const warning = document.createElement('p');
    warning.textContent = 'Website content could not load. Check that content.js is beside index.html and contains valid JavaScript.';
    warning.setAttribute('role', 'alert');
    document.querySelector('#home .app-content').prepend(warning);
    return;
  }
  // Bind plain text and attributes without interpreting editable text as HTML.
  const valueAt = path => path.split('.').reduce((value, key) => value?.[key], data);
  document.querySelectorAll('[data-content]').forEach(el => {
    el.textContent = valueAt(el.dataset.content) ?? '';
  });
  for (const attribute of ['src', 'alt', 'href', 'content']) {
    document.querySelectorAll(`[data-content-${attribute}]`).forEach(el => {
      const value = valueAt(el.getAttribute(`data-content-${attribute}`));
      if (value) el.setAttribute(attribute, value);
      else el.removeAttribute(attribute);
      if (attribute === 'src') el.style.display = value ? '' : 'none';
    });
  }
  document.querySelectorAll('[data-content-list]').forEach(el => {
    el.replaceChildren(...(valueAt(el.dataset.contentList) || []).map(item => {
      const li = document.createElement('li');
      if (item.title) {
        const title = document.createElement('strong');
        title.textContent = item.title;
        li.append(title, ' ');
      }
      if (item.link) {
        const link = document.createElement('a');
        link.href = item.link;
        link.textContent = item.description;
        li.append(link);
      } else li.append(item.description);
      return li;
    }));
  });
  document.querySelectorAll('[data-content-rich]').forEach(el => {
    el.replaceChildren(...(valueAt(el.dataset.contentRich) || []).map(part => {
      if (!part.bold) return document.createTextNode(part.text);
      const strong = document.createElement('strong');
      strong.textContent = part.text;
      return strong;
    }));
  });
  function button(item) {
    const link = document.createElement('a');
    link.className = 'btn';
    link.textContent = item.buttonLabel || item.title;
    link.href = item.link;
    if (item.newTab) { link.target = '_blank'; link.rel = 'noopener'; }
    return link;
  }
  document.getElementById('profile-links').replaceChildren(
    ...data.profile.links.filter(item => item.link).map(button)
  );
  function projectCard(item, compact = false) {
    const card = document.createElement('article');
    card.className = 'project-card project-' + item.theme;
    const cover = document.createElement('div');
    cover.className = 'project-cover';
    const icon = document.createElement('span');
    icon.textContent = item.icon;
    icon.setAttribute('aria-hidden', 'true');
    const category = document.createElement('span');
    category.textContent = item.category;
    cover.append(icon, category);
    const coverImage = compact && item.homeImage ? item.homeImage : item.image;
    if (coverImage) {
      const screenshot = document.createElement('img');
      screenshot.src = coverImage;
      screenshot.alt = compact && item.homeImage ? (item.homeImageAlt || item.title) : (item.imageAlt || item.title);
      if (compact && item.homeImage) cover.classList.add('has-project-icon');
      screenshot.className = 'project-screenshot';
      screenshot.onerror = () => { screenshot.remove(); cover.classList.remove('has-screenshot'); };
      cover.classList.add('has-screenshot');
      cover.append(screenshot);
    }
    const body = document.createElement('div');
    body.className = 'project-body';
    const status = document.createElement('p');
    status.className = 'project-status';
    status.textContent = item.status;
    const title = document.createElement('h3');
    title.textContent = item.title;
    const description = document.createElement('p');
    description.textContent = item.description;
    body.append(status, title, description);
    if (compact) {
      if (item.link) body.append(button(item));
      const link = document.createElement('a');
      link.href = '#project-' + item.id;
      link.textContent = 'About the project →';
      body.append(link);
    } else {
      card.id = 'project-' + item.id;
      const details = document.createElement('p');
      details.textContent = item.details;
      if (item.details) body.append(details);
      if (item.link) body.append(button(item));
      else {
        const note = document.createElement('p');
        note.className = 'project-availability';
        note.textContent = 'Prototype preview · playable version not yet available here';
        body.append(note);
      }
    }
    card.append(cover, body);
    if (!compact && item.sections?.length) {
      const context = document.createElement('div');
      context.className = 'project-context';
      for (const section of item.sections) {
        const part = document.createElement('section');
        const heading = document.createElement('h4');
        heading.textContent = section.title;
        const text = document.createElement('p');
        text.textContent = section.text;
        part.append(heading, text);
        context.append(part);
      }
      card.append(context);
    }
    if (!compact && item.screenshots?.length) {
      const gallery = document.createElement('div');
      gallery.className = 'project-gallery';
      item.screenshots.forEach(shot => {
        const figure = document.createElement('figure');
        const link = document.createElement('a');
        link.href = shot.image;
        link.target = '_blank';
        link.rel = 'noopener';
        link.setAttribute('aria-label', shot.caption + ' Open full-size screenshot in a new tab.');
        const image = document.createElement('img');
        image.src = shot.image;
        image.alt = shot.alt;
        image.loading = 'lazy';
        link.append(image);
        const caption = document.createElement('figcaption');
        caption.textContent = shot.caption;
        figure.append(link, caption);
        gallery.append(figure);
      });
      card.append(gallery);
    }
    if (!compact && item.id === 'branch-beetle') {
      const more = document.createElement('details');
      more.className = 'project-more';
      const summary = document.createElement('summary');
      summary.textContent = 'Research context & screenshots';
      more.append(summary);
      card.querySelectorAll('.project-context, .project-gallery').forEach(el => more.append(el));
      card.append(more);
    }
    return card;
  }
  document.getElementById('featured-projects').replaceChildren(...data.projects.filter(item => item.featured).map(item => projectCard(item, true)));
  document.getElementById('project-spotlight').replaceChildren(...data.projects.filter(item => item.id === 'branch-beetle').map(item => projectCard(item)));
  for (const [container, id] of [['teaching-tools','dungeons-drafting']]) {
    document.getElementById(container).replaceChildren(...data.projects.filter(item => item.id === id).map(item => projectCard(item)));
  }
  function tags(container, values) {
    container.replaceChildren(...values.map(value => {
      const tag = document.createElement('span');
      tag.textContent = value;
      return tag;
    }));
  }
  document.getElementById('research-prototypes').replaceChildren(...data.projects.filter(p => ['insider-out','todo-terrarium','down-the-memory-lane','one-spell-fits-all'].includes(p.id)).map(p => projectCard(p)));
  const gameItems = data.games;
  const gameCards = gameItems.map(item => {
    const card = document.getElementById('game-card-template').content.firstElementChild.cloneNode(true);
    if (item.id) card.id = 'project-' + item.id;
    card.querySelector('h3').textContent = item.title;
    if (item.ribbon) { const ribbon = document.createElement('span'); ribbon.className = 'release-ribbon'; ribbon.textContent = item.ribbon; card.prepend(ribbon); }
    card.querySelector('.card-cost').textContent = item.cost;
    if (!item.cost) card.querySelector('.card-cost').remove();
    tags(card.querySelector('.tags'), item.tags);
    card.querySelector('p').textContent = item.description;
    const image = card.querySelector('img');
    image.removeAttribute('onerror');
    image.alt = item.imageAlt || item.title;
    if (item.imageFit) image.style.objectFit = item.imageFit;
    const hideImage = () => {
      image.style.display = 'none';
      if (item.imagePlaceholder) {
        const frame = image.parentElement;
        frame.classList.add('game-cover-placeholder');
        frame.setAttribute('aria-hidden', 'true');
        frame.textContent = item.imagePlaceholder;
      }
    };
    image.onerror = () => {
      if (item.imageFallback) {
        image.onerror = hideImage;
        image.src = item.imageFallback;
      } else hideImage();
    };
    if (item.image) image.src = item.image;
    else hideImage();
    const link = card.querySelector('a');
    if (item.link) {link.href = item.link; link.rel = 'noopener'; if (item.buttonLabel) link.textContent = item.buttonLabel;}
    else { link.remove(); const note = document.createElement('p'); note.className = 'game-availability'; note.textContent = 'Research prototype · playable version not yet available here'; card.append(note); }
    return card;
  });
  document.getElementById('game-list').replaceChildren(...gameCards);
  const courses = data.teaching.map(item => {
    const card = document.getElementById('course-card-template').content.firstElementChild.cloneNode(true);
    card.querySelector('h3').textContent = item.title;
    if (item.current) card.classList.add('current-course');
    tags(card.querySelector('.tags'), item.tags);
    card.querySelector('p').textContent = item.description;
    const link = card.querySelector('a');
    link.textContent = item.buttonLabel || '';
    if (item.link) link.href = item.link;
    if (item.newTab) {
      link.target = '_blank';
      link.rel = 'noopener';
      link.setAttribute('aria-label', (item.buttonLabel || item.title) + ' (opens in a new tab)');
    }
    if (!item.buttonLabel || !item.link) link.remove();
    return card;
  });
  document.getElementById('current-course').replaceChildren(...courses.filter(c => c.classList.contains('current-course')));
  document.getElementById('course-list').replaceChildren(...courses.filter(c => !c.classList.contains('current-course')));
})();

let isHorror = false;
    let typeTimeout = null;
    let currentDialogue = '';
    let effectsEnabled = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    try {
      const saved = localStorage.getItem('site-effects');
      if (saved !== null) effectsEnabled = saved === 'on';
    } catch (_) { /* The control also works when storage is unavailable. */ }

    function applyEffectsPreference() {
      document.body.dataset.effects = effectsEnabled ? 'on' : 'off';
      const button = document.getElementById('effects-toggle');
      button.textContent = effectsEnabled ? 'Effects: on' : 'Effects: off';
      button.setAttribute('aria-pressed', String(effectsEnabled));
      if (!effectsEnabled) {
        clearTimeout(typeTimeout);
        document.querySelectorAll('.click-particle').forEach(el => el.remove());
        document.getElementById('achievement-toast').style.display = 'none';
        document.getElementById('level-up-msg').style.display = 'none';
        if (currentDialogue) document.getElementById('typewriter-text').textContent = '> ' + currentDialogue;
      }
    }

    function toggleEffects() {
      effectsEnabled = !effectsEnabled;
      try { localStorage.setItem('site-effects', effectsEnabled ? 'on' : 'off'); } catch (_) {}
      applyEffectsPreference();
    }

    const dialogLinesLight = window.SITE_CONTENT?.profile.dialogue?.length ? window.SITE_CONTENT.profile.dialogue : ['Welcome!'];
    
    // BioShock / Silent Hill inspired dialogue
    const dialogLinesHorror = window.SITE_CONTENT?.profile.horrorDialogue?.length ? window.SITE_CONTENT.profile.horrorDialogue : ['The fog is rolling in...'];

    // --- TROPHY / ACHIEVEMENT SYSTEM ---
    const achievements = {
      home: { title: "Secret Agent 🎀", desc: "Booted up the OS.", unlocked: true },
      phd: { title: "Sul sul! 🦙", desc: "Found the Knowledge Aspiration.", unlocked: false },
      games: { title: "The Spire 🗡️", desc: "Checked the inventory deck.", unlocked: false },
      projects: { title: "Curious Maker 🛠️", desc: "Explored the creative workshop.", unlocked: false },
      guild: { title: "New Villager 🍃", desc: "Visited the town hall.", unlocked: false },
      academy: { title: "Determination ♥", desc: "Entered the Academy.", unlocked: false },
      chronicles: { title: "Kindred 🦇", desc: "Explored the talks and broadcasts.", unlocked: false },
      "field-notes": { title: "Field Researcher 📓", desc: "Browsed the field notes.", unlocked: false },
      dark_mode: { title: "Corrupted 💀", desc: "Uncovered the dark truth of the OS.", unlocked: false },
      tama_friend: { title: "Tama Caretaker 💖", desc: "Interacted with your desktop pet.", unlocked: false },
      level_5: { title: "Dedicated Grinder 🌟", desc: "Reached Level 5.", unlocked: false }
    };

    function toggleTrophies() {
      const content = document.getElementById('trophies-content');
      const icon = document.getElementById('trophy-icon');
      if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.innerText = '-';
      } else {
        content.style.display = 'none';
        icon.innerText = '+';
      }
      document.querySelector('.trophy-toggle')?.setAttribute('aria-expanded', String(content.style.display === 'block'));
    }

    function toggleFocus(id) {
      const content = document.getElementById(id);
      const icon = document.getElementById('icon-' + id);
      if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        icon.innerText = '-';
      } else {
        content.style.display = 'none';
        icon.innerText = '+';
      }
    }

    function unlockAchievement(id) {
      if (achievements[id] && !achievements[id].unlocked) {
        achievements[id].unlocked = true;
        showAchievementToast(achievements[id].title);
        renderAchievements();
        addXP(20); 
      }
    }

    function renderAchievements() {
      const list = document.getElementById('achievement-list');
      if (!list) return;
      list.innerHTML = '';
      for (let key in achievements) {
        const ach = achievements[key];
        const li = document.createElement('li');
        li.className = 'ach-item';
        if (ach.unlocked) {
          li.innerHTML = `<span class="ach-unlocked"><span class="ach-title">${ach.title}</span><br><span style="font-size: 6px; font-family: 'Atkinson Hyperlegible';">${ach.desc}</span></span>`;
        } else {
          li.innerHTML = `<span class="ach-locked">🔒 ???</span>`;
        }
        list.appendChild(li);
      }
    }

    function showAchievementToast(title) {
      if (!effectsEnabled) return;
      const toast = document.getElementById('achievement-toast');
      document.getElementById('ach-title').innerText = title;
      toast.style.display = 'block';
      setTimeout(() => { toast.style.display = 'none'; }, 4000);
    }

    function toggleTheme() {
      isHorror = !isHorror;
      document.body.setAttribute('data-theme', isHorror ? 'horror' : 'light');
      
      const newLines = isHorror ? dialogLinesHorror : dialogLinesLight;
      startTypewriter(newLines[Math.floor(Math.random() * newLines.length)]);
      document.getElementById('tama-pet').innerText = isHorror ? "X_X" : "(•ᴥ•)";
      
      if (isHorror) {
        unlockAchievement('dark_mode');
      }
    }

    function switchView(viewId) {
      document.querySelectorAll('.os-window').forEach(el => el.classList.remove('active'));
      document.querySelectorAll('.dock-icon').forEach(el => el.classList.remove('active'));
      
      // Safety check to ensure the target window exists before adding the class
      const targetWindow = document.getElementById(viewId);
      if (targetWindow) {
          targetWindow.classList.add('active');
      }
      
      const ids = ['home', 'phd', 'guild', 'academy', 'games', 'chronicles'];
      const index = ids.indexOf(viewId === 'field-notes' ? 'home' : viewId);
      if(index !== -1) {
        const icons = document.querySelectorAll('.dock-icon');
        if (icons[index]) {
            icons[index].classList.add('active');
        }
      }

      // Achievement check
      unlockAchievement(viewId);

      if(viewId === 'home') {
        const lines = isHorror ? dialogLinesHorror : dialogLinesLight;
        startTypewriter(lines[Math.floor(Math.random() * lines.length)]);
      }
    }

    function startTypewriter(text) {
      const el = document.getElementById("typewriter-text");
      if(!el) return;
      currentDialogue = text;
      el.textContent = "> ";
      let i = 0;
      clearTimeout(typeTimeout);
      if (!effectsEnabled) { el.textContent = '> ' + text; return; }

      function type() {
        if (i < text.length) {
          el.textContent += text.charAt(i);
          i++;
          typeTimeout = setTimeout(type, 30);
        }
      }
      type();
    }
    
    window.onload = () => {
      startTypewriter(dialogLinesLight[0]);
      renderAchievements();
    };

    // XP & Particles
    let currentXP = 15;
    let currentLevel = 1;
    const xpBar = document.getElementById('xp-bar');
    const lvlDisplay = document.getElementById('player-lvl');
    
    document.addEventListener('click', function(e) {
      if (!effectsEnabled || e.target.closest('#effects-toggle')) return;
      if (e.target.closest('.btn') || e.target.closest('.dock-icon') || e.target.closest('.window-controls') || e.target.closest('#avatar-frame') || e.target.closest('.tama-widget')) return;

      const texts = isHorror ? ['ERROR', '0xDEAD', 'glitch', '???'] : ['✨ +10', '🐸 +10', '🎀 +10', '💎 +10', '🗡️ +10'];
      const text = texts[Math.floor(Math.random() * texts.length)];
      spawnParticle(e.clientX, e.clientY, text);
      addXP(10);
    });

    function boopAvatar(event) {
      const avatarFrame = document.getElementById('avatar-frame');
      if(avatarFrame && effectsEnabled) {
        avatarFrame.style.transform = "scale(0.9)";
        setTimeout(()=> avatarFrame.style.transform = "scale(1)", 150);
      }
      
      const text = isHorror ? "GLITCH_!" : "🐸 hi";
      spawnParticle(event.clientX, event.clientY, text);
      addXP(50);
    }

    // Tamagotchi Logic
    const tamaPet = document.getElementById('tama-pet');
    const pets = { normal: "(•ᴥ•)", happy: "(^∇^)", eating: "(˘▽˘)っ", sleep: "(-_-)zZ", horror: "X_X" };

    function feedTama() {
      if (!tamaPet) return;
      if(isHorror) return tamaPet.innerText = "NO";
      unlockAchievement('tama_friend');
      tamaPet.innerText = pets.eating;
      spawnParticle(window.innerWidth - 70, window.innerHeight - 150, "🍙");
      setTimeout(() => { if(!isHorror) tamaPet.innerText = pets.normal; }, 2000);
      addXP(5);
    }

    function playTama() {
      if (!tamaPet) return;
      if(isHorror) return tamaPet.innerText = "HELP";
      unlockAchievement('tama_friend');
      tamaPet.innerText = pets.happy;
      spawnParticle(window.innerWidth - 70, window.innerHeight - 150, "💖");
      setTimeout(() => { if(!isHorror) tamaPet.innerText = pets.normal; }, 2000);
      addXP(5);
    }

    function sleepTama() {
      if (!tamaPet) return;
      if(isHorror) return tamaPet.innerText = "WAKE";
      unlockAchievement('tama_friend');
      tamaPet.innerText = pets.sleep;
      spawnParticle(window.innerWidth - 70, window.innerHeight - 150, "💤");
      setTimeout(() => { if(!isHorror) tamaPet.innerText = pets.normal; }, 3000);
    }

    function spawnParticle(x, y, text) {
      if (!effectsEnabled) return;
      const particle = document.createElement('div');
      particle.className = 'click-particle';
      particle.style.position = 'fixed';
      particle.style.fontFamily = '"Press Start 2P", monospace';
      particle.style.fontSize = '10px';
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '1000';
      particle.style.animation = 'floatUp 1s forwards linear';
      
      const colorsLight = ['#ffffff', '#fdf6cc', '#e6f6fa', '#e0ccfa'];
      const colorsHorror = ['#a12020', '#5c2c22'];
      
      const colors = isHorror ? colorsHorror : colorsLight;
      particle.style.color = colors[Math.floor(Math.random() * colors.length)];
      if(!isHorror) { particle.style.textShadow = '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000'; }
      
      particle.innerText = text;
      particle.style.left = (x - 20) + 'px';
      particle.style.top = (y - 20) + 'px';
      document.body.appendChild(particle);

      if (!document.getElementById('particle-style')) {
          const style = document.createElement('style');
          style.id = 'particle-style';
          style.innerHTML = `@keyframes floatUp { 0% { transform: translateY(0); opacity: 1; } 100% { transform: translateY(-50px); opacity: 0; } }`;
          document.head.appendChild(style);
      }
      setTimeout(() => { particle.remove(); }, 1000);
    }

    function addXP(amount) {
      currentXP += amount;
      if (currentXP >= 100) {
        currentXP = currentXP - 100; 
        currentLevel++;
        if(lvlDisplay) lvlDisplay.innerText = currentLevel;
        
        const msg = document.getElementById('level-up-msg');
        if (msg && effectsEnabled) {
            msg.innerText = isHorror ? "A CHILL RUNS DOWN YOUR SPINE." : "ACHIEVEMENT UNLOCKED: LEVEL UP!";
            msg.style.display = 'block';
            setTimeout(() => { msg.style.display = 'none'; }, 2000);
        }
        
        if (currentLevel >= 5) {
          unlockAchievement('level_5');
        }
      }
      if (xpBar) xpBar.style.width = currentXP + '%';
    }

// Real links allow project cards and section links to be bookmarked.
function navigateToHash() {
  const requested = window.location.hash.slice(1) || 'home';
  const id = ['pubs-story','pubs-catharsis','pubs-ai','pubs-crit'].includes(requested) ? 'publications' : requested === 'projects' ? 'phd' : requested;
  const target = document.getElementById(id);
  if (!target) return;
  const view = target.classList.contains('os-window') ? target : target.closest('.os-window');
  if (!view) return;
  switchView(view.id);
  if (target !== view) requestAnimationFrame(() => target.scrollIntoView({block: 'start'}));
  else window.scrollTo(0, 0);
}
window.addEventListener('hashchange', navigateToHash);
applyEffectsPreference();
navigateToHash();
