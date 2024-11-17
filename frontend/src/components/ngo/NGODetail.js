import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";
import DonationForm from "./DonationForm";

function NGODetail() {
  const { id } = useParams();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNGODetails = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.ngos.getDetail(id);
      setNgo(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchNGODetails();
  }, [fetchNGODetails]);

  const handleDonationSuccess = () => {
    fetchNGODetails();
  };

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
        <div className="flex items-center mb-6">
          {ngo.logo_url && (
            <img
              src={ngo.logo_url}
              alt={ngo.name}
              className="w-20 h-20 rounded-full mr-6"
            />
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{ngo.name}</h1>
            <p className="text-gray-600">Administered by {ngo.admin}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Incoming Donations</h2>
            <div className="h-[400px] overflow-y-auto pr-4 space-y-4">
              {ngo.incoming.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No incoming donations yet
                </p>
              ) : (
                ngo.incoming.map((tx, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">Amount: ${tx.amount}</p>
                    <p className="text-sm text-gray-600">From: {tx.user}</p>
                    <p className="text-xs text-gray-500 break-all">
                      Hash: {tx.blockchain_hash}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Outgoing Expenses</h2>
            <div className="h-[400px] overflow-y-auto pr-4 space-y-4">
              {ngo.outgoing.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No outgoing expenses yet
                </p>
              ) : (
                ngo.outgoing.map((tx, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">Amount: ${tx.amount}</p>
                    {tx.proof_url && (
                      <a
                        href={tx.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        View Proof
                      </a>
                    )}
                    <p className="text-xs text-gray-500 break-all">
                      Hash: {tx.blockchain_hash}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <DonationForm ngoId={id} onDonationSuccess={handleDonationSuccess} />
      </div>
    </div>
  );
}

export default NGODetail;
