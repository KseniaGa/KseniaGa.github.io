import React, { useState, useEffect, useCallback, useRef } from 'react';

const fontStyles = `
  @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:ital,wght@0,400;0,700;1,400&display=swap');
  
  .pixel-font { font-family: 'VT323', monospace; }
  .serif-font { font-family: 'Courier Prime', monospace; }
  
  .pixel-box {
    border: 3px solid #000;
    box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
    background-color: #c0c0c0;
  }
  
  .pixel-btn {
    border: 2px solid #fff;
    border-bottom-color: #000;
    border-right-color: #000;
    background-color: #c0c0c0;
    transition: all 0.05s;
    text-transform: uppercase;
    font-family: 'VT323', monospace;
  }
  
  .pixel-btn:active:not(:disabled) {
    border: 2px solid #000;
    border-bottom-color: #fff;
    border-right-color: #fff;
    background-color: #a0a0a0;
  }
  
  .pixel-btn:disabled {
    opacity: 0.6;
    background-image: repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px);
    cursor: not-allowed;
  }

  .os-window {
    border: 2px solid #fff;
    border-bottom-color: #000;
    border-right-color: #000;
    background: #c0c0c0;
  }
  .os-window-header {
    background: #000080;
    color: white;
    font-weight: bold;
    display: flex;
    justify-content: space-between;
    padding: 2px 4px;
  }

  /* Screen Distortion Effect */
  .distort-effect {
    filter: grayscale(100%) blur(3px) contrast(150%);
    animation: shake 0.5s infinite;
    pointer-events: none;
    transition: filter 0.2s ease-in;
  }

  @keyframes shake {
    0% { transform: translate(1px, 1px) rotate(0deg); }
    10% { transform: translate(-1px, -2px) rotate(-1deg); }
    20% { transform: translate(-3px, 0px) rotate(1deg); }
    30% { transform: translate(3px, 2px) rotate(0deg); }
    40% { transform: translate(1px, -1px) rotate(1deg); }
    50% { transform: translate(-1px, 2px) rotate(-1deg); }
    60% { transform: translate(-3px, 1px) rotate(0deg); }
    70% { transform: translate(3px, 1px) rotate(-1deg); }
    80% { transform: translate(-1px, -1px) rotate(1deg); }
    90% { transform: translate(1px, 2px) rotate(0deg); }
    100% { transform: translate(1px, -2px) rotate(-1deg); }
  }
  
  .scanlines {
    position: fixed;
    top: 0; left: 0; width: 100vw; height: 100vh;
    background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.05));
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 9999;
  }
`;

const INITIAL_STATS = { timeRemaining: 48.0, burnout: 0, capacity: 100, health: 100 };

const APPS = { NONE: 'NONE', MAIL: 'MAIL', WORD: 'WORD', PORTAL: 'PORTAL', CONFERENCE: 'CONFERENCE', DIY: 'DIY', DATA: 'DATA', DIARY: 'DIARY', LIT: 'LIT', CODE: 'CODE', GAMES: 'GAMES' };

const INITIAL_EMAILS = [
  { id: 1, from: 'PhD Administration', subject: 'Welcome to the Program', body: 'Remember: Publish or Perish. You have 48 months to secure 3 quality publications. Good luck.', read: false, time: '48.0', folder: 'inbox' }
];

const INITIAL_DIARY = [
  {
    title: "Entry 1: The Weight of It All",
    content: "My research is closely connected with forced migration. Even though I personally don’t identify with being a forced migrant, a lot of my close family and friends do. The war in my country is an ongoing wound... How would I even start attempting such a task? I have a powerful urge to share our findings, but it makes it all the more painful when the research is rejected or unseen. I am not prepared to do the emotional labor and self-regulation in addition to the actual work I applied for."
  },
  {
    title: "Entry 2: Bureaucracy and Hostility",
    content: "The Examinations and Admissions Office demanded an apostille for my Bachelor’s degree. This was a near-impossible request during an active war. Other universities had waived this requirement. I was met with dismissive responses, insisting that the process 'only takes a few weeks.' The university administration openly admitted that they knew their behavior was harsh, but they had no intention of changing it. It reinforced my belief that real institutional change will not come from within, it has to be fought for."
  }
];

