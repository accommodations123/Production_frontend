"use client"

import * as React from "react"
import { Heart, MessageCircle, Share2, X, Users, Star, Zap, Bell, Search, Filter, Home, UserCheck, CalendarDays, Image, FileText, Hash, MessageSquare, Clock, MapPin, Calendar, Camera, FolderOpen, Download, Play, Eye, Briefcase, BookOpen, Database, HelpCircle, UserPlus, UserMinus, Settings, ChevronRight, ArrowLeft, ThumbsUp, Bookmark, TrendingUp, Award, BarChart3, Target, Trophy, Gift, Sparkles, Info, Code, Globe, Link2, Mail, Phone, Shield, Pin, Upload, MoreVertical, Layers, Palette, Loader2 } from "lucide-react"
import {
    useJoinCommunityMutation,
    useLeaveCommunityMutation,
    useDeleteCommunityPostMutation,
    useGetCommunityFeedQuery
} from "@/store/api/hostApi"
import { toast } from "sonner"

// Simple Button Component
const Button = React.forwardRef(({ className, variant = "default", size = "default", children, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"

    const variants = {
        default: "bg-blue-600 text-white hover:bg-blue-700",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 bg-white hover:bg-gray-50",
        secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100",
        link: "text-blue-600 underline-offset-4 hover:underline",
    }

    const sizes = {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
    }

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className || ""}`}
            ref={ref}
            {...props}
        >
            {children}
        </button>
    )
})

Button.displayName = "Button"

// Improved Error Boundary Component
function ErrorBoundary({ children }) {
    const [hasError, setHasError] = React.useState(false)
    const [error, setError] = React.useState(null)

    React.useEffect(() => {
        const handleError = (event) => {
            console.error("Caught by Error Boundary:", event.error);
            setError(event.error);
            setHasError(true);
        };

        window.addEventListener('error', handleError);
        return () => window.removeEventListener('error', handleError);
    }, []);

    const handleRetry = () => {
        setHasError(false)
        setError(null)
    }

    if (hasError) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                    <p className="text-gray-600 mb-2 text-sm">An error occurred while loading the community.</p>
                    {process.env.NODE_ENV === 'development' && error && (
                        <details className="mb-4">
                            <summary className="cursor-pointer text-xs font-mono bg-gray-100 p-2 rounded">Error Details</summary>
                            <pre className="text-xs bg-red-50 p-2 rounded mt-2 overflow-auto max-h-40">
                                {error.toString()}
                            </pre>
                        </details>
                    )}
                    <Button onClick={handleRetry}>
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

export function GroupModal({ isOpen, onClose, community, isLoading, error }) {
    const [activeTab, setActiveTab] = React.useState("feed")
    const [selectedMember, setSelectedMember] = React.useState(null)
    const [isMounted, setIsMounted] = React.useState(false)
    const [isJoining, setIsJoining] = React.useState(false)

    // API hooks for join/leave functionality
    const [joinCommunity] = useJoinCommunityMutation();
    const [leaveCommunity] = useLeaveCommunityMutation();
    const user = React.useMemo(() => {
        try {
            return JSON.parse(
                localStorage.getItem("user")
            );
        } catch {
            return null;
        }
    }, []);

    // Get the current user's ID, checking both id and _id fields
    const currentUserId = user?.id || user?._id;

    const {
        data: feedData,
        isLoading: postsLoading,
    } = useGetCommunityFeedQuery(
        { id: community?.id, page: 1 },
        {
            skip: !community?.id,
        }
    );

    // Extract the posts array from the paginated response
    const posts = feedData?.posts || [];

    const [deletePost] =
        useDeleteCommunityPostMutation();

    const handleDeletePost = async (id) => {
        try {
            await deletePost(id).unwrap();

            toast.success(
                "Post deleted successfully"
            );
        } catch (err) {
            console.error(err);

            toast.error(
                "Failed to delete post"
            );
        }
    };

    const fileInputRef = React.useRef(null)

    // Handle close with event stop propagation
    const handleClose = React.useCallback((e) => {
        e?.stopPropagation()
        onClose?.()
    }, [onClose])

    // Handle backdrop click
    const handleBackdropClick = React.useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose?.()
        }
    }, [onClose])

    // Handle join/leave community
    const handleJoinLeave = async () => {
        if (!community) return;
        setIsJoining(true);
        try {
            if (community.isJoined) {
                await leaveCommunity(community.id).unwrap();
                toast.success("Successfully left the community!");
            } else {
                await joinCommunity(community.id).unwrap();
                toast.success("Successfully joined the community!");
            }
            // You might want to refetch the community details here
            // For simplicity, we'll just update the local state
            community.isJoined = !community.isJoined;
            community.members_count = community.isJoined
                ? community.members_count + 1
                : community.members_count - 1;
        } catch (err) {
            toast.error(err.data?.message || "An error occurred");
        } finally {
            setIsJoining(false);
        }
    };

    // Close on Escape key
    React.useEffect(() => {
        setIsMounted(true)

        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setSelectedMember(null)
                onClose?.()
            }
        }

        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [isOpen, onClose])

    // Channels data matching the screenshot
    const channels = [
        { id: "general", name: "General", icon: Hash, count: 245 },
        { id: "random", name: "Random", icon: Hash, count: 89 },
        { id: "resources", name: "Resources", icon: FileText, count: 134 },
    ]
    const renderTabContent = () => {
        switch (activeTab) {
            case "feed":
                return (
                    <div className="flex h-full bg-gray-50">
                        {/* Left Sidebar - Channels */}
                        <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
                            <div className="p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 mb-2">Channels</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {channels.map((channel) => (
                                    <button
                                        key={channel.id}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
                                    >
                                        <channel.icon className="h-5 w-5 text-gray-500" />
                                        <div className="flex-1 text-left">
                                            <p className="font-medium text-gray-900 text-sm">{channel.name}</p>
                                            <p className="text-xs text-gray-500">{channel.count} posts</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 flex flex-col h-full">
                            {/* Create Post */}
                            <div className="p-4 bg-white border-b border-gray-200">
                                <div className="bg-gray-50 rounded-lg p-3">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            ME
                                        </div>
                                        <div className="flex-1">
                                            <textarea
                                                placeholder="Share your thoughts with the community..."
                                                className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 resize-none"
                                                rows={2}
                                            />
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="ghost" className="text-gray-600 h-8 px-3">
                                                        <Image className="h-4 w-4 mr-1" />
                                                        Photo
                                                    </Button>
                                                    <Button size="sm" variant="ghost" className="text-gray-600 h-8 px-3">
                                                        <FileText className="h-4 w-4 mr-1" />
                                                        File
                                                    </Button>
                                                </div>
                                                <Button className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-sm">
                                                    Post
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Posts */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-4">
                                    {posts?.map((post) => {
                                        // Support both post.author and post.user from different API shapes
                                        const author = post.author || post.user || {};
                                        const authorName =
                                            author.Host?.full_name ||
                                            post.author_name ||
                                            author.host_name ||
                                            author.name ||
                                            author.full_name ||
                                            author.fullName ||
                                            author.username ||
                                            "Unknown User";
                                        const authorPhoto =
                                            author.profile_image ||
                                            author.profilePhoto ||
                                            author.avatar ||
                                            null;
                                        const authorId = String(author.id || author._id || "");
                                        const postId = post.id || post._id;

                                        return (
                                        <div
                                            key={postId}
                                            className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                                        >
                                            <div className="flex items-start gap-3 mb-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                    {authorPhoto ? (
                                                        <img
                                                            src={authorPhoto}
                                                            alt={authorName}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center bg-blue-500 text-white font-bold text-sm">
                                                            {authorName
                                                                ?.charAt(0)
                                                                ?.toUpperCase() || "U"}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">
                                                                {authorName}
                                                            </h4>

                                                            <span className="text-xs text-gray-500">
                                                                {(post.createdAt || post.created_at)
                                                                    ? new Date(
                                                                        post.createdAt || post.created_at
                                                                    ).toLocaleString()
                                                                    : "Just now"}
                                                            </span>
                                                        </div>

                                                        {currentUserId && authorId && String(currentUserId) === authorId && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeletePost(
                                                                        postId
                                                                    )
                                                                }
                                                                className="text-red-500 hover:text-red-700 text-sm font-medium"
                                                            >
                                                                Delete
                                                            </button>
                                                        )}
                                                    </div>

                                                    <p className="text-gray-700 text-sm">
                                                        {post.content}
                                                    </p>

                                                    {/* Media Display */}
                                                    {post.media_urls && post.media_urls.length > 0 && (
                                                        <div className={`mt-3 grid gap-2 ${post.media_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                            {post.media_urls.map((url, idx) => (
                                                                <div key={idx} className="rounded-lg overflow-hidden border bg-gray-50">
                                                                    <img src={url} alt="post media" className="w-full h-48 object-cover" />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
                                                <button className="flex items-center gap-1 text-gray-600 hover:text-red-500 text-sm">
                                                    <Heart className="h-4 w-4" />
                                                    <span>{post.likes || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-1 text-gray-600 hover:text-blue-500 text-sm">
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span>{post.comments || 0}</span>
                                                </button>
                                                <button className="flex items-center gap-1 text-gray-600 hover:text-green-500 text-sm">
                                                    <Share2 className="h-4 w-4" />
                                                    <span>{post.shares || 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Members */}
                        <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
                            <div className="p-4 border-b border-gray-200 bg-red-50">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-red-600" />
                                        Members
                                    </h3>
                                    <span className="text-sm font-medium text-red-600 bg-red-100 px-2 py-1 rounded">
                                        {community?.members_count || members.length}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Members ({community?.members_count || members.length})</p>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                {members.map((member) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                                        onClick={() => setSelectedMember(member)}
                                    >
                                        <div className="relative">
                                            <img
                                                src={member.profilePic}
                                                alt={member.name}
                                                className="w-10 h-10 rounded-full object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=4F46E5&color=fff`
                                                }}
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                                } rounded-full border-2 border-white`}></div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 text-sm">{member.name}</h4>
                                            <p className="text-xs text-gray-500">{member.posts} posts</p>
                                        </div>
                                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-600 h-8 w-8 p-0">
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )

            case "members":
                return (
                    <div className="flex flex-col h-full bg-gray-50 p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Community Members</h2>
                            <p className="text-gray-600">Connect with {community?.members_count || members.length} members</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => setSelectedMember(member)}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="relative">
                                            <img
                                                src={member.profilePic}
                                                alt={member.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&background=4F46E5&color=fff&size=100`
                                                }}
                                            />
                                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                                                } rounded-full border-2 border-white`}></div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm">{member.name}</h3>
                                            <p className="text-xs text-gray-500">{member.posts} posts</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-8 text-xs">
                                            Follow
                                        </Button>
                                        <Button size="sm" variant="outline" className="flex-1 h-8 text-xs">
                                            Message
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )

            default:
                return (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Coming soon...</p>
                    </div>
                )
        }
    }

    // Render member profile modal
    const renderMemberProfile = () => {
        if (!selectedMember) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setSelectedMember(null)}
                />
                <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden max-w-2xl w-full max-h-[90vh] flex flex-col">
                    <div className="relative h-32 bg-gradient-to-br from-blue-600 to-indigo-600">
                        <button
                            onClick={() => setSelectedMember(null)}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-end gap-4">
                                <img
                                    src={selectedMember.profilePic}
                                    alt={selectedMember.name}
                                    className="w-16 h-16 rounded-lg object-cover border-3 border-white shadow-lg"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedMember.name)}&background=4F46E5&color=fff&size=100`
                                    }}
                                />
                                <div className="flex-1 pb-1">
                                    <h2 className="text-xl font-bold text-white">{selectedMember.name}</h2>
                                    <p className="text-white/90 text-sm">{selectedMember.posts} posts</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex gap-3">
                            <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Follow
                            </Button>
                            <Button variant="outline" className="flex-1">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Message
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Don't render anything if not open or not mounted
    if (!isMounted || !isOpen) {
        return null
    }

    // Show loading state
    if (isLoading) {
        return (
            <ErrorBoundary>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleBackdropClick}
                    />
                    <div className="relative w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col items-center justify-center" style={{ height: '90vh' }}>
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600">Loading community details...</p>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }

    // Show error state
    if (error || !community) {
        return (
            <ErrorBoundary>
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleBackdropClick}
                    />
                    <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden max-w-md w-full p-6">
                        <div className="text-center">
                            <p className="text-red-500 mb-4">Error loading community details.</p>
                            <Button onClick={handleClose}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            </ErrorBoundary>
        )
    }

    return (
        <ErrorBoundary>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={handleBackdropClick}
                />

                <div className="relative w-full max-w-7xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ height: '90vh' }}>
                    {/* Header with Background Image */}
                    <div className="relative h-48 flex-shrink-0">
                        {community?.cover_image ? (
                            <img
                                src={community.cover_image}
                                alt="Community Background"
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600"></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent"></div>

                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <div className="flex items-center gap-6">
                                {community?.avatar_image ? (
                                    <img
                                        src={community.avatar_image}
                                        alt={community?.name || 'Community'}
                                        className="w-16 h-16 rounded-xl object-cover border-3 border-white shadow-lg"
                                    />
                                ) : (
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border-3 border-white">
                                        <span className="text-white text-xl font-bold">
                                            {community?.name ? community.name.substring(0, 2).toUpperCase() : 'CO'}
                                        </span>
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h1 className="text-3xl font-bold text-white">{community?.name || 'Community Name'}</h1>
                                    <p className="text-white/90">{community?.description || 'Community description'}</p>
                                </div>
                                <Button
                                    onClick={handleJoinLeave}
                                    disabled={isJoining}
                                    className={`font-semibold ${community?.isJoined ? 'bg-white text-blue-600 hover:bg-gray-100' : 'bg-white text-blue-600 hover:bg-gray-100'}`}
                                >
                                    {isJoining ? (
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    ) : community?.isJoined ? (
                                        'Leave Group'
                                    ) : (
                                        'Join Group'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="bg-white border-b border-gray-200 flex-shrink-0">
                        <div className="flex items-center px-6">
                            {[
                                { id: "feed", label: "Feed", icon: Home },
                                { id: "myfeed", label: "My Feed", icon: UserCheck },
                                { id: "members", label: "Members", icon: Users },
                                { id: "events", label: "Events", icon: CalendarDays },
                                { id: "media", label: "Media", icon: Image },
                                { id: "files", label: "Files", icon: FileText },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                        ? "text-blue-600 border-b-2 border-blue-600"
                                        : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    <tab.icon className="h-4 w-4" />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        {renderTabContent()}
                    </div>
                </div>
            </div>

            {renderMemberProfile()}
        </ErrorBoundary>
    )
}
