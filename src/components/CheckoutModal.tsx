/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from "react";
import { OrderItem } from "../types";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { X, Trash2, ShoppingBag, Send, Phone, MapPin, Calendar, Clock, Lock, CreditCard } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: OrderItem[];
  onRemoveItemFromCart: (index: number) => void;
  onClearCart: () => void;
  userId: string;
  userEmail: string;
  userName: string;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  onRemoveItemFromCart,
  onClearCart,
  userId,
  userEmail,
  userName,
}: CheckoutModalProps) {
  const [customerName, setCustomerName] = useState(userName || "");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState(userEmail || "");
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [orderNotes, setOrderNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalAmount = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  async function handleCheckoutSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Basic fields validation
    if (!customerName.trim() || !customerPhone.trim() || !deliveryDate) {
      setError("Please complete all required fields (Name, Phone number, and Pickup/Delivery Date).");
      return;
    }

    // Phone pattern validation
    if (!customerPhone.match(/^[0-9+() \-]{10,20}$/)) {
      setError("Please input a valid phone contact format (e.g., Nigerian standard 07031667434).");
      return;
    }

    if (deliveryType === "delivery" && !deliveryAddress.trim()) {
      setError("Please specify a complete street/house address for delivery.");
      return;
    }

    setLoading(true);

    const checkTimestamp = new Date();
    const orderId = `order-${Date.now()}`;

    // Structure our database item precisely matching firebase-blueprint.json Order entity
    const orderPayload = {
      id: orderId,
      userId: userId || "anonymous",
      customerName: customerName,
      customerPhone: customerPhone,
      customerEmail: customerEmail || "anonymous@rakis.com",
      items: cartItems.map((item) => ({
        menuItemId: item.menuItemId,
        title: item.title,
        quantity: item.quantity,
        size: item.size,
        flavor: item.flavor,
        customMessage: item.customMessage || "",
        price: item.price,
      })),
      totalAmount: totalAmount,
      deliveryType: deliveryType,
      deliveryAddress: deliveryType === "delivery" ? deliveryAddress : "",
      deliveryDate: deliveryDate,
      orderNotes: orderNotes,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const targetCollection = "orders";
    try {
      // Record directly inside Firestore with our atomic structure
      await addDoc(collection(db, targetCollection), orderPayload);
      setSuccess(true);
      onClearCart();
    } catch (err) {
      console.error("Order submission failure:", err);
      // Ensure we catch permission errors using standard system diagnostic handles
      handleFirestoreError(err, OperationType.CREATE, `${targetCollection}/${orderId}`);
      setError("Failed to record transaction order. Please confirm database rules are deployed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="checkout-shopping-cart-overlay" className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div id="checkout-drawer-body" className="relative w-full max-w-lg h-full bg-white p-6 shadow-2xl flex flex-col justify-between overflow-y-auto border-l border-amber-100">
        {/* Header drawer */}
        <div>
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 className="font-sans text-xl font-black text-amber-955 flex items-center space-x-2">
              <ShoppingBag className="h-5 w-5 text-amber-600 animate-bounce" />
              <span>Your Shopping Bag</span>
            </h3>
            <button
              id="close-checkout-drawer"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-900 bg-amber-50 rounded-full p-1.5 transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {success ? (
            <div id="checkout-success-banner" className="py-12 text-center flex flex-col items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 animate-pulse">
                <Send className="h-8 w-8" />
              </div>
              <h4 className="font-sans font-extrabold text-amber-900 text-lg">Order Logged Successfully!</h4>
              <p className="text-xs text-gray-500 max-w-[280px] mt-2 mb-6 leading-relaxed">
                Thank you for choosing Rakis Confectionery! Your order has been registered securely. We will contact you via phone or email link soon to coordinate baking details.
              </p>
              <button
                id="success-close-btn"
                onClick={onClose}
                className="rounded-full bg-amber-950 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-black transition-all"
              >
                Close Drawer
              </button>
            </div>
          ) : cartItems.length === 0 ? (
            <div id="drawer-empty-state" className="py-20 text-center flex flex-col items-center justify-center">
              <ShoppingBag className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm font-semibold text-gray-500">Your bag is completely empty</p>
              <p className="text-xs text-gray-450 mt-1 max-w-[200px]">
                Browse our classic menu catalog or try our signature AI Custom Cake Planner to design a masterpiece first.
              </p>
            </div>
          ) : (
            <div id="drawer-with-items" className="mt-4 space-y-4">
              {/* Review Card Lists */}
              <div id="drawer-items-list" className="max-h-[220px] overflow-y-auto space-y-3 pr-1 divide-y divide-gray-50">
                {cartItems.map((item, index) => (
                  <div key={index} id={`cart-item-${index}`} className="flex items-start justify-between pt-3 first:pt-0">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-amber-950 leading-tight">
                        {item.title}
                      </h4>
                      <div className="font-mono text-[10px] text-gray-400 mt-0.5 space-x-2">
                        <span>Size: <strong className="text-amber-900">{item.size}</strong></span>
                        <span>•</span>
                        <span>Flavor: <strong className="text-amber-900">{item.flavor}</strong></span>
                      </div>
                      {item.customMessage && (
                        <p className="text-[10px] bg-amber-50 text-amber-800 p-1 rounded mt-1 font-sans italic leading-none max-w-[340px] truncate">
                          Inscribed: "{item.customMessage}"
                        </p>
                      )}
                    </div>
                    <div className="text-right pl-3 shrink-0">
                      <p className="text-xs font-bold text-amber-950">
                        ₦{(item.price * item.quantity).toLocaleString()}
                      </p>
                      <button
                        onClick={() => onRemoveItemFromCart(index)}
                        className="text-red-400 hover:text-red-700 font-semibold text-[10px] mt-1 inline-flex items-center space-x-0.5"
                        type="button"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div id="drawer-sum" className="border-t border-gray-100 pt-4 flex items-baseline justify-between">
                <span className="text-xs font-bold uppercase text-gray-400">Total Bill Amount:</span>
                <span className="font-sans text-2xl font-black text-amber-700">
                  ₦{totalAmount.toLocaleString()}
                </span>
              </div>

              {/* Secure Checkout Form */}
              <form onSubmit={handleCheckoutSubmit} className="mt-5 border-t border-gray-100 pt-5 space-y-4">
                <h4 className="text-xs font-bold uppercase text-amber-950 tracking-wider flex items-center space-x-1">
                  <Lock className="h-3.5 w-3.5 text-amber-600" />
                  <span>Secure Order Submission Details</span>
                </h4>

                {/* Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="chk-name" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                      Name
                    </label>
                    <input
                      id="chk-name"
                      type="text"
                      className="w-full rounded-xl border border-gray-250 px-3 py-1.5 text-xs text-amber-950 font-bold focus:border-amber-500 focus:outline-none"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                    />
                  </div>
                  {/* Phone */}
                  <div>
                    <label htmlFor="chk-phone" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                      Phone Number
                    </label>
                    <div className="relative flex items-center">
                      <Phone className="absolute left-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                      <input
                        id="chk-phone"
                        type="tel"
                        placeholder="e.g. 07031667434"
                        className="w-full rounded-xl border border-gray-250 pl-8 pr-3 py-1.5 text-xs text-amber-950 font-bold focus:border-amber-500 focus:outline-none"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Logistics pickup vs delivery */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="chk-logistics" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Delivery Preferences
                    </label>
                    <div id="chk-logistics" className="flex rounded-xl bg-amber-50/50 border border-amber-100 p-0.5">
                      <button
                        type="button"
                        onClick={() => setDeliveryType("pickup")}
                        className={`flex-1 rounded-lg py-1 text-center text-xs font-bold uppercase tracking-wider ${
                          deliveryType === "pickup"
                            ? "bg-amber-600 text-white"
                            : "text-amber-900"
                        }`}
                      >
                        Pickup
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeliveryType("delivery")}
                        className={`flex-1 rounded-lg py-1 text-center text-xs font-bold uppercase tracking-wider ${
                          deliveryType === "delivery"
                            ? "bg-amber-600 text-white"
                            : "text-amber-900"
                        }`}
                      >
                        Delivery
                      </button>
                    </div>
                  </div>
                  {/* Date field */}
                  <div>
                    <label htmlFor="chk-date" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                      Event / Pickup Date
                    </label>
                    <div className="relative flex items-center">
                      <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                      <input
                        id="chk-date"
                        type="date"
                        className="w-full rounded-xl border border-gray-250 pl-8 pr-3 py-1 text-xs text-amber-950 font-bold focus:border-amber-500 focus:outline-none"
                        value={deliveryDate}
                        onChange={(e) => setDeliveryDate(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Conditional Delivery Address */}
                {deliveryType === "delivery" && (
                  <div>
                    <label htmlFor="chk-address" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                      Lagos Street / House Address
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="absolute left-2.5 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
                      <input
                        id="chk-address"
                        type="text"
                        placeholder="Full address details"
                        className="w-full rounded-xl border border-gray-250 pl-8 pr-3 py-1.5 text-xs text-amber-950 focus:border-amber-500 focus:outline-none"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label htmlFor="chk-notes" className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5 font-sans">
                    Custom themes, inscriptions or special requests notes
                  </label>
                  <textarea
                    id="chk-notes"
                    rows={2}
                    placeholder="E.g., Please use pastel pink themes, high-contrast gold sprinkles, do not add egg fillings..."
                    className="w-full rounded-xl border border-gray-250 px-3 py-1 text-xs text-amber-950 focus:border-amber-500 focus:outline-none"
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                  ></textarea>
                </div>

                {/* Submittal instructions notice mapping NGN limits */}
                <div className="flex items-start space-x-2 bg-amber-50 border border-amber-100 p-2.5 rounded-xl">
                  <CreditCard className="h-4 w-4 text-amber-600 mt-1 shrink-0" />
                  <p className="text-[10px] text-amber-800 leading-snug">
                    <strong>Notice:</strong> Complete checkout locks in your order specs. No payment is required here. A customer representative will follow up via your listed digits to confirm delivery fees and coordinate mobile transfer deposits.
                  </p>
                </div>

                {error && (
                  <p id="checkout-err-field" className="text-xs text-red-500 font-semibold">
                    ⚠️ {error}
                  </p>
                )}

                <button
                  id="checkout-confirm-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center space-x-2 rounded-xl bg-amber-950 py-3 text-sm font-bold uppercase tracking-widest text-white shadow-md transition-all hover:bg-amber-600 hover:shadow-orange-100 active:scale-95"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting Order...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Confirm & Conclude Order</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
