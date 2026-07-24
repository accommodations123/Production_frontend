import React from "react";
import { useNavigate } from "react-router-dom";
import { SellForm } from "@/features/marketplace/components/SellForm";

export default function CreateMarketplacePage() {
  const navigate = useNavigate();
  const returnToMarketplace = () => navigate("/marketplace");

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-4 sm:py-6 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <SellForm
          onCancel={returnToMarketplace}
          onSuccess={returnToMarketplace}
        />
      </div>
    </main>
  );
}
