import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store";

const UserPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const navigate = useNavigate();

  if (!user) {
    navigate("/login");
  }

  return (
    <div className="user-page-container">
      {user ? (
        <div>
          <h1>Welcome, {user.email}</h1>
          <p>You are logged in!</p>
          <button onClick={() => navigate("/")}>Back to Home</button>
          <button onClick={() => navigate("/search")}>Search Stocks</button>
          <button onClick={() => navigate("/watchlist")}>View Watchlist</button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserPage;
