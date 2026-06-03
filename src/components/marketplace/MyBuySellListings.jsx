import React, { useState } from "react";
import {
    useGetMyBuySellListingsQuery,
    useDeleteBuySellMutation,
    useMarkBuySellAsSoldMutation
} from "@/store/api/hostApi";
import { Edit, Trash2, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { SellForm } from "@/components/marketplace/SellForm";

export function MyBuySellListings() {
    const { data: listings = [], isLoading, isError } = useGetMyBuySellListingsQuery();
    const [deleteListing] = useDeleteBuySellMutation();
    const [markAsSold] = useMarkBuySellAsSoldMutation();

    const [editingItem, setEditingItem] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this listing?")) {
            await deleteListing(id);
        }
    };

    const handleMarkSold = async (id) => {
        if (window.confirm("Mark this item as sold?")) {
            await markAsSold(id);
        }
    };

    const handleEdit = (item) => {
        setEditingItem(item);
        setIsEditOpen(true);
    };

    const handleUpdateComplete = () => {
        setIsEditOpen(false);
        setEditingItem(null);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="text-center p-12 text-red-500 bg-red-50 rounded-lg">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                Failed to load your listings.
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Buy/Sell Listings</h2>
                    <p className="text-gray-500">Manage your marketplace items</p>
                </div>
                {/* Optional: Add 'Post New' button here if desired, 
            though usually that's a separate tab. User can use the Sell tab. 
        */}
            </div>

            {listings.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">You haven't listed any items yet.</p>
                    <Button onClick={() => window.location.href = '/marketplace?tab=sell'}>
                        <Plus className="h-4 w-4 mr-2" />
                        List an Item
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {listings.map((item) => (
                        <div
                            key={item.id || item._id}
                            className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center"
                        >
                            {/* Image */}
                            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                {item.images?.[0] || item.image ? (
                                    <img
                                        src={item.images?.[0] || item.image}
                                        alt={item.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400">
                                        No Img
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                    <h3 className="font-bold text-lg text-gray-900 truncate pr-2">{item.title}</h3>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${item.status === 'active' ? 'bg-green-100 text-green-700' :
                                            item.status === 'sold' ? 'bg-gray-100 text-gray-600' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {item.status?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="text-primary font-bold mt-1">
                                    ${Number(item.price).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500 mt-1 flex gap-3">
                                    <span>{(item.created_at || item.createdAt) ? new Date(item.created_at || item.createdAt).toLocaleDateString() : "Recently"}</span>
                                    <span>•</span>
                                    <span className="truncate">{item.category}</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(item)}
                                    className="flex-1 sm:flex-none justify-center"
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>

                                {item.status !== 'sold' && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleMarkSold(item.id || item._id)}
                                        className="flex-1 sm:flex-none justify-center text-green-600 hover:text-green-700 hover:bg-green-50"
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Sold
                                    </Button>
                                )}

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(item.id || item._id)}
                                    className="flex-1 sm:flex-none justify-center text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Listing</DialogTitle>
                    </DialogHeader>
                    {editingItem && (
                        <SellForm
                            initialData={editingItem}
                            isEditing={true}
                            onPost={handleUpdateComplete}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
