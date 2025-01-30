import { Request, Response } from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

export const getStockData = async (req: Request, res: Response): Promise<void> => {
    const { ticker } = req.params;

    if (!ticker) {
        res.status(400).json({ error: "Stock ticker is required" });
        return; // Ensure function execution stops here
    }

    try {
        const response = await axios.get(
            `https://api.polygon.io/v2/aggs/ticker/${ticker}/prev?adjusted=true&apiKey=${POLYGON_API_KEY}`
        );

        res.json(response.data);
    } catch (error: any) {
        console.error("Error fetching stock data:", error.message);
        res.status(500).json({ error: "Failed to fetch stock data", details: error.message });
    }
};
