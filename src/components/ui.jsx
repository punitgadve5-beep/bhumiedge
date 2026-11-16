import { useEffect, useState } from "react";
import { X } from "lucide-react";

export const inputClass =
  "w-full rounded-2xl border border-line bg-white px-4 py-3 text-sm text-navy outline-none transition placeholder:text-slate-400 focus:border-green";

export const btnPrimary =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-green px-5 py-3 text-sm font-bold text-white transition hover:bg-green-dark active:scale-[0.98]";

export const btnNavy =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-soft active:scale-[0.98]";

export const btnLight =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-navy transition hover:bg-mist active:scale-[0.98]";

export const btnGhost =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-line bg-white px-5 py-3 text-sm font-bold text-navy transition hover:border-navy hover:bg-mist active:scale-[0.98]";

export function Field({ label, error, children }) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-sm font-bold text-navy">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span> : null}
    </label>
  );
}

export function SectionHeading({ eyebrow, title, text, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-green">{eyebrow}</p>
        <h2 className="mt-2 text-3xl text-navy md:text-4xl">{title}</h2>
        {text ? <p className="mt-3 text-base leading-relaxed text-slate-600">{text}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ eyebrow, title, text }) {
  return (
    <div className="border-b border-line bg-mist">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-green">{eyebrow}</p>
        <h1 className="mt-2 text-4xl text-navy md:text-5xl">{title}</h1>
        {text ? <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">{text}</p> : null}
      </div>
    </div>
  );
}

export function PropertyImage({ src, alt, className, priority = false }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-navy via-navy-soft to-green text-center text-white ${className}`}
      >
        <span className="px-4 text-sm font-semibold">{alt}</span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  );
}

export function Modal({ title, subtitle, onClose, children }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-navy/60 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 id="dialog-title" className="text-2xl text-navy">
              {title}
            </h2>
            {subtitle ? <p className="mt-1 text-sm text-slate-600">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-full border border-line p-2 text-navy hover:bg-mist"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ToastStack({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed right-4 bottom-4 z-50 flex w-[min(100%-2rem,22rem)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="rounded-2xl bg-navy px-4 py-3 text-sm font-semibold text-white shadow-xl"
          role="status"
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
