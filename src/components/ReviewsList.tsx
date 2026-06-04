/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from "react";
import { Review } from "../types";
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { Star, MessageSquarePlus, MessageSquare, ShieldCheck, Heart } from "lucide-react";

interface ReviewsListProps {
  userId: string;
  userName: string;
  onSignIn: () => void;
}

export default function ReviewsList({ userId, userName, onSignIn }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewerName, setReviewerName] = useState(userName || "");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedStatus, setSubmittedStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchApprovedReviews() {
      setLoading(true);
      setError(null);
      try {
        const reviewsCollection = collection(db, "reviews");
        // Only pull approved reviews for the public gallery guestbook
        const qr = query(
          reviewsCollection,
          where("approved", "==", true),
          orderBy("createdAt", "desc")
        );
        const snapshot = await getDocs(qr);
        const list: Review[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as any as Review);
        });
        setReviews(list);
      } catch (err) {
        console.error("Error fetching guestbook reviews:", err);
        // Recover or check permissions
        setError("Please check back soon. Guest reviews are launching shortly.");
      } finally {
        setLoading(false);
      }
    }

    fetchApprovedReviews();
  }, [submittedStatus]);

  async function handleSubmitReview(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmittedStatus(null);

    if (!comment.trim()) {
      setError("Please add details or comments about your treats review.");
      return;
    }

    if (!reviewerName.trim()) {
      setError("Please input your name.");
      return;
    }

    setSubmitting(true);
    const reviewId = `review-${Date.now()}`;

    // Structure our payload precisely matching our strict schema in firebase-blueprint.json
    const reviewPayload = {
      id: reviewId,
      userId: userId || "anonymous",
      userName: reviewerName,
      rating: rating,
      comment: comment,
      approved: false, // Enforce unapproved by default to allow review monitoring
      createdAt: serverTimestamp(),
    };

    const targetCollection = "reviews";
    try {
      await addDoc(collection(db, targetCollection), reviewPayload);
      setComment("");
      setSubmittedStatus("✅ Your lovely review was successfully submitted! Our team will verify and approve it shortly.");
      setTimeout(() => setSubmittedStatus(null), 5000);
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, `${targetCollection}/${reviewId}`);
      setError("Failed to register your review. Verify your login credentials.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="reviews-list-root" className="mx-auto max-w-5xl px-4 py-8">
      {/* Banner */}
      <div id="reviews-banner-head" className="text-center mb-8">
        <span className="inline-flex items-center space-x-1 rounded-full bg-pink-100 px-3 py-1 text-xs font-bold text-pink-700 uppercase tracking-widest">
          <Heart className="h-3 w-3 fill-current" />
          <span>Customer Feedback</span>
        </span>
        <h2 className="font-sans text-3xl font-extrabold tracking-tight text-amber-955 mt-2">
          Rakis Confectionery Guestbook
        </h2>
        <p className="mt-2 text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
          Read lovely testimonials wrote by some of our custom celebrants in Nigeria, or pen down your sweet experience with our daily recipes here!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Review Submittal Form */}
        <div id="review-submission-portal" className="md:col-span-1 rounded-2xl border border-orange-50 bg-white p-5 shadow-md shadow-amber-50">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-950 flex items-center space-x-1.5 mb-4 border-b border-gray-50 pb-2">
            <MessageSquarePlus className="h-4 w-4 text-amber-600 animate-pulse" />
            <span>Leave a Review</span>
          </h3>

          {userId ? (
            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* reviewer display name */}
              <div>
                <label htmlFor="rev-author-name" className="block text-[10px] font-bold text-gray-400 uppercase">
                  Your Full Name
                </label>
                <input
                  id="rev-author-name"
                  type="text"
                  className="w-full mt-1 rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-amber-950 font-bold focus:border-amber-500 focus:outline-none"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  required
                />
              </div>

              {/* rating selector star buttons */}
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Taste & Decor Rating
                </label>
                <div id="rev-rating-stars" className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      id={`star-${s}`}
                      onClick={() => setRating(s)}
                      className="text-2xl hover:scale-105 transition-all text-amber-500 cursor-pointer"
                    >
                      {rating >= s ? "★" : "☆"}
                    </button>
                  ))}
                  <span className="font-mono text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-bold ml-2">
                    {rating}/5
                  </span>
                </div>
              </div>

              {/* comment details field */}
              <div>
                <label htmlFor="rev-comment-text" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">
                  Comment
                </label>
                <textarea
                  id="rev-comment-text"
                  rows={4}
                  placeholder="I loved the red velvet buttercream frosting, the 3D piping details were breathtaking!"
                  className="w-full rounded-xl border border-gray-200 px-3 py-1.5 text-xs text-amber-950 focus:border-amber-500 focus:outline-none"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  required
                ></textarea>
              </div>

              {submittedStatus && (
                <div id="rev-success-box" className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-150 text-[11px] font-bold rounded-xl animate-fade-in-down">
                  {submittedStatus}
                </div>
              )}

              {error && (
                <p id="rev-error-text" className="text-xs text-red-500 font-bold">
                  ⚠️ {error}
                </p>
              )}

              <button
                id="rev-submit-btn"
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center space-x-1 bg-amber-950 text-white rounded-xl py-2.5 text-xs font-bold uppercase tracking-wider transition-all hover:bg-black active:scale-95 disabled:opacity-75"
              >
                <span>{submitting ? "Submitting..." : "Publish Testimony"}</span>
              </button>
            </form>
          ) : (
            <div id="rev-prompt-signin" className="text-center py-6">
              <p className="text-xs text-gray-500 leading-snug mb-4">
                Thank you for selecting Rakis Confectionery! Please register or log in with your Google Account to write a review.
              </p>
              <button
                id="rev-action-signin-btn"
                onClick={onSignIn}
                className="rounded-full bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 text-xs font-bold uppercase tracking-wider transition-all shadow active:scale-95 flex items-center space-x-1 mx-auto"
              >
                <span>Google Login</span>
              </button>
            </div>
          )}
        </div>

        {/* Existing approved reviews listing */}
        <div id="reviews-list-container" className="md:col-span-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-950 flex items-center space-x-2 mb-4 border-b border-gray-50 pb-2">
            <MessageSquare className="h-4 w-4 text-amber-600 animate-pulse" />
            <span>Approved testimonials ({reviews.length})</span>
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="h-6 w-6 border-2 border-amber-600 border-t-transparent animate-spin rounded-full mx-auto mb-2"></div>
              <p className="text-xs text-gray-400">Pulling customer reviews...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-2xl py-12 text-center text-gray-400">
              <p className="text-sm font-semibold">No public reviews are posted yet.</p>
              <p className="text-xs text-gray-400 mt-1">Be the first to submit feedback!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  id={`review-item-${rev.id}`}
                  className="rounded-xl border border-orange-50 bg-amber-50/5 p-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-bold text-amber-955 text-sm">{rev.userName}</span>
                      <span className="flex items-center space-x-0.5 text-[10px] text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span key={i} className="leading-none">★</span>
                        ))}
                      </span>
                    </div>
                    <p className="text-xs text-gray-650 mt-2 font-sans italic leading-relaxed">
                      "{rev.comment}"
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-amber-100/30 flex justify-between items-center text-[9px] text-gray-400 font-mono">
                    <span className="flex items-center space-x-0.5 text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded uppercase font-bold text-[8px]">
                      <ShieldCheck className="h-3 w-3 inline shrink-0" />
                      <span>Verified Client</span>
                    </span>
                    <span>
                      {rev.createdAt?.seconds ? new Date(rev.createdAt.seconds * 1000).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
