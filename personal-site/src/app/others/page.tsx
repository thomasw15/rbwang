const projects = Array.from({ length: 6 }).map((_, i) => ({
  id: `p-${i + 1}`,
  title: `Project ${i + 1}`,
}));

export default function OthersPage() {
  return (
    <section className="pt-12">
      <h1 className="mb-8 font-ubuntu text-4xl sm:text-5xl font-normal tracking-tight uppercase">Other Works</h1>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
        {projects.map((p) => (
          <div
            key={p.id}
            className="border border-gray-300 bg-white p-4 hover:border-gray-400 transition-colors"
          >
            <div className="aspect-[4/3] w-full bg-gradient-to-b from-gray-100 to-gray-200" />
            <div className="mt-4 text-sm font-serif font-normal text-black uppercase tracking-wider">{p.title}</div>
          </div>
        ))}
      </div>
    </section>
  );
}


