import React from 'react';

export const ContactsWidget = () => {
    // Mock contacts
    const contacts = [
        // { name: "Vasily Terkin", count: "125 contacts", img: "https://i.pravatar.cc/150?u=a042581f4e29026024d" },
        // { name: "Natasha Rostova", count: "2 contacts", img: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
    ];

    if (contacts.length === 0) return null; // Hide if no contacts

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-500 text-sm font-medium">Contacts <span className="text-gray-400 ml-1">0</span></h3>
            </div>
            <div className="space-y-4">
            </div>
        </div>
    );
};


