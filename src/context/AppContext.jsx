import { createContext, useContext, useEffect, useState } from "react";
import { parseHash, readJSON, toHash, writeJSON } from "../lib/helpers";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [view, setView] = useState(() => parseHash());
  const [user, setUser] = useState(() => readJSON("ae-user", null));
  const [savedIds, setSavedIds] = useState(() => readJSON("ae-saved", []));
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (!window.location.hash) {
      window.location.replace("#home");
    }
    const sync = () => setView(parseHash());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  useEffect(() => {
    writeJSON("ae-user", user);
  }, [user]);

  useEffect(() => {
    writeJSON("ae-saved", savedIds);
  }, [savedIds]);

  useEffect(() => {
    const titles = {
      home: "Apna Estate",
      listings: "Properties",
      property: "Property details",
      sell: "Sell a property",
      brokers: "Brokers",
      login: "Login",
      signup: "Signup",
      registry: "Registry services",
      register: "Registration",
      shortlist: "Shortlist",
      about: "About",
      contact: "Contact",
    };
    document.title = `${titles[view.name] || "Apna Estate"} | Apna Estate`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [view]);

  const pushToast = (message) => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 3400);
  };

  const navigate = (name, params = {}) => {
    const next = toHash(name, params);
    if (window.location.hash === `#${next}`) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    window.location.hash = next;
  };

  const toggleSave = (id) => {
    setSavedIds((current) => {
      if (current.includes(id)) {
        pushToast("Removed from your shortlist.");
        return current.filter((item) => item !== id);
      }
      pushToast("Saved to your shortlist.");
      return [...current, id];
    });
  };

  const clearShortlist = () => {
    setSavedIds([]);
    pushToast("Shortlist cleared.");
  };

  const signup = (profile) => {
    const users = readJSON("ae-users", []);
    if (users.some((item) => item.email.toLowerCase() === profile.email.toLowerCase())) {
      return { ok: false, message: "An account with this email already exists. Please log in." };
    }
    writeJSON("ae-users", [...users, profile]);
    setUser({ name: profile.name, email: profile.email, phone: profile.phone });
    return { ok: true };
  };

  const login = (email, password) => {
    const users = readJSON("ae-users", []);
    const found = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { ok: false, message: "No account found for this email. Please sign up first." };
    }
    if (found.password !== password) {
      return { ok: false, message: "That password does not match this account." };
    }
    setUser({ name: found.name, email: found.email, phone: found.phone });
    return { ok: true };
  };

  const logout = () => {
    setUser(null);
    pushToast("You have been logged out.");
    navigate("home");
  };

  const value = {
    view,
    user,
    savedIds,
    toasts,
    navigate,
    pushToast,
    toggleSave,
    clearShortlist,
    signup,
    login,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
