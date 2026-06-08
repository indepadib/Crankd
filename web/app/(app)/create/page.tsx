'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { 
    Image as ImageIcon, 
    Car, 
    Calendar, 
    ArrowUpRight, 
    X, 
    Upload, 
    Sparkles, 
    ArrowRight,
    MapPin,
    DollarSign,
    Gauge,
    Info
} from 'lucide-react';

const OPTIONS = [
    {
        id: 'post',
        title: 'New Build Post',
        description: 'Share a build update, track day, or media from your garage.',
        icon: ImageIcon,
        accent: 'from-blue-500 to-indigo-600',
        shadow: 'shadow-blue-500/20'
    },
    {
        id: 'listing',
        title: 'List Vehicle',
        description: 'Sell your machine or parts directly to other enthusiasts.',
        icon: Car,
        accent: 'from-orange-500 to-red-600',
        shadow: 'shadow-orange-500/20'
    },
    {
        id: 'event',
        title: 'Host Convoy Event',
        description: 'Organize a canyon run, local car meet, or track day.',
        icon: Calendar,
        accent: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/20'
    }
];

const PRESET_IMAGES = [
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
    'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80',
    'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80',
    'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80'
];

export default function CreatePage() {
    const router = useRouter();
    const { user } = useAuth();
    const [selectedForm, setSelectedForm] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form states
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState('');
    const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0]);

    // Listing specific states
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [price, setPrice] = useState('');
    const [mileage, setMileage] = useState('');
    const [location, setLocation] = useState('');

    const handlePublishPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to publish.');
            return;
        }

        setLoading(true);
        setError(null);

        const cleanTags = tags.split(',').map(t => t.trim()).filter(Boolean);

        try {
            const { error } = await supabase.from('posts').insert({
                author_id: user.id,
                title,
                body,
                image_url: imageUrl,
                content_type: 'media',
                tags: cleanTags.length > 0 ? cleanTags : ['Build']
            });

            if (error) throw error;
            router.push('/feed');
        } catch (err: any) {
            setError(err.message || 'Error publishing post.');
            setLoading(false);
        }
    };

    const handlePublishListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to list a vehicle.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { error } = await supabase.from('listings').insert({
                seller_id: user.id,
                make,
                model,
                year: parseInt(year),
                price: parseFloat(price),
                mileage: parseInt(mileage),
                location,
                description: body,
                images: [imageUrl]
            });

            if (error) throw error;
            router.push('/marketplace');
        } catch (err: any) {
            setError(err.message || 'Error publishing listing.');
            setLoading(false);
        }
    };

    const handlePublishEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to host an event.');
            return;
        }

        setLoading(true);
        setError(null);

        const eventTags = tags.split(',').map(t => t.trim()).filter(Boolean);

        try {
            const { error } = await supabase.from('posts').insert({
                author_id: user.id,
                title,
                body: `Location: ${location}. Description: ${body}`,
                image_url: imageUrl,
                content_type: 'convoy',
                tags: eventTags.length > 0 ? eventTags : ['Convoy', 'Drive']
            });

            if (error) throw error;
            router.push('/feed');
        } catch (err: any) {
            setError(err.message || 'Error hosting event.');
            setLoading(false);
        }
    };

    const resetForms = () => {
        setSelectedForm(null);
        setError(null);
        setTitle('');
        setBody('');
        setTags('');
        setMake('');
        setModel('');
        setYear('');
        setPrice('');
        setMileage('');
        setLocation('');
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto pb-12">
            
            {/* Header Row */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1">
                        {selectedForm ? 'Create Panel' : 'System Ready'}
                    </p>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        {selectedForm ? 'Details' : 'Create'}<span className="text-signal-orange">.</span>
                    </h1>
                </div>

                {selectedForm && (
                    <button
                        onClick={resetForms}
                        className="group relative h-10 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:border-white/30 transition-all text-xs font-bold text-white"
                    >
                        ← Back to Options
                    </button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {/* 1. SELECTION CARDS */}
                {!selectedForm && (
                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6"
                    >
                        {OPTIONS.map(opt => {
                            const Icon = opt.icon;
                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => setSelectedForm(opt.id)}
                                    className="block w-full text-left rounded-3xl bg-[#0a0a0a]/90 border border-white/5 p-6 hover:border-signal-orange/40 hover:shadow-[0_0_20px_rgba(249,115,22,0.08)] transition-all group relative overflow-hidden"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.accent} p-[1px] mb-6`}>
                                        <div className="w-full h-full bg-black/40 rounded-[11px] flex items-center justify-center">
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-white italic tracking-tight mb-2 group-hover:text-signal-orange transition-colors">
                                        {opt.title}
                                    </h3>
                                    <p className="text-xs text-text-dim leading-relaxed">
                                        {opt.description}
                                    </p>
                                    <ArrowUpRight className="absolute top-6 right-6 h-4 w-4 text-white/20 group-hover:text-white transition-colors" />
                                </button>
                            );
                        })}
                    </motion.div>
                )}

                {/* 2. POST FORM */}
                {selectedForm === 'post' && (
                    <motion.form
                        onSubmit={handlePublishPost}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="glass-panel p-6 rounded-3xl border border-white/8 space-y-6"
                    >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Build Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="e.g. HKS Exhaust & Coilover Installation"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 transition-all font-semibold"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Story / Modifications</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                required
                                rows={5}
                                placeholder="Describe the process, parts used, dyno targets, etc..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 transition-all resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={e => setTags(e.target.value)}
                                    placeholder="BMW, M3, Coilover, Exhaust"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 transition-all"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cover Photo Preset</label>
                                <div className="flex gap-2 overflow-x-auto py-1">
                                    {PRESET_IMAGES.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setImageUrl(img)}
                                            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${imageUrl === img ? 'border-signal-orange' : 'border-transparent'}`}
                                        >
                                            <img src={img} alt="preset" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-signal-orange text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-signal-orange-dim transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Publishing...' : <>Publish Post <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </motion.form>
                )}

                {/* 3. LISTING FORM */}
                {selectedForm === 'listing' && (
                    <motion.form
                        onSubmit={handlePublishListing}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="glass-panel p-6 rounded-3xl border border-white/8 space-y-6"
                    >
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Make</label>
                                <input
                                    type="text"
                                    value={make}
                                    onChange={e => setMake(e.target.value)}
                                    required
                                    placeholder="Nissan"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Model</label>
                                <input
                                    type="text"
                                    value={model}
                                    onChange={e => setModel(e.target.value)}
                                    required
                                    placeholder="GT-R R35"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Year</label>
                                <input
                                    type="number"
                                    value={year}
                                    onChange={e => setYear(e.target.value)}
                                    required
                                    placeholder="2012"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Price ($)</label>
                                <input
                                    type="number"
                                    value={price}
                                    onChange={e => setPrice(e.target.value)}
                                    required
                                    placeholder="85000"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Mileage (mi)</label>
                                <input
                                    type="number"
                                    value={mileage}
                                    onChange={e => setMileage(e.target.value)}
                                    required
                                    placeholder="28000"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    required
                                    placeholder="Dubai, UAE"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Description</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                required
                                rows={4}
                                placeholder="Describe vehicle condition, mods, service status..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Listing Cover Image</label>
                            <div className="flex gap-2 overflow-x-auto py-1">
                                {PRESET_IMAGES.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setImageUrl(img)}
                                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${imageUrl === img ? 'border-signal-orange' : 'border-transparent'}`}
                                    >
                                        <img src={img} alt="preset" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-signal-orange text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-signal-orange-dim transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Creating Listing...' : <>List Vehicle <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </motion.form>
                )}

                {/* 4. EVENT FORM */}
                {selectedForm === 'event' && (
                    <motion.form
                        onSubmit={handlePublishEvent}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="glass-panel p-6 rounded-3xl border border-white/8 space-y-6"
                    >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Event Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                placeholder="e.g. Angeles Crest Canyon Cruise"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Meeting Location</label>
                                <input
                                    type="text"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                    required
                                    placeholder="Shell Station, La Cañada"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Tags (e.g. NightRun, Cruise)</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={e => setTags(e.target.value)}
                                    placeholder="CanyonRun, AllWelcome, Supercar"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Event Description & Route</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                required
                                rows={4}
                                placeholder="Detail route, rules, schedules..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Event Cover Photo</label>
                            <div className="flex gap-2 overflow-x-auto py-1">
                                {PRESET_IMAGES.map((img, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setImageUrl(img)}
                                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${imageUrl === img ? 'border-signal-orange' : 'border-transparent'}`}
                                    >
                                        <img src={img} alt="preset" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-signal-orange text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-signal-orange-dim transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Creating Event...' : <>Host Event <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

        </div>
    );
}
