'use client';

import { useDispatch } from 'react-redux';
import { openApp } from '@/store/appSlice';
import { FiZap, FiTwitter, FiGithub, FiLinkedin } from 'react-icons/fi';

export default function Footer() {
  const dispatch = useDispatch();

  const links = {
    Product:   ['Marketplace', 'Chat Hub', 'Agent Builder', 'Research Feed'],
    Models:    ['OpenAI', 'Anthropic', 'Google', 'Meta'],
    Resources: ['Documentation', 'API Reference', 'Prompt Guide', 'Blog'],
    Company:   ['About', 'Careers', 'Privacy', 'Terms'],
  };

  return (
    <footer className="bg-text1 text-white">
      <div className="px-4 sm:px-8 md:px-10 py-12 sm:py-16">
        {/* Grid: brand full-width on mobile, then 5 cols on md */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8 mb-10 sm:mb-12">
          {/* Brand — full row on mobile */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <button
              onClick={() => dispatch(openApp('chat'))}
              className="flex items-center gap-2 font-syne text-lg sm:text-xl font-bold text-white mb-3 cursor-pointer"
              style={{ letterSpacing: '-0.03em' }}
            >
              <div className="w-6 h-6 bg-accent rounded-[5px] flex items-center justify-center">
                <FiZap size={12} className="text-white" />
              </div>
              NexusAI
            </button>
            <p className="text-[0.78rem] text-white/50 leading-relaxed mb-4 max-w-[240px]">
              The AI model hub trusted by 50,000+ developers worldwide.
            </p>
            <div className="flex gap-2 sm:gap-3">
              {[FiTwitter, FiGithub, FiLinkedin].map((Icon, i) => (
                <button key={i} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors border-none cursor-pointer">
                  <Icon size={15} />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([cat, items]) => (
            <div key={cat}>
              <div className="font-semibold text-[0.72rem] text-white/40 uppercase tracking-wider mb-3 sm:mb-4">{cat}</div>
              <ul className="space-y-2 sm:space-y-2.5">
                {items.map((item) => (
                  <li key={item}>
                    <button className="text-[0.8rem] sm:text-[0.83rem] text-white/60 hover:text-white transition-colors cursor-pointer border-none bg-none font-instrument text-left">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[0.75rem] text-white/40">© 2026 NexusAI. All rights reserved.</p>
          <p className="text-[0.75rem] text-white/40">Built for developers, by developers.</p>
        </div>
      </div>
    </footer>
  );
}
