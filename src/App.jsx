import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CountryProvider } from "@/context/CountryContext";
import ScrollToTop from "@/components/layout/ScrollToTop";
import RootLayout from "@/app/layout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import HostGuard from "@/components/auth/HostGuard";
import { AppErrorBoundary } from "@/shared/components/AppErrorBoundary";

// Safe Lazy loader with automatic retry loop & storage safety for mobile / Safari
const safeLazy = (importFn) =>
    lazy(async () => {
        let retries = 3;
        while (retries > 0) {
            try {
                return await importFn();
            } catch (error) {
                retries--;
                if (retries === 0) {
                    try {
                        const hasReloaded = sessionStorage.getItem("vite_chunk_reloaded");
                        if (!hasReloaded) {
                            sessionStorage.setItem("vite_chunk_reloaded", "true");
                            window.location.reload();
                            return new Promise(() => { });
                        }
                        sessionStorage.removeItem("vite_chunk_reloaded");
                    } catch (e) {
                        // ignore storage errors in Safari Private Browsing mode
                    }
                    throw error;
                }
                // Delay with backoff before retry (400ms, 800ms)
                await new Promise((resolve) => setTimeout(resolve, (3 - retries) * 400));
            }
        }
    });

// Lazy-loaded pages with auto-recovery
const Home = safeLazy(() => import("@/app/page"));
const Career = safeLazy(() => import("@/app/career/page"));
const About = safeLazy(() => import("@/app/about/page"));
const Trust = safeLazy(() => import("@/app/trust/page"));
const Help = safeLazy(() => import("@/app/help/page"));
const Contact = safeLazy(() => import("@/app/contact/page"));
const EventsPage = safeLazy(() => import("@/app/events/page"));
const EventDetailsPage = safeLazy(() => import("@/app/events/[id]/page"));
const HostEventPage = safeLazy(() => import("@/app/events/host/page"));
const RoomDetails = safeLazy(() => import("@/app/rooms/[id]/page"));
const AccommodationsPage = safeLazy(() => import("@/app/SearchPage"));
const PostStayRequestPage = safeLazy(() => import("@/app/accommodations/post-request/page"));
const HostCreatePage = safeLazy(() => import("@/app/host/create/page"));
const TravelPage = safeLazy(() => import("@/app/resources/travel/page"));
const LegalPage = safeLazy(() => import("@/app/resources/legal/page"));
const Signup = safeLazy(() => import("@/app/signup/page"));
const Signin = safeLazy(() => import("@/app/signin/page"));
const SupportPage = safeLazy(() => import("./components/mentorship/page"));
const MarketplacePage = safeLazy(() => import("@/app/marketplace/page"));
const ProductDetailsPage = safeLazy(() => import("@/app/marketplace/[id]/page"));
const NewDashboard = safeLazy(() => import("@/app/dashboard/NewDashboard"));
const PrivacyPage = safeLazy(() => import("@/app/privacy/page"));
const TermsPage = safeLazy(() => import("@/app/terms/page"));
const WishlistPage = safeLazy(() => import("@/app/wishlist/page"));
const HostOnboardingForm = safeLazy(() => import("./components/host/Host"));
const TravelCommunity = safeLazy(() => import("./components/dashboard/TravelCommunity").then(module => ({ default: module.TravelCommunity })));

const PeopleHome = safeLazy(() => import("@/features/people/pages/PeopleHome"));
const PeopleProfile = safeLazy(() => import("@/features/people/pages/PeopleProfile"));
const BecomeExpert = safeLazy(() => import("@/features/people/pages/BecomeExpert"));

export default function App() {
    return (
        <AppErrorBoundary>
            <BrowserRouter>
                <ScrollToTop />
                <CountryProvider>
                    <RootLayout>
                        <Suspense fallback={<LoadingSpinner />}>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route path="/career" element={<Career />} />
                                <Route path="/career/job/:id" element={<Career />} />
                                <Route path="/about" element={<About />} />
                                <Route path="/trust" element={<Trust />} />
                                <Route path="/help" element={<Help />} />
                                <Route path="/contact" element={<Contact />} />
                                <Route path="/account-v2" element={<NewDashboard />} />
                                <Route path="/events" element={<EventsPage />} />
                                <Route path="/events/host" element={
                                    <HostGuard>
                                        <HostEventPage />
                                    </HostGuard>
                                } />
                                <Route path="/events/:id" element={<EventDetailsPage />} />
                                <Route path="/support" element={<SupportPage />} />
                                <Route path="/hosts" element={<HostOnboardingForm />} />
                                <Route path="/host" element={<Navigate to="/hosts" replace />} />
                                <Route path="/community-guidelines" element={<Navigate to="/trust" replace />} />

                                {/* Accommodations primary routes & legacy redirects */}
                                <Route path="/accommodations" element={<AccommodationsPage />} />
                                <Route path="/search" element={<Navigate to="/accommodations" replace />} />
                                <Route path="/rooms" element={<Navigate to="/accommodations" replace />} />
                                <Route path="/rooms/:id" element={<RoomDetails />} />
                                <Route path="/search/post-request" element={<Navigate to="/accommodations/post-request" replace />} />
                                <Route path="/accommodations/post-request" element={<PostStayRequestPage />} />

                                <Route path="/host/create" element={
                                    <HostGuard>
                                        <HostCreatePage />
                                    </HostGuard>
                                } />
                                <Route path="/travel" element={<TravelPage />} />
                                <Route path="/resources/legal" element={<LegalPage />} />
                                <Route path="/marketplace" element={<MarketplacePage />} />
                                <Route path="/marketplace/:id" element={<ProductDetailsPage />} />
                                <Route path="/signup" element={<Signup />} />
                                <Route path="/signin" element={<Signin />} />
                                <Route path="/resources/travel" element={<TravelCommunity />} />
                                <Route path="/privacy" element={<PrivacyPage />} />
                                <Route path="/terms" element={<TermsPage />} />
                                <Route path="/wishlist" element={
                                    <HostGuard>
                                        <WishlistPage />
                                    </HostGuard>
                                } />
                                <Route path="/people" element={<PeopleHome />} />
                                <Route path="/people/become" element={<BecomeExpert />} />
                                <Route path="/people/:id" element={<PeopleProfile />} />

                                {/* Wildcard fallback to home */}
                                <Route path="*" element={<Navigate to="/" replace />} />
                            </Routes>
                        </Suspense>
                    </RootLayout>
                </CountryProvider>
            </BrowserRouter>
        </AppErrorBoundary>
    );
}