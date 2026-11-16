import { useEffect, useState } from "react";
import { Heart, House, LogOut, Menu, X } from "lucide-react";
import { useApp } from "../context/AppContext";
import { btnGhost, btnPrimary } from "./ui";

const links = [
  { label: "Home", name: "home" },
  { label: "Buy", name: "listings", params: { intent: "buy" } },
  { label: "Rent", name: "listings", params: { intent: "rent" } },
  { label: "Sell", name: "sell" },
  { label: "Brokers", name: "brokers" },
];

function isActive(label, view) {
  if (label === "Home") return view.name === "home";
  if (label === "Buy") return view.name === "listings" && view.intent === "buy";
  if (label === "Rent") return view.name === "listings" && view.intent === "rent";
  if (label === "Sell") return view.name === "sell" || (view.name === "register" && view.role === "owner");
  if (label === "Brokers") return view.name === "brokers" || (view.name === "register" && view.role === "broker");
  return false;
}

export default function Navbar() {
  const { view, navigate, user, logout, savedIds } = useApp();
  const [open, setOpen] = useState(false);
  const firstName = user?.name?.split(" ")[0];

  useEffect(() => {
    setOpen(false);
  }, [view]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (name, params) => {
    setOpen(false);
    navigate(name, params);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <button type="button" onClick={() => go("home")} className="flex cursor-pointer items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green text-white">
            <House className="h-5 w-5" />
          </span>
          <span className="text-left leading-none">
            <span className="block font-display text-lg font-semibold text-navy">Apna Estate</span>
            <span className="mt-1 block text-[10px] font-extrabold tracking-[0.16em] text-green uppercase">
              Pan-India
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => go(link.name, link.params)}
              className={`cursor-pointer rounded-full px-3.5 py-2 text-sm font-bold transition ${
                isActive(link.label, view) ? "bg-mist text-green" : "text-navy hover:bg-mist"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => go("shortlist")}
            className="relative cursor-pointer rounded-full border border-line p-2.5 text-navy hover:bg-mist"
            aria-label={`Shortlist, ${savedIds.length} saved`}
          >
            <Heart className={`h-4 w-4 ${savedIds.length ? "fill-green text-green" : ""}`} />
            {savedIds.length > 0 ? (
              <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-green px-1 text-[10px] font-bold text-white">
                {savedIds.length}
              </span>
            ) : null}
          </button>

          {user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <span className="text-sm font-bold text-navy">Hi, {firstName}</span>
              <button type="button" onClick={logout} className={btnGhost}>
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={() => go("login")}
                className={`${btnGhost} ${view.name === "login" ? "border-green text-green" : ""}`}
              >
                Login
              </button>
              <button type="button" onClick={() => go("signup")} className={btnPrimary}>
                Signup
              </button>
            </div>
          )}

          <button
            type="button"
            className="cursor-pointer rounded-full border border-line p-2.5 text-navy lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-line bg-white px-4 py-4 lg:hidden">
          <nav className="grid gap-1" aria-label="Mobile">
            {links.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => go(link.name, link.params)}
                className={`cursor-pointer rounded-2xl px-4 py-3 text-left text-sm font-bold ${
                  isActive(link.label, view) ? "bg-mist text-green" : "text-navy"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="mt-3 grid gap-2 sm:hidden">
            {user ? (
              <button type="button" onClick={logout} className={btnGhost}>
                Log out {firstName}
              </button>
            ) : (
              <>
                <button type="button" onClick={() => go("login")} className={btnGhost}>
                  Login
                </button>
                <button type="button" onClick={() => go("signup")} className={btnPrimary}>
                  Signup
                </button>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
