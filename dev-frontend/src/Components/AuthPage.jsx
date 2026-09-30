import { useState } from "react";
import { Link } from "react-router-dom";
import { signupToServer, loginToServer } from "../services/auth"
import { useNavigate } from "react-router-dom";
/**
 * DevConnect — Auth Page (Sign in / Sign up)
 * Matches the code-editor visual theme used across the app.
 *
 * Usage:
 *   import AuthPage from "./AuthPage";
 *   <Route path="/auth" element={<AuthPage />} />
 *
 * Wire up onLogin / onSignup with your actual API calls
 * (e.g. POST /api/auth/login, POST /api/auth/signup).
 */

function Field({ label, type = "text", value, onChange, placeholder }) {
  return (
    <div className="mb-5">
      <label className="block font-mono text-[0.76rem] text-[#7eb6e0] mb-2">
        <span className="text-[#b39ddb]">const </span>
        {label}
        <span className="text-[#5a5c6b]"> =</span>
      </label>

      <input
        name={label}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-[#2a2c37] border border-[#383a46] rounded-md px-3.5 py-2.5
                   text-[#e8e9ee] font-mono text-[0.85rem] outline-none
                   focus:border-[#8fd19e] placeholder:text-[#5a5c6b] transition-colors"
      />
    </div>
  );
}

export default function AuthPage({ onLogin, onSignup }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [form, setForm] = useState({ userName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || (mode === "signup" && !form.userName)) {
      setError("Please fill in all fields.");
      return;
    }

    // setLoading(true);
    // try {
    //   if (mode === "login") {
    //     await onLogin?.({ email: form.email, password: form.password });
    //   } else {
    //     await onSignup?.({
    //       userName: form.userName,
    //       email: form.email,
    //       password: form.password,
    //     });
    //   }
    // } catch (err) {
    //   setError(err?.message || "Something went wrong. Try again.");
    // } finally {
    //   setLoading(false);
    // }

    if (mode == 'login') {
      const res = await loginToServer({ email: form.email, password: form.password });
      if (res === true) {
        navigate('/landingPage');
      }
    } else if (mode == 'signup') {
      const formData = new FormData(e.target);
      const userName = formData.get("userName");
      const email = formData.get('email');
      const password = formData.get('password');
      const res = await signupToServer({ userName, email, password });
      setMode(res);
      setForm({ userName: "", email: form.email, password: "" });

    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#1e1f26] text-[#e8e9ee] font-sans">
      {/* editor chrome bar */}
      <div className="bg-[#23252e] border-b border-[#383a46]">
        <div className="flex items-center gap-2.5 px-5 py-3">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#e18a8a]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#e8a87c]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#8fd19e]" />
          </div>
          <span className="ml-3 font-mono text-[0.78rem] cursor-pointer text-[#5a5c6b]">
            ~/devconnect/auth.js
          </span>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[880px] grid grid-cols-1 md:grid-cols-2 border border-[#383a46] rounded-xl overflow-hidden">
          {/* form side */}
          <div className="bg-[#23252e] p-8 sm:p-11">
            <Link
              to="/"
              className="inline-block mb-6 font-mono text-[0.78rem] text-[#8b8d9b] hover:text-[#e8e9ee]"
            >
              ← back to devconnect
            </Link>

            <div className="flex border border-[#383a46] rounded-md overflow-hidden mb-8">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 text-center py-2 font-mono text-[0.8rem] transition-colors ${mode === "login"
                  ? "bg-[#8fd19e] text-[#182019] font-semibold"
                  : "bg-[#2a2c37] text-[#5a5c6b]"
                  }`}
              >
                login.js
              </button>

              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 text-center py-2 font-mono text-[0.8rem] transition-colors ${mode === "signup"
                  ? "bg-[#8fd19e] text-[#182019] font-semibold"
                  : "bg-[#2a2c37] text-[#5a5c6b]"
                  }`}
              >
                signup.js
              </button>
            </div>

            <h1 className="text-[1.4rem] font-semibold mb-1">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-[#8b8d9b] text-[0.85rem] mb-7">
              {mode === "login"
                ? "Sign in to write, comment, and follow."
                : "Join to start writing and connecting."}
            </p>

            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <Field
                  label="userName"
                  name="userName"
                  value={form.userName}
                  onChange={update("userName")}
                  placeholder="dev_jane"
                />
              )}
              <Field
                label="email"
                name="email"
                type="email"
                value={form.email}
                onChange={update("email")}
                placeholder="you@example.com"
              />
              <Field
                label="password"
                name="password"
                type="password"
                value={form.password}
                onChange={update("password")}
                placeholder="••••••••"
              />

              {mode === "login" && (
                <div className="flex justify-end mb-6">
                  <a
                    href="/forgot-password"
                    className="font-mono text-[0.78rem] text-[#7eb6e0] hover:underline"
                  >
                    forgot password?
                  </a>
                </div>
              )}

              {error && (
                <p className="text-[#e18a8a] font-mono text-[0.78rem] mb-4">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md bg-[#8fd19e] text-[#182019] font-mono
                           text-[0.88rem] font-semibold hover:opacity-90 disabled:opacity-60
                           transition-opacity"
              >
                {loading
                  ? "running..."
                  : mode === "login"
                    ? "authenticate()"
                    : "createAccount()"}
              </button>
            </form>

            <p className="text-center mt-6 text-[0.82rem] text-[#8b8d9b]">
              {mode === "login" ? (
                <>
                  don't have an account?{" "}
                  <button
                    onClick={() => setMode("signup")}
                    className="text-[#8fd19e] font-medium"
                  >
                    signup.js →
                  </button>
                </>
              ) : (
                <>
                  already have an account?{" "}
                  <button
                    onClick={() => setMode("login")}
                    className="text-[#8fd19e] font-medium"
                  >
                    login.js →
                  </button>
                </>
              )}
            </p>
          </div>

          {/* live preview side */}
          <div className="hidden md:flex flex-col justify-center bg-[#2a2c37] border-l border-[#383a46] p-9">
            <div className="font-mono text-[0.76rem] text-[#5a5c6b] mb-3.5">
              // live preview
            </div>
            <div className="bg-[#1e1f26] border border-[#383a46] rounded-lg p-5 font-mono text-[0.82rem] leading-8">
              <span className="text-[#b39ddb]">const</span>{" "}
              <span className="text-[#7eb6e0]">user</span> = {"{"}
              <br />
              {mode === "signup" && (
                <>
                  &nbsp;&nbsp;userName:{" "}
                  <span className="text-[#8fd19e]">
                    "{form.userName || "..."}"
                  </span>
                  ,<br />
                </>
              )}
              &nbsp;&nbsp;email:{" "}
              <span className="text-[#8fd19e]">"{form.email || "..."}"</span>,
              <br />
              &nbsp;&nbsp;password:{" "}
              <span className="text-[#8fd19e]">
                "{form.password ? "•".repeat(form.password.length) : "..."}"
              </span>
              ,<br />
              &nbsp;&nbsp;status: <span className="text-[#8b8d9b]">pending</span>
              <br />
              {"}"};
            </div>
            <p className="mt-5 text-[0.82rem] text-[#5a5c6b] leading-relaxed">
              Your credentials are hashed and never stored as plain text — this
              preview is just for show.
            </p>
          </div>
        </div>
      </main>

      {/* status bar */}
      <div className="flex justify-between px-7 py-3 bg-[#23252e] border-t border-[#383a46] font-mono text-[0.75rem] text-[#5a5c6b] flex-wrap gap-2.5">
        <div>
          <span className="text-[#8fd19e]">⌥ main</span> &nbsp; devconnect
        </div>
        <div>UTF-8 · auth.js · React · Express · JWT</div>
      </div>
    </div>
  );
}
