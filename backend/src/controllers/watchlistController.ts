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
  
      // Calculate the total price (sum of price_at_time)
      const totalPrice = watchlist.reduce((sum: number, item: any) => {
        return sum + parseFloat(item.price_at_time);
      }, 0);
  
      res.json({ total: totalPrice, watchlist });
    } catch (error) {
      console.error("Error fetching watchlist:", error);
      next(error);
    }
  };
  
// 📌 Add a stock to the watchlist (with price and timestamp)
export const addToWatchlist: RequestHandler = async (req, res, next): Promise<void> => {
    const { stock_symbol } = req.body;
    const userId = (req as any).user.id;
  
    if (!stock_symbol) {
      res.status(400).json({ error: "Stock symbol is required" });
      return;
    }
  
    try {
      let currentPrice: number;
  
      // Check if stock data exists and is fresh (within 24 hours)
      const stockDataResult = await pool.query(
        "SELECT * FROM stocks WHERE stock_symbol = $1 AND updated_at > NOW() - INTERVAL '24 hours'",
        [stock_symbol]
      );
  
      if (stockDataResult.rows.length > 0) {
        // Use cached price
        currentPrice = parseFloat(stockDataResult.rows[0].last_price);
      } else {
        // Fetch fresh data from Polygon.io
        const response = await axios.get(
          `https://api.polygon.io/v2/aggs/ticker/${stock_symbol}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
        );
        currentPrice = response.data.results?.[0]?.c;
        if (!currentPrice) {
          throw new Error("Invalid stock data");
        }
        // Save fresh data in stocks table (insert or update)
        await pool.query(
          `INSERT INTO stocks (stock_symbol, last_price, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (stock_symbol)
           DO UPDATE SET last_price = $2, updated_at = NOW()`,
          [stock_symbol, currentPrice]
        );
      }
  
      // Insert the watchlist entry including the price at the time of addition
      await pool.query(
        `INSERT INTO watchlist (user_id, stock_symbol, price_at_time, added_at)
         VALUES ($1, $2, $3, NOW())`,
        [userId, stock_symbol, currentPrice]
      );
  
      res.json({ message: `Stock ${stock_symbol} added to watchlist at price ${currentPrice}` });
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
