/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User } from "firebase/auth";
import { Cake, ShoppingBag, User as UserIcon, ShieldAlert } from "lucide-react";

interface NavbarProps {
  user: User | null;
  isAdmin: boolean;
  cartCount: number;
  onOpenCart: () => void;
  onSignIn: () => void;
  onSignOut: () => void;
  activeTab: "home" | "menu" | "customizer" | "reviews" | "orders-history" | "admin";
  setActiveTab: (tab: "home" | "menu" | "customizer" | "reviews" | "orders-history" | "admin") => void;
}

export default function Navbar({
  user,
  isAdmin,
  cartCount,
  onOpenCart,
  onSignIn,
  onSignOut,
  activeTab,
  setActiveTab,
}: NavbarProps) {
  return (
    <nav id="app-nav" className="sticky top-0 z-40 w-full border-b border-orange-100 bg-amber-50/95 shadow-sm backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo Brand */}
          <div 
            id="brand-logo"
            className="flex cursor-pointer items-center space-x-2" 
            onClick={() => setActiveTab("home")}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-2 ring-amber-200">
              <Cake className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <span className="font-sans text-xl font-bold tracking-tight text-amber-950">
                Rakis <span className="text-amber-600 font-medium">Confectionery</span>
              </span>
              <p className="font-mono text-[9px] text-amber-700/80 uppercase tracking-widest leading-none">
                07031667434
              </p>
            </div>
          </div>

          {/* Nav Tabs */}
          <div id="nav-actions-group" className="hidden md:flex items-center space-x-1 lg:space-x-4">
            <button
              id="tab-home"
              onClick={() => setActiveTab("home")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "home"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-900 hover:bg-amber-100/50"
              }`}
            >
              Gallery & About
            </button>
            <button
              id="tab-menu"
              onClick={() => setActiveTab("menu")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "menu"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-900 hover:bg-amber-100/50"
              }`}
            >
              Menu Catalog
            </button>
            <button
              id="tab-customizer"
              onClick={() => setActiveTab("customizer")}
              className={`rounded-full px-4 py-3 text-sm font-bold tracking-wide transition-all uppercase flex items-center space-x-1.5 ${
                activeTab === "customizer"
                  ? "bg-amber-755 text-amber-900 border-2 border-amber-500 shadow"
                  : "text-amber-900 bg-amber-100/60 ring-1 ring-amber-200 hover:bg-amber-200"
              }`}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span>AI Cake Designer</span>
            </button>
            <button
              id="tab-reviews"
              onClick={() => setActiveTab("reviews")}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTab === "reviews"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-amber-900 hover:bg-amber-100/50"
              }`}
            >
              Guestbook & Reviews
            </button>

            {user && (
              <button
                id="tab-history"
                onClick={() => setActiveTab("orders-history")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === "orders-history"
                    ? "bg-amber-600 text-white shadow-sm"
                    : "text-amber-900 hover:bg-amber-100/50"
                }`}
              >
                My Orders
              </button>
            )}

            {isAdmin && (
              <button
                id="tab-admin"
                onClick={() => setActiveTab("admin")}
                className={`rounded-full px-4 py-2 text-sm font-semibold tracking-tight transition-all flex items-center space-x-1 border border-red-200 ${
                  activeTab === "admin"
                    ? "bg-red-650 text-white"
                    : "bg-red-50 text-red-755 hover:bg-red-100"
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>Admin Panel</span>
              </button>
            )}
          </div>

          {/* User Controls and Shopping Cart Trigger */}
          <div id="nav-user-actions" className="flex items-center space-x-2">
            {/* Bag Button */}
            <button
              id="cart-trigger-btn"
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-900 shadow-sm transition-all hover:bg-amber-200/80 active:scale-95"
              aria-label="View shopping bag"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[10px] font-bold text-white shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Auth Controls */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  id="tab-history-mobile"
                  onClick={() => setActiveTab("orders-history")}
                  className="hidden sm:flex h-10 px-3 items-center space-x-1.5 rounded-full border border-amber-200 bg-amber-50 text-xs text-amber-900 hover:bg-amber-100/60"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || "User Avatar"}
                      className="h-5 w-5 rounded-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon className="h-4 w-4" />
                  )}
                  <span className="max-w-[80px] truncate">
                    {user.displayName?.split(" ")[0] || "Account"}
                  </span>
                </button>
                <button
                  id="sign-out-btn"
                  onClick={onSignOut}
                  className="rounded-full px-3 py-1.5 text-xs font-semibold tracking-tight bg-amber-100 text-amber-900 transition-all hover:bg-amber-250 hover:text-amber-950 active:scale-95"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                id="sign-in-btn"
                onClick={onSignIn}
                className="gradient-btn flex items-center space-x-1.5 rounded-full bg-amber-600 px-4 py-2 text-xs font-semibold tracking-wide text-white shadow-md transition-all hover:bg-amber-700 active:scale-95"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Google Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar Links */}
        <div id="mobile-tabs-container" className="md:hidden flex h-11 items-center justify-between border-t border-amber-100/60 font-medium text-xs text-amber-950 px-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("home")}
            className={`px-3 py-1.5 rounded-md ${activeTab === "home" ? "bg-amber-100 text-amber-900" : ""}`}
          >
            Gallery
          </button>
          <button
            onClick={() => setActiveTab("menu")}
            className={`px-3 py-1.5 rounded-md ${activeTab === "menu" ? "bg-amber-100 text-amber-900" : ""}`}
          >
            Menu
          </button>
          <button
            onClick={() => setActiveTab("customizer")}
            className={`px-3 py-1.5 rounded-md flex items-center space-x-1 font-bold ${activeTab === "customizer" ? "bg-amber-200 text-amber-950" : "text-amber-800"}`}
          >
            <span id="mobile-live-beacon" className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
            <span>AI Design</span>
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-3 py-1.5 rounded-md ${activeTab === "reviews" ? "bg-amber-100 text-amber-900" : ""}`}
          >
            Reviews
          </button>
          {user && (
            <button
              onClick={() => setActiveTab("orders-history")}
              className={`px-3 py-1.5 rounded-md ${activeTab === "orders-history" ? "bg-amber-100 text-amber-900" : ""}`}
            >
              Orders
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-700 ${activeTab === "admin" ? "bg-red-600 text-white font-bold" : ""}`}
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
