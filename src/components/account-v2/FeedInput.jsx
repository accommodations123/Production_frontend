import React from 'react';
import { Camera, Video } from 'lucide-react';

export const FeedInput = () => {
    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex gap-4 mb-4">
                <div className="flex-1">
                    <textarea
                        className="w-full border-none resize-none focus:ring-0 text-sm text-gray-900 placeholder-gray-400 min-h-[80px]"
                        placeholder="And here he starts writing text..."
                    ></textarea>
                </div>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <div className="flex gap-2">
                    <button className="text-gray-400 hover:text-gray-600 p-2">
                        <Camera className="w-5 h-5" />
                    </button>
                    <button className="text-gray-400 hover:text-gray-600 p-2">
                        <Video className="w-5 h-5" />
                    </button>
                </div>
                <button className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1.5 px-4 rounded text-sm transition-colors">
                    Send
                </button>
            </div>
        </div>
    );
};
