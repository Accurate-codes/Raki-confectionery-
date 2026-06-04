/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, loginWithGoogle, logoutUser, db, handleFirestoreError, OperationType } from "./firebase";
import { OrderItem } from "./types";

// Component imports
import Navbar from "./components/Navbar";
import AICustomizer from "./components/AICustomizer";
import MenuCatalog from "./components/MenuCatalog";
import CheckoutModal from "./components/CheckoutModal";
import AdminTerminal from "./components/AdminTerminal";
import ReviewsList from "./components/ReviewsList";
import MyOrdersHistory from "./components/MyOrdersHistory";

// Generated assets
import heroImg from "./assets/images/hero_cake_1780568043581.png";
import cupcakesImg from "./assets/images/cupcakes_assorted_1780568070902.png";
import macaronsImg from "./assets/images/pastry_macarons_1780568083869.png";

// Lucide icons
import { 
  Heart, Sparkles, Phone, Mail, MapPin, Calendar, Clock, 
  MessageCircle, ArrowRight, ShieldCheck, CheckSquare, Star, Cake
} from "lucide-react";

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Router tab controls
  const [activeTab, setActiveTab] = useState<"home" | "menu" | "customizer" | "reviews" | "orders-history" | "admin">("home");

  // Shopping Bag/Cart context
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Inbound Private Quote Request Contact form state
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactContent, setContactContent] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Monitor Authentication state matches
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email === "ogidanrighteous13@gmail.com") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Secure Sign-in controller
  async function handleGoogleSignIn() {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Auth sign-in trigger error:", err);
    }
  }

  // Sign-out controller
  async function handleSignOut() {
    try {
      await logoutUser();
      setActiveTab("home");
    } catch (err) {
      console.error("Auth sign-out trigger error:", err);
    }
  }

  // Basket item modifier triggers
  function handleAddProductToCart(item: OrderItem) {
    setCart((prevCart) => {
      // If same SKU / Size / Flavor exists, stack quantity
      const existingIdx = prevCart.findIndex(
        (i) => i.menuItemId === item.menuItemId && i.size === item.size && i.flavor === item.flavor
      );
      if (existingIdx > -1) {
        const nextCart = [...prevCart];
        nextCart[existingIdx].quantity += item.quantity;
        return nextCart;
      }
      return [...prevCart, item];
    });
  }

  function handleRemoveItemFromCart(index: number) {
    setCart((prevCart) => prevCart.filter((_, idx) => idx !== index));
  }

  function handleClearCart() {
    setCart([]);
  }

  // Handle contact form submittal (storing directly in /messages with security-spec validations)
  async function handleContactSubmit(e: FormEvent) {
    e.preventDefault();
    setContactError(null);
    setContactSuccess(false);

    if (!contactName.trim() || !contactPhone.trim() || !contactContent.trim()) {
      setContactError("Please fill out Name, Phone, and your inquiry details.");
      return;
    }

    setContactSubmitting(true);
    const messageId = `msg-${Date.now()}`;

    const messagePayload = {
      id: messageId,
      name: contactName,
      phone: contactPhone,
      email: contactEmail || "anonymous@rakis.com",
      content: contactContent,
      read: false,
      createdAt: serverTimestamp(),
    };

    const targetCollection = "messages";
    try {
      await addDoc(collection(db, targetCollection), messagePayload);
      setContactName("");
      setContactPhone("");
      setContactEmail("");
      setContactContent("");
      setContactSuccess(true);
      setTimeout(() => setContactSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, `${targetCollection}/${messageId}`);
      setContactError("Failed to register your message check. Verify rules configuration.");
    } finally {
      setContactSubmitting(false);
    }
  }

  const cartTotalCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div id="app-root-frame" className="min-h-screen flex flex-col justify-between bg-amber-50/20 text-gray-800">
      
      {/* Header & Navbar */}
      <Navbar
        user={user}
        isAdmin={isAdmin}
        cartCount={cartTotalCount}
        onOpenCart={() => setIsCartOpen(true)}
        onSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container Views Router */}
      <main className="flex-grow">
        {activeTab === "home" ? (
          <div id="home-view-container" className="animate-fade-in">
            {/* Elegant Hero Banner */}
            <section id="hero-banner-section" className="relative overflow-hidden bg-amber-50/65 py-20 border-b border-orange-100">
              <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Left pitch text */}
                <div id="hero-pitch" className="lg:col-span-6 space-y-6">
                  <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-cyan font-bold text-amber-800 uppercase tracking-widest leading-none">
                    <Sparkles className="h-3 w-3 text-amber-600 mr-0.5 animate-pulse" />
                    <span>Lagos Premium Baker</span>
                  </span>
                  <h1 className="font-sans text-5xl font-black tracking-tight text-amber-970 sm:text-6xl leading-[1.1]">
                    Decadence Crafted to <span className="text-amber-600 block sm:inline">Perfection</span>
                  </h1>
                  <p className="text-sm text-gray-550 leading-relaxed max-w-lg">
                    Welcome to Rakis Confectionery! We bake absolute masterpieces: custom celebration towering wedding cakes, artisan cupcakes boxes, and delicate French macarons. Every recipe is handmade in Lagos with pure love, pristine ingredients, and premium custom ornamenting.
                  </p>
                  
                  {/* Quick CTAs */}
                  <div className="flex flex-wrap gap-4 pt-2">
                    <button
                      id="hero-order-cta"
                      onClick={() => setActiveTab("menu")}
                      className="rounded-full bg-amber-650 px-6 py-3 text-sm font-bold tracking-wide uppercase text-white shadow-md shadow-orange-100 transition-all hover:bg-amber-700 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 font-sans cursor-pointer"
                    >
                      Browse Treats Catalog
                    </button>
                    <button
                      id="hero-co-design-cta"
                      onClick={() => setActiveTab("customizer")}
                      className="rounded-full bg-amber-955 px-6 py-3 text-sm font-bold tracking-wide uppercase text-white shadow-md transition-all hover:bg-black hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 border-2 border-amber-500 font-sans flex items-center space-x-1.5 cursor-pointer"
                    >
                      <Sparkles className="h-4 w-4 animate-bounce text-amber-300 shrink-0" />
                      <span>Co-Design with AI</span>
                    </button>
                  </div>

                  {/* Hot contact stats strip */}
                  <div className="pt-4 border-t border-amber-200/50 flex flex-wrap gap-x-6 gap-y-2 text-xs font-mono text-amber-900/85">
                    <span className="flex items-center space-x-1">
                      <Phone className="h-4 w-4 shrink-0 text-amber-600" />
                      <strong>07031667434</strong>
                    </span>
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 shrink-0 text-amber-600" />
                      <span>Lagos, Nigeria</span>
                    </span>
                  </div>
                </div>

                {/* Right Image Banner wrapper */}
                <div id="hero-showcase-visuals" className="lg:col-span-6 relative flex justify-center">
                  <div className="relative h-[280px] w-[320px] sm:h-[350px] sm:w-[450px] rounded-2xl overflow-hidden shadow-2xl border-4 border-white rotate-2 hover:rotate-0 transition-all duration-300">
                    <img
                      src={heroImg}
                      alt="Rakis Confectionery Showcase Cake"
                      className="h-full w-full object-cover object-center"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-transparent p-4 text-white">
                      <span className="font-mono text-[9px] uppercase tracking-widest font-extrabold text-amber-300">New season signature</span>
                      <h4 className="font-sans font-bold text-sm">Four-Tier Rose Lace Wedding Cake</h4>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Custom Gallery Showcase */}
            <section id="gallery-highlights" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
              <div className="text-center mb-10">
                <h3 className="font-sans text-2xl font-black text-amber-955 tracking-tight uppercase">
                  Signature Creations Gallery
                </h3>
                <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                  Take a look at other breathtaking gourmet confections produced inside Rakis boutique baking laboratory.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Highlights 1 */}
                <div id="gallery-card-1" className="group rounded-2xl border border-orange-50 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div className="aspect-4/3 overflow-hidden bg-amber-50">
                    <img
                      src={heroImg}
                      alt="Floral celebration cake"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 border-t border-orange-50 bg-amber-50/5 text-center">
                    <h4 className="font-sans font-bold text-amber-950 text-sm">Tiered Celebration Birthday Cake</h4>
                    <p className="text-[11px] text-gray-400 font-mono uppercase mt-1">Lace piping & premium fondant detailing</p>
                  </div>
                </div>

                {/* Highlights 2 */}
                <div id="gallery-card-2" className="group rounded-2xl border border-orange-50 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div className="aspect-4/3 overflow-hidden bg-amber-50">
                    <img
                      src={cupcakesImg}
                      alt="Assorted boutique cupcakes"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 border-t border-orange-50 bg-amber-50/5 text-center">
                    <h4 className="font-sans font-bold text-amber-950 text-sm">Royal Swirl Bouquet Cupcakes</h4>
                    <p className="text-[11px] text-gray-400 font-mono uppercase mt-1">Premium gold dust ornaments box</p>
                  </div>
                </div>

                {/* Highlights 3 */}
                <div id="gallery-card-3" className="group rounded-2xl border border-orange-50 bg-white overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between">
                  <div className="aspect-4/3 overflow-hidden bg-amber-50">
                    <img
                      src={macaronsImg}
                      alt="Delicate French macarons stacked"
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-all duration-500"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-4 border-t border-orange-50 bg-amber-50/5 text-center">
                    <h4 className="font-sans font-bold text-amber-950 text-sm">Artisan French Macarons Stack</h4>
                    <p className="text-[11px] text-gray-400 font-mono uppercase mt-1">Multi-flavored sweet almond cookies</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Inbound Contact Message / Custom Quote Inquiry Section */}
            <section id="contact-quotes-section" className="border-t border-orange-100 bg-amber-50/30 py-16">
              <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                  <h3 className="font-sans text-2xl font-black text-amber-955 uppercase">
                    Custom Quote & Catering Inquiries
                  </h3>
                  <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto leading-relaxed">
                    Have an upcoming wedding, wedding anniversary, or grand reception event? Send your catering details and size preferences below. Our master confections chef will get back to you with custom catalog configurations!
                  </p>
                </div>

                {/* Contact Forms */}
                <form id="contact-quote-form" onSubmit={handleContactSubmit} className="space-y-4 rounded-xl border border-amber-100 bg-white p-6 shadow-md shadow-amber-50">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="inquiry-name" className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Name</label>
                      <input
                        id="inquiry-name"
                        type="text"
                        placeholder="Adaobi Obi"
                        className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-amber-950 font-bold focus:border-amber-500 focus:outline-none"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="inquiry-phone" className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Phone Number</label>
                      <input
                        id="inquiry-phone"
                        type="tel"
                        placeholder="e.g. 07031667434"
                        className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-amber-950 font-bold focus:border-amber-500 focus:outline-none"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="inquiry-email" className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Email Address</label>
                      <input
                        id="inquiry-email"
                        type="email"
                        placeholder="e.g. customer@rakis.com"
                        className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-amber-950 focus:border-amber-500 focus:outline-none"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="inquiry-notes" className="block text-[10px] uppercase font-bold text-gray-400 mb-0.5">Event details, guests estimates, & notes</label>
                    <textarea
                      id="inquiry-notes"
                      rows={3}
                      placeholder="E.g., Wedding reception in Ikeja, 150 guests count, prefers tiered pastel blue vanilla cakes..."
                      className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-amber-950 focus:border-amber-500 focus:outline-none"
                      value={contactContent}
                      onChange={(e) => setContactContent(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  {contactSuccess && (
                    <div id="contact-success-toast" className="p-2 border border-emerald-150 bg-emerald-50 text-emerald-800 text-xs font-bold text-center rounded-xl animate-bounce">
                      💌 Inquiry sent successfully! Chef Rakis will telephone you at your provided numbers shortly.
                    </div>
                  )}

                  {contactError && (
                    <p id="contact-err-toast" className="text-xs text-red-500 font-semibold">
                      ⚠️ {contactError}
                    </p>
                  )}

                  <button
                    id="contact-form-submit-btn"
                    type="submit"
                    disabled={contactSubmitting}
                    className="w-full flex items-center justify-center space-x-1 border border-amber-950/20 rounded-xl py-2.5 text-xs font-bold text-white uppercase bg-amber-950 hover:bg-black transition-all active:scale-95"
                  >
                    <span>{contactSubmitting ? "Submitting Inquiry..." : "Submit Inquiry Request"}</span>
                  </button>
                </form>
              </div>
            </section>
          </div>
        ) : activeTab === "menu" ? (
          <MenuCatalog onAddProductToCart={handleAddProductToCart} />
        ) : activeTab === "customizer" ? (
          <AICustomizer 
            onAddCustomCakeToCart={handleAddProductToCart} 
            onNavigateToCart={() => setIsCartOpen(true)}
          />
        ) : activeTab === "reviews" ? (
          <ReviewsList 
            userId={user?.uid || ""} 
            userName={user?.displayName || ""} 
            onSignIn={handleGoogleSignIn}
          />
        ) : activeTab === "orders-history" && user ? (
          <MyOrdersHistory userId={user.uid} />
        ) : activeTab === "admin" && isAdmin ? (
          <AdminTerminal />
        ) : (
          <div className="text-center py-24">
            <h3 className="font-sans text-xl font-bold">Unrecognized view state redirection.</h3>
            <button onClick={() => setActiveTab("home")} className="mt-4 rounded-full bg-amber-600 text-white px-4 py-2">
              Back Home
            </button>
          </div>
        )}
      </main>

      {/* Footer footer */}
      <footer id="app-footer" className="bg-amber-955 text-amber-100 border-t border-amber-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <span className="font-sans text-lg font-black tracking-wider block">
              Rakis <span className="text-amber-500">Confectionery</span>
            </span>
            <p className="text-xs text-amber-200/60 mt-2 max-w-xs leading-relaxed">
              Serving spectacular custom wedding towers, designer celebration sponge cakes, bouquet cupcakes and French sweets on order across Lagos.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500">Logistics & Hours</h4>
            <div className="text-xs text-amber-200/75 mt-3 space-y-1.5 font-sans">
              <p>Mondays - Saturdays: 8:00 AM – 6:00 PM</p>
              <p>Sunday Services: Pre-booked Pickup deliveries only</p>
              <p>Lagos Mainland & Island dispatch lines available.</p>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-amber-500">Need Help?</h4>
            <div className="text-xs text-amber-200/75 mt-3 space-y-2 font-mono">
              <a href="tel:07031667434" className="flex items-center space-x-1 hover:text-amber-300">
                <Phone className="h-4 w-4 shrink-0 text-amber-500" />
                <span>Call/WhatsApp: 07031667434</span>
              </a>
              <span className="flex items-center space-x-1">
                <Mail className="h-4 w-4 shrink-0 text-amber-500" />
                <span>orders@rakisconfectionery.test</span>
              </span>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 border-t border-amber-900/60 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-amber-200/40">
          <p>© 2026 Rakis Confectionery. Handmade with Pure Love in Nigeria.</p>
          <div className="mt-2 sm:mt-0 flex space-x-4">
            <a 
              href="https://www.instagram.com/rakisconfectionery_07031667434?igsh=YzljYTk1ODg3Zg==" 
              className="hover:text-amber-300"
              target="_blank"
              rel="noreferrer"
            >
              Official Instagram Feed link
            </a>
          </div>
        </div>
      </footer>

      {/* Shopping Cart Drawer Context */}
      <CheckoutModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onRemoveItemFromCart={handleRemoveItemFromCart}
        onClearCart={handleClearCart}
        userId={user?.uid || ""}
        userEmail={user?.email || ""}
        userName={user?.displayName || ""}
      />
    </div>
  );
}
