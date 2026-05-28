import React, { memo } from "react"
import { Facebook, Linkedin, Copy, Check } from "lucide-react"

const XIcon = ({ size = 16 }) => (
    <svg 
        viewBox="0 0 24 24" 
        width={size} 
        height={size} 
        fill="currentColor"
    >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
);

export const ShareMenu = memo(({ open, copied, onCopy }) =>
    !open ? null : (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl z-30 border border-gray-100">
            <div className="p-2">
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-accent/10 transition-colors rounded-xl mx-2">
                    <Facebook className="h-4 w-4 text-blue-600" /> Facebook
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-accent/10 transition-colors rounded-xl mx-2">
                    <XIcon size={16} /> X (Twitter)
                </a>
                <a href="#" className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-accent/10 transition-colors rounded-xl mx-2">
                    <Linkedin className="h-4 w-4 text-blue-700" /> LinkedIn
                </a>
                <button
                    onClick={onCopy}
                    className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-accent/10 transition-colors w-full text-left rounded-xl mx-2"
                >
                    {copied ? (
                        <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-green-600">Copied!</span>
                        </>
                    ) : (
                        <>
                            <Copy className="h-4 w-4" /> Copy Link
                        </>
                    )}
                </button>
            </div>
        </div>
    )
)
