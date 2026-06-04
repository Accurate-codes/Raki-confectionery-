/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { MenuItem, OrderItem } from "../types";
import { ShoppingCart, Star, Sparkles, Filter, X } from "lucide-react";

// Image imports we generated
import heroImg from "../assets/images/hero_cake_1780568043581.png";
import cupcakesImg from "../assets/images/cupcakes_assorted_1780568070902.png";
import macaronsImg from "../assets/images/pastry_macarons_1780568083869.png";

// Seeding standard list of products
export const SEEDED_MENU: MenuItem[] = [
  {
    id: "classic-vanilla",
    title: "Classic Vanilla Celebration Cake",
    description: "Our signature fluffy golden vanilla bean cake layered with gourmet whipped strawberry buttercream syrup and elegant hand-piped borders.",
    category: "cakes",
    basePrice: 28000,
    image: heroImg,
    popular: true,
    availableSizes: ["6 inch (small)", "8 inch (standard)", "10 inch (celebration)"],
    availableFlavors: ["Classic Vanilla Bean", "Vanilla Strawberry Cream", "Vanilla Coconut Twist"]
  },
  {
    id: "chocolate-fudge",
    title: "Decadent Double Chocolate Fudge Cake",
    description: "An incredibly decadent cocoa sponge drenched in artisan Belgian chocolate glaze, with luxury fudge drips and fresh strawberry toppings.",
    category: "cakes",
    basePrice: 32050,
    image: heroImg,
    popular: true,
    availableSizes: ["6 inch (small)", "8 inch (standard)", "10 inch (celebration)", "12 inch (grand family)"],
    availableFlavors: ["Rich Dark Fudge", "Milk Chocolate Caramel", "Double Cocoa Espresso"]
  },
  {
    id: "royal-cupcakes",
    title: "Royal Bouquet Cupcakes Gift Box",
    description: "A deluxe baker presentation box containing six gorgeous cupcakes styled with gold dust sprinkles and professional velvet buttercream swells.",
    category: "cupcakes",
    basePrice: 12000,
    image: cupcakesImg,
    popular: true,
    availableSizes: ["Box of 6", "Box of 12 (+₦10,000)"],
    availableFlavors: ["Assorted Classic Mix", "Gourmet Red Velvet Swirl", "Double Chocolate Caramel"]
  },
  {
    id: "vibrant-macarons",
    title: "Vibrant Patisserie Macarons Tower",
    description: "Priscilla's sweet, crisp, airy French macarons filled with chocolate ganache and fruit coulis. Elegantly stacked, multicolored.",
    category: "pastries",
    basePrice: 15000,
    image: macaronsImg,
    popular: false,
    availableSizes: ["Deluxe Box of 12", "Grand Tower of 24 (+₦14,000) font"],
    availableFlavors: ["Mixed Gourmet (Vn, Ch, Rp, Pi)", "Rose Petal Vanilla", "Pistachio Hazelnut Zest"]
  },
  {
    id: "red-velvet",
    title: "Red Velvet Devotion Cake",
    description: "Vibrant, moist crimson layers with a light, subtle cocoa texture, sandwiched and custom-styled with classic dense vanilla cream cheese frosting.",
    category: "cakes",
    basePrice: 35000,
    image: heroImg,
    popular: false,
    availableSizes: ["8 inch (standard)", "10 inch (celebration)"],
    availableFlavors: ["Traditional Cream Cheese", "Red Velvet Chocolate Silk"]
  },
  {
    id: "cookies-caramel",
    title: "Salted Caramel Walnut Tart",
    description: "Crisp vanilla shortcrust baking shell with a rich pool of buttery, hand-swirled dynamic caramel, decorated with slow-roasted Nigerian walnuts.",
    category: "desserts",
    basePrice: 18000,
    image: macaronsImg,
    popular: false,
    availableSizes: ["9-inch Round Tart"],
    availableFlavors: ["Sea Salt Pecan Walnut", "Classic Honey Almond"]
  }
];

interface MenuCatalogProps {
  onAddProductToCart: (item: OrderItem) => void;
}

