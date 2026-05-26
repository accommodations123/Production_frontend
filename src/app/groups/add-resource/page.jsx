import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import CommunityDetailsForm from '@/components/groups/CommunityDetailsForm';
import { ArrowLeft, Settings, Loader2, Lock } from 'lucide-react';
import { useGetHostProfileQuery } from "@/store/api/hostApi";
import { useGetMeQuery } from "@/store/api/authApi";
import { Button } from "@/components/ui/button";

const AddResourcePage = () => {
    const navigate = useNavigate();
    const { data: userData } = useGetMeQuery();
    const { data: hostProfile, isLoading: isProfileLoading } = useGetHostProfileQuery(undefined, {
        skip: !userData
    });
    const isVerifiedHost = hostProfile?.status === 'approved';

    if (isProfileLoading) {
        return (
            <div className="min-h-screen bg-[#00152d] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#c92a26]" />
            </div>
        )
    }

    if (!isVerifiedHost) {
        const isPending = hostProfile?.status === 'pending';
        return (
            <div className="min-h-screen bg-[#00152d] flex flex-col font-inter">
                <Navbar />
                <main className="flex-grow flex items-center justify-center px-4 pt-32">
                    <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-xl shadow-2xl p-8 text-center backdrop-blur-sm">
                        <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock className="h-8 w-8 text-yellow-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">
                            {isPending ? "Account Verification Pending" : "Host Access Required"}
                        </h2>
                        <p className="text-gray-400 mb-6">
                            {isPending
                                ? "Your host application is currently under review. You can create community resources once your account is approved."
                                : "You need to be an approved host to create a new community resource."
                            }
                        </p>
                        <Button
                            onClick={() => navigate(isPending ? "/groups" : "/hosts")}
                            className="w-full bg-[#c92a26] hover:bg-[#b02420] text-white font-semibold"
                        >
                            {isPending ? "Back to Groups" : "Apply to Become Host"}
                        </Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#00152d] flex flex-col font-inter selection:bg-accent/30">
            <Navbar />

            {/* Premium Header */}
            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 md:px-8 pt-28 pb-20 w-full relative z-20">
                <CommunityDetailsForm />

                {/* Guidelines */}
                {/* <div className="mt-12 p-8 bg-white/5 backdrop-blur-xl rounded-[40px] border border-white/10">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4 font-poppins">Community Guidelines</h4>
                    <ul className="space-y-3">
                        {[
                            "Ensure the resource is beneficial to the community.",
                            "Avoid spam or promotional links unrelated to the group.",
                            "Verify phone numbers before sharing contact resources.",
                            "Make sure file titles are descriptive and clear."
                        ].map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm text-gray-400 font-medium">
                                <span className="text-accent font-black">{i + 1}.</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div> */}
            </main>

            <Footer />
        </div>
    );
};

export default AddResourcePage;
