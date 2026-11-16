import { useEffect, useState } from "react";
import { categories } from "../data/site";
import { isEmail, isPhone, reference } from "../lib/helpers";
import { useApp } from "../context/AppContext";
import { Field, PageHeader, btnGhost, btnPrimary, inputClass } from "../components/ui";

const empty = {
  name: "",
  phone: "",
  email: "",
  city: "",
  specialty: "Flats",
  rera: "",
  intent: "buy",
  about: "",
};

export default function RegisterPage() {
  const { view, navigate, pushToast } = useApp();
  const role = view.role === "broker" ? "broker" : "owner";
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    setReceipt(null);
    setErrors({});
  }, [role]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Enter your name.";
    if (!isPhone(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (form.city.trim().length < 2) nextErrors.city = "Enter your city.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const next = {
      reference: reference(role === "broker" ? "BK" : "OW"),
      role,
      ...form,
      name: form.name.trim(),
      city: form.city.trim(),
    };
    setReceipt(next);
    pushToast(role === "broker" ? "Broker profile submitted." : "Owner profile submitted.");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Join Apna Estate"
        title={role === "broker" ? "Broker registration" : "Owner registration"}
        text={
          role === "broker"
            ? "Add the city you cover and the kind of property you handle. Buyers can then request a callback from your card."
            : "Create an owner profile before you publish a sale or rental. You can list a home, plot, shop, office or agricultural land."
        }
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-5 grid grid-cols-2 rounded-full bg-mist p-1">
          <button type="button" onClick={() => navigate("register", { role: "owner" })} className={`cursor-pointer rounded-full py-2 text-sm font-bold ${role === "owner" ? "bg-navy text-white" : "text-navy"}`}>
            Property owner
          </button>
          <button type="button" onClick={() => navigate("register", { role: "broker" })} className={`cursor-pointer rounded-full py-2 text-sm font-bold ${role === "broker" ? "bg-green text-white" : "text-navy"}`}>
            Broker
          </button>
        </div>

        {receipt ? (
          <div className="rounded-[2rem] border border-line bg-mist p-6 md:p-8">
            <p className="text-xs font-extrabold tracking-[0.16em] text-green uppercase">Registration received</p>
            <h2 className="mt-2 text-3xl text-navy">{receipt.reference}</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {receipt.name} is registered as {receipt.role === "broker" ? `a ${receipt.specialty} broker` : "a property owner"} in {receipt.city}. We will use {receipt.phone} and {receipt.email}.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {receipt.role === "owner" ? (
                <button type="button" onClick={() => navigate("sell")} className={btnPrimary}>
                  Continue to list a property
                </button>
              ) : (
                <button type="button" onClick={() => navigate("brokers", { city: receipt.city })} className={btnPrimary}>
                  View brokers in {receipt.city}
                </button>
              )}
              <button type="button" onClick={() => setReceipt(null)} className={btnGhost}>
                Submit another
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4 rounded-[2rem] border border-line p-6 md:p-8">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} />
              </Field>
              <Field label="City" error={errors.city}>
                <input className={inputClass} value={form.city} onChange={(event) => update("city", event.target.value)} />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Phone" error={errors.phone}>
                <input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
              </Field>
            </div>
            {role === "broker" ? (
              <>
                <Field label="Speciality">
                  <select className={inputClass} value={form.specialty} onChange={(event) => update("specialty", event.target.value)}>
                    {categories.map((item) => (
                      <option key={item.name}>{item.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="RERA number">
                  <input className={inputClass} value={form.rera} onChange={(event) => update("rera", event.target.value)} placeholder="Optional, if you deal in registered projects" />
                </Field>
              </>
            ) : (
              <Field label="I mainly want to">
                <select className={inputClass} value={form.intent} onChange={(event) => update("intent", event.target.value)}>
                  <option value="buy">Sell a property</option>
                  <option value="rent">Rent out a property</option>
                </select>
              </Field>
            )}
            <Field label="About you">
              <textarea className={`${inputClass} min-h-28`} value={form.about} onChange={(event) => update("about", event.target.value)} placeholder="Localities you know, or the kind of property you own" />
            </Field>
            <button type="submit" className={btnPrimary}>
              {role === "broker" ? "Submit broker profile" : "Submit owner profile"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
