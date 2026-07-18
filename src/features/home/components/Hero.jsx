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
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 pt-4 pb-12 sm:px-6 sm:pt-6 sm:pb-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-8 lg:pt-6 lg:pb-16">
        <div className="max-w-xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-[#E1392A]">
            Your community, wherever you are
          </p>
 
          <h1
            id="home-hero-title"
            className="text-4xl font-extrabold leading-[1.12] tracking-[-0.03em] text-[#00142E] sm:text-5xl sm:leading-[1.1] lg:text-[56px] lg:leading-[1.08]"
          >
            Feel at home, even when you are far from it.
          </h1>
 
          <p className="mt-6 max-w-lg text-base leading-relaxed text-[#484848] sm:text-lg sm:leading-8">
            Discover trusted places to stay, meet people nearby, and take part in events that make a new city feel familiar.
          </p>
 
          <div className="mt-8">
            <Button
              type="button"
              size="lg"
              onClick={handleJoinCommunity}
              className="h-12 rounded-xl bg-[#E1392A] px-6 text-base font-semibold text-white shadow-md shadow-[#E1392A]/15 transition-all duration-200 hover:bg-[#C82E20] hover:shadow-lg hover:shadow-[#E1392A]/25 focus-visible:ring-2 focus-visible:ring-[#E1392A] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Join the community
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
 
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-gray-100 pt-6" aria-label="Community benefits">
            {communityBenefits.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-sm font-semibold text-[#484848]">
                <Icon className="h-4.5 w-4.5 text-[#E1392A]" aria-hidden="true" />
                {label}
              </li>
            ))}
          </ul>
        </div>
 
        <div className="relative min-h-[320px] overflow-hidden rounded-2xl bg-gray-100 sm:min-h-[420px] lg:min-h-[520px] shadow-sm">
          <img
            src="/photo-1522071820081-009f0129c71c.avif"
            alt="Friends sharing time together in their local community"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
          <div className="absolute bottom-6 left-6 right-6 bg-[#00142E]/50 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
            <p className="max-w-sm text-base font-semibold leading-relaxed text-white sm:text-lg">
              “A familiar face can make any place feel closer to home.”
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
