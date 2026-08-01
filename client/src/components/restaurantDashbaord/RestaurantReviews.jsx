import React, { useEffect, useMemo, useState } from "react";
import api from "../../config/ApiConfig";

const RestaurantReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get("/menu/get-items").then((response) => {
      const items = response.data?.data?.items || [];
      setReviews(items.flatMap((item) => (item.ratings || []).map((rating) => ({ ...rating, itemName: item.itemName }))));
    }).finally(() => setLoading(false));
  }, []);
  const average = useMemo(() => reviews.length ? (reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length).toFixed(1) : "0.0", [reviews]);
  if (loading) return <div className="grid min-h-80 place-items-center rounded-3xl bg-white text-slate-500">Loading reviews...</div>;
  return <div className="space-y-5"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-600">Customer feedback</p><h1 className="mt-2 text-3xl font-black text-slate-900">Reviews for your dishes</h1></div><div className="rounded-2xl bg-orange-50 px-5 py-3 text-orange-700"><span className="text-2xl font-black">{average}</span><span className="ml-2 text-sm font-bold">/ 5 · {reviews.length} reviews</span></div></div>{reviews.length ? <div className="grid gap-4 md:grid-cols-2">{reviews.map((review, index) => <div key={`${review.customerId?._id || "review"}-${index}`} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="font-black text-slate-900">{review.customerId?.fullName || "Customer"}</p><span className="rounded-full bg-yellow-50 px-3 py-1 text-sm font-black text-yellow-700">★ {review.rating}/5</span></div><p className="mt-2 text-xs font-bold uppercase tracking-wider text-orange-600">{review.itemName}</p><p className="mt-4 text-sm leading-6 text-slate-600">{review.review || "No written comment."}</p></div>)}</div> : <div className="rounded-3xl bg-white p-10 text-center text-slate-500 shadow-sm">Reviews will appear here after customers rate your dishes.</div>}</div>;
};

export default RestaurantReviews;
