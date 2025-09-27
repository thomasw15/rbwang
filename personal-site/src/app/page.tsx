"use client";
import { useCallback, useMemo, useState } from 'react';
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

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = useCallback((id: string) => {
    console.log('Toggle called with id:', id, 'current expandedId:', expandedId);
    setExpandedId(expandedId === id ? null : id);
  }, [expandedId]);

  return (
    <div className="pt-20 min-h-screen">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid grid-cols-12 gap-8 min-h-screen">
          {/* Left Column - Research Section */}
          <div className="col-span-4 flex flex-col justify-center py-20">
            <div className="mb-8">
              <h2 className="font-futura text-xs font-normal uppercase tracking-wider mb-6 flex items-center">
                Research
                <span className="ml-2 text-sm">↓</span>
              </h2>
              <div className="space-y-2">
                {items.map((viz, index) => (
                  <div key={viz.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-xs">{String(index + 1).padStart(3, '0')}</span>
                    <span className="font-futura font-normal uppercase tracking-wider">{viz.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Visualizations */}
          <div className="col-span-8 flex flex-col justify-center py-20">
            <div className="flex flex-col items-center justify-center space-y-6">
              {items.map((viz) => (
                <VizCard 
                  key={viz.id} 
                  viz={viz} 
                  isExpanded={expandedId === viz.id}
                  onToggle={toggleExpanded}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


