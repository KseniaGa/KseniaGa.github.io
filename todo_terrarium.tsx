import React, { useState, useEffect, useRef } from 'react';
import { Leaf, Plus, Sparkles, Wind, Info, Heart, Flower2, TreePine } from 'lucide-react';

const CREATURE_TYPES = {
  tiny: { label: 'Tiny Task', emojis: ['🐞', '🐛', '🐜'], habitat: 'Leafy Branch', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  scary: { label: 'Scary Task', emojis: ['🐌', '🦔', '🐢'], habitat: 'Cozy Log', color: 'bg-stone-100 text-stone-800 border-stone-200' },
  urgent: { label: 'Urgent Task', emojis: ['🐝', '🐿️', '🐇'], habitat: 'Bustling Hive', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  creative: { label: 'Creative Task', emojis: ['🦋', '🦜', '🦚'], habitat: 'Flower Patch', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  selfCare: { label: 'Self-care', emojis: ['🐸', '🦥', '🦦'], habitat: 'Quiet Pond', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  admin: { label: 'Admin Task', emojis: ['🦀', '🦉', '🦫'], habitat: 'Pebble Desk', color: 'bg-blue-100 text-blue-800 border-blue-200' },
};

const MOVEMENT_CONFIG = {
  tiny: { baseWait: 2000, randomWait: 2000, moveX: 6, moveY: 6, duration: '1.5s', ease: 'ease-out' }, // Quick, short flitters
  scary: { baseWait: 6000, randomWait: 3000, moveX: 2, moveY: 2, duration: '6s', ease: 'ease-in-out' }, // Slow, cautious creeps
  urgent: { baseWait: 800, randomWait: 1500, moveX: 16, moveY: 16, duration: '0.8s', ease: 'ease-out' }, // Zippy, frantic darts
  creative: { baseWait: 3000, randomWait: 2000, moveX: 12, moveY: 12, duration: '4s', ease: 'ease-in-out' }, // Smooth, sweeping arcs
  selfCare: { baseWait: 7000, randomWait: 4000, moveX: 8, moveY: 8, duration: '2.5s', ease: 'ease-in-out' }, // Mostly resting, occasional hops
  admin: { baseWait: 3000, randomWait: 2000, moveX: 15, moveY: 3, duration: '3s', ease: 'linear' }, // Methodical, mostly side-to-side pacing
};

const GENTLE_STATES = [
  'Resting quietly 💤',
  'Exploring a little leaf 🍃',
  'Waiting patiently 🌼',
  'Enjoying the sunshine ☀️',
  'Hiding in the moss 🌱',
  'Humming a tiny song 🎶'
];

const MEADOW_STATES = [
  'Frolicking in the tall grass 🌾',
  'Flying freely in the breeze 🌬️',
  'Sleeping under a giant mushroom 🍄',
  'Telling stories to the other creatures 🌸',
  'Happily swimming in the sunlit stream 🌊'
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomPos = () => ({ x: 10 + Math.random() * 70, y: 15 + Math.random() * 60 });
const getAnimProps = () => ({ dur: 2.5 + Math.random() * 2, del: Math.random() * 2 });

const STORAGE_KEY = 'todo-terrarium.tasks.v1';
function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    if (!Array.isArray(saved)) return [];
    return saved.filter(task => task && typeof task.id === 'string' && typeof task.title === 'string' && CREATURE_TYPES[task.type] && ['terrarium', 'released'].includes(task.status)).map(task => ({...task, pos: task.pos || getRandomPos(), anim: task.anim || getAnimProps()}));
  } catch { return []; }
}

export default function TodoTerrarium() {
  const [tasks, setTasks] = useState(loadTasks);
  const [storageError, setStorageError] = useState(false);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); setStorageError(false); }
    catch { setStorageError(true); }
  }, [tasks]);

  const [activeTab, setActiveTab] = useState('terrarium');
  const [isAdding, setIsAdding] = useState(() => tasks.length === 0);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleAddCreature = (newTask) => {
    const typeInfo = CREATURE_TYPES[newTask.type];
    const task = {
      ...newTask,
      id: crypto.randomUUID(),
      emoji: getRandom(typeInfo.emojis),
      habitat: typeInfo.habitat,
      status: 'terrarium',
      gentleState: getRandom(GENTLE_STATES),
      pos: getRandomPos(),
      anim: getAnimProps()
    };
    setTasks(previous => [task, ...previous]);
    setIsAdding(false);
  };

  const handleRelease = (id) => {
    setTasks(previous => previous.map(t => {
      if (t.id === id) {
        return { ...t, status: 'released', gentleState: getRandom(MEADOW_STATES), pos: getRandomPos(), anim: getAnimProps() };
      }
      return t;
    }));
    setSelectedTask(null);
  };

  const handleUpdateTask = (id, updates) => {
    setTasks(previous => previous.map(t => {
      if (t.id === id) {
        return { ...t, ...updates };
      }
      return t;
    }));
    // Also update the selected task state immediately so the UI doesn't lag
    setSelectedTask(prev => prev && prev.id === id ? { ...prev, ...updates } : prev);
  };

  const activeTasks = tasks.filter(t => t.status === 'terrarium');
  const releasedTasks = tasks.filter(t => t.status === 'released');

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-700 font-sans selection:bg-teal-100 pb-20 overflow-x-hidden">
      <style>{`
        @keyframes bop {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        @keyframes float-meadow {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(15px, -20px) rotate(5deg); }
          66% { transform: translate(-10px, 15px) rotate(-5deg); }
        }
        @keyframes float-up-fade {
          0% { transform: translateY(0) scale(0.8); opacity: 1; }
          100% { transform: translateY(-40px) scale(1.5); opacity: 0; }
        }
      `}</style>
      
      {/* Header */}
      <header className="pt-12 pb-8 px-6 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-extrabold text-stone-800 tracking-tight flex items-center justify-center gap-3 mb-3">
          <Leaf className="text-emerald-500" size={36} />
          Todo Terrarium
        </h1>
        <p className="text-stone-500 text-lg">
          Your tasks are not demands, but little creatures entrusted to your care.
        </p>
        <p className="text-sm text-stone-500 mt-4">Saved in this browser only. No account or syncing; clearing browser data removes your garden.</p>
        {storageError && <p role="alert" className="text-sm text-red-700 mt-2">Your browser could not save this garden. Keep this tab open to avoid losing changes.</p>}
      </header>

      {/* Navigation Tabs */}
      <div className="terrarium-tabs flex justify-center gap-4 mb-8 px-4 relative z-20">
        <button
          onClick={() => { setActiveTab('terrarium'); setSelectedTask(null); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
            activeTab === 'terrarium' 
              ? 'bg-emerald-100 text-emerald-800 shadow-sm' 
              : 'bg-transparent text-stone-400 hover:bg-stone-100'
          }`}
        >
          <Leaf size={20} />
          Terrarium ({activeTasks.length})
        </button>
        <button
          onClick={() => { setActiveTab('meadow'); setSelectedTask(null); }}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-medium transition-all duration-300 ${
            activeTab === 'meadow' 
              ? 'bg-amber-100 text-amber-800 shadow-sm' 
              : 'bg-transparent text-stone-400 hover:bg-stone-100'
          }`}
        >
          <TreePine size={20} />
          Memory Meadow ({releasedTasks.length})
        </button>
      </div>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="flex justify-center mb-6">
          {activeTab === 'terrarium' && (
             <button
               onClick={() => setIsAdding(true)}
               className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-full font-medium flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:-translate-y-1"
             >
               <Plus size={20} />
               Invite Creature
             </button>
          )}
        </div>

        {activeTab === 'terrarium' ? (
          <div className="bg-gradient-to-b from-[#eaf4ea] to-[#d3ecd3] border-8 border-[#c3e0c3] rounded-[3rem] h-[550px] shadow-inner relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute bottom-4 left-8 text-7xl opacity-50 select-none pointer-events-none">🪨</div>
            <div className="absolute bottom-12 right-10 text-8xl opacity-40 select-none pointer-events-none">🌿</div>
            <div className="absolute top-10 left-20 text-6xl opacity-30 select-none pointer-events-none">🍄</div>
            <div className="absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-emerald-600/10 to-transparent pointer-events-none"></div>

            {activeTasks.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                <div className="text-6xl mb-4 opacity-50">🌱</div>
                <h3 className="text-xl font-medium text-emerald-700 mb-2">The terrarium is quiet</h3>
                <p className="text-emerald-600/70">Invite a creature to begin your gentle journey.</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <CreatureSprite key={task.id} task={task} onDoubleClick={setSelectedTask} />
              ))
            )}

            {/* Care Panel (when a creature is selected) */}
            {selectedTask && selectedTask.status === 'terrarium' && (
              <CarePanel key={selectedTask.id}
                task={selectedTask} 
                onClose={() => setSelectedTask(null)} 
                onRelease={() => handleRelease(selectedTask.id)} 
                onUpdate={(updates) => handleUpdateTask(selectedTask.id, updates)}
              />
            )}
          </div>
        ) : (
          <div className="bg-gradient-to-b from-[#fffaf0] to-[#fdebc8] border-8 border-[#f8dfb1] rounded-[3rem] h-[550px] shadow-inner relative overflow-hidden">
             {/* Background Decor */}
             <div className="absolute top-12 right-16 text-amber-200/60 text-8xl select-none pointer-events-none">☀️</div>
             <div className="absolute bottom-8 left-12 text-7xl opacity-50 select-none pointer-events-none">🌸</div>
             <div className="absolute bottom-20 right-20 text-6xl opacity-50 select-none pointer-events-none">🌾</div>
             <div className="absolute bottom-0 w-full h-1/4 bg-gradient-to-t from-amber-500/10 to-transparent pointer-events-none"></div>

             {releasedTasks.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none">
                <div className="text-6xl mb-4 opacity-50">🌬️</div>
                <h3 className="text-xl font-medium text-amber-700 mb-2">The meadow is waiting</h3>
                <p className="text-amber-600/70">Released creatures will come here to play and rest.</p>
              </div>
            ) : (
              releasedTasks.map(task => (
                <ReleasedSprite key={task.id} task={task} onDoubleClick={setSelectedTask} />
              ))
            )}

            {/* Care Panel for Released (just to see info) */}
            {selectedTask && selectedTask.status === 'released' && (
              <ReleasedPanel task={selectedTask} onClose={() => setSelectedTask(null)} />
            )}
          </div>
        )}
      </main>

      <p className="text-center text-sm text-stone-500 px-6 mt-5">Tap a creature to send love. Double-tap to open its care notes, or focus it and press Enter.</p>
      {/* Add Task Modal */}
      {isAdding && (
        <AddModal onClose={() => setIsAdding(false)} onAdd={handleAddCreature} />
      )}
    </div>
  );
}

