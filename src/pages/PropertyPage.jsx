import { useEffect, useState } from "react";
import { ArrowLeft, Bath, BedDouble, CalendarDays, Heart, MapPin, Phone, Ruler, Share2 } from "lucide-react";
import { getProperty, properties } from "../data/site";
import { isEmail, isPhone } from "../lib/helpers";
import { useApp } from "../context/AppContext";
import PropertyCard from "../components/PropertyCard";
import { Field, PageHeader, PropertyImage, btnGhost, btnPrimary, inputClass } from "../components/ui";

const emptyEnquiry = {
  name: "",
  phone: "",
  email: "",
  message: "",
  visit: "",
};

export default function PropertyPage() {
  const { view, navigate, user, toggleSave, savedIds, pushToast } = useApp();
  const property = getProperty(view.id);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [form, setForm] = useState(emptyEnquiry);
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);

  useEffect(() => {
    setPhotoIndex(0);
    setSent(null);
    setErrors({});
    setForm({
      name: user?.name || "",
      phone: user?.phone || "",
      email: user?.email || "",
      message: property ? `I would like to know more about ${property.title} in ${property.location}.` : "",
      visit: "",
    });
  }, [view.id, user, property]);

  if (!property) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center">
        <h1 className="text-4xl text-navy">This listing is no longer available</h1>
        <button type="button" onClick={() => navigate("listings")} className={`${btnPrimary} mt-6`}>
          Browse properties
        </button>
      </div>
    );
  }

  const saved = savedIds.includes(property.id);
  const similar = properties.filter((item) => item.category === property.category && item.id !== property.id).slice(0, 3);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      pushToast("Listing link copied.");
    } catch {
      pushToast("Copy the address bar to share this listing.");
    }
  };

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Enter your name.";
    if (!isPhone(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (form.message.trim().length < 10) nextErrors.message = "Add a short message for the owner.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setSent({
      ...form,
      reference: `ENQ-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    pushToast(`Enquiry sent to ${property.contactName}.`);
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${property.category} · ${property.intent === "rent" ? "For rent" : "For sale"}`}
        title={property.title}
        text={`${property.location}, ${property.city}, ${property.state}`}
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[1.4fr_0.8fr]">
        <div>
          <button
            type="button"
            onClick={() => (window.history.length > 1 ? window.history.back() : navigate("listings"))}
            className="mb-4 inline-flex cursor-pointer items-center gap-2 text-sm font-bold text-navy hover:text-green"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          <PropertyImage
            src={property.images[photoIndex]}
            alt={`${property.title} photo ${photoIndex + 1}`}
            priority
            className="h-72 w-full rounded-[2rem] object-cover sm:h-96"
          />
          <div className="mt-3 flex gap-3">
            {property.images.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setPhotoIndex(index)}
                className={`cursor-pointer overflow-hidden rounded-2xl border-2 ${
                  photoIndex === index ? "border-green" : "border-transparent"
                }`}
              >
                <PropertyImage src={image} alt="" className="h-20 w-28 object-cover" />
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-3xl font-extrabold text-green">{property.priceLabel}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                <MapPin className="h-4 w-4 text-green" />
                {property.location}, {property.city}
              </p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => toggleSave(property.id)} className={btnGhost}>
                <Heart className={`h-4 w-4 ${saved ? "fill-green text-green" : ""}`} />
                {saved ? "Saved" : "Save"}
              </button>
              <button type="button" onClick={share} className={btnGhost}>
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              [Ruler, property.area],
              [BedDouble, property.beds ? `${property.beds} BHK` : property.sharing || property.furnishing],
              [Bath, property.baths ? `${property.baths} bath` : "—"],
              [CalendarDays, property.postedBy],
            ].map(([Icon, label]) => (
              <div key={label} className="rounded-2xl bg-mist p-3">
                <Icon className="h-4 w-4 text-green" />
                <p className="mt-2 text-sm font-bold text-navy">{label}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-8 text-3xl text-navy">About this property</h2>
          <p className="mt-3 leading-relaxed text-slate-600">{property.description}</p>
          {property.near ? (
            <p className="mt-3 text-sm font-bold text-navy">
              Near {property.near}
              {property.meals ? ` · ${property.meals}` : ""}
            </p>
          ) : null}

          <h2 className="mt-8 text-2xl text-navy">Highlights</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-3">
            {property.highlights.map((item) => (
              <li key={item} className="rounded-2xl border border-line px-3 py-2 text-sm font-semibold text-navy">
                {item}
              </li>
            ))}
          </ul>

          <h2 className="mt-8 text-2xl text-navy">Amenities</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {property.amenities.map((item) => (
              <li key={item} className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-navy">
                {item}
              </li>
            ))}
          </ul>
        </div>

        <aside className="h-fit rounded-[2rem] border border-line bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-xs font-extrabold tracking-[0.16em] text-green uppercase">Listed by {property.postedBy}</p>
          <h2 className="mt-2 text-2xl text-navy">{property.contactName}</h2>
          <a href={`tel:${property.phone.replace(/\s/g, "")}`} className={`${btnGhost} mt-4 w-full`}>
            <Phone className="h-4 w-4" />
            Call {property.phone}
          </a>

          {sent ? (
            <div className="mt-6 rounded-3xl bg-mist p-5">
              <p className="text-xs font-extrabold tracking-[0.16em] text-green uppercase">Enquiry received</p>
              <h3 className="mt-2 text-2xl text-navy">Reference {sent.reference}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {property.contactName} will use {sent.phone} and {sent.email}
                {sent.visit ? ` for a visit on ${sent.visit}` : ""}.
              </p>
              <button type="button" onClick={() => setSent(null)} className={`${btnPrimary} mt-4`}>
                Send another enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="mt-6 space-y-4">
              <Field label="Your name" error={errors.name}>
                <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input className={inputClass} inputMode="tel" value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
              </Field>
              <Field label="Preferred visit date">
                <input className={inputClass} type="date" value={form.visit} onChange={(event) => update("visit", event.target.value)} />
              </Field>
              <Field label="Message" error={errors.message}>
                <textarea className={`${inputClass} min-h-28 resize-y`} value={form.message} onChange={(event) => update("message", event.target.value)} />
              </Field>
              <button type="submit" className={`${btnPrimary} w-full`}>
                Send enquiry
              </button>
            </form>
          )}
        </aside>
      </div>

      {similar.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <h2 className="text-3xl text-navy">Similar {property.category}</h2>
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {similar.map((item) => (
              <PropertyCard key={item.id} property={item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
