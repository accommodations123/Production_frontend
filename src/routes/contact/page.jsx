


import { ContactHeader } from "@/features/contact/components/ContactHeader"
import { ContactInfo } from "@/features/contact/components/ContactInfo"
import { ContactForm } from "@/features/contact/components/ContactForm"

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-[#00142E] text-[#D1CBB7] selection:bg-[#E1392A]/30">
            <>

            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#E1392A]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#D1CBB7]/5 rounded-full blur-[100px]" />
            </div>

            <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 md:py-32 relative z-10">
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

            </>
        </main>
    )
}
