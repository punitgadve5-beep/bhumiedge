
import { useState } from "react";
import { supabase } from "../lib/supabase";

function AuthModal({ onClose, onLoginSuccess }) {
  const [mode, setMode] = useState("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (mode === "signup") {
        if (password.length < 6) {
          throw new Error("Password kam se kam 6 characters ka hona chahiye.");
        }

        if (!fullName.trim()) {
          throw new Error("Apna full name enter karein.");
        }

        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        if (data.session) {
          onLoginSuccess(data.session.user);
          onClose();
        } else {
          setMessage(
            "Signup request successful! Email confirmation ke liye apna inbox check karein."
          );
        }
      }

      if (mode === "login") {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) throw error;

        onLoginSuccess(data.user);
        onClose();
      }

      if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(
          email.trim(),
          {
            redirectTo: window.location.origin,
          }
        );

        if (error) throw error;

        setMessage(
          "Agar email delivery available hai, password reset link aapke inbox mein aayega."
        );
      }
    } catch (err) {
      setError(err.message || "Kuch galat ho gaya. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button">
          ×
        </button>

        <h2>Welcome to bhumiEdge</h2>

        <p>
          {mode === "login" && "Login to continue"}
          {mode === "signup" && "Create your account"}
          {mode === "forgot" && "Reset your password"}
        </p>

        {mode !== "forgot" && (
          <div className="auth-mode-switch">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
                setMessage("");
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          {mode !== "forgot" && (
            <input
              type="password"
              placeholder="Password (minimum 6 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          )}

          {error && (
            <p className="auth-error">{error}</p>
          )}

          {message && (
            <p className="auth-message">{message}</p>
          )}

          <button type="submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : mode === "signup"
              ? "Create Account"
              : "Send Reset Link"}
          </button>
        </form>

        {mode === "login" && (
          <button
            type="button"
            className="forgot-password-btn"
            onClick={() => {
              setMode("forgot");
              setError("");
              setMessage("");
            }}
          >
            Forgot Password?
          </button>
        )}

        {mode === "forgot" && (
          <button
            type="button"
            className="forgot-password-btn"
            onClick={() => {
              setMode("login");
              setError("");
              setMessage("");
            }}
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthModal;
