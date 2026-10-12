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
  function tags(container, values) {
    container.replaceChildren(...values.map(value => {
      const tag = document.createElement('span');
      tag.textContent = value;
      return tag;
    }));
  }
  const groups = {storytelling: 'pubs-story', catharsis: 'pubs-catharsis', ethicalTech: 'pubs-ai', criticalStudies: 'pubs-crit'};
  for (const [group, id] of Object.entries(groups)) {
    const entries = (data.publications[group] || []).map(item => {
      const row = document.createElement('div');
      row.style.marginBottom = '8px';
      const title = document.createElement('strong');
      title.textContent = item.title;
      row.append(title);
      const label = [item.venue, item.year].filter(Boolean).join(' ');
      if (label || item.status) {
        row.append(document.createTextNode(' (' + label));
        if (item.status) {
          if (label) row.append(document.createTextNode(' • '));
          const status = document.createElement('em');
          status.textContent = item.status;
          row.append(status);
        }
        row.append(document.createTextNode(')'));
      }
      if (item.link) {
        const link = document.createElement('a');
        link.textContent = '[Read]';
        link.href = item.link;
        link.target = '_blank';
        link.rel = 'noopener';
        link.style.cssText = 'text-decoration: underline; font-weight: bold;';
        row.append(document.createTextNode(' '), link);
      }
      return row;
    });
    document.getElementById(id).replaceChildren(...entries);
  }
  const gameCards = data.games.map(item => {
    const card = document.getElementById('game-card-template').content.firstElementChild.cloneNode(true);
    card.querySelector('h3').textContent = item.title;
    card.querySelector('.card-cost').textContent = item.cost;
    tags(card.querySelector('.tags'), item.tags);
    card.querySelector('p').textContent = item.description;
    const image = card.querySelector('img');
    image.removeAttribute('onerror');
    image.alt = item.imageAlt || item.title;
    image.onerror = () => {
      if (item.imageFallback) {
        image.onerror = () => { image.style.display = 'none'; };
        image.src = item.imageFallback;
      } else image.style.display = 'none';
    };
    if (item.image) image.src = item.image;
    else image.style.display = 'none';
    const link = card.querySelector('a');
    if (item.link) {link.href = item.link; link.rel = 'noopener';}
    else link.remove();
    return card;
  });
  document.getElementById('game-list').replaceChildren(...gameCards);
  const courses = data.teaching.map(item => {
    const card = document.getElementById('course-card-template').content.firstElementChild.cloneNode(true);
    card.querySelector('h3').textContent = item.title;
    tags(card.querySelector('.tags'), item.tags);
    card.querySelector('p').textContent = item.description;
    const link = card.querySelector('a');
    link.textContent = item.buttonLabel || '';
    if (item.link) link.href = item.link;
    if (!item.buttonLabel) link.remove();
    return card;
  });
  document.getElementById('course-list').prepend(...courses);
})();

let isHorror = false;
    let typeTimeout = null;

    const dialogLinesLight = [
      "Вітаю! Welcome! I'm Kseniia (she/they).",
      "I design and study games as tools for emotional reflection.",
      "Sul sul! 🦙 Don't forget to save your progress."
    ];
    
    // BioShock / Silent Hill inspired dialogue
    const dialogLinesHorror = [
      "Would you kindly check your active quests?",
      "There was a file here. It's gone now.",
      "The fog is rolling in over the desktop...",
      "A familiar chill runs down your spine."
    ];

    // --- TROPHY / ACHIEVEMENT SYSTEM ---
    const achievements = {
      home: { title: "Secret Agent 🎀", desc: "Booted up the OS.", unlocked: true },
      phd: { title: "Sul sul! 🦙", desc: "Found the Knowledge Aspiration.", unlocked: false },
      games: { title: "The Spire 🗡️", desc: "Checked the inventory deck.", unlocked: false },
      guild: { title: "New Villager 🍃", desc: "Visited the town hall.", unlocked: false },
      academy: { title: "Determination ♥", desc: "Entered the Academy.", unlocked: false },
      chronicles: { title: "Kindred 🦇", desc: "Listened to the chronicles.", unlocked: false },
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
      
      const ids = ['home', 'phd', 'games', 'guild', 'academy', 'chronicles'];
      const index = ids.indexOf(viewId);
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
      el.innerHTML = "> ";
      let i = 0;
      clearTimeout(typeTimeout);

      function type() {
        if (i < text.length) {
          el.innerHTML += text.charAt(i);
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
      if (e.target.closest('.btn') || e.target.closest('.dock-icon') || e.target.closest('.window-controls') || e.target.closest('#avatar-frame') || e.target.closest('.tama-widget')) return;

      const texts = isHorror ? ['ERROR', '0xDEAD', 'glitch', '???'] : ['✨ +10', '🐸 +10', '🎀 +10', '💎 +10', '🗡️ +10'];
      const text = texts[Math.floor(Math.random() * texts.length)];
      spawnParticle(e.clientX, e.clientY, text);
      addXP(10);
    });

    function boopAvatar(event) {
      const avatarFrame = document.getElementById('avatar-frame');
      if(avatarFrame) {
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
      const particle = document.createElement('div');
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
        if (msg) {
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
