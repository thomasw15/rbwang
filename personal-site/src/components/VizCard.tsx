"use client";
import { motion } from 'framer-motion';
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

function VizShader({ id, paused }: { id: string; paused: boolean }) {
  if (id === 'viz-1') return <Viz1Shader paused={paused} />;
  if (id === 'viz-2') return <Viz2Shader paused={paused} />;
  if (id === 'viz-3') return <SimpleShader paused={paused} />;
  if (id === 'viz-4') return <Viz4Shader paused={paused} />;
  return (
    <div className="w-full h-full bg-white flex items-center justify-center">
      <div className="text-xs text-gray-500 uppercase tracking-wider">Preview</div>
    </div>
  );
}

export function VizCard({ viz, isExpanded, onToggle }: Props) {
  // NOTE: the shader wrapper below stays at the exact same position in the JSX
  // tree, and keeps the same element types, whether the card is collapsed or
  // expanded. That's deliberate - if collapsed/expanded rendered totally
  // different subtrees (as an earlier version did), React would unmount and
  // remount the shader (and its WebGL context) on every click, which raced
  // with the in-flight layout animation and produced wrong/garbage sizing.
  // Only className/style on the wrapper changes; the canvas itself is never
  // torn down, and a ResizeObserver inside each shader keeps it correctly
  // sized as its wrapper's CSS size changes.
  //
  // The whileInView entrance fade and the click-driven layout animation are
  // deliberately split across two elements (outer/inner). Putting both
  // `layout` and `whileInView`/`initial` on the same motion component makes
  // Framer Motion re-run the entrance animation (opacity back to 0) whenever
  // a layout animation happens, which is not what we want here.
  return (
    <motion.div
      className="w-full"
      initial={{ y: 8, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <motion.div
        layout
        onClick={() => onToggle(viz.id)}
        className="group w-full text-left focus-ring cursor-pointer relative overflow-hidden bg-white transition-colors border border-gray-200 rounded-sm"
        style={isExpanded ? undefined : { height: 96 }}
        transition={{ layout: { duration: 0.35, ease: 'easeInOut' } }}
      >
      <div className={isExpanded ? 'flex items-center' : 'absolute inset-0 flex'}>
        <div className={isExpanded ? 'w-1/2 flex flex-col justify-center px-4 py-4' : 'w-1/2 flex flex-col justify-start px-4 py-4'}>
          <span
            className={
              isExpanded
                ? 'text-lg font-futura font-normal tracking-wider text-black uppercase text-left mb-4'
                : 'text-lg font-futura font-normal tracking-wider text-black uppercase text-left'
            }
          >
            {viz.title}
          </span>
          {isExpanded && (
            <div className="text-sm text-gray-600 leading-relaxed">
              <VizDescription id={viz.id} />
            </div>
          )}
        </div>
        <div
          className={
            isExpanded
              ? 'w-1/2 flex items-center justify-center px-4 py-4'
              : 'w-1/2 h-full flex-shrink-0 relative overflow-hidden bg-transparent'
          }
          style={isExpanded ? undefined : { filter: 'grayscale(100%)' }}
        >
          <div
            className="relative"
            style={
              isExpanded
                ? { width: '100%', maxWidth: 440, aspectRatio: '4 / 3', margin: '0 auto' }
                : { position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', width: '100%', height: '384px' }
            }
          >
            <VizShader id={viz.id} paused={!isExpanded} />
          </div>
        </div>
      </div>
      </motion.div>
    </motion.div>
  );
}
