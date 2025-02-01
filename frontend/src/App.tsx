import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "./store";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserPage from "./pages/UserPage";
import Home from "./pages/Home";
import StockSearch from "./pages/StockSearch";
import Watchlist from "./pages/Watchlist";

const App = () => {
  const user = useSelector((state: RootState) => state.auth.user);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/user"
          element={user ? <UserPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/search"
          element={user ? <StockSearch /> : <Navigate to="/login" />}
        />
        <Route
          path="/watchlist"
          element={user ? <Watchlist /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
};

export default App;
