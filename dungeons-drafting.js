// Browser-local progress for the standalone writing game.
const DRAFT_SAVE_KEY = 'dungeons-drafting.adventure.v1';
let suppressDraftSave = false;
let draftSaveTimer;
function escapeDraftText(value) {
  const node = document.createElement('span');
  node.textContent = String(value);
  return node.innerHTML;
}
function cleanDraftHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html || '');
  const allowed = new Set(['DIV','P','BR','SPAN','B','STRONG','I','EM','U','H1','H2','H3','UL','OL','LI','FONT']);
  const clean = node => {
    for (const child of [...node.children]) {
      if (['SCRIPT','STYLE','IFRAME','OBJECT'].includes(child.tagName)) { child.remove(); continue; }
      clean(child);
      if (!allowed.has(child.tagName)) { child.replaceWith(...child.childNodes); continue; }
      const color = child.style.color;
      const background = child.style.backgroundColor;
      for (const attribute of [...child.attributes]) child.removeAttribute(attribute.name);
      if (color) child.style.color = color;
      if (background) child.style.backgroundColor = background;
    }
  };
  clean(template.content);
  return template.innerHTML;
}
function readAdventure() {
  try {
    const save = JSON.parse(localStorage.getItem(DRAFT_SAVE_KEY) || 'null');
    if (!save || save.version !== 1 || !['CREATION','PLANNING','DRAFTING','REVISING'].includes(save.phase)) return null;
    if (save.phase !== 'CREATION' && (!gameClasses[save.playerClass] || !Number.isFinite(save.maxXP) || save.maxXP < 100)) return null;
    if (!save.stats || !Object.keys(stats).every(key => save.stats[key] && Number.isFinite(save.stats[key].value) && typeof save.stats[key].draft === 'string')) return null;
    return save;
  } catch { return null; }
}
function saveAdventure() {
  if (suppressDraftSave || gameState === 'TITLE') return;
  if (currentChamber) stats[currentChamber].draft = document.getElementById('draft-text-content').innerHTML;
  const save = {
    version: 1, phase: gameState, maxXP: MAX_XP, currentXP, bossHP, maxBossHP,
    draftsCompleted, isGameOver, godModeEnabled, playerQuestName, playerClass, playerWeapon,
    questInput: document.getElementById('quest-name-input').value,
    manaInput: document.getElementById('mana-input').value,
    weaponInput: document.getElementById('weapon-select').value,
    customWeapon: document.getElementById('custom-weapon-input').value,
    verified: !document.getElementById('btn-enter-dungeon').disabled,
    currentChamber, chamberPhase,
    stats: Object.fromEntries(Object.entries(stats).map(([key, stat]) => [key, {value: stat.value, ready: stat.ready, draft: cleanDraftHTML(stat.draft)}])),
    revision: cleanDraftHTML(document.getElementById('revision-text-content').innerHTML)
  };
  try {
    localStorage.setItem(DRAFT_SAVE_KEY, JSON.stringify(save));
    document.getElementById('draft-save-status').textContent = 'Adventure saved in this browser · Download TXT/HTML for a backup.';
  } catch {
    document.getElementById('draft-save-status').textContent = 'Browser saving unavailable. Keep this tab open and download your manuscript.';
  }
}
function startNewAdventure() {
  if (readAdventure() && !confirm('Start a new adventure? This replaces the adventure saved in this browser. Download any manuscript you want to keep first.')) return;
  try { localStorage.removeItem(DRAFT_SAVE_KEY); } catch {}
  startGame();
  saveAdventure();
}
function restartAdventure() {
  if (!confirm('Start over and clear this saved adventure? Download your manuscript first if you want to keep it.')) return;
  suppressDraftSave = true;
  clearTimeout(draftSaveTimer);
  try { localStorage.removeItem(DRAFT_SAVE_KEY); } catch {}
  location.reload();
}
function resumeAdventure() {
  const save = readAdventure();
  if (!save) return;
  suppressDraftSave = true;
  try {
    godModeEnabled = Boolean(save.godModeEnabled);
    document.getElementById('god-mode-toggle').checked = godModeEnabled;
    startGame();
    document.getElementById('quest-name-input').value = save.questInput || '';
    document.getElementById('mana-input').value = save.manaInput || '1000';
    if (gameClasses[save.playerClass]) {
      document.getElementById('class-select').value = save.playerClass;
      selectClass(save.playerClass);
    }
    if (save.phase !== 'CREATION') {
      beginAdventure();
      for (const key of Object.keys(stats)) Object.assign(stats[key], save.stats[key], {draft: cleanDraftHTML(save.stats[key].draft)});
      MAX_XP = save.maxXP;
      currentXP = save.currentXP;
      draftsCompleted = Object.values(stats).filter(stat => stat.ready).length;
      playerWeapon = save.playerWeapon;
      document.getElementById('weapon-select').value = save.weaponInput;
      handleWeaponChange();
      document.getElementById('custom-weapon-input').value = save.customWeapon || '';
      initApp();
      if (save.verified) verifyWordCount();
      if (save.phase === 'DRAFTING' || save.phase === 'REVISING') enterDungeon();
      bossHP = save.bossHP;
      maxBossHP = save.maxBossHP;
      document.getElementById('boss-hp-text').textContent = bossHP;
      document.getElementById('boss-hp-fill').style.width = `${bossHP / maxBossHP * 100}%`;
      isGameOver = Boolean(save.isGameOver);
      if (save.phase === 'REVISING') {
        startLevel2();
        document.getElementById('revision-text-content').innerHTML = cleanDraftHTML(save.revision);
      } else if (save.currentChamber && stats[save.currentChamber]) {
        openDungeon(save.currentChamber);
        if (save.chamberPhase === 'spells') transitionToSpellPhase();
      }
    }
    document.getElementById('draft-save-status').textContent = 'Saved adventure restored · Progress stays in this browser.';
  } finally { suppressDraftSave = false; }
}
for (const event of ['input','change','click']) document.addEventListener(event, () => {
  clearTimeout(draftSaveTimer);
  draftSaveTimer = setTimeout(saveAdventure, 150);
});
window.addEventListener('pagehide', saveAdventure);
document.addEventListener('visibilitychange', () => { if (document.hidden) saveAdventure(); });
if (readAdventure()) document.getElementById('resume-adventure').classList.remove('hidden');

