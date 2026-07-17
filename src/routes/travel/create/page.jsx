import { useNavigate } from "react-router-dom"

import PostTripForm from "@/features/travel/components/PostTripForm"

export default function CreateTravelPlanPage() {
  const navigate = useNavigate()

  const returnToTravelPartners = () => navigate("/travel")

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="w-full">
        <PostTripForm
          onCancel={returnToTravelPartners}
          onAdd={returnToTravelPartners}
        />
      </div>
    </main>
  )
}
