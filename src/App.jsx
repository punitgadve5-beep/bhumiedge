import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";
import AuthModal from "./components/AuthModal";
import PropertyTools from "./components/PropertyTools";

const ADMIN_EMAIL = "punitgadve5@gmail.com";

const categories = [
  { icon: "🌾", name: "Agricultural Land" },
  { icon: "🏞️", name: "Plots" },
  { icon: "🏡", name: "Houses" },
  { icon: "🏢", name: "Flats" },
  { icon: "🏪", name: "Shops" },
  { icon: "🏬", name: "Offices" },
  { icon: "🛏️", name: "PG & Hostels" },
  { icon: "🌴", name: "Farmhouses" },
];

const categoryImages = {
  "Agricultural Land": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85",
  Plots: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85",
  Houses: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=85",
  Flats: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
  Shops: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85",
  Offices: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
  "PG & Hostels": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=85",
  Farmhouses: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=85",
};

const initialProperties = [
  {
    id: 1,
    title: "Residential Plot",
    location: "Bhopal, Madhya Pradesh",
    price: "₹25,00,000",
    priceValue: 2500000,
    transactionType: "Buy",
    type: "Plots",
    image: categoryImages.Plots,
    isSampleImage: true,
    isFeatured: false,
    isVerified: true,
    description: "Beautiful residential plot in a developing area.",
    details: "1500 Sq.ft | East Facing",
    sellerName: "BhumiEdge Desk",
    sellerPhone: "",
  },
  {
    id: 2,
    title: "Modern House",
    location: "Indore, Madhya Pradesh",
    price: "₹65,00,000",
    priceValue: 6500000,
    transactionType: "Buy",
    type: "Houses",
    image: categoryImages.Houses,
    isSampleImage: true,
    isFeatured: false,
    isVerified: false,
    description: "Modern family house with spacious rooms.",
    details: "3 Bedrooms | 2 Bathrooms",
    sellerName: "BhumiEdge Desk",
    sellerPhone: "",
  },
  {
    id: 3,
    title: "Agricultural Land",
    location: "Betul, Madhya Pradesh",
    price: "₹25,00,000",
    priceValue: 2500000,
    transactionType: "Buy",
    type: "Agricultural Land",
    image: categoryImages["Agricultural Land"],
    isSampleImage: true,
    isFeatured: false,
    isVerified: true,
    description: "Agricultural land suitable for farming.",
    details: "3 Acres | Black Soil",
    sellerName: "BhumiEdge Desk",
    sellerPhone: "",
  },
  {
    id: 4,
    title: "2 BHK Flat for Rent",
    location: "Bhopal, Madhya Pradesh",
    price: "₹12,000/month",
    priceValue: 12000,
    transactionType: "Rent",
    type: "Flats",
    image: categoryImages.Flats,
    isSampleImage: true,
    isFeatured: false,
    isVerified: false,
    description: "Furnished flat available for rent.",
    details: "2 Bedrooms | Furnished",
    sellerName: "BhumiEdge Desk",
    sellerPhone: "",
  },
];

const emptyPostForm = {
  title: "",
  location: "",
  price: "",
  type: "Plots",
  transactionType: "Buy",
  image: "",
  description: "",
  details: "",
  sellerName: "",
  sellerPhone: "",
};

const emptyLeadForm = {
  buyerName: "",
  buyerPhone: "",
  buyerNote: "",
};

const formatPrice = (value) => Number(value).toLocaleString("en-IN");

const mapDbProperty = (item) => ({
  id: item.id,
  ownerId: item.owner_id,
  title: item.title,
  location:
    item.address?.trim() ||
    [item.city, item.state].filter(Boolean).join(", ") ||
    "Location not provided",
  price:
    item.price == null
      ? "Price on request"
      : `₹${formatPrice(item.price)}${
          item.transaction_type === "Rent" ? "/month" : ""
        }`,
  priceValue: Number(item.price || 0),
  transactionType: item.transaction_type || "Buy",
  type: item.category,
  image:
    item.image_url || categoryImages[item.category] || categoryImages.Plots,
  isSampleImage: !item.image_url,
  isFeatured: Boolean(item.is_featured),
  isVerified: Boolean(item.is_verified),
  description: item.description || "",
  details: item.area ? `${item.area} ${item.area_unit || "sqft"}` : "",
  sellerName: item.seller_name || "",
  sellerPhone: item.seller_phone || "",
  status: item.status || "pending",
  isFromDatabase: true,
});

