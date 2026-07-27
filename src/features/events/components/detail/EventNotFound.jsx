import { Link } from "react-router-dom"
import { Calendar } from "lucide-react"
import { Navbar } from "@/shared/layout/Navbar"
import Footer from "@/shared/layout/Footer"
import { Button } from "@/shared/ui/button"

export default function EventNotFound() {
    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4 py-36">
                <div className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
                    <div className="w-20 h-20 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <Calendar className="h-10 w-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4 text-center">Event Not Found</h1>
                    <p className="text-[#222222] mb-8 text-center">The event you are looking for does not exist or has been removed.</p>
                    <Link to="/events" className="block">
                        <Button className="w-full bg-accent text-white hover:bg-accent/90 transition-all duration-300 shadow-xl rounded-2xl">
                            Back to Events
                        </Button>
                    </Link>
                </div>
            </div>
            <Footer />
        </main>
    )
}
