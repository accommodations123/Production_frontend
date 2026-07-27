import { useNavigate } from "react-router-dom";
import PostTripForm from "@/features/travel/components/PostTripForm";
import { Breadcrumb } from "@/shared/ui/Breadcrumb";

export default function CreateTravelPlanPage() {
  const navigate = useNavigate();
  const returnToTravelPartners = () => navigate("/travel");

  return (
    <main className="min-h-screen bg-[#FAF9F6] px-4 py-4 sm:py-6 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <Breadcrumb
            items={[
              { label: "Travel & Companions", path: "/travel" },
              { label: "Create Travel Plan" }
            ]}
          />
          <span className="text-xs font-bold text-gray-400">Post Trip</span>
        </div>
        <PostTripForm
          onCancel={returnToTravelPartners}
          onAdd={returnToTravelPartners}
        />
      </div>
    </main>
  );
}
