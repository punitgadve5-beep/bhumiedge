import { House, Mail, Phone, Share2 } from "lucide-react";
import { cities } from "../data/site";
import { useApp } from "../context/AppContext";

export default function Footer() {
  const { navigate, pushToast } = useApp();

  const copySite = async () => {
    try {
      await navigator.clipboard.writeText("https://apnaestate.in");
      pushToast("Link copied. Share Apna Estate with a buyer or owner.");
    } catch {
      pushToast("Share apnaestate.in with a buyer, owner or broker.");
    }
  };

  const columns = [
    {
      title: "Explore",
      links: [
        ["Home", "home"],
        ["Buy", "listings", { intent: "buy" }],
        ["Rent", "listings", { intent: "rent" }],
        ["Sell", "sell"],
        ["Student stays", "listings", { intent: "rent", category: "PG/Hostels" }],
      ],
    },
    {
      title: "Services",
      links: [
        ["Brokers", "brokers"],
        ["Registry partners", "registry"],
        ["Owner registration", "register", { role: "owner" }],
        ["Broker registration", "register", { role: "broker" }],
        ["Shortlist", "shortlist"],
      ],
    },
    {
      title: "Company",
      links: [
        ["About", "about"],
        ["Contact", "contact"],
        ["Login", "login"],
        ["Signup", "signup"],
      ],
    },
  ];

  return (
    <footer className="border-t border-line bg-navy text-white">
      <div className="mx-auto max-w-6xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <button type="button" onClick={() => navigate("home")} className="flex cursor-pointer items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green">
                <House className="h-5 w-5" />
              </span>
              <span className="font-display text-xl">Apna Estate</span>
            </button>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              A pan-India desk for buying, renting and listing homes, agricultural land, plots, shops, offices and student stays.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href="tel:+918040002100" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15">
                <Phone className="h-4 w-4" />
                080 4000 2100
              </a>
              <a href="mailto:hello@apnaestate.in" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15">
                <Mail className="h-4 w-4" />
                hello@apnaestate.in
              </a>
              <button type="button" onClick={copySite} className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold hover:bg-white/15">
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="text-sm font-extrabold tracking-[0.16em] text-white/60 uppercase">{column.title}</h2>
              <ul className="mt-4 space-y-2">
                {column.links.map(([label, name, params]) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => navigate(name, params)}
                      className="cursor-pointer text-sm font-semibold text-white/85 hover:text-white"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <p className="text-xs font-extrabold tracking-[0.16em] text-white/50 uppercase">Popular cities</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => navigate("listings", { location: city })}
                className="cursor-pointer rounded-full border border-white/15 px-3 py-1.5 text-xs font-bold text-white/85 hover:bg-white hover:text-navy"
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Apna Estate. All rights reserved.</p>
          <p className="max-w-xl sm:text-right">
            Listings and partner profiles on this website are sample data for the product preview. Verify title, measurement and registration independently before any payment.
          </p>
        </div>
      </div>
    </footer>
  );
}
