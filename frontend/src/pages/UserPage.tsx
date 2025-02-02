import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../store"; // Import RootState to access Redux state
import Watchlist from "./Watchlist";

const UserPage = () => {
  const user = useSelector((state: RootState) => state.auth.user); // Get user from Redux store
  const navigate = useNavigate();

  // If there is no user (meaning the user is not logged in), redirect to the login page
  if (!user) {
    navigate("/login");
  }

  return (
    <div className="user-page-container">
      {user ? (
        <div>
          <h1>Welcome, {user.email}</h1>
          <p>You are logged in!</p>
          <Watchlist />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default UserPage;
