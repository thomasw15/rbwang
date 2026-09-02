"use client";
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SimpleShader } from './SimpleShader';
import { Viz1Shader } from './Viz1Shader';
import { Viz2Shader } from './Viz2Shader';
import { Viz4Shader } from './Viz4Shader';
import { Math } from './Math';

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

function VizDescription({ id }: { id: string }) {
  if (id === 'viz-1') {
    return (
      <div>
        <p className="mb-3">
          What's the sum of the series <Math>1-1+1-1+1-1+\cdots</Math>? Well, it's not summable, you would think. But what does convergence mean? That question has been answered in different ways by giants like Abel, Borel, and Hardy by proposing alternative definitions of summability. With them, we are able to sum all the ordinarily summable series to what they should be, and beyond. For example, the alternating series above becomes summable to <Math>1/2</Math>. The visualization on the right is a remote hint on why it is true. Better yet, these summation methods generalize to matrices, leading to some surprising phenomena.
        </p>
        <p>
          <a
            href="https://link.springer.com/article/10.1007/s00211-025-01493-4"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Read our paper in Numerische Mathematik
          </a>
        </p>
      </div>
    );
  }
  if (id === 'viz-2') {
    return (
      <div>
        <p className="mb-3">
          Solving the matrix nearness problem <Math>\lVert A-BXC\rVert</Math> for <Math>X</Math> with various constraints is a well-studied problem in the Frobenius norm. What about in other unitarily invariant norms like the spectral norm or the nuclear norm?
        </p>
        <p className="mb-3">
          Intuitions from the famous Eckart-Young-Mirsky theorem suggests that the optimal solutions should be the same for all unitarily invariant norms. On the contrary, it is not true. We found simple examples and developed efficient iterative algorithms solve the problem for unitarily invariant norms.
        </p>
      </div>
    );
  }
  if (id === 'viz-3') {
    return (
      <div>
        <p className="mb-3">
          How do I numerically optimize <Math>f(x)</Math> when <Math>x</Math> is constrained to lie on a manifold? This is when Riemannian optimization comes in. To utilize the tools from Riemannian geometry, we need to embed the manifold as numerically tractable object, i.e., matrices.
        </p>
        <p className="mb-3">
          In this work, we eplore  Lie group symmetries to classify all the manifolds of classical group symmetries that can be represented as matrices and hence exploit the structure of the problem to develop efficient algorithms. Better yet, we found the minimal way to represent them, and discovered elegant descriptions of the embeddings in terms of matrix invariants.
        </p>
      </div>
    );
  }
  if (id === 'viz-4') {
    return (
      <div>
        <p className="mb-3">
        It is not an understatement to say that the singular value decomposition (SVD) of matricesis one of the corner stones of applied mathematics. What about for infinite-dimensional matrices, i.e., linear operators? We prove the existence of the SVD for unbounded operators and show that surprisingly many familiar properties carries over to the infinite-dimensional setting.
        </p>
        <p className="mb-3">
        What's the point, you may ask. We illustrate the power of unbounded SVD by computing them for operators from fields. A plethora of interesting things pop out: gradients, supersymmetry, spherical harmonics, Casimir operator, Hodge theory, Black-Scholes, Galerkin method, you name it.
        </p>
      </div>
    );
  }
  return (
    <div>
      <p className="mb-3">This is where you can add detailed descriptions for each visualization.</p>
    </div>
  );
}

function VizPreview({ id }: { id: string }) {
  if (id === 'viz-1') return <Viz1Shader paused={false} />;
  if (id === 'viz-2') return <Viz2Shader paused={false} />;
  if (id === 'viz-3') return <SimpleShader paused={false} />;
  if (id === 'viz-4') return <Viz4Shader paused={false} />;
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-xs text-gray-500 uppercase tracking-wider">Preview</div>
    </div>
  );
}

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
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-modal
          role="dialog"
        >
          {/* Slight dim behind the expanded card - not a dark modal */}
          <div className="absolute inset-0 bg-black/15" />

          <button
            aria-label="Close"
            ref={closeRef}
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="focus-ring absolute right-6 top-6 z-10 text-gray-700 hover:text-black font-medium uppercase text-sm tracking-wide"
          >
            Close
          </button>

          {/* This box shares layoutId with the clicked card, so it visually grows
              from the card's position/size into this centered, larger view. */}
          <motion.div
            layoutId={`viz-card-${item.id}`}
            className="relative z-10 bg-white overflow-hidden border border-gray-200 rounded-sm shadow-2xl"
            style={{ width: 'min(880px, 92vw)', height: 384 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 flex">
              {/* Left - title + description */}
              <div className="w-1/2 flex flex-col justify-start px-6 py-6 overflow-y-auto">
                <span className="text-xl font-futura font-normal tracking-wider text-black uppercase text-left mb-4 block">
                  {item.title}
                </span>
                <div className="text-sm text-gray-600 leading-relaxed">
                  <VizDescription id={item.id} />
                </div>
              </div>

              {/* Right - full visualization, fixed height matching the card
                  (avoids the shader's zero-size fallback that caused cropping) */}
              <div className="w-1/2 h-full flex-shrink-0 relative overflow-hidden bg-transparent">
                <VizPreview id={item.id} />
              </div>
            </div>
          </motion.div>

          {/* Prev / next navigation */}
          <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 sm:px-6 z-10">
            <button
              aria-label="Previous"
              onClick={(e) => {
                e.stopPropagation();
                onChange(items[(index - 1 + items.length) % items.length].id);
              }}
              className="pointer-events-auto focus-ring text-gray-700 hover:text-black font-bold text-2xl"
            >
              ←
            </button>
            <button
              aria-label="Next"
              onClick={(e) => {
                e.stopPropagation();
                onChange(items[(index + 1) % items.length].id);
              }}
              className="pointer-events-auto focus-ring text-gray-700 hover:text-black font-bold text-2xl"
            >
              →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
