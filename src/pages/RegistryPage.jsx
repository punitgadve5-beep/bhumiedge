import { useState } from "react";
import { ClipboardList, FileText, Map, Scale, ShieldCheck } from "lucide-react";
import { registryProviders } from "../data/site";
import { isPhone, reference } from "../lib/helpers";
import { useApp } from "../context/AppContext";
import { Field, Modal, PageHeader, btnPrimary, inputClass } from "../components/ui";

const icons = {
  file: FileText,
  shield: ShieldCheck,
  scale: Scale,
  clipboard: ClipboardList,
  map: Map,
};

export default function RegistryPage() {
  const { view, navigate, pushToast } = useApp();
  const active = registryProviders.find((item) => item.id === view.provider) || null;
  const [form, setForm] = useState({ name: "", phone: "", city: "", notes: "" });
  const [error, setError] = useState("");
  const [sent, setSent] = useState(null);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const close = () => {
    setSent(null);
    setError("");
    navigate("registry");
  };

  const submit = (event) => {
    event.preventDefault();
    if (form.name.trim().length < 2 || !isPhone(form.phone) || form.city.trim().length < 2) {
      setError("Enter your name, phone and the city where the property sits.");
      return;
    }
    const receipt = {
      reference: reference("RG"),
      provider: active.name,
      ...form,
    };
    setSent(receipt);
    setError("");
    pushToast(`Request sent to ${active.name}.`);
  };

  return (
    <div>
      <PageHeader
        eyebrow="After the handshake"
        title="Registry service providers"
        text="Request a deed, a title note, a registration slot, a mutation filing, or a boundary measurement. The partner confirms scope and fees directly with you."
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <ol className="grid gap-3 md:grid-cols-3">
          {["Share the property city and what you need", "The partner reviews papers and quotes a fee", "You book the sub-registrar or site visit"].map((step, index) => (
            <li key={step} className="rounded-3xl bg-mist p-5 text-sm font-semibold text-navy">
              <span className="text-xs font-extrabold tracking-[0.16em] text-green uppercase">Step {index + 1}</span>
              <p className="mt-2">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {registryProviders.map((provider) => {
            const Icon = icons[provider.icon];
            return (
              <article key={provider.id} className="rounded-3xl border border-line bg-white p-6 shadow-sm">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mist text-green">
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 text-2xl text-navy">{provider.name}</h2>
                <p className="mt-1 text-sm font-extrabold text-green">{provider.service}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{provider.text}</p>
                <p className="mt-3 text-xs font-bold text-slate-500">
                  {provider.cities} · {provider.time}
                </p>
                <button type="button" onClick={() => navigate("registry", { provider: provider.id })} className={`${btnPrimary} mt-5`}>
                  Request this service
                </button>
              </article>
            );
          })}
        </div>
        <p className="mt-8 max-w-3xl text-xs leading-relaxed text-slate-500">
          Apna Estate introduces you to the provider. Registration is completed by that professional and the local sub-registrar. Always read the draft deed and confirm stamp duty before you pay.
        </p>
      </div>

      {active ? (
        <Modal title={active.name} subtitle={active.service} onClose={close}>
          {sent ? (
            <div>
              <p className="text-sm leading-relaxed text-slate-600">
                Reference <span className="font-extrabold text-navy">{sent.reference}</span>. {sent.provider} will contact {sent.name} in {sent.city} on {sent.phone}.
              </p>
              <button type="button" onClick={close} className={`${btnPrimary} mt-5`}>
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={submit} noValidate className="space-y-4">
              <Field label="Your name">
                <input className={inputClass} value={form.name} onChange={(event) => update("name", event.target.value)} />
              </Field>
              <Field label="Phone">
                <input className={inputClass} value={form.phone} onChange={(event) => update("phone", event.target.value)} />
              </Field>
              <Field label="Property city">
                <input className={inputClass} value={form.city} onChange={(event) => update("city", event.target.value)} />
              </Field>
              <Field label="What should they prepare?">
                <textarea className={`${inputClass} min-h-24`} value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Sale deed, EC, mutation or measurement" />
              </Field>
              {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
              <button type="submit" className={`${btnPrimary} w-full`}>
                Send request
              </button>
            </form>
          )}
        </Modal>
      ) : null}
    </div>
  );
}