function CreatureSprite({ task, onDoubleClick }) {
  const [pos, setPos] = useState(task.pos);
  const [hearts, setHearts] = useState([]);
  const lastClickTime = useRef(0);
  const config = MOVEMENT_CONFIG[task.type] || MOVEMENT_CONFIG.tiny;

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (e.detail === 0) { onDoubleClick(task); return; }
    const now = Date.now();
    // Use custom check for double-tap so it works perfectly on mobile touch screens too
    if (now - lastClickTime.current < 400) {
      onDoubleClick(task);
    } else {
      // Single click - send love!
      const newHeart = { id: Date.now(), x: (Math.random() - 0.5) * 30 };
      setHearts(prev => [...prev, newHeart]);
      // Remove heart after animation finishes
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 1000);
    }
    lastClickTime.current = now;
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timeoutId;
    const wander = () => {
      setPos(prev => {
        let nextX = prev.x + (Math.random() * config.moveX * 2) - config.moveX;
        let nextY = prev.y + (Math.random() * config.moveY * 2) - config.moveY;
        
        // Softly bounce them back if they wander too close to the edges
        if (nextX < 5) nextX = 5 + Math.random() * config.moveX;
        if (nextX > 85) nextX = 85 - Math.random() * config.moveX;
        if (nextY < 10) nextY = 10 + Math.random() * config.moveY;
        if (nextY > 80) nextY = 80 - Math.random() * config.moveY;
        
        return { x: nextX, y: nextY };
      });
      
      // Schedule their next move organically based on their personality
      timeoutId = setTimeout(wander, config.baseWait + Math.random() * config.randomWait);
    };
    
    // Give them a random start time so they don't all move at exactly the same time
    timeoutId = setTimeout(wander, Math.random() * 2000);
    return () => clearTimeout(timeoutId);
  }, [config]);

  return (
    <button type="button" aria-label={`Open care for ${task.title}`}
      onClick={handleInteraction}
      className="creature-button absolute cursor-pointer flex flex-col items-center justify-center group z-10"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transition: `left ${config.duration} ${config.ease}, top ${config.duration} ${config.ease}`,
        animation: `bop ${task.anim.dur}s infinite ease-in-out ${task.anim.del}s`
      }}
    >
      {hearts.map(heart => (
        <div key={heart.id} className="absolute text-red-400 text-3xl pointer-events-none z-20" style={{
          left: `calc(50% + ${heart.x}px - 15px)`,
          bottom: '80%',
          animation: 'float-up-fade 1s ease-out forwards'
        }}>
          ❤️
        </div>
      ))}
      <div className="text-6xl sm:text-7xl drop-shadow-xl filter transition-transform group-hover:scale-110">
        {task.emoji}
      </div>
      {/* Gentle tooltip-like label to identify the task on hover */}
      <div className="mt-2 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-emerald-800 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-8 pointer-events-none whitespace-nowrap">
        {task.title}
      </div>
    </button>
  );
}

