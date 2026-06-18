import { useState } from "react";
import styles from "./Signup.module.css";
import { signUpUser } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    try {
      await signUpUser(firstName, middleName, lastName, email, password);
      navigate("/");
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
          <div className={styles.formTitle}>Create your account</div>

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.nameRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>First Name *</label>
              <input
                type="text"
                placeholder="First"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Last Name</label>
              <input
                type="text"
                placeholder="Last"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Middle Name (optional)</label>
            <input
              type="text"
              placeholder="Middle name"
              value={middleName}
              onChange={e => setMiddleName(e.target.value)}
              autoComplete="additional-name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Email address *</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Password *</label>
            <input
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn}>Create Account</button>
          <p className={styles.signupText}>
            Already have an account? <Link to="/">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
