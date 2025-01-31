import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../store";

const StockSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [stockData, setStockData] = useState<any>(null);
  const [error, setError] = useState("");
  const user = useSelector((state: RootState) => state.auth.user);

  const searchStock = async () => {
    try {
      const res = await axios.get(
        `https://api.polygon.io/v3/reference/tickers/${query}?apiKey=YOUR_POLYGON_API_KEY`
      );
      setStockData(res.data);
      setError("");
    } catch (err) {
      setError("Stock not found");
      setStockData(null);
    }
  };

  const addToWatchlist = async () => {
    if (!user) {
      setError("You must be logged in to add to watchlist");
      return;
    }

    try {
      await axios.post(
        "http://localhost:3000/watchlist",
        { ticker: stockData.ticker, userId: user.id },
        { withCredentials: true }
      );
      alert(`${stockData.ticker} added to watchlist`);
    } catch (err) {
      setError("Failed to add to watchlist");
    }
  };

  return (
    <div className="stock-search">
      <h2>Search Stocks</h2>
      <input
        type="text"
        placeholder="Enter stock symbol"
        value={query}
        onChange={(e) => setQuery(e.target.value.toUpperCase())}
      />
      <button onClick={searchStock}>Search</button>

      {error && <p className="error">{error}</p>}

      {stockData && (
        <div className="stock-info">
          <h3>
            {stockData.name} ({stockData.ticker})
          </h3>
          <p>Market: {stockData.market}</p>
          <button onClick={addToWatchlist} disabled={!user}>
            Add to Watchlist
          </button>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
