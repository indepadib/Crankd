'use client';
import React from 'react';
import { motion } from 'framer-motion';

export const PhoneMockup = () => {
    return (
        <div className="relative mx-auto border-zinc-900 bg-zinc-950 border-[8px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden ring-1 ring-white/10">
            {/* Dynamic Island / Notch */}
            <div className="absolute top-0 inset-x-0 h-7 bg-black rounded-b-[1.2rem] w-28 mx-auto z-20"></div>

            {/* Status Bar */}
            <div className="flex justify-between px-6 pt-3 items-center text-[10px] text-white font-bold z-10 relative">
                <span>9:41</span>
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                    <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                    <div className="w-4 h-3 border border-white/20 rounded-[2px] relative">
                        <div className="absolute inset-[1px] bg-white rounded-[1px]"></div>
                    </div>
                </div>
            </div>

            {/* Simulated UI Content (The Feed) */}
            <div className="flex-1 bg-black relative overflow-hidden">
                {/* Auto-Scrolling Content */}
                <motion.div
                    animate={{ y: [-600, 0] }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop"
                    }}
                    className="absolute inset-x-0 bottom-0 pb-12"
                    style={{ height: '200%' }} // Double height for loop
                >
                    {/* Gradient Overlay for "Feed" Look */}
                    <div className="h-1/2 w-full relative bg-zinc-900 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <span className="text-8xl">🏎️</span>
                        </div>
                        <div className="absolute bottom-8 left-4 right-4 z-20">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-500"></div>
                                <span className="font-bold text-sm">@DriftKing</span>
                            </div>
                            <p className="text-sm">Testing the new setup on the track. #TrackDay</p>
                        </div>
                    </div>

                    <div className="h-1/2 w-full relative bg-zinc-800 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10"></div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-20">
                            <span className="text-8xl">🔧</span>
                        </div>
                        <div className="absolute bottom-8 left-4 right-4 z-20">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-orange-500"></div>
                                <span className="font-bold text-sm">@MechanicMike</span>
                            </div>
                            <p className="text-sm">Full rebuild done. Ready to fire up.</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-1 inset-x-0 flex justify-center pb-2 z-20">
                <div className="w-1/3 h-1 bg-white/40 rounded-full backdrop-blur-md"></div>
            </div>
        </div>
    );
};
