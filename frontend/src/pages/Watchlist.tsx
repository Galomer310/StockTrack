// Frontend/src/pages/Watchlist.tsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useNavigate } from "react-router-dom";

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
        // Response: { total, watchlist }
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
      const updatedWatchlist = watchlist.filter(
        (stock) => stock.stock_symbol !== stock_symbol
      );
      setWatchlist(updatedWatchlist);
      // Recalculate total
      const newTotal = updatedWatchlist.reduce((sum, item) => {
        return sum + parseFloat(item.price_at_time) * Number(item.quantity);
      }, 0);
      setTotal(newTotal);
      alert(`Stock ${stock_symbol} removed from watchlist`);
    } catch (err: any) {
      console.error(
        "Error removing from watchlist:",
        err.response?.data || err.message
      );
    }
  };

  // Toggle edit mode for a specific item
  const handleEdit = (item: any) => {
    setEditingItemId(item.id);
    // Prepare data for editing. For the date, convert to a local datetime string.
    setEditingItemData({
      quantity: item.quantity,
      price_at_time: item.price_at_time,
      // Format added_at for input[type="datetime-local"]
      added_at: item.added_at
        ? new Date(item.added_at).toISOString().slice(0, 16)
        : "",
    });
  };

  // Handle changes in the edit form
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
      // Update the local watchlist state
      const updatedWatchlist = watchlist.map((item) =>
        item.id === id ? { ...item, ...editingItemData } : item
      );
      setWatchlist(updatedWatchlist);
      // Recalculate total
      const newTotal = updatedWatchlist.reduce((sum, item) => {
        return sum + parseFloat(item.price_at_time) * Number(item.quantity);
      }, 0);
      setTotal(newTotal);
      setEditingItemId(null);
      setEditingItemData({});
    } catch (err) {
      console.error("Error updating watchlist item", err);
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
                borderBottom: "1px solid #ccc",
                marginBottom: "1rem",
                paddingBottom: "1rem",
              }}
            >
              {editingItemId === stock.id ? (
                // Edit mode: show inputs for quantity, price, and date
                <div>
                  <label>
                    Quantity:
                    <input
                      type="number"
                      name="quantity"
                      value={editingItemData.quantity}
                      onChange={handleEditChange}
                      min="1"
                    />
                  </label>
                  <br />
                  <label>
                    Price:
                    <input
                      type="number"
                      name="price_at_time"
                      value={editingItemData.price_at_time}
                      onChange={handleEditChange}
                      step="0.01"
                    />
                  </label>
                  <br />
                  <label>
                    Added Date:
                    <input
                      type="datetime-local"
                      name="added_at"
                      value={editingItemData.added_at}
                      onChange={handleEditChange}
                    />
                  </label>
                  <br />
                  <button onClick={() => handleSaveEdit(stock.id)}>Save</button>
                  <button onClick={() => setEditingItemId(null)}>Cancel</button>
                </div>
              ) : (
                // Display mode: show item details
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
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
                    <p>Quantity: {stock.quantity}</p>
                  </div>
                  <div>
                    <button onClick={() => handleEdit(stock)}>Edit</button>
                    <button
                      onClick={() =>
                        handleRemoveFromWatchlist(stock.stock_symbol)
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
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
