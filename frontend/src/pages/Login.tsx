import { useState } from "react";
import styles from "./Login.module.css";
import { loginUser } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    try {
      const data = await loginUser(email, password);
      localStorage.setItem("userId", data.user.id);
      localStorage.setItem("globalRole", data.user.role);
      navigate("/profile", { replace: true });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.appName}>IssueTracker</div>
          <div className={styles.appTagline}>Project management made simple</div>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formTitle}>Sign in to your account</div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>Sign In</button>
          <p className={styles.signupText}>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
