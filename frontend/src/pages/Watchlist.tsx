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
      } catch (err: any) {
        console.error(
          "Error fetching watchlist:",
          err.response?.data || err.message
        );
      }
    };

    fetchWatchlist();
  }, [user, navigate, accessToken]);

  const handleRemoveFromWatchlist = async (stock_symbol: string) => {
    try {
      await axios.delete(`http://localhost:3000/watchlist/${stock_symbol}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Ensure the watchlist state uses `ticker` instead of `stock_symbol`
      setWatchlist(watchlist.filter((stock) => stock.ticker !== stock_symbol));

      alert(`Stock ${stock_symbol} removed from watchlist`);
    } catch (err: any) {
      console.error(
        "Error removing from watchlist:",
        err.response?.data || err.message
      );
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
      <button onClick={() => navigate("/")}>Log Out</button>
      <button onClick={() => navigate("/search")}>Search Stocks</button>
    </div>
  );
};

export default Watchlist;
