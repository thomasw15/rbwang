import { VizCard, Viz } from '../components/VizCard';

const items: Viz[] = [
  { id: 'research', title: 'Research' },
  { id: 'papers', title: 'Papers' },
  { id: 'talks', title: 'Talks' },
  { id: 'academic-activities', title: 'Academic Activities' },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <div className="container-px mx-auto max-w-4xl py-16">
        {/* Intro blurb above the sections, right under the header, so
            visitors see who I am without having to click into anything.
            Replaces the standalone About section, which has been removed. */}
        <p className="max-w-2xl mx-auto text-center text-lg leading-relaxed text-gray-800 mb-10">
          I am a fifth-year Ph.D. in{' '}
          <a
            href="https://cam.uchicago.edu/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-800 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-black hover:decoration-gray-800"
          >
            Computational and Applied Mathematics
          </a>{' '}
          at University of Chicago advised by{' '}
          <a
            href="https://www.stat.uchicago.edu/~lekheng/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-800 underline decoration-gray-400 underline-offset-2 transition-colors hover:text-black hover:decoration-gray-800"
          >
            Lek-Heng Lim
          </a>
          .
        </p>
        {/* Everything below shows in full, all the time - no clicking to
            expand a section, nothing hidden. It's one long page to scroll
            through instead of a set of boxes to open one at a time. */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {items.map((viz) => (
            <VizCard key={viz.id} viz={viz} />
          ))}
        </div>
      </div>
    </div>
  );
}
