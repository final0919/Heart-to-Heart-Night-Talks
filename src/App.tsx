/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Info, 
  Heart, 
  Users, 
  X, 
  RotateCcw, 
  Home, 
  History, 
  ChevronRight, 
  Layers, 
  Grid,
  Check,
  Key,
  Lock
} from 'lucide-react';
import { LOVER_QUESTIONS, FRIEND_QUESTIONS } from './constants';

// --- Types ---

type Theme = 'FRIEND' | 'LOVER' | null;
type Mode = 'RANDOM' | 'CUSTOM' | null;
type Module = '认识我们' | '认识我和你';

interface GameConfig {
  theme: Theme;
  modules: Module[];
  mode: Mode;
}

interface Card {
  id: string;
  question: string;
  module: Module;
  isFlipped: boolean;
}

// --- Constants ---

const ACTIVATION_CODES = {
  FRIEND: 'FRIEND888',
  LOVER: 'LOVER999',
  BOTH: 'DEEP2024'
};

// --- Components ---

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-6 border-bottom border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </motion.div>
    </div>
  );
};

export default function App() {
  // --- State ---
  const [showRules, setShowRules] = useState(true);
  
  const [currentTheme, setCurrentTheme] = useState<Theme>(null);
  const [gameStep, setGameStep] = useState<'HOME' | 'CONFIG' | 'PLAY' | 'END'>('HOME');
  const [config, setConfig] = useState<GameConfig>({
    theme: null,
    modules: ['认识我们'],
    mode: 'RANDOM'
  });

  const [cards, setCards] = useState<Card[]>([]);
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [currentBatch, setCurrentBatch] = useState<Card[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [drawCount, setDrawCount] = useState(1);
  const [zoomedCard, setZoomedCard] = useState<Card | null>(null);

  // --- Activation State ---
  const [activatedThemes, setActivatedThemes] = useState({ FRIEND: false, LOVER: false });
  const [showActivation, setShowActivation] = useState(false);
  const [activationCode, setActivationCode] = useState('');
  const [activationError, setActivationError] = useState('');

  // --- Effects ---
  useEffect(() => {
    // Initial rules display
    setShowRules(true);
  }, []);

  const [showThemeRules, setShowThemeRules] = useState(false);

  // --- Handlers ---
  const handleActivate = () => {
    const code = activationCode.trim().toUpperCase();
    setActivationError('');
    
    if (code === ACTIVATION_CODES.BOTH) {
      setActivatedThemes({ FRIEND: true, LOVER: true });
      setShowActivation(false);
      setActivationCode('');
    } else if (code === ACTIVATION_CODES.FRIEND) {
      setActivatedThemes(prev => ({ ...prev, FRIEND: true }));
      setShowActivation(false);
      setActivationCode('');
    } else if (code === ACTIVATION_CODES.LOVER) {
      setActivatedThemes(prev => ({ ...prev, LOVER: true }));
      setShowActivation(false);
      setActivationCode('');
    } else {
      setActivationError('激活码无效，请检查后重试');
    }
  };

  const startConfig = (theme: Theme) => {
    if (theme && !activatedThemes[theme]) {
      setShowActivation(true);
      return;
    }
    setCurrentTheme(theme);
    setConfig(prev => ({ ...prev, theme }));
    setGameStep('CONFIG');
    setShowThemeRules(true);
  };

  const initGame = () => {
    const questions: string[] = [];
    const source = config.theme === 'LOVER' ? LOVER_QUESTIONS : FRIEND_QUESTIONS;
    
    config.modules.forEach(module => {
      questions.push(...source[module]);
    });

    const newCards: Card[] = questions.map((q, i) => ({
      id: `${config.theme}-${i}`,
      question: q,
      module: config.modules.find(m => source[m].includes(q))!,
      isFlipped: false
    })).sort(() => Math.random() - 0.5);

    setCards(newCards);
    setDrawnCards([]);
    setCurrentBatch([]);
    setGameStep('PLAY');
  };

  const drawCards = () => {
    if (cards.length === 0) return;
    const count = Math.min(drawCount, cards.length);
    const newDrawn = cards.slice(0, count);
    const remaining = cards.slice(count);
    
    setDrawnCards(prev => [...prev, ...newDrawn]);
    setCards(remaining);
    setCurrentBatch(newDrawn);
  };

  const flipCard = (id: string) => {
    const card = cards.find(c => c.id === id);
    if (!card) return;
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));
    setDrawnCards(prev => {
      if (prev.find(p => p.id === id)) return prev;
      return [...prev, { ...card, isFlipped: true }];
    });
  };

  const flipAll = () => {
    setCards(prev => prev.map(c => ({ ...c, isFlipped: true })));
    setDrawnCards(prev => {
      const allFlipped = cards.map(c => ({ ...c, isFlipped: true }));
      return allFlipped;
    });
  };

  const resetGame = () => {
    setGameStep('CONFIG');
    setCards([]);
    setDrawnCards([]);
    setCurrentBatch([]);
  };

  const returnHome = () => {
    setGameStep('HOME');
    setCurrentTheme(null);
    setCards([]);
    setDrawnCards([]);
    setCurrentBatch([]);
  };

  // --- Render Helpers ---

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-12 p-4 relative z-10">
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 mb-4 tracking-tighter drop-shadow-sm">
          深度对话辅助牌
        </h1>
        <div className="h-1.5 w-24 bg-gray-900 mx-auto rounded-full mb-8 opacity-20" />
        <p className="text-gray-500 text-lg md:text-xl font-medium max-w-lg mx-auto leading-relaxed">
          在对话中探索灵魂的深度，<br/>建立更真实、更亲密的人际联结。
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <motion.button
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => startConfig('FRIEND')}
          className="relative group overflow-hidden rounded-[2.5rem] p-10 flex flex-col items-center gap-6 transition-all shadow-xl hover:shadow-2xl bg-white border-2 border-blue-100"
        >
          <div className="p-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl text-white shadow-lg group-hover:rotate-6 transition-transform relative">
            <Users size={56} />
            {!activatedThemes.FRIEND && (
              <div className="absolute -top-2 -right-2 bg-white text-blue-500 p-1.5 rounded-xl shadow-md">
                <Lock size={16} />
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-black text-blue-800">你好朋友</h3>
            <p className="text-blue-500/60 mt-3 font-medium">探索友谊的深度，发现彼此未曾言说的故事</p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-100 rounded-full opacity-20 group-hover:scale-150 transition-transform" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.03, y: -5 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => startConfig('LOVER')}
          className="relative group overflow-hidden rounded-[2.5rem] p-10 flex flex-col items-center gap-6 transition-all shadow-xl hover:shadow-2xl bg-white border-2 border-rose-100"
        >
          <div className="p-6 bg-gradient-to-br from-rose-400 to-rose-500 rounded-3xl text-white shadow-lg group-hover:-rotate-6 transition-transform relative">
            <Heart size={56} />
            {!activatedThemes.LOVER && (
              <div className="absolute -top-2 -right-2 bg-white text-rose-500 p-1.5 rounded-xl shadow-md">
                <Lock size={16} />
              </div>
            )}
          </div>
          <div className="text-center">
            <h3 className="text-3xl font-black text-rose-800">你好爱人</h3>
            <p className="text-rose-500/60 mt-3 font-medium">拉近亲密关系，在对话中建立更深的情感联结</p>
          </div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-rose-100 rounded-full opacity-20 group-hover:scale-150 transition-transform" />
        </motion.button>
      </div>
    </div>
  );

  const renderConfig = () => {
    const themeColor = currentTheme === 'LOVER' ? 'rose' : 'blue';
    const themeBg = currentTheme === 'LOVER' ? 'bg-rose-500' : 'bg-blue-500';
    const themeBorder = currentTheme === 'LOVER' ? 'border-rose-500' : 'border-blue-500';
    const themeText = currentTheme === 'LOVER' ? 'text-rose-500' : 'text-blue-500';
    const themeLightBg = currentTheme === 'LOVER' ? 'bg-rose-50' : 'bg-blue-50';

    return (
      <div className="max-w-2xl mx-auto p-8 bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl mt-8 relative border border-white/50">
        <button 
          onClick={() => setGameStep('HOME')}
          className="absolute top-8 right-8 p-3 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
        >
          <X size={24} />
        </button>
        <h2 className="text-3xl font-black text-gray-900 mb-10 flex items-center gap-4">
          <div className={`p-3 ${themeLightBg} ${themeText} rounded-2xl`}>
            {currentTheme === 'LOVER' ? <Heart size={32} /> : <Users size={32} />}
          </div>
          游戏初始设置
        </h2>

        <div className="space-y-10">
          <section>
            <div className="flex items-center justify-between mb-6">
              <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em]">选择卡牌内容模块</label>
              <span className={`text-[10px] font-bold ${themeText} bg-white px-3 py-1 rounded-full border ${themeBorder}/20`}>可多选</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['认识我们', '认识我和你'].map((m) => {
                const isSelected = config.modules.includes(m as Module);
                return (
                  <button
                    key={m}
                    onClick={() => {
                      const mod = m as Module;
                      setConfig(prev => ({
                        ...prev,
                        modules: prev.modules.includes(mod) 
                          ? prev.modules.length > 1 ? prev.modules.filter(x => x !== mod) : prev.modules
                          : [...prev.modules, mod]
                      }));
                    }}
                    className={`group relative p-6 rounded-3xl border-2 transition-all text-left overflow-hidden ${
                      isSelected 
                        ? `${themeBorder} ${themeBg} text-white shadow-lg shadow-${themeColor}-200` 
                        : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="font-black text-lg">{m}</span>
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected ? 'border-white bg-white/30' : 'border-gray-200'
                      }`}>
                        {isSelected && (
                          <Check size={16} strokeWidth={4} className="text-white" />
                        )}
                      </div>
                    </div>
                    {/* Removed module-bg overlay */}
                  </button>
                );
              })}
            </div>
          </section>

          <section>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">选择翻牌形式</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setConfig(prev => ({ ...prev, mode: 'RANDOM' }))}
                className={`group p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden ${
                  config.mode === 'RANDOM' 
                    ? `${themeBorder} ${themeBg} text-white shadow-lg shadow-${themeColor}-200` 
                    : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`p-3 rounded-2xl w-fit transition-colors ${config.mode === 'RANDOM' ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <Layers size={24} />
                </div>
                <div>
                  <span className="font-black text-xl block">随机抽取</span>
                  <span className={`text-xs mt-1 block font-medium ${config.mode === 'RANDOM' ? 'text-white/70' : 'text-gray-400'}`}>从卡池中随机抽取指定数量卡牌</span>
                </div>
                {/* Removed dot indicator */}
              </button>
              <button
                onClick={() => setConfig(prev => ({ ...prev, mode: 'CUSTOM' }))}
                className={`group p-8 rounded-3xl border-2 transition-all text-left flex flex-col gap-4 relative overflow-hidden ${
                  config.mode === 'CUSTOM' 
                    ? `${themeBorder} ${themeBg} text-white shadow-lg shadow-${themeColor}-200` 
                    : 'border-gray-100 bg-gray-50/50 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`p-3 rounded-2xl w-fit transition-colors ${config.mode === 'CUSTOM' ? 'bg-white/20' : 'bg-gray-100'}`}>
                  <Grid size={24} />
                </div>
                <div>
                  <span className="font-black text-xl block">自定义翻牌</span>
                  <span className={`text-xs mt-1 block font-medium ${config.mode === 'CUSTOM' ? 'text-white/70' : 'text-gray-400'}`}>所有卡牌罗列在桌面，由玩家点击翻开</span>
                </div>
                {/* Removed dot indicator */}
              </button>
            </div>
          </section>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={initGame}
            className={`w-full py-6 ${themeBg} text-white rounded-3xl font-black text-xl shadow-xl hover:brightness-110 transition-all mt-4`}
          >
            开始游戏
          </motion.button>
        </div>
      </div>
    );
  };

  const renderPlay = () => {
    const isFinished = config.mode === 'RANDOM' ? cards.length === 0 : cards.every(c => c.isFlipped);
    const themeColor = currentTheme === 'LOVER' ? 'rose' : 'blue';

    return (
      <div className="flex flex-col items-center gap-8 p-4 min-h-[80vh] relative z-10">
        {config.mode === 'RANDOM' ? (
          <div className="flex flex-col items-center gap-12 w-full max-w-4xl">
            {/* Card Stack */}
            <div className="relative w-64 h-96 mt-12">
              <AnimatePresence>
                {cards.length > 0 ? (
                  <>
                    {/* Simulated Deck Layers */}
                    <div className={`absolute inset-0 ${currentTheme === 'LOVER' ? 'bg-rose-100' : 'bg-blue-100'} rounded-[2rem] translate-x-[8px] translate-y-[8px] shadow-sm border ${currentTheme === 'LOVER' ? 'border-rose-200' : 'border-blue-200'}`} />
                    <div className={`absolute inset-0 ${currentTheme === 'LOVER' ? 'bg-rose-50' : 'bg-blue-50'} rounded-[2rem] translate-x-[4px] translate-y-[4px] shadow-sm border ${currentTheme === 'LOVER' ? 'border-rose-100' : 'border-blue-100'}`} />
                    
                    {Array.from({ length: Math.min(3, cards.length) }).map((_, i) => (
                      <motion.div
                        key={`stack-${i}`}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                          scale: 1, 
                          y: -i * 3, 
                          x: -i * 1.5,
                          opacity: 1,
                          rotate: i * 0.5
                        }}
                        className={`absolute inset-0 ${currentTheme === 'LOVER' ? 'bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600' : 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600'} rounded-[2rem] shadow-2xl border-2 border-white/90 flex items-center justify-center overflow-hidden`}
                      >
                        {/* Intricate Card Back Pattern */}
                        <div className="absolute inset-0 opacity-[0.15]">
                          <svg width="100%" height="100%">
                            <defs>
                              <pattern id="card-pattern-complex-stack" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="20" cy="20" r="18" fill="none" stroke="white" strokeWidth="0.5" />
                                <circle cx="20" cy="20" r="12" fill="none" stroke="white" strokeWidth="0.5" />
                                <path d="M20 2 L20 38 M2 20 L38 20" stroke="white" strokeWidth="0.5" />
                                <path d="M7.27 7.27 L32.73 32.73 M7.27 32.73 L32.73 7.27" stroke="white" strokeWidth="0.5" />
                              </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#card-pattern-complex-stack)" />
                          </svg>
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center gap-6">
                          <div className="p-6 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-2xl">
                            {currentTheme === 'LOVER' ? <Heart size={72} className="text-white" fill="currentColor" /> : <Users size={72} className="text-white" fill="currentColor" />}
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-white/40 text-[10px] font-black tracking-[0.6em] uppercase">DEEP DIALOGUE</span>
                            <div className="h-px w-12 bg-white/20 mt-2" />
                          </div>
                        </div>
                        
                        <div className="absolute inset-4 border border-white/10 rounded-[1.5rem]" />
                      </motion.div>
                    ))}
                  </>
                ) : (
                  <div className="absolute inset-0 border-4 border-dashed border-gray-300 rounded-[2rem] flex items-center justify-center text-gray-400 font-bold">
                    卡牌已抽完
                  </div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex flex-col items-center gap-6 w-full">
              <div className="flex items-center gap-4 bg-white p-3 rounded-[2rem] shadow-xl border border-gray-100">
                <span className="text-sm font-bold text-gray-500 ml-4">抽取数量:</span>
                <input 
                  type="number" 
                  min="1" 
                  max="10" 
                  value={drawCount} 
                  onChange={(e) => setDrawCount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                  className={`w-16 p-2 text-center font-bold text-${themeColor}-800 bg-${themeColor}-50 rounded-2xl focus:outline-none`}
                />
                <button 
                  onClick={drawCards}
                  disabled={cards.length === 0}
                  className={`px-10 py-4 bg-${themeColor}-500 text-white rounded-2xl font-black shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-${themeColor}-600 transition-all hover:scale-105 active:scale-95`}
                >
                  抽取卡牌
                </button>
              </div>
              <p className="text-sm text-gray-500 font-bold bg-white px-4 py-1.5 rounded-full shadow-sm border border-gray-100">
                剩余卡牌: <span className={`text-${themeColor}-500`}>{cards.length}</span>
              </p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => setShowHistory(true)}
                className="flex items-center gap-2 px-8 py-4 bg-white border-2 border-gray-100 rounded-[2rem] text-gray-600 font-black hover:bg-gray-50 transition-all shadow-md hover:shadow-lg"
              >
                <History size={24} /> 查看历史
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-12 w-full max-w-7xl pb-32">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 w-full">
              {cards.map((card) => (
                <motion.div
                  key={card.id}
                  layout
                  onClick={() => {
                    if (!card.isFlipped) {
                      flipCard(card.id);
                    } else {
                      setZoomedCard(card);
                    }
                  }}
                  className="aspect-[3/4] cursor-pointer perspective-1000"
                >
                  <motion.div
                    animate={{ rotateY: card.isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
                    className="relative w-full h-full transform-style-3d"
                  >
                    {/* Front (Back of card) */}
                    <div className={`absolute inset-0 backface-hidden ${currentTheme === 'LOVER' ? 'bg-gradient-to-br from-rose-400 via-rose-500 to-rose-600' : 'bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600'} rounded-[1.5rem] border-2 border-white/80 shadow-xl flex items-center justify-center overflow-hidden`}>
                      <div className="absolute inset-0 opacity-[0.12]">
                        <svg width="100%" height="100%">
                          <defs>
                            <pattern id={`card-pattern-complex-${card.id}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                              <circle cx="20" cy="20" r="18" fill="none" stroke="white" strokeWidth="0.5" />
                              <circle cx="20" cy="20" r="12" fill="none" stroke="white" strokeWidth="0.5" />
                              <path d="M20 2 L20 38 M2 20 L38 20" stroke="white" strokeWidth="0.5" />
                              <path d="M7.27 7.27 L32.73 32.73 M7.27 32.73 L32.73 7.27" stroke="white" strokeWidth="0.5" />
                            </pattern>
                          </defs>
                          <rect width="100%" height="100%" fill={`url(#card-pattern-complex-${card.id})`} />
                        </svg>
                      </div>
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
                          {currentTheme === 'LOVER' ? <Heart size={32} className="text-white" fill="currentColor" /> : <Users size={32} className="text-white" fill="currentColor" />}
                        </div>
                        <span className="text-white/40 text-[8px] font-black tracking-[0.4em] uppercase">DEEP DIALOGUE</span>
                      </div>
                      <div className="absolute inset-3 border border-white/10 rounded-[1rem]" />
                    </div>
                    {/* Back (Front of card) */}
                    <div className="absolute inset-0 backface-hidden bg-white rounded-[1.5rem] border-2 border-gray-100 shadow-xl p-6 flex flex-col justify-between items-center text-center rotate-y-180 overflow-hidden">
                      {/* Corner Decorations */}
                      <div className={`absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 ${currentTheme === 'LOVER' ? 'border-rose-100' : 'border-blue-100'} rounded-tl-md`} />
                      <div className={`absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 ${currentTheme === 'LOVER' ? 'border-rose-100' : 'border-blue-100'} rounded-tr-md`} />
                      <div className={`absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 ${currentTheme === 'LOVER' ? 'border-rose-100' : 'border-blue-100'} rounded-bl-md`} />
                      <div className={`absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 ${currentTheme === 'LOVER' ? 'border-rose-100' : 'border-blue-100'} rounded-br-md`} />

                      <div className="flex flex-col items-center mt-2">
                        <div className={`p-2 ${currentTheme === 'LOVER' ? 'bg-rose-50 text-rose-400' : 'bg-blue-50 text-blue-400'} rounded-xl mb-2 shadow-sm`}>
                          {currentTheme === 'LOVER' ? <Heart size={20} /> : <Users size={20} />}
                        </div>
                        <span className={`text-[8px] font-black ${currentTheme === 'LOVER' ? 'text-rose-300' : 'text-blue-300'} uppercase tracking-[0.2em] mb-1`}>{card.module}</span>
                        <div className={`w-6 h-0.5 ${currentTheme === 'LOVER' ? 'bg-rose-100' : 'bg-blue-100'} rounded-full`} />
                      </div>
                      <p className="text-sm font-black text-gray-800 leading-tight px-2 drop-shadow-sm">{card.question}</p>
                      <div className="mb-2">
                        <span className="text-[8px] font-bold text-gray-300 tracking-widest uppercase opacity-40">Auxiliary Cards</span>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={flipAll}
                className={`flex items-center gap-3 px-10 py-5 bg-${themeColor}-500 text-white rounded-[2rem] font-black shadow-xl hover:bg-${themeColor}-600 transition-all hover:scale-105 active:scale-95`}
              >
                <Layers size={24} /> 翻开全部
              </button>
            </div>
          </div>
        )}

        {isFinished && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white p-6 rounded-3xl shadow-2xl border border-gray-100 flex flex-col items-center gap-4 z-40"
          >
            <h4 className="text-xl font-bold text-gray-900">游戏结束</h4>
            <div className="flex gap-4">
              <button onClick={resetGame} className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">
                <RotateCcw size={20} /> 重新开始
              </button>
              <button onClick={returnHome} className="flex items-center gap-2 px-6 py-3 bg-gray-900 rounded-xl font-bold text-white hover:bg-black transition-colors">
                <Home size={20} /> 返回首页
              </button>
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${currentTheme === 'LOVER' ? 'bg-rose-50/30' : currentTheme === 'FRIEND' ? 'bg-blue-50/30' : 'bg-[#FDFDFD]'} text-gray-900 font-sans selection:bg-gray-900 selection:text-white overflow-x-hidden transition-colors duration-700`}>
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Animated Color Blobs */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            x: [0, 150, 0],
            y: [0, 80, 0],
            rotate: [0, 180, 0]
          }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-30%] left-[-30%] w-[100%] h-[100%] bg-blue-200/30 blur-[180px] rounded-full"
        />
        <motion.div
          animate={{
            scale: [1.4, 1, 1.4],
            x: [0, -150, 0],
            y: [0, -80, 0],
            rotate: [0, -180, 0]
          }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-30%] right-[-30%] w-[100%] h-[100%] bg-rose-200/30 blur-[180px] rounded-full"
        />
        <motion.div
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-purple-100/10 blur-[250px] rounded-full"
        />
        
        {/* Animated Line */}
        <div className="absolute inset-0">
          <motion.div
            initial={{ x: '-100%', y: '50%', rotate: -2 }}
            animate={{ x: '250%' }}
            transition={{ 
              duration: 25, 
              repeat: Infinity, 
              ease: "linear"
            }}
            className={`absolute w-full h-[1px] bg-gradient-to-r from-transparent ${currentTheme === 'LOVER' ? 'via-rose-400/40' : currentTheme === 'FRIEND' ? 'via-blue-400/40' : 'via-gray-400/30'} to-transparent`}
          />
        </div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 p-4 md:p-6 flex justify-between items-center ${currentTheme === 'LOVER' ? 'bg-rose-50/90 border-rose-100/50' : currentTheme === 'FRIEND' ? 'bg-blue-50/90 border-blue-100/50' : 'bg-white/80 border-gray-100/50'} backdrop-blur-2xl border-b transition-all duration-700`}>
        <div className="flex items-center gap-3 cursor-pointer group" onClick={returnHome}>
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-200"
          >
            <Layers size={28} />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-black text-2xl tracking-tighter leading-none">DEEP DIALOGUE</span>
            <span className="text-[10px] font-black text-gray-400 tracking-[0.4em] uppercase mt-1">辅助牌系统</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {gameStep === 'HOME' && (
            <>
              <button 
                onClick={() => setShowRules(true)}
                className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2 font-black text-sm"
              >
                <Info size={20} /> <span className="hidden sm:inline">游戏规则</span>
              </button>
              <button 
                onClick={() => setShowActivation(true)}
                className="p-4 bg-gray-900 text-white rounded-2xl hover:bg-black transition-all shadow-xl flex items-center gap-2 font-black text-sm"
              >
                <Key size={20} /> <span className="hidden sm:inline">激活界面</span>
              </button>
            </>
          )}
        </div>
      </header>

      <main className="pt-32 pb-20 px-4 relative z-10">
        <AnimatePresence mode="wait">
          {gameStep === 'HOME' && (
            <motion.div key="home" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderHome()}
            </motion.div>
          )}
          {gameStep === 'CONFIG' && (
            <motion.div key="config" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              {renderConfig()}
            </motion.div>
          )}
          {gameStep === 'PLAY' && (
            <motion.div key="play" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {renderPlay()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Modals */}
      <Modal isOpen={showThemeRules} onClose={() => setShowThemeRules(false)} title={`${currentTheme === 'LOVER' ? '你好爱人' : '你好朋友'} - 游戏规则`}>
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h4 className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <div className={`w-2 h-6 bg-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-600 rounded-full`} />
              推荐聊法
            </h4>
            <div className="space-y-5">
              <div className={`p-4 rounded-2xl bg-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-50/50 border border-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-100`}>
                <p className={`font-black text-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-900 mb-1`}>单人聊法：</p>
                <p className="text-sm">适合自我梳理与反思。抽牌盲答：随机抽取卡牌回答；牌面全开：找到有感觉的内容回答。</p>
              </div>
              <div className={`p-4 rounded-2xl bg-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-50/50 border border-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-100`}>
                <p className={`font-black text-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-900 mb-1`}>双人聊法：</p>
                <ul className="list-disc list-inside text-sm space-y-2 mt-2">
                  <li><span className="font-bold">一题一答：</span>随机抽取1张回答。</li>
                  <li><span className="font-bold">三问一追：</span>抽取3张，回答后可追问。</li>
                  <li><span className="font-bold">多里挑一：</span>抽取多张，从中选择1题。</li>
                  <li><span className="font-bold">百里挑一：</span>牌面全开，从中选择1题。</li>
                </ul>
              </div>
              
              {currentTheme === 'FRIEND' ? (
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <Info className="text-blue-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-blue-800 font-medium">注意：本卡牌非“纯娱乐向”，更适合关系紧密、愿意深度交流的友谊小分队。</p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                  <Heart className="text-rose-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-rose-800 font-medium">建议：在安静、私密的环境下进行。保持诚实与脆弱，这是建立深层亲密感的关键。</p>
                </div>
              )}
            </div>
          </section>
          <button 
            onClick={() => setShowThemeRules(false)}
            className={`w-full py-5 bg-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-500 text-white rounded-2xl font-black mt-4 hover:bg-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-600 transition-all shadow-lg shadow-${currentTheme === 'LOVER' ? 'rose' : 'blue'}-200`}
          >
            开始探索
          </button>
        </div>
      </Modal>

      <Modal isOpen={showRules} onClose={() => setShowRules(false)} title="深度对话辅助牌 - 游戏规则">
        <div className="space-y-6 text-gray-600 leading-relaxed">
          <section>
            <h4 className="font-bold text-gray-900 mb-2">关于游戏</h4>
            <p>这是一款旨在促进深度交流的卡牌游戏。通过精心设计的问题，帮助你与朋友或伴侣建立更深的情感联结，探索未曾触及的话题。</p>
          </section>
          <section>
            <h4 className="font-bold text-gray-900 mb-2">玩法推荐</h4>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-bold text-gray-800">单人聊法：</span>适合自我梳理与反思，作为寻找灵感、丰满故事的工具。</li>
              <li><span className="font-bold text-gray-800">双人聊法：</span>建议引入“跳过”机制，充分尊重每个“跳过”的决定，不追问、不责怪。</li>
              <li><span className="font-bold text-gray-800">多人聊法：</span>适合关系紧密的友谊小分队，非纯娱乐向，适合深度社交。</li>
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-gray-900 mb-2">游戏模式</h4>
            <ul className="list-disc list-inside space-y-2">
              <li><span className="font-bold text-gray-800">随机抽取：</span>每次抽取1-10张，适合盲抽盲答。</li>
              <li><span className="font-bold text-gray-800">自定义翻牌：</span>牌面罗列在桌面，由你选择想回答的内容。</li>
            </ul>
          </section>
          <button 
            onClick={() => setShowRules(false)}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold mt-4 hover:bg-black transition-colors"
          >
            开始探索
          </button>
        </div>
      </Modal>

      <Modal isOpen={showActivation} onClose={() => { setShowActivation(false); setActivationError(''); }} title="激活游戏内容">
        <div className="space-y-6">
          <p className="text-gray-500">请输入激活码以解锁对应的卡牌主题。激活后在本次访问期间有效。</p>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">激活码</label>
            <input 
              type="text" 
              value={activationCode}
              onChange={(e) => { setActivationCode(e.target.value); setActivationError(''); }}
              placeholder="输入激活码..."
              className={`w-full p-4 bg-gray-50 border-2 ${activationError ? 'border-red-500' : 'border-gray-100'} rounded-2xl focus:border-gray-900 focus:outline-none transition-all font-mono`}
            />
            {activationError && (
              <motion.p 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-xs font-bold flex items-center gap-1 mt-1"
              >
                <X size={14} /> {activationError}
              </motion.p>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={handleActivate}
              className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-colors"
            >
              确认激活
            </button>
            <button 
              onClick={() => setShowActivation(false)}
              className="w-full py-4 bg-gray-100 text-gray-600 rounded-2xl font-bold hover:bg-gray-200 transition-colors"
            >
              稍后激活
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showHistory} onClose={() => setShowHistory(false)} title="已抽取的卡牌">
        <div className="space-y-4">
          {drawnCards.length === 0 ? (
            <p className="text-center text-gray-400 py-8">暂无抽取历史</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {[...drawnCards].reverse().map((card, i) => (
                <div key={`history-${i}`} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{card.module}</span>
                  <p className="text-gray-800 font-medium">{card.question}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <AnimatePresence>
        {zoomedCard && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
            onClick={() => setZoomedCard(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="w-full max-w-sm aspect-[3/4] bg-white rounded-[2.5rem] border-4 border-white shadow-2xl p-10 flex flex-col justify-between items-center text-center relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Corner Decorations */}
              <div className={`absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 ${currentTheme === 'LOVER' ? 'border-rose-100' : 'border-blue-100'} rounded-tl-xl`} />
              <div className={`absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 ${currentTheme === 'LOVER' ? 'border-rose-100' : 'border-blue-100'} rounded-tr-xl`} />
              <div className={`absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 ${currentTheme === 'LOVER' ? 'border-rose-100' : 'border-blue-100'} rounded-bl-xl`} />
              <div className={`absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 ${currentTheme === 'LOVER' ? 'border-rose-100' : 'border-blue-100'} rounded-br-xl`} />

              <div className="flex flex-col items-center mt-6">
                <div className={`p-5 ${currentTheme === 'LOVER' ? 'bg-rose-50 text-rose-400' : 'bg-blue-50 text-blue-400'} rounded-3xl mb-4 shadow-sm`}>
                  {currentTheme === 'LOVER' ? <Heart size={48} /> : <Users size={48} />}
                </div>
                <span className={`text-xs font-black ${currentTheme === 'LOVER' ? 'text-rose-300' : 'text-blue-300'} uppercase tracking-[0.4em] mb-2`}>{zoomedCard.module}</span>
                <div className={`w-12 h-1 ${currentTheme === 'LOVER' ? 'bg-rose-100' : 'bg-blue-100'} rounded-full`} />
              </div>

              <p className="text-2xl font-black text-gray-800 leading-tight px-4 drop-shadow-sm">{zoomedCard.question}</p>

              <div className="mb-6">
                <span className="text-[10px] font-bold text-gray-300 tracking-[0.3em] uppercase opacity-40">Deep Dialogue System</span>
              </div>

              <button 
                onClick={() => setZoomedCard(null)}
                className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
              >
                <X size={20} />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {currentBatch.length > 0 && config.mode === 'RANDOM' && (
          <div className={`fixed inset-0 z-[60] flex flex-col ${currentTheme === 'LOVER' ? 'bg-rose-800/90' : 'bg-blue-800/90'} backdrop-blur-2xl`}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-white font-black text-xl">抽取结果 ({currentBatch.length})</h3>
              <button 
                onClick={() => setCurrentBatch([])}
                className="p-3 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"
              >
                <X size={24} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto pb-12">
                {currentBatch.map((card, idx) => (
                  <motion.div 
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.4 }}
                    className="bg-white rounded-[2rem] aspect-[3/4] shadow-2xl p-8 flex flex-col justify-between items-center text-center relative overflow-hidden border-4 border-white/50"
                  >
                    <div className="flex flex-col items-center mt-2">
                      <div className={`p-3 ${currentTheme === 'LOVER' ? 'bg-rose-50 text-rose-300' : 'bg-blue-50 text-blue-300'} rounded-2xl mb-3`}>
                        {currentTheme === 'LOVER' ? <Heart size={36} /> : <Users size={36} />}
                      </div>
                      <span className={`text-[10px] font-black ${currentTheme === 'LOVER' ? 'text-rose-200' : 'text-blue-200'} uppercase tracking-[0.4em] mb-2`}>{card.module}</span>
                      <div className={`w-8 h-1 ${currentTheme === 'LOVER' ? 'bg-rose-50' : 'bg-blue-50'} rounded-full`} />
                    </div>
                    
                    <h3 className="text-lg md:text-xl font-black text-gray-800 leading-tight px-2">
                      {card.question}
                    </h3>

                    <div className="mb-2">
                      <span className="text-[9px] font-bold text-gray-300 tracking-widest uppercase opacity-60">Deep Dialogue Auxiliary</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <div className="p-6 border-t border-white/10 flex justify-center">
              <button 
                onClick={() => setCurrentBatch([])}
                className="px-16 py-4 bg-white text-gray-900 rounded-[2rem] font-black hover:bg-gray-100 transition-all shadow-2xl flex items-center gap-3"
              >
                关闭展示
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}} />
    </div>
  );
}
