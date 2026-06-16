import React from 'react';
import { motion } from 'framer-motion';

const TextInput = ({
    label,
    type = 'text',
    placeholder,
    icon: Icon,
    value,
    onChange,
    className = '',
    rightElement,
    ...props
}) => {
    return (
        <div className={`flex flex-col space-y-1.5 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-700 ml-1">
                    {label}
                </label>
            )}
            <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="relative flex items-center"
            >
                {Icon && (
                    <div className="absolute left-3 text-gray-400 pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`w-full bg-white/50 border border-gray-200 text-gray-800 text-sm rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all duration-200 placeholder:text-gray-400 ${Icon ? 'pl-10' : 'pl-4'
                        } ${rightElement ? 'pr-20' : 'pr-4'} py-2.5`}
                    {...props}
                />
                {rightElement && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        {rightElement}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default TextInput;
