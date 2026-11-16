import { properties } from "../data/site";
import { useApp } from "../context/AppContext";
import PropertyCard from "../components/PropertyCard";
import { PageHeader, btnGhost, btnPrimary } from "../components/ui";

export default function ShortlistPage() {
  const { savedIds, clearShortlist, navigate } = useApp();
  const saved = properties.filter((item) => savedIds.includes(item.id));

  return (
    <div>
      <PageHeader
        eyebrow="Saved"
        title="Your shortlist"
        text="Properties you save stay in this browser so you can compare them before sending an enquiry."
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {saved.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line px-6 py-16 text-center">
            <h2 className="text-3xl text-navy">Nothing saved yet</h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
              Tap the heart on a home, plot, shop or student stay to keep it here.
            </p>
            <button type="button" onClick={() => navigate("listings", { intent: "buy" })} className={`${btnPrimary} mt-6`}>
              Browse properties
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex justify-end">
              <button type="button" onClick={clearShortlist} className={btnGhost}>
                Clear shortlist
              </button>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {saved.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
