import React, { createContext, useContext, useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Plus, Trash2, Pencil, LogOut, LayoutDashboard, Package, ClipboardList, Settings, Search, MessageCircle, Instagram, Video, ChevronLeft, ChevronRight } from "lucide-react";
import { api, getAdminToken } from "./api";

const PAY_INFO = {
  INSTAPAY: { label: "InstaPay", to: "01159275624" },
  VODAFONE_CASH: { label: "Vodafone Cash", to: "01159275624" },
  COD: { label: "Cash on Delivery", to: "Pay cash upon delivery" }
};
const STATUS = {
  PENDING: { label: "Pending Review", color: "#635b4e" },
  CONFIRMED: { label: "Approved", color: "#385e42" },
  PROCESSING: { label: "Processing", color: "#85581a" },
  SHIPPED: { label: "Shipped", color: "#1e3a8a" },
  CANCELLED: { label: "Rejected", color: "#991b1b" }
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function StatusBadge({ status }) {
  const s = STATUS[status] || STATUS.PENDING;
  return <span style={{ padding: "6px 14px", borderRadius: 6, fontWeight: "bold", fontSize: "0.85rem", display: "inline-block", background: s.color, color: "#fff" }}>{s.label}</span>;
}

const CartContext = createContext(null);
const money = n => `${Number(n || 0).toLocaleString("en-US")} EGP`;
const effective = p => p.salePrice ?? p.price;
const imgFallback = "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=900&q=85";

const labelStyle = { display: "flex", flexDirection: "column", gap: 6, fontSize: "0.85rem", color: "#635b4e" };
const modalInput = { padding: 10, background: "#f7f3ec", border: "1px solid #635b4e", color: "#2c2c2c", borderRadius: 6 };
const fieldInput = { width: "100%", padding: "12px", background: "#f7f3ec", border: "1px solid #635b4e", color: "#2c2c2c", borderRadius: "8px", outline: "none" };
const fieldLabel = { display: "block", marginBottom: "6px", fontSize: "0.9rem", color: "#635b4e", fontWeight: "600" };

function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("roviq_cart") || "[]"); } catch { return []; }
  });
  useEffect(() => localStorage.setItem("roviq_cart", JSON.stringify(cart)), [cart]);
  const add = item => setCart(old => {
    const key = `${item.productId}-${item.size}-${item.color}`;
    const found = old.find(x => x.key === key);
    return found ? old.map(x => x.key === key ? { ...x, quantity: Math.min(20, x.quantity + (item.quantity || 1)) } : x) : [...old, { ...item, key, quantity: item.quantity || 1 }];
  });
  const change = (key, quantity) => setCart(old => old.map(x => x.key === key ? { ...x, quantity: Math.max(1, Math.min(20, quantity)) } : x));
  const remove = key => setCart(old => old.filter(x => x.key !== key));
  const clear = () => setCart([]);
  const total = cart.reduce((s, x) => s + x.price * x.quantity, 0);
  return <CartContext.Provider value={{ cart, add, change, remove, clear, clearCart: clear, total }}>{children}</CartContext.Provider>;
}
const useCart = () => useContext(CartContext);

function Header() {
  const { cart } = useCart();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const isAdmin = Boolean(getAdminToken());

  function logout(e) {
    e.preventDefault();
    localStorage.removeItem("admin_token");
    nav("/");
  }

  return (
    <header className="header">
      <Link className="logo" to="/">ROVIQ</Link>
      <button className="mobile-menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
      <nav className={open ? "nav open" : "nav"}>
        <Link onClick={() => setOpen(false)} to="/">Home</Link>
        <Link onClick={() => setOpen(false)} to="/shop">Shop</Link>
        {isAdmin && <Link onClick={() => setOpen(false)} to="/roviq-panel">Dashboard</Link>}
        {isAdmin && (
          <a href="#logout" onClick={logout} className="flex items-center gap-1.5 text-sm font-medium">
            <LogOut size={17} /> Logout
          </a>
        )}
        <Link onClick={() => setOpen(false)} to="/cart" className="cart-link">
          <ShoppingBag size={17} /> Bag ({cart.reduce((n, x) => n + x.quantity, 0)})
        </Link>
      </nav>
    </header>
  );
}

