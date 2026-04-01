'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { hideToast } from '@/store/appSlice';

export default function Toast() {
  const dispatch = useDispatch();
  const { toastMessage, toastVisible } = useSelector((s: RootState) => s.app);

  useEffect(() => {
    if (toastVisible) {
      const t = setTimeout(() => dispatch(hideToast()), 3000);
      return () => clearTimeout(t);
    }
  }, [toastVisible, dispatch]);

  return (
    <AnimatePresence>
      {toastVisible && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-text1/90 text-white px-5 py-2.5 rounded-full text-[0.79rem] shadow-lg whitespace-nowrap pointer-events-none"
        >
          {toastMessage}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
