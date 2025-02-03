import { Request, Response, NextFunction, RequestHandler } from "express";
import pool from "../config/db";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

// 📌 Get all watchlist stocks for a user, including total price calculation
export const getWatchlist: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await pool.query(
      "SELECT * FROM watchlist WHERE user_id = $1 ORDER BY added_at ASC",
      [userId]
    );
    const watchlist = result.rows;
    // Calculate total price based on quantity and price
    const totalPrice = watchlist.reduce((sum: number, item: any) => {
      return sum + parseFloat(item.price_at_time) * Number(item.quantity);
    }, 0);
    res.json({ total: totalPrice, watchlist });
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    next(error);
  }
};

  
// 📌 Add a stock to the watchlist (with price and timestamp)
// Modified addToWatchlist function
export const addToWatchlist: RequestHandler = async (req, res, next): Promise<void> => {
  const { stock_symbol, quantity } = req.body; // New: quantity from client
  const userId = (req as any).user.id;
  if (!stock_symbol) {
    res.status(400).json({ error: "Stock symbol is required" });
    return;
  }
  // Use provided quantity or default to 1
  const qty = quantity ? parseInt(quantity) : 1;

  try {
    let currentPrice: number;
    // Check if stock data exists and is fresh (within 24 hours)
    const stockDataResult = await pool.query(
      "SELECT * FROM stocks WHERE stock_symbol = $1 AND updated_at > NOW() - INTERVAL '24 hours'",
      [stock_symbol]
    );

    if (stockDataResult.rows.length > 0) {
      currentPrice = parseFloat(stockDataResult.rows[0].last_price);
    } else {
      const response = await axios.get(
        `https://api.polygon.io/v2/aggs/ticker/${stock_symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
      );
      currentPrice = response.data.results?.[0]?.c;
      if (!currentPrice) throw new Error("Invalid stock data");
      await pool.query(
        `INSERT INTO stocks (stock_symbol, last_price, updated_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (stock_symbol)
         DO UPDATE SET last_price = $2, updated_at = NOW()`,
        [stock_symbol, currentPrice]
      );
    }

    // Insert the new watchlist entry with the quantity
    await pool.query(
      `INSERT INTO watchlist (user_id, stock_symbol, price_at_time, quantity, added_at)
       VALUES ($1, $2, $3, $4, NOW())`,
      [userId, stock_symbol, currentPrice, qty]
    );
    res.json({ message: `Stock ${stock_symbol} added with price ${currentPrice} and quantity ${qty}` });
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    next(error);
  }
};


// 📌 Remove a stock from the watchlist
export const removeFromWatchlist: RequestHandler = async (req, res, next): Promise<void> => {
    const { ticker } = req.params;
    const userId = (req as any).user.id; // Extract authenticated user ID

    if (!ticker) {
        res.status(400).json({ error: "Stock symbol is required" });
        return;
    }

    try {
        const result = await pool.query("DELETE FROM watchlist WHERE user_id = $1 AND stock_symbol = $2", [userId, ticker]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: `Stock ${ticker} not found in watchlist` });
            return;
        }

        res.json({ message: `Stock ${ticker} removed from watchlist` });
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        next(error);
    }
};

// New: Update a watchlist item (edit quantity, price, or added_at date)
export const updateWatchlistItem: RequestHandler = async (req, res, next): Promise<void> => {
  const { id } = req.params; // Watchlist item id
  const { quantity, price_at_time, added_at } = req.body; // Fields to update
  const userId = (req as any).user.id;

  try {
    // Verify the record exists and belongs to the user
    const result = await pool.query(
      "SELECT * FROM watchlist WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Watchlist item not found" });
      return;
    }
    // Update the record—using COALESCE to keep current values if fields aren’t provided
    await pool.query(
      `UPDATE watchlist 
       SET quantity = COALESCE($1, quantity),
           price_at_time = COALESCE($2, price_at_time),
           added_at = COALESCE($3, added_at)
       WHERE id = $4`,
      [quantity, price_at_time, added_at, id]
    );
    res.json({ message: "Watchlist item updated" });
  } catch (error) {
    console.error("Error updating watchlist item:", error);
    next(error);
  }
};
