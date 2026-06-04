/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Order } from "../types";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { ListTodo, Calendar, Phone, Package, RefreshCw, AlertCircle } from "lucide-react";

interface MyOrdersHistoryProps {
  userId: string;
}

export default function MyOrdersHistory({ userId }: MyOrdersHistoryProps) {
  const [myOrders, setMyOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchUserOrders() {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const ordersCol = collection(db, "orders");
      const q = query(
        ordersCol,
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const list: Order[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as any as Order);
      });
      setMyOrders(list);
    } catch (err) {
      console.error("Error fetching client orders:", err);
      // Fallback
      setError("Failed to retreive registered orders. Verify connection credentials.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserOrders();
  }, [userId]);

  return (
    <div id="my-orders-dashboard" className="mx-auto max-w-4xl px-4 py-8">
      {/* Banner */}
      <div id="orders-dashboard-header" className="text-center mb-8">
        <span className="inline-flex items-center space-x-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 uppercase tracking-widest">
          <ListTodo className="h-3.5 w-3.5" />
          <span>Track Statuses</span>
        </span>
        <h2 className="font-sans text-2xl font-black text-amber-955 mt-2">
          Your Order History
        </h2>
        <p className="mt-1.5 text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
          Monitor cake custom fabrication states, pickup dates and delivery updates verified directly in the store owner's databases in real-time.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <RefreshCw className="h-6 w-6 text-amber-600 animate-spin mx-auto mb-2" />
          <p className="text-xs text-gray-400">Syncing sales specs...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-center text-amber-900 text-xs font-semibold">
          ⚠️ {error}
        </div>
      ) : myOrders.length === 0 ? (
        <div className="border border-dashed border-gray-250 py-12 text-center text-gray-400 rounded-xl">
          <AlertCircle className="h-8 w-8 mx-auto text-gray-300 mb-2 whitespace-nowrap" />
          <p className="text-sm font-semibold">You haven't placed any orders yet</p>
          <p className="text-xs text-gray-400 mt-1">Browse our yummy confectionery catalog and checkout!</p>
        </div>
      ) : (
        <div id="client-orders-history-list" className="space-y-6">
          {myOrders.map((ord) => (
            <div
              key={ord.id}
              id={`history-order-card-${ord.id}`}
              className="rounded-xl border border-orange-50 bg-white p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden"
            >
              {/* Top info row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-3 mb-4">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg">
                    ID: {ord.id}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {ord.createdAt?.seconds ? new Date(ord.createdAt.seconds * 1000).toLocaleDateString() : ""}
                  </span>
                </div>

                {/* status colored indicator */}
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">State:</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest ${
                    ord.status === "completed"
                      ? "bg-emerald-100 text-emerald-850"
                      : ord.status === "confirmed"
                      ? "bg-blue-105 bg-emerald-50 text-blue-800"
                      : ord.status === "pending"
                      ? "bg-amber-100 text-amber-850"
                      : "bg-red-101 bg-red-50 text-red-800"
                  }`}>
                    {ord.status}
                  </span>
                </div>
              </div>

              {/* Items listing */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                <div className="md:col-span-2 space-y-3">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold flex items-center space-x-1">
                    <Package className="h-3.5 w-3.5 text-amber-600" />
                    <span>Treat Packages</span>
                  </span>
                  <div className="space-y-2.5">
                    {ord.items?.map((item, id) => (
                      <div key={id} className="bg-amber-50/20 rounded-xl p-3 border border-amber-100/30">
                        <div className="flex justify-between items-baseline gap-2">
                          <h4 className="text-sm font-bold text-amber-955">{item.title}</h4>
                          <span className="font-mono text-xs font-black text-amber-950 shrink-0">
                            ₦{(item.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 mt-1 font-mono">
                          <span>Qty: <strong className="text-amber-900">{item.quantity}</strong></span>
                          <span>•</span>
                          <span>Size: <strong className="text-amber-900">{item.size}</strong></span>
                          <span>•</span>
                          <span>Flavor: <strong className="text-amber-900">{item.flavor}</strong></span>
                        </div>
                        {item.customMessage && (
                          <div className="text-[10px] bg-white border border-amber-100 p-2.5 rounded-lg font-sans italic text-amber-800 mt-2">
                            Custom specs notes: "{item.customMessage}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistics */}
                <div className="md:col-span-1 rounded-xl bg-amber-50/20 border border-amber-100/35 p-4 space-y-3 shrink-0">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold flex items-center space-x-1">
                    <Calendar className="h-3.5 w-3.5 text-amber-600" />
                    <span>Schedules & Delivery</span>
                  </span>

                  <div className="space-y-2 font-sans text-xs">
                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Logistics Preference:</span>
                      <span className="font-mono text-amber-950 font-bold capitalize">{ord.deliveryType}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">Delivery Scheduled Date:</span>
                      <span className="font-mono text-amber-950 font-bold">{ord.deliveryDate}</span>
                    </div>

                    {ord.deliveryAddress && (
                      <div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase block">Lagos Street Address:</span>
                        <span className="font-sans text-gray-700 leading-tight block">{ord.deliveryAddress}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-amber-100/40 pt-3 text-right">
                    <span className="text-[10px] text-gray-400 font-bold uppercase block">Total Statement:</span>
                    <h3 className="font-sans text-xl font-black text-amber-700">
                      ₦{(ord.totalAmount || 0).toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
