"use client"

import * as React from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { Navbar } from "@/components/layout/Navbar"
import { useCountry } from "@/context/CountryContext"
import { Footer } from "@/components/layout/Footer"
import {
    useGetCommunityByIdQuery,
    useJoinCommunityMutation,
    useLeaveCommunityMutation,
    useGetCommunityFeedQuery,
    useCreateCommunityPostMutation,
    useGetCommunityResourcesQuery,
    useAddCommunityResourceMutation,
    useDeleteCommunityPostMutation,
    useDeleteCommunityResourceMutation,
    useGetHostProfileQuery,
    useGetCommunityMembersQuery,
    useGetCommunityHostMembersQuery
} from "@/store/api/hostApi"
import { useGetMeQuery as useAuthMeQuery } from "@/store/api/authApi"
import { toast } from "sonner"
import {
    Heart, MessageCircle, Share2, X, Users, Star, Zap, Bell, Search, Filter, Home, UserCheck, CalendarDays, Image, FileText, Hash, MessageSquare, Clock, MapPin, Calendar, Camera, FolderOpen, Download, Play, Eye, Briefcase, BookOpen, Database, HelpCircle, UserPlus, UserMinus, Settings, ChevronRight, ArrowLeft, ThumbsUp, Bookmark, TrendingUp, Award, BarChart3, Target, Trophy, Gift, Sparkles, Info, Code, Globe, Link2, Mail, Phone, Shield, Pin, Upload, MoreVertical, Layers, Palette, Loader2, Trash2, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import WishlistButton from "@/components/ui/WishlistButton"
import { Pagination } from "@/components/ui/Pagination"
import { cn } from "@/lib/utils"

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
            <div className="flex items-center justify-center p-4 min-h-[50vh]">
                <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg border">
                    <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
                    <p className="text-gray-600 mb-2 text-sm">An error occurred while loading the community.</p>
                    <Button onClick={handleRetry}>
                        Try Again
                    </Button>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

// --- Sub-components ---

function MembersTab({ communityId }) {
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState("");

    // Fetch both queries
    const { data: memberData, isLoading: isLoadingMembers } = useGetCommunityMembersQuery({ id: communityId, page, search });
    const { data: hostsData, isLoading: isLoadingHosts } = useGetCommunityHostMembersQuery({ id: communityId, page, limit: 12 });

    const members = memberData?.members || [];
    const hosts = hostsData?.hosts || [];

    if (isLoadingMembers || isLoadingHosts) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gray-50 p-4 md:p-6 min-h-[500px]">

            {/* Hosts Section */}
            {hosts.length > 0 && (
                <div className="mb-8">
                    <div className="mb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Award className="h-5 w-5 text-blue-600" />
                                Community Hosts
                            </h2>
                            <p className="text-gray-500 text-sm ml-7">{hostsData?.count || 0} hosts</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {hosts.map((host) => {
                            const name = host.full_name || "Unknown Host";
                            const image = host.profile_image;

                            return (
                                <div key={host.user_id || host.id} className="bg-white rounded-xl p-4 md:p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden border-2 border-transparent group-hover:border-blue-100 transition-colors">
                                        {image ? (
                                            <img src={image} alt={name} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-gray-400 font-bold text-lg">{(name[0] || "H").toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 truncate text-sm md:text-base" title={name}>{name}</h3>
                                        <div className="flex items-center gap-1 mt-1 text-xs text-blue-600 font-medium">
                                            <span className="bg-blue-50 px-2 py-0.5 rounded-full">Ctx Host</span>
                                        </div>
                                        {(host.city || host.country) && (
                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                <span className="truncate">{[host.city, host.country].filter(Boolean).join(", ")}</span>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}


        </div>
    );
}



export default function GroupDetailsPage() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = React.useState("feed")
    const [selectedMember, setSelectedMember] = React.useState(null)
    const [selectedImage, setSelectedImage] = React.useState(null) // Lightbox state
    const [deleteConfirmation, setDeleteConfirmation] = React.useState(null) // { postId, authorId }
    const [isJoining, setIsJoining] = React.useState(false)
    // 'joined' | 'left' | null - overrides backend data
    const [optimisticStatus, setOptimisticStatus] = React.useState(null);

    const { activeCountry } = useCountry();

    // --- Feed State ---
    const [page, setPage] = React.useState(1);
    const [postContent, setPostContent] = React.useState("");
    const [postMedia, setPostMedia] = React.useState([]);
    const [isPosting, setIsPosting] = React.useState(false);

    // --- Resources State ---
    const [showResourceForm, setShowResourceForm] = React.useState(false);
    const [resourceForm, setResourceForm] = React.useState({
        title: "",
        description: "",
        resource_type: "link", // link, file
        resource_value: "", // url

        file: null
    });

    // --- Menu State ---
    const [openMenuId, setOpenMenuId] = React.useState(null);

    React.useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    // API hooks
    const { data: communityData, isLoading, error, refetch } = useGetCommunityByIdQuery(id)
    const [joinCommunity] = useJoinCommunityMutation()
    const [leaveCommunity] = useLeaveCommunityMutation()

    // Feed & Resources Hooks
    const { data: feedData, isLoading: isFeedLoading } = useGetCommunityFeedQuery({ id, page }, { skip: !id });
    const feedPosts = feedData?.posts || [];
    const totalPages = feedData?.totalPages || 1;

    const { data: resources, isLoading: isResourcesLoading } = useGetCommunityResourcesQuery(id, { skip: !id });

    const [createPost] = useCreateCommunityPostMutation();
    const [deletePost] = useDeleteCommunityPostMutation();
    const [addResource] = useAddCommunityResourceMutation();
    const [deleteResource] = useDeleteCommunityResourceMutation();

    // Get current user profile for robust membership check
    const { data: userData } = useAuthMeQuery();
    const { data: hostProfile } = useGetHostProfileQuery();

    const resolvedUser = React.useMemo(() => {
        const userDetails = userData?.user || userData || {};
        // Prioritize Host Profile data for the name if available
        const finalProfile = {
            ...userDetails,
            ...(hostProfile || {}), // Host profile overrides user details for shared fields if both exist, or we can be more selective
        };

        // Ensure profile image is handled gracefully
        finalProfile.profile_image = hostProfile?.profile_image || userDetails?.profile_image || null;

        return finalProfile;
    }, [userData, hostProfile]);

    const displayName = React.useMemo(() => {
        // Strict priority: Host Name -> Full Name -> Name -> Email -> User
        const hostName = resolvedUser?.host_name || resolvedUser?.name;
        if (hostName && hostName.trim() !== "") return hostName;

        const fullName = resolvedUser?.full_name || resolvedUser?.fullName;
        if (fullName && fullName.trim() !== "") return fullName;

        const emailName = resolvedUser?.email?.split("@")[0];
        if (emailName) return emailName;

        return "User";
    }, [resolvedUser]);

    const userInitials = React.useMemo(() => {
        return (displayName || "U").slice(0, 2).toUpperCase();
    }, [displayName]);

    // Key fix: Unwrap community data
    const community = React.useMemo(() => {
        if (!communityData) return null;
        const comm = communityData.community || communityData.data || communityData;
        return comm;
    }, [communityData, hostProfile, resolvedUser]);

    const isMember = React.useMemo(() => {
        // Optimistic override
        if (optimisticStatus === 'joined') return true;
        if (optimisticStatus === 'left') return false;

        if (!community) return false;

        // 1. Check explicit flags from backend (Priority 1)
        if (typeof community.is_member === 'boolean') return community.is_member;
        if (typeof community.isJoined === 'boolean') return community.isJoined;
        if (typeof community.isMember === 'boolean') return community.isMember;

        // 2. Check localized members list if available
        if (resolvedUser && community.members && Array.isArray(community.members)) {
            const userId = String(resolvedUser.id || resolvedUser._id || resolvedUser.user_id);
            return community.members.some(m => {
                const memberId = m.user_id || m.id || m._id || m.UserId || (m.User && (m.User.id || m.User._id));
                return String(memberId) === userId;
            });
        }

        return false;
    }, [community, resolvedUser, optimisticStatus]);

    // Derived Owner State
    const isOwner = React.useMemo(() => {
        // Debugging Owner Logic
        /*
        console.log("DEBUG OWNER CHECK:", {
            member_role: community?.member_role,
            userId: resolvedUser?.id,
            communityCreatedBy: community?.created_by,
            communityOwnerId: community?.owner_id,
            members: community?.members
        });
        */

        if (community?.member_role === 'owner') return true;
        // Fallback checks
        const userId = resolvedUser?.id;
        const ownerId = community?.created_by || community?.user_id || community?.owner_id; // Added user_id

        // Strict string comparison
        if (userId && ownerId && String(userId) === String(ownerId)) return true;

        // Check members array for owner role
        if (userId && community?.members?.length) {
            const memberRecord = community.members.find(m => String(m.user_id) === String(userId));
            if (memberRecord?.role === 'owner') return true;
        }
        return false;
    }, [community, resolvedUser]);

    const handleJoinLeave = async () => {
        if (!community) return;
        setIsJoining(true);
        try {
            if (isMember) {
                await leaveCommunity(community.id).unwrap();
                setOptimisticStatus('left');
                toast.success("Successfully left the community!");
            } else {
                await joinCommunity(community.id).unwrap();
                setOptimisticStatus('joined');
                toast.success("Successfully joined the community!");
            }
            // Force refresh data to update button state
            refetch();
        } catch (err) {
            const errorMsg = err.data?.message || err.error || "An error occurred";
            const status = err.status;

            // Auto-correct state if backend says strictly opposed state
            // 400 often means "Already joined" when trying to join, or "Not a member" when trying to leave
            if (status === 400 || String(errorMsg).toLowerCase().includes("already")) {
                if (!isMember) {
                    setOptimisticStatus('joined');
                    toast.success("Syncing status: You are a member");
                }
            } else if (String(errorMsg).toLowerCase().includes("not a member")) {
                setOptimisticStatus('left');
                toast.info("You are not a member of this community");
            } else if (String(errorMsg).toLowerCase().includes("owner cannot leave")) {
                toast.error("Community owners cannot leave the community. You must transfer ownership first or delete the community.");
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setIsJoining(false);
        }
    };

    // --- Feed Actions ---
    const handleCreatePost = async () => {
        if (!postContent.trim() && postMedia.length === 0) {
            toast.error("Please add some content or media");
            return;
        }

        setIsPosting(true);
        try {
            const formData = new FormData();
            formData.append("content", postContent);
            // Attach real user name for backend to use if needed
            formData.append("author_name", displayName);

            // Append files
            if (postMedia.length > 0) {
                Array.from(postMedia).forEach(file => {
                    formData.append("media", file);
                });
            }

            await createPost({ id, data: formData }).unwrap();
            toast.success("Post created successfully!");
            setPostContent("");
            setPostMedia([]);
        } catch (err) {
            console.error(err);
            toast.error(err.data?.message || "Failed to create post");
        } finally {
            setIsPosting(false);
        }
    };

    const handleDeletePost = (postId, authorId) => {
        setDeleteConfirmation({ postId, authorId });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;
        const { postId, authorId } = deleteConfirmation;

        console.log("Attempting Delete:", { postId, authorId, isOwner, userId: resolvedUser?.id });

        // Optimistic check
        const isAuthor = String(authorId) === String(resolvedUser?.id);

        // If not owner AND not author, block.
        if (!isOwner && !isAuthor) {
            toast.error("Only the community owner can delete other users' posts.");
            setDeleteConfirmation(null);
            return;
        }

        try {
            await deletePost(postId).unwrap();
            toast.success("Post deleted successfully");
        } catch (err) {
            console.error("Delete failed:", err);
            const status = err.status;
            // If backend says 403, we trust it.
            if (status === 403 || status === 401) {
                toast.error("Permission denied. Only the community owner can delete this post.");
            } else {
                toast.error(err.data?.message || "Failed to delete post");
            }
        } finally {
            setDeleteConfirmation(null);
        }
    };

    // --- Resource Actions ---
    const handleAddResource = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("title", resourceForm.title);
            formData.append("description", resourceForm.description);
            formData.append("resource_type", resourceForm.resource_type);

            if (resourceForm.resource_type === 'link') {
                formData.append("resource_value", resourceForm.resource_value);
            } else if (resourceForm.file) {
                formData.append("file", resourceForm.file);
            }

            await addResource({ id, data: formData }).unwrap();
            toast.success("Resource added successfully");
            setShowResourceForm(false);
            setResourceForm({ title: "", description: "", resource_type: "link", resource_value: "", file: null });
        } catch (err) {
            console.error(err);
            toast.error(err.data?.message || "Failed to add resource");
        }
    };

    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm("Delete this resource?")) return;
        try {
            await deleteResource(resourceId).unwrap();
            toast.success("Resource deleted");
        } catch (err) {
            toast.error("Failed to delete resource");
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case "feed":
                return (
                    <div className="flex h-full min-h-[600px] bg-gray-50 flex-col md:flex-row">
                        {/* Main Content */}
                        <div className="flex-1 flex flex-col h-full border-r border-gray-200">
                            {/* Create Post - Only for Approved Hosts who are Members OR the Owner */}
                            {isOwner || (isMember && hostProfile?.status === "approved") ? (
                                <div className="p-4 bg-white border-b border-gray-200">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm overflow-hidden border-2 border-white shadow-sm">
                                                {resolvedUser?.profile_image ? (
                                                    <img src={resolvedUser.profile_image} alt={displayName} className="w-full h-full object-cover" />
                                                ) : (
                                                    userInitials
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <textarea
                                                    value={postContent}
                                                    onChange={(e) => setPostContent(e.target.value)}
                                                    placeholder="Share your thoughts with the community..."
                                                    className="w-full bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border border-gray-200 resize-none"
                                                    rows={2}
                                                />

                                                {/* File Preview */}
                                                {postMedia.length > 0 && (
                                                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
                                                        {Array.from(postMedia).map((file, idx) => (
                                                            <div key={idx} className="relative w-20 h-20 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border">
                                                                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="preview" />
                                                                <button
                                                                    onClick={() => {
                                                                        const dt = new DataTransfer();
                                                                        Array.from(postMedia).forEach((f, i) => {
                                                                            if (i !== idx) dt.items.add(f);
                                                                        });
                                                                        setPostMedia(dt.files);
                                                                    }}
                                                                    className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                <div className="flex items-center justify-between mt-3">
                                                    <div className="flex gap-2 relative">
                                                        <input
                                                            type="file"
                                                            id="post-media"
                                                            multiple
                                                            accept="image/*,video/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                if (e.target.files?.length) {
                                                                    const dt = new DataTransfer();
                                                                    Array.from(postMedia || []).forEach(f => dt.items.add(f));
                                                                    Array.from(e.target.files).forEach(f => dt.items.add(f));

                                                                    if (dt.files.length > 5) {
                                                                        toast.error("You can only upload up to 5 media files");
                                                                        return;
                                                                    }
                                                                    setPostMedia(dt.files);
                                                                }
                                                            }}
                                                        />
                                                        <label htmlFor="post-media" className="cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 px-3 text-gray-600">
                                                            <Image className="h-4 w-4 mr-1" /> Media
                                                        </label>
                                                    </div>
                                                    <Button
                                                        onClick={handleCreatePost}
                                                        disabled={isPosting}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-4 text-sm"
                                                    >
                                                        {isPosting ? <Loader2 className="animate-spin h-4 w-4" /> : "Post"}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Posts Feed */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                {isFeedLoading ? (
                                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" /></div>
                                ) : feedPosts && feedPosts.length > 0 ? (
                                    <div className="space-y-4">
                                        {feedPosts.map((post) => {
                                            // Robust author name detection
                                            const author = post.author || {};
                                            const authorName =
                                                post.author?.Host?.full_name || // Prioritize Nested Host Name
                                                post.author_name ||
                                                author.host_name ||
                                                author.name ||
                                                author.fullName ||
                                                author.full_name ||
                                                author.username ||
                                                (author.id ? `User ${author.id}` : "Unknown User");

                                            return (
                                                <div key={post.id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                                                    <div className="flex items-start gap-3 mb-3">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden text-gray-500">
                                                            {post.author?.profile_image ? (
                                                                <img src={post.author.profile_image} alt={authorName} className="w-full h-full object-cover" />
                                                            ) : (authorName[0] || "U")}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h4 className="font-semibold text-gray-900">{authorName}</h4>
                                                                <span className="text-xs text-gray-500">{new Date(post.createdAt || post.created_at).toLocaleString()}</span>
                                                            </div>
                                                            <p className="text-gray-700 text-sm whitespace-pre-wrap">{post.content}</p>

                                                            {/* Media Display */}
                                                            {/* Media Display - Thumbnails */}
                                                            {post.media_urls && post.media_urls.length > 0 && (
                                                                <div className={`mt-3 grid gap-2 ${post.media_urls.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                                    {post.media_urls.map((url, idx) => (
                                                                        <div
                                                                            key={idx}
                                                                            className="rounded-lg overflow-hidden border bg-gray-50 relative group cursor-pointer"
                                                                            onClick={() => setSelectedImage(url)}
                                                                        >
                                                                            <img
                                                                                src={url}
                                                                                alt="post media"
                                                                                className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                                                <div className="bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                                                                                    <Search size={20} />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions Menu */}
                                                        {(isOwner || String(post.author?.id || post.author_id) === String(resolvedUser?.id)) && (
                                                            <div className="relative ml-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        setOpenMenuId(openMenuId === post.id ? null : post.id);
                                                                    }}
                                                                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                                                >
                                                                    <MoreVertical size={18} />
                                                                </button>

                                                                {openMenuId === post.id && (
                                                                    <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in zoom-in duration-200">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeletePost(post.id, post.author?.id || post.author_id);
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                        >
                                                                            <Trash2 size={14} />
                                                                            <span>Delete</span>
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <MessageSquare className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                        <p>No posts yet. Be the first to share something!</p>
                                    </div>
                                )}
                            </div>
                        </div>


                    </div>
                );

            case "resources":
                return (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Community Resources</h2>
                            <Button onClick={() => setShowResourceForm(!showResourceForm)} className="bg-blue-600 text-white">
                                {showResourceForm ? "Cancel" : <><Plus className="w-4 h-4 mr-2" /> Add Resource</>}
                            </Button>
                        </div>

                        {/* Add Resource Form */}
                        {showResourceForm && (
                            <div className="bg-white p-6 rounded-xl border mb-6 shadow-sm max-w-2xl">
                                <h3 className="font-bold mb-4">Add New Resource</h3>
                                <form onSubmit={handleAddResource} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Title</label>
                                        <input
                                            required
                                            className="w-full border rounded-lg p-2 text-sm"
                                            value={resourceForm.title}
                                            onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <textarea
                                            required
                                            className="w-full border rounded-lg p-2 text-sm"
                                            rows={2}
                                            value={resourceForm.description}
                                            onChange={e => setResourceForm({ ...resourceForm, description: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Type</label>
                                        <select
                                            className="w-full border rounded-lg p-2 text-sm"
                                            value={resourceForm.resource_type}
                                            onChange={e => setResourceForm({ ...resourceForm, resource_type: e.target.value })}
                                        >
                                            <option value="link">External Link</option>
                                            <option value="file">File Upload</option>
                                        </select>
                                    </div>

                                    {resourceForm.resource_type === 'link' ? (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Link URL</label>
                                            <input
                                                type="url"
                                                required
                                                placeholder="https://example.com"
                                                className="w-full border rounded-lg p-2 text-sm"
                                                value={resourceForm.resource_value}
                                                onChange={e => setResourceForm({ ...resourceForm, resource_value: e.target.value })}
                                            />
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium mb-1">File</label>
                                            <input
                                                type="file"
                                                required
                                                className="w-full border rounded-lg p-2 text-sm"
                                                onChange={e => setResourceForm({ ...resourceForm, file: e.target.files[0] })}
                                            />
                                        </div>
                                    )}

                                    <div className="flex justify-end gap-2">
                                        <Button type="submit" disabled={isLoading} className="bg-green-600 text-white">Save Resource</Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div className="space-y-4">
                            {isResourcesLoading ? (
                                [1, 2, 3].map(n => <div key={n} className="h-24 bg-gray-200 animate-pulse rounded-lg" />)
                            ) : resources && resources.length > 0 ? (
                                resources.map(resource => (
                                    <div key={resource.id} className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-start gap-4">
                                        <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                                            {resource.resource_type === 'link' ? <Link2 size={24} /> : <FileText size={24} />}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-bold text-gray-900">{resource.title}</h4>
                                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-600 h-6 w-6 p-0" onClick={() => handleDeleteResource(resource.id)}>
                                                    <X size={14} />
                                                </Button>
                                            </div>
                                            <p className="text-gray-600 text-sm my-1">{resource.description}</p>

                                            <div className="mt-3">
                                                {resource.resource_type === 'link' ? (
                                                    <a
                                                        href={resource.resource_value}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                                                    >
                                                        Visit Link <ExternalLinkIcon className="h-3 w-3" />
                                                    </a>
                                                ) : (
                                                    <a
                                                        href={resource.resource_value}
                                                        download
                                                        className="text-blue-600 hover:underline text-sm font-medium flex items-center gap-1"
                                                    >
                                                        Download File <Download className="h-3 w-3" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500 bg-gray-50 border border-dashed rounded-xl">
                                    <FolderOpen className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                    <p>No resources shared yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case "members":
                return (
                    <MembersTab communityId={id} />
                );

            case "hosts":
                return (
                    <MembersTab communityId={id} type="hosts" />
                );

            default:
                return (
                    <div className="flex items-center justify-center min-h-[400px]">
                        <p className="text-gray-500">Coming soon...</p>
                    </div>
                );
        }
    }

    if (isLoading) {
        return (
            <main className="min-h-screen bg-background pt-20 flex flex-col">
                <Navbar />
                <div className="flex-1 flex justify-center items-center">
                    <Loader2 className="h-12 w-12 animate-spin text-[#C93A30]" />
                </div>
                <Footer />
            </main>
        )
    }


    if (activeCountry && community?.country && community.country !== activeCountry.name) {
        return (
            <main className="min-h-screen bg-background pt-20 flex flex-col">
                <Navbar />
                <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-4">
                        <X className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Group not available</h2>
                    <p className="text-gray-500 mb-6 max-w-md">This community group is not listed in {activeCountry.name}.</p>
                    <Button onClick={() => navigate('/groups')} className="bg-[#00142E] text-white rounded-full px-8">
                        View All Groups
                    </Button>
                </div>
                <Footer />
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-background pt-20 pb-10">
            <Navbar />

            {/* Breadcrumb */}
            <div className="container mx-auto px-4 py-4">
                <nav className="flex text-sm text-gray-500 space-x-2">
                    <Link to="/" className="hover:text-[#C93A30]">Home</Link>
                    <span>/</span>
                    <Link to="/groups" className="hover:text-[#C93A30]">Groups</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate max-w-xs">{community.name}</span>
                </nav>
            </div>

            <div className="container mx-auto px-4">
                <ErrorBoundary>
                    <div className="relative w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col min-h-[80vh]">
                        {/* Header with Background Image */}
                        <div className="relative h-64 flex-shrink-0">
                            {community?.cover_image ? (
                                <img src={community.cover_image} alt="Cover" className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600"></div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-transparent"></div>

                            <div className="absolute top-4 right-4 z-10">
                                <WishlistButton
                                    itemId={id}
                                    itemType="community"
                                    className="w-10 h-10 bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 transition-all rounded-full"
                                    iconSize={20}
                                    outlineColor="text-white"
                                    filledColor="fill-red-500 text-red-500"
                                />
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-8">
                                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                                    {community?.avatar_image ? (
                                        <img src={community.avatar_image} alt={community?.name} className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" />
                                    ) : (
                                        <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border-4 border-white">
                                            <span className="text-white text-3xl font-bold">{community?.name ? community.name.substring(0, 2).toUpperCase() : 'CO'}</span>
                                        </div>
                                    )}
                                    <div className="flex-1 mb-2">
                                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{community?.name || 'Community Name'}</h1>
                                        <p className="text-white/90 text-lg max-w-2xl">{community?.description || 'Community description'}</p>
                                    </div>
                                    <div className="mb-2">
                                        {isOwner ? (
                                            <Button disabled className="font-semibold bg-gray-100 text-gray-400 border-none shadow-none px-6 py-6 text-lg h-auto cursor-not-allowed">
                                                Owner
                                            </Button>
                                        ) : (
                                            <Button onClick={handleJoinLeave} disabled={isJoining} className="font-semibold bg-white text-blue-600 hover:bg-gray-100 border-none shadow-md px-6 py-6 text-lg h-auto">
                                                {isJoining ? <Loader2 className="h-5 w-5 animate-spin" /> : isMember ? 'Leave Group' : 'Join Group'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                            <div className="flex items-center px-4 md:px-8 space-x-1 overflow-x-auto no-scrollbar">
                                {[
                                    { id: "feed", label: "Feed", icon: Home },
                                    { id: "resources", label: "Resources", icon: FileText },
                                    { id: "members", label: "Members", icon: Users },
                                    { id: "events", label: "Events", icon: CalendarDays },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${activeTab === tab.id
                                            ? "text-blue-600 border-blue-600"
                                            : "text-gray-600 border-transparent hover:text-gray-900 hover:border-gray-200"
                                            }`}
                                    >
                                        <tab.icon className="h-4 w-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 bg-gray-50">
                            {renderTabContent()}
                        </div>
                    </div>
                </ErrorBoundary>
            </div>
            <Footer />

            {/* Lightbox Overlay */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <button
                        className="absolute top-4 right-4 text-white hover:text-gray-300 p-2 z-60 bg-black/50 rounded-full transition-colors"
                        onClick={() => setSelectedImage(null)}
                    >
                        <X size={32} />
                    </button>
                    <img
                        src={selectedImage}
                        alt="Full size"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 select-none"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
            {/* Delete Confirmation Modal */}
            {deleteConfirmation && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setDeleteConfirmation(null)}
                >
                    <div
                        className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-600">
                                <Trash2 size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Post?</h3>
                            <p className="text-gray-500 mb-6 text-sm">
                                Are you sure you want to delete this post? This action cannot be undone.
                            </p>
                            <div className="flex gap-3 w-full">
                                <Button
                                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium"
                                    onClick={() => setDeleteConfirmation(null)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium"
                                    onClick={confirmDelete}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}

// Simple icon for external link if not imported
const ExternalLinkIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
)