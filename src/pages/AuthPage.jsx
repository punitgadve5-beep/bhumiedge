import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { isEmail, isPhone } from "../lib/helpers";
import { useApp } from "../context/AppContext";
import { Field, PageHeader, btnGhost, btnPrimary, inputClass } from "../components/ui";

export default function AuthPage({ mode }) {
  const { user, login, signup, logout, navigate, pushToast } = useApp();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (mode === "signup" && form.name.trim().length < 2) nextErrors.name = "Enter your full name.";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (mode === "signup" && !isPhone(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (form.password.length < 6) nextErrors.password = "Use at least 6 characters.";
    setErrors(nextErrors);
    setFormError("");
    if (Object.keys(nextErrors).length) return;

    if (mode === "signup") {
      const result = signup({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      pushToast(`Welcome to Apna Estate, ${form.name.trim().split(" ")[0]}.`);
      navigate("home");
      return;
    }

    const result = login(form.email.trim(), form.password);
    if (!result.ok) {
      setFormError(result.message);
      return;
    }
    pushToast("You are now logged in.");
    navigate("home");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Account"
        title={mode === "signup" ? "Signup" : "Login"}
        text="Accounts on this preview are stored only in your browser, so you can try login, signup and logout without a server."
      />
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-5 grid grid-cols-2 rounded-full bg-mist p-1">
          <button type="button" onClick={() => navigate("login")} className={`cursor-pointer rounded-full py-2 text-sm font-bold ${mode === "login" ? "bg-navy text-white" : "text-navy"}`}>
            Login
          </button>
          <button type="button" onClick={() => navigate("signup")} className={`cursor-pointer rounded-full py-2 text-sm font-bold ${mode === "signup" ? "bg-navy text-white" : "text-navy"}`}>
            Signup
          </button>
        </div>

        {user ? (
          <div className="rounded-[2rem] border border-line p-6">
            <h2 className="text-3xl text-navy">You are signed in</h2>
            <p className="mt-2 text-sm text-slate-600">
              {user.name} · {user.email}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button type="button" onClick={() => navigate("shortlist")} className={btnPrimary}>
                Open shortlist
              </button>
              <button type="button" onClick={() => navigate("sell")} className={btnGhost}>
                List a property
              </button>
              <button type="button" onClick={logout} className={btnGhost}>
                Log out
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4 rounded-[2rem] border border-line p-6">
            {mode === "signup" ? (
              <Field label="Full name" error={errors.name}>
                <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} />
              </Field>
            ) : null}
            <Field label="Email" error={errors.email}>
              <input className={inputClass} type="email" autoComplete="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
            </Field>
            {mode === "signup" ? (
              <Field label="Phone" error={errors.phone}>
                <input className={inputClass} inputMode="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              </Field>
            ) : null}
            <Field label="Password" error={errors.password}>
              <div className="relative">
                <input
                  className={`${inputClass} pr-12`}
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  value={form.password}
                  onChange={(event) => update("password", event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer text-slate-500"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </Field>
            {formError ? <p className="text-sm font-semibold text-red-600">{formError}</p> : null}
            <button type="submit" className={`${btnPrimary} w-full`}>
              {mode === "signup" ? "Create account" : "Login"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
