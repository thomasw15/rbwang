"use client";
import { motion } from 'framer-motion';
// The shader visualizations (SimpleShader, Viz1Shader, Viz2Shader,
// Viz4Shader) are deliberately not imported here anymore - the site is
// text-only for now, but the shader components themselves are untouched
// in src/components/ and still wired up via VizCard's git history
// (see the "Switch from click-to-expand..." commit and earlier) if this
// version wants them back later.

export type Viz = {
  id: string;
  title: string;
  caption?: string;
};

type Props = {
  viz: Viz;
};

// Each of these renders as a permanently-expanded section stacked down the
// single homepage (Research / Papers / Talks / Academic Activities) - no
// click-to-expand, nothing hidden. The intro blurb with the same bio copy
// lives at the top of the homepage instead of a separate About section.
// The old per-paper descriptions (Divergent Matrix Series, Unitary
// Invariance, Submanifold Optimization, Unbounded SVD) are still in git
// history and are good candidate content for the future Papers section -
// they were dropped here rather than guessed into place, since real
// content for each section is being filled in step by step.
type Coauthor = { name: string; href?: string };

const PAPERS: {
  title: string;
  href: string;
  coauthors: Coauthor[];
  venue: string;
}[] = [
  {
    title: 'The Grassmannian of Indefinite Subspaces',
    href: '/rbwang/papers/indefinite-grassmannian.pdf',
    coauthors: [{ name: 'Lek-Heng Lim' }, { name: 'Hongquan Yang' }],
    venue: 'Preprint',
  },
  {
    title: 'Linear Representations of Manifolds',
    href: 'https://arxiv.org/abs/2605.14013',
    coauthors: [{ name: 'Lek-Heng Lim' }, { name: 'Ke Ye' }],
    venue: 'Preprint',
  },
  {
    title: 'Generalized Matrix Nearness Problems II',
    href: 'https://arxiv.org/abs/2605.30181',
    coauthors: [{ name: 'Chi-Kwong Li' }, { name: 'Lek-Heng Lim' }],
    venue: 'Preprint',
  },
  {
    title: 'Summing Divergent Matrix Series',
    href: 'https://link.springer.com/article/10.1007/s00211-025-01493-4',
    coauthors: [{ name: 'Jungho Lee' }, { name: 'Lek-Heng Lim' }],
    venue: 'Numerische Mathematik (2025)',
  },
  {
    title: 'Geometric Programming for 3D Circuits',
    href: 'https://arxiv.org/abs/2504.01090',
    coauthors: [{ name: 'Lek-Heng Lim' }],
    venue: 'Preprint',
  },
  {
    title: 'Pattern Problems related to the Arithmetic Kakeya Conjecture',
    href: 'https://arxiv.org/abs/2011.07056',
    coauthors: [
      { name: 'Charlie Cowen-Breen', href: 'https://arxiv.org/search/math?searchtype=author&query=Cowen-Breen,+C' },
      { name: 'Elene Karangozishvili', href: 'https://arxiv.org/search/math?searchtype=author&query=Karangozishvili,+E' },
      { name: 'Narmada Varadarajan', href: 'https://arxiv.org/search/math?searchtype=author&query=Varadarajan,+N' },
    ],
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

type AcademicActivityItem = { text: string; note?: string; href?: string };
type AcademicActivityGroup = { heading: string; items: AcademicActivityItem[] };

const ACADEMIC_ACTIVITIES: AcademicActivityGroup[] = [
  {
    heading: 'Graduate Teaching Assistant, University of Chicago',
    items: [
      { text: 'STAT 30900 (Matrix Computation) — Fall 2023, Fall 2024' },
      { text: 'STAT 28000 (Optimization) — Spring 2024' },
      { text: 'STAT 30960 (Matrix Calculus) — Spring 2025', note: 'Guest Lecturer' },
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
      { text: 'Metric Algebraic Geometry: Going Global, ICERM (Spring 2027)' },
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
    const linkClass =
      'text-gray-800 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-black hover:decoration-gray-800';
    return (
      <ul className="list-disc pl-5 space-y-3 marker:text-gray-400">
        {PAPERS.map((paper) => (
          <li key={paper.title}>
            <a
              href={paper.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-sans text-[14px] leading-relaxed ${linkClass}`}
            >
              {paper.title}
            </a>
            <span className="block font-sans text-xs text-gray-500 mt-0.5">
              with{' '}
              {paper.coauthors.map((coauthor, i) => (
                <span key={coauthor.name}>
                  {i > 0 && (paper.coauthors.length > 2 ? ', ' : ' ')}
                  {i > 0 && i === paper.coauthors.length - 1 && 'and '}
                  {coauthor.href ? (
                    <a href={coauthor.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {coauthor.name}
                    </a>
                  ) : (
                    coauthor.name
                  )}
                </span>
              ))}
              , <span className="italic">{paper.venue}</span>
            </span>
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
                  {item.href ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-800 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-black hover:decoration-gray-800"
                    >
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
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

export function VizCard({ viz }: Props) {
  return (
    <motion.div
      className="w-full relative overflow-hidden bg-white border border-gray-200 rounded-sm"
      initial={{ y: 8, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="w-full flex flex-col justify-center px-4 py-6">
        <span className="text-lg font-futura font-normal tracking-wider text-black uppercase text-left mb-4">
          {viz.title}
        </span>
        <div className="text-sm text-gray-600 leading-relaxed">
          <VizDescription id={viz.id} />
        </div>
      </div>
    </motion.div>
  );
}
