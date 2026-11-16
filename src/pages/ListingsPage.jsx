import { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { categories, properties } from "../data/site";
import { filterProperties, listingParams, sortProperties } from "../lib/helpers";
import { useApp } from "../context/AppContext";
import PropertyCard from "../components/PropertyCard";
import SearchPanel from "../components/SearchPanel";
import { PageHeader, btnPrimary } from "../components/ui";

export default function ListingsPage() {
  const { view, navigate } = useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [visible, setVisible] = useState(9);

  useEffect(() => {
    setVisible(9);
  }, [view.intent, view.category, view.location, view.sort]);

  const results = useMemo(() => {
    const filtered = filterProperties(properties, view);
    return sortProperties(filtered, view.sort);
  }, [view]);

  const shown = results.slice(0, visible);
  const intentLabel = view.intent === "buy" ? "for sale" : view.intent === "rent" ? "for rent" : "";

  const update = (overrides) => navigate("listings", listingParams(view, overrides));

  return (
    <div>
      <PageHeader
        eyebrow="Search results"
        title={view.category !== "all" ? view.category : "Properties across India"}
        text="Adjust buy or rent, choose a category, and open any card for the full description, amenities and enquiry form."
      />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <SearchPanel
          allowAll
          intent={view.intent}
          location={view.location}
          category={view.category}
        />

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-600">
            {results.length} {results.length === 1 ? "listing" : "listings"}
            {view.category !== "all" ? ` in ${view.category}` : ""}
            {intentLabel ? ` ${intentLabel}` : ""}
            {view.location ? ` matching “${view.location}”` : " across India"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-bold text-navy md:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </button>
            <label className="text-sm font-bold text-navy">
              <span className="sr-only">Sort</span>
              <select
                value={view.sort}
                onChange={(event) => update({ sort: event.target.value })}
                className="rounded-full border border-line bg-white px-3 py-2 text-sm"
              >
                <option value="featured">Featured first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[240px_1fr]">
          <aside className={`${filtersOpen ? "block" : "hidden"} h-fit rounded-3xl border border-line bg-mist p-4 md:block`}>
            <p className="text-xs font-extrabold tracking-[0.16em] text-green uppercase">Intent</p>
            <div className="mt-3 grid gap-2">
              {[
                ["all", "All"],
                ["buy", "Buy"],
                ["rent", "Rent"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => update({ intent: value })}
                  className={`cursor-pointer rounded-2xl px-3 py-2 text-left text-sm font-bold ${
                    view.intent === value ? "bg-navy text-white" : "bg-white text-navy"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-5 text-xs font-extrabold tracking-[0.16em] text-green uppercase">Category</p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => update({ category: "all" })}
                className={`cursor-pointer rounded-2xl px-3 py-2 text-left text-sm font-bold ${
                  view.category === "all" ? "bg-green text-white" : "bg-white text-navy"
                }`}
              >
                All categories
              </button>
              {categories.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => update({ category: item.name })}
                  className={`cursor-pointer rounded-2xl px-3 py-2 text-left text-sm font-bold ${
                    view.category === item.name ? "bg-green text-white" : "bg-white text-navy"
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </aside>

          <div>
            {shown.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-line bg-mist px-6 py-16 text-center">
                <h2 className="text-3xl text-navy">No properties match this search</h2>
                <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
                  Try another city, switch between buy and rent, or clear the filters to see every sample listing.
                </p>
                <button type="button" onClick={() => navigate("listings")} className={`${btnPrimary} mt-6`}>
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {shown.map((property) => (
                    <PropertyCard key={property.id} property={property} />
                  ))}
                </div>
                {visible < results.length ? (
                  <div className="mt-8 text-center">
                    <button type="button" onClick={() => setVisible((count) => count + 6)} className={btnPrimary}>
                      Show more properties
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
