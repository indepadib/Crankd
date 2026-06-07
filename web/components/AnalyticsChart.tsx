import React from 'react';

export const AnalyticsChart = () => {
    // Simple mock SVG chart for visual flair
    // Shows a positive trend line in Crankd orange
    return (
        <svg viewBox="0 0 400 150" className="w-full h-full p-4 overflow-visible">
            {/* Grid Lines */}
            <line x1="0" y1="150" x2="400" y2="150" stroke="#333" strokeWidth="1" />
            <line x1="0" y1="100" x2="400" y2="100" stroke="#333" strokeDasharray="4" strokeWidth="1" opacity="0.5" />
            <line x1="0" y1="50" x2="400" y2="50" stroke="#333" strokeDasharray="4" strokeWidth="1" opacity="0.5" />

            {/* Area Fill */}
            <path
                d="M0,150 L0,120 Q50,90 100,110 T200,80 T300,60 T400,20 L400,150 Z"
                fill="url(#gradient)"
                opacity="0.2"
            />

            {/* Line Graph */}
            <path
                d="M0,120 Q50,90 100,110 T200,80 T300,60 T400,20"
                fill="none"
                stroke="#F97316"
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* Definitions */}
            <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#F97316" stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Data Point Tooltip Mock */}
            <circle cx="200" cy="80" r="4" fill="black" stroke="#F97316" strokeWidth="2" />
        </svg>
    );
};