function ReleasedSprite({ task, onDoubleClick }) {
  const [pos, setPos] = useState(task.pos);
  const [hearts, setHearts] = useState([]);
  const lastClickTime = useRef(0);
  const config = MOVEMENT_CONFIG[task.type] || MOVEMENT_CONFIG.tiny;

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (e.detail === 0) { onDoubleClick(task); return; }
    const now = Date.now();
    if (now - lastClickTime.current < 400) {
      onDoubleClick(task);
    } else {
      const newHeart = { id: Date.now(), x: (Math.random() - 0.5) * 30 };
      setHearts(prev => [...prev, newHeart]);
      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, 1000);
    }
    lastClickTime.current = now;
  };

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let timeoutId;
    const wander = () => {
      setPos(prev => {
        // The Meadow is open, so they explore a slightly wider area
        const meadowMult = 1.3; 
        let nextX = prev.x + (Math.random() * config.moveX * meadowMult * 2) - (config.moveX * meadowMult);
        let nextY = prev.y + (Math.random() * config.moveY * meadowMult * 2) - (config.moveY * meadowMult);
        
        if (nextX < 5) nextX = 5 + Math.random() * config.moveX;
        if (nextX > 85) nextX = 85 - Math.random() * config.moveX;
        if (nextY < 10) nextY = 10 + Math.random() * config.moveY;
        if (nextY > 80) nextY = 80 - Math.random() * config.moveY;
        
        return { x: nextX, y: nextY };
      });
      
      timeoutId = setTimeout(wander, config.baseWait + Math.random() * config.randomWait);
    };
    
    timeoutId = setTimeout(wander, Math.random() * 2000);
    return () => clearTimeout(timeoutId);
  }, [config]);

  return (
    <button type="button" aria-label={`Open care for ${task.title}`}
      onClick={handleInteraction}
      className="creature-button absolute cursor-pointer flex flex-col items-center justify-center group z-10"
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        transition: `left ${config.duration} ${config.ease}, top ${config.duration} ${config.ease}`,
        animation: `float-meadow ${task.anim.dur + 2}s infinite ease-in-out ${task.anim.del}s`
      }}
    >
      {hearts.map(heart => (
        <div key={heart.id} className="absolute text-red-400 text-3xl pointer-events-none z-20" style={{
          left: `calc(50% + ${heart.x}px - 15px)`,
          bottom: '80%',
          animation: 'float-up-fade 1s ease-out forwards'
        }}>
          ❤️
        </div>
      ))}
      <div className="text-5xl sm:text-6xl drop-shadow-md filter opacity-80 transition-transform group-hover:scale-110 group-hover:opacity-100">
        {task.emoji}
      </div>
      <div className="absolute -top-4 -right-4 text-amber-400 text-xl animate-pulse">✨</div>
    </button>
  );
}