function Footer() {
  const developerWhatsApp = "201027448398";
  const [activePolicy, setActivePolicy] = useState(null);
  const policiesContent = {
    shipping: { title: "Shipping Policy", content: "We ship all orders across Egypt. Delivery usually takes 2 to 5 business days. Shipping fees are calculated at checkout or confirmed by our team." },
    return: { title: "Return & Exchange Policy", content: "You can exchange or return items within 14 days of receiving your order, provided they are in their original condition, unworn, and with tags attached." },
    privacy: { title: "Privacy Policy", content: "Your personal data and privacy are secure with us. We only use your information to process your orders and improve your shopping experience." }
  };
  const h4 = { color: "#e0dbc5", fontSize: "1.1rem", marginBottom: "16px", fontWeight: "600" };
  const ul = { listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "10px" };
  const linkBtn = { background: "none", border: "none", color: "#635b4e", cursor: "pointer", padding: 0, fontSize: "0.95rem", textAlign: "left" };
  const social = { color: "#635b4e", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" };
  const chip = { background: "#d8d2ca", padding: "8px 12px", borderRadius: "6px", border: "1px solid #d4c5b9", fontSize: "0.85rem", color: "#2c2c2c", width: "fit-content" };
  return (
    <>
      <footer className="footer-section" style={{ background: "#111110", color: "#2c2c2c", padding: "50px 20px 20px", borderTop: "1px solid #eae1da" }}>
        <div className="footer-container" style={{ maxWidth: "1200px", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "40px", marginBottom: "40px" }}>
          <div>
            <h3 style={{ color: "#beb5a6", fontSize: "1.5rem", fontWeight: "bold", letterSpacing: "1px", marginBottom: "12px" }}>ROVIQ</h3>
            <p style={{ color: "#beb5a6", fontSize: "0.9rem", lineHeight: "1.6" }}>Made for the ones who move differently. Premium Hoodies essentials designed for uncompromising comfort and everyday style.</p>
          </div>
          <div>
            <h4 style={h4}>Quick Links</h4>
            <ul style={ul}>
              <li><Link to="/" style={{ color: "#beb5a6", textDecoration: "none" }}>Home</Link></li>
              <li><Link to="/shop" style={{ color: "#beb5a6", textDecoration: "none" }}>Shop</Link></li>
            </ul>
          </div>
          <div>
            <h4 style={h4}>Policies</h4>
            <ul style={ul}>
              <li><button onClick={() => setActivePolicy("shipping")} style={linkBtn}>Shipping Policy</button></li>
              <li><button onClick={() => setActivePolicy("return")} style={linkBtn}>Return & Exchange</button></li>
              <li><button onClick={() => setActivePolicy("privacy")} style={linkBtn}>Privacy Policy</button></li>
            </ul>
          </div>
          <div>
            <h4 style={h4}>Follow Us</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <a href="https://wa.me/201159275322" target="_blank" rel="noreferrer" style={social}><MessageCircle size={18}/> WhatsApp</a>
              <a href="https://www.instagram.com/roviq.egy?cplk=Yjk4YzY4NmRlOXd6" target="_blank" rel="noreferrer" style={social}><Instagram size={18}/> Instagram</a>
              <a href="https://www.tiktok.com/@roviq808?_r=1&_t=ZS-9BGoIQRbt1m" target="_blank" rel="noreferrer" style={social}><Video size={18}/> TikTok</a>
            </div>
          </div>
          <div>
            <h4 style={h4}>Payment Methods</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={chip}>InstaPay</span>
              <span style={chip}>Vodafone Cash</span>
              <span style={chip}>Cash on Delivery</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: "1200px", margin: "0 auto", borderTop: "1px solid #d4c5b9", paddingTop: "20px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "8px" }}>
          <p style={{ color: "#635b4e", fontSize: "0.85rem" }}>©️ {new Date().getFullYear()} ROVIQ. All Rights Reserved.</p>
          <p style={{ color: "#635b4e", fontSize: "0.9rem" }}>
            Designed & Developed by{" "}
            <a href={`https://wa.me/${developerWhatsApp}?text=Hi%20Alyaa,%20I%20saw%20your%20work%20on%20ROVIQ%20and...`} target="_blank" rel="noreferrer" style={{ color: "#6d6a5f", fontWeight: "bold", textDecoration: "underline" }}>Engineer Alyaa Mosad Ezz</a>
          </p>
        </div>
      </footer>
      {activePolicy && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999, padding: 20 }}>
          <div style={{ background: "#fefdfa", padding: 30, borderRadius: 12, width: "100%", maxWidth: 500, border: "1px solid #d4c5b9", color: "#2c2c2c", position: "relative" }}>
            <h3 style={{ marginBottom: 15, fontSize: "1.3rem", color: "#635b4e" }}>{policiesContent[activePolicy].title}</h3>
            <p style={{ color: "#555", lineHeight: "1.7", marginBottom: 25, fontSize: "0.95rem" }}>{policiesContent[activePolicy].content}</p>
            <button onClick={() => setActivePolicy(null)} style={{ background: "#2c2c2c", color: "#fff", padding: "8px 20px", fontWeight: "bold", borderRadius: 6, cursor: "pointer", border: "none" }}>CLOSE</button>
          </div>
        </div>
      )}
    </>
  );
}

function Home() {
  const [products,setProducts] = useState([]); const [error,setError] = useState("");
  useEffect(() => { api("/products").then(setProducts).catch(e=>setError(e.message)); }, []);
  return <><section className="hero"><div className="hero-copy"><p className="eyebrow">THE NEW STREETWEAR UNIFORM</p><h1>OWN YOUR<br/><em>EVERYDAY.</em></h1><p>Everyday essentials. Uncompromising comfort. A little different by design.</p><Link className="button light" to="/shop">SHOP THE DROP</Link></div><div className="hero-image"><img src="https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1300&q=90" alt="RoVIQ collection"/></div><div className="hero-index">01 / NEW COLLECTION</div></section>
    <section className="section"><div className="section-head"><div><p className="eyebrow">CURATED FOR YOU</p><h2>THE LATEST DROP</h2></div><Link className="text-link" to="/shop">VIEW ALL</Link></div>{error&&<p className="error">{error}</p>}<ProductGrid products={products.slice(0,4)}/></section>
    <section className="story" id="story"><p className="eyebrow">NOT JUST ANOTHER HOODIE</p><h2>COMFORT IS A<br/><em>STATEMENT.</em></h2><p>Thoughtful fits. Clean details. Pieces you reach for again and again.</p><Link className="button dark" to="/shop">EXPLORE THE COLLECTION</Link></section><Footer/></>;
}

