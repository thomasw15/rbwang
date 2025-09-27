"use client";
import { motion, AnimatePresence } from 'framer-motion';
import { SimpleShader } from './SimpleShader';
import { Viz1Shader } from './Viz1Shader';
import { Viz2Shader } from './Viz2Shader';
import { Viz4Shader } from './Viz4Shader';
import { Math } from './Math';

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
            <div className="w-1/2 flex flex-col justify-start px-4 py-4">
              <div className={`${isExpanded ? 'mb-4' : ''}`}>
                <span className="text-lg font-futura font-normal tracking-wider text-black uppercase text-left">
                  {viz.title}
                </span>
              </div>
              {isExpanded && (
                <div className="flex-1 text-sm text-gray-600 leading-relaxed">
                  {viz.id === 'viz-1' ? (
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
                  ) : viz.id === 'viz-2' ? (
                    <div>
                      <p className="mb-3">
                        Solving the matrix nearness problem <Math>\lVert A-BXC\rVert</Math> for <Math>X</Math> with various constraints is a well-studied problem in the Frobenius norm. What about in other unitarily invariant norms like the spectral norm or the nuclear norm?
                      </p>
                      <p className="mb-3">
                        Intuitions from the famous Eckart-Young-Mirsky theorem suggests that the optimal solutions should be the same for all unitarily invariant norms. On the contrary, it is not true. We found simple examples and developed efficient iterative algorithms solve the problem for unitarily invariant norms.
                      </p>
                    </div>
                  ) : viz.id === 'viz-3' ? (
                    <div>
                      <p className="mb-3">
                        How do I numerically optimize <Math>f(x)</Math> when <Math>x</Math> is constrained to lie on a manifold? This is when Riemannian optimization comes in. To utilize the tools from Riemannian geometry, we need to embed the manifold as numerically tractable object, i.e., matrices. 
                      </p>
                      <p className="mb-3">
                        In this work, we eplore  Lie group symmetries to classify all the manifolds of classical group symmetries that can be represented as matrices and hence exploit the structure of the problem to develop efficient algorithms. Better yet, we found the minimal way to represent them, and discovered elegant descriptions of the embeddings in terms of matrix invariants.
                      </p>
                    </div>
                  ) : viz.id === 'viz-4' ? (
                    <div>
                      <p className="mb-3">
                      It is not an understatement to say that the singular value decomposition (SVD) of matricesis one of the corner stones of applied mathematics. What about for infinite-dimensional matrices, i.e., linear operators? We prove the existence of the SVD for unbounded operators and show that surprisingly many familiar properties carries over to the infinite-dimensional setting.
                      </p>
                      <p className="mb-3">
                      What's the point, you may ask. We illustrate the power of unbounded SVD by computing them for operators from fields. A plethora of interesting things pop out: gradients, supersymmetry, spherical harmonics, Casimir operator, Hodge theory, Black-Scholes, Galerkin method, you name it.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="mb-3">
                        This is where you can add detailed descriptions for each visualization.
                      </p>
                    </div>
                  )}
                </div>
              )}
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
              ) : viz.id === 'viz-4' ? (
                <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', width: '100%', height: isExpanded ? '100%' : '384px' }}>
                  <Viz4Shader paused={!isExpanded} />
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


