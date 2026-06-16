import React from 'react';
import { Star } from 'lucide-react';

export function ReviewsSection({ rating = 4.5, totalReviews = 135 }) {
    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-gray-900">Locality Reviews</h3>
                <button className="text-[#7B2CBF] text-xs font-bold">View All &gt;</button>
            </div>

            <div className="flex gap-8 items-center mb-8">
                <div>
                    <div className="flex items-end gap-1 mb-1">
                        <span className="text-4xl font-bold text-gray-900">{rating}</span>
                        <span className="text-sm text-gray-400 mb-1">/5</span>
                    </div>
                    <div className="flex gap-0.5 mb-1">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${s <= Math.round(rating) ? "fill-green-500 text-green-500" : "fill-gray-200 text-gray-200"}`} />
                        ))}
                    </div>
                    <p className="text-[10px] text-gray-400">Average Rating</p>
                    <p className="text-[10px] text-gray-400">({totalReviews} Total Review)</p>
                </div>

                <div className="flex-1 space-y-2">
                    {[5, 4, 3, 2, 1].map((r, i) => (
                        <div key={r} className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#7B2CBF]" style={{ width: `${Math.max(10, 100 - (i * 20))}%` }} />
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium w-3">{r}</span>
                            <span className="h-2 w-2">
                                <Star className="w-2 h-2 text-gray-300 fill-gray-300" />
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <p className="text-xs font-bold text-gray-700 mb-3">What are the positives</p>
                    <div className="flex flex-wrap gap-2">
                        {["Good Public Transport", "Markets at a Walkable Distance", "Good Schools are Nearby", "Safe at Night", "Good Hospitals are Nearby"].map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-semibold text-gray-600">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold text-gray-700 mb-3">What are the negatives</p>
                    <div className="flex flex-wrap gap-2">
                        {["No Metro Connectivity", "Frequent Water Shortage"].map(tag => (
                            <span key={tag} className="px-3 py-1.5 bg-gray-100 rounded-lg text-[10px] font-semibold text-gray-600">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
