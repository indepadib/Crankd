'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, ArrowLeft, Shield, Bell, ToggleLeft, ToggleRight, Check, User, Globe, Eye, Image } from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/ui/ImageUpload';

export default function SettingsPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Settings Navigation Tab state
    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'alerts'>('profile');

    // Profile Settings States
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');

    // System Settings States
    const [currency, setCurrency] = useState('USD');
    const [unit, setUnit] = useState('mi');

    // Notifications Toggles
    const [revsAlert, setRevsAlert] = useState(true);
    const [commentsAlert, setCommentsAlert] = useState(true);
    const [convoysAlert, setConvoysAlert] = useState(true);

    useEffect(() => {
        if (!user) return;

        const loadProfileSettings = async () => {
            setInitialLoading(true);
            let profileData: any = null;

            // 1. Try Supabase profiles table
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .maybeSingle();

                if (!error && data) {
                    profileData = data;
                }
            } catch (err) {
                console.warn('[Settings] Failed to fetch settings from database:', err);
            }

            // 2. Fallback to localStorage user-profile
            const localProfileKey = `user-profile-${user.id}`;
            const localSaved = localStorage.getItem(localProfileKey);
            if (localSaved) {
                try {
                    const parsed = JSON.parse(localSaved);
                    profileData = { ...profileData, ...parsed };
                } catch (e) {}
            }

            // 3. Fallback to auth metadata / email
            const fallbackUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'driver';
            const fallbackFullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Driver';

            setUsername(profileData?.username || fallbackUsername);
            setFullName(profileData?.full_name || fallbackFullName);
            setBio(profileData?.bio || 'Car enthusiast • Builder • Explorer');
            setAvatarUrl(profileData?.avatar_url || '');
            setCoverUrl(profileData?.cover_url || '');
            setCurrency(profileData?.currency || 'USD');
            setUnit(profileData?.measurement_unit || 'mi');

            // Notification local state
            const localAlertsKey = `user-alerts-${user.id}`;
            const savedAlerts = localStorage.getItem(localAlertsKey);
            if (savedAlerts) {
                try {
                    const parsed = JSON.parse(savedAlerts);
                    setRevsAlert(parsed.revs !== false);
                    setCommentsAlert(parsed.comments !== false);
                    setConvoysAlert(parsed.convoys !== false);
                } catch (e) {}
            }

            setInitialLoading(false);
        };

        loadProfileSettings();
    }, [user]);

    const handleSaveSettings = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);
        setSuccess(false);

        const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
        if (!cleanUsername) {
            setError('Username cannot be empty and can only contain letters, numbers, and underscores.');
            setLoading(false);
            return;
        }

        const profileUpdate = {
            username: cleanUsername,
            full_name: fullName.trim(),
            avatar_url: avatarUrl,
            cover_url: coverUrl,
            bio: bio.trim(),
            currency,
            measurement_unit: unit,
            updated_at: new Date().toISOString()
        };

        // Save locally for offline-resilience
        const localProfileKey = `user-profile-${user.id}`;
        localStorage.setItem(localProfileKey, JSON.stringify(profileUpdate));

        const localAlertsKey = `user-alerts-${user.id}`;
        localStorage.setItem(localAlertsKey, JSON.stringify({
            revs: revsAlert,
            comments: commentsAlert,
            convoys: convoysAlert
        }));

        // Try DB update
        try {
            const { error: dbError } = await supabase
                .from('profiles')
                .update({
                    username: cleanUsername,
                    full_name: fullName.trim(),
                    avatar_url: avatarUrl,
                    cover_url: coverUrl,
                    bio: bio.trim(),
                    currency,
                    measurement_unit: unit
                })
                .eq('id', user.id);

            if (dbError) throw dbError;
        } catch (err: any) {
            console.warn('[Settings] Failed to save profile to database, using local backup:', err.message);
        }

        setLoading(false);
        setSuccess(true);

        // Redirect back to profile page after 1.2 seconds
        setTimeout(() => {
            router.push('/profile');
        }, 1200);
    };

    if (initialLoading) {
        return <div className="py-40 text-center text-zinc-500 font-mono uppercase tracking-widest animate-pulse">Initializing Control Panel...</div>;
    }

    return (
        <div className="max-w-6xl mx-auto pb-32 space-y-8 relative px-4">

            {/* Success Toast */}
            <AnimatePresence>
                {success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider rounded-xl shadow-xl backdrop-blur-md glow-orange-sm animate-pulse"
                    >
                        <Check className="h-4 w-4 text-emerald-400" />
                        Driver telemetry synced successfully
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Top Bar Navigation */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/profile')}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all text-white active:scale-95"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <p className="text-text-dim text-[10px] font-bold uppercase tracking-wider font-mono">Control Room</p>
                        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">
                            <Settings className="h-6 w-6 text-signal-orange" /> Settings
                        </h1>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COLUMN: Navigation Tabs & Forms (lg:col-span-7) */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* Settings Navigation Tabs */}
                    <div className="flex gap-2 p-1 bg-black/40 border border-white/5 rounded-2xl select-none">
                        <button
                            type="button"
                            onClick={() => setActiveTab('profile')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold font-mono uppercase transition-all tracking-wider ${activeTab === 'profile' ? 'bg-signal-orange text-white glow-orange-sm' : 'text-text-dim hover:text-white hover:bg-white/5'}`}
                        >
                            <User className="h-4 w-4" /> Credentials
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('preferences')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold font-mono uppercase transition-all tracking-wider ${activeTab === 'preferences' ? 'bg-signal-orange text-white glow-orange-sm' : 'text-text-dim hover:text-white hover:bg-white/5'}`}
                        >
                            <Globe className="h-4 w-4" /> Preferences
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab('alerts')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold font-mono uppercase transition-all tracking-wider ${activeTab === 'alerts' ? 'bg-signal-orange text-white glow-orange-sm' : 'text-text-dim hover:text-white hover:bg-white/5'}`}
                        >
                            <Bell className="h-4 w-4" /> Alerts
                        </button>
                    </div>

                    <form onSubmit={handleSaveSettings} className="space-y-6">
                        
                        {/* TAB 1: PROFILE / CREDENTIALS */}
                        {activeTab === 'profile' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel p-6 rounded-3xl border border-white/5 space-y-5"
                            >
                                <h3 className="text-white font-bold uppercase tracking-wider text-xs font-mono border-b border-white/5 pb-2">Driver Credentials</h3>
                                
                                <div className="space-y-4">
                                    <ImageUpload 
                                        value={avatarUrl} 
                                        onChange={setAvatarUrl} 
                                        label="Driver Avatar Photo" 
                                    />
                                    <ImageUpload 
                                        value={coverUrl} 
                                        onChange={setCoverUrl} 
                                        label="Garage Cover Banner" 
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Username</label>
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            required
                                            placeholder="driver_name"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 transition-all font-semibold font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Full Name</label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={e => setFullName(e.target.value)}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 transition-all font-semibold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Driver Bio & Manifesto</label>
                                    <textarea
                                        value={bio}
                                        onChange={e => setBio(e.target.value)}
                                        rows={3}
                                        placeholder="Describe your garage style, build goals, and track focus..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 transition-all font-semibold resize-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 2: SYSTEM PREFERENCES */}
                        {activeTab === 'preferences' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel p-6 rounded-3xl border border-white/5 space-y-5"
                            >
                                <h3 className="text-white font-bold uppercase tracking-wider text-xs font-mono border-b border-white/5 pb-2">Measurement Prefs</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Currency preference</label>
                                        <select
                                            value={currency}
                                            onChange={e => setCurrency(e.target.value)}
                                            className="w-full px-3 py-3 bg-[#0a0a0c] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-signal-orange/40 font-semibold"
                                        >
                                            <option value="USD">USD ($) - US Dollar</option>
                                            <option value="EUR">EUR (€) - Euros</option>
                                            <option value="AED">AED (د.إ) - Dirhams</option>
                                            <option value="GBP">GBP (£) - British Pounds</option>
                                            <option value="JPY">JPY (¥) - Japanese Yen</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Distance metrics</label>
                                        <select
                                            value={unit}
                                            onChange={e => setUnit(e.target.value)}
                                            className="w-full px-3 py-3 bg-[#0a0a0c] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-signal-orange/40 font-semibold"
                                        >
                                            <option value="mi">Miles (mi)</option>
                                            <option value="km">Kilometers (km)</option>
                                        </select>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* TAB 3: ALERTS */}
                        {activeTab === 'alerts' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-panel p-6 rounded-3xl border border-white/5 space-y-5"
                            >
                                <h3 className="text-white font-bold uppercase tracking-wider text-xs font-mono border-b border-white/5 pb-2 flex items-center gap-2">
                                    <Bell className="h-4 w-4 text-signal-orange" /> Telemetry alerts
                                </h3>
                                
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold text-xs font-mono">ENGINE REVS (Likes)</h4>
                                            <p className="text-[10px] text-text-dim mt-0.5">Notify when builds or updates get double-tap revved</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setRevsAlert(!revsAlert)}
                                            className="transition-all active:scale-95"
                                        >
                                            {revsAlert ? (
                                                <ToggleRight className="h-8 w-8 text-signal-orange" />
                                            ) : (
                                                <ToggleLeft className="h-8 w-8 text-zinc-600" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="h-[1px] bg-white/5" />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold text-xs font-mono">COMMENTARY METRICS</h4>
                                            <p className="text-[10px] text-text-dim mt-0.5">Alert on replies to garage logs and specs questions</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setCommentsAlert(!commentsAlert)}
                                            className="transition-all active:scale-95"
                                        >
                                            {commentsAlert ? (
                                                <ToggleRight className="h-8 w-8 text-signal-orange" />
                                            ) : (
                                                <ToggleLeft className="h-8 w-8 text-zinc-600" />
                                            )}
                                        </button>
                                    </div>

                                    <div className="h-[1px] bg-white/5" />

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-white font-bold text-xs font-mono">CONVOY UPDATES</h4>
                                            <p className="text-[10px] text-text-dim mt-0.5">Updates on routes and meetings RSVPs in neighborhood</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setConvoysAlert(!convoysAlert)}
                                            className="transition-all active:scale-95"
                                        >
                                            {convoysAlert ? (
                                                <ToggleRight className="h-8 w-8 text-signal-orange" />
                                            ) : (
                                                <ToggleLeft className="h-8 w-8 text-zinc-600" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-mono">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-signal-orange text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50 font-mono uppercase tracking-widest shadow-lg shadow-orange-600/15"
                        >
                            {loading ? 'Syncing telemetry...' : <>Save system configuration <Save className="h-4 w-4" /></>}
                        </button>

                    </form>
                </div>

                {/* RIGHT COLUMN: Real-Time Preview (lg:col-span-5) */}
                <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-8">
                    <div className="flex items-center gap-2 mb-2 text-zinc-500">
                        <Eye className="h-4 w-4" />
                        <span className="text-[10px] font-bold font-mono uppercase tracking-wider">Live Profile Card Preview</span>
                    </div>

                    {/* Live Preview Card */}
                    <div className="glass-panel rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative w-full aspect-[1.8] md:aspect-[2.2] bg-[#0c0c0e]">
                        <div className="h-1/2 w-full relative overflow-hidden bg-white/5">
                            {coverUrl ? (
                                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-r from-signal-orange/10 to-orange-700/10 flex items-center justify-center text-[10px] font-mono text-zinc-600">No banner cover selected</div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-black/10 to-transparent" />
                        </div>
                        <div className="absolute bottom-4 left-6 right-6 flex items-end gap-4">
                            <div className="relative shrink-0">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="Avatar Preview" className="w-16 h-16 rounded-2xl object-cover border border-signal-orange/30 shadow-md bg-zinc-900" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-signal-orange to-orange-700 flex items-center justify-center text-2xl font-black text-white shadow-lg">
                                        {username ? username[0]?.toUpperCase() : 'D'}
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-sm font-black text-white truncate font-mono">@{username || 'driver'}</span>
                                    <Shield className="h-3.5 w-3.5 text-blue-400 shrink-0" />
                                </div>
                                <p className="text-zinc-400 font-bold text-[10px] truncate leading-none mt-0.5">{fullName || 'Enthusiast'}</p>
                                <p className="text-text-dim text-[10px] line-clamp-1 mt-1.5 leading-relaxed">{bio || 'Manifesto description...'}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
}
