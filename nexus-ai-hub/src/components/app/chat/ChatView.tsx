'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSidebar, FiLayout, FiX } from 'react-icons/fi';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import ChatInput from './ChatInput';
import ChatRightPanel from './ChatRightPanel';
import { useTranslation } from 'react-i18next';

export default function ChatView() {
  const { t } = useTranslation();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);

  return (
    <div className="flex flex-1 overflow-hidden relative">
      {/* Desktop sidebar (always visible ≥ lg) */}
      <div className="hidden lg:flex">
        <ChatSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />
            <motion.div
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <ChatSidebar />
                <button
                  onClick={() => setShowSidebar(false)}
                  className="absolute top-3 right-[-40px] w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-black/[0.08]"
                >
                  <FiX size={15} className="text-text2" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main chat column */}
      <div className="flex-1 flex flex-col overflow-hidden bg-bg">
        {/* Mobile toolbar (toggle sidebar / right panel) */}
        <div className="flex lg:hidden items-center justify-between px-3 py-2 bg-white border-b border-black/[0.08] flex-shrink-0">
          <button
            onClick={() => setShowSidebar(true)}
            className="flex items-center gap-1.5 text-[0.78rem] text-text2 border border-black/[0.14] rounded-lg px-2.5 py-1.5 hover:bg-bg2 transition-colors font-instrument"
          >
            <FiSidebar size={14} /> {t('chat.sidebar.models')}
          </button>
          <button
            onClick={() => setShowRightPanel(true)}
            className="flex items-center gap-1.5 text-[0.78rem] text-text2 border border-black/[0.14] rounded-lg px-2.5 py-1.5 hover:bg-bg2 transition-colors font-instrument"
          >
            <FiLayout size={14} /> {t('chat.right_panel.details')}
          </button>
        </div>

        <ChatArea />
        <ChatInput />
      </div>

      {/* Desktop right panel (always visible ≥ lg) */}
      <div className="hidden lg:flex">
        <ChatRightPanel />
      </div>

      {/* Mobile right panel overlay */}
      <AnimatePresence>
        {showRightPanel && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setShowRightPanel(false)}
            />
            <motion.div
              initial={{ x: 280 }} animate={{ x: 0 }} exit={{ x: 280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 z-50 lg:hidden"
            >
              <div className="relative h-full">
                <ChatRightPanel />
                <button
                  onClick={() => setShowRightPanel(false)}
                  className="absolute top-3 left-[-40px] w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border border-black/[0.08]"
                >
                  <FiX size={15} className="text-text2" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
