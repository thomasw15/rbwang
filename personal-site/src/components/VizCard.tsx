"use client";
import { motion } from 'framer-motion';
import { SimpleShader } from './SimpleShader';
import { Viz1Shader } from './Viz1Shader';
import { Viz2Shader } from './Viz2Shader';
import { Viz4Shader } from './Viz4Shader';

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

// NOTE: content below is placeholder scaffolding for the new five-section
// layout (Research / Papers / Talks / Academic Activities). The intro
// blurb with the same bio copy now lives at the top of the homepage
// instead of a separate About box.
// The old per-paper descriptions (Divergent Matrix Series, Unitary
// Invariance, Submanifold Optimization, Unbounded SVD) are still in git
// history and are good candidate content for the future Papers section -
// they were dropped here rather than guessed into place, since real
// content for each section is being filled in step by step.
const PAPERS = [
  {
    title: 'The Grassmannian of Indefinite Subspaces',
    href: '/rbwang/papers/indefinite-grassmannian.pdf',
    venue: 'Preprint',
  },
  {
    title: 'Linear Representations of Manifolds',
    href: 'https://arxiv.org/abs/2605.14013',
    venue: 'Preprint',
  },
  {
    title: 'Generalized Matrix Nearness Problems II',
    href: 'https://arxiv.org/abs/2605.30181',
    venue: 'Preprint',
  },
  {
    title: 'Summing Divergent Matrix Series',
    href: 'https://link.springer.com/article/10.1007/s00211-025-01493-4',
    venue: 'Numerische Mathematik (2025)',
  },
  {
    title: 'Geometric Programming for 3D Circuits',
    href: 'https://arxiv.org/abs/2504.01090',
    venue: 'Preprint',
  },
  {
    title: 'Pattern Problems related to the Arithmetic Kakeya Conjecture',
    href: 'https://arxiv.org/abs/2011.07056',
    venue: 'Preprint',
  },
];

// Reverse-chronological, matching the Papers list.
const TALKS = [
  {
    title: 'Linear Representations of Manifolds',
    venue: 'Matrix Analysis and Applications, JMM 2027',
    date: 'January 2027',
  },
  {
    title: 'Symmetries in Computations',
    venue: 'Mathematics Colloquium, William & Mary',
    date: 'September 2026',
  },
  {
    title: 'Manifold Representation and Riemannian Optimization',
    venue: 'Algebro-geometric Methods in Deep Learning, 2026 SIAM Annual Meeting',
    date: 'July 2026',
  },
  {
    title: 'A Ten-fold Way of Matrix Decompositions',
    venue: 'Midwest Numerical Analysis Day, University of Notre Dame',
    date: 'April 2026',
  },
  {
    title: 'Summing Divergent Matrix Series',
    venue: 'Algebraic Statistics, Institute for Mathematical and Statistical Innovation',
    date: 'November 2023',
  },
];

const ACADEMIC_ACTIVITIES = [
  {
    heading: 'Graduate Teaching Assistant, University of Chicago',
    items: [
      { text: 'STAT 30900 (Matrix Computation) \u2014 Fall 2023, Fall 2024' },
      { text: 'STAT 28000 (Optimization) \u2014 Spring 2024' },
      { text: 'STAT 30960 (Matrix Calculus) \u2014 Spring 2025', note: 'Guest Lecturer' },
    ],
  },
  {
    heading: 'Conference Organization',
    items: [
      { text: 'Special Session on Applied and Computational Differential Geometry, AMS 2026 Spring Eastern Sectional Meeting' },
      { text: 'Minisymposium on Matrix Geometries, ILAS 2026' },
      { text: 'Special Session on Algebra and Geometry in Computations, JMM 2027' },
    ],
  },
  {
    heading: 'Referee',
    items: [
      { text: 'SIAM Journal on Matrix Analysis and Applications' },
      { text: 'SIAM Journal on Scientific Computing' },
      { text: 'Journal of Machine Learning Research' },
      { text: 'Calcolo' },
      { text: 'Advances in Applied Clifford Algebras' },
      { text: 'Linear Algebra and Its Applications' },
      { text: 'Numerical Linear Algebra with Applications' },
      { text: 'Discrete & Computational Geometry' },
      { text: 'Linear and Multilinear Algebra' },
      { text: 'Mathematics of Computation' },
    ],
  },
  {
    heading: 'Short Programs',
    items: [
      { text: 'Study Abroad at Math in Moscow, Independent University of Moscow (Spring 2021)' },
      { text: 'REU at Budapest Semesters in Mathematics (Summer 2020)' },
      { text: 'Gene Golub SIAM Summer School on Quantum Computing, Duke University (Summer 2026)' },
    ],
  },
];

function VizDescription({ id }: { id: string }) {
  if (id === 'research') {
    return (
      <div>
        <p className="mb-3">
          I am interested in the roles of symmetry and invariance in computation, with applications in optimization, numerical linear algebra, and quantum computing.
        </p>
      </div>
    );
  }
  if (id === 'papers') {
    return (
      <ul className="list-disc pl-5 space-y-3 marker:text-gray-400">
        {PAPERS.map((paper) => (
          <li key={paper.title}>
            <a
              href={paper.href}
              target="_blank"
              rel="noopener noreferrer"
              // Stop the click from bubbling up to the card's own onClick -
              // without this, clicking a paper link also toggled the card
              // closed (and, since the link's default navigation and the
              // React state update raced, the click looked like it just
              // closed the box instead of opening the paper).
              onClick={(e) => e.stopPropagation()}
              className="font-sans text-[14px] leading-relaxed text-gray-800 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-black hover:decoration-gray-800"
            >
              {paper.title}
            </a>
            <span className="block font-sans text-xs text-gray-500 mt-0.5">{paper.venue}</span>
          </li>
        ))}
      </ul>
    );
  }
  if (id === 'talks') {
    return (
      <ul className="list-disc pl-5 space-y-3 marker:text-gray-400">
        {TALKS.map((talk) => (
          <li key={talk.title}>
            <span className="font-sans text-[14px] leading-relaxed text-gray-800">{talk.title}</span>
            <span className="block font-sans text-xs text-gray-500 mt-0.5">
              {talk.venue} &mdash; {talk.date}
            </span>
          </li>
        ))}
      </ul>
    );
  }
  if (id === 'academic-activities') {
    return (
      <div className="space-y-4">
        {ACADEMIC_ACTIVITIES.map((group) => (
          <div key={group.heading}>
            <p className="font-sans text-[14px] font-semibold text-gray-800 mb-1">{group.heading}</p>
            <ul className="list-disc pl-5 space-y-1 marker:text-gray-400">
              {group.items.map((item) => (
                <li key={item.text} className="font-sans text-[14px] leading-relaxed text-gray-600">
                  {item.text}
                  {item.note && (
                    <span className="ml-2 align-middle font-sans text-[10px] font-semibold uppercase tracking-wide text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">
                      {item.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div>
      <p className="mb-3">Content for this section is coming soon.</p>
    </div>
  );
}

function VizShader({ id, paused }: { id: string; paused: boolean }) {
  if (id === 'research') return <SimpleShader paused={paused} />;
  if (id === 'papers') return <Viz2Shader paused={paused} />;
  if (id === 'talks') return <Viz1Shader paused={paused} />;
  if (id === 'academic-activities') return <Viz4Shader paused={paused} />;
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
                ? { width: '100%', maxWidth: 480, aspectRatio: '1 / 1', margin: '0 auto' }
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
