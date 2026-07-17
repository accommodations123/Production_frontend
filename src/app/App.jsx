import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CountryProvider } from "@/context/CountryContext";
import ScrollToTop from "@/shared/layout/ScrollToTop";
import RootLayout from "@/app/RootLayout";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";
import HostGuard from "@/features/auth/components/HostGuard";

// Lazy-loaded pages
const Home = lazy(() => import("@/routes/home/page"))
const Career = lazy(() => import("@/routes/career/page"));
const About = lazy(() => import("@/routes/about/page"));
const Trust = lazy(() => import("@/routes/trust/page"));
const Help = lazy(() => import("@/routes/help/page"));
const Contact = lazy(() => import("@/routes/contact/page"));
const EventsPage = lazy(() => import("@/routes/events/page"));
const EventDetailsPage = lazy(() => import("@/routes/events/[id]/page"));
const HostEventPage = lazy(() => import("@/routes/events/host/page"));
const RoomDetails = lazy(() => import("@/routes/rooms/[id]/page"));
const Search = lazy(() => import("@/routes/search/page"));
const HostCreatePage = lazy(() => import("@/routes/host/create/page"));
const TravelPage = lazy(() => import("@/routes/travel/page"));
const CreateTravelPlanPage = lazy(() => import("@/routes/travel/create/page"));
const LegalPage = lazy(() => import("@/routes/resources/legal/page"));
const Signup = lazy(() => import("@/routes/signup/page"));
const Signin = lazy(() => import("@/routes/signin/page"));
const MarketplacePage = lazy(() => import("@/routes/marketplace/page"));
const ProductDetailsPage = lazy(() => import("@/routes/marketplace/[id]/page"));
const NewDashboard = lazy(() => import("@/routes/dashboard/page"));
const PrivacyPage = lazy(() => import("@/routes/privacy/page"));
const TermsPage = lazy(() => import("@/routes/terms/page"));
const WishlistPage = lazy(() => import("@/routes/wishlist/page"));
const HostOnboardingForm = lazy(() => import("@/features/host/components/RegistrationForm"));
const TravelCommunity = lazy(() => import("@/features/dashboard/components/TravelCommunity").then(module => ({ default: module.TravelCommunity })));

const PeopleHome = lazy(() => import("@/features/people/pages/PeopleHome"));
const PeopleProfile = lazy(() => import("@/features/people/pages/PeopleProfile"));
const BecomeExpert = lazy(() => import("@/features/people/pages/BecomeExpert"));

export default function App() {
    return (
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
                            <Route path="/hosts" element={<HostOnboardingForm />} />
                            <Route path="/rooms" element={<Navigate to="/search" replace />} />
                            <Route path="/rooms/:id" element={<RoomDetails />} />
                            <Route path="/search" element={<Search />} />
                            <Route path="/host/create" element={
                                <HostGuard>
                                    <HostCreatePage />
                                </HostGuard>
                            } />
                            <Route path="/travel" element={<TravelPage />} />
                            <Route path="/travel/create" element={
                                <HostGuard>
                                    <CreateTravelPlanPage />
                                </HostGuard>
                            } />
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
                        </Routes>
                    </Suspense>
                </RootLayout>
            </CountryProvider>
        </BrowserRouter>
    );
}