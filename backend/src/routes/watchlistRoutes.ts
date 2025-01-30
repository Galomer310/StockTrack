import express from "express";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../controllers/watchlistController";

const router = express.Router();

//  Fetch user's watchlist
router.get("/", getWatchlist);

//  Add a stock to the watchlist
router.post("/", addToWatchlist);

//  Remove a stock from the watchlist
router.delete("/:ticker", removeFromWatchlist);

export default router;
