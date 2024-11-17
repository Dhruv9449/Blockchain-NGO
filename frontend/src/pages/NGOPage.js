import NGODetail from "../components/ngo/NGODetail";
import { useEffect } from "react";

function NGOPage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="w-56 h-56 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
            <div className="w-56 h-56 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
            <div className="w-56 h-56 bg-pink-600 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
          </div>

          {/* Content */}
          <div className="relative">
            <NGODetail />
          </div>
        </div>
      </div>
    </div>
  );
}

export default NGOPage;
