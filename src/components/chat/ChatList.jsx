import React from 'react';
import { Search } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function ChatList({ conversations }) {
    const { id: activeId } = useParams();

    return (
        <div className="flex flex-col h-full bg-white border-r border-gray-100 w-full md:w-[380px] shrink-0">
            {/* Header */}
            <div className="p-4 md:p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-900 mb-4">My Chat</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search chats"
                        className="w-full h-10 pl-9 pr-4 bg-gray-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {conversations.map((chat) => (
                    <Link
                        key={chat.id}
                        to={`/chat/${chat.id}`}
                        className={cn(
                            "flex gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-50",
                            activeId === chat.id ? "bg-purple-50 hover:bg-purple-50" : ""
                        )}
                    >
                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <img
                                src={chat.user.avatar}
                                alt={chat.user.name}
                                className="w-12 h-12 rounded-full object-cover"
                            />
                            {chat.online && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h3 className={cn("font-bold text-sm truncate", activeId === chat.id ? "text-primary" : "text-gray-900")}>
                                    {chat.user.name}
                                </h3>
                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                                    {chat.lastMessageTime}
                                </span>
                            </div>

                            {!chat.context ? (
                                <p className="text-xs text-gray-500 truncate font-medium">
                                    {chat.lastMessage}
                                </p>
                            ) : (
                                <div className="flex gap-2 p-2 bg-gray-50 rounded-lg mt-1">
                                    <img src={chat.context.image} alt="" className="w-8 h-8 rounded-md object-cover" />
                                    <div className="overflow-hidden">
                                        <p className="text-[10px] font-bold text-gray-900 truncate">{chat.context.title}</p>
                                        <p className="text-[10px] text-gray-500 truncate">
                                            {chat.context.meta}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
