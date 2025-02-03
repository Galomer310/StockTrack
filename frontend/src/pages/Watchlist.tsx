// Frontend/src/pages/Watchlist.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
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
        // Backend now returns an object: { total, watchlist }
        setWatchlist(response.data.watchlist);
        setTotal(response.data.total);
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
      // Remove the stock locally after deletion
      setWatchlist(
        watchlist.filter((stock) => stock.stock_symbol !== stock_symbol)
      );
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
      <h4>Total Price: ${total.toFixed(2)}</h4>
      {watchlist.length === 0 ? (
        <p>No stocks in watchlist.</p>
      ) : (
        <ul>
          {watchlist.map((stock) => (
            <li
              key={stock.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}
            >
              <div>
                <p>
                  <strong>{stock.stock_symbol}</strong>
                </p>
                <p>Added at: {new Date(stock.added_at).toLocaleString()}</p>
                <p>
                  Price at addition: $
                  {parseFloat(stock.price_at_time).toFixed(2)}
                </p>
              </div>
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
