import { useState, useEffect } from "react";
import { api } from "../../services/api";
import NGOCard from "./NGOCard";

function NGOList() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNGOs = async () => {
      try {
        const data = await api.ngos.list();
        setNgos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNGOs();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {ngos.map((ngo) => (
        <NGOCard key={ngo.id} ngo={ngo} />
      ))}
    </div>
  );
}

export default NGOList;
