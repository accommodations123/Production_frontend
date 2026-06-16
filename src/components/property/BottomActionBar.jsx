import React from 'react';
import { Phone, MessageSquare, PhoneCall } from 'lucide-react';
import { Button } from "@/components/ui/button";

export function BottomActionBar({ onContact }) {
    return (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex items-center gap-3 z-50 md:hidden pb-safe">
            <Button
                variant="outline"
                onClick={() => onContact('view-number')}
                className="flex-1 h-12 rounded-xl border-gray-200 text-gray-700 font-bold"
            >
                View Number
            </Button>
            <Button
                onClick={() => onContact('message')}
                className="flex-1 h-12 rounded-xl bg-gray-100 text-gray-800 hover:bg-gray-200 font-bold gap-2"
            >
                <MessageSquare className="w-4 h-4 fill-current" />
                Message
            </Button>
            <Button
                size="icon"
                onClick={() => onContact('call')}
                className="h-12 w-12 rounded-xl bg-[#7B2CBF] text-white hover:bg-[#6a25a6] shadow-lg shadow-purple-200"
            >
                <PhoneCall className="w-5 h-5" />
            </Button>
        </div>
    );
}
