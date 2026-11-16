
import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { supabase } from "./lib/supabase";
import AuthModal from "./components/AuthModal";

const categories = [
  { icon: "🌾", name: "Agricultural Land" },
  { icon: "🏞️", name: "Plots" },
  { icon: "🏡", name: "Houses" },
  { icon: "🏢", name: "Flats" },
  { icon: "🏪", name: "Shops" },
  { icon: "🏬", name: "Offices" },
  { icon: "🛏️", name: "PG & Hostels" },
];

const categoryImages = {
  "Agricultural Land": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85",
  Plots: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1000&q=85",
  Houses: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=85",
  Flats: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
  Shops: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85",
  Offices: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1000&q=85",
  "PG & Hostels": "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=85",
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
    description: "Beautiful residential plot in a developing area.",
    details: "1500 Sq.ft | East Facing",
    sellerName: "",
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
    description: "Modern family house with spacious rooms.",
    details: "3 Bedrooms | 2 Bathrooms",
    sellerName: "",
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
    description: "Agricultural land suitable for farming.",
    details: "3 Acres | Black Soil",
    sellerName: "",
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
    description: "Furnished flat available for rent.",
    details: "2 Bedrooms | Furnished",
    sellerName: "",
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

const formatPrice = (value) =>
  Number(value).toLocaleString("en-IN");

export default function App() {
  const [properties, setProperties] = useState(initialProperties);
  const [user, setUser] = useState(null);

  const [searchText, setSearchText] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [transactionType, setTransactionType] = useState("All");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPostOpen, setIsPostOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);

  const [postForm, setPostForm] = useState(emptyPostForm);
  const [imageError, setImageError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  // Check login session and listen for login/logout changes
  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session check failed:", error.message);
        return;
      }

      if (isMounted) {
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

  // Load published properties from Supabase
  useEffect(() => {
    let isMounted = true;

    const loadPublishedProperties = async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(
          "id, title, category, description, price, city, state, address, area, area_unit, transaction_type, seller_name, seller_phone, image_url"
        )
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Properties load failed:", error.message);
        return;
      }

      const databaseProperties = (data || []).map((item) => ({
        id: item.id,
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
          item.image_url ||
          categoryImages[item.category] ||
          categoryImages.Plots,
        isSampleImage: !item.image_url,
        description: item.description || "",
        details: item.area
          ? `${item.area} ${item.area_unit || "sqft"}`
          : "",
        sellerName: item.seller_name || "",
        sellerPhone: item.seller_phone || "",
        isFromDatabase: true,
      }));

      if (isMounted) {
        setProperties((current) => [
          ...current.filter((property) => !property.isFromDatabase),
          ...databaseProperties,
        ]);

        console.log(
          "Published properties loaded:",
          databaseProperties.length
        );
      }
    };

    loadPublishedProperties();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProperties = useMemo(() => {
    const search = searchText.trim().toLowerCase();

    return properties.filter((p) => {
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
        searchable.includes(search) &&
        (selectedCategory === "All" ||
          p.type === selectedCategory) &&
        (transactionType === "All" ||
          p.transactionType === transactionType) &&
        (minBudget === "" ||
          p.priceValue >= Number(minBudget)) &&
        (maxBudget === "" ||
          p.priceValue <= Number(maxBudget))
      );
    });
  }, [
    properties,
    searchText,
    selectedCategory,
    transactionType,
    minBudget,
    maxBudget,
  ]);

  const resetFilters = () => {
    setSearchText("");
    setSelectedCategory("All");
    setTransactionType("All");
    setMinBudget("");
    setMaxBudget("");
  };

  const updatePostForm = (field, value) => {
    setPostForm((old) => ({
      ...old,
      [field]: value,
    }));
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

  // Upload photo to Supabase Storage
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
      throw new Error(
        `Photo upload failed: ${uploadError.message}`
      );
    }

    const { data } = supabase.storage
      .from("property-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  // Save property in Supabase
  const handlePostProperty = async (event) => {
    event.preventDefault();

    if (!user) {
      alert("Please login before posting a property.");
      setIsPostOpen(false);
      setIsLoginOpen(true);
      return;
    }

    const numericPrice = Number(
      String(postForm.price).replace(/[₹,\s]/g, "")
    );

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

      const { error } = await supabase
        .from("properties")
        .insert({
          owner_id: user.id,
          title: postForm.title.trim(),
          category: postForm.type,
          description: postForm.description.trim(),
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

      if (error) {
        throw error;
      }

      setPostForm(emptyPostForm);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      closePostModal();

      alert(
        "Property submitted successfully! It will appear publicly after approval."
      );
    } catch (error) {
      console.error("Property submission failed:", error);
      alert(error.message || "Could not submit property. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      alert(error.message);
      return;
    }

    setUser(null);
    alert("You have been logged out.");
  };

  const handleContactSeller = (property) => {
    const phone = (property.sellerPhone || "").replace(/\D/g, "");

    if (!/^[6-9]\d{9}$/.test(phone)) {
      alert(
        "Seller contact number is not available for this sample listing."
      );
      return;
    }

    const message = encodeURIComponent(
      `Hello ${property.sellerName}, I am interested in your property: ${property.title}, located at ${property.location}. Please share more details.`
    );

    window.open(
      `https://wa.me/91${phone}?text=${message}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleImageError = (event, type) => {
    const fallback = categoryImages[type] || categoryImages.Plots;

    if (event.currentTarget.src !== fallback) {
      event.currentTarget.src = fallback;
    }
  };

  return (
    <>
      <header className="navbar">
        <a className="logo" href="#home">
          <span>🌍</span> Bhoomi <b>Setu</b>
        </a>

        <nav className="nav-links" aria-label="Main navigation">
          <a href="#home">Home</a>
          <a href="#categories">Categories</a>
          <a href="#properties">Properties</a>
          <a href="#about">About</a>
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="user-email">
                {user.email}
              </span>
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
              YOUR TRUSTED BRIDGE TO PROPERTY
            </span>

            <h1>
              Find Your Perfect
              <br />
              <span>Property With Bhoomi Setu</span>
            </h1>

            <p>
              Agricultural Land, Plots, Houses, Flats and Commercial
              Properties — all in one place.
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
              <span>✓ Explore multiple property types</span>
              <span>✓ Connect with property owners</span>
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
            <h2>Explore Properties</h2>
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

            <button className="reset-filter-btn" onClick={resetFilters}>
              Reset Filters
            </button>
          </div>

          <div className="property-results-info">
            <p>
              Showing <strong>{filteredProperties.length}</strong>{" "}
              {filteredProperties.length === 1 ? "property" : "properties"}
            </p>

            {selectedCategory !== "All" && (
              <button onClick={() => setSelectedCategory("All")}>
                Clear category
              </button>
            )}
          </div>

          <div className="properties-grid">
            {filteredProperties.length ? (
              filteredProperties.map((p) => (
                <article className="property-card" key={p.id}>
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

                    {p.isSampleImage && (
                      <span className="sample-image-label">
                        Representative image
                      </span>
                    )}
                  </div>

                  <div className="property-content">
                    <p className="property-category">{p.type}</p>
                    <h3>{p.title}</h3>
                    <p className="property-location">
                      📍 {p.location}
                    </p>

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

        <section className="student-section">
          <div className="student-content">
            <div>
              <span>STUDENT LIVING</span>
              <h2>Find Your PG & Hostel</h2>
              <p>
                Students ke liye affordable PG aur hostel options ek hi jagah.
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
            <span>ABOUT BHOOMI SETU</span>
            <h2>Your Trusted Bridge to Property</h2>
            <p>
              Bhoomi Setu aims to connect buyers, sellers, tenants and
              property owners through one easy-to-use platform.
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
              <span>Connect with sellers</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="logo" href="#home">
          🌍 Bhoomi <b>Setu</b>
        </a>
        <p>Your Trusted Bridge to Property</p>
        <small>© 2026 Bhoomi Setu. All rights reserved.</small>
      </footer>

      {isLoginOpen && (
        <AuthModal
          onClose={() => setIsLoginOpen(false)}
          onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setIsLoginOpen(false);
          }}
        />
      )}

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
              Share accurate property and seller details.
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
                    onChange={(e) =>
                      updatePostForm("type", e.target.value)
                    }
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
                    onChange={(e) =>
                      updatePostForm("title", e.target.value)
                    }
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
                    onChange={(e) =>
                      updatePostForm("price", e.target.value)
                    }
                    placeholder="Enter amount in rupees"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Seller Name *</label>
                  <input
                    value={postForm.sellerName}
                    onChange={(e) =>
                      updatePostForm("sellerName", e.target.value)
                    }
                    placeholder="Seller name"
                    required
                  />
                </div>

                <div className="form-field">
                  <label>Seller Mobile Number *</label>
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

                  {imageError && (
                    <p className="form-error">{imageError}</p>
                  )}

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

                  <small>
                    If no photo is uploaded, a representative category image
                    will be shown.
                  </small>
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
                    rows="3"
                    value={postForm.details}
                    onChange={(e) =>
                      updatePostForm("details", e.target.value)
                    }
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
              <span className="details-category">
                {selectedProperty.type}
              </span>

              <h2 id="details-title">{selectedProperty.title}</h2>

              <p className="property-location">
                📍 {selectedProperty.location}
              </p>

              <h3 className="details-price">
                {selectedProperty.price}
              </h3>

              <div className="details-meta">
                <span>
                  {selectedProperty.transactionType === "Buy"
                    ? "For Sale"
                    : "For Rent"}
                </span>
                <span>{selectedProperty.type}</span>
              </div>

              <p>
                {selectedProperty.description || "No description provided."}
              </p>

              <p>
                <b>Additional Details:</b>{" "}
                {selectedProperty.details || "Not provided"}
              </p>

              <div className="seller-information">
                <h3>Seller Information</h3>
                <p>
                  <b>Name:</b>{" "}
                  {selectedProperty.sellerName ||
                    "Not available for sample listing"}
                </p>
              </div>

              <button
                className="contact-seller-btn"
                onClick={() => handleContactSeller(selectedProperty)}
              >
                Contact Seller on WhatsApp
              </button>

              <small className="contact-note">
                WhatsApp will open in a new tab. Do not share OTP or payment
                details with unknown people.
              </small>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
