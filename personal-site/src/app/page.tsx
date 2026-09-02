"use client";
import { useCallback, useMemo, useState } from 'react';
import { VizCard, Viz } from '../components/VizCard';

export default function HomePage() {
  // Content for each section (beyond the title and its placeholder figure)
  // is being filled in one at a time - see VizCard's VizDescription/VizShader
  // for what each id currently renders.
  const items: Viz[] = useMemo(
    () => [
      { id: 'research', title: 'Research' },
      { id: 'papers', title: 'Papers' },
      { id: 'talks', title: 'Talks' },
      { id: 'academic-activities', title: 'Academic Activities' },
      { id: 'about-me', title: 'About Me' },
    ],
    []
  );

  const [openId, setOpenId] = useState<string | null>(null);

  const toggleViz = useCallback((id: string) => {
    setOpenId((current) => (current === id ? null : id));
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container-px mx-auto max-w-4xl py-16">
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
      </div>
    </div>
  );
}
