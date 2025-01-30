import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../features/authSlice"; // Import your setUser action

const Login = () => {
  const [email, setEmail] = useState(""); // Changed from username to email
  const [password, setPassword] = useState("");
  const dispatch = useDispatch(); // Hook to dispatch actions
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const userData = { email, password };

    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Login failed");
        return;
      }

      const data = await response.json();
      console.log("Login successful:", data);

      // Store user data and access token in Redux
      dispatch(
        setUser({
          user: { id: data.user.id, email: data.user.email },
          accessToken: data.accessToken,
        })
      );

      // Redirect to the user page after successful login
      navigate("/user");
    } catch (error) {
      alert("Error during login: " + (error as Error).message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      <button onClick={() => navigate("/")}>Back to Home</button>
    </div>
  );
};

export default Login;
