import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";
import StockDistributionPieChart from "../components/StockDistributionPieChart";
import PortfolioPerformance from "../components/PortfolioPerformance";

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editingItemData, setEditingItemData] = useState<any>({});
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
  const handleRemoveFromWatchlist = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3000/watchlist/${id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const updatedWatchlist = watchlist.filter((stock) => stock.id !== id);
      setWatchlist(updatedWatchlist);
      const newTotal = updatedWatchlist.reduce((sum, item) => {
        return sum + parseFloat(item.price_at_time) * Number(item.quantity);
      }, 0);
      setTotal(newTotal);
      alert(`Watchlist item removed`);
    } catch (err: any) {
      console.error(
        "Error removing from watchlist:",
        err.response?.data || err.message
      );
    }
  };

  // Enter edit mode for a specific item
  const handleEdit = (item: any) => {
    setEditingItemId(item.id);
    setEditingItemData({
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      added_at: item.added_at,
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditingItemData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSaveEdit = async (id: number) => {
    try {
      await axios.put(
        `http://localhost:3000/watchlist/${id}`,
        editingItemData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      const updatedWatchlist = watchlist.map((item) =>
        item.id === id ? { ...item, ...editingItemData } : item
      );
      setWatchlist(updatedWatchlist);
      const newTotal = updatedWatchlist.reduce((sum, item) => {
        return sum + parseFloat(item.price_at_time) * Number(item.quantity);
      }, 0);
      setTotal(newTotal);
      setEditingItemId(null);
      setEditingItemData({});
      alert("Watchlist item updated");
    } catch (err: any) {
      console.error(
        "Error updating watchlist item:",
        err.response?.data || err.message
      );
    }
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingItemData({});
  };

  return (
    <div>
      <h3>Your Watchlist</h3>
      <h4>Total Portfolio Value: ${total.toFixed(2)}</h4>

      <StockDistributionPieChart watchlist={watchlist} />

      {/* New Component for Profit/Loss */}
      <PortfolioPerformance watchlist={watchlist} />

      {/* Watchlist Container */}
      <div className="watchlist">
        {watchlist.map((stock) => (
          <div
            key={stock.id}
            className={`watchlist-row ${
              editingItemId === stock.id ? "editing" : ""
            }`}
          >
            <div className="ticker">{stock.stock_symbol}</div>
            <div className="price">
              {editingItemId === stock.id ? (
                <input
                  type="number"
                  name="price_at_time"
                  value={editingItemData.price_at_time}
                  onChange={handleEditChange}
                  step="0.01"
                  required
                />
              ) : (
                `$${parseFloat(stock.price_at_time).toFixed(2)}`
              )}
            </div>
            <div className="quantity">
              {editingItemId === stock.id ? (
                <input
                  type="number"
                  name="quantity"
                  value={editingItemData.quantity}
                  onChange={handleEditChange}
                  min="1"
                  required
                />
              ) : (
                stock.quantity
              )}
            </div>
            <div className="added">
              {editingItemId === stock.id ? (
                <input
                  type="datetime-local"
                  name="added_at"
                  value={new Date(editingItemData.added_at)
                    .toISOString()
                    .slice(0, 16)}
                  onChange={handleEditChange}
                />
              ) : (
                new Date(stock.added_at).toLocaleString()
              )}
            </div>
            <div className="actions">
              {editingItemId === stock.id ? (
                <>
                  <button onClick={() => handleSaveEdit(stock.id)}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => handleEdit(stock)}>Edit</button>
                  <button onClick={() => handleRemoveFromWatchlist(stock.id)}>
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => navigate("/manual-add")}>
        Add Stock Manually
      </button>
    </div>
  );
};

export default Watchlist;
