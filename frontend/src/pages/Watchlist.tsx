import { useState, useEffect } from "react";
import axios from "axios";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<any[]>([]);

  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const response = await axios.get("/watchlist");
        setWatchlist(response.data);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
      }
    };

    fetchWatchlist();
  }, []);

  const handleRemoveFromWatchlist = async (ticker: string) => {
    try {
      await axios.delete(`/watchlist/${ticker}`);
      setWatchlist(watchlist.filter((stock) => stock.stock_symbol !== ticker));
      alert(`Stock ${ticker} removed from watchlist`);
    } catch (err) {
      console.error("Error removing from watchlist:", err);
    }
  };

  return (
    <div>
      <h3>Your Watchlist</h3>
      {watchlist.length === 0 ? (
        <p>No stocks in watchlist.</p>
      ) : (
        <ul>
          {watchlist.map((stock) => (
            <li key={stock.id}>
              {stock.stock_symbol}{" "}
              <button
                onClick={() => handleRemoveFromWatchlist(stock.stock_symbol)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Watchlist;
