import React from "react"
import { motion } from "framer-motion"
import { CheckCircle } from "lucide-react"

export const SuccessState = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-12 text-center shadow-lg border border-gray-100"
        >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: "#00162d" }}>
                <CheckCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Event Submitted for Review!</h2>
            <p className="text-gray-600">Your event is now under review. We'll notify you once it's approved.</p>
        </motion.div>
    )
}
