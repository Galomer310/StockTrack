import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchWatchlist = async () => {
      try {
        const response = await axios.get("http://localhost:3000/watchlist", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setWatchlist(response.data);
      } catch (err) {
        console.error("Error fetching watchlist:", err);
      }
    };

    fetchWatchlist();
  }, [user, navigate, accessToken]);

  const handleRemoveFromWatchlist = async (ticker: string) => {
    try {
      await axios.delete(`http://localhost:3000/watchlist/${ticker}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
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
