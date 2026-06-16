import React from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OwnerCard({ ownerName, ownerImage, ownerPhone, ownerEmail }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900">Contact Owner</h3>
        <p className="text-[10px] text-gray-400">
          Get callback and resolve queries
        </p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            {ownerImage ? (
              <img
                src={ownerImage}
                alt={ownerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#7B2CBF] flex items-center justify-center text-white font-bold text-lg">
                {ownerName?.charAt(0) || "O"}
              </div>
            )}
          </div>

          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#7B2CBF] rounded-full flex items-center justify-center border-2 border-white">
            <ShieldCheck className="w-3 h-3 text-white" />
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-900">{ownerName}</h4>
          <p className="text-xs text-gray-500">{ownerPhone}</p>
          {ownerEmail && (
            <p className="text-xs text-gray-400">{ownerEmail}</p>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Name
          </label>
          <input
            type="text"
            placeholder="Your Name"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none text-sm text-gray-900 font-medium"
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">
            Phone Number
          </label>
          <input
            type="text"
            placeholder="+01 123 456 7890"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 outline-none text-sm text-gray-900 font-medium"
          />
        </div>

        <div className="py-2">
          <p className="text-xs font-semibold text-gray-500 mb-2">
            Are you Real Estate Agent
          </p>

          <div className="flex gap-4">
            <button className="flex-1 py-2 rounded-lg bg-gray-100 text-gray-900 text-xs font-medium border border-gray-200">
              Yes
            </button>

            <button className="flex-1 py-2 rounded-lg bg-accent text-white text-xs font-medium shadow-md">
              No
            </button>
          </div>
        </div>

        <Button className="w-full bg-[#e0d4fc] text-[#7B2CBF] hover:bg-[#d0c0f0] font-bold py-6 rounded-xl">
          Request a Callback
        </Button>
      </div>
    </div>
  );
}
