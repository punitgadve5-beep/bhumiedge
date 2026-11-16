export function readJSON(key, fallback) {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key, value) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private browsing can block storage; the page still works in memory.
  }
}

export function reference(prefix = "AE") {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isPhone(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 13;
}

export function formatInr(amount, intent = "buy") {
  const value = Number(String(amount).replace(/,/g, ""));
  if (!Number.isFinite(value) || value <= 0) return "Price on request";
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
  return intent === "rent" ? `${formatted} / month` : formatted;
}

export function parseHash() {
  const raw = window.location.hash.replace(/^#/, "");
  const [namePart, query = ""] = raw.split("?");
  const params = new URLSearchParams(query);
  return {
    name: namePart || "home",
    id: params.get("id") || "",
    intent: params.get("intent") || "all",
    category: params.get("category") || "all",
    location: params.get("location") || "",
    sort: params.get("sort") || "featured",
    role: params.get("role") || "owner",
    provider: params.get("provider") || "",
    specialty: params.get("specialty") || "all",
    city: params.get("city") || "all",
  };
}

export function toHash(name, params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "" || value === "all") return;
    if (key === "sort" && value === "featured") return;
    if (key === "role" && value === "owner") return;
    search.set(key, String(value));
  });
  const qs = search.toString();
  return qs ? `${name}?${qs}` : name;
}

export function listingParams(view, overrides = {}) {
  return {
    intent: view.intent,
    category: view.category,
    location: view.location,
    sort: view.sort,
    ...overrides,
  };
}

export function filterProperties(list, { intent = "all", category = "all", location = "" } = {}) {
  const query = location.trim().toLowerCase();
  return list.filter((property) => {
    if (intent !== "all" && property.intent !== intent) return false;
    if (category !== "all" && property.category !== category) return false;
    if (!query) return true;
    const haystack = [
      property.title,
      property.location,
      property.city,
      property.state,
      property.category,
      property.near,
      property.stayType,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function sortProperties(list, sort = "featured") {
  const copy = [...list];
  if (sort === "price-asc") copy.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") copy.sort((a, b) => b.price - a.price);
  else copy.sort((a, b) => Number(b.featured) - Number(a.featured));
  return copy;
}
