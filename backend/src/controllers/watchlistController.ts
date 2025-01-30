import { Request, Response, NextFunction, RequestHandler } from "express";
import pool from "../config/db";

// 📌 Get all watchlist stocks for a user
export const getWatchlist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await pool.query("SELECT * FROM watchlist");
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching watchlist:", error);
        next(error); // Call next() if there's an error
    }
};

// 📌 Add a stock to the watchlist
export const addToWatchlist: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { stock_symbol, userId } = req.body;

    if (!stock_symbol || !userId) {
        res.status(400).json({ error: "Stock symbol and userId are required" });
        return;
    }

    try {
        await pool.query("INSERT INTO watchlist (user_id, stock_symbol) VALUES ($1, $2)", [userId, stock_symbol]);
        res.json({ message: `Stock ${stock_symbol} added to watchlist` });
        return;
    } catch (error) {
        console.error("Error adding to watchlist:", error);
        next(error); // Call next() if there's an error
    }
};

// 📌 Remove a stock from the watchlist
export const removeFromWatchlist: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    const { ticker } = req.params;  // Make sure to use 'ticker' as per the route

    if (!ticker) {
        res.status(400).json({ error: "Stock symbol is required" });
        return;
    }

    try {
        // Remove the stock from the watchlist
        const result = await pool.query("DELETE FROM watchlist WHERE stock_symbol = $1", [ticker]);

        if (result.rowCount === 0) {
            res.status(404).json({ error: `Stock ${ticker} not found in watchlist` });
            return;
        }

        res.json({ message: `Stock ${ticker} removed from watchlist` });
    } catch (error) {
        console.error("Error removing from watchlist:", error);
        next(error); // Call next() if there's an error
    }
};
