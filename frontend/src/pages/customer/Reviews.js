// src/pages/customer/Reviews.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "../../styles/customer/Reviews.css";

function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [newReview, setNewReview] = useState({ salon_id: "", rating: "", review_text: "" });
  const [editFormData, setEditFormData] = useState({ rating: "", review_text: "" });
  const [salons, setSalons] = useState([]);

  const token = localStorage.getItem("token");

  // ✅ Correct API endpoints
  const API_REVIEWS = "http://localhost:5000/api/review";
  const API_MY_REVIEWS = `${API_REVIEWS}/my`;
  const API_SALONS = "http://localhost:5000/api/customer/salons";

  // -------------------------
  // Fetch logged-in user's reviews
  // -------------------------
  useEffect(() => {
    const fetchReviews = async () => {
      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await axios.get(API_MY_REVIEWS, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReviews(res.data.data || []);
      } catch (err) {
        console.error("Fetch reviews error:", err);
        setError(err.response?.data?.message || "Failed to fetch reviews.");
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [token]);

  // -------------------------
  // Fetch all salons for dropdown
  // -------------------------
  useEffect(() => {
    const fetchSalons = async () => {
      try {
        const res = await axios.get(API_SALONS);
        setSalons(res.data.salons || []);
      } catch (err) {
        console.error("Fetch salons error:", err);
      }
    };
    fetchSalons();
  }, []);

  // -------------------------
  // Add a new review
  // -------------------------
  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!newReview.salon_id || !newReview.rating || !newReview.review_text.trim()) {
      alert("Please select a salon, rating and write a review.");
      return;
    }
    try {
      const res = await axios.post(
        API_REVIEWS,
        {
          salon_id: newReview.salon_id,
          rating: newReview.rating,
          review_text: newReview.review_text,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Append new review locally
      setReviews([
        {
          ...res.data.data,
          salon_name: salons.find((s) => s.salon_id == newReview.salon_id)?.salon_name,
        },
        ...reviews,
      ]);
      setNewReview({ salon_id: "", rating: "", review_text: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add review.");
      console.error("Add review error:", err);
    }
  };

  // -------------------------
  // Edit a review
  // -------------------------
  const handleEditClick = (review) => {
    setEditingReviewId(review.review_id);
    setEditFormData({ rating: review.rating, review_text: review.review_text });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editFormData.rating || !editFormData.review_text.trim()) {
      alert("Please provide rating and review text.");
      return;
    }
    try {
      await axios.put(`${API_REVIEWS}/${editingReviewId}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(
        reviews.map((r) =>
          r.review_id === editingReviewId
            ? { ...r, rating: editFormData.rating, review_text: editFormData.review_text, is_edited: 1 }
            : r
        )
      );
      setEditingReviewId(null);
      setEditFormData({ rating: "", review_text: "" });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update review.");
      console.error("Update review error:", err);
    }
  };

  // -------------------------
  // Delete a review
  // -------------------------
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await axios.delete(`${API_REVIEWS}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReviews(reviews.filter((r) => r.review_id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review.");
      console.error("Delete review error:", err);
    }
  };

  // -------------------------
  // UI
  if (loading) return <div className="reviews-main"><p>Loading reviews...</p></div>;
  if (error) return <div className="reviews-main"><p>{error}</p></div>;

  return (
    <div className="reviews-main">
      <h1>My Reviews</h1>

      {/* Add Review Form */}
      <form onSubmit={handleAddReview} className="review-form">
        <h3>Add a Review</h3>

        <label>Salon</label>
        <select
          value={newReview.salon_id}
          onChange={(e) => setNewReview({ ...newReview, salon_id: e.target.value })}
          required
        >
          <option value="">Select Salon</option>
          {salons.map((s) => (
            <option key={s.salon_id} value={s.salon_id}>
              {s.salon_name}
            </option>
          ))}
        </select>

        <label>Rating</label>
        <select
          value={newReview.rating}
          onChange={(e) => setNewReview({ ...newReview, rating: e.target.value })}
          required
        >
          <option value="">Select rating</option>
          {[1, 2, 3, 4, 5].map((num) => (
            <option key={num} value={num}>
              {num} Star{num > 1 ? "s" : ""}
            </option>
          ))}
        </select>

        <label>Review</label>
        <textarea
          value={newReview.review_text}
          onChange={(e) => setNewReview({ ...newReview, review_text: e.target.value })}
          placeholder="Write your review..."
          required
        ></textarea>

        <button type="submit">Add Review</button>
      </form>

      {/* Reviews Grid */}
      <div className="reviews-grid">
        {reviews.length === 0 && <p>No reviews submitted yet.</p>}

        {reviews.map((review) => (
          <div key={review.review_id} className="review-card">
            {editingReviewId === review.review_id ? (
              <form onSubmit={handleUpdate} className="review-edit-form">
                <label>Rating</label>
                <select
                  value={editFormData.rating}
                  onChange={(e) => setEditFormData({ ...editFormData, rating: e.target.value })}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} Star{num > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>

                <label>Review</label>
                <textarea
                  value={editFormData.review_text}
                  onChange={(e) => setEditFormData({ ...editFormData, review_text: e.target.value })}
                ></textarea>

                <div className="review-form-buttons">
                  <button type="submit">Update</button>
                  <button type="button" className="cancel-btn" onClick={() => setEditingReviewId(null)}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <p><strong>Salon:</strong> {review.salon_name}</p>
                <p><strong>Rating:</strong> {review.rating} Star{review.rating > 1 ? "s" : ""}</p>
                <p><strong>Review:</strong> {review.review_text}</p>
                {review.is_edited && <p className="edited-label">(Edited)</p>}
                <p className="review-date">{new Date(review.created_at).toLocaleString()}</p>

                <div className="review-card-buttons">
                  <button onClick={() => handleEditClick(review)}>Edit</button>
                  <button onClick={() => handleDelete(review.review_id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reviews;
