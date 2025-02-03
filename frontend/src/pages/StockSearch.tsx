// Frontend/src/pages/StockSearch.tsx
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";

const POLYGON_API_KEY = import.meta.env.VITE_POLYGON_API_KEY;

const StockSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [quantity, setQuantity] = useState(1); // New state for quantity
  const [stockData, setStockData] = useState<any>(null);
  const [companyInfo, setCompanyInfo] = useState<any>(null);
  const [marketStatus, setMarketStatus] = useState<string | null>(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

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

  const searchStock = async () => {
    try {
      setError("");
      const stockRes = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${query}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      if (stockRes.data.results && stockRes.data.results.length > 0) {
        setStockData(stockRes.data.results[0]);
      } else {
        setError("No stock data available.");
        setStockData(null);
      }
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

  // Now include quantity in the payload
  const addToWatchlist = async () => {
    if (!user) {
      setError("You must be logged in to add to watchlist");
      return;
    }
    try {
      await axios.post(
        "http://localhost:3000/watchlist",
        { stock_symbol: query, quantity }, // sending quantity along with symbol
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      alert(`${query} added to watchlist with quantity ${quantity}`);
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
      <input
        type="number"
        min="1"
        placeholder="Quantity"
        value={quantity}
        onChange={(e) => setQuantity(Number(e.target.value))}
      />
      <button onClick={searchStock}>Search</button>
      {marketStatus && <p className="market-status">{marketStatus}</p>}
      {error && <p className="error">{error}</p>}
      {companyInfo && (
        <div className="company-info">
          {companyInfo.branding?.logo_url && (
            <img
              src={`${companyInfo.branding.logo_url}?format=png`}
              alt={`${companyInfo.name} Logo`}
              style={{ width: "100px", height: "100px", objectFit: "contain" }}
            />
          )}
          <h3>{companyInfo.name}</h3>
          <p>Industry: {companyInfo.sic_description}</p>
        </div>
      )}
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
      <button onClick={() => navigate("/")}>Log Out</button>
      <button onClick={() => navigate("/user")}>User dashboard</button>
    </div>
  );
};

export default StockSearch;
