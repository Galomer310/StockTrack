import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import stockRoutes from "./routes/stockRoutes";
import watchlistRoutes from "./routes/watchlistRoutes";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// Routes
app.use("/auth", authRoutes);
app.use("/stocks", stockRoutes);
app.use("/watchlist", watchlistRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
