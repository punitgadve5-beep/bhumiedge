import { useState } from "react";
import { isEmail, isPhone, reference } from "../lib/helpers";
import { useApp } from "../context/AppContext";
import { Field, PageHeader, btnPrimary, inputClass } from "../components/ui";

export function AboutPage() {
  const { navigate } = useApp();
  const steps = [
    ["Search", "Filter buy or rent, then choose a city and a property category."],
    ["Connect", "Open a listing, save it, and send an enquiry to the owner or broker."],
    ["Register", "When you are ready to close, request a registry partner for the paperwork."],
  ];
  return (
    <div>
      <PageHeader
        eyebrow="Company"
        title="About Apna Estate"
        text="Apna Estate is a pan-India property desk for families, investors, students, owners and brokers."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map(([title, text], index) => (
            <article key={title} className="rounded-3xl bg-mist p-6">
              <p className="text-xs font-extrabold tracking-[0.16em] text-green uppercase">0{index + 1}</p>
              <h2 className="mt-2 text-2xl text-navy">{title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </article>
          ))}
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-relaxed text-slate-600">
          Agricultural land is listed as real estate, with area, access and title notes, just like a flat or a shop. Student stays sit beside family housing so a campus search does not need a second website.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" onClick={() => navigate("listings", { intent: "buy" })} className={btnPrimary}>
            Start searching
          </button>
          <button type="button" onClick={() => navigate("contact")} className="inline-flex cursor-pointer items-center rounded-full border border-line px-5 py-3 text-sm font-bold text-navy">
            Contact the desk
          </button>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  const { pushToast } = useApp();
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(null);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = "Enter your name.";
    if (!isEmail(form.email)) nextErrors.email = "Enter a valid email address.";
    if (!isPhone(form.phone)) nextErrors.phone = "Enter a valid phone number.";
    if (form.message.trim().length < 10) nextErrors.message = "Tell us how we can help.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    const receipt = { reference: reference("CT"), ...form };
    setSent(receipt);
    pushToast("Message sent to the Apna Estate desk.");
  };

  return (
    <div>
      <PageHeader
        eyebrow="Desk"
        title="Contact"
        text="Call, write, or send a note. The Bengaluru desk coordinates introductions across the cities on this site."
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-navy p-8 text-white">
          <h2 className="text-3xl">Apna Estate</h2>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            4th Floor, Prestige Towers, Residency Road, Bengaluru 560025
          </p>
          <div className="mt-6 flex flex-col gap-3">
            <a href="tel:+918040002100" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15">
              Call 080 4000 2100
            </a>
            <a href="mailto:hello@apnaestate.in" className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-bold hover:bg-white/15">
              Email hello@apnaestate.in
            </a>
          </div>
        </div>
        {sent ? (
          <div className="rounded-[2rem] border border-line p-8">
            <p className="text-xs font-extrabold tracking-[0.16em] text-green uppercase">Message received</p>
            <h2 className="mt-2 text-3xl text-navy">{sent.reference}</h2>
            <p className="mt-3 text-sm text-slate-600">
              Thanks {sent.name}. We will reply at {sent.email}.
            </p>
            <button type="button" onClick={() => setSent(null)} className={`${btnPrimary} mt-5`}>
              Send another message
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="space-y-4 rounded-[2rem] border border-line p-6">
            <Field label="Name" error={errors.name}>
              <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} />
            </Field>
            <Field label="Email" error={errors.email}>
              <input className={inputClass} type="email" value={form.email} onChange={(event) => update("email", event.target.value)} />
            </Field>
            <Field label="Phone" error={errors.phone}>
              <input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} />
            </Field>
            <Field label="Message" error={errors.message}>
              <textarea className={`${inputClass} min-h-28`} value={form.message} onChange={(event) => update("message", event.target.value)} />
            </Field>
            <button type="submit" className={btnPrimary}>
              Send message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
