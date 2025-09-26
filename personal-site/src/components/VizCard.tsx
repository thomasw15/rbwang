"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { SimpleShader } from './SimpleShader';
import { Viz1Shader } from './Viz1Shader';
import { Viz2Shader } from './Viz2Shader';

export type Viz = {
  id: string;
  title: string;
  caption?: string;
};

type Props = {
  viz: Viz;
  isExpanded: boolean;
  onToggle: (id: string) => void;
};

export function VizCard({ viz, isExpanded, onToggle }: Props) {
  return (
    <motion.div
      className="w-full"
      initial={{ y: 8, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      {/* Clickable Card */}
      <motion.div
        onClick={() => {
          console.log('Card clicked:', viz.id);
          onToggle(viz.id);
        }}
        className="group w-full text-left focus-ring cursor-pointer"
        layout
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="relative overflow-hidden bg-white transition-colors w-full border border-gray-200 rounded-sm"
          layout
          style={{ height: isExpanded ? 384 : 96 }}
        >
          {/* Split layout: title left, preview right (always 1/2-1/2) */}
          <div className="absolute inset-0 flex">
            {/* Left column - Title / room for text */}
            <div className="w-1/2 flex items-center justify-start px-4">
              <span className="text-lg font-futura font-normal tracking-wider text-black uppercase text-left">
                {viz.title}
              </span>
            </div>

            {/* Right column - Shader preview centered */}
            <div className="w-1/2 h-full flex-shrink-0 relative overflow-hidden bg-transparent" style={{ filter: isExpanded ? 'none' : 'grayscale(100%)' }}>
              {viz.id === 'viz-1' ? (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', width: '100%', height: isExpanded ? '100%' : '384px' }}>
                  <Viz1Shader paused={!isExpanded} />
                </div>
              ) : viz.id === 'viz-2' ? (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', width: '100%', height: isExpanded ? '100%' : '384px' }}>
                  <Viz2Shader paused={!isExpanded} />
                </div>
              ) : viz.id === 'viz-3' ? (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', width: '100%', height: isExpanded ? '100%' : '384px' }}>
                  <SimpleShader paused={!isExpanded} />
                </div>
              ) : (
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <div className="text-xs text-gray-500 uppercase tracking-wider">Preview</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}


