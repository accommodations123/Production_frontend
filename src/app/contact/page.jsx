import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ContactHeader } from "@/components/contact/ContactHeader"
import { ContactInfo } from "@/components/contact/ContactInfo"
import { ContactForm } from "@/components/contact/ContactForm"

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#00152d] text-[#f7eed7] selection:bg-accent/30">
            <Navbar />

            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 py-20 sm:py-24 md:py-32 relative z-10">
                <ContactHeader />

                <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-20 max-w-7xl mx-auto">
                    {/* Left Column: Contact Info */}
                    <div className="order-2 md:order-1">
                        <ContactInfo />
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="order-1 md:order-2">
                        <ContactForm />
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    )
}
