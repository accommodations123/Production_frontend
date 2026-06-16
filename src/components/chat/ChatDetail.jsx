import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, MoreVertical, Phone, Video } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function ChatDetail({ chat }) {
    const navigate = useNavigate();
    const [newMessage, setNewMessage] = useState("");
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chat?.messages]);

    if (!chat) return null;

    const quickReplies = [
        "Fully furnished ?", "Ready to move?", "Floor no.", "Still on sale?",
        "Hello", "Rent monthly", "Price negotiable?", "Can I visit tomorrow?"
    ];

    return (
        <div className="flex flex-col h-full bg-white relative">
            {/* Header */}
            <div className="h-16 px-4 md:px-6 flex items-center justify-between border-b border-gray-100 bg-white z-20 shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/chat')} className="md:hidden p-2 -ml-2 hover:bg-gray-50 rounded-full">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </button>
                    <div className="relative">
                        <img
                            src={chat.user.avatar}
                            alt={chat.user.name}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        {chat.user.online && (
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-sm">{chat.user.name}</h2>
                        <p className="text-xs text-gray-500">Share more images</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-primary">
                        <Phone className="w-5 h-5" />
                    </button>
                    <button className="p-2 hover:bg-gray-50 rounded-full text-gray-400 hover:text-primary">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto bg-gray-50 relative flex flex-col">

                {/* Sticky Context Card */}
                {chat.context && (
                    <div className="sticky top-4 mx-4 mb-4 z-10 animate-in slide-in-from-top-4 duration-500">
                        <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                            <img
                                src={chat.context.image}
                                alt="Property"
                                className="w-16 h-16 rounded-xl object-cover shrink-0"
                            />
                            <div>
                                <h3 className="font-bold text-gray-900 text-sm leading-tight mb-1">
                                    {chat.context.title}
                                </h3>
                                <p className="text-xs text-gray-500 font-medium">
                                    {chat.context.meta}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Messages */}
                <div className="px-4 pb-4 flex-1 flex flex-col gap-4 mt-2">
                    {chat.messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex flex-col max-w-[80%] ${msg.sender === 'me' ? 'self-end items-end' : 'self-start items-start'}`}
                        >
                            {/* Date Separator Logic (Simplified) */}
                            {msg.isDate && (
                                <div className="self-center my-4 bg-gray-200 text-gray-600 text-[10px] font-bold px-3 py-1 rounded-full">
                                    {msg.text}
                                </div>
                            )}

                            {!msg.isDate && (
                                <div
                                    className={`px-4 py-3 rounded-2xl text-sm font-medium shadow-sm 
                                        ${msg.sender === 'me'
                                            ? 'bg-[#7C3AED] text-white rounded-br-none'
                                            : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Footer: Quick Replies + Input */}
            <div className="bg-white border-t border-gray-100 p-4 shrink-0 z-20">
                {/* Quick Replies */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mask-gradient-right mb-3 pb-1">
                    {quickReplies.map((reply, i) => (
                        <button
                            key={i}
                            onClick={() => setNewMessage(reply)}
                            className="whitespace-nowrap px-4 py-2 bg-gray-50 border border-gray-100 hover:border-primary/30 hover:bg-purple-50 hover:text-primary rounded-full text-xs font-semibold text-gray-600 transition-colors"
                        >
                            {reply}
                        </button>
                    ))}
                </div>

                {/* Input Area */}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Write Message"
                        className="flex-1 h-12 bg-gray-50 rounded-full px-6 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                    />
                    <button className="w-12 h-12 rounded-full bg-white hover:bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary transition-colors shadow-sm">
                        <Send className="w-5 h-5 ml-0.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
