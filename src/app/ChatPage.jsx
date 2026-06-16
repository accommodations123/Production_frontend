import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { ChatList } from '@/components/chat/ChatList';
import { ChatDetail } from '@/components/chat/ChatDetail';
import { cn } from '@/lib/utils';

// Mock Data
const MOCK_CONVERSATIONS = [
    {
        id: '1',
        user: { name: 'Ethan Walker', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80', online: true },
        lastMessage: 'Ready to move?',
        lastMessageTime: '2 Day ago',
        context: {
            title: 'Apartment in Greenview Residences, Austin',
            meta: '2 BHK • $2,400/ Month • 1,250 Sqft',
            image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80'
        },
        messages: [
            { id: 'd1', text: '10 Oct 2025', isDate: true },
            { id: 'm1', text: 'Ready to move?', sender: 'me' },
            { id: 'm2', text: 'Yes', sender: 'them' },
            { id: 'm3', text: 'Price negotiable?', sender: 'me' },
            { id: 'm4', text: 'Yes, But', sender: 'them' },
            { id: 'm5', text: 'Can I visit tomorrow?', sender: 'me' },
            { id: 'm6', text: 'Yes, you come tomorrow', sender: 'them' },
            { id: 'm7', text: 'Fully furnished ?', sender: 'me' },
            { id: 'm8', text: 'Yes', sender: 'them' },
        ]
    },
    {
        id: '2',
        user: { name: 'James Parker', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80', online: false },
        lastMessage: 'Hello',
        lastMessageTime: '5 Day ago',
        context: {
            title: 'Condo in Bayfront Towers, Miami',
            meta: '2 BHK • $2,400/ Month • 1,250 Sqft',
            image: 'https://images.unsplash.com/photo-1512918760383-eda2723ad6e1?auto=format&fit=crop&q=80'
        },
        messages: [
            { id: 'm1', text: 'Hello', sender: 'them' }
        ]
    },
    {
        id: '3',
        user: { name: 'Daniel Brooks', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80', online: true },
        lastMessage: 'Are you still interested?',
        lastMessageTime: '3 Month ago',
        context: null,
        messages: []
    }
];

export default function ChatPage() {
    const { id } = useParams();
    const location = useLocation();

    // Find active chat
    const activeChat = MOCK_CONVERSATIONS.find(c => c.id === id);

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            {/* Navbar - Hidden on specific mobile chat view if desired, but keeping generally for context */}
            <div className="hidden lg:block">
                <Navbar />
            </div>

            {/* Mobile Header Spacer (if needed) */}

            <div className="flex-1 flex overflow-hidden container mx-auto lg:py-6 lg:px-4 max-w-6xl">
                {/* Desktop Layout: Sidebar + Main */}
                <div className="hidden lg:flex bg-white rounded-3xl shadow-xl overflow-hidden w-full h-[calc(100vh-120px)] border border-gray-100">
                    <ChatList conversations={MOCK_CONVERSATIONS} />
                    <div className="flex-1 bg-gray-50 relative">
                        {activeChat ? (
                            <ChatDetail chat={activeChat} />
                        ) : (
                            <div className="h-full flex items-center justify-center flex-col text-gray-400">
                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-2xl">💬</span>
                                </div>
                                <p>Select a conversation to start chatting</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Layout: Stacked Pages */}
                <div className="lg:hidden w-full h-screen bg-white flex flex-col">
                    {!id ? (
                        <ChatList conversations={MOCK_CONVERSATIONS} />
                    ) : (
                        <ChatDetail chat={activeChat} />
                    )}
                </div>
            </div>

            {/* Simple Bottom Nav Placeholder for Mobile if not on chat detail */}
            {/* Using existing Mobile Layout logic in `page.jsx` or similar, usually Main Layout wrap handles this */}
        </div>
    );
}
