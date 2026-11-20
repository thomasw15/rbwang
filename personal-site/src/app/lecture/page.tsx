import type { Metadata } from 'next';

const title = 'Lecture notes | Rongbiao (Thomas) Wang';
const description = 'Lecture notes from Spring 2025 and Spring 2026.';

export const metadata: Metadata = {
  title,
  description,
  robots: { index: false, follow: false },
  openGraph: {
    title,
    description,
    url: 'https://thomasw15.github.io/rbwang/lecture/',
    type: 'website',
  },
  twitter: { card: 'summary', title, description },
};

const semesters = [
  {
    year: 2026,
    notes: [
      { lecture: 13, file: 'lecture13-spring26.pdf', pages: 11 },
      { lecture: 14, file: 'lecture14-spring26.pdf', pages: 5 },
    ],
  },
  {
    year: 2025,
    notes: [
      { lecture: 13, file: 'lecture13-spring25.pdf', pages: 6 },
      { lecture: 14, file: 'lecture14-spring25.pdf', pages: 5 },
    ],
  },
];

export default function LecturePage() {
  return (
    <div className="container-px mx-auto max-w-4xl py-16">
      <h1 className="font-ubuntu text-3xl tracking-tight">Lecture notes</h1>
      <div className="mt-10 space-y-8">
        {semesters.map(({ year, notes }) => (
          <section key={year} aria-labelledby={`spring-${year}`} className="border border-gray-200 p-6 sm:p-8">
            <h2 id={`spring-${year}`} className="font-ubuntu text-xl tracking-wider uppercase">
              Spring {year}
            </h2>
            <ul className="mt-5 divide-y divide-gray-200">
              {notes.map((note) => (
                <li key={note.file}>
                  <a
                    href={`/rbwang/lecture-notes/${note.file}`}
                    aria-label={`Lecture ${note.lecture}, Spring ${year} (PDF, ${note.pages} pages)`}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 text-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gray-800"
                  >
                    <span className="text-base underline decoration-gray-400 underline-offset-4">
                      Lecture {note.lecture}
                    </span>
                    <span className="text-sm text-gray-500">PDF · {note.pages} pages</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
