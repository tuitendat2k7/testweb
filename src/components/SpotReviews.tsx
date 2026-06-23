import React, { useState } from 'react';
import { Star, MessageSquare, Send, User, Calendar } from 'lucide-react';
import { Review } from '../types.ts';

interface SpotReviewsProps {
  spotId: number;
  reviews?: Review[];
  currentUser: any;
  onReviewAdded: (newReview: Review) => void;
}

export const SpotReviews: React.FC<SpotReviewsProps> = ({
  spotId,
  reviews = [],
  currentUser,
  onReviewAdded,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [reviewerName, setReviewerName] = useState<string>(
    currentUser?.displayName || currentUser?.email?.split('@')[0] || ''
  );
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync reviewer name with logged in user if changed
  React.useEffect(() => {
    if (currentUser) {
      setReviewerName(currentUser.displayName || currentUser.email?.split('@')[0] || '');
    }
  }, [currentUser]);

  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const nameToSubmit = reviewerName.trim() || 'Sinh viên ẩn danh';

    if (!comment.trim()) {
      setErrorMsg('Vui lòng nhập nội dung bình luận.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/spots/${spotId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewerName: nameToSubmit,
          reviewerEmail: currentUser?.email || null,
          reviewerUid: currentUser?.uid || null,
          rating: rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gửi đánh giá thất bại');
      }

      setComment('');
      setSuccessMsg('Đã gửi bình luận & đánh giá của bạn thành công!');
      if (data.review) {
        onReviewAdded(data.review);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Không thể kết nối đến máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return 'Vừa xong';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Gần đây';
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-neutral-200/40 dark:border-white/5 font-sans" id="spot-reviews-section">
      
      {/* Header with Stats */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="text-[10px] font-black text-neutral-400 dark:text-neutral-500 uppercase tracking-widest text-[#705b4a] dark:text-neutral-400">
            Bình Luận & Đánh Giá
          </h4>
          <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
            {reviews.length > 0 ? `Cộng đồng đóng góp (${reviews.length} lượt)` : 'Chưa có lượt đánh giá nào'}
          </p>
        </div>

        {avgRating && (
          <div className="flex items-center gap-2 bg-[#f9f5e1] dark:bg-amber-500/10 border border-amber-500/20 rounded-xl py-1.5 px-3">
            <span className="font-black text-amber-600 dark:text-amber-400 text-sm">{avgRating}</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= Math.round(Number(avgRating))
                      ? 'fill-amber-500 text-amber-500'
                      : 'text-neutral-300 dark:text-neutral-600'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Write a Review Form */}
      <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-white/40 dark:bg-white/5 border border-neutral-200/50 dark:border-white/5 space-y-4">
        <h5 className="font-extrabold text-xs text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4 text-emerald-500" /> Viết Đánh Giá Của Bạn
        </h5>

        {/* Form Inputs Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Tên hiển thị</label>
            <input
              type="text"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              placeholder="Nhập tên hiển thị (ẩn danh nếu để trống)..."
              className="w-full text-xs py-2 px-3 rounded-lg border border-neutral-200 dark:border-white/10 bg-[#fafafa]/50 dark:bg-[#121212]/35 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-neutral-400 uppercase">Đánh giá sao</label>
            <div className="flex items-center gap-1.5 py-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="hover:scale-110 active:scale-95 transition"
                >
                  <Star
                    className={`w-6 h-6 transition duration-150 ${
                      star <= rating 
                        ? 'fill-amber-400 text-amber-400' 
                        : 'text-neutral-300 dark:text-neutral-700'
                    }`}
                    style={{ color: star <= rating ? '#fbbf24' : undefined }}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Comment Text Area */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-neutral-400 uppercase">Bình luận & Gợi ý món nên thử</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2.5}
            placeholder="Nước dùng có ổn không? Ăn có no cày deadline không?... Bạn khuyên nên gọi món nào?"
            className="w-full text-xs py-2 px-3 rounded-lg border border-neutral-200 dark:border-white/10 bg-[#fafafa]/50 dark:bg-[#121212]/35 focus:ring-1 focus:ring-emerald-500 focus:outline-none dark:text-white resize-none"
          />
        </div>

        {errorMsg && (
          <div className="text-[11px] font-bold text-red-500 bg-red-500/10 border border-red-500/20 py-2 px-3 rounded-xl">
            ⚠️ {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-2 px-3 rounded-xl">
            ✓ {successMsg}
          </div>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:shadow-lg transition disabled:opacity-50 duration-200 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{submitting ? 'Đóng góp...' : 'Đăng Đánh Giá'}</span>
          </button>
        </div>
      </form>

      {/* Review List items container */}
      <div className="space-y-3 pt-2">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-2xl bg-[#fafdf8] dark:bg-white/[0.02] border border-[#e8ebd3]/50 dark:border-white/5 hover:border-neutral-200 dark:hover:border-white/10 transition duration-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
                    <User className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-neutral-800 dark:text-neutral-200 text-xs">{r.reviewerName}</h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((str) => (
                          <Star
                            key={str}
                            className={`w-2.5 h-2.5 ${
                              str <= r.rating 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-neutral-200 dark:text-neutral-800'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-neutral-400 font-bold text-[9px]">•</span>
                      <span className="text-neutral-400 text-[9px] font-bold flex items-center gap-1">
                        <Calendar className="w-2.5 h-2.5" />
                        {formatDate(r.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed mt-2.5 pl-0.5">
                {r.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-6 border border-dashed border-neutral-200 dark:border-white/5 rounded-2xl">
            <span className="text-2xl">✍️</span>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 italic mt-2">
              Quán này chưa có bình luận nào. Hãy đóng góp mâm đồ đầu tiên nhé!
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
