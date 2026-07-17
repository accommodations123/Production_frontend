import { ArrowRight, CalendarDays, ShieldCheck, Users } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { Button } from "@/shared/ui/button"
import { useGetMeQuery } from "@/store/api/authApi"

const communityBenefits = [
  { icon: ShieldCheck, label: "Verified stays" },
  { icon: CalendarDays, label: "Local experiences" },
  { icon: Users, label: "Real connections" },
]

export function Hero() {
  const navigate = useNavigate()
  const { data: userData } = useGetMeQuery()

  const handleJoinCommunity = () => {
    if (!userData?.user) {
      navigate("/signup")
      return
    }

    if (userData.user.isHost) {
      toast.info("You are already a registered host!")
      return
    }

    navigate("/search")
  }

  return (
    <section className="border-b border-gray-100 bg-white" aria-labelledby="home-hero-title">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8 lg:py-20">
        <div className="max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#CB2A25]">
            Your community, wherever you are
          </p>

          <h1
            id="home-hero-title"
            className="text-4xl font-bold leading-[1.08] tracking-tight text-[#00142E] sm:text-5xl lg:text-6xl"
          >
            Feel at home, even when you are far from it.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-7 text-gray-600 sm:text-lg">
            Discover trusted places to stay, meet people nearby, and take part in events that make a new city feel familiar.
          </p>

          <div className="mt-8">
            <Button
              type="button"
              size="lg"
              onClick={handleJoinCommunity}
              className="h-12 rounded-lg bg-[#CB2A25] px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-[#a9201c] focus-visible:ring-2 focus-visible:ring-[#CB2A25] focus-visible:ring-offset-2"
            >
              Join the community
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-gray-100 pt-6" aria-label="Community benefits">
            {communityBenefits.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Icon className="h-4 w-4 text-[#CB2A25]" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-gray-100 sm:min-h-[420px] lg:min-h-[520px]">
          <img
            src="/photo-1522071820081-009f0129c71c.avif"
            alt="Friends sharing time together in their local community"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#00142E]/80 to-transparent px-6 pb-6 pt-20 sm:px-8 sm:pb-8">
            <p className="max-w-sm text-lg font-semibold leading-7 text-white sm:text-xl">
              A familiar face can make any place feel closer to home.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
