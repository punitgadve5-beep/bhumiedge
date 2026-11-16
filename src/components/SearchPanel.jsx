import { useState } from "react";
import { MapPin, Search } from "lucide-react";
import { cities } from "../data/site";
import { useApp } from "../context/AppContext";
import { btnPrimary } from "./ui";

export default function SearchPanel({ intent = "buy", location = "", category = "all", allowAll = false }) {
  const { navigate, pushToast } = useApp();
  const normalize = (value) => {
    if (value === "rent") return "rent";
    if (allowAll && value === "all") return "all";
    return "buy";
  };
  const [mode, setMode] = useState(normalize(intent));
  const [place, setPlace] = useState(location);
  const options = allowAll ? ["all", "buy", "rent"] : ["buy", "rent"];

  const submit = (event) => {
    event.preventDefault();
    const nextLocation = place.trim();
    if (!nextLocation) {
      const message =
        mode === "rent"
          ? "Showing rentals across India."
          : mode === "all"
            ? "Showing every listing across India."
            : "Showing properties for sale across India.";
      pushToast(message);
    }
    navigate("listings", { intent: mode, location: nextLocation, category });
  };

  return (
    <form onSubmit={submit} className="rounded-3xl border border-line bg-white p-3 shadow-[0_24px_60px_-32px_rgba(12,30,54,0.45)]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="inline-flex rounded-full bg-mist p-1" role="group" aria-label="Buy or rent">
          {options.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`cursor-pointer rounded-full px-5 py-2 text-sm font-bold capitalize transition ${
                mode === item ? "bg-navy text-white shadow" : "text-slate-600 hover:text-navy"
              }`}
              aria-pressed={mode === item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Location</span>
            <MapPin className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-green" />
            <input
              list="apna-cities"
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              placeholder="City, locality or landmark"
              className="w-full rounded-full border border-line py-3 pr-4 pl-10 text-sm text-navy outline-none placeholder:text-slate-400 focus:border-green"
            />
          </label>
          <button type="submit" className={btnPrimary}>
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>
      <datalist id="apna-cities">
        {cities.map((city) => (
          <option key={city} value={city} />
        ))}
      </datalist>
    </form>
  );
}
