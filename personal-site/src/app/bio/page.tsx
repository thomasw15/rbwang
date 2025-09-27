export default function BioPage() {
  return (
    <div className="pt-20 min-h-screen">
      <div className="container-px mx-auto max-w-7xl">
        <div className="grid grid-cols-12 gap-8 min-h-screen">
          {/* Left Column - Bio Text (2/3 width) */}
          <div className="col-span-8 flex flex-col justify-center py-20">
            <div className="max-w-4xl">
              <div className="space-y-6">
                <div className="text-lg leading-relaxed text-gray-800">
                  <p className="mb-4">
                    I am a Ph.D. student in Computational & Applied Mathematics at University of Chicago. Advised by Prof. Lek-Heng Lim, I am interested in  the two-way traffic between computation and geometry.
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Geometric structures play a crucial role in real-world applications, including numerical analysis, statistics, physics, and engineering. How can we efficiently compute fundamental geometric objects to facilitate automated computation and optimization on these spaces using numerical linear algebra? </li>
                    <li>Concepts from geometry, such as equivariance and homology, have already demonstrated their potential in fields like machine learning and data analysis. What are some novel applications of these tools in real-world problems? What other mathematical structures can be explored to further enhance computational methodologies?</li>
                  </ul>
                </div>
                <p className="text-lg leading-relaxed text-gray-800">
                  Before coming to Chicago, I received my B.S. in Mathematics and Philosophy from William & Mary, a beautiful place in Virginia that I will forever be grateful for.
                </p>
                <p className="text-lg leading-relaxed text-gray-800">
                  Outside of research, I am a boxer, a European football enthusiast, and a motorsports fan. Don't worry, I do still have a life outside of sports.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Image (1/3 width) */}
          <div className="col-span-4 flex flex-col justify-center py-20">
                <div className="w-full max-w-sm mx-auto">
                  <img 
                    src="/Fizzcarraldo.jpg" 
                    alt="Scene from Fitzcarraldo"
                    className="w-full h-auto object-cover rounded-sm"
                  />
                  <p className="text-sm text-gray-600 text-center mt-4 font-futura uppercase tracking-wider">
                    From a movie that shaped who I am
                  </p>
                </div>
          </div>
        </div>
      </div>
    </div>
  );
}


