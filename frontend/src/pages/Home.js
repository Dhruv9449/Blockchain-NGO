import { Link } from "react-router-dom";
import {
  ShieldCheckIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  LockClosedIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";
import NGOList from "../components/ngo/NGOList";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { isAuthenticated } = useAuth();

  const scrollToNGOs = () => {
    document.getElementById("ngo-list").scrollIntoView({ behavior: "smooth" });
  };

  const scrollToFeatures = () => {
    document.getElementById("features").scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-1.2.1&auto=format&fit=crop&w=2850&q=80"
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
        </div>
        <div className="relative bg-gradient-to-r from-indigo-600/90 to-blue-500/90 text-white py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl font-bold mb-6">
                Revolutionizing Charitable Giving
              </h1>
              <p className="text-xl mb-8">
                Join the world's most transparent donation platform powered by
                blockchain technology. Every transaction is secure, traceable,
                and immutable.
              </p>
              <div className="flex gap-4 justify-center">
                {isAuthenticated ? (
                  <button
                    onClick={scrollToNGOs}
                    className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center"
                  >
                    <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                    Start Donating
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors flex items-center"
                  >
                    <CurrencyDollarIcon className="w-5 h-5 mr-2" />
                    Start Donating
                  </Link>
                )}
                <button
                  onClick={scrollToFeatures}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center"
                >
                  <DocumentCheckIcon className="w-5 h-5 mr-2" />
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 -mt-16">
          <TrustCard
            icon={<ShieldCheckIcon className="w-8 h-8" />}
            number="100%"
            text="Secure"
          />
          <TrustCard
            icon={<UserGroupIcon className="w-8 h-8" />}
            number="50+"
            text="NGOs"
          />
          <TrustCard
            icon={<CurrencyDollarIcon className="w-8 h-8" />}
            number="$1M+"
            text="Donated"
          />
          <TrustCard
            icon={<GlobeAltIcon className="w-8 h-8" />}
            number="20+"
            text="Countries"
          />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto px-4 py-16 scroll-mt-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Choose BlockchainNGO?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<LockClosedIcon className="w-12 h-12" />}
            title="Secure & Transparent"
            description="Every transaction is recorded on the blockchain, creating an immutable and transparent record of all donations."
            image="https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80"
          />
          <FeatureCard
            icon={<DocumentCheckIcon className="w-12 h-12" />}
            title="Verified NGOs"
            description="All NGOs undergo thorough verification before joining our platform, ensuring your donations reach legitimate organizations."
            image="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80"
          />
          <FeatureCard
            icon={<ChartBarIcon className="w-12 h-12" />}
            title="Real-time Tracking"
            description="Track your donations and see how NGOs utilize funds with our real-time blockchain-based tracking system."
            image="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1024&q=80"
          />
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gradient-to-b from-gray-50 to-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="relative">
            {/* Connection Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-indigo-100"></div>
            <div className="grid md:grid-cols-4 gap-8">
              <StepCard
                number="1"
                icon={<UserGroupIcon className="w-6 h-6" />}
                title="Choose an NGO"
                description="Browse through our list of verified NGOs and select one that aligns with your cause."
              />
              <StepCard
                number="2"
                icon={<CurrencyDollarIcon className="w-6 h-6" />}
                title="Make a Donation"
                description="Securely donate any amount using our blockchain-powered payment system."
              />
              <StepCard
                number="3"
                icon={<DocumentCheckIcon className="w-6 h-6" />}
                title="Get Verified"
                description="Receive a unique blockchain transaction hash as proof of your donation."
              />
              <StepCard
                number="4"
                icon={<ChartBarIcon className="w-6 h-6" />}
                title="Track Impact"
                description="Monitor how your donation is being utilized through our transparent tracking system."
              />
            </div>
          </div>
        </div>
      </div>

      {/* NGO List Section */}
      <div id="ngo-list" className="container mx-auto px-4 scroll-mt-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured NGOs</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join these verified organizations making a difference through
            transparent blockchain-based donations.
          </p>
        </div>
        <NGOList />
      </div>
    </div>
  );
}

function TrustCard({ icon, number, text }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 text-center transform hover:-translate-y-1 transition-transform duration-300">
      <div className="text-indigo-600 mb-3 flex justify-center">{icon}</div>
      <div className="text-2xl font-bold mb-1">{number}</div>
      <div className="text-gray-600 text-sm">{text}</div>
    </div>
  );
}

function FeatureCard({ icon, title, description, image }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      <div className="h-48 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
      </div>
      <div className="p-6">
        <div className="text-indigo-600 mb-4 flex justify-center">{icon}</div>
        <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
        <p className="text-gray-600 text-center">{description}</p>
      </div>
    </div>
  );
}

function StepCard({ number, icon, title, description }) {
  return (
    <div className="relative bg-white rounded-xl shadow-lg p-6 z-10">
      <div className="absolute -top-4 -left-4 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <div className="text-indigo-600 mb-4 flex justify-center">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-center">{title}</h3>
      <p className="text-gray-600 text-center">{description}</p>
    </div>
  );
}

export default Home;
