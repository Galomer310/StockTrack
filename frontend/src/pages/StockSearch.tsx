import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../store";

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY; // Load API key from .env

const StockSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [stockData, setStockData] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [marketStatus, setMarketStatus] = useState<string | null>(null);
  const [error, setError] = useState("");

  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  // ✅ Check if market is open when the component loads
  useEffect(() => {
    const checkMarketStatus = async () => {
      try {
        const res = await axios.get(
          `https://api.polygon.io/v1/marketstatus/now?apiKey=${POLYGON_API_KEY}`
        );
        if (res.data.market === "closed") {
          setMarketStatus(
            "🚫 The market is closed, stock prices won’t update in real time."
          );
        } else {
          setMarketStatus(null);
        }
      } catch (err) {
        console.error("Error checking market status", err);
      }
    };

    checkMarketStatus();
  }, []);

  // ✅ Fetch stock data & company info
  const searchStock = async () => {
    try {
      setError(""); // Reset errors

      // Fetch stock price (previous close)
      const stockRes = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${query}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );

      if (stockRes.data.results && stockRes.data.results.length > 0) {
        setStockData(stockRes.data.results[0]); // Get first result
      } else {
        setError("No stock data available.");
        setStockData(null);
      }

      // Fetch company details
      const companyRes = await axios.get(
        `https://api.polygon.io/v3/reference/tickers/${query}?apiKey=${POLYGON_API_KEY}`
      );
      setCompanyInfo(companyRes.data.results);
    } catch (err) {
      setError("Stock not found or API error.");
      setStockData(null);
      setCompanyInfo(null);
    }
  };

  // ✅ Add stock to watchlist
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

      {/* Display Market Status Message */}
      {marketStatus && <p className="market-status">{marketStatus}</p>}

      {error && <p className="error">{error}</p>}

      {/* Display Company Info */}
      {companyInfo && (
        <div className="company-info">
          {companyInfo.branding?.logo_url && (
            <img
              src={companyInfo.branding.logo_url}
              alt={`${companyInfo.name} Logo`}
              style={{ width: "100px" }}
            />
          )}
          <h3>{companyInfo.name}</h3>
          <p>Industry: {companyInfo.sic_description}</p>
        </div>
      )}

      {/* Display Stock Data */}
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