// Keep keyboard focus inside an open dialog and restore it on close.
let activeDraftModal = null;
let previousDraftFocus = null;
const modalObserver = new MutationObserver(() => {
  const visible = [...document.querySelectorAll('.modal-overlay:not(.hidden)')];
  const next = visible.at(-1) || null;
  if (next === activeDraftModal) return;
  if (next) {
    if (!activeDraftModal) previousDraftFocus = document.activeElement;
    next.setAttribute('role', 'dialog');
    next.setAttribute('aria-modal', 'true');
    next.setAttribute('aria-label', next.querySelector('h1,h2,h3,.boss-title')?.textContent || 'Writing activity');
    (next.querySelector('button,input,select,[contenteditable="true"]'))?.focus();
  } else previousDraftFocus?.focus();
  activeDraftModal = next;
});
document.querySelectorAll('.modal-overlay').forEach(el => modalObserver.observe(el,{attributes:true,attributeFilter:['class']}));
document.addEventListener('keydown', event => {
  if (!activeDraftModal) return;
  if (event.key === 'Escape' && activeDraftModal.id !== 'summary-modal') {
    if (activeDraftModal.id === 'chamber-modal') closeModals();
    else activeDraftModal.classList.add('hidden');
    saveAdventure();
    event.preventDefault();
  }
  if (event.key === 'Tab') {
    const elements = [...activeDraftModal.querySelectorAll('button,input,select,[contenteditable="true"]')].filter(el => !el.disabled && el.getClientRects().length);
    const first = elements[0], last = elements.at(-1);
    if (event.shiftKey && document.activeElement === first) { last?.focus(); event.preventDefault(); }
    else if (!event.shiftKey && document.activeElement === last) { first?.focus(); event.preventDefault(); }
  }
});
