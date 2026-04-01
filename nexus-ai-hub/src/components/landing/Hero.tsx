'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { addMessage, setOnboardPhase, setObDone, ChatAttachment } from '@/store/chatSlice';
import { showToast } from '@/store/appSlice';
import { FiSearch, FiMic, FiArrowRight, FiUpload } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const QUICK_CHIPS = [
  '🧠 Best for coding',
  '💰 Cheapest vision',
  '⚡ Fastest chatbot',
  '🔬 Open source',
  '📊 GPT vs Claude',
];

const ACTION_GRID = [
  { icon: '💬', label: 'Chat with any model' },
  { icon: '🔍', label: 'Compare models' },
  { icon: '🤖', label: 'Build an agent' },
  { icon: '📊', label: 'Analyse data' },
  { icon: '🖼', label: 'Generate images' },
  { icon: '✦', label: 'Explore more', dashed: true },
];

export default function Hero() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSearch = () => {
    if (query.trim() || attachments.length > 0) {
      dispatch(addMessage({
        id: Date.now().toString(),
        role: 'user',
        content: query.trim() || `Attached ${attachments.length} file${attachments.length > 1 ? 's' : ''}`,
        attachments: attachments.length > 0 ? attachments : undefined,
        timestamp: Date.now()
      }));
      dispatch(setOnboardPhase('chat'));
      dispatch(setObDone(true));
      setQuery('');
      setAttachments([]);
    }
    router.push('/chat');
  };

  const startVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      dispatch(showToast('Voice input is not supported in this browser.'));
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results).map((r: any) => r[0].transcript).join('');
        setQuery(transcript);
      };
      recognition.onerror = () => setMicActive(false);
      recognition.onend = () => setMicActive(false);
      recognitionRef.current = recognition;
      recognition.start();
      setMicActive(true);
      dispatch(showToast('Listening...'));
    } catch {
      setMicActive(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const picked = Array.from(files);
    if (picked.some(f => f.size > 10 * 1024 * 1024)) {
      dispatch(showToast('One or more files are too large (max 10MB).'));
      return;
    }
    const newAttachs: ChatAttachment[] = picked.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream'
    }));
    setAttachments(prev => [...prev, ...newAttachs]);
    dispatch(showToast(`${picked.length} file(s) attached.`));
  };

  const handleChip = (chip: string) => {
    const text = chip.replace(/^[^\s]+ /, '');
    dispatch(addMessage({ id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() }));
    dispatch(setOnboardPhase('chat'));
    dispatch(setObDone(true));
    router.push('/chat');
  };

  return (
    <section
      className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8 pt-14 sm:pt-20 pb-10 sm:pb-12 text-center relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(200,98,42,0.07) 0%, transparent 70%)' }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.14) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-1.5 bg-white border border-black/[0.14] rounded-full px-3 sm:px-4 py-1.5 text-[0.72rem] sm:text-[0.78rem] text-text2 mb-6 sm:mb-8 shadow-card relative z-10"
      >
        <span className="w-1.5 h-1.5 bg-green rounded-full animate-pulse flex-shrink-0" />
        220+ AI models · Updated weekly
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="font-syne font-bold text-text1 leading-[1.05] max-w-[90vw] sm:max-w-[700px] md:max-w-[800px] mb-4 sm:mb-5 relative z-10 px-2"
        style={{ fontSize: 'clamp(2rem, 7vw, 5.5rem)', letterSpacing: '-0.04em' }}
      >
        Discover, Compare &{' '}
        <span className="text-accent">Deploy</span> AI Models
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-[0.9rem] sm:text-[1.05rem] text-text2 max-w-[90vw] sm:max-w-[500px] mb-8 sm:mb-12 relative z-10 px-2"
      >
        The AI model hub trusted by 50,000+ developers. Find the perfect model for any task.
      </motion.p>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-[95vw] sm:max-w-[680px] relative z-10 mb-4 sm:mb-5 px-2 sm:px-0"
      >
        <div
          className={`bg-white border-[1.5px] rounded-[28px] shadow-md transition-all ${
            focused ? 'border-accent shadow-[0_0_0_4px_rgba(200,98,42,0.1)]' : 'border-black/[0.14]'
          }`}
        >
          <div className="flex items-center min-h-[52px] sm:min-h-[58px] relative">
            {attachments.length > 0 && (
              <div className="absolute -top-7 left-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="bg-accent text-white text-[0.65rem] font-bold px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 grayscale-[0.2]">
                  <FiUpload size={10} /> {attachments.length} file{attachments.length > 1 ? 's' : ''} attached
                </span>
              </div>
            )}
            <FiSearch size={15} className="ml-4 sm:ml-5 text-text3 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search AI models or describe your use case..."
              className="flex-1 px-2 sm:px-3 py-3 sm:py-4 text-[0.85rem] sm:text-[0.98rem] bg-transparent outline-none text-text1 placeholder:text-text3 font-instrument min-w-0"
            />
            {/* Hide icons on small screens */}
            <div className="hidden sm:flex items-center gap-0.5 px-1.5 flex-shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                onClick={startVoiceInput}
                className={`w-[34px] h-[34px] rounded-full flex items-center justify-center transition-all ${micActive ? 'text-accent bg-accent-lt animate-pulse' : 'text-text3 hover:bg-bg2 hover:text-text1'}`}
              >
                <FiMic size={17} />
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-text3 hover:bg-bg2 hover:text-text1 transition-all"
              >
                <FiUpload size={17} />
              </button>
            </div>
            <div className="hidden sm:block w-px h-5 bg-black/[0.14] mx-1.5" />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSearch}
              className="bg-accent text-white flex items-center gap-1 sm:gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-[22px] text-[0.78rem] sm:text-[0.875rem] font-medium mr-1.5 hover:bg-accent2 transition-colors border-none cursor-pointer font-instrument whitespace-nowrap"
            >
              Search <FiArrowRight size={12} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Quick chips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap gap-1.5 sm:gap-2 justify-center mb-10 sm:mb-14 relative z-10 px-3 sm:px-0 max-w-[95vw] sm:max-w-none"
      >
        {QUICK_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => handleChip(chip)}
            className="bg-white border border-black/[0.14] rounded-full px-3 sm:px-4 py-1.5 text-[0.73rem] sm:text-[0.8rem] text-text2 cursor-pointer shadow-card hover:bg-accent-lt hover:border-accent hover:text-accent transition-all font-instrument"
          >
            {chip}
          </button>
        ))}
      </motion.div>

      {/* Action grid — 3 cols on mobile, 6 cols on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-2.5 w-full max-w-[95vw] sm:max-w-[740px] mx-auto mb-10 sm:mb-14 relative z-10 px-2 sm:px-0"
      >
        {ACTION_GRID.map((a) => (
          <motion.button
            key={a.label}
            whileHover={{ y: -2, boxShadow: '0 6px 18px rgba(200,98,42,0.14)' }}
            onClick={() => router.push('/chat')}
            className={`flex flex-col items-center gap-1 sm:gap-1.5 bg-white border-[1.5px] border-black/[0.14] rounded-lg px-2 sm:px-4 py-3 sm:py-3.5 cursor-pointer transition-all shadow-card hover:bg-accent-lt hover:border-accent font-instrument ${
              a.dashed ? 'border-dashed bg-bg' : ''
            }`}
            style={{ borderRadius: 16 }}
          >
            <span className="text-xl sm:text-[1.4rem] leading-none">{a.icon}</span>
            <span className="text-[0.62rem] sm:text-[0.76rem] font-semibold text-text1 text-center leading-[1.3]">{a.label}</span>
          </motion.button>
        ))}
      </motion.div>

      {/* Stats — responsive gap */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="grid grid-cols-3 gap-6 sm:gap-12 justify-center relative z-10 w-full max-w-[360px] sm:max-w-none sm:w-auto"
      >
        {[
          { value: '220+', label: 'AI Models' },
          { value: '28+', label: 'AI Labs' },
          { value: '50K+', label: 'Developers' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <strong className="block font-syne text-[1.5rem] sm:text-[2rem] font-bold text-text1">{s.value}</strong>
            <span className="text-[0.7rem] sm:text-[0.78rem] text-text3">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