export default function MenuCatalog({ onAddProductToCart }: MenuCatalogProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "cakes" | "cupcakes" | "pastries" | "desserts">("all");
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  // Selector state inside modal
  const [sizeSelection, setSizeSelection] = useState<string>("");
  const [flavorSelection, setFlavorSelection] = useState<string>("");
  const [customInscription, setCustomInscription] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [addedNotify, setAddedNotify] = useState<string | null>(null);

  const filteredMenu = activeFilter === "all"
    ? SEEDED_MENU
    : SEEDED_MENU.filter((item) => item.category === activeFilter);

  function handleOpenOrderModal(product: MenuItem) {
    setSelectedProduct(product);
    setSizeSelection(product.availableSizes?.[0] || "Standard Size");
    setFlavorSelection(product.availableFlavors?.[0] || "Classic Recipe");
    setCustomInscription("");
    setQuantity(1);
    setAddedNotify(null);
  }

  function handleCloseModal() {
    setSelectedProduct(null);
  }

  function handleAddToCartSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedProduct) return;

    // Adjusting base price if larger sizing or quantities are selected
    let finalItemPrice = selectedProduct.basePrice;
    if (sizeSelection.includes("Box of 12")) {
      finalItemPrice += 10000;
    } else if (sizeSelection.includes("Grand Tower of 24")) {
      finalItemPrice += 14000;
    }

    const orderItem: OrderItem = {
      menuItemId: selectedProduct.id,
      title: selectedProduct.title,
      quantity,
      size: sizeSelection,
      flavor: flavorSelection,
      customMessage: customInscription,
      price: finalItemPrice,
    };

    onAddProductToCart(orderItem);
    setAddedNotify(`🥧 Added ${quantity}x ${selectedProduct.title} to your cart successfully!`);
    
    // Auto-close modal after a short delay
    setTimeout(() => {
      setSelectedProduct(null);
    }, 1500);
  }

  return (
    <div id="menu-catalog-container" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Category Tabs */}
      <div id="catalog-header-text" className="text-center mb-8">
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-amber-955">
          Confectionery Menu Catalog
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
          Delicious artisanal creations baked daily using authentic and premium local ingredients. Custom lettering and bespoke specifications always welcomed.
        </p>
      </div>

      {/* Filter controls bar */}
      <div id="filter-controls-tab" className="flex flex-wrap items-center justify-center gap-2 mb-10">
        <span className="text-xs font-bold uppercase text-amber-805 mr-1 flex items-center space-x-1">
          <Filter className="h-4 w-4" />
          <span>Section:</span>
        </span>
        {(["all", "cakes", "cupcakes", "pastries", "desserts"] as const).map((filter) => (
          <button
            key={filter}
            id={`filter-btn-${filter}`}
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeFilter === filter
                ? "bg-amber-600 text-white shadow-md shadow-orange-100"
                : "bg-amber-100/50 text-amber-900 border border-amber-100/40 hover:bg-amber-100"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div id="menu-items-grid" className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
        {filteredMenu.map((product) => (
          <div
            key={product.id}
            id={`product-card-${product.id}`}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-orange-50 bg-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Main Item Image Display */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-amber-50">
              <img
                src={product.image}
                alt={product.title}
                className="h-full w-full object-cover object-center transition-all duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              {/* Overlay Badges */}
              {product.popular && (
                <span className="absolute top-3 left-3 inline-flex items-center space-x-1 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-bold text-white shadow-sm uppercase tracking-widest">
                  <Star className="h-3 w-3 fill-current text-white" />
                  <span>Best-Seller</span>
                </span>
              )}
              <span className="absolute bottom-3 right-3 rounded-xl bg-black/75 px-3 py-1 font-mono text-sm font-semibold text-white backdrop-blur-xs">
                ₦{product.basePrice.toLocaleString()}
              </span>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-amber-600 mb-1 block">
                  {product.category}
                </span>
                <h3 className="font-sans text-lg font-bold text-amber-950 leading-snug group-hover:text-amber-700">
                  {product.title}
                </h3>
                <p className="mt-2 text-xs text-gray-500 line-clamp-3 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Action Button */}
              <button
                id={`order-btn-${product.id}`}
                onClick={() => handleOpenOrderModal(product)}
                className="mt-6 flex w-full cursor-pointer items-center justify-center space-x-2 rounded-xl bg-amber-950 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-sm transition-all hover:bg-amber-600 hover:shadow-md hover:shadow-amber-100 active:scale-95"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Customize & Order</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customization Details Dialog Modal */}
      {selectedProduct && (
        <div id="product-customize-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-amber-50 my-8">
            <button
              id="close-customize-modal"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 bg-amber-50 rounded-full p-1 transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Product description header */}
            <div className="flex items-start space-x-4 pr-6">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.title}
                className="h-16 w-16 rounded-xl object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <span className="font-mono text-[9px] font-bold uppercase text-amber-600">
                  Custom Specs Selector
                </span>
                <h3 className="font-sans text-lg font-bold text-amber-950 leading-tight">
                  {selectedProduct.title}
                </h3>
                <p className="font-mono text-sm font-black text-amber-700 mt-0.5">
                  Starting ₦{selectedProduct.basePrice.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Product Form */}
            <form onSubmit={handleAddToCartSubmit} className="mt-6 space-y-4">
              {/* Sizing field */}
              {selectedProduct.availableSizes && selectedProduct.availableSizes.length > 0 && (
                <div>
                  <label htmlFor="modal-sizes" className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                    Select Dimensions / Sizing
                  </label>
                  <select
                    id="modal-sizes"
                    value={sizeSelection}
                    onChange={(e) => setSizeSelection(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-amber-500 focus:outline-none"
                  >
                    {selectedProduct.availableSizes.map((sz) => (
                      <option key={sz} value={sz}>
                        {sz}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Flavor selection field */}
              {selectedProduct.availableFlavors && selectedProduct.availableFlavors.length > 0 && (
                <div>
                  <label htmlFor="modal-flavors" className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                    Cake Flavor Filling
                  </label>
                  <select
                    id="modal-flavors"
                    value={flavorSelection}
                    onChange={(e) => setFlavorSelection(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 bg-white focus:border-amber-500 focus:outline-none"
                  >
                    {selectedProduct.availableFlavors.map((fl) => (
                      <option key={fl} value={fl}>
                        {fl}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Inscription letters field */}
              <div>
                <label htmlFor="modal-inscription" className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Cake inscription text</span>
                  <span className="text-[10px] text-gray-400 capitalize">Optional</span>
                </label>
                <input
                  id="modal-inscription"
                  type="text"
                  maxLength={60}
                  placeholder="E.g., Happy 25th Birthday Ada! (Max 60 letters)"
                  value={customInscription}
                  onChange={(e) => setCustomInscription(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-amber-500 focus:outline-none"
                />
              </div>

              {/* Quantity field */}
              <div className="flex items-center space-x-4">
                <div>
                  <label htmlFor="modal-qty" className="block text-xs font-bold text-amber-950 uppercase tracking-wider mb-1">
                    Quantity
                  </label>
                  <input
                    id="modal-qty"
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-20 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 text-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div className="flex-1 text-right mt-5">
                  <span className="text-[10px] text-gray-400 uppercase font-semibold">Subtotal</span>
                  <h4 className="font-sans text-xl font-black text-amber-950">
                    ₦{((selectedProduct.basePrice + (sizeSelection.includes("Box of 12") ? 10000 : sizeSelection.includes("Grand Tower of 24") ? 14000 : 0)) * quantity).toLocaleString()}
                  </h4>
                </div>
              </div>

              {/* Action notification */}
              {addedNotify && (
                <div id="modal-toast-notify" className="p-2 border border-emerald-150 bg-emerald-50 rounded-xl text-emerald-800 text-center text-xs font-semibold animate-pulse">
                  {addedNotify}
                </div>
              )}

              {/* Action submission buttons */}
              <button
                id="modal-submit-add-btn"
                type="submit"
                disabled={!!addedNotify}
                className="w-full mt-4 flex items-center justify-center space-x-2 rounded-xl bg-amber-650 py-3 text-sm font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-amber-700 active:scale-95 disabled:bg-emerald-600 disabled:opacity-90"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>{addedNotify ? "Cake Added!" : "Add to Shopping Cart"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
