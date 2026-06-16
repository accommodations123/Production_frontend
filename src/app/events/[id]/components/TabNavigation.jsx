import React, { memo } from "react"

const TabButton = memo(({ tab, activeTab, onClick }) => (
    <button
        onClick={() => onClick(tab)}
        className={`flex-1 min-w-[100px] px-4 py-3 rounded-2xl font-medium capitalize transition-all duration-300 relative ${activeTab === tab
            ? 'text-white bg-accent shadow-lg transform scale-105'
            : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
    >
        {tab}
        {activeTab === tab && (
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-accent rounded-full"></span>
        )}
    </button>
))
TabButton.displayName = "TabButton"

export const TabNavigation = memo(({ activeTab, handleTabClick }) => (
    <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl p-2 border border-white/20">
        <div className="flex flex-wrap">
            {['overview', 'schedule', 'venue'].map((tab) => (
                <TabButton key={tab} tab={tab} activeTab={activeTab} onClick={handleTabClick} />
            ))}
        </div>
    </div>
))
TabNavigation.displayName = "TabNavigation"
