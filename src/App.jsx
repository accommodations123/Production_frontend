import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CountryProvider } from "@/context/CountryContext";
import ScrollToTop from "@/components/layout/ScrollToTop";
import RootLayout from "@/app/layout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import HostGuard from "@/components/auth/HostGuard";

// Lazy-loaded pages
const Home = lazy(() => import("@/app/page"));
const Career = lazy(() => import("@/app/career/page"));
const About = lazy(() => import("@/app/about/page"));
const Trust = lazy(() => import("@/app/trust/page"))
const Help = lazy(() => import("@/app/help/page"));
const Contact = lazy(() => import("@/app/contact/page"));
const EventsPage = lazy(() => import("@/app/events/page"));
const EventDetailsPage = lazy(() => import("@/app/events/[id]/page"));
const HostEventPage = lazy(() => import("@/app/events/host/page"));
const Groups = lazy(() => import("@/app/groups/page"));
const CreateGroupPage = lazy(() => import("@/app/groups/create/page"))
const GroupDetailsPage = lazy(() => import("@/app/groups/[id]/page"));
const AddResource = lazy(() => import("@/app/groups/add-resource/page"));
const RoomDetails = lazy(() => import("@/app/rooms/[id]/page"));
const Search = lazy(() => import("@/app/SearchPage"));
const HostCreatePage = lazy(() => import("@/app/host/create/page"));
const TravelPage = lazy(() => import("@/app/resources/travel/page"));
const CommunityPage = lazy(() => import("@/app/resources/community/page"));
const LegalPage = lazy(() => import("@/app/resources/legal/page"));
const Signup = lazy(() => import("@/app/signup/page"));
const Signin = lazy(() => import("@/app/signin/page"));
const SupportPage = lazy(() => import("./components/mentorship/page"));
const MarketplacePage = lazy(() => import("@/app/marketplace/page"));
const ProductDetailsPage = lazy(() => import("@/app/marketplace/[id]/page"));
const ChatPage = lazy(() => import("@/app/ChatPage"));
const NewDashboard = lazy(() => import("@/app/dashboard/NewDashboard"));
const PrivacyPage = lazy(() => import("@/app/privacy/page"));
const TermsPage = lazy(() => import("@/app/terms/page"));
const WishlistPage = lazy(() => import("@/app/wishlist/page"));
const HostOnboardingForm = lazy(() => import("./components/host/Host"));
const TravelCommunity = lazy(() => import("./components/dashboard/TravelCommunity").then(module => ({ default: module.TravelCommunity })));

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
                            <Route path="/chat" element={<ChatPage />} />
                            <Route path="/chat/:id" element={<ChatPage />} />
                            <Route path="/account-v2" element={<NewDashboard />} />
                            <Route path="/events" element={<EventsPage />} />
                            <Route path="/events/host" element={
                                <HostGuard>
                                    <HostEventPage />
                                </HostGuard>
                            } />
                            <Route path="/events/:id" element={<EventDetailsPage />} />
                            <Route path="/groups" element={<Groups />} />
                            <Route path="/groups/create" element={<CreateGroupPage />} />
                            <Route path="/groups/:id" element={<GroupDetailsPage />} />
                            <Route path="/groups/add-resource" element={<AddResource />} />
                            <Route path="/support" element={<SupportPage />} />
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
                            <Route path="/resources/community" element={<CommunityPage />} />
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
                        </Routes>
                    </Suspense>
                </RootLayout>
            </CountryProvider>
        </BrowserRouter>
    );
}