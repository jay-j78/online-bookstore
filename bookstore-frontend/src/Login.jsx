import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./Auth.css";

const API = "http://localhost:8080/api/books";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const username = email.trim();

    try {
      const response = await fetch(API, {
        headers: {
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          response.status === 401
            ? "Incorrect username/email or password."
            : `Login check failed (${response.status}).`
        );
      }

      // Store the exact username used for authentication.
      login(username, password);

      // Administrators go to the dashboard; customers go to their destination.
      const destination =
        location.state?.from ||
        (username.toLowerCase() === "admin" ? "/admin" : "/");

      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err.message.includes("Failed to fetch")
          ? "Unable to contact the server. Check that the backend is running."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-card" onSubmit={submit}>
        <Link to="/" className="auth-brand">
          b. bookhaven
        </Link>

        <p className="auth-eyebrow">WELCOME BACK</p>

        <h1>Log in</h1>

        <p className="auth-subtitle">
          Sign in to access your account, cart and orders.
        </p>

        {location.state?.message && (
          <p className="auth-success">{location.state.message}</p>
        )}

        <label htmlFor="email">Username or email address</label>

        <input
          id="email"
          type="text"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="admin or you@example.com"
          required
          autoComplete="username"
        />

        <label htmlFor="password">Password</label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Your password"
          required
          autoComplete="current-password"
        />

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <button className="auth-submit" disabled={loading}>
          {loading ? "Checking credentials..." : "Log in"}
        </button>

        <p className="auth-switch">
          New to Bookhaven? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </main>
  );
}