export default function App() {
  const [properties, setProperties] = useState(initialProperties);
  const [myProperties, setMyProperties] = useState([]);
  const [adminAllProperties, setAdminAllProperties] = useState([]);
  const [adminLeads, setAdminLeads] = useState([]);
  const [adminTab, setAdminTab] = useState("properties");
  const [user, setUser] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [transactionType, setTransactionType] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const [savedIds, setSavedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("bhumiedge_saved") || "[]");
    } catch {
      return [];
    }
  });
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [isMyPropsOpen, setIsMyPropsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  // Buyer enquiry modal state
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [enquiryProperty, setEnquiryProperty] = useState(null);
  const [leadForm, setLeadForm] = useState(emptyLeadForm);
  const [isSendingLead, setIsSendingLead] = useState(false);

  const [postForm, setPostForm] = useState(emptyPostForm);
  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fileInputRef = useRef(null);
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const pendingPropCount = useMemo(
    () => adminAllProperties.filter((p) => p.status === "pending").length,
    [adminAllProperties]
  );

  const pendingLeadCount = useMemo(
    () => adminLeads.filter((l) => l.status === "pending").length,
    [adminLeads]
  );

  const toggleSaveProperty = (id) => {
    setSavedIds((prev) => {
      const updated = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id];
      localStorage.setItem("bhumiedge_saved", JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!error && isMounted) {
        setUser(data.session?.user ?? null);
      }
    };

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const loadPublishedProperties = async () => {
    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("status", "published")
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Properties load failed:", error.message);
      return;
    }

    const databaseProperties = (data || []).map(mapDbProperty);

    setProperties((current) => [
      ...databaseProperties,
      ...current.filter((property) => !property.isFromDatabase),
    ]);
  };

  const loadMyProperties = async (currentUser) => {
    if (!currentUser) {
      setMyProperties([]);
      return;
    }

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .eq("owner_id", currentUser.id)
      .order("created_at", { ascending: false });

    if (!error) {
      setMyProperties((data || []).map(mapDbProperty));
    }
  };

  const loadAdminProperties = async (currentUser) => {
    if (currentUser?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setAdminAllProperties([]);
      return;
    }

    const { data, error } = await supabase
      .from("properties")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setAdminAllProperties((data || []).map(mapDbProperty));
    }
  };

  const loadAdminLeads = async (currentUser) => {
    if (currentUser?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setAdminLeads([]);
      return;
    }

    const { data, error } = await supabase
      .from("lead_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) {
      setAdminLeads(data || []);
    }
  };

  useEffect(() => {
    loadPublishedProperties();
  }, []);

  useEffect(() => {
    loadMyProperties(user);
    loadAdminProperties(user);
    loadAdminLeads(user);
  }, [user]);

  const filteredProperties = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    const filtered = properties.filter((p) => {
      const searchable = [
        p.title,
        p.location,
        p.type,
        p.description,
        p.details,
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!showSavedOnly || savedIds.includes(p.id)) &&
        searchable.includes(search) &&
        (selectedCategory === "All" || p.type === selectedCategory) &&
        (transactionType === "All" || p.transactionType === transactionType) &&
        (minBudget === "" || p.priceValue >= Number(minBudget)) &&
        (maxBudget === "" || p.priceValue <= Number(maxBudget))
      );
    });

    if (sortBy === "price-low") {
      return [...filtered].sort((a, b) => a.priceValue - b.priceValue);
    }
    if (sortBy === "price-high") {
      return [...filtered].sort((a, b) => b.priceValue - a.priceValue);
    }
    return [...filtered].sort(
      (a, b) => Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
    );
  }, [
    properties,
    searchText,
    selectedCategory,
    transactionType,
    minBudget,
    maxBudget,
    sortBy,
    showSavedOnly,
    savedIds,
  ]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedCategory("All");
    setTransactionType("All");
    setSortBy("newest");
    setMinBudget("");
    setMaxBudget("");
    setShowSavedOnly(false);
  };

  const updatePostForm = (field, value) => {
    setPostForm((old) => ({ ...old, [field]: value }));
  };

  const closePostModal = () => {
    setIsPostOpen(false);
    setImageError("");
  };

  const scrollToProperties = () => {
    document
      .getElementById("properties")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageError("Image size must be 5 MB or less.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      updatePostForm("image", String(reader.result));
      setImageError("");
    };
    reader.onerror = () => {
      setImageError("Could not read this image. Please try another file.");
    };
    reader.readAsDataURL(file);
  };

  const uploadPropertyImage = async (currentUser) => {
    if (!postForm.image) return null;

    const response = await fetch(postForm.image);
    const imageBlob = await response.blob();
    const extension =
      imageBlob.type.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const filePath = `${currentUser.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("property-images")
      .upload(filePath, imageBlob, {
        contentType: imageBlob.type,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Photo upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage
      .from("property-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const handlePostProperty = async (event) => {
    event.preventDefault();

    if (!user) {
      alert("Please login before posting a property.");
      setIsPostOpen(false);
      setIsLoginOpen(true);
      return;
    }

    const numericPrice = Number(String(postForm.price).replace(/[₹,\s]/g, ""));
    const phone = postForm.sellerPhone.replace(/\D/g, "");

    if (
      !postForm.title.trim() ||
      !postForm.location.trim() ||
      !postForm.sellerName.trim()
    ) {
      alert("Please fill all required details.");
      return;
    }

    if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
      alert("Please enter a valid property price.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrl = await uploadPropertyImage(user);
      const locationParts = postForm.location
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean);

      const city = locationParts[0] || null;
      const state =
        locationParts.length > 1
          ? locationParts[locationParts.length - 1]
          : null;

      const fullDescription = [
        postForm.description.trim(),
        postForm.details.trim()
          ? `Additional Details: ${postForm.details.trim()}`
          : "",
      ]
        .filter(Boolean)
        .join("\n\n");

      const { error } = await supabase.from("properties").insert({
        owner_id: user.id,
        title: postForm.title.trim(),
        category: postForm.type,
        description: fullDescription,
        price: numericPrice,
        city,
        state,
        address: postForm.location.trim(),
        transaction_type: postForm.transactionType,
        seller_name: postForm.sellerName.trim(),
        seller_phone: phone,
        image_url: imageUrl,
        status: "pending",
      });

      if (error) throw error;

      setPostForm(emptyPostForm);
      if (fileInputRef.current) fileInputRef.current.value = "";
      closePostModal();

      await loadMyProperties(user);
      if (isAdmin) await loadAdminProperties(user);

      alert(
        "Property submitted for free! Check 'My Properties' to track approval status."
      );
    } catch (error) {
      console.error("Property submission failed:", error);
      alert(error.message || "Could not submit property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Buyer submits contact request -> goes to Admin queue first
  const handleSendLeadRequest = async (event) => {
    event.preventDefault();
    if (!enquiryProperty) return;

    const cleanPhone = leadForm.buyerPhone.replace(/\D/g, "");
    if (!leadForm.buyerName.trim()) {
      alert("Please enter your name.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      alert("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSendingLead(true);
    try {
      const { error } = await supabase.from("lead_requests").insert({
        property_id: String(enquiryProperty.id),
        property_title: enquiryProperty.title,
        seller_name: enquiryProperty.sellerName || "",
        seller_phone: enquiryProperty.sellerPhone || "",
        buyer_user_id: user?.id || null,
        buyer_name: leadForm.buyerName.trim(),
        buyer_phone: cleanPhone,
        buyer_note: leadForm.buyerNote.trim() || null,
        status: "pending",
      });

      if (error) throw error;

      setLeadForm(emptyLeadForm);
      setIsEnquiryOpen(false);
      setEnquiryProperty(null);
      if (isAdmin) await loadAdminLeads(user);

      alert(
        "Request sent to BhumiEdge desk! Our team will review and connect you with the owner."
      );
    } catch (error) {
      alert(error.message || "Could not send request. Please try again.");
    } finally {
      setIsSendingLead(false);
    }
  };

  const handleAdminUpdate = async (propertyId, updates, successMsg) => {
    setActionLoadingId(propertyId);
    try {
      const { error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", propertyId);

      if (error) throw error;

      await Promise.all([
        loadPublishedProperties(),
        loadAdminProperties(user),
        loadMyProperties(user),
      ]);
      if (successMsg) alert(successMsg);
    } catch (error) {
      alert(error.message || "Update failed. Check Supabase RLS policies.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLeadStatusChange = async (leadId, newStatus) => {
    setActionLoadingId(leadId);
    try {
      const { error } = await supabase
        .from("lead_requests")
        .update({ status: newStatus })
        .eq("id", leadId);

      if (error) throw error;
      await loadAdminLeads(user);
    } catch (error) {
      alert(error.message || "Could not update lead status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) {
      return;
    }

    setActionLoadingId(propertyId);
    try {
      const { error } = await supabase
        .from("properties")
        .delete()
        .eq("id", propertyId);

      if (error) throw error;

      await Promise.all([
        loadPublishedProperties(),
        loadAdminProperties(user),
        loadMyProperties(user),
      ]);
      alert("Property deleted.");
    } catch (error) {
      alert(error.message || "Delete failed. Check Supabase RLS policies.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert(error.message);
      return;
    }
    setUser(null);
    setMyProperties([]);
    setAdminAllProperties([]);
    setAdminLeads([]);
    alert("You have been logged out.");
  };

  const handleImageError = (event, type) => {
    const fallback = categoryImages[type] || categoryImages.Plots;
    if (event.currentTarget.src !== fallback) {
      event.currentTarget.src = fallback;
    }
  };

  const totalAdminBadges = pendingPropCount + pendingLeadCount;

  return (
    <>
      <header className="navbar">
        <a className="logo" href="#home">
          <span>🌍</span> Bhumi<b>Edge</b>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#categories">Categories</a>
          <a href="#properties">Properties</a>
          <a href="#tools">Calculators</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          <button
            className="login-btn"
            style={
              showSavedOnly
                ? {
                    background: "#fee2e2",
                    borderColor: "#ef4444",
                    color: "#b91c1c",
                  }
                : undefined
            }
            onClick={() => {
              setShowSavedOnly((prev) => !prev);
              scrollToProperties();
            }}
          >
            ❤️ Saved ({savedIds.length})
          </button>

          {user ? (
            <>
              <button
                className="login-btn"
                onClick={() => {
                  loadMyProperties(user);
                  setIsMyPropsOpen(true);
                }}
              >
                My Properties ({myProperties.length})
              </button>

              {isAdmin && (
                <button
                  className="login-btn"
                  style={{ borderColor: "#d97706", color: "#b45309" }}
                  onClick={() => {
                    loadAdminProperties(user);
                    loadAdminLeads(user);
                    setIsAdminOpen(true);
                  }}
                >
                  Admin ({totalAdminBadges})
                </button>
              )}

              <button className="login-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <button
              className="login-btn"
              onClick={() => setIsLoginOpen(true)}
            >
              Login
            </button>
          )}

          <button
            className="post-btn"
            onClick={() => {
              if (!user) {
                setIsLoginOpen(true);
                return;
              }
              setIsPostOpen(true);
            }}
          >
            + Post Property
          </button>
        </div>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <span className="hero-tagline">
              PAN-INDIA PROPERTY NETWORK
            </span>

            <h1>
              Find Your Perfect
              <br />
              <span>Property With BhumiEdge</span>
            </h1>

            <p>
              Agricultural Land, Plots, Houses, Flats and Commercial
              Properties across India — list and explore free.
            </p>

            <form
              className="search-box"
              onSubmit={(e) => {
                e.preventDefault();
                scrollToProperties();
              }}
            >
              <input
                type="search"
                placeholder="Search city, location or property..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <button type="submit">Search Property</button>
            </form>

            <div className="hero-highlights">
              <span>✓ Free property listing &amp; search</span>
              <span>✓ Assisted owner connect across India</span>
            </div>
          </div>
        </section>

        <section className="categories-section" id="categories">
          <div className="section-heading">
            <span>EXPLORE PROPERTY</span>
            <h2>Property Categories</h2>
            <p>Choose the property type you are looking for.</p>
          </div>

          <div className="category-grid">
            {categories.map((cat) => (
              <button
                type="button"
                className={`category-card ${
                  selectedCategory === cat.name ? "active" : ""
                }`}
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  scrollToProperties();
                }}
              >
                <span className="category-icon">{cat.icon}</span>
                <strong>{cat.name}</strong>
                <small>Explore properties →</small>
              </button>
            ))}
          </div>
        </section>

        <section className="properties-section" id="properties">
          <div className="section-heading">
            <span>PROPERTY LISTINGS</span>
            <h2>
              {showSavedOnly ? "Your Saved Properties" : "Explore Properties"}
            </h2>
            <p>Find your dream property with smart filters.</p>
          </div>

          <div className="property-filter-bar">
            <select
              aria-label="Transaction type"
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
            >
              <option value="All">Buy & Rent</option>
              <option value="Buy">Buy</option>
              <option value="Rent">Rent</option>
            </select>

            <select
              aria-label="Property category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.name} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              placeholder="Min Budget ₹"
              value={minBudget}
              onChange={(e) => setMinBudget(e.target.value)}
            />

            <input
              type="number"
              min="0"
              placeholder="Max Budget ₹"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
            />

            <select
              aria-label="Sort properties"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Sort: Featured &amp; Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <button className="reset-filter-btn" onClick={resetFilters}>
              Reset
            </button>
          </div>

          <div className="property-results-info">
            <p>
              Showing <strong>{filteredProperties.length}</strong>{" "}
              {filteredProperties.length === 1 ? "property" : "properties"}
            </p>

            {(selectedCategory !== "All" || showSavedOnly) && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setShowSavedOnly(false);
                }}
              >
                Show all properties
              </button>
            )}
          </div>

          <div className="properties-grid">
            {filteredProperties.length ? (
              filteredProperties.map((p) => (
                <article
                  className="property-card"
                  key={p.id}
                  style={
                    p.isFeatured
                      ? {
                          border: "2px solid #f59e0b",
                          boxShadow: "0 10px 25px rgba(245, 158, 11, 0.14)",
                        }
                      : undefined
                  }
                >
                  <div className="property-image">
                    <img
                      src={p.image || categoryImages[p.type]}
                      alt={`${p.type} - ${p.title}`}
                      loading="lazy"
                      onError={(e) => handleImageError(e, p.type)}
                    />

                    <span
                      className={`property-type-badge ${p.transactionType.toLowerCase()}`}
                    >
                      {p.transactionType === "Buy" ? "For Sale" : "For Rent"}
                    </span>

                    {p.isFeatured && (
                      <span
                        style={{
                          position: "absolute",
                          top: "44px",
                          left: "12px",
                          background: "#f59e0b",
                          color: "#111827",
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          padding: "3px 9px",
                          borderRadius: "6px",
                        }}
                      >
                        ⭐ Featured
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => toggleSaveProperty(p.id)}
                      title={
                        savedIds.includes(p.id)
                          ? "Remove from Saved"
                          : "Save Property"
                      }
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        background: "#ffffff",
                        border: "none",
                        borderRadius: "50%",
                        width: "36px",
                        height: "36px",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                      }}
                    >
                      {savedIds.includes(p.id) ? "❤️" : "🤍"}
                    </button>

                    {p.isSampleImage && (
                      <span className="sample-image-label">
                        Representative image
                      </span>
                    )}
                  </div>

                  <div className="property-content">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <p className="property-category" style={{ margin: 0 }}>
                        {p.type}
                      </p>

                      {p.isVerified && (
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            background: "#dcfce7",
                            color: "#15803d",
                            padding: "2px 8px",
                            borderRadius: "999px",
                          }}
                        >
                          ✓ Verified
                        </span>
                      )}
                    </div>

                    <h3>{p.title}</h3>
                    <p className="property-location">📍 {p.location}</p>

                    <div className="property-card-bottom">
                      <h2 className="property-price">{p.price}</h2>
                      <button
                        className="view-details-btn"
                        onClick={() => setSelectedProperty(p)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="no-properties">
                <h3>No properties found</h3>
                <p>Try changing your search text or filters.</p>
                <button onClick={resetFilters}>Clear Filters</button>
              </div>
            )}
          </div>
        </section>

        <PropertyTools />

        <section className="student-section">
          <div className="student-content">
            <div>
              <span>STUDENT LIVING</span>
              <h2>Find Your PG & Hostel</h2>
              <p>
                Affordable and verified PG and hostel options for students in
                one place.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("PG & Hostels");
                  setTransactionType("Rent");
                  scrollToProperties();
                }}
              >
                Explore PG & Hostels
              </button>
            </div>

            <div className="student-visual">🛏️</div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div className="section-heading">
            <span>ABOUT BHUMIEDGE</span>
            <h2>Your Trusted Bridge to Property</h2>
            <p>
              BhumiEdge aims to connect buyers, sellers, tenants and property
              owners across India through one easy-to-use platform.
            </p>
          </div>

          <div className="about-points">
            <div>
              <b>01</b>
              <span>Explore property categories</span>
            </div>
            <div>
              <b>02</b>
              <span>Compare listing details</span>
            </div>
            <div>
              <b>03</b>
              <span>Connect with owners via BhumiEdge</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="logo" href="#home">
          🌍 Bhumi<b>Edge</b>
        </a>
        <p>Your Trusted Bridge to Property</p>
        <small>© 2026 BhumiEdge. All rights reserved.</small>
      </footer>

      {/* Login Modal */}
      {isLoginOpen && (
        <AuthModal
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setIsLoginOpen(false);
          }}
        />
      )}

      {/* Post Property Modal */}
      {isPostOpen && (
        <div className="modal-overlay" onMouseDown={closePostModal}>
          <section
            className="modal post-property-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="post-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={closePostModal}
              aria-label="Close"
            >
              ×
            </button>

            <h2 id="post-title">Post Your Property</h2>
            <p className="modal-intro">
              List your property on BhumiEdge across India.
            </p>

            <form onSubmit={handlePostProperty}>
              <div className="form-grid">
                <div className="form-field">
                  <label>Transaction Type *</label>
                  <select
                    value={postForm.transactionType}
                    onChange={(e) =>
                      updatePostForm("transactionType", e.target.value)
                    }
                  >
                    <option value="Buy">Sell / Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>

                <div className="form-field">
                  <label>Property Category *</label>
                  <select
                    value={postForm.type}
                    onChange={(e) => updatePostForm("type", e.target.value)}
                  >
                    {categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-field full-width">
                  <label>Property Title *</label>
                  <input
                    value={postForm.title}
                    onChange={(e) => updatePostForm("title", e.target.value)}
                    placeholder="Example: 2 BHK House"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Location *</label>
                  <input
                    value={postForm.location}
                    onChange={(e) =>
                      updatePostForm("location", e.target.value)
                    }
                    placeholder="City, District, State"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>
                    {postForm.transactionType === "Rent"
                      ? "Monthly Rent (₹) *"
                      : "Property Price (₹) *"}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={postForm.price}
                    onChange={(e) => updatePostForm("price", e.target.value)}
                    placeholder="Enter amount in rupees"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Owner / Seller Name *</label>
                  <input
                    value={postForm.sellerName}
                    onChange={(e) =>
                      updatePostForm("sellerName", e.target.value)
                    }
                    placeholder="Owner name"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Owner Mobile Number *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength="10"
                    value={postForm.sellerPhone}
                    onChange={(e) =>
                      updatePostForm(
                        "sellerPhone",
                        e.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="10-digit mobile"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Upload Actual Property Photo</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  <small>
                    Upload a real photo of the property. Maximum size: 5 MB.
                  </small>

                  {imageError && <p className="form-error">{imageError}</p>}

                  {postForm.image && (
                    <div className="image-preview">
                      <img src={postForm.image} alt="Property preview" />
                      <button
                        type="button"
                        onClick={() => {
                          updatePostForm("image", "");
                          if (fileInputRef.current) {
                            fileInputRef.current.value = "";
                          }
                        }}
                      >
                        Remove Photo
                      </button>
                    </div>
                  )}
                </div>

                <div className="form-field full-width">
                  <label>Description</label>
                  <textarea
                    rows="3"
                    value={postForm.description}
                    onChange={(e) =>
                      updatePostForm("description", e.target.value)
                    }
                    placeholder="Describe the property..."
                  />
                </div>

                <div className="form-field full-width">
                  <label>Additional Details</label>
                  <textarea
                    rows="2"
                    value={postForm.details}
                    onChange={(e) => updatePostForm("details", e.target.value)}
                    placeholder="Area, bedrooms, road width, soil type, facing etc."
                  />
                </div>
              </div>

              <button
                className="modal-submit-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Property"}
              </button>
            </form>
          </section>
        </div>
      )}

      {/* Buyer Contact Request Modal */}
      {isEnquiryOpen && enquiryProperty && (
        <div
          className="modal-overlay"
          onMouseDown={() => setIsEnquiryOpen(false)}
        >
          <section
            className="modal post-property-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setIsEnquiryOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h2>Request Owner Connection</h2>
            <p className="modal-intro">
              Property: <b>{enquiryProperty.title}</b> • Owner:{" "}
              <b>{enquiryProperty.sellerName || "Property Owner"}</b>. Your
              details go to BhumiEdge first so we can verify and connect you.
            </p>

            <form onSubmit={handleSendLeadRequest}>
              <div className="form-grid">
                <div className="form-field full-width">
                  <label>Your Name *</label>
                  <input
                    value={leadForm.buyerName}
                    onChange={(e) =>
                      setLeadForm((old) => ({
                        ...old,
                        buyerName: e.target.value,
                      }))
                    }
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Your Mobile Number *</label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength="10"
                    value={leadForm.buyerPhone}
                    onChange={(e) =>
                      setLeadForm((old) => ({
                        ...old,
                        buyerPhone: e.target.value
                          .replace(/\D/g, "")
                          .slice(0, 10),
                      }))
                    }
                    placeholder="10-digit mobile number"
                    required
                  />
                </div>

                <div className="form-field full-width">
                  <label>Requirement / Note (Optional)</label>
                  <textarea
                    rows="3"
                    value={leadForm.buyerNote}
                    onChange={(e) =>
                      setLeadForm((old) => ({
                        ...old,
                        buyerNote: e.target.value,
                      }))
                    }
                    placeholder="Budget, visit timing, or any question..."
                  />
                </div>
              </div>

              <button
                className="modal-submit-btn"
                type="submit"
                disabled={isSendingLead}
              >
                {isSendingLead ? "Sending Request..." : "Send Contact Request"}
              </button>
            </form>
          </section>
        </div>
      )}

      {/* My Properties Modal */}
      {isMyPropsOpen && (
        <div
          className="modal-overlay"
          onMouseDown={() => setIsMyPropsOpen(false)}
        >
          <section
            className="modal post-property-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setIsMyPropsOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h2>My Listed Properties</h2>
            <p className="modal-intro">
              Logged in as <b>{user?.email}</b>
            </p>

            {myProperties.length === 0 ? (
              <p style={{ padding: "1rem 0", color: "#555" }}>
                You haven&apos;t posted any properties yet. Click &quot;+ Post
                Property&quot; to list your first property!
              </p>
            ) : (
              <div style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
                {myProperties.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background:
                              item.status === "published"
                                ? "#dcfce7"
                                : "#fef3c7",
                            color:
                              item.status === "published"
                                ? "#166534"
                                : "#92400e",
                          }}
                        >
                          {item.status === "published"
                            ? "✓ Published"
                            : "⏳ Pending Approval"}
                        </span>
                      </div>
                      <h4 style={{ margin: "6px 0 2px" }}>{item.title}</h4>
                      <small style={{ color: "#6b7280" }}>
                        {item.location} • {item.price}
                      </small>
                    </div>

                    <button
                      type="button"
                      disabled={actionLoadingId === item.id}
                      onClick={() => handleDeleteProperty(item.id)}
                      style={{
                        background: "#fee2e2",
                        color: "#b91c1c",
                        border: "none",
                        padding: "0.45rem 0.85rem",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Admin Control Panel Modal */}
      {isAdminOpen && isAdmin && (
        <div
          className="modal-overlay"
          onMouseDown={() => setIsAdminOpen(false)}
        >
          <section
            className="modal post-property-modal"
            role="dialog"
            aria-modal="true"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setIsAdminOpen(false)}
              aria-label="Close"
            >
              ×
            </button>

            <h2>Admin Control Room</h2>

            <div
              style={{
                display: "flex",
                gap: "0.6rem",
                margin: "0.8rem 0 1.2rem",
              }}
            >
              <button
                type="button"
                onClick={() => setAdminTab("properties")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  cursor: "pointer",
                  fontWeight: 700,
                  background:
                    adminTab === "properties" ? "#14532d" : "#f9fafb",
                  color: adminTab === "properties" ? "#ffffff" : "#374151",
                }}
              >
                Properties ({pendingPropCount} pending)
              </button>

              <button
                type="button"
                onClick={() => setAdminTab("leads")}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  cursor: "pointer",
                  fontWeight: 700,
                  background: adminTab === "leads" ? "#14532d" : "#f9fafb",
                  color: adminTab === "leads" ? "#ffffff" : "#374151",
                }}
              >
                Buyer Leads ({pendingLeadCount} pending)
              </button>
            </div>

            {adminTab === "properties" ? (
              adminAllProperties.length === 0 ? (
                <p style={{ padding: "1rem 0", color: "#555" }}>
                  No database listings found yet.
                </p>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {adminAllProperties.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "10px",
                        padding: "1rem",
                        background:
                          item.status === "pending" ? "#fffbeb" : "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: "1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <div>
                          <small style={{ color: "#059669", fontWeight: 700 }}>
                            {item.status === "pending"
                              ? "⏳ PENDING"
                              : "✓ LIVE"}{" "}
                            • {item.type} • {item.transactionType}
                          </small>
                          <h4 style={{ margin: "4px 0" }}>{item.title}</h4>
                          <p style={{ margin: "2px 0", fontSize: "0.9rem" }}>
                            📍 {item.location} — <b>{item.price}</b>
                          </p>
                          <small style={{ color: "#4b5563" }}>
                            Owner: {item.sellerName} ({item.sellerPhone})
                          </small>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "0.45rem",
                            flexWrap: "wrap",
                          }}
                        >
                          {item.status === "pending" && (
                            <button
                              type="button"
                              disabled={actionLoadingId === item.id}
                              onClick={() =>
                                handleAdminUpdate(
                                  item.id,
                                  { status: "published" },
                                  "Property approved and published live!"
                                )
                              }
                              style={{
                                background: "#15803d",
                                color: "#fff",
                                border: "none",
                                padding: "0.45rem 0.8rem",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "0.82rem",
                              }}
                            >
                              Approve
                            </button>
                          )}

                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() =>
                              handleAdminUpdate(item.id, {
                                is_featured: !item.isFeatured,
                              })
                            }
                            style={{
                              background: item.isFeatured
                                ? "#f59e0b"
                                : "#f3f4f6",
                              color: item.isFeatured ? "#111827" : "#374151",
                              border: "1px solid #d1d5db",
                              padding: "0.45rem 0.8rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            {item.isFeatured
                              ? "⭐ Featured ON"
                              : "☆ Make Featured"}
                          </button>

                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() =>
                              handleAdminUpdate(item.id, {
                                is_verified: !item.isVerified,
                              })
                            }
                            style={{
                              background: item.isVerified
                                ? "#dcfce7"
                                : "#f3f4f6",
                              color: item.isVerified ? "#166534" : "#374151",
                              border: "1px solid #d1d5db",
                              padding: "0.45rem 0.8rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            {item.isVerified ? "✓ Verified ON" : "Mark Verified"}
                          </button>

                          <button
                            type="button"
                            disabled={actionLoadingId === item.id}
                            onClick={() => handleDeleteProperty(item.id)}
                            style={{
                              background: "#fee2e2",
                              color: "#b91c1c",
                              border: "none",
                              padding: "0.45rem 0.8rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : adminLeads.length === 0 ? (
              <p style={{ padding: "1rem 0", color: "#555" }}>
                No buyer contact requests yet.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {adminLeads.map((lead) => (
                  <div
                    key={lead.id}
                    style={{
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                      padding: "1rem",
                      background:
                        lead.status === "pending" ? "#fffbeb" : "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "1rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "0.72rem",
                            fontWeight: 800,
                            padding: "2px 8px",
                            borderRadius: "999px",
                            background:
                              lead.status === "approved"
                                ? "#dcfce7"
                                : lead.status === "closed"
                                ? "#e5e7eb"
                                : "#fef3c7",
                            color:
                              lead.status === "approved"
                                ? "#166534"
                                : lead.status === "closed"
                                ? "#374151"
                                : "#92400e",
                          }}
                        >
                          {lead.status.toUpperCase()}
                        </span>

                        <h4 style={{ margin: "6px 0 2px" }}>
                          Property: {lead.property_title}
                        </h4>
                        <p style={{ margin: "2px 0", fontSize: "0.9rem" }}>
                          <b>Buyer:</b> {lead.buyer_name} ({lead.buyer_phone})
                        </p>
                        <p style={{ margin: "2px 0", fontSize: "0.88rem" }}>
                          <b>Owner:</b> {lead.seller_name || "N/A"}{" "}
                          {lead.seller_phone ? `(${lead.seller_phone})` : ""}
                        </p>
                        {lead.buyer_note && (
                          <small style={{ color: "#4b5563" }}>
                            Note: {lead.buyer_note}
                          </small>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: "0.45rem", alignItems: "center" }}>
                        {lead.status !== "approved" && (
                          <button
                            type="button"
                            disabled={actionLoadingId === lead.id}
                            onClick={() =>
                              handleLeadStatusChange(lead.id, "approved")
                            }
                            style={{
                              background: "#15803d",
                              color: "#fff",
                              border: "none",
                              padding: "0.45rem 0.8rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            Approve &amp; Connect
                          </button>
                        )}
                        {lead.status !== "closed" && (
                          <button
                            type="button"
                            disabled={actionLoadingId === lead.id}
                            onClick={() =>
                              handleLeadStatusChange(lead.id, "closed")
                            }
                            style={{
                              background: "#f3f4f6",
                              color: "#374151",
                              border: "1px solid #d1d5db",
                              padding: "0.45rem 0.8rem",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontSize: "0.82rem",
                            }}
                          >
                            Close
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Property Details Modal */}
      {selectedProperty && (
        <div
          className="modal-overlay"
          onMouseDown={() => setSelectedProperty(null)}
        >
          <section
            className="modal property-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="details-title"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProperty(null)}
              aria-label="Close"
            >
              ×
            </button>

            <div className="details-image-wrap">
              <img
                src={
                  selectedProperty.image ||
                  categoryImages[selectedProperty.type]
                }
                alt={selectedProperty.title}
                onError={(e) =>
                  handleImageError(e, selectedProperty.type)
                }
              />

              {selectedProperty.isSampleImage && (
                <span className="sample-image-label">
                  Representative image
                </span>
              )}
            </div>

            <div className="details-content">
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <span className="details-category">
                  {selectedProperty.type}
                </span>
                {selectedProperty.isFeatured && (
                  <span
                    style={{
                      background: "#fef3c7",
                      color: "#b45309",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    ⭐ Featured Listing
                  </span>
                )}
                {selectedProperty.isVerified && (
                  <span
                    style={{
                      background: "#dcfce7",
                      color: "#15803d",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}
                  >
                    ✓ BhumiEdge Verified
                  </span>
                )}
              </div>

              <h2 id="details-title">{selectedProperty.title}</h2>

              <p className="property-location">
                📍 {selectedProperty.location}
              </p>

              <h3 className="details-price">{selectedProperty.price}</h3>

              <div className="details-meta">
                <span>
                  {selectedProperty.transactionType === "Buy"
                    ? "For Sale"
                    : "For Rent"}
                </span>
                <span>{selectedProperty.type}</span>
              </div>

              <p style={{ whiteSpace: "pre-line" }}>
                {selectedProperty.description || "No description provided."}
              </p>

              {selectedProperty.details && (
                <p>
                  <b>Additional Details:</b> {selectedProperty.details}
                </p>
              )}

              <div className="seller-information">
                <h3>Owner Information</h3>
                <p>
                  <b>Owner Name:</b>{" "}
                  {selectedProperty.sellerName || "BhumiEdge Verified Owner"}
                </p>

                <button
                  type="button"
                  className="modal-submit-btn"
                  onClick={() => {
                    setEnquiryProperty(selectedProperty);
                    setSelectedProperty(null);
                    setIsEnquiryOpen(true);
                  }}
                >
                  Request Seller Contact
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}