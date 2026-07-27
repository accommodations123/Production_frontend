import { useNavigate } from "react-router-dom";
import { SellForm } from "@/features/marketplace/components/SellForm";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";

export default function CreateMarketplacePage() {
  const navigate = useNavigate();
  const returnToMarketplace = () => navigate("/marketplace");

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-4 sm:py-6 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <Breadcrumb
            items={[
              { label: "Marketplace", path: "/marketplace" },
              { label: "Create Listing" }
            ]}
          />
          <span className="text-xs font-bold text-gray-400">Sell Item</span>
        </div>
        <SellForm
          onPost={returnToMarketplace}
        />
      </div>
    </main>
  );
}
