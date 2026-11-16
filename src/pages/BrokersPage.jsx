import { useState } from "react";
import { MapPin, Phone, Star } from "lucide-react";
import { brokers } from "../data/site";
import { isPhone, reference } from "../lib/helpers";
import { useApp } from "../context/AppContext";
import { Field, Modal, PageHeader, btnPrimary, inputClass } from "../components/ui";

export default function BrokersPage() {
  const { view, navigate, pushToast } = useApp();
  const [active, setActive] = useState(null);
  const [sent, setSent] = useState(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  const cities = [...new Set(brokers.map((item) => item.city))].sort();
  const specialties = [...new Set(brokers.map((item) => item.specialty))].sort();
  const visible = brokers.filter((broker) => {
    const cityOk = view.city === "all" || broker.city === view.city;
    const specialtyOk = view.specialty === "all" || broker.specialty === view.specialty;
    return cityOk && specialtyOk;
  });

  const updateFilters = (overrides) => {
    navigate("brokers", {
      city: view.city,
      specialty: view.specialty,
      ...overrides,
    });
  };

  const submit = (event) => {
    event.preventDefault();
    if (name.trim().length < 2 || !isPhone(phone)) {
      setError("Enter your name and a valid phone number.");
      return;
    }
    const receipt = {
      reference: reference("BR"),
      broker: active.name,
      name: name.trim(),
      phone: phone.trim(),
      note: note.trim(),
    };
    setSent(receipt);
    setError("");
    pushToast(`Callback requested from ${active.name}.`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="People"
        title="Brokers"
        text="Choose a broker by city and speciality, then request a callback. You can also register your own profile."
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col gap-3 rounded-3xl border border-line bg-mist p-4 sm:flex-row sm:items-end">
          <label className="flex-1 text-sm font-bold text-navy">
            City
            <select
              className={`${inputClass} mt-1.5`}
              value={view.city}
              onChange={(event) => updateFilters({ city: event.target.value })}
            >
              <option value="all">All cities</option>
              {cities.map((city) => (
                <option key={city}>{city}</option>
              ))}
            </select>
          </label>
          <label className="flex-1 text-sm font-bold text-navy">
            Speciality
            <select
              className={`${inputClass} mt-1.5`}
              value={view.specialty}
              onChange={(event) => updateFilters({ specialty: event.target.value })}
            >
              <option value="all">All specialities</option>
              {specialties.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <button type="button" onClick={() => navigate("register", { role: "broker" })} className={btnPrimary}>
            Register as broker
          </button>
        </div>

        {visible.length === 0 ? (
          <div className="mt-8 rounded-3xl border border-dashed border-line px-6 py-14 text-center">
            <h2 className="text-3xl text-navy">No brokers for this filter</h2>
            <button type="button" onClick={() => navigate("brokers")} className={`${btnPrimary} mt-5`}>
              Show every broker
            </button>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {visible.map((broker) => (
              <article key={broker.id} className="rounded-3xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-2xl text-navy">{broker.name}</h2>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="h-4 w-4 text-green" />
                      {broker.city} · {broker.specialty}
                    </p>
                  </div>
                  <p className="inline-flex items-center gap-1 rounded-full bg-mist px-3 py-1 text-sm font-extrabold text-navy">
                    <Star className="h-4 w-4 fill-green text-green" />
                    {broker.rating}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-600">{broker.blurb}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">
                  {broker.years} years · {broker.deals} closed deals
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={`tel:${broker.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-navy hover:bg-mist">
                    <Phone className="h-4 w-4" />
                    {broker.phone}
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(broker);
                      setSent(null);
                      setError("");
                    }}
                    className={btnPrimary}
                  >
                    Request callback
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {active ? (
        <Modal title={`Contact ${active.name}`} subtitle={`${active.specialty} · ${active.city}`} onClose={() => setActive(null)}>
          {sent ? (
            <div>
              <p className="text-sm text-slate-600">
                Reference <span className="font-extrabold text-navy">{sent.reference}</span>. {sent.broker} will call {sent.name} on {sent.phone}.
              </p>
              <button type="button" onClick={() => setActive(null)} className={`${btnPrimary} mt-5`}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <Field label="Your name" error={error && name.trim().length < 2 ? error : ""}>
                <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} />
              </Field>
              <Field label="Phone" error={error && !isPhone(phone) ? "Enter a valid phone number." : ""}>
                <input className={inputClass} value={phone} onChange={(event) => setPhone(event.target.value)} />
              </Field>
              <Field label="What are you looking for?">
                <textarea className={`${inputClass} min-h-24`} value={note} onChange={(event) => setNote(event.target.value)} />
              </Field>
              <button type="submit" className={`${btnPrimary} w-full`}>
                Request callback
              </button>
            </form>
          )}
        </Modal>
      ) : null}
    </div>
  );
}