export default function App() {
  const [gameState, setGameState] = useState('MENU'); 
  const [stats, setStats] = useState(INITIAL_STATS);
  const [apps, setApps] = useState(APPS.NONE);
  const [isDistorted, setIsDistorted] = useState(false);
  
  const [resources, setResources] = useState({ data: 0, lit: 0, code: 0, drafts: 0, rnrDrafts: 0, publications: 0 });
  
  const [emails, setEmails] = useState(INITIAL_EMAILS);
  const [nextEmailId, setNextEmailId] = useState(2);
  const [invitations, setInvitations] = useState([]);
  const [diaryEntries, setDiaryEntries] = useState(INITIAL_DIARY);
  const [isSick, setIsSick] = useState(false);
  const [toast, setToast] = useState(null);
  const [flags, setFlags] = useState({ sentVisa: false, sentEthics: false, sentSpam1: false, diyUnlocked: false });
  const [achievements, setAchievements] = useState([]);
  const [phoneNotification, setPhoneNotification] = useState(null);

  const timePassedRatio = 1 - (stats.timeRemaining / 48); // 0.0 to 1.0 based on elapsed time

  const updateStats = useCallback((deltas) => {
    setStats((prev) => ({
      timeRemaining: Math.max(0, prev.timeRemaining + (deltas.timeRemaining || 0)),
      burnout: Math.min(100, Math.max(0, prev.burnout + (deltas.burnout || 0))),
      capacity: Math.min(100, Math.max(0, prev.capacity + (deltas.capacity || 0))),
      health: Math.min(100, Math.max(0, prev.health + (deltas.health || 0))),
    }));
  }, []);

  const receiveEmail = useCallback((from, subject, body, actionable = null) => {
    setEmails(prev => [{
      id: nextEmailId, from, subject, body, read: false, time: stats.timeRemaining.toFixed(1), folder: 'inbox', actionable
    }, ...prev]);
    setNextEmailId(prev => prev + 1);
  }, [nextEmailId, stats.timeRemaining]);

  const unlockAchievement = useCallback((title, text) => {
    if (!achievements.some(a => a.title === title)) {
      setAchievements(prev => [...prev, { title, text }]);
      setToast({ title, text });
      setTimeout(() => setToast(null), 4000);
    }
  }, [achievements]);

  const unlockDiary = useCallback((title, content) => {
    setDiaryEntries(prev => [...prev, { title, content }]);
    unlockAchievement("Journal Updated", `New entry added: ${title}`);
  }, [unlockAchievement]);

  const triggerDistortion = useCallback((duration = 3000) => {
    setIsDistorted(true);
    setTimeout(() => setIsDistorted(false), duration);
  }, []);

  const handlePhoneAction = useCallback((action) => {
    if (action === 'VIEW') {
      triggerDistortion(3000);
      updateStats({ capacity: -20, health: -10, burnout: +10 });
    } else {
      unlockAchievement("Survivor's Guilt", "You ignored the news of the war to finish your academic work.");
      updateStats({ burnout: +15 }); 
    }
    setPhoneNotification(null);
  }, [triggerDistortion, updateStats, unlockAchievement]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || isSick) return;
    const interval = setInterval(() => {
      setStats(prev => ({ ...prev, timeRemaining: Math.max(0, prev.timeRemaining - 0.1) }));
    }, 625); // 48 months = ~5 minutes real time
    return () => clearInterval(interval);
  }, [gameState, isSick]);

  useEffect(() => {
    if (gameState === 'PLAYING' && stats.timeRemaining <= 0) setGameState('LOST');
    if (gameState === 'PLAYING' && resources.publications >= 3) setGameState('WON');
  }, [stats.timeRemaining, resources.publications, gameState]);

  useEffect(() => {
    if (gameState !== 'PLAYING' || isSick) return;
    if (stats.burnout >= 100 || stats.health <= 0 || stats.capacity <= 0) {
      setIsSick(true);
      setApps(APPS.NONE);
    }
  }, [stats, gameState, isSick]);

  useEffect(() => {
    if (gameState !== 'PLAYING') return;
    
    if (stats.timeRemaining <= 42 && !flags.sentVisa) {
      receiveEmail('Admissions Office', 'URGENT: Missing Apostille', 'Your documents are invalid. We require an apostilled version of your Bachelor\'s degree. We know there is an active war restricting postal services, but our bureaucratic requirements remain absolute. Submit by Friday or face deportation.');
      setFlags(f => ({ ...f, sentVisa: true }));
    }
    if (stats.timeRemaining <= 30 && !flags.sentEthics) {
      receiveEmail('Ethics Board', 'Application #4492: Major Revisions', 'Your methodology "autoethnography" is not recognized. Please re-write your 50-page application to fit "Clinical Trial" formats. Pause all research immediately.');
      setFlags(f => ({ ...f, sentEthics: true }));
    }
    if (stats.timeRemaining <= 15 && !flags.sentSpam1) {
      receiveEmail('Global Conf 2026', 'Speaker Invitation', 'Dear Dr. Harshina, we want to invite you to submit your esteemed paper to our predatory journal for only $2000 APC!');
      setFlags(f => ({ ...f, sentSpam1: true }));
    }
  }, [stats.timeRemaining, gameState, flags, receiveEmail]);

  // Global Phone Notifications for War Alerts
  useEffect(() => {
    if (gameState !== 'PLAYING' || isSick || phoneNotification) return;
    const interval = setInterval(() => {
      // 15% chance to spawn an alert every 5 seconds
      if (Math.random() < 0.15) {
        setPhoneNotification({
          title: "Telegram - UKR Alert",
          msg: "Air raid siren in the capital. Explosions reported."
        });
      }
    }, 5000); 
    return () => clearInterval(interval);
  }, [gameState, isSick, phoneNotification]);

  const recover = () => {
    updateStats({ timeRemaining: -3, health: 50, burnout: -50, capacity: 40, emotional: 40, mental: 40 });
    setIsSick(false);
  };

  const startGame = () => {
    setGameState('PLAYING');
    setStats(INITIAL_STATS);
    setResources({ data: 0, lit: 0, code: 0, drafts: 0, rnrDrafts: 0, publications: 0 });
    setEmails(INITIAL_EMAILS);
    setDiaryEntries(INITIAL_DIARY);
    setInvitations([]);
    setApps(APPS.NONE);
    setIsSick(false);
    setFlags({ sentVisa: false, sentEthics: false, sentSpam1: false, diyUnlocked: false });
  };

  return (
    <div 
      className={`min-h-screen bg-[#008080] pixel-font text-gray-900 overflow-hidden relative transition-all duration-300 ${isDistorted ? 'distort-effect' : ''}`}
      style={!isDistorted ? { filter: `grayscale(${timePassedRatio * 100}%)` } : {}}
    >
      <style dangerouslySetInnerHTML={{ __html: fontStyles }} />
      <div className="scanlines pointer-events-none"></div>

      {gameState === 'MENU' && <StartScreen startGame={startGame} />}
      {gameState === 'LOST' && <EndScreen won={false} restart={startGame} stats={stats} />}
      {gameState === 'WON' && <EndScreen won={true} restart={startGame} stats={stats} />}

      {gameState === 'PLAYING' && (
        <div className="flex flex-col h-screen">
          <header className="bg-[#c0c0c0] border-b-2 border-black p-1 flex justify-between items-center z-50">
            <div className="flex items-center gap-4">
              <span className="font-bold text-xl bg-[#000080] text-white px-2 cursor-default">OS_LUDIC_26</span>
              <div className="flex gap-2 text-sm">
                <span className="bg-white border border-gray-400 px-1">Pubs: {resources.publications}/3</span>
                <span className="bg-white border border-gray-400 px-1">Drafts: {resources.drafts}</span>
                <span className="bg-white border border-gray-400 px-1">Data: {resources.data}</span>
                <span className="bg-white border border-gray-400 px-1">Lit: {resources.lit}</span>
                <span className="bg-white border border-gray-400 px-1">Code: {resources.code}</span>
              </div>
            </div>
            
            <div className="flex gap-2 items-center px-2">
              <StatBar label="TIME (Mo)" value={(stats.timeRemaining / 48) * 100} text={stats.timeRemaining.toFixed(1)} color="bg-blue-400" scale={1 + (timePassedRatio * 0.6)} />
              <StatBar label="HEALTH" value={stats.health} color="bg-red-500" />
              <StatBar label="CAPACITY" value={stats.capacity} color="bg-fuchsia-500" />
              <StatBar label="BURNOUT" value={stats.burnout} color="bg-orange-500" inverse />
            </div>
          </header>

          <main className="flex-1 relative p-4">
            <div className="flex flex-col flex-wrap h-full gap-6 w-24">
              <DesktopIcon icon="📧" label={`Inbox (${emails.filter(e=>!e.read).length})`} onClick={() => setApps(APPS.MAIL)} />
              <DesktopIcon icon="📚" label="Lit Review" onClick={() => setApps(APPS.LIT)} />
              <DesktopIcon icon="📊" label="Gather Data" onClick={() => setApps(APPS.DATA)} />
              <DesktopIcon icon="💻" label="VS Code" onClick={() => setApps(APPS.CODE)} />
              <DesktopIcon icon="📝" label="Write Draft" onClick={() => setApps(APPS.WORD)} />
              <DesktopIcon icon="🌐" label="Submit Ptl" onClick={() => setApps(APPS.PORTAL)} />
              <DesktopIcon icon="🎤" label="Conference" onClick={() => setApps(APPS.CONFERENCE)} />
              <DesktopIcon icon="📓" label="My Diary" onClick={() => setApps(APPS.DIARY)} />
              <DesktopIcon icon="🎮" label="Shame Pile" onClick={() => setApps(APPS.GAMES)} />
              {flags.diyUnlocked && (
                <DesktopIcon icon="🛠️" label="DIY Space" onClick={() => setApps(APPS.DIY)} />
              )}
            </div>

            {/* Application Windows */}
            {apps === APPS.MAIL && (
              <MailClient emails={emails} setEmails={setEmails} close={() => setApps(APPS.NONE)} triggerDistortion={triggerDistortion} 
                acceptRnR={(id) => { setResources(r => ({...r, rnrDrafts: r.rnrDrafts + 1})); setEmails(prev => prev.map(e => e.id === id ? { ...e, actionable: null } : e)); }} />
            )}
            {apps === APPS.WORD && (
              <WordProcessor resources={resources} setResources={setResources} updateStats={updateStats} close={() => setApps(APPS.NONE)} 
                unlockAchievement={unlockAchievement} triggerDistortion={triggerDistortion} isBlocked={!!phoneNotification} />
            )}
            {apps === APPS.PORTAL && (
              <SubmissionPortal resources={resources} setResources={setResources} updateStats={updateStats} receiveEmail={receiveEmail} close={() => setApps(APPS.NONE)} />
            )}
            {apps === APPS.CONFERENCE && (
              <ConferenceApp invitations={invitations} setInvitations={setInvitations} setResources={setResources} updateStats={updateStats} 
                receiveEmail={receiveEmail} unlockDiary={unlockDiary} close={() => setApps(APPS.NONE)} stats={stats} 
                unlockDIY={() => setFlags(f => ({...f, diyUnlocked: true}))} />
            )}
            {apps === APPS.DATA && (
              <DataCollection updateStats={updateStats} setResources={setResources} close={() => setApps(APPS.NONE)} triggerDistortion={triggerDistortion} />
            )}
            {apps === APPS.LIT && (
              <LitReview updateStats={updateStats} setResources={setResources} close={() => setApps(APPS.NONE)} />
            )}
            {apps === APPS.CODE && (
              <VSCode updateStats={updateStats} setResources={setResources} close={() => setApps(APPS.NONE)} isBlocked={!!phoneNotification} />
            )}
            {apps === APPS.GAMES && (
              <PileOfShame updateStats={updateStats} close={() => setApps(APPS.NONE)} />
            )}
            {apps === APPS.DIARY && (
              <DiaryApp diaryEntries={diaryEntries} close={() => setApps(APPS.NONE)} />
            )}
            {apps === APPS.DIY && (
              <DIYProject updateStats={updateStats} close={() => setApps(APPS.NONE)} unlockAchievement={unlockAchievement} />
            )}

            {/* Forced Recovery Overlay */}
            {isSick && (
              <div className="absolute inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
                <div className="pixel-box p-8 max-w-lg w-full text-center bg-red-600 text-white shadow-[12px_12px_0px_0px_rgba(255,255,255,0.2)]">
                  <h2 className="text-4xl font-bold mb-6 text-yellow-300">SYSTEM FAILURE</h2>
                  <p className="text-xl mb-8 leading-relaxed">
                    Your body forces you to stop. You pushed too hard, or the institutional barriers pushed too hard. Time continues passing while you recover.
                  </p>
                  <button onClick={recover} className="pixel-btn px-6 py-4 text-xl w-full font-bold bg-white text-black">
                    REST & RECOVER (-3 Months)
                  </button>
                </div>
              </div>
            )}

            {/* Global Phone Notification Overlay */}
            {phoneNotification && (
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pixel-box bg-white p-1 border-4 border-black w-80 shadow-[10px_10px_0px_0px_rgba(0,0,0,0.8)] z-[200]">
                <div className="bg-[#000080] text-white px-2 py-1 font-bold flex justify-between">
                  <span>📱 {phoneNotification.title}</span>
                </div>
                <div className="p-4 bg-gray-100">
                  <p className="text-lg mb-4 font-bold font-serif">{phoneNotification.msg}</p>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => handlePhoneAction('VIEW')} className="pixel-btn bg-red-200 py-2 font-bold">
                      Look (-20 Cap, -10 HP)
                    </button>
                    <button onClick={() => handlePhoneAction('IGNORE')} className="pixel-btn bg-gray-300 py-2 font-bold">
                      Ignore (+15 Burnout, +Guilt)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Achievement Toast */}
      {toast && (
        <div className="fixed bottom-8 right-8 pixel-box bg-yellow-200 p-4 z-[200] animate-bounce w-80 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="font-bold text-xl mb-2 border-b-2 border-black pb-1 uppercase tracking-widest text-black">🏆 Achievement</div>
          <div className="font-bold text-lg text-black">{toast.title}</div>
          <div className="text-sm mt-1 leading-tight text-gray-800">{toast.text}</div>
        </div>
      )}
    </div>
  );
}

function StatBar({ label, value, text, color, inverse, scale = 1 }) {
  const isDanger = inverse ? value > 80 : value < 20;
  return (
    <div className={`flex flex-col w-20 sm:w-28 ${isDanger ? 'animate-pulse' : ''}`} style={{ transform: `scale(${scale})`, transformOrigin: 'top right', transition: 'transform 1s linear' }}>
      <div className="flex justify-between text-[10px] font-bold mb-1 px-1 bg-black text-white">
        <span>{label}</span>
      </div>
      <div className="h-4 border-2 border-gray-400 border-b-white border-r-white bg-[#000] relative p-[1px]">
        <div className={`h-full ${color} transition-all duration-300`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
        {text && <span className="absolute inset-0 text-center text-[11px] font-bold leading-none py-[2px] text-white mix-blend-difference">{text}</span>}
      </div>
    </div>
  );
}

function DesktopIcon({ icon, label, onClick }) {
  return (
    <button onDoubleClick={onClick} onClick={onClick} className="flex flex-col items-center gap-1 p-2 w-24 text-center cursor-pointer relative z-20 hover:bg-white/20 active:bg-blue-800 active:text-white">
      <span className="text-4xl drop-shadow-md">{icon}</span>
      <span className="text-xs font-bold px-1 bg-[#c0c0c0] border border-transparent active:border-dotted active:border-black truncate w-full shadow-sm">
        {label}
      </span>
    </button>
  );
}

function Window({ title, children, close, className = '' }) {
  return (
    <div className={`absolute top-4 left-32 right-4 bottom-4 os-window flex flex-col z-10 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)] ${className}`}>
      <div className="os-window-header">
        <span className="tracking-widest">{title}</span>
        <button onClick={close} className="bg-[#c0c0c0] border-2 border-white border-b-black border-r-black text-black px-2 py-0 text-sm active:border-black active:border-b-white active:border-r-white">X</button>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col bg-[#c0c0c0]">
        {children}
      </div>
    </div>
  );
}

function StartScreen({ startGame }) {
  return (
    <div className="flex items-center justify-center h-screen p-4 bg-[#008080] relative">
      <div className="pixel-box p-2 max-w-2xl w-full bg-[#c0c0c0] relative z-20">
        <div className="os-window-header mb-4 text-xl py-2">
          <span>SETUP.EXE - INSIDER OUT</span>
        </div>
        
        <div className="p-4 bg-white border-2 border-black inset-shadow-sm mb-4">
          <div className="flex gap-4 items-start mb-6">
            <span className="text-6xl animate-pulse">💾</span>
            <div>
              <h1 className="text-5xl font-black text-black tracking-tighter mb-1">INSIDER OUT</h1>
              <h2 className="text-lg text-gray-600 font-bold uppercase tracking-widest border-b-2 border-gray-300 pb-2">
                A Ludic Autoethnography Prototype
              </h2>
            </div>
          </div>
          
          <div className="space-y-4 font-bold text-lg text-gray-800 font-serif">
            <p>You are an unnamed, marginalized insider researcher. Your funding is tied to a strict 48-month timer.</p>
            <p className="text-black bg-yellow-200 inline-block px-2 border border-black">MISSION: Attain 3 Publications.</p>
            <ul className="list-disc pl-6 space-y-1 text-md text-gray-700">
              <li>Gather data & smash keys to write drafts.</li>
              <li>Navigate TEDIOUS submission portals.</li>
              <li>Endure hurtful emails and physical/emotional exhaustion.</li>
            </ul>
            <p className="text-red-600 font-bold border border-red-600 p-2 text-center bg-red-50">
              WARNING: If Health drops or Burnout maxes out, you will collapse.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end border-t-2 border-gray-400 pt-2">
          <button onClick={startGame} className="pixel-btn text-2xl px-12 py-2">INSTALL & BOOT</button>
        </div>
      </div>
    </div>
  );
}

function EndScreen({ won, restart, stats }) {
  return (
    <div className="flex items-center justify-center h-screen p-4 bg-black/90 z-50 absolute inset-0">
      <div className={`pixel-box p-8 max-w-xl text-center border-8 relative z-50 ${won ? 'border-green-500 bg-[#c0c0c0]' : 'border-red-500 bg-[#c0c0c0]'}`}>
        <h1 className={`text-6xl font-black mb-4 bg-black px-4 py-2 inline-block ${won ? 'text-green-400' : 'text-red-400'}`}>
          {won ? 'SURVIVED' : 'TIME OUT'}
        </h1>
        <div className="bg-white p-4 border-2 border-black mb-6 text-xl font-bold font-serif text-left">
          {won 
            ? "You achieved the required metric of 3 publications. You survived this stage, but the structural issues remain unchanged."
            : "Your funding period ended before meeting the publication metrics."}
          <div className="mt-4 pt-4 border-t-2 border-dashed border-gray-400 text-sm">
            Final Stats:<br/>
            Burnout: {stats.burnout}% | Health: {stats.health}%
          </div>
        </div>
        <button onClick={restart} className="pixel-btn text-2xl px-8 py-3 bg-white w-full">
          PLAY AGAIN
        </button>
      </div>
    </div>
  );
}

function MailClient({ emails, setEmails, close, acceptRnR, triggerDistortion }) {
  const [selectedId, setSelectedId] = useState(null);
  const selectedMail = emails.find(e => e.id === selectedId);

  const openMail = (mail) => {
    setEmails(prev => prev.map(e => e.id === mail.id ? { ...e, read: true } : e));
    setSelectedId(mail.id);
    
    // Trigger distortion for specific bad emails
    if (mail.subject.includes('Apostille') || mail.subject.includes('Desk Reject') || mail.subject.includes('Re: Hybrid') || mail.subject.includes('Major Revisions') || mail.subject.includes('Highest Quality')) {
      triggerDistortion(3000);
    }
  };

  return (
    <Window title="OUTLOOK_EXPRESS.EXE" close={close}>
      <div className="flex h-full bg-white border-2 border-gray-500 border-t-black border-l-black m-1">
        <div className="w-1/3 border-r-2 border-gray-400 bg-gray-100 flex flex-col">
          <div className="bg-gray-300 font-bold px-2 py-1 border-b-2 border-gray-400 text-sm">Inbox ({emails.filter(e=>!e.read).length})</div>
          <div className="overflow-y-auto flex-1">
            {emails.map(email => (
              <button key={email.id} onClick={() => openMail(email)}
                className={`w-full text-left p-2 border-b border-gray-300 flex flex-col
                  ${!email.read ? 'font-bold bg-white' : 'text-gray-600 bg-gray-50'}
                  ${selectedId === email.id ? 'bg-[#000080] text-white' : ''}
                `}
              >
                <div className="flex justify-between text-xs mb-1">
                  <span className="truncate pr-2">{email.from}</span>
                  <span>{email.time}</span>
                </div>
                <div className="truncate text-sm">{email.subject}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div className="w-2/3 p-4 overflow-y-auto bg-white font-serif relative">
          {selectedMail ? (
            <div className="h-full flex flex-col">
              <div className="border-b-2 border-gray-300 pb-2 mb-4 bg-gray-100 p-2">
                <div className="text-sm"><b>From:</b> {selectedMail.from}</div>
                <div className="text-sm"><b>Subject:</b> {selectedMail.subject}</div>
              </div>
              <div className="text-lg whitespace-pre-wrap leading-relaxed flex-1">
                {selectedMail.body}
              </div>
              
              {selectedMail.actionable && (
                <div className="mt-4 pt-4 border-t-2 border-gray-300">
                  {selectedMail.actionable.type === 'RNR' && (
                    <button onClick={() => acceptRnR(selectedMail.id)} className="pixel-btn px-4 py-2 bg-yellow-200">
                      START REVISION DRAFT
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 font-bold text-xl font-sans">
              No Message Selected
            </div>
          )}
        </div>
      </div>
    </Window>
  );
}

function WordProcessor({ resources, setResources, updateStats, close, unlockAchievement, triggerDistortion, isBlocked }) {
  const [mode, setMode] = useState('SELECT'); 
  const [progress, setProgress] = useState(0);
  const [text, setText] = useState('');

  const fullText = "Researching the intersection of identity, conflict, and play in a time of active war requires navigating deep personal trauma... The disconnect between lived experience and institutional expectations forms a chasm that drains capacity constantly. The empathy machine is a trap. Stories by migrants, not just about them. Methodological shift required.";

  const startWriting = (type) => {
    if (type === 'DATA') setResources(r => ({ ...r, data: r.data - 1, lit: r.lit - 1 }));
    if (type === 'HUMANITIES') setResources(r => ({ ...r, lit: r.lit - 2 }));
    if (type === 'TECH') setResources(r => ({ ...r, code: r.code - 1, lit: r.lit - 1 }));
    if (type === 'RNR') setResources(r => ({ ...r, rnrDrafts: r.rnrDrafts - 1 }));
    // 'AUTO' requires no external resources, but will drain your passive stats heavily while you type it
    setMode('WRITE');
    setProgress(0);
    setText('');
  };

  const handleKeyDown = useCallback((e) => {
    if (mode !== 'WRITE' || isBlocked) return; // Block typing if global notification is open
    if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) return;

    const next = progress + 2;
    setProgress(next);
    setText(fullText.substring(0, next));
    
    // Constant slight drain from emotional labor of writing
    if (Math.random() < 0.05) updateStats({ capacity: -1 });

  }, [mode, isBlocked, updateStats, fullText, progress]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const finishDraft = () => {
    setResources(r => ({ ...r, drafts: r.drafts + 1 }));
    close();
  };

  if (mode === 'SELECT') {
    return (
      <Window title="MS_WORD_97.EXE" close={close}>
        <div className="p-4 flex flex-col gap-4 h-full bg-white m-1 border-2 border-gray-500 border-t-black border-l-black overflow-y-auto">
          <h2 className="text-2xl font-bold border-b-2 border-gray-300 pb-2">Document Manager</h2>
          
          <button disabled={resources.data < 1 || resources.lit < 1} onClick={() => startWriting('DATA')}
            className="pixel-btn bg-gray-100 p-4 text-left flex justify-between items-center text-xl">
            <span>Empirical Paper</span>
            <span className="bg-[#000080] text-white px-2 py-1 text-sm">Cost: 1 Data, 1 Lit</span>
          </button>

          <button disabled={resources.lit < 2} onClick={() => startWriting('HUMANITIES')}
            className="pixel-btn bg-gray-100 p-4 text-left flex justify-between items-center text-xl">
            <span>Humanities Abstract</span>
            <span className="bg-[#000080] text-white px-2 py-1 text-sm">Cost: 2 Lit</span>
          </button>

          <button disabled={resources.code < 1 || resources.lit < 1} onClick={() => startWriting('TECH')}
            className="pixel-btn bg-gray-100 p-4 text-left flex justify-between items-center text-xl">
            <span>Tech Prototype Paper</span>
            <span className="bg-[#000080] text-white px-2 py-1 text-sm">Cost: 1 Code, 1 Lit</span>
          </button>

          <button onClick={() => startWriting('AUTO')}
            className="pixel-btn bg-purple-100 p-4 text-left flex justify-between items-center text-xl">
            <span>Autoethnography Paper</span>
            <span className="bg-[#000080] text-white px-2 py-1 text-sm">Cost: 0 resources, High Emotional Drain</span>
          </button>

          <button disabled={resources.rnrDrafts <= 0} onClick={() => startWriting('RNR')}
            className="pixel-btn bg-yellow-100 p-4 text-left flex justify-between items-center text-xl">
            <span>Address R&R Comments</span>
            <span className="bg-orange-800 text-white px-2 py-1 text-sm">{resources.rnrDrafts} Available</span>
          </button>
        </div>
      </Window>
    );
  }

  return (
    <Window title="MS_WORD_97.EXE - Draft.doc" close={close}>
      <div className="flex-1 bg-white m-1 border-2 border-gray-500 border-t-black border-l-black p-4 relative flex flex-col">
        
        {/* Editor Toolbar */}
        <div className="flex gap-2 bg-gray-200 p-1 border-b-2 border-gray-400 mb-4 text-sm font-bold">
          <span className="px-2 border border-gray-400 bg-white shadow-sm">File</span>
          <span className="px-2 border border-gray-400 bg-white shadow-sm">Edit</span>
          <span className="px-2 border border-gray-400 bg-white shadow-sm font-serif">B I U</span>
        </div>

        <div className="text-xl font-serif leading-relaxed text-black max-w-2xl flex-1 whitespace-pre-wrap">
          {text}
          <span className="inline-block w-3 h-5 bg-black animate-pulse align-middle ml-1"></span>
        </div>

        {progress >= fullText.length ? (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
            <h3 className="text-5xl font-black text-green-400 mb-6 border-4 border-green-400 p-4 bg-black">DRAFT COMPLETE</h3>
            <button onClick={finishDraft} className="pixel-btn bg-white px-8 py-4 text-2xl">SAVE & CLOSE</button>
          </div>
        ) : (
          <div className="absolute bottom-2 right-2 text-gray-500 bg-yellow-100 p-1 border border-yellow-400 text-sm font-bold">
            Mash keyboard to type...
          </div>
        )}
      </div>
    </Window>
  );
}

function SubmissionPortal({ resources, setResources, updateStats, receiveEmail, close }) {
  const [phase, setPhase] = useState('SELECT_VENUE');
  const [venue, setVenue] = useState(null);
  const [tab, setTab] = useState('AUTHOR');
  const [checkboxes, setCheckboxes] = useState({ c1: false, c2: false, c3: false, c4: false });
  const [submitting, setSubmitting] = useState(false);

  const venues = [
    { id: 'INFORMATICS', name: 'IEEE/ACM Informatics Conf (A*)', desc: 'High prestige. Low acceptance rate. Strict formatting.', time: 4 },
    { id: 'GAME_STUDIES', name: 'Game Studies Symposium', desc: 'Specialized interdisciplinary venue. Mixed bag of reviews.', time: 3 },
    { id: 'HCI_JOURNAL', name: 'Top HCI Journal', desc: 'High impact factor. Exhausting and long review cycles.', time: 5 },
    { id: 'HUMANITIES', name: 'Geo Games Symposium', desc: 'Interdisciplinary. Welcoming, but unranked by department.', time: 2 }
  ];

  const handleSelectVenue = (v) => {
    setVenue(v);
    setPhase('TABS');
  };

  const handleCheckbox = (id) => {
    setCheckboxes(prev => ({ ...prev, [id]: !prev[id] }));
    updateStats({ capacity: -1 }); // Small capacity drain for tedious clicking
  };

  const submitPaper = () => {
    if (resources.drafts < 1) return;
    
    setSubmitting(true);
    updateStats({ timeRemaining: -1, burnout: +5, mental: -5 }); // Takes time and causes some burnout to submit
    
    setTimeout(() => {
      setResources(r => ({ ...r, drafts: r.drafts - 1 }));
      setSubmitting(false);
      setPhase('DONE');

      // Schedule email based on venue
      if (venue.id === 'INFORMATICS') {
        const isDeskReject = Math.random() < 0.7; // 70% chance of desk reject
        if (isDeskReject) {
           receiveEmail('PCS Chair', 'Desk Reject: Your Submission', 'Reviewer 2 noted: "It does not make sense to ask people in Ukraine via an online survey. They probably don’t have internet anyway and are just trying to survive." Your paper was rejected without further review.');
        } else {
           receiveEmail('PCS Chair', 'Notification: Revise & Resubmit', 'Your paper has received mixed reviews. Reviewer 2 strongly objects to your methodology. We offer a Revise & Resubmit if you address these fundamental concerns.', { type: 'RNR' });
        }
      } else if (venue.id === 'GAME_STUDIES') {
        const isAccept = Math.random() < 0.4;
        if (isAccept) {
           receiveEmail('Game Studies Chairs', 'Accepted: Full Paper', 'Congratulations! Your paper has been accepted. We look forward to seeing you at the conference.');
        } else {
           receiveEmail('Game Studies Chairs', 'Notification: Revise & Resubmit', 'Reviewers found the autoethnographic components "too personal" but see potential. Major revisions required.', { type: 'RNR' });
        }
      } else if (venue.id === 'HCI_JOURNAL') {
        receiveEmail('Journal Editor', 'Decision: Major Revisions', 'The reviewers requested 15 additional pages of empirical validation and a completely restructured literature review. We invite a resubmission.', { type: 'RNR' });
      } else {
        // Humanities always accepts, but dept complains later
        receiveEmail('Symposium Organizers', 'Accepted: 3rd Geo Games', 'We are delighted to accept your abstract for presentation in our upcoming symposium!');
        // Delayed complaint from dept
        setTimeout(() => {
           receiveEmail('Dept Administration', 'Re: Publication Notification', 'We saw you published at "Geo Games Symposium". As this venue is unranked in our A-list informatics index, it will be categorized as Lowest Quality and may not count fully toward your 3 required publications.');
        }, 15000); // Send complaining email later
      }

    }, 2000);
  };

  const allChecked = checkboxes.c1 && checkboxes.c2 && checkboxes.c3 && checkboxes.c4;

  return (
    <Window title="EASYCHAIR_CLONE.EXE" close={close}>
       <div className="h-full bg-white m-1 border-2 border-gray-500 border-t-black border-l-black p-4 flex flex-col font-sans text-sm">
          
          {phase === 'SELECT_VENUE' && (
             <div className="flex-1 flex flex-col items-center justify-center">
                <h2 className="text-2xl font-bold mb-6 border-b-2 border-black">Select Submission Venue</h2>
                <div className="grid grid-cols-2 gap-4 w-full max-w-3xl">
                   {venues.map(v => (
                     <div key={v.id} className="border-2 border-black p-4 flex flex-col bg-gray-100 hover:bg-white cursor-pointer" onClick={() => handleSelectVenue(v)}>
                        <h3 className="font-bold text-lg text-[#000080]">{v.name}</h3>
                        <p className="flex-1 mt-2 text-gray-700 italic">{v.desc}</p>
                        <div className="mt-4 bg-gray-300 p-2 text-center font-bold">Wait: ~{v.time} Mo</div>
                     </div>
                   ))}
                </div>
                {resources.drafts < 1 && (
                  <div className="mt-8 text-red-600 font-bold bg-red-100 p-2 border border-red-600">
                    No completed drafts available. Write a draft in MS Word first.
                  </div>
                )}
             </div>
          )}

          {phase === 'TABS' && (
             <div className="flex-1 flex flex-col">
                <div className="text-lg font-bold mb-2">Submitting to: {venue.name}</div>
                
                {/* Tabs */}
                <div className="flex gap-1 border-b border-gray-400 mb-4">
                   {['AUTHOR', 'DECLARATIONS', 'UPLOAD', 'REVIEW'].map(t => (
                     <button key={t} onClick={() => setTab(t)} className={`px-4 py-1 border border-gray-400 border-b-0 ${tab === t ? 'bg-white font-bold relative top-[1px]' : 'bg-gray-200'}`}>
                       {t}
                     </button>
                   ))}
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto border border-gray-300 p-4 bg-gray-50">
                   {tab === 'AUTHOR' && (
                      <div className="space-y-4">
                         <div className="font-bold">Author Information</div>
                         <p>Please manually type in all author information, even though it is in the PDF.</p>
                         <div className="grid grid-cols-2 gap-4">
                           <input type="text" disabled value="Kseniia Harshina" className="border border-gray-400 p-1 bg-gray-200" />
                           <input type="text" disabled value="Univ. Klagenfurt" className="border border-gray-400 p-1 bg-gray-200" />
                         </div>
                      </div>
                   )}
                   {tab === 'DECLARATIONS' && (
                      <div className="space-y-4">
                         <div className="font-bold">Mandatory Declarations</div>
                         <label className="flex gap-2 items-start cursor-pointer hover:bg-gray-100 p-1">
                           <input type="checkbox" checked={checkboxes.c1} onChange={() => handleCheckbox('c1')} className="mt-1" />
                           <span>I confirm this is original work.</span>
                         </label>
                         <label className="flex gap-2 items-start cursor-pointer hover:bg-gray-100 p-1">
                           <input type="checkbox" checked={checkboxes.c2} onChange={() => handleCheckbox('c2')} className="mt-1" />
                           <span>I confirm I have paid the $300 submission fee out of pocket (reimbursement pending 6 months).</span>
                         </label>
                         <label className="flex gap-2 items-start cursor-pointer hover:bg-gray-100 p-1">
                           <input type="checkbox" checked={checkboxes.c3} onChange={() => handleCheckbox('c3')} className="mt-1" />
                           <span>I confirm all ethical board approvals have been secured despite their total lack of understanding of my methodology.</span>
                         </label>
                         <label className="flex gap-2 items-start cursor-pointer hover:bg-gray-100 p-1">
                           <input type="checkbox" checked={checkboxes.c4} onChange={() => handleCheckbox('c4')} className="mt-1" />
                           <span>I transfer all copyright to this multi-billion dollar publisher for free.</span>
                         </label>
                      </div>
                   )}
                   {tab === 'UPLOAD' && (
                      <div className="flex items-center justify-center h-full border-2 border-dashed border-gray-400">
                         <div className="text-center space-y-2">
                           <div className="text-4xl">📄</div>
                           <div>draft_final_v5.pdf attached.</div>
                           <div className="text-xs text-gray-500">Checking for formatting violations... Passed.</div>
                         </div>
                      </div>
                   )}
                   {tab === 'REVIEW' && (
                      <div className="space-y-4">
                         <div className="font-bold">Final Review</div>
                         {!allChecked ? (
                           <div className="text-red-600 bg-red-100 p-2 border border-red-600">You must complete all declarations before submitting.</div>
                         ) : (
                           <div className="text-green-700 bg-green-100 p-2 border border-green-600">Ready to submit.</div>
                         )}
                         <button 
                           disabled={!allChecked || submitting || resources.drafts < 1} 
                           onClick={submitPaper}
                           className="pixel-btn bg-[#000080] text-white px-8 py-2 font-bold w-full disabled:opacity-50"
                         >
                           {submitting ? 'UPLOADING...' : 'SUBMIT PAPER'}
                         </button>
                      </div>
                   )}
                </div>
             </div>
          )}

          {phase === 'DONE' && (
             <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                <h2 className="text-3xl font-bold text-green-700">SUBMISSION COMPLETE</h2>
                <p className="text-lg">The draft is in the hands of the reviewers.</p>
                <p className="text-gray-500 italic">Wait for an email notification regarding the decision.</p>
                <button onClick={close} className="pixel-btn bg-gray-200 px-6 py-2">Close Portal</button>
             </div>
          )}
       </div>
    </Window>
  );
}

function ConferenceApp({ invitations, setInvitations, setResources, updateStats, receiveEmail, unlockDiary, close, stats, unlockDIY }) {
  const [phase, setPhase] = useState('LIST'); 
  const [rolls, setRolls] = useState({ verbal: 0, processing: 0 });

  // Handle checking inbox logic externally to avoid duplicate render states
  useEffect(() => {
    // Collect all accepted invitations from the emails state
    // We pass them via props now instead of scraping emails directly to avoid complex sync issues, 
    // but a robust implementation would just read from an app-level 'invitations' list.
  }, []);

  const handleRequestHybrid = () => {
    // Reject hybrid request and remove invitation
    receiveEmail('Politics in Games Organizers', 'Re: Hybrid Presentation Request', 'Frankly, I wish you\'d told me about this issue when you submitted... the program is all geared toward in-person attendance and I\'d rather keep it that way. You are removed from the program.', { type: null });
    updateStats({ burnout: +20, capacity: -20 });
    close();
  };

  const startNetworking = () => {
    const v = Math.floor(Math.random() * 20) + 1;
    const p = Math.floor(Math.random() * 20) + 1;
    setRolls({ verbal: v, processing: p });
    setPhase('ROLL');
  };

  const completeConference = () => {
    const isLow = rolls.verbal <= 7 || rolls.processing <= 7;
    const cost = isLow ? 40 : 15;
    
    updateStats({ timeRemaining: -2, capacity: -cost, health: -(cost/2), burnout: +15 });
    setResources(r => ({ ...r, publications: r.publications + 1 })); 
    
    // Unlock diary entry depending on outcome (mocking the post-cog notes)
    unlockDiary("Post-Conference Reflection", "I feel demoralized. It's hard to explain how it feels to cry in front of all these people who you don't feel like understand you. I said to a mentor: 'I'm used to things going this way. There is a reason why marginalized researchers don't make it.' Afterwards, I looked out the window and saw a pigeon. It was sitting alone.");
    
    unlockDIY();
    
    close();
  };

  return (
    <Window title="CONF_NAVIGATOR.EXE" close={close}>
      <div className="h-full bg-white m-1 border-2 border-gray-500 border-t-black border-l-black p-6 flex flex-col text-center items-center justify-center overflow-y-auto">
        
        {phase === 'LIST' && (
          <div className="max-w-xl w-full">
            <h2 className="text-3xl font-bold border-b-4 border-black pb-2 mb-6">Upcoming Events</h2>
            <div className="bg-gray-100 p-6 border-4 border-black mb-6">
              <h3 className="text-xl font-bold mb-2">Accepted to Present</h3>
              <p className="text-gray-600 mb-6 font-serif">You have an upcoming presentation. Traveling and networking costs significant capacity. If your burnout is too high, you might not survive the trip.</p>
              
              <div className="flex flex-col gap-4">
                <button onClick={startNetworking} className="pixel-btn bg-green-200 px-6 py-4 text-xl">
                  TRAVEL & ATTEND (In-Person)
                </button>
                
                {stats.burnout > 50 ? (
                  <button onClick={handleRequestHybrid} className="pixel-btn bg-red-200 px-6 py-4 text-lg">
                    REQUEST HYBRID/REMOTE OPTION
                  </button>
                ) : (
                  <div className="text-sm text-gray-500 italic">Burnout is manageable. You feel pressured to attend in person.</div>
                )}
              </div>
            </div>
          </div>
        )}

        {phase === 'ROLL' && (
          <div className="max-w-xl animate-fade-in w-full space-y-8">
             <h2 className="text-3xl font-black mb-4 bg-black text-white p-2">Coffee Break Simulator</h2>
             <p className="font-serif">The lights are bright. Several conversations are happening simultaneously. Networking is mandatory for survival. Rolling daily capacities...</p>
             
             <div className="flex justify-around gap-4">
               <div className="pixel-box bg-white text-black p-4 flex-1">
                 <div className="text-lg font-bold border-b-2 border-black mb-2">VERBAL (D20)</div>
                 <div className={`text-6xl font-black ${rolls.verbal <= 7 ? 'text-red-600' : 'text-blue-600'}`}>{rolls.verbal}</div>
               </div>
               
               <div className="pixel-box bg-white text-black p-4 flex-1">
                 <div className="text-lg font-bold border-b-2 border-black mb-2">PROCESS (D20)</div>
                 <div className={`text-6xl font-black ${rolls.processing <= 7 ? 'text-red-600' : 'text-blue-600'}`}>{rolls.processing}</div>
               </div>
             </div>

             <div className="bg-gray-100 p-4 border-2 border-black text-left font-serif">
               {rolls.verbal <= 7 || rolls.processing <= 7 ? (
                 <p className="text-red-600 font-bold">Capacity LOW. Masking through the sensory overwhelm and judgmental Q&A drains you severely. You cry in the hallway.</p>
               ) : (
                 <p className="text-green-700 font-bold">Capacity ACCEPTABLE. You manage the interactions and advocate for participatory design safely.</p>
               )}
             </div>

             <button onClick={completeConference} className="pixel-btn bg-black text-white px-8 py-4 text-xl w-full">
               CLAIM PUBLICATION & GO HOME
             </button>
          </div>
        )}
      </div>
    </Window>
  );
}

function DiaryApp({ diaryEntries, close }) {
  const [selectedIdx, setSelectedIdx] = useState(null);

  return (
    <Window title="PERSONAL_JOURNAL.TXT" close={close}>
      <div className="flex h-full bg-[#ffffe0] m-1 border-2 border-gray-500 border-t-black border-l-black font-serif">
        <div className="w-1/3 border-r-2 border-gray-400 bg-[#f5f5dc] flex flex-col">
          <div className="bg-[#8b4513] text-white font-bold px-2 py-1 text-sm">Entries</div>
          <div className="overflow-y-auto flex-1">
            {diaryEntries.length === 0 && <div className="p-4 text-gray-500 text-sm italic">No entries yet. Live your academic life to unlock reflections.</div>}
            {diaryEntries.map((entry, idx) => (
              <button key={idx} onClick={() => setSelectedIdx(idx)}
                className={`w-full text-left p-2 border-b border-gray-300 text-sm ${selectedIdx === idx ? 'bg-[#d2b48c] font-bold' : ''}`}>
                {entry.title}
              </button>
            ))}
          </div>
        </div>
        
        <div className="w-2/3 p-6 overflow-y-auto relative whitespace-pre-wrap text-lg leading-relaxed text-gray-900">
          {selectedIdx !== null ? diaryEntries[selectedIdx].content : (
            <div className="h-full flex items-center justify-center text-gray-400 italic">Select an entry to read.</div>
          )}
        </div>
      </div>
    </Window>
  );
}

function DataCollection({ updateStats, setResources, close, triggerDistortion }) {
  const [status, setStatus] = useState('IDLE'); 
  const [progress, setProgress] = useState(0);

  const performStep = useCallback(() => {
    setProgress(p => p + 2);
  }, []);

  useEffect(() => {
    if (status === 'COLLECTING') {
      if (progress === 60 && Math.random() < 0.6) {
        setStatus('HATE');
      } else if (progress >= 100) {
        setStatus('DONE');
        setResources(r => ({...r, data: r.data + 1}));
      }
    }
  }, [progress, status, setResources]);

  useEffect(() => {
    if (status === 'COLLECTING') {
      const timer = setInterval(performStep, 100);
      return () => clearInterval(timer);
    }
  }, [status, performStep]);

  const startCollection = () => {
    setStatus('COLLECTING');
    setProgress(0);
    updateStats({ timeRemaining: -0.5, capacity: -5 });
  };

  const absorbHate = () => {
    triggerDistortion();
    updateStats({ health: -15, capacity: -20, burnout: +20 });
    setStatus('COLLECTING');
  };

  return (
    <Window title="SURVEY_TOOL.EXE" close={close}>
      <div className="h-full bg-white m-1 border-2 border-gray-500 border-t-black border-l-black p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
        {status === 'IDLE' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">Data Collection</h2>
            <p className="text-xl font-serif text-gray-700">Post your survey on social media to gather insider data.</p>
            <button onClick={startCollection} className="pixel-btn bg-[#000080] text-white px-8 py-4 text-xl w-full">
              POST TO SOCIALS (-0.5 Mo)
            </button>
          </div>
        )}
        {status === 'COLLECTING' && (
          <div className="w-full max-w-md space-y-4">
             <h2 className="text-2xl font-bold animate-pulse text-[#000080]">Waiting for responses...</h2>
             <div className="h-6 border-2 border-black bg-gray-200 p-[2px]">
               <div className="h-full bg-[#000080] transition-all" style={{ width: `${progress}%` }}></div>
             </div>
          </div>
        )}
        {status === 'HATE' && (
          <div className="absolute inset-4 bg-red-50 border-4 border-red-600 p-6 flex flex-col justify-center z-50 shadow-2xl">
             <h3 className="text-red-700 text-2xl font-black mb-4">NEW RESPONSE RECEIVED</h3>
             <div className="bg-white p-4 border border-red-300 text-left text-lg italic mb-6 font-serif">
               "You are manipulated by Western institutions and playing with people's lives by conducting game studies research. This is exploiting people for fun."
             </div>
             <button onClick={absorbHate} className="pixel-btn bg-red-600 text-white text-lg py-4">
               INTERNALIZE & CONTINUE (-15 HP, +20 Burnout)
             </button>
          </div>
        )}
        {status === 'DONE' && (
          <div className="space-y-6">
            <h2 className="text-4xl font-black text-green-700">DATA SECURED</h2>
            <button onClick={close} className="pixel-btn bg-gray-200 px-8 py-4 text-xl w-full">CLOSE APP</button>
          </div>
        )}
      </div>
    </Window>
  );
}

function DIYProject({ updateStats, close, unlockAchievement }) {
  const [built, setBuilt] = useState(false);

  const createSpace = () => {
    updateStats({ timeRemaining: -6, capacity: +50, health: -10, burnout: -30 });
    setBuilt(true);
    unlockAchievement("DIY Community", "You created the support structure that did not exist.");
  };

  return (
    <Window title="COMMUNITY_BUILDER.EXE" close={close}>
      <div className="h-full bg-[#ffffe0] m-1 border-2 border-gray-500 border-t-black border-l-black p-8 flex flex-col justify-center items-center text-center">
        {!built ? (
          <div className="max-w-xl space-y-6">
            <h2 className="text-3xl font-black text-yellow-800 border-b-4 border-yellow-800 pb-2">BUILD YOUR OWN SPACE</h2>
            <p className="text-xl text-gray-800 font-serif">The academic and community space that you need does not exist.</p>
            <p className="text-lg text-gray-700 text-left italic font-serif bg-white p-4 border border-gray-300">
              Organizing a supportive community (like Games Intersectional) will create belonging, but the uncompensated labor falls entirely on you.
            </p>
            <button onClick={createSpace} className="pixel-btn bg-yellow-400 text-black px-8 py-4 text-2xl w-full border-4 border-black">
              DO IT YOURSELF (-6 Months, -10 HP)
            </button>
          </div>
        ) : (
          <div className="max-w-xl space-y-6">
             <h2 className="text-4xl font-black text-green-700">COMMUNITY BUILT</h2>
             <ul className="text-left space-y-2 text-lg font-bold border-4 border-black p-6 bg-white font-serif">
               <li className="text-green-700">[+] Belonging increased.</li>
               <li className="text-green-700">[+] Marginalized peers gained a safer space.</li>
               <li className="text-red-600">[-] You are exhausted.</li>
               <li className="text-red-600">[-] Institutional deadlines did NOT pause.</li>
             </ul>
             <button onClick={close} className="pixel-btn bg-gray-200 px-8 py-4 text-xl w-full">RETURN TO GRIND</button>
          </div>
        )}
      </div>
    </Window>
  );
}

function LitReview({ updateStats, setResources, close }) {
  const [progress, setProgress] = useState(0);

  const readPaper = () => {
    updateStats({ timeRemaining: -0.2, mental: -2, burnout: 1 });
    const nextProgress = progress + 25;
    if (nextProgress >= 100) {
      setResources(r => ({ ...r, lit: r.lit + 1 }));
      setProgress(0);
    } else {
      setProgress(nextProgress);
    }
  };

  return (
    <Window title="ACROBAT_READER.EXE" close={close}>
      <div className="h-full bg-white m-1 border-2 border-gray-500 border-t-black border-l-black p-8 flex flex-col justify-center items-center text-center">
        <h2 className="text-3xl font-bold mb-4 border-b-2 border-black pb-2">Literature Review</h2>
        <p className="text-xl font-serif text-gray-700 mb-6">Read deeply theoretically dense papers to build your literature resource.</p>
        
        <div className="w-full max-w-md h-8 border-2 border-black bg-gray-200 p-[2px] mb-6">
          <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }}></div>
        </div>

        <button onClick={readPaper} className="pixel-btn bg-[#000080] text-white px-8 py-4 text-xl w-full max-w-md">
          READ PAPER (-0.2 Mo, -2 Mental)
        </button>
      </div>
    </Window>
  );
}

function VSCode({ updateStats, setResources, close, isBlocked }) {
  const [mode, setMode] = useState('IDLE');
  const [progress, setProgress] = useState(0);
  const [codeText, setCodeText] = useState('');

  const fullCode = `import { Engine } from 'game-lib';
import { Player, Narrative } from './types';

const story = new Engine();

// Initializing narrative nodes
story.on('init', (player: Player) => {
  player.setStats({ belonging: 100, understanding: 0 });
  console.log("Loading module...");
});

// Main dialogue loop
story.on('dialogue_choice', (choice) => {
  if (choice.type === 'extractive') {
    console.warn("Participant withdrew consent.");
    return false;
  }
  return true;
});

export default story;`;

  const startCoding = () => {
    setMode('CODE');
    setProgress(0);
    setCodeText('');
  };

  const handleKeyDown = useCallback((e) => {
    if (mode !== 'CODE' || isBlocked) return;
    if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) return;

    const next = progress + 3;
    setProgress(next);
    setCodeText(fullCode.substring(0, next));
    
    // Constant slight drain from mental labor of coding
    if (Math.random() < 0.05) updateStats({ capacity: -1 });

  }, [mode, isBlocked, updateStats, fullCode, progress]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const finishCode = () => {
    updateStats({ timeRemaining: -0.5, mental: -5, burnout: 2 });
    setResources(r => ({ ...r, code: r.code + 1 }));
    close();
  };

  return (
    <Window title="VS_CODE.EXE" close={close}>
      <div className="h-full bg-[#1e1e1e] text-[#d4d4d4] m-1 border-2 border-gray-500 border-t-black border-l-black p-6 font-mono flex flex-col relative">
        <div className="text-sm mb-4 border-b border-[#333] pb-2 flex justify-between items-center">
          <span>explorer &gt; src &gt; interactive_narrative.ts</span>
          {mode === 'CODE' && <span className="text-yellow-400 animate-pulse font-bold bg-[#333] px-2 py-1">MASH KEYBOARD TO TYPE</span>}
        </div>
        
        {mode === 'IDLE' ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <h2 className="text-2xl font-bold text-white">Prototype Development</h2>
            <p className="text-gray-400 text-center max-w-sm mb-4">Code an interactive narrative engine to support your technical methodology.</p>
            <button 
              onClick={startCoding} 
              className="pixel-btn bg-[#007acc] text-white px-8 py-4 text-xl border-none shadow-none hover:bg-[#005999]"
            >
              START CODING
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
              {codeText}
              <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse align-middle ml-1"></span>
            </div>

            {progress >= fullCode.length && (
               <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center z-50">
                 <h3 className="text-4xl font-black text-green-400 mb-6 border-4 border-green-400 p-4 bg-[#1e1e1e]">BUILD SUCCESSFUL</h3>
                 <button onClick={finishCode} className="pixel-btn bg-white text-black px-8 py-4 text-xl hover:bg-gray-200">
                   SAVE PROTOTYPE (-0.5 Mo)
                 </button>
               </div>
            )}
          </>
        )}
      </div>
    </Window>
  );
}

function PileOfShame({ updateStats, close }) {
  const playGame = () => {
    updateStats({ timeRemaining: -0.3, health: 5, capacity: 10, burnout: -10 });
  };

  return (
    <Window title="STEAM_LIBRARY.EXE" close={close}>
      <div className="h-full bg-[#1b2838] text-[#c7d5e0] m-1 border-2 border-gray-500 border-t-black border-l-black p-6 flex flex-col">
        <h2 className="text-2xl font-bold mb-1">Pile of Shame</h2>
        <p className="text-sm mb-6 text-gray-400">Games you bought but never have the energy to play.</p>
        
        <div className="flex-1 overflow-y-auto space-y-2">
          {['Elden Ring', 'Disco Elysium', 'Hollow Knight', 'Stardew Valley', 'Outer Wilds'].map(game => (
            <div key={game} className="flex justify-between items-center p-3 bg-[#2a475e] hover:bg-[#66c0f4]/20 cursor-pointer">
              <span className="font-bold">{game}</span>
              <button onClick={playGame} className="bg-[#5c7e10] hover:bg-[#7cb71c] text-white px-4 py-1 text-sm font-bold border-none">
                PLAY
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-xs italic text-center text-gray-500">
          Playing games consumes precious time, but restores health and capacity.
        </div>
      </div>
    </Window>
  );
}