function ProductGrid({ products }) {
  const { add } = useCart();
  const nav = useNavigate();
  const handleBuyNow = (p) => {
    add({ productId: p.id, name: p.name, image: p.images?.[0] || imgFallback, size: p.sizes?.[0] || "M", color: p.colors?.[0] || "Black", price: effective(p), quantity: 1 });
    nav("/cart");
  };
  return (
    <div className="product-grid">
      {products.map(p => (
        <article className="product-card" key={p.id}>
          <Link to={`/product/${p.id}`} className="product-image">
            <img src={p.images?.[0] || imgFallback} alt={p.name} />
            {p.salePrice && <b className="badge">SALE</b>}
          </Link>
          <div className="product-info">
            <div>
              <Link to={`/product/${p.id}`}><h3>{p.name}</h3></Link>
              <p>{p.category}</p>
            </div>
            <strong>{money(effective(p))}</strong>
          </div>
          <button className="quick-add" onClick={() => handleBuyNow(p)}>ADD TO BAG +</button>
        </article>
      ))}
    </div>
  );
}

function Shop() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");
  const [error, setError] = useState("");
  useEffect(() => {
    api(`/products?${new URLSearchParams({ ...(search ? { search } : {}), ...(category ? { category } : {}) })}`)
      .then((data) => {
        let sorted = [...data];
        if (sort === "lowest") sorted.sort((a, b) => effective(a) - effective(b));
        else if (sort === "highest") sorted.sort((a, b) => effective(b) - effective(a));
        else if (sort === "newest") sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        else if (sort === "oldest") sorted.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
        setProducts(sorted);
      })
      .catch((e) => setError(e.message));
  }, [search, category, sort]);
  return (
    <main className="page">
      <div className="page-title"><p className="eyebrow">FIND YOUR FIT</p><h1>THE SHOP.</h1></div>
      <div className="shop-tools" style={{ display: "flex", gap: "15px", flexWrap: "wrap", marginBottom: "30px" }}>
        <label className="search" style={{ flex: 1, minWidth: "220px", background: "#f7f3ec", border: "1px solid #635b4e", borderRadius: "8px" }}>
          <Search size={18} />
          <input placeholder="Search pieces..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ background: "transparent", color: "#635b4e" }} />
        </label>
        <select value={sort} onChange={(e) => setSort(e.target.value)} style={{ padding: "12px 16px", background: "#f7f3ec", color: "#653b4e", border: "1px solid #635b4e", borderRadius: "8px", cursor: "pointer", outline: "none" }}>
          <option value="newest">Sort by: Newest</option>
          <option value="oldest">Sort by: Oldest</option>
          <option value="lowest">Price: Low to High</option>
          <option value="highest">Price: High to Low</option>
        </select>
      </div>
      {error && <p className="error">{error}</p>}
      {products.length ? <ProductGrid products={products} /> : <div className="empty">No products found. Check back soon.</div>}
    </main>
  );
}

function galleryArrow(side){return {position:"absolute",top:"50%",[side]:10,transform:"translateY(-50%)",border:0,borderRadius:"50%",padding:8,background:"rgba(0,0,0,.65)",color:"white",cursor:"pointer"};}

function ProductPage() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [error, setError] = useState("");
  const { add } = useCart();
  const nav = useNavigate();
  useEffect(() => {
    setP(null);
    api("/products").then(list => setP(list.find(x => x.id === id) || null)).catch(e => setError(e.message));
  }, [id]);
  if (error) return <main className="page empty">{error}</main>;
  if (!p) return <main className="page empty">Loading product...</main>;
  const images = p.images?.length ? p.images : [imgFallback];
  const sizes = p.sizes?.length ? p.sizes : ["M"];
  const colors = p.colors?.length ? p.colors : ["Black"];
  const chosenSize = size || sizes[0];
  const chosenColor = color || colors[0];
  const buy = () => {
    add({ productId: p.id, name: p.name, image: images[imageIndex] || images[0], size: chosenSize, color: chosenColor, price: effective(p), quantity: qty });
    nav("/cart");
  };
  return (
    <main className="page product-detail">
      <div className="detail-image" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ position: "relative", height: 480, background: "#f7f3ec", borderRadius: 8, overflow: "hidden", border: "1px solid #d4c5b9" }}>
          <img src={images[imageIndex] || imgFallback} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          {images.length > 1 && (
            <>
              <button type="button" aria-label="Previous image" onClick={() => setImageIndex(i => (i - 1 + images.length) % images.length)} style={galleryArrow("left")}><ChevronLeft /></button>
              <button type="button" aria-label="Next image" onClick={() => setImageIndex(i => (i + 1) % images.length)} style={galleryArrow("right")}><ChevronRight /></button>
            </>
          )}
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {images.map((src, i) => (
            <button type="button" key={`${src}-${i}`} onClick={() => setImageIndex(i)} style={{ width: 76, height: 76, padding: 3, border: imageIndex === i ? "2px solid #2c2c2c" : "1px solid #d4c5b9", borderRadius: 6, background: "transparent", cursor: "pointer" }}>
              <img src={src} alt={`${p.name} view ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      </div>
      <div className="detail-copy">
        <p className="eyebrow">{p.category}</p>
        <h1>{p.name}</h1>
        <h2>{money(effective(p))} {p.salePrice && <del>{money(p.price)}</del>}</h2>
        <p>{p.description}</p>
        <label>SIZE</label>
        <div className="choices">{sizes.map(s => <button key={s} className={chosenSize === s ? "selected" : ""} onClick={() => setSize(s)}>{s}</button>)}</div>
        <label>COLOR</label>
        <div className="choices">{colors.map(c => <button key={c} className={chosenColor === c ? "selected" : ""} onClick={() => setColor(c)}>{c}</button>)}</div>
        <label>QUANTITY</label>
        <div className="qty"><button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>{qty}<button onClick={() => setQty(q => Math.min(20, q + 1))}>+</button></div>
        <button className="button dark full" onClick={buy}>ADD TO BAG — {money(effective(p) * qty)}</button>
        {p.showStock && <p className="muted">Available stock: {p.stock}</p>}
      </div>
    </main>
  );
}

function CartPage() {
  const { cart, change, remove, total } = useCart();
  const nav = useNavigate();

  function checkout() {
    nav("/checkout");
  }

  return (
    <main className="page">
      <div className="page-title"><p className="eyebrow">YOUR SELECTION</p><h1>YOUR BAG.</h1></div>
      {!cart.length ? (
        <div className="empty">Your bag is currently empty. <Link to="/shop" className="text-link">Explore the shop</Link></div>
      ) : (
        <>
          <div className="cart-list">
            {cart.map(x => (
              <div className="cart-row" key={x.key}>
                <img src={x.image} alt={x.name} />
                <div className="cart-item">
                  <h3>{x.name}</h3>
                  <p>{x.size} / {x.color}</p>
                  <strong>{money(x.price)}</strong>
                  <div className="qty">
                    <button onClick={() => change(x.key, x.quantity - 1)}>−</button>
                    {x.quantity}
                    <button onClick={() => change(x.key, x.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className="icon-button" onClick={() => remove(x.key)}><Trash2 /></button>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Subtotal <span>{money(total)}</span></h2>
            <p>Shipping fee will be confirmed by the store.</p>
            <button className="button dark full" onClick={checkout}>CONTINUE TO CHECKOUT</button>
          </div>
        </>
      )}
    </main>
  );
}

function Checkout() {
  const { cart, clear } = useCart();
  const [form, setForm] = useState({ customerName: "", phone: "", address: "", city: "", notes: "", paymentMethod: "INSTAPAY", paymentReference: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const subtotal = cart.reduce((sum, i) => sum + (i?.price || 0) * (i?.quantity || 1), 0);
  const pay = PAY_INFO[form.paymentMethod];

  async function submit(e) {
    e.preventDefault();
    setError("");
    if (!cart.length) { setError("Your bag is empty."); return; }
    if (!form.customerName || !form.phone || !form.address || !form.city) { setError("Please fill in all required fields."); return; }
    if (!/^01[0-9]{9}$/.test(form.phone)) { setError("Please enter a valid Egyptian WhatsApp number starting with 01 (11 digits)."); return; }
    if (form.paymentMethod !== "COD" && !form.paymentReference.trim()) { setError("Please enter the payment reference / transaction number."); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        items: cart.map(i => ({ productId: i.productId || i.id, size: i.size || "M", color: i.color || "Black", quantity: i.quantity || 1 }))
      };
      const res = await api("/orders", { method: "POST", body: JSON.stringify(payload) });
      const order = res?.order || res;
      clear();
      nav("/thank-you", { replace: true, state: { orderNumber: order?.orderNumber } });
    } catch (err) {
      setError(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const set = k => e => setForm({ ...form, [k]: e.target.value });

  if (!cart.length) return <main className="page empty">Your bag is empty. <Link to="/shop" className="text-link">Explore the shop</Link></main>;

  return (
    <main className="page" style={{ maxWidth: "700px", margin: "0 auto", paddingBottom: "50px" }}>
      <div className="page-title"><p className="eyebrow">SECURE CHECKOUT</p><h1>COMPLETE YOUR ORDER.</h1></div>
      {error && <div className="error" style={{ background: "#991b1b", color: "#fff", padding: "10px 15px", borderRadius: "6px", marginBottom: "20px" }}>{error}</div>}
      <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div><label style={fieldLabel}>Full Name</label><input type="text" value={form.customerName} onChange={set("customerName")} required style={fieldInput} /></div>
        <div><label style={fieldLabel}>WhatsApp Number (11 digits starting with 01)</label><input type="text" inputMode="numeric" placeholder="01012345678" value={form.phone} onChange={set("phone")} required style={fieldInput} /></div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
          <div><label style={fieldLabel}>City</label><input type="text" placeholder="e.g., Cairo, Tanta" value={form.city} onChange={set("city")} required style={fieldInput} /></div>
          <div><label style={fieldLabel}>Address</label><input type="text" placeholder="Street, building, apartment" value={form.address} onChange={set("address")} required style={fieldInput} /></div>
        </div>

        <div>
          <label style={fieldLabel}>Payment Method</label>
          <select value={form.paymentMethod} onChange={set("paymentMethod")} style={{ ...fieldInput, cursor: "pointer" }}>
            <option value="INSTAPAY">InstaPay</option>
            <option value="VODAFONE_CASH">Vodafone Cash</option>
            <option value="COD">Cash on Delivery</option>
          </select>
        </div>

        {form.paymentMethod !== "COD" ? (
          <>
            <div style={{ background: "#f7f3ec", border: "1px solid #d4c5b9", borderRadius: 8, padding: 16, color: "#2c2c2c", lineHeight: 1.8 }}>
              <b style={{ color: "#635b4e" }}>Payment Instructions:</b>
              <div>1) Transfer the total amount of <b>{money(subtotal)}</b> via <b>{pay.label}</b> to:</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#111", userSelect: "all", marginTop: 4, marginBottom: 4 }}>{pay.to}</div>
              <div>2) Enter your transaction reference number below before confirming your order.</div>
              <div>3) Our team will review your payment and contact you via WhatsApp to confirm delivery.</div>
            </div>

            <div><label style={fieldLabel}>Payment Reference / Transaction ID</label><input type="text" placeholder="Enter transfer reference number" value={form.paymentReference} onChange={set("paymentReference")} required style={fieldInput} /></div>
          </>
        ) : (
          <div style={{ background: "#f7f3ec", border: "1px solid #d4c5b9", borderRadius: 8, padding: 16, color: "#2c2c2c", lineHeight: 1.8 }}>
            <b style={{ color: "#635b4e" }}>Cash on Delivery:</b>
            <div>You will pay the total amount of <b>{money(subtotal)}</b> in cash upon receiving your order.</div>
          </div>
        )}

        <div><label style={fieldLabel}>Notes (Optional)</label><textarea placeholder="Any special delivery instructions..." value={form.notes} onChange={set("notes")} style={{ ...fieldInput, height: "80px" }} /></div>

        <div style={{ background: "#f7f3ec", border: "1px solid #d4c5b9", padding: "15px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "#2c2c2c" }}>
          <span>Total to Pay:</span><b style={{ fontSize: "1.2rem", color: "#635b4e" }}>{money(subtotal)}</b>
        </div>
        <button type="submit" disabled={loading} style={{ width: "100%", background: "#2c2c2c", color: "#fff", padding: "14px", fontWeight: "bold", borderRadius: "8px", cursor: "pointer", border: "none", fontSize: "1rem" }}>
          {loading ? "Processing Order..." : "CONFIRM ORDER"}
        </button>
      </form>
    </main>
  );
}

function ThankYou() {
  const { state } = useLocation();
  const nav = useNavigate();
  return (
    <main className="page empty" style={{ textAlign: "center", padding: "60px 20px" }}>
      <div style={{ maxWidth: 500, margin: "0 auto", background: "#f7f3ec", border: "1px solid #d4c5b9", padding: "40px", borderRadius: "12px", color: "#2c2c2c" }}>
        <h1 style={{ color: "#385e42", marginBottom: "15px", fontSize: "1.8rem", fontWeight: "700" }}>Thank You For Your Order!</h1>
        <p style={{ color: "#555", marginBottom: "10px", fontSize: "1.05rem" }}>Your order has been successfully placed and is pending review.</p>
        {state?.orderNumber && <p style={{ color: "#635b4e", marginBottom: "20px", fontSize: "1.1rem" }}>Order Number: <b>{state.orderNumber}</b></p>}
        <p style={{ color: "#777", marginBottom: "30px", fontSize: "0.9rem" }}>We will contact you on your WhatsApp number shortly to confirm shipping details.</p>
        <button onClick={() => nav("/shop")} style={{ width: "100%", background: "#2c2c2c", color: "#fff", fontWeight: "bold", padding: "14px", borderRadius: "8px", cursor: "pointer", border: "none", fontSize: "1rem" }}>
          CONTINUE SHOPPING
        </button>
      </div>
    </main>
  );
}

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      localStorage.setItem("admin_token", result.token);
      nav("/roviq-panel");
    } catch (err) {
      setError(err.message || "Invalid admin credentials");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="admin-login">
      <form className="form admin-login-card" onSubmit={submit}>
        <p className="eyebrow">ROVIQ MANAGEMENT</p>
        <h1>ADMIN SIGN IN.</h1>
        <label>Administrator Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
        <label>Password<input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></label>
        {error && <p className="error">{error}</p>}
        <button disabled={busy} className="button dark full">{busy ? "SIGNING IN..." : "SIGN IN"}</button>
        <Link to="/" className="block text-center mt-4">← Back to store</Link>
      </form>
    </main>
  );
}

function AdminLayout({children, active}) {
  const nav = useNavigate();

  function logout() {
    localStorage.removeItem("admin_token");
    nav("/roviq-panel/login");
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <Link className="logo" to="/">ROVIQ</Link>
        <p className="eyebrow">MANAGEMENT</p>

        <Link className={active === "overview" ? "active" : ""} to="/roviq-panel">
          <LayoutDashboard /> Overview
        </Link>

        <Link className={active === "products" ? "active" : ""} to="/roviq-panel/products">
          <Package /> Products
        </Link>

        <Link className={active === "orders" ? "active" : ""} to="/roviq-panel/orders">
          <ClipboardList /> Orders
        </Link>

        <Link className={active === "settings" ? "active" : ""} to="/roviq-panel/settings">
          <Settings /> Settings
        </Link>

        <button onClick={logout}>
          <LogOut /> Sign out
        </button>
      </aside>

      <section className="admin-content">
        {children}
      </section>
    </div>
  );
}

function useAdminGuard(){
  const [ready,setReady]=useState(false);
  const nav=useNavigate();
  useEffect(()=>{
    if(!getAdminToken()){nav("/roviq-panel/login",{replace:true});return;}
    api("/auth/me").then(()=>setReady(true)).catch(()=>{localStorage.removeItem("admin_token");nav("/roviq-panel/login",{replace:true});});
  },[nav]);
  return ready;
}

function AdminSettings() {
  const ready = useAdminGuard();
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (ready) {
      api("/auth/me").then(user => {
        if (user && user.email) setEmail(user.email);
      }).catch(() => {});
    }
  }, [ready]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setBusy(true);
    try {
      const body = { email };
      if (newPassword) {
        if (!currentPassword) {
          throw new Error("Please enter your current password to set a new password.");
        }
        body.currentPassword = currentPassword;
        body.newPassword = newPassword;
      }
      await api("/auth/admin/account", { method: "PATCH", body: JSON.stringify(body) });
      setMessage("Settings updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      setError(err.message || "Failed to update settings.");
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <div className="loading">Loading...</div>;

  return (
    <AdminLayout active="settings">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">SYSTEM MANAGEMENT</p>
          <h1>ADMIN SETTINGS.</h1>
        </div>
      </div>

      <div style={{ background: "#f7f3ec", border: "1px solid #d4c5b9", borderRadius: 10, padding: 30, maxWidth: 600, color: "#2c2c2c" }}>
        {error && <div className="error" style={{ background: "#991b1b", color: "#fff", padding: "10px 15px", borderRadius: 6, marginBottom: 20 }}>{error}</div>}
        {message && <div style={{ background: "#385e42", color: "#fff", padding: "10px 15px", borderRadius: 6, marginBottom: 20 }}>{message}</div>}
        
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <label style={labelStyle}>
            Admin Email
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={modalInput} />
          </label>

          <hr style={{ border: "none", borderTop: "1px solid #d4c5b9", margin: "10px 0" }} />
          
          <h3 style={{ fontSize: "1.05rem", color: "#635b4e" }}>Change Password (Optional)</h3>

          <label style={labelStyle}>
            Current Password
            <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Required only if changing password" style={modalInput} />
          </label>

          <label style={labelStyle}>
            New Password
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current password" style={modalInput} />
          </label>

          <button type="submit" disabled={busy} style={{ background: "#2c2c2c", color: "#fff", padding: "12px 20px", fontWeight: "bold", borderRadius: 6, cursor: "pointer", border: "none", marginTop: 10 }}>
            {busy ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}

function OrderTable({ orders = [], onChangeStatus }) {
  if (!orders.length) return <div className="empty">No orders yet.</div>;
  return (
    <div className="admin-table-wrap">
      <table>
        <thead>
          <tr><th>Order</th><th>Customer</th><th>Items</th><th>Payment</th><th>Total</th><th>Status</th>{onChangeStatus && <th>Actions</th>}</tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id}>
              <td><b>#{o.orderNumber}</b><small>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}</small></td>
              <td>{o.customerName}<small>{o.phone}</small><small>{[o.city, o.address].filter(Boolean).join(" - ")}</small></td>
              <td>{(o.items || []).map((it, i) => <small key={i} style={{ display: "block" }}>{it.name || it.productName} ({it.size}/{it.color}) × {it.quantity}</small>)}</td>
              <td>{PAY_INFO[o.paymentMethod]?.label || o.paymentMethod}<small>Ref: {o.paymentReference || "-"}</small></td>
              <td>{money(o.total)}</td>
              <td><StatusBadge status={o.status} /></td>
              {onChangeStatus && (
                <td style={{ whiteSpace: "nowrap" }}>
                  {o.status === "PENDING" && (
                    <>
                      <button className="button dark" style={{ padding: "6px 12px", marginRight: 6 }} onClick={() => onChangeStatus(o.id, "CONFIRMED")}>APPROVE</button>
                      <button className="button outline" style={{ padding: "6px 12px", marginRight: 6 }} onClick={() => onChangeStatus(o.id, "CANCELLED")}>REJECT</button>
                    </>
                  )}
                  <select value={o.status} onChange={e => onChangeStatus(o.id, e.target.value)} style={modalInput}>
                    {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminHome() {
  const ready = useAdminGuard();
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  async function load() {
    setError("");

    try {
      const [dashboardData, ordersData] = await Promise.all([
        api("/orders/dashboard"),
        api("/orders")
      ]);

      setData(dashboardData);
      setOrders(ordersData);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    if (ready) {
      load();
    }
  }, [ready]);

  const approvedStatuses = ["CONFIRMED", "PROCESSING", "SHIPPED"];

  const totalSales = orders
    .filter(order => approvedStatuses.includes(order.status))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  if (!ready) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <AdminLayout active="overview">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">STORE OVERVIEW</p>
          <h1>DASHBOARD.</h1>
        </div>

        <div>
          <button
            className="button outline"
            onClick={() => load()}
          >
            REFRESH
          </button>

          <Link to="/" className="text-link">
            VIEW STORE
          </Link>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {data && (
        <>
          <div className="stats">
            <div>
              <span>Active products</span>
              <b>{data.products}</b>
            </div>

            <div>
              <span>Total orders</span>
              <b>{data.orders}</b>
            </div>

            <div>
              <span>Total sales</span>
              <b>{money(totalSales)}</b>
            </div>
          </div>

          <h2 className="admin-subtitle">RECENT ORDERS</h2>

          <OrderTable orders={data.recentOrders} />
        </>
      )}
    </AdminLayout>
  );
}

function ProductModal({ product, onClose, onSave, busy }) {
  const [form, setForm] = useState(() => product ? {
    ...product,
    images: Array.isArray(product.images) ? product.images.join("\n") : (product.images || ""),
    colors: Array.isArray(product.colors) ? product.colors.join(", ") : (product.colors || ""),
    sizes: Array.isArray(product.sizes) ? product.sizes.join(", ") : (product.sizes || "")
  } : {
    name: "", description: "", category: "Hoodies", price: "", salePrice: "", stock: 10,
    colors: "Black, Grey", sizes: "S, M, L, XL", active: true, showStock: false, images: ""
  });
  const update = (k, v) => setForm(old => ({ ...old, [k]: v }));
function submit(e) {
  e.preventDefault();
  const splitImages = v => Array.isArray(v)
    ? v
    : String(v || "").split(/\n+/).map(x => x.trim()).filter(Boolean);
  const splitOptions = v => Array.isArray(v)
    ? v
    : String(v || "").split(/[,\n]+/).map(x => x.trim()).filter(Boolean);
  const imagesList = splitImages(form.images);
  if (imagesList.length === 0) {
    alert("Please enter at least one product image URL.");
    return;
  }
  onSave({
    ...form,
    price: Number(form.price) || 0,
    stock: Number(form.stock) || 0,
    salePrice: form.salePrice === "" || form.salePrice == null ? null : Number(form.salePrice),
    colors: splitOptions(form.colors),
    sizes: splitOptions(form.sizes),
    images: imagesList,
    active: Boolean(form.active),
    showStock: Boolean(form.showStock)
  });
}
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 99999 }}>
      <div style={{ background: "#fefdfa", padding: 30, borderRadius: 12, width: "90%", maxWidth: 650, maxHeight: "90vh", overflowY: "auto", border: "1px solid #d4c5b9", color: "#2c2c2c" }}>
        <h2 style={{ marginBottom: 20, fontSize: "1.2rem", fontWeight: "bold" }}>{form.id ? "EDIT PRODUCT" : "ADD NEW PRODUCT"}</h2>
        <form onSubmit={submit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 15 }}>
          <label style={labelStyle}>Product Name<input required value={form.name || ""} onChange={e => update("name", e.target.value)} style={modalInput} /></label>
          <label style={labelStyle}>Category
            <input type="text" value="Hoodies" disabled style={{ ...modalInput, background: "#eee7de", cursor: "not-allowed" }} />
          </label>
          <label style={labelStyle}>Original Price (EGP)<input type="number" min="0" required value={form.price ?? ""} onChange={e => update("price", e.target.value)} style={modalInput} /></label>
          <label style={labelStyle}>Sale Price (Optional)<input type="number" min="0" value={form.salePrice ?? ""} onChange={e => update("salePrice", e.target.value)} style={modalInput} /></label>
          <label style={labelStyle}>Stock Quantity<input type="number" min="0" value={form.stock ?? 10} onChange={e => update("stock", e.target.value)} style={modalInput} /></label>
          <label style={{ ...labelStyle, gridColumn: "span 2" }}>Product Image URLs (one URL per line or comma-separated)
            <textarea required value={form.images} onChange={e => update("images", e.target.value)} placeholder={"https://image-one.jpg\nhttps://image-two.jpg"} style={{ ...modalInput, minHeight: 90 }} />
          </label>
          <label style={labelStyle}>Colors (comma-separated)<input value={form.colors} onChange={e => update("colors", e.target.value)} style={modalInput} /></label>
          <label style={labelStyle}>Sizes (comma-separated)<input value={form.sizes} onChange={e => update("sizes", e.target.value)} style={modalInput} /></label>
          <label style={{ ...labelStyle, gridColumn: "span 2" }}>Description<textarea value={form.description || ""} onChange={e => update("description", e.target.value)} style={{ ...modalInput, minHeight: 80 }} /></label>
          <label style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={Boolean(form.active)} onChange={e => update("active", e.target.checked)} /> Visible in store</label>
          <label style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: 10 }}><input type="checkbox" checked={Boolean(form.showStock)} onChange={e => update("showStock", e.target.checked)} /> Show available stock on product page</label>
          <div style={{ gridColumn: "span 2", display: "flex", gap: 10, marginTop: 10 }}>
            <button disabled={busy} type="submit" style={{ background: "#2c2c2c", color: "#fff", padding: "10px 20px", fontWeight: "bold", borderRadius: 6, cursor: "pointer", border: "none" }}>{busy ? "SAVING..." : "SAVE PRODUCT"}</button>
            <button type="button" onClick={onClose} style={{ border: "1px solid #d4c5b9", padding: "10px 20px", color: "#2c2c2c", background: "transparent", borderRadius: 6, cursor: "pointer" }}>CANCEL</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminProducts() {
  const ready = useAdminGuard();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() {
    try { const data = await api("/products/admin/all"); setItems(Array.isArray(data) ? data : []); } catch (e) { setError(e.message); }
  }
  useEffect(() => { if (ready) load(); }, [ready]);
  async function save(body) {
    setBusy(true); setError("");
    try {
      if (editing?.id) await api(`/products/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      else await api("/products", { method: "POST", body: JSON.stringify(body) });
      setEditing(null);
      await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  async function del(id) {
    if (!window.confirm("Hide this product from the public store?")) return;
    setBusy(true);
    try { await api(`/products/${id}`, { method: "DELETE" }); await load(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  if (!ready) return <div className="loading">Loading...</div>;
  return (
    <AdminLayout active="products">
      <div className="admin-heading">
        <div><p className="eyebrow">CATALOG</p><h1>PRODUCTS.</h1></div>
        <button className="button dark" onClick={() => setEditing({})} disabled={busy}><Plus size={16} /> ADD PRODUCT</button>
      </div>
      {error && <p className="error">{error}</p>}
      {editing !== null && <ProductModal product={editing?.id ? editing : null} onClose={() => setEditing(null)} onSave={save} busy={busy} />}
      <div className="admin-table-wrap">
        <table>
          <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Stock Label</th><th>Visibility</th><th>Actions</th></tr></thead>
          <tbody>
            {items.map(x => (
              <tr key={x.id}>
                <td>{x.name}<small>{x.images?.length || 0} image(s)</small></td>
                <td>{money(effective(x))}</td>
                <td><b>{x.stock} pcs</b></td>
                <td>{x.showStock ? "Shown" : "Hidden"}</td>
                <td>{x.active !== false ? "Visible" : "Hidden"}</td>
                <td>
                  <button className="table-action" onClick={() => setEditing(x)}><Pencil size={16} /></button>
                  <button className="table-action" onClick={() => del(x.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

function AdminOrders(){
  const ready=useAdminGuard(),[orders,setOrders]=useState([]),[error,setError]=useState("");
  async function load(){setOrders(await api("/orders"));}
  useEffect(()=>{if(ready)load().catch(e=>setError(e.message));},[ready]);
  async function changeStatus(id,status){
    setError("");
    try{ await api(`/orders/${id}/status`,{method:"PATCH",body:JSON.stringify({status})}); await load(); }catch(e){setError(e.message);}
  }
  if(!ready)return <div className="loading">Loading...</div>;
  return <AdminLayout active="orders"><div className="admin-heading"><div><p className="eyebrow">FULFILLMENT</p><h1>CUSTOMER ORDERS.</h1></div><button className="button outline" onClick={()=>load().catch(e=>setError(e.message))}>REFRESH</button></div>{error&&<p className="error">{error}</p>}<OrderTable orders={orders} onChangeStatus={changeStatus}/></AdminLayout>;
}

export default function App() {
  return (
    <CartProvider>
      <ScrollToTop />
      <Routes>
        {/* روابط المتجر للعملاء */}
        <Route path="/" element={<><Header/><Home/></>}/>
        <Route path="/store" element={<><Header/><Home/></>}/>
        <Route path="/shop" element={<><Header/><Shop/><Footer/></>}/>
        <Route path="/product/:id" element={<><Header/><ProductPage/><Footer/></>}/>
        <Route path="/cart" element={<><Header/><CartPage/><Footer/></>}/>
        <Route path="/checkout" element={<><Header/><Checkout/><Footer/></>}/>
        <Route path="/thank-you" element={<><Header/><ThankYou/><Footer/></>}/>

        {/* روابط الأدمن السرية */}
        <Route path="/roviq-panel/login" element={<AdminLogin/>}/>
        <Route path="/roviq-panel" element={<AdminHome/>}/>
        <Route path="/roviq-panel/products" element={<AdminProducts/>}/>
        <Route path="/roviq-panel/orders" element={<AdminOrders/>}/>
        <Route path="/roviq-panel/settings" element={<AdminSettings />} />

        <Route path="*" element={<><Header/><main className="page empty">Page not found. <Link to="/">Go home</Link></main></>}/>
      </Routes>
    </CartProvider>
  );
}