import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import DonationForm from "./DonationForm";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import ImageModal from "../common/ImageModal";

function NGODetail() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("donations"); // 'donations' or 'expenses'
  const [donationFilters, setDonationFilters] = useState({
    min_amount: "",
    max_amount: "",
    sort_order: "desc",
  });
  const [expenseFilters, setExpenseFilters] = useState({
    min_amount: "",
    max_amount: "",
    sort_order: "desc",
  });
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  const fetchNGODetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.ngos.getDetail(id);
      console.log("NGO Data received:", data);
      setNgo(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching NGO details:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNGODetails();
  }, [fetchNGODetails]);

  if (loading && !ngo) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {/* NGO Header with Donation Button */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <img
            src={ngo?.logo_url}
            alt={ngo?.name}
            className="w-32 h-32 object-cover rounded-lg"
          />
          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {ngo?.name}
                </h1>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {ngo?.description}
                </p>
              </div>
              <button
                onClick={() => setShowDonationForm(true)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-3 
                         rounded-lg shadow-lg hover:from-indigo-700 hover:to-indigo-800 
                         transform hover:-translate-y-0.5 transition-all duration-200
                         flex items-center gap-2"
              >
                <span className="text-xl">❤</span>
                <span className="font-semibold">Donate Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-gray-600">Total Donations</p>
            <p className="text-2xl font-bold text-indigo-600">
              $
              {ngo?.donations
                ?.reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-600">Total Expenses</p>
            <p className="text-2xl font-bold text-indigo-600">
              $
              {ngo?.expenses
                ?.reduce((sum, tx) => sum + parseFloat(tx.amount), 0)
                .toFixed(2)}
            </p>
          </div>
        </div>

        {/* Work Images Carousel */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Work</h2>
          <div className="relative">
            <Slider
              dots={true}
              infinite={true}
              speed={500}
              slidesToShow={3}
              slidesToScroll={3}
              autoplay={true}
              autoplaySpeed={4000}
              pauseOnHover={true}
              prevArrow={<CustomArrow direction="prev" />}
              nextArrow={<CustomArrow direction="next" />}
              className="work-images-carousel"
              responsive={[
                {
                  breakpoint: 1024,
                  settings: {
                    slidesToShow: 2,
                    slidesToScroll: 2,
                  },
                },
                {
                  breakpoint: 640,
                  settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                  },
                },
              ]}
            >
              {ngo?.work_images?.map((imageUrl, index) => (
                <div key={index} className="px-2">
                  <div
                    className="relative h-48 rounded-lg overflow-hidden shadow-md group cursor-pointer"
                    onClick={() =>
                      setModalImage({
                        url: imageUrl,
                        title: `${ngo.name} Work Image ${index + 1}`,
                      })
                    }
                  >
                    <img
                      src={imageUrl}
                      alt={`${ngo?.name || "NGO"} work ${index + 1}`}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-2 left-2 right-2 text-white text-center">
                        <p className="text-xs">Click to view full image</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          </div>
        </div>

        {/* Donation Form Modal */}
        {showDonationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Make a Donation</h2>
                <button
                  onClick={() => setShowDonationForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <DonationForm
                ngoId={id}
                onDonationSuccess={() => {
                  setShowDonationForm(false);
                  fetchNGODetails();
                }}
              />
            </div>
          </div>
        )}

        {/* Certificate */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <a
            onClick={(e) => {
              e.preventDefault();
              setModalImage({
                url: ngo.certificate_url,
                title: "NGO Certificate",
              });
            }}
            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 cursor-pointer"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            View NGO Certificate
          </a>
        </div>

        {/* Transactions Tabs */}
        <div className="mb-6">
          <div className="flex border-b">
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "donations"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("donations")}
            >
              Donations History
            </button>
            <button
              className={`px-4 py-2 font-medium ${
                activeTab === "expenses"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab("expenses")}
            >
              Expenses
            </button>
          </div>

          {/* Tab Content */}
          <div className="mt-6">
            {activeTab === "donations" && (
              <>
                {/* Donation Filters */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Min Amount"
                      value={donationFilters.min_amount}
                      onChange={(e) =>
                        setDonationFilters({
                          ...donationFilters,
                          min_amount: e.target.value,
                        })
                      }
                      className="p-2 border rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Max Amount"
                      value={donationFilters.max_amount}
                      onChange={(e) =>
                        setDonationFilters({
                          ...donationFilters,
                          max_amount: e.target.value,
                        })
                      }
                      className="p-2 border rounded-md"
                    />
                    <select
                      value={donationFilters.sort_order}
                      onChange={(e) =>
                        setDonationFilters({
                          ...donationFilters,
                          sort_order: e.target.value,
                        })
                      }
                      className="p-2 border rounded-md"
                    >
                      <option value="desc">Latest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* Donations List */}
                <div className="h-[500px] overflow-y-auto pr-4 space-y-4">
                  {ngo.donations
                    .filter(
                      (tx) =>
                        (!donationFilters.min_amount ||
                          parseFloat(tx.amount) >=
                            parseFloat(donationFilters.min_amount)) &&
                        (!donationFilters.max_amount ||
                          parseFloat(tx.amount) <=
                            parseFloat(donationFilters.max_amount))
                    )
                    .sort((a, b) => {
                      const order =
                        donationFilters.sort_order === "desc" ? -1 : 1;
                      return (
                        order * (new Date(a.timestamp) - new Date(b.timestamp))
                      );
                    })
                    .map((tx, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 p-4 rounded-lg transition-all hover:shadow-md"
                      >
                        <p className="font-medium">Amount: ${tx.amount}</p>
                        <p className="text-sm text-gray-600">From: {tx.user}</p>
                        <p className="text-xs text-gray-500 break-all">
                          Hash: {tx.blockchain_hash}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                </div>

                {/* Donation Form */}
                <div className="mt-6">
                  <DonationForm
                    ngoId={id}
                    onDonationSuccess={fetchNGODetails}
                  />
                </div>
              </>
            )}

            {activeTab === "expenses" && (
              <>
                {/* Expense Filters */}
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                      type="number"
                      placeholder="Min Amount"
                      value={expenseFilters.min_amount}
                      onChange={(e) =>
                        setExpenseFilters({
                          ...expenseFilters,
                          min_amount: e.target.value,
                        })
                      }
                      className="p-2 border rounded-md"
                    />
                    <input
                      type="number"
                      placeholder="Max Amount"
                      value={expenseFilters.max_amount}
                      onChange={(e) =>
                        setExpenseFilters({
                          ...expenseFilters,
                          max_amount: e.target.value,
                        })
                      }
                      className="p-2 border rounded-md"
                    />
                    <select
                      value={expenseFilters.sort_order}
                      onChange={(e) =>
                        setExpenseFilters({
                          ...expenseFilters,
                          sort_order: e.target.value,
                        })
                      }
                      className="p-2 border rounded-md"
                    >
                      <option value="desc">Latest First</option>
                      <option value="asc">Oldest First</option>
                    </select>
                  </div>
                </div>

                {/* Expenses List */}
                <div className="h-[500px] overflow-y-auto pr-4 space-y-4">
                  {ngo.expenses
                    .filter(
                      (tx) =>
                        (!expenseFilters.min_amount ||
                          parseFloat(tx.amount) >=
                            parseFloat(expenseFilters.min_amount)) &&
                        (!expenseFilters.max_amount ||
                          parseFloat(tx.amount) <=
                            parseFloat(expenseFilters.max_amount))
                    )
                    .sort((a, b) => {
                      const order =
                        expenseFilters.sort_order === "desc" ? -1 : 1;
                      return (
                        order * (new Date(a.timestamp) - new Date(b.timestamp))
                      );
                    })
                    .map((tx, index) => (
                      <div
                        key={index}
                        className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Amount: ${tx.amount}</p>
                            <p className="text-xs text-gray-500 break-all">
                              Hash: {tx.blockchain_hash}
                            </p>
                            <p className="text-xs text-gray-400">
                              {new Date(tx.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {tx.proof_url && (
                            <div className="ml-4">
                              <img
                                src={tx.proof_url}
                                alt="Expense proof"
                                className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-75"
                                onClick={() =>
                                  setModalImage({
                                    url: tx.proof_url,
                                    title: "Expense Proof",
                                  })
                                }
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <ImageModal
        isOpen={!!modalImage}
        onClose={() => setModalImage(null)}
        imageUrl={modalImage?.url}
        title={modalImage?.title}
      />
    </div>
  );
}

// Add this custom arrow component
const CustomArrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className={`absolute z-10 top-1/2 transform -translate-y-1/2 
                ${direction === "prev" ? "-left-4" : "-right-4"}
                bg-white hover:bg-gray-100 text-gray-800 
                w-8 h-8 rounded-full shadow-lg
                flex items-center justify-center
                transition-all duration-200 hover:scale-110
                border border-gray-200`}
  >
    {direction === "prev" ? "←" : "→"}
  </button>
);

// Add these styles to your CSS or in a style tag
const styles = `
  .work-images-carousel .slick-slide {
    padding: 0 8px;
  }

  .work-images-carousel .slick-dots {
    bottom: -30px;
  }

  .work-images-carousel .slick-dots li button:before {
    font-size: 8px;
    color: #4f46e5;
  }

  .work-images-carousel .slick-dots li.slick-active button:before {
    color: #4f46e5;
  }

  .work-images-carousel {
    margin: 0 -8px;
    margin-bottom: 40px;
  }

  .work-images-carousel .slick-track {
    display: flex;
    align-items: center;
  }

  .work-images-carousel .slick-slide {
    height: inherit;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

export default NGODetail;
