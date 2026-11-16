import { Bath, BedDouble, Heart, MapPin, Ruler } from "lucide-react";
import { useApp } from "../context/AppContext";
import { PropertyImage } from "./ui";

export default function PropertyCard({ property }) {
  const { navigate, toggleSave, savedIds } = useApp();
  const saved = savedIds.includes(property.id);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_50px_-28px_rgba(12,30,54,0.5)]">
      <button
        type="button"
        onClick={() => navigate("property", { id: property.id })}
        className="flex h-full cursor-pointer flex-col text-left"
      >
        <div className="relative h-52 overflow-hidden">
          <PropertyImage
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-navy">
              {property.intent === "rent" ? "For rent" : "For sale"}
            </span>
            {property.featured ? (
              <span className="rounded-full bg-green px-3 py-1 text-xs font-extrabold text-white">Featured</span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-lg font-extrabold text-green">{property.priceLabel}</p>
          <h3 className="mt-1 text-xl text-navy">{property.title}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-green" />
            {property.location}, {property.city}
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-xs font-bold text-slate-500">
            <span className="inline-flex items-center gap-1">
              <Ruler className="h-3.5 w-3.5" />
              {property.area}
            </span>
            {property.beds ? (
              <span className="inline-flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {property.beds} BHK
              </span>
            ) : null}
            {property.sharing ? <span>{property.sharing}</span> : null}
            {property.baths ? (
              <span className="inline-flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" />
                {property.baths} bath
              </span>
            ) : null}
          </div>
          <span className="mt-5 text-sm font-extrabold text-navy">View details</span>
        </div>
      </button>
      <button
        type="button"
        onClick={() => toggleSave(property.id)}
        aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
        aria-pressed={saved}
        className="absolute top-3 right-3 z-10 cursor-pointer rounded-full bg-white/95 p-2 text-navy shadow-sm hover:text-green"
      >
        <Heart className={`h-4 w-4 ${saved ? "fill-green text-green" : ""}`} />
      </button>
    </article>
  );
}
