import { Hero } from "@/features/home/components/Hero"
import HomeFeatured from "@/features/home/components/HomeFeatured"

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <HomeFeatured />
    </main>
  )
}