function CarePanel({ task, onClose, onRelease, onUpdate }) {
  const typeInfo = CREATURE_TYPES[task.type];
  const [note, setNote] = useState(task.note || '');

  return (
    <div className="care-panel absolute inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[400px] bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-2 border-emerald-100 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button 
        onClick={() => {
          if (note !== (task.note || '')) onUpdate({ note });
          onClose();
        }}
        aria-label="Close care panel" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 transition-colors"
      >
        ✕
      </button>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl">{task.emoji}</div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1 mb-1">
            {task.habitat} • {typeInfo.label}
          </span>
          <h3 className="font-bold text-xl leading-tight text-stone-800">{task.title}</h3>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="text-sm font-medium text-stone-500 flex items-center justify-center gap-2 bg-stone-50 py-2 rounded-xl">
          <Info size={16} />
          {task.gentleState}
        </div>

        <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 focus-within:border-emerald-200 focus-within:ring-2 focus-within:ring-emerald-100 transition-all">
           <label htmlFor="care-note" className="block text-[10px] font-bold text-stone-400 mb-1 uppercase tracking-wider">Care Notes / Updates</label>
           <textarea id="care-note"
             value={note}
             onChange={(e) => setNote(e.target.value)}
             onBlur={() => onUpdate({ note })}
             placeholder="How is this little one doing?"
             className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-sm text-stone-700 placeholder:text-stone-400 resize-none h-16"
           />
        </div>
        
        <button 
          onClick={() => {
            if (note !== (task.note || '')) onUpdate({ note });
            onRelease();
          }}
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white transition-colors py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20"
        >
          <Wind size={18} />
          Release into the wild
        </button>
      </div>
    </div>
  );
}

