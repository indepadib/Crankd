'use client';

import { Activity, Calendar, Zap, ChevronRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

export function DashboardSidebar() {
    return (
        <div className="space-y-6">

            {/* Garage Health Widget */}
            <div className="bg-steel/50 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4 text-signal-orange">
                    <Activity className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Garage Status</h3>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-carbon/50 bg-[url('https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center" />
                            <div>
                                <div className="font-bold text-white text-sm">BMW M3 CSL</div>
                                <div className="text-[10px] text-text-dim">E46 • 2003</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-green-400 font-bold text-sm">98%</div>
                            <div className="text-[10px] text-text-dim">Health</div>
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/5" />

                    <div className="flex items-center justify-between opacity-60">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-carbon/50 bg-[url('https://images.unsplash.com/photo-1619623055909-e33a6933c1eb?q=80&w=2600&auto=format&fit=crop')] bg-cover bg-center" />
                            <div>
                                <div className="font-bold text-white text-sm">Nissan R34</div>
                                <div className="text-[10px] text-text-dim">GT-R • 1999</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-yellow-500 font-bold text-sm">Service</div>
                            <div className="text-[10px] text-text-dim">Due Soon</div>
                        </div>
                    </div>
                </div>

                <button className="w-full mt-4 py-2 text-xs font-bold text-text-dim hover:text-white border border-white/5 hover:border-white/20 rounded-xl transition-all">
                    View Full Garage
                </button>
            </div>

            {/* Upcoming Events */}
            <div className="bg-steel/50 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4 text-blue-400">
                    <Calendar className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Upcoming</h3>
                </div>

                <div className="space-y-3">
                    <div className="group flex gap-3 cursor-pointer">
                        <div className="flex-1">
                            <div className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">Midnight Daikoku Run</div>
                            <div className="text-xs text-text-dim">Sat, Oct 28 • 10:00 PM</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white transition-colors" />
                    </div>
                    <div className="group flex gap-3 cursor-pointer">
                        <div className="flex-1">
                            <div className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors">Cars & Coffee LA</div>
                            <div className="text-xs text-text-dim">Sun, Nov 05 • 7:00 AM</div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white transition-colors" />
                    </div>
                </div>
            </div>

            {/* Suggested */}
            <div className="bg-steel/50 border border-white/5 rounded-3xl p-6">
                <div className="flex items-center gap-2 mb-4 text-purple-400">
                    <UserPlus className="h-5 w-5" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Suggested</h3>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs">LW</div>
                        <div className="text-sm font-bold text-white">LibertyWalk</div>
                    </div>
                    <button className="text-xs font-bold text-signal-orange hover:text-orange-400">Follow</button>
                </div>
            </div>

        </div>
    );
}
