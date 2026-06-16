"use client";

import React, { useState } from 'react';
import { X, Send, Paperclip } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

export function ChatPopup({ isOpen, onClose, product, sellerName = "Seller" }) {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        { id: 1, text: "Hi, is this still available?", sender: "me", time: "10:00 AM" },
        { id: 2, text: "Yes, it is! When would you like to pick it up?", sender: "them", time: "10:02 AM" }
    ]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!message.trim()) return;
        setMessages([...messages, { id: Date.now(), text: message, sender: "me", time: "Now" }]);
        setMessage("");
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.95 }}
                    className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="bg-primary p-3 sm:p-4 flex items-center justify-between text-white shadow-sm">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
                                {sellerName.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm leading-tight">{sellerName}</h4>
                                <p className="text-[10px] opacity-80 truncate w-32 sm:w-40">{product?.title || "Item Inquiry"}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="text-white/70 hover:text-white">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 h-48 sm:h-64 bg-gray-50 p-3 overflow-y-auto space-y-3">
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-lg p-2 text-xs ${msg.sender === 'me'
                                    ? 'bg-primary text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                                    }`}>
                                    <p>{msg.text}</p>
                                    <span className={`text-[9px] block mt-1 text-right ${msg.sender === 'me' ? 'text-white/70' : 'text-gray-400'}`}>
                                        {msg.time}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex gap-2">
                            <Button type="button" size="icon" variant="ghost" className="h-8 sm:h-10 w-8 sm:w-10 text-gray-400 hover:text-gray-600">
                                <Paperclip className="h-4 w-4 sm:h-5 sm:w-5" />
                            </Button>
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="h-8 sm:h-10 text-sm bg-white border border-gray-300 text-gray-900 focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary placeholder:text-gray-400 rounded-full px-4"
                            />
                            <Button type="submit" size="icon" className="h-8 sm:h-10 w-8 sm:w-10 bg-accent hover:bg-accent/90 text-white rounded-full shadow-sm">
                                <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                        </form>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}