function ReleasedPanel({ task, onClose }) {
  const typeInfo = CREATURE_TYPES[task.type];

  return (
    <div className="care-panel absolute inset-x-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[350px] bg-white/95 backdrop-blur-md p-6 rounded-3xl shadow-2xl border-2 border-amber-100 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
       <button 
        onClick={onClose}
        aria-label="Close care panel" className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 transition-colors"
      >
        ✕
      </button>
      <div className="text-5xl mb-3">{task.emoji}</div>
      <h3 className="font-bold text-xl leading-tight text-stone-800 mb-2 line-through decoration-stone-300 decoration-2">{task.title}</h3>
      <p className="text-amber-700 text-sm font-medium flex items-center justify-center gap-2">
        <Sparkles size={16} className="text-amber-400" />
        {task.gentleState}
      </p>
      
      {task.note && (
         <div className="mt-4 bg-amber-50/70 p-3 rounded-xl text-left border border-amber-100/50">
            <span className="block text-[10px] font-bold text-amber-600/70 uppercase tracking-wider mb-1">Care Notes</span>
            <p className="text-sm text-amber-800 italic">"{task.note}"</p>
         </div>
      )}
    </div>
  );
}

function AddModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState('tiny');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, type });
  };

  const dialogRef = useRef(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog ref={dialogRef} className="add-dialog" aria-labelledby="invite-heading" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="bg-[#FDFBF7] rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative border-4 border-white animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          aria-label="Close invitation" className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-stone-100 hover:bg-stone-200 rounded-full text-stone-500 transition-colors"
        >
          ✕
        </button>

        <h2 id="invite-heading" className="text-2xl font-bold text-stone-800 mb-6 flex items-center gap-2">
          <Flower2 className="text-pink-400" />
          Invite a New Creature
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="task-title" className="block text-sm font-bold text-stone-600 mb-2 ml-1">What does this creature need? (Task Name)</label>
            <input 
              id="task-title"
              maxLength={200}
              autoFocus
              type="text" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Call the dentist"
              className="w-full bg-white border-2 border-stone-200 rounded-2xl px-4 py-3 focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/20 transition-all text-stone-700 placeholder:text-stone-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-600 mb-2 ml-1">What kind of creature is this?</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(CREATURE_TYPES).map(([key, info]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setType(key)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all flex flex-col gap-1 ${
                    type === key 
                      ? info.color + ' ring-2 ring-offset-2 ring-emerald-400' 
                      : 'bg-white border-stone-200 text-stone-500 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xl">{info.emojis[0]}</span>
                  <span className="text-xs font-bold leading-tight">{info.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3.5 rounded-full font-bold text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors"
            >
              Maybe Later
            </button>
            <button 
              type="submit"
              className="flex-1 py-3.5 rounded-full font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-md shadow-emerald-500/20 transition-all"
            >
              Place in Terrarium
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}