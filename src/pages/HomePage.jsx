import {
  ArrowRight,
  BadgeCheck,
  BedDouble,
  BriefcaseBusiness,
  Building2,
  Check,
  ClipboardList,
  FileText,
  GraduationCap,
  House,
  LandPlot,
  LayoutGrid,
  Map,
  MapPin,
  Scale,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import {
  categories,
  cities,
  countCategory,
  heroImage,
  properties,
  registryProviders,
} from "../data/site";
import { useApp } from "../context/AppContext";
import PropertyCard from "../components/PropertyCard";
import SearchPanel from "../components/SearchPanel";
import { PropertyImage, SectionHeading, btnLight, btnPrimary } from "../components/ui";

const categoryIcons = {
  land: LandPlot,
  plots: LayoutGrid,
  houses: House,
  flats: Building2,
  shops: Store,
  offices: BriefcaseBusiness,
  pg: BedDouble,
};

const registryIcons = {
  file: FileText,
  shield: ShieldCheck,
  scale: Scale,
  clipboard: ClipboardList,
  map: Map,
};

const quickCities = ["Mumbai", "New Delhi", "Bengaluru", "Hyderabad", "Pune", "Jaipur"].filter((city) =>
  cities.includes(city),
);

export default function HomePage() {
  const { navigate } = useApp();
  const featured = properties.filter((item) => item.featured);
  const stays = properties.filter((item) => item.category === "PG/Hostels");

  return (
    <div>
      <section className="overflow-hidden bg-white">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-14 lg:grid-cols-[1.05fr_0.95fr] lg:pt-16 lg:pb-20">
          <div>
            <p className="text-xs font-extrabold tracking-[0.18em] text-green uppercase">Pan-India property search</p>
            <h1 className="mt-4 text-4xl leading-[1.08] text-navy sm:text-5xl lg:text-6xl">
              Find Your Perfect Property Across India
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Buy or rent a home, a plot, agricultural land, a shop, an office or a student stay. Then reach the owner, a broker, or a registry partner.
            </p>
            <div className="mt-7">
              <SearchPanel />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {quickCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => navigate("listings", { intent: "buy", location: city })}
                  className="cursor-pointer rounded-full border border-line px-3 py-1.5 text-xs font-bold text-navy hover:border-green hover:text-green"
                >
                  {city}
                </button>
              ))}
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                [BadgeCheck, "Owners and brokers"],
                [ShieldCheck, "Title-check partners"],
                [GraduationCap, "Student housing desk"],
              ].map(([Icon, label]) => (
                <div key={label} className="flex items-center gap-2 text-sm font-bold text-navy">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-mist text-green">
                    <Icon className="h-4 w-4" />
                  </span>
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <PropertyImage
              src={heroImage}
              alt="A modern family home at dusk"
              priority
              className="h-80 w-full rounded-[2rem] object-cover shadow-2xl sm:h-[28rem] lg:h-[34rem]"
            />
            <div className="absolute bottom-5 left-5 max-w-xs rounded-2xl bg-white p-4 shadow-xl">
              <p className="text-xs font-extrabold tracking-[0.14em] text-green uppercase">Verified introductions</p>
              <p className="mt-1 text-sm font-bold text-navy">Homes, land and commercial spaces in one search.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <SectionHeading
            eyebrow="Browse by type"
            title="Property categories"
            text="Agricultural land stays a property category here, alongside plots, homes and commercial spaces."
          />
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-7">
            {categories.map((item) => {
              const Icon = categoryIcons[item.icon];
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => navigate("listings", { category: item.name })}
                  className="group flex h-full cursor-pointer flex-col rounded-3xl border border-line bg-white p-4 text-left shadow-sm transition hover:-translate-y-1 hover:border-green hover:shadow-lg"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist text-green transition group-hover:bg-green group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="mt-4 text-sm font-extrabold text-navy">{item.name}</span>
                  <span className="mt-1 text-xs leading-relaxed text-slate-500">{item.text}</span>
                  <span className="mt-3 text-xs font-extrabold text-green">{countCategory(item.name)} listings</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <SectionHeading
            eyebrow="Handpicked"
            title="Featured properties"
            text="A sample of homes, land, plots and shops from cities across India. Open a card to enquire or save it."
            action={
              <button type="button" onClick={() => navigate("listings")} className={btnPrimary}>
                View all properties
                <ArrowRight className="h-4 w-4" />
              </button>
            }
          />
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:py-20">
          <div>
            <p className="text-xs font-extrabold tracking-[0.18em] text-emerald-300 uppercase">Student accommodation</p>
            <h2 className="mt-3 text-3xl text-white md:text-4xl">PG, rooms and hostels near colleges and coaching institutes</h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Find a bed in Bengaluru, Delhi, Kota and other study hubs. Filter by campus, compare sharing options, and contact the owner directly.
            </p>
            <div className="mt-6 space-y-3">
              {["Girls and boys PG with meals", "Private rooms near campus", "Hostels built around coaching schedules"].map((item) => (
                <p key={item} className="flex items-center gap-2 text-sm font-semibold">
                  <Check className="h-4 w-4 text-emerald-300" />
                  {item}
                </p>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigate("listings", { intent: "rent", category: "PG/Hostels" })}
                className={btnLight}
              >
                Explore student stays
              </button>
              <button
                type="button"
                onClick={() => navigate("brokers", { specialty: "PG/Hostels" })}
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-bold text-white hover:bg-white/10"
              >
                Talk to a stay broker
              </button>
            </div>
          </div>
          <div className="grid gap-4">
            {stays.map((stay) => (
              <button
                key={stay.id}
                type="button"
                onClick={() => navigate("property", { id: stay.id })}
                className="grid cursor-pointer gap-4 rounded-3xl bg-white p-3 text-left text-navy shadow-lg transition hover:-translate-y-0.5 sm:grid-cols-[148px_1fr]"
              >
                <PropertyImage src={stay.image} alt={stay.title} className="h-36 w-full rounded-2xl object-cover sm:h-full" />
                <div className="py-1 pr-2">
                  <p className="text-xs font-extrabold tracking-[0.14em] text-green uppercase">
                    {stay.stayType} · {stay.near}
                  </p>
                  <h3 className="mt-1 text-xl">{stay.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                    <MapPin className="h-4 w-4 text-green" />
                    {stay.location}, {stay.city}
                  </p>
                  <p className="mt-3 text-sm font-extrabold text-green">{stay.priceLabel}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {stay.sharing} · {stay.meals}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-16 md:grid-cols-2 md:py-20">
          <article className="rounded-[2rem] bg-mist p-8 md:p-10">
            <Users className="h-8 w-8 text-green" />
            <h2 className="mt-4 text-3xl text-navy">List as a property owner</h2>
            <p className="mt-3 text-slate-600">
              Create an owner profile, then publish a sale or rental preview for a home, plot, shop, office or agricultural land.
            </p>
            <ul className="mt-5 space-y-2 text-sm font-semibold text-navy">
              <li>Direct enquiries, without a listing fee on this preview</li>
              <li>Choose sale or rent and the property category</li>
              <li>Continue to the full listing form when you are ready</li>
            </ul>
            <button type="button" onClick={() => navigate("register", { role: "owner" })} className={`${btnPrimary} mt-6`}>
              Register as owner
            </button>
          </article>
          <article className="rounded-[2rem] bg-navy p-8 text-white md:p-10">
            <BadgeCheck className="h-8 w-8 text-emerald-300" />
            <h2 className="mt-4 text-3xl text-white">Join as a verified broker</h2>
            <p className="mt-3 text-white/75">
              Show your city, speciality and years of work so buyers and students can request a callback.
            </p>
            <ul className="mt-5 space-y-2 text-sm font-semibold text-white/90">
              <li>Residential, commercial, land and student housing</li>
              <li>Add a RERA number when your projects require it</li>
              <li>Appear in the broker directory for your city</li>
            </ul>
            <button type="button" onClick={() => navigate("register", { role: "broker" })} className={`${btnLight} mt-6`}>
              Join as a broker
            </button>
          </article>
        </div>
      </section>

      <section className="border-t border-line bg-mist">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
          <SectionHeading
            eyebrow="Paperwork"
            title="Registry service providers"
            text="After you agree on a property, request a partner for the deed, title search, stamp duty, mutation or a boundary measurement."
            action={
              <button type="button" onClick={() => navigate("registry")} className={btnPrimary}>
                View registry desk
              </button>
            }
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {registryProviders.map((provider) => {
              const Icon = registryIcons[provider.icon];
              return (
                <article key={provider.id} className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-sm">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist text-green">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-2xl text-navy">{provider.name}</h3>
                  <p className="mt-1 text-sm font-extrabold text-green">{provider.service}</p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{provider.text}</p>
                  <p className="mt-4 text-xs font-bold text-slate-500">
                    {provider.cities} · {provider.time}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("registry", { provider: provider.id })}
                    className="mt-5 cursor-pointer text-left text-sm font-extrabold text-navy hover:text-green"
                  >
                    Request this service
                  </button>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
