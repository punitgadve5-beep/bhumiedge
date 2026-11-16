import { useState } from "react";
import { categories, categoryImages } from "../data/site";
import { formatInr, isEmail, isPhone, readJSON, reference, writeJSON } from "../lib/helpers";
import { useApp } from "../context/AppContext";
import PropertyCard from "../components/PropertyCard";
import { Field, PageHeader, btnPrimary, inputClass } from "../components/ui";

const initial = {
  intent: "buy",
  category: "Flats",
  title: "",
  city: "",
  location: "",
  area: "",
  price: "",
  beds: "",
  baths: "",
  description: "",
  name: "",
  phone: "",
  email: "",
};

export default function SellPage() {
  const { pushToast, user } = useApp();
  const [form, setForm] = useState({
    ...initial,
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [errors, setErrors] = useState({});
  const [drafts, setDrafts] = useState(() => readJSON("ae-drafts", []));
  const [latest, setLatest] = useState(null);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (form.title.trim().length < 4) nextErrors.title = "Add a clear property title.";
    if (form.city.trim().length < 2) nextErrors.city = "Enter the city.";
    if (form.location.trim().length < 2) nextErrors.location = "Enter the locality.";
    if (form.area.trim().length < 2) nextErrors.area = "Add the area, such as 1,200 sq.ft or 2 acres.";
    if (Number(form.price) <= 0) nextErrors.price = "Enter the price as a number.";
    if (form.name.trim().length < 2) nextErrors.name = "Enter the owner's name.";
    if (!isPhone(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const listing = {
      id: `draft-${reference("LST")}`,
      title: form.title.trim(),
      category: form.category,
      intent: form.intent,
      price: Number(form.price),
      priceLabel: formatInr(form.price, form.intent),
      location: form.location.trim(),
      city: form.city.trim(),
      state: "",
      area: form.area.trim(),
      beds: Number(form.beds) || null,
      baths: Number(form.baths) || null,
      furnishing: "Preview",
      postedBy: "Owner",
      contactName: form.name.trim(),
      phone: form.phone.trim(),
      featured: false,
      image: categoryImages[form.category],
      images: [categoryImages[form.category]],
      description: form.description.trim() || "Owner listing preview created on Apna Estate.",
      amenities: ["Owner listed"],
      highlights: ["Session preview"],
    };
    const nextDrafts = [listing, ...drafts];
    setDrafts(nextDrafts);
    writeJSON("ae-drafts", nextDrafts);
    setLatest(listing);
    pushToast(`Listing preview ${listing.id.replace("draft-", "")} is ready.`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Sell or rent"
        title="List your property"
        text="Tell buyers what you are offering. This preview stays in your browser session so you can review the card before sharing it."
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr]">
        <form onSubmit={submit} noValidate className="space-y-4 rounded-[2rem] border border-line p-5 md:p-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="I want to">
              <select className={inputClass} value={form.intent} onChange={(event) => update("intent", event.target.value)}>
                <option value="buy">Sell</option>
                <option value="rent">Rent out</option>
              </select>
            </Field>
            <Field label="Category">
              <select className={inputClass} value={form.category} onChange={(event) => update("category", event.target.value)}>
                {categories.map((item) => (
                  <option key={item.name}>{item.name}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Property title" error={errors.title}>
            <input className={inputClass} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="3 BHK apartment in Whitefield" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="City" error={errors.city}>
              <input className={inputClass} value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="Bengaluru" />
            </Field>
            <Field label="Locality" error={errors.location}>
              <input className={inputClass} value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="Whitefield" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Area" error={errors.area}>
              <input className={inputClass} value={form.area} onChange={(event) => update("area", event.target.value)} placeholder="1,640 sq.ft or 2.4 acres" />
            </Field>
            <Field label={form.intent === "rent" ? "Monthly rent (₹)" : "Price (₹)"} error={errors.price}>
              <input className={inputClass} inputMode="numeric" value={form.price} onChange={(event) => update("price", event.target.value)} placeholder="18500000" />
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Bedrooms">
              <input className={inputClass} inputMode="numeric" value={form.beds} onChange={(event) => update("beds", event.target.value)} placeholder="Optional" />
            </Field>
            <Field label="Bathrooms">
              <input className={inputClass} inputMode="numeric" value={form.baths} onChange={(event) => update("baths", event.target.value)} placeholder="Optional" />
            </Field>
          </div>
          <Field label="Description">
            <textarea className={`${inputClass} min-h-28`} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="Facing, parking, possession and papers" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Your name" error={errors.name}>
              <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
            </Field>
          </div>
          <button type="submit" className={btnPrimary}>
            Publish listing preview
          </button>
        </form>

        <div>
          {latest ? (
            <div>
              <p className="text-xs font-extrabold tracking-[0.16em] text-green uppercase">Preview</p>
              <h2 className="mt-2 text-3xl text-navy">This is how buyers will see it</h2>
              <div className="mt-4">
                <PropertyCard property={latest} />
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] bg-mist p-8">
              <h2 className="text-3xl text-navy">What happens next</h2>
              <ol className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600">
                <li>1. We build a listing card from the details you enter.</li>
                <li>2. You can save it, share the page, or edit by submitting again.</li>
                <li>3. A registry partner can be requested after a buyer is interested.</li>
              </ol>
            </div>
          )}
          {drafts.length > 0 ? (
            <div className="mt-6">
              <h3 className="text-xl text-navy">Saved in this session</h3>
              <ul className="mt-3 space-y-2">
                {drafts.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line px-4 py-3 text-sm">
                    <span>
                      <span className="font-bold text-navy">{item.title}</span>
                      <span className="mt-0.5 block text-slate-500">
                        {item.location}, {item.city} · {item.priceLabel}
                      </span>
                    </span>
                    <button
                      type="button"
                      className="cursor-pointer text-xs font-extrabold text-green"
                      onClick={() => setLatest(item)}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
