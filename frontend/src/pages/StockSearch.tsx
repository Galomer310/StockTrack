import React, { useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../store";

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY; // Load from frontend .env file

const StockSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [stockData, setStockData] = useState<any>(null);
  const [error, setError] = useState("");
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const searchStock = async () => {
    try {
      const res = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${query}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      if (res.data.results && res.data.results.length > 0) {
        setStockData(res.data.results[0]); // Get the first result
        setError("");
      } else {
        setError("No data available for this stock.");
        setStockData(null);
      }
    } catch (err) {
      setError("Stock not found or API error.");
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
        { stock_symbol: query, userId: user.id },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      alert(`${query} added to watchlist`);
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
            {query} - Closing Price: ${stockData.c}
          </h3>
          <p>Volume: {stockData.v}</p>
          <button onClick={addToWatchlist} disabled={!user}>
            Add to Watchlist
          </button>
        </div>
      )}
    </div>
  );
};

export default StockSearch;
