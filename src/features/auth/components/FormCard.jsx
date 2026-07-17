import React from 'react';
import { motion } from 'framer-motion';

const FormCard = ({ children, className = '' }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl rounded-[18px] p-5 md:p-8 w-full max-w-md mx-auto ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default FormCard;
