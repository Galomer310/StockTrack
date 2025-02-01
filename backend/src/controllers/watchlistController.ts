import { Request, Response, NextFunction, RequestHandler } from "express";
import pool from "../config/db";

// 📌 Get all watchlist stocks for a user
export const getWatchlist: RequestHandler = async (req, res, next) => {
    try {
        const userId = (req as any).user.id; // Extract user ID from request
        const result = await pool.query("SELECT * FROM watchlist WHERE user_id = $1", [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        next(error);
    }
};

// 📌 Add a stock to the watchlist
export const addToWatchlist: RequestHandler = async (req, res, next): Promise<void> => {
    const { stock_symbol } = req.body;
    const userId = (req as any).user.id; // Extract authenticated user ID

    if (!stock_symbol) {
        res.status(400).json({ error: "Stock symbol is required" });
        return;
    }

    try {
        await pool.query("INSERT INTO watchlist (user_id, stock_symbol) VALUES ($1, $2)", [userId, stock_symbol]);
        res.json({ message: `Stock ${stock_symbol} added to watchlist` });
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
