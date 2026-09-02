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
        {/* Intro blurb above the cards, right under the header, so visitors
            see who I am without having to click into a box. Replaces the
            standalone About card, which has been removed. */}
        <p className="max-w-2xl mx-auto text-center text-lg leading-relaxed text-gray-800 mb-10">
          I am a fifth-year Ph.D. in{' '}
          <a
            href="https://cam.uchicago.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Computational and Applied Mathematics
          </a>{' '}
          at University of Chicago, advised by{' '}
          <a
            href="https://www.stat.uchicago.edu/~lekheng/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Lek-Heng Lim
          </a>
          .
        </p>
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
