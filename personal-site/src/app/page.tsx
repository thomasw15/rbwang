"use client";
import { useCallback, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { VizCard, Viz } from '../components/VizCard';

export default function HomePage() {
  const items: Viz[] = useMemo(
    () => [
      { id: 'viz-1', title: 'Divergent Matrix Series', caption: 'Divergent Matrix Series' },
      { id: 'viz-2', title: 'Unitary Invariance', caption: 'Unitarily Invariant norm' },
      { id: 'viz-3', title: 'Submanifold Optimization', caption: 'Submanifold Optimization' },
      { id: 'viz-4', title: 'Unbounded SVD', caption: 'Unbounded SVD' },
    ],
    []
  );

  const [openId, setOpenId] = useState<string | null>(null);

  const toggleViz = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  const anyOpen = openId !== null;

  return (
    <div className="min-h-screen">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid grid-cols-12 gap-8">
          {/* Left Column - Research description. Narrows to give the visualizations
              more room while one of them is expanded. */}
          <motion.div
            layout
            className={anyOpen ? 'col-span-3 flex flex-col justify-center py-16' : 'col-span-5 flex flex-col justify-center py-16'}
            transition={{ layout: { duration: 0.35, ease: 'easeInOut' } }}
          >
            <div className="mb-8">
              <h2 className="font-futura text-xs font-normal uppercase tracking-wider mb-6">
                Research
              </h2>
              <p className="text-lg leading-relaxed text-gray-800">
                My research centers around how symmetries and invariants show up in computations, which brings applications to various things including optimization, numerical linear algebra, and quantum computing.
              </p>
            </div>
          </motion.div>

          {/* Right Column - Visualizations. Widens to fill the room the left column gives up. */}
          <motion.div
            layout
            className={anyOpen ? 'col-span-9 flex flex-col justify-start py-16' : 'col-span-7 flex flex-col justify-start py-16'}
            transition={{ layout: { duration: 0.35, ease: 'easeInOut' } }}
          >
            <div className="flex flex-col items-center justify-center space-y-6">
              {items.map((viz) => (
                <VizCard
                  key={viz.id}
                  viz={viz}
                  isExpanded={openId === viz.id}
                  onToggle={toggleViz}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
