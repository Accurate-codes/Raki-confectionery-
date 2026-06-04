/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { Order, Review, ContactMessage } from "../types";
import { collection, updateDoc, doc, deleteDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { ShieldCheck, Calendar, Phone, Mail, FileText, CheckCircle, Trash2, MessageSquare, AlertCircle, RefreshCw } from "lucide-react";

export default function AdminTerminal() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  const [activeSubTab, setActiveSubTab] = useState<"orders" | "reviews" | "messages">("orders");
  const [loading, setLoading] = useState(true);
  const [updaterMessage, setUpdaterMessage] = useState<string | null>(null);

  // Sync state inputs on startup
  useEffect(() => {
    setLoading(true);

    // 1. Sync orders
    const ordersQuery = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribeOrders = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const list: Order[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as any as Order);
        });
        setOrders(list);
        setLoading(false);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "orders");
      }
    );

    // 2. Sync reviews
    const reviewsQuery = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
    const unsubscribeReviews = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const list: Review[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as any as Review);
        });
        setReviews(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "reviews");
      }
    );

    // 3. Sync messages
    const messagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribeMessages = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const list: ContactMessage[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as any as ContactMessage);
        });
        setMessages(list);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "messages");
      }
    );

    return () => {
      unsubscribeOrders();
      unsubscribeReviews();
      unsubscribeMessages();
    };
  }, []);

  // Update order progress status
  async function handleUpdateOrderStatus(docId: string, newStatus: string) {
    try {
      const orderRef = doc(db, "orders", docId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date(),
      });
      setUpdaterMessage("✅ Order status updated successfully!");
      setTimeout(() => setUpdaterMessage(null), 3500);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `orders/${docId}`);
    }
  }

  // Delete an order record
  async function handleDeleteOrder(docId: string) {
    if (!window.confirm("Are you positive you wish to completely archive and erase this sales order? This cannot be undone.")) return;
    try {
      await deleteDoc(doc(db, "orders", docId));
      setUpdaterMessage("🗑️ Order archived successfully.");
      setTimeout(() => setUpdaterMessage(null), 3500);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `orders/${docId}`);
    }
  }

  // Approve a review to public catalog feed
  async function handleApproveReview(docId: string) {
    try {
      const reviewRef = doc(db, "reviews", docId);
      await updateDoc(reviewRef, { approved: true });
      setUpdaterMessage("✅ Customer review approved for public display!");
      setTimeout(() => setUpdaterMessage(null), 3500);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `reviews/${docId}`);
    }
  }

  // Delete a review feedback
  async function handleDeleteReview(docId: string) {
    if (!window.confirm("Archive this review?")) return;
    try {
      await deleteDoc(doc(db, "reviews", docId));
      setUpdaterMessage("🗑️ Review deleted.");
      setTimeout(() => setUpdaterMessage(null), 3500);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `reviews/${docId}`);
    }
  }

  // Mark message/quote request as read
  async function handleToggleMessageRead(docId: string, currentRead: boolean) {
    try {
      const msgRef = doc(db, "messages", docId);
      await updateDoc(msgRef, { read: !currentRead });
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `messages/${docId}`);
    }
  }

  // Delete contact form message
  async function handleDeleteMessage(docId: string) {
    if (!window.confirm("Erase this contact inquiry?")) return;
    try {
      await deleteDoc(doc(db, "messages", docId));
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.DELETE, `messages/${docId}`);
    }
  }

  return (
    <div id="admin-terminal-dashboard" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Admin Headers */}
      <div id="admin-banner" className="bg-amber-955 rounded-2xl p-6 text-white mb-8 shadow-md flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-400 flex items-center justify-center text-amber-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-sans text-2xl font-black tracking-tight text-white flex items-center space-x-2">
              <span>Admin Control Terminal</span>
            </h2>
            <p className="font-mono text-[10px] text-amber-200/80 uppercase tracking-widest mt-0.5">
              Rakis Confectionery Management Portal
            </p>
          </div>
        </div>
        <div className="mt-4 md:mt-0 font-mono text-xs bg-amber-900 px-4 py-2 rounded-xl text-amber-100 flex items-center space-x-2 border border-amber-800">
          <span>Logged as Store Owner</span>
        </div>
      </div>

      {/* Database notification updates tracker */}
      {updaterMessage && (
        <div id="admin-toast-notify" className="mb-6 p-3 rounded-xl bg-orange-50 border border-orange-100 text-amber-900 text-xs font-bold font-sans flex items-center space-x-2 animate-pulse shadow">
          <span>{updaterMessage}</span>
        </div>
      )}

      {/* Multi-section Switchers */}
      <div id="admin-terminal-tabs" className="flex border-b border-gray-100 mb-8 space-x-4">
        <button
          onClick={() => setActiveSubTab("orders")}
          className={`pb-4 px-2 text-sm font-bold tracking-wider uppercase transition-all ${
            activeSubTab === "orders" ? "border-b-2 border-amber-600 text-amber-950" : "text-gray-400 hover:text-amber-950"
          }`}
        >
          Orders Database ({orders.length})
        </button>
        <button
          onClick={() => setActiveSubTab("reviews")}
          className={`pb-4 px-2 text-sm font-bold tracking-wider uppercase transition-all ${
            activeSubTab === "reviews" ? "border-b-2 border-amber-600 text-amber-950" : "text-gray-400 hover:text-amber-950"
          }`}
        >
          Customer Guestbook ({reviews.filter(r => !r.approved).length} new)
        </button>
        <button
          onClick={() => setActiveSubTab("messages")}
          className={`pb-4 px-2 text-sm font-bold tracking-wider uppercase transition-all ${
            activeSubTab === "messages" ? "border-b-2 border-amber-600 text-amber-950" : "text-gray-400 hover:text-amber-950"
          }`}
        >
          Client Inquiries ({messages.filter(m => !m.read).length} unread)
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <RefreshCw className="h-8 w-8 text-amber-600 animate-spin mb-3" />
          <p className="text-sm text-gray-500 font-semibold">Pulling records from cloud tables...</p>
        </div>
      ) : activeSubTab === "orders" ? (
        <div id="orders-dashboard-view" className="space-y-6">
          {orders.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-xl py-12 text-center text-gray-400">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-semibold">No transactions recorded in the database yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
              <table className="min-w-full divide-y divide-gray-100 text-left text-xs">
                <thead className="bg-amber-50/50 text-amber-950/80 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Order ID & Date</th>
                    <th className="px-6 py-4">Customer Details</th>
                    <th className="px-6 py-4">Custom Cake Specifications & Items</th>
                    <th className="px-6 py-4">Total Price</th>
                    <th className="px-6 py-4">Logistics Specs</th>
                    <th className="px-6 py-4 text-center">Order Status & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 divide-solid">
                  {orders.map((ord) => (
                    <tr key={ord.id} id={`admin-order-row-${ord.id}`} className="hover:bg-amber-50/10">
                      {/* ID & date */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-bold text-amber-900 block">{ord.id}</span>
                        <span className="text-gray-400 block text-[10px] mt-0.5">
                          {ord.createdAt?.seconds ? new Date(ord.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}
                        </span>
                      </td>

                      {/* Customer details */}
                      <td className="px-6 py-4">
                        <span className="font-bold text-amber-955 block">{ord.customerName}</span>
                        <span className="text-gray-400 flex items-center space-x-1 mt-0.5 font-mono text-[10px]">
                          <Phone className="h-3 w-3 shrink-0" />
                          <span>{ord.customerPhone}</span>
                        </span>
                        <span className="text-gray-400 flex items-center space-x-1 font-mono text-[10px]">
                          <Mail className="h-3 w-3 shrink-0" />
                          <span className="truncate max-w-[120px]">{ord.customerEmail}</span>
                        </span>
                      </td>

                      {/* Products */}
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          {ord.items?.map((item, idx) => (
                            <div key={idx} className="border-l border-amber-200 pl-2">
                              <span className="font-semibold text-amber-950">{item.title}</span>{" "}
                              <span className="text-[10px] bg-amber-50 text-amber-800 px-1 rounded">
                                {item.quantity}x
                              </span>
                              <p className="text-[10px] text-gray-400 mt-0.5 leading-none font-mono">
                                Size: {item.size} • Flavor: {item.flavor}
                              </p>
                              {item.customMessage && (
                                <p className="text-[10px] italic text-amber-700 font-sans mt-0.5 leading-tight">
                                  Inscribed: "{item.customMessage}"
                                </p>
                              )}
                            </div>
                          ))}
                          {ord.orderNotes && (
                            <div className="bg-amber-50/40 p-1.5 rounded text-[10px] max-w-[240px]">
                              <strong className="text-amber-900">Notes:</strong> {ord.orderNotes}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-sans font-black text-amber-750 text-sm">
                          ₦{(ord.totalAmount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Delivery preference */}
                      <td className="px-6 py-4 max-w-[150px]">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider inline-block ${
                          ord.deliveryType === "delivery" ? "bg-purple-100 text-purple-800" : "bg-amber-100 text-amber-800"
                        }`}>
                          {ord.deliveryType}
                        </span>
                        <span className="text-gray-400 block font-mono text-[10px] mt-1">
                          Date: {ord.deliveryDate}
                        </span>
                        {ord.deliveryAddress && (
                          <span className="text-[10px] text-gray-500 line-clamp-2 mt-0.5">
                            Loc: {ord.deliveryAddress}
                          </span>
                        )}
                      </td>

                      {/* Status controller */}
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-2">
                          <select
                            value={ord.status}
                            id={`status-select-${ord.id}`}
                            onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                            className={`rounded-xl border px-2 py-1.5 text-[11px] font-bold uppercase tracking-wide focus:outline-none ${
                              ord.status === "completed"
                                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                : ord.status === "confirmed"
                                ? "bg-blue-50 border-blue-200 text-blue-800"
                                : ord.status === "pending"
                                ? "bg-amber-50 border-amber-200 text-amber-800"
                                : "bg-red-50 border-red-200 text-red-800"
                            }`}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>

                          <button
                            id={`delete-order-btn-${ord.id}`}
                            onClick={() => handleDeleteOrder(ord.id)}
                            className="text-gray-400 hover:text-red-650 rounded-full hover:bg-red-50 p-1.5 transition-all"
                            title="Delete sales record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : activeSubTab === "reviews" ? (
        <div id="reviews-dashboard-view" className="space-y-4">
          {reviews.length === 0 ? (
            <div className="border border-dashed border-gray-250 py-12 text-center text-gray-400 rounded-xl">
              <MessageSquare className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold">No feedback records to display yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  id={`admin-review-card-${rev.id}`}
                  className="rounded-xl border border-gray-150 p-4 bg-white flex flex-col justify-between shadow-xs hover:border-amber-200"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950 text-sm block">{rev.userName}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-widest font-extrabold ${
                        rev.approved ? "bg-emerald-100 text-emerald-850" : "bg-amber-100 text-amber-850"
                      }`}>
                        {rev.approved ? "Approved" : "Pending Approval"}
                      </span>
                    </div>
                    <div className="flex items-center space-x-0.5 mt-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <span key={s} className={`text-base leading-none ${rev.rating >= s ? "fill-current" : "text-gray-200"}`}>★</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-650 mt-2 italic font-sans">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400 font-mono">
                      {rev.createdAt?.seconds ? new Date(rev.createdAt.seconds * 1000).toLocaleDateString() : ""}
                    </span>
                    <div className="flex items-center space-x-2">
                      {!rev.approved && (
                        <button
                          id={`approve-review-btn-${rev.id}`}
                          onClick={() => handleApproveReview(rev.id)}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white hover:bg-emerald-700 transition-all flex items-center space-x-1"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          <span>Approve Review</span>
                        </button>
                      )}
                      <button
                        id={`delete-review-btn-${rev.id}`}
                        onClick={() => handleDeleteReview(rev.id)}
                        className="text-gray-400 hover:text-red-750 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div id="messages-dashboard-view" className="space-y-4">
          {messages.length === 0 ? (
            <div className="border border-dashed border-gray-250 py-12 text-center text-gray-400 rounded-xl font-sans">
              <FileText className="h-8 w-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm font-semibold">No inquiries from clients yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  id={`admin-msg-card-${msg.id}`}
                  className={`rounded-xl border p-4 bg-white shadow-xs flex flex-col justify-between transition-all ${
                    msg.read ? "border-gray-150 opacity-80" : "border-amber-400 ring-1 ring-amber-100"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-50 pb-2">
                    <div>
                      <span className="text-sm font-black text-amber-970 block">
                        {msg.name} { !msg.read && <span className="text-[9px] bg-red-10 px-1 rounded text-red-650 uppercase tracking-wide ml-1 font-bold">New</span>}
                      </span>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 font-mono text-[10px] text-gray-400">
                        <span>Email: <strong className="text-gray-600">{msg.email}</strong></span>
                        <span>Phone: <strong className="text-gray-650">{msg.phone}</strong></span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 text-right shrink-0">
                      {msg.createdAt?.seconds ? new Date(msg.createdAt.seconds * 1000).toLocaleString() : ""}
                    </span>
                  </div>

                  <div className="my-3 text-xs text-gray-700 leading-relaxed font-sans">
                    {msg.content}
                  </div>

                  <div className="flex justify-end items-center space-x-2 pt-2 border-t border-gray-50">
                    <button
                      id={`read-message-btn-${msg.id}`}
                      onClick={() => handleToggleMessageRead(msg.id, msg.read)}
                      className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                        msg.read ? "bg-gray-100 text-gray-550" : "bg-amber-600 text-white hover:bg-amber-700"
                      }`}
                    >
                      {msg.read ? "Mark Unread" : "Mark Read"}
                    </button>
                    <button
                      id={`delete-message-btn-${msg.id}`}
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-gray-400 hover:text-red-750 p-1.5 rounded hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
