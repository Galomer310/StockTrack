// frontend/src/components/PortfolioPerformance.tsx
import React, { useState, useEffect } from "react";
import axios from "axios";

interface WatchlistItem {
  id: number;
  stock_symbol: string;
  price_at_time: string;
  quantity: number;
  added_at: string;
  industry?: string;
}

interface PortfolioPerformanceProps {
  watchlist: WatchlistItem[];
}

const PortfolioPerformance: React.FC<PortfolioPerformanceProps> = ({
  watchlist,
}) => {
  const [latestPrices, setLatestPrices] = useState<{
    [symbol: string]: number;
  }>({});

  useEffect(() => {
    // Get unique stock symbols from the watchlist
    const uniqueSymbols = Array.from(
      new Set(watchlist.map((item) => item.stock_symbol))
    );

    const fetchLatestPrices = async () => {
      const prices: { [symbol: string]: number } = {};
      // For each unique symbol, fetch its latest price from your backend endpoint
      await Promise.all(
        uniqueSymbols.map(async (symbol) => {
          try {
            const response = await axios.get(
              `http://localhost:3000/stocks/${symbol}`
            );
            // Expecting response.data.last_price to be the latest price
            prices[symbol] = parseFloat(response.data.last_price);
          } catch (err) {
            console.error(`Error fetching latest price for ${symbol}`, err);
          }
        })
      );
      setLatestPrices(prices);
    };

    if (uniqueSymbols.length > 0) {
      fetchLatestPrices();
    }
  }, [watchlist]);

  return (
    <div className="portfolio-performance">
      <h3>Portfolio Performance</h3>
      <table>
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Purchase Price</th>
            <th>Latest Price</th>
            <th>Quantity</th>
            <th>Profit / Loss</th>
          </tr>
        </thead>
        <tbody>
          {watchlist.map((item) => {
            const purchasePrice = parseFloat(item.price_at_time);
            const latestPrice = latestPrices[item.stock_symbol] || 0;
            const profitLoss =
              (latestPrice - purchasePrice) * Number(item.quantity);
            return (
              <tr key={item.id}>
                <td>{item.stock_symbol}</td>
                <td>${purchasePrice.toFixed(2)}</td>
                <td>${latestPrice.toFixed(2)}</td>
                <td>{item.quantity}</td>
                <td style={{ color: profitLoss >= 0 ? "green" : "red" }}>
                  ${profitLoss.toFixed(2)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PortfolioPerformance;
