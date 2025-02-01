import express from "express";
import { getWatchlist, addToWatchlist, removeFromWatchlist } from "../controllers/watchlistController";
import { authenticateUser } from "../middleware/authMiddleware";

const router = express.Router();

// ✅ Middleware correctly passes to the next function
router.get("/", authenticateUser, getWatchlist);
router.post("/", authenticateUser, addToWatchlist);
router.delete("/:ticker", authenticateUser, removeFromWatchlist);

export default router;
