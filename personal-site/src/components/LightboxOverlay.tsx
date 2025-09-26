"use client";
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type Item = {
  id: string;
  title: string;
  caption?: string;
};

type Props = {
  items: Item[];
  currentId?: string | null;
  onClose: () => void;
  onChange: (id: string) => void;
};

export function LightboxOverlay({ items, currentId, onClose, onChange }: Props) {
  const index = currentId ? items.findIndex((i) => i.id === currentId) : -1;
  const item = index >= 0 ? items[index] : null;
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
      if (!item) return;
      if (e.key === 'ArrowRight') {
        const next = items[(index + 1) % items.length];
        onChange(next.id);
      }
      if (e.key === 'ArrowLeft') {
        const prev = items[(index - 1 + items.length) % items.length];
        onChange(prev.id);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [index, item, items, onChange, onClose]);

  useEffect(() => {
    if (currentId) closeRef.current?.focus();
  }, [currentId]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key={item.id}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal
          role="dialog"
        >
          <button
            aria-label="Close"
            ref={closeRef}
            onClick={onClose}
            className="focus-ring absolute right-6 top-6 text-white hover:text-gray-300 font-medium uppercase text-sm tracking-wide"
          >
            Close
          </button>
          <div className="relative w-full max-w-7xl">
            <motion.div
              className="aspect-[16/9] w-full overflow-hidden bg-black"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <div className="h-full w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl sm:text-7xl font-grotesk font-bold tracking-tight text-white uppercase mb-4">
                    {item.title}
                  </div>
                  {item.caption && (
                    <div className="text-gray-300 text-lg">{item.caption}</div>
                  )}
                </div>
              </div>
            </motion.div>
            <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between">
              <button
                aria-label="Previous"
                onClick={() => onChange(items[(index - 1 + items.length) % items.length].id)}
                className="pointer-events-auto focus-ring ml-4 text-white hover:text-gray-300 font-bold text-2xl"
              >
                ←
              </button>
              <button
                aria-label="Next"
                onClick={() => onChange(items[(index + 1) % items.length].id)}
                className="pointer-events-auto focus-ring mr-4 text-white hover:text-gray-300 font-bold text-2xl"
              >
                →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


