import React from 'react';
import { motion } from 'framer-motion';

const Button = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    className = '',
    disabled = false,
    ...props
}) => {
    const baseStyles =
        'w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 shadow-md flex items-center justify-center gap-2';

    const variants = {
        primary:
            'bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:shadow-lg hover:from-blue-700 hover:to-violet-700',
        secondary:
            'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900',
        outline:
            'bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50',
        ghost:
            'bg-transparent text-gray-600 hover:bg-gray-100 shadow-none',
    };

    return (
        <motion.button
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                } ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
