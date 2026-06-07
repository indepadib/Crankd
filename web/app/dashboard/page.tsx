import React from 'react';
import { AnalyticsChart } from '../../components/AnalyticsChart';

export default function DashboardPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight mb-2">Dashboard Overview</h2>
                <p className="text-zinc-400">Welcome back. Here is what's happening at Drift House today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[
                    { label: 'Total Inventory', value: '12', trend: '+2 this week' },
                    { label: 'Active Leads', value: '48', trend: '+12% vs last week' },
                    { label: 'Feed Views', value: '124k', trend: 'Trending Up 🔥' },
                ].map((stat, i) => (
                    <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                        <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider mb-2">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-4xl font-black text-white">{stat.value}</h3>
                            <span className="text-xs font-semibold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                                {stat.trend}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl h-[400px]">
                    <div className="mb-6 flex items-center justify-between">
                        <h3 className="font-bold text-lg">Engagement Overview</h3>
                        <select className="bg-black text-sm text-zinc-400 border border-zinc-800 rounded px-2 py-1">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                        </select>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center bg-black/20 rounded border border-zinc-800 border-dashed">
                        <AnalyticsChart />
                    </div>
                </div>

                <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
                    <h3 className="font-bold text-lg mb-6">Recent Activity</h3>
                    <div className="space-y-6">
                        {[
                            { text: 'New lead from @porsche_fan on 911 GT3', time: '2m ago', icon: '📩' },
                            { text: 'Price drop alert sent for BMW M3', time: '1h ago', icon: '📉' },
                            { text: 'Vehicle "Supra MK4" verified on-chain', time: '3h ago', icon: '⛓️' },
                            { text: 'Inventory sync completed', time: '5h ago', icon: '🔄' },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-sm">{item.icon}</div>
                                <div>
                                    <p className="text-sm text-zinc-200">{item.text}</p>
                                    <p className="text-xs text-zinc-500 mt-1">{item.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-6 py-3 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 transition-colors">
                        View All Activity
                    </button>
                </div>
            </div>
        </div>
    );
}
