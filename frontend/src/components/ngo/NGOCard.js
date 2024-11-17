import { Link } from "react-router-dom";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

function NGOCard({ ngo }) {
  return (
    <Link to={`/ngo/${ngo.id}`}>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-all duration-300">
        <div className="h-48 overflow-hidden">
          <img
            src={
              ngo.logo_url ||
              "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80"
            }
            alt={ngo.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            {ngo.name}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {ngo.description ||
              "Supporting communities through transparent blockchain-based donations."}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">Verified NGO</span>
            <button className="flex items-center text-indigo-600 font-semibold group-hover:text-indigo-700">
              View Details
              <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default NGOCard;
