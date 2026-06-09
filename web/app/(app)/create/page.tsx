'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { MOCK_COMMUNITIES } from '@/lib/constants';
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
    Info,
    Check,
    Clock,
    Shield
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

const PRESET_VIDEOS = [
    {
        name: 'Supra Drift',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-sports-car-drifting-in-a-parking-lot-40439-large.mp4',
        cover: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200&q=80'
    },
    {
        name: 'Singer Porsche',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-porsche-car-driving-on-a-curved-road-41482-large.mp4',
        cover: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=200&q=80'
    },
    {
        name: 'Engine Tuning',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-mechanic-hands-repairing-a-car-engine-40488-large.mp4',
        cover: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=200&q=80'
    },
    {
        name: 'Garage GT-R',
        url: 'https://assets.mixkit.co/videos/preview/mixkit-luxurious-car-parked-in-a-garage-41486-large.mp4',
        cover: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=200&q=80'
    }
];

function CreateFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    const [selectedForm, setSelectedForm] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userVehicles, setUserVehicles] = useState<any[]>([]);

    // General states
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [tags, setTags] = useState('');
    const [imageUrl, setImageUrl] = useState(PRESET_IMAGES[0]);
    const [customImageUrl, setCustomImageUrl] = useState('');

    // Video states
    const [postMediaType, setPostMediaType] = useState<'photo' | 'video'>('photo');
    const [videoUrl, setVideoUrl] = useState('');
    const [customVideoUrl, setCustomVideoUrl] = useState('');
    const [videoUploading, setVideoUploading] = useState(false);

    // Community / Tribe states
    const [communityId, setCommunityId] = useState('');
    const [communityName, setCommunityName] = useState('');
    const [availableCommunities, setAvailableCommunities] = useState<any[]>([]);

    // Load available communities and pre-populate query parameters
    useEffect(() => {
        const defaultCommId = searchParams.get('communityId') || '';
        const defaultCommName = searchParams.get('communityName') || '';
        
        if (defaultCommId) {
            setCommunityId(defaultCommId);
        }
        if (defaultCommName) {
            setCommunityName(decodeURIComponent(defaultCommName));
        }

        const fetchCommunities = async () => {
            let dbCommunities: any[] = [];
            try {
                const { data } = await supabase
                    .from('communities')
                    .select('*');
                if (data) dbCommunities = data;
            } catch (e) {}

            const savedLocal = localStorage.getItem('local-communities');
            const localList = savedLocal ? JSON.parse(savedLocal) : [];

            // Combine DB and local storage
            const combined = [...localList, ...dbCommunities];
            
            // Filter duplicates by name or ID
            const unique = combined.reduce((acc: any[], current) => {
                const exists = acc.find(item => item.name.toLowerCase() === current.name.toLowerCase() || item.id === current.id);
                if (!exists) {
                    return acc.concat([current]);
                }
                return acc;
            }, []);

            setAvailableCommunities(unique);
        };

        fetchCommunities();
    }, [searchParams]);

    // Build Post specific states
    const [chassisCode, setChassisCode] = useState('');
    const [dynoHp, setDynoHp] = useState('');
    const [modList, setModList] = useState('');
    const [modCost, setModCost] = useState('');

    // Listing specific states
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [price, setPrice] = useState('');
    const [mileage, setMileage] = useState('');
    const [location, setLocation] = useState('');
    const [vin, setVin] = useState('');
    const [engine, setEngine] = useState('');
    const [transmission, setTransmission] = useState('Manual');
    const [extColor, setExtColor] = useState('');
    const [intColor, setIntColor] = useState('');
    const [listingMods, setListingMods] = useState('');

    // Convoy specific states
    const [convoyStep, setConvoyStep] = useState(1);
    const [startPoint, setStartPoint] = useState('');
    const [endPoint, setEndPoint] = useState('');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [driverLimit, setDriverLimit] = useState('');
    const [eligibleCars, setEligibleCars] = useState('');
    const [cruiseStyle, setCruiseStyle] = useState('Canyon Run');
    const [pace, setPace] = useState('Spirited');
    const [requiredGear, setRequiredGear] = useState<string[]>([]);

    useEffect(() => {
        const fetchUserVehicles = async () => {
            if (!user) return;
            
            let dbVehicles: any[] = [];
            try {
                const { data } = await supabase
                    .from('vehicles')
                    .select('*')
                    .eq('owner_id', user.id);
                if (data) dbVehicles = data;
            } catch (e) {}

            // Load local vehicles
            const localSaved = localStorage.getItem('local-vehicles');
            const localList = localSaved ? JSON.parse(localSaved) : [];

            const combined = [
                ...localList.filter((v: any) => v.owner_id === user.id),
                ...dbVehicles
            ];
            setUserVehicles(combined);
        };
        fetchUserVehicles();
    }, [user]);

    const handleAutofillListing = (vehicleId: string) => {
        if (!vehicleId) return;
        const selected = userVehicles.find(v => v.id === vehicleId);
        if (!selected) return;

        setMake(selected.make || '');
        setModel(selected.model || '');
        setYear((selected.year || '').toString());
        
        const img = selected.image_url || selected.image || PRESET_IMAGES[0];
        if (PRESET_IMAGES.includes(img)) {
            setImageUrl(img);
            setCustomImageUrl('');
        } else {
            setCustomImageUrl(img);
        }

        // Fetch specs from registry
        const saved = localStorage.getItem(`vehicle-specs-${selected.id}`);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setVin(parsed.vin || '');
                setEngine(parsed.engine || '');
                setTransmission(parsed.transmission || 'Manual');
                setExtColor(parsed.color || '');
                setIntColor(parsed.interiorColor || '');
                setMileage(parsed.mileage || '');
                setListingMods(parsed.mods || '');
            } catch (e) {}
        }
    };

    const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            alert('Please select a valid video file.');
            return;
        }

        if (file.size > 15 * 1024 * 1024) {
            alert('Video file is too large (max 15MB). Please upload a shorter clip.');
            return;
        }

        setVideoUploading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setCustomVideoUrl(reader.result);
                setVideoUrl('');
            }
            setVideoUploading(false);
        };
        reader.onerror = () => {
            alert('Failed to read video file.');
            setVideoUploading(false);
        };
    };

    const handlePublishPost = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to publish.');
            return;
        }

        setLoading(true);
        setError(null);

        const cleanTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        if (communityName && !cleanTags.includes(communityName)) {
            cleanTags.push(communityName);
        }
        
        const finalImg = postMediaType === 'video'
            ? (customVideoUrl.trim() || videoUrl)
            : (customImageUrl.trim() || imageUrl);
        const contentType = postMediaType === 'video' ? 'video' : 'media';

        const richBody = JSON.stringify({
            chassis: chassisCode,
            hp: dynoHp,
            mods: modList,
            cost: modCost,
            text: body
        });

        const userEmail = user.email || 'enthusiast';
        const userUsername = `@${userEmail.split('@')[0]}`;

        const localPost = {
            id: `local-post-${Date.now()}`,
            author_id: user.id,
            title,
            body: richBody,
            image_url: finalImg,
            content_type: contentType,
            tags: cleanTags.length > 0 ? cleanTags : ['Build'],
            community_id: communityId || null,
            community: communityId ? { id: communityId, name: communityName } : null,
            created_at: new Date().toISOString(),
            like_count: 0,
            view_count: 0,
            comment_count: 0,
            author: { id: user.id, username: userUsername, avatar_url: '', garage_rank: 1 }
        };

        try {
            const { error } = await supabase.from('posts').insert({
                author_id: user.id,
                title,
                body: richBody,
                image_url: finalImg,
                content_type: contentType,
                tags: cleanTags.length > 0 ? cleanTags : ['Build'],
                community_id: communityId || null
            });

            if (error) throw error;
        } catch (err: any) {
            console.warn('[Post] DB write failed, saving to local storage:', err.message);
            const saved = localStorage.getItem('local-posts');
            const list = saved ? JSON.parse(saved) : [];
            localStorage.setItem('local-posts', JSON.stringify([localPost, ...list]));
        }

        router.push('/feed');
    };

    const handlePublishListing = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to list a vehicle.');
            return;
        }

        setLoading(true);
        setError(null);

        const finalImg = customImageUrl.trim() || imageUrl;

        const richDescription = JSON.stringify({
            vin,
            engine,
            transmission,
            exteriorColor: extColor,
            interiorColor: intColor,
            mods: listingMods,
            text: body
        });

        const userEmail = user.email || 'enthusiast';
        const userUsername = `@${userEmail.split('@')[0]}`;

        const localListing = {
            id: `local-list-${Date.now()}`,
            seller_id: user.id,
            make,
            model,
            year: parseInt(year),
            price: parseFloat(price),
            mileage: parseInt(mileage),
            location,
            description: richDescription,
            images: [finalImg],
            status: 'active',
            created_at: new Date().toISOString(),
            author: { id: user.id, username: userUsername, avatar_url: '', garage_rank: 1 }
        };

        try {
            const { error } = await supabase.from('listings').insert({
                seller_id: user.id,
                make,
                model,
                year: parseInt(year),
                price: parseFloat(price),
                mileage: parseInt(mileage),
                location,
                description: richDescription,
                images: [finalImg]
            });

            if (error) throw error;
        } catch (err: any) {
            console.warn('[Listing] DB write failed, saving to local storage:', err.message);
            const saved = localStorage.getItem('local-listings');
            const list = saved ? JSON.parse(saved) : [];
            localStorage.setItem('local-listings', JSON.stringify([localListing, ...list]));
        }

        router.push('/marketplace');
    };

    const handlePublishEvent = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to host an event.');
            return;
        }

        if (convoyStep === 1) {
            setConvoyStep(2);
            return;
        }

        setLoading(true);
        setError(null);

        const eventTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        const finalImg = customImageUrl.trim() || imageUrl;
        const formattedDateTime = `${eventDate} • ${eventTime}`;

        const richBody = JSON.stringify({
            location,
            startPoint,
            endPoint,
            dateTime: formattedDateTime,
            driverLimit,
            eligibleCars,
            cruiseStyle,
            pace,
            requiredGear,
            text: body
        });

        const userEmail = user.email || 'enthusiast';
        const userUsername = `@${userEmail.split('@')[0]}`;

        const localEvent = {
            id: `local-post-${Date.now()}`,
            author_id: user.id,
            title,
            body: richBody,
            image_url: finalImg,
            content_type: 'convoy',
            tags: eventTags.length > 0 ? eventTags : ['Convoy', 'Drive'],
            created_at: new Date().toISOString(),
            like_count: 0,
            view_count: 0,
            comment_count: 0,
            author: { id: user.id, username: userUsername, avatar_url: '', garage_rank: 1 }
        };

        try {
            const { error } = await supabase.from('posts').insert({
                author_id: user.id,
                title,
                body: richBody,
                image_url: finalImg,
                content_type: 'convoy',
                tags: eventTags.length > 0 ? eventTags : ['Convoy', 'Drive']
            });

            if (error) throw error;
        } catch (err: any) {
            console.warn('[Event] DB write failed, saving to local storage:', err.message);
            const saved = localStorage.getItem('local-posts');
            const list = saved ? JSON.parse(saved) : [];
            localStorage.setItem('local-posts', JSON.stringify([localEvent, ...list]));
        }

        router.push('/feed');
    };

    const resetForms = () => {
        setSelectedForm(null);
        setConvoyStep(1);
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
        setChassisCode('');
        setDynoHp('');
        setModList('');
        setModCost('');
        setVin('');
        setEngine('');
        setTransmission('Manual');
        setExtColor('');
        setIntColor('');
        setListingMods('');
        setStartPoint('');
        setEndPoint('');
        setEventDate('');
        setEventTime('');
        setDriverLimit('');
        setEligibleCars('');
        setCruiseStyle('Canyon Run');
        setPace('Spirited');
        setRequiredGear([]);
        setCustomImageUrl('');
        setImageUrl(PRESET_IMAGES[0]);
        setPostMediaType('photo');
        setVideoUrl('');
        setCustomVideoUrl('');
        setVideoUploading(false);
    };

    const toggleGear = (item: string) => {
        if (requiredGear.includes(item)) {
            setRequiredGear(requiredGear.filter(g => g !== item));
        } else {
            setRequiredGear([...requiredGear, item]);
        }
    };

    return (
        <div className="space-y-8 max-w-3xl mx-auto pb-12">
            
            {/* Header Row */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1 font-mono">
                        {selectedForm ? 'Create Panel' : 'System Ready'}
                    </p>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                        {selectedForm ? 'Details' : 'Create'}<span className="text-signal-orange">.</span>
                    </h1>
                </div>

                {selectedForm && (
                    <button
                        onClick={resetForms}
                        className="group relative h-10 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center gap-2 hover:border-white/30 transition-all text-xs font-bold text-white uppercase font-mono"
                    >
                        ← Back
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
                                    className="block w-full text-left rounded-3xl bg-[#0a0a0a]/90 border border-white/5 p-6 hover:border-signal-orange/40 hover:shadow-[0_0_25px_rgba(249,115,22,0.06)] transition-all group relative overflow-hidden"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${opt.accent} p-[1px] mb-6`}>
                                        <div className="w-full h-full bg-black/40 rounded-[11px] flex items-center justify-center">
                                            <Icon className="h-5 w-5 text-white" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-black text-white italic tracking-tight mb-2 group-hover:text-signal-orange transition-colors uppercase">
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
                        className="glass-panel p-6 rounded-3xl border border-white/8 space-y-6 shadow-xl"
                    >
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Build Title</label>
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
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Post to Tribe (Optional)</label>
                            <select
                                value={communityId}
                                onChange={e => {
                                    const selectedId = e.target.value;
                                    setCommunityId(selectedId);
                                    const match = availableCommunities.find(c => c.id === selectedId);
                                    setCommunityName(match ? match.name : '');
                                }}
                                className="w-full px-4 py-3 bg-[#0a0a0c] border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-signal-orange/40 font-semibold"
                            >
                                <option value="" className="text-zinc-500">-- None / Post to Global Feed --</option>
                                {availableCommunities.map(c => (
                                    <option key={c.id} value={c.id} className="text-white">
                                        {c.name} ({c.category})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Chassis / Engine Code</label>
                                <input
                                    type="text"
                                    value={chassisCode}
                                    onChange={e => setChassisCode(e.target.value)}
                                    placeholder="e.g. FD3S / 13B-REW"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Dyno Horsepower (WHP)</label>
                                <input
                                    type="text"
                                    value={dynoHp}
                                    onChange={e => setDynoHp(e.target.value)}
                                    placeholder="e.g. 420 WHP"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Mods List (comma separated)</label>
                            <input
                                type="text"
                                value={modList}
                                onChange={e => setModList(e.target.value)}
                                placeholder="Garrett G30-770, HKS Manifold, KW V3"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Modification Cost ($)</label>
                                <input
                                    type="text"
                                    value={modCost}
                                    onChange={e => setModCost(e.target.value)}
                                    placeholder="e.g. 6500"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Tags (comma separated)</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={e => setTags(e.target.value)}
                                    placeholder="BMW, M3, Coilover, Exhaust"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Story & Dyno Targets</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                required
                                rows={5}
                                placeholder="Describe the process, parts used, dyno targets, etc..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none resize-none"
                            />
                        </div>

                        <div className="space-y-4">
                            {/* Photo vs Video Selection Tabs */}
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Media Type</label>
                                <div className="flex gap-2 p-1 bg-white/2 border border-white/5 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setPostMediaType('photo')}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all font-mono ${
                                            postMediaType === 'photo'
                                                ? 'bg-signal-orange text-white shadow-lg shadow-orange-500/10'
                                                : 'text-zinc-500 hover:text-white'
                                        }`}
                                    >
                                        Photo Post
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPostMediaType('video');
                                            if (!videoUrl && !customVideoUrl) {
                                                setVideoUrl(PRESET_VIDEOS[0].url);
                                            }
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all font-mono ${
                                            postMediaType === 'video'
                                                ? 'bg-signal-orange text-white shadow-lg shadow-orange-500/10'
                                                : 'text-zinc-500 hover:text-white'
                                        }`}
                                    >
                                        Video / Vrooq TV Reel
                                    </button>
                                </div>
                            </div>

                            {postMediaType === 'photo' ? (
                                <>
                                    <ImageUpload 
                                        value={customImageUrl} 
                                        onChange={setCustomImageUrl} 
                                        label="Upload Build Photo" 
                                    />
                                    
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase font-mono block">Or select from presets</label>
                                        <div className="flex gap-2 overflow-x-auto py-1">
                                            {PRESET_IMAGES.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setImageUrl(img);
                                                        setCustomImageUrl('');
                                                    }}
                                                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${imageUrl === img && !customImageUrl ? 'border-signal-orange scale-102' : 'border-transparent'}`}
                                                >
                                                    <img src={img} alt="preset" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Upload Reel Video File</label>
                                        <div className="relative border-2 border-dashed border-white/10 hover:border-signal-orange/40 bg-white/2 hover:bg-signal-orange/1 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer overflow-hidden transition-all group">
                                            <input
                                                type="file"
                                                accept="video/*"
                                                onChange={handleVideoFileChange}
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            {customVideoUrl ? (
                                                <div className="space-y-2 text-center z-20">
                                                    <video src={customVideoUrl} className="max-h-48 rounded-xl mx-auto" controls />
                                                    <p className="text-[10px] text-signal-orange font-bold uppercase font-mono">Video Selected</p>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCustomVideoUrl('');
                                                            setVideoUrl(PRESET_VIDEOS[0].url);
                                                        }}
                                                        className="text-[9px] text-red-400 hover:text-red-300 font-bold uppercase font-mono underline relative z-30"
                                                    >
                                                        Remove Video
                                                    </button>
                                                </div>
                                            ) : videoUploading ? (
                                                <div className="text-center py-4 space-y-2 animate-pulse">
                                                    <p className="text-xs text-white font-mono uppercase">Reading video matrix...</p>
                                                </div>
                                            ) : (
                                                <div className="text-center space-y-2 pointer-events-none select-none">
                                                    <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto group-hover:border-signal-orange/30 group-hover:bg-signal-orange/5 transition-colors">
                                                        <Upload className="h-5 w-5 text-zinc-500 group-hover:text-signal-orange transition-colors" />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-white font-bold uppercase tracking-wide">Upload Video File</p>
                                                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5 uppercase">MP4, MOV or WEBM (max 15MB)</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Video URL Input */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Or enter a public Video URL</label>
                                        <input
                                            type="text"
                                            value={customVideoUrl.startsWith('data:') ? '' : customVideoUrl}
                                            onChange={e => {
                                                setCustomVideoUrl(e.target.value);
                                                setVideoUrl('');
                                            }}
                                            placeholder="https://example.com/my-cool-car-video.mp4"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 transition-all font-semibold"
                                        />
                                    </div>

                                    {/* Preset videos selection */}
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase font-mono block">Or select from high-quality presets</label>
                                        <div className="flex gap-2 overflow-x-auto py-1">
                                            {PRESET_VIDEOS.map((vid, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setVideoUrl(vid.url);
                                                        setCustomVideoUrl('');
                                                    }}
                                                    className={`relative w-24 h-14 rounded-lg overflow-hidden border-2 flex-shrink-0 flex flex-col justify-end p-1.5 ${videoUrl === vid.url && !customVideoUrl ? 'border-signal-orange scale-102' : 'border-transparent'}`}
                                                >
                                                    <img src={vid.cover} alt={vid.name} className="absolute inset-0 w-full h-full object-cover opacity-60" />
                                                    <div className="absolute inset-0 bg-black/40" />
                                                    <span className="relative text-[8px] font-bold font-mono text-white uppercase truncate w-full text-left">{vid.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-mono">{error}</div>}

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
                        className="glass-panel p-6 rounded-3xl border border-white/8 space-y-6 shadow-xl"
                    >
                        {/* Pre-fill Selector */}
                        {userVehicles.length > 0 && (
                            <div className="space-y-1.5 p-4 bg-white/2 border border-white/5 rounded-2xl">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Pre-fill Specs from Garage</label>
                                <select
                                    onChange={e => handleAutofillListing(e.target.value)}
                                    defaultValue=""
                                    className="w-full px-3 py-3 bg-[#0a0a0c] border border-white/10 rounded-xl text-white text-xs focus:outline-none"
                                >
                                    <option value="" className="text-zinc-500">-- Select from your Garage Collection --</option>
                                    {userVehicles.map(v => (
                                        <option key={v.id} value={v.id} className="text-white">
                                            {v.year} {v.make} {v.model}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Make</label>
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
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Model</label>
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
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Year</label>
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
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Price ($)</label>
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
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Mileage (mi)</label>
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
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Location</label>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">VIN / Chassis Code</label>
                                <input
                                    type="text"
                                    value={vin}
                                    onChange={e => setVin(e.target.value)}
                                    placeholder="WBA333X..."
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Engine Config</label>
                                <input
                                    type="text"
                                    value={engine}
                                    onChange={e => setEngine(e.target.value)}
                                    placeholder="e.g. 3.2L S54 Inline-6"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Transmission</label>
                                <input
                                    type="text"
                                    value={transmission}
                                    onChange={e => setTransmission(e.target.value)}
                                    placeholder="e.g. 6-Speed Manual"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Exterior Color</label>
                                <input
                                    type="text"
                                    value={extColor}
                                    onChange={e => setExtColor(e.target.value)}
                                    placeholder="e.g. Chalk Grey"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Interior Color</label>
                                <input
                                    type="text"
                                    value={intColor}
                                    onChange={e => setIntColor(e.target.value)}
                                    placeholder="e.g. Black Alcantara"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Upgraded Modifications (comma separated)</label>
                            <input
                                type="text"
                                value={listingMods}
                                onChange={e => setListingMods(e.target.value)}
                                placeholder="KW V3 Coilovers, Brembo brakes, carbon intake"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono font-bold">Narrative Description</label>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                required
                                rows={4}
                                placeholder="Describe vehicle condition, mods, service status..."
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none resize-none font-medium"
                            />
                        </div>

                        <div className="space-y-4">
                            <ImageUpload 
                                value={customImageUrl} 
                                onChange={setCustomImageUrl} 
                                label="Upload Listing Cover Image" 
                            />
                            
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-zinc-500 uppercase font-mono block">Or select from presets</label>
                                <div className="flex gap-2 overflow-x-auto py-1">
                                    {PRESET_IMAGES.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => {
                                                setImageUrl(img);
                                                setCustomImageUrl('');
                                            }}
                                            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${imageUrl === img && !customImageUrl ? 'border-signal-orange' : 'border-transparent'}`}
                                        >
                                            <img src={img} alt="preset" className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-mono">{error}</div>}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-signal-orange text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-signal-orange-dim transition-all active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Creating Listing...' : <>List Vehicle <ArrowRight className="h-4 w-4" /></>}
                        </button>
                    </motion.form>
                )}

                {/* 4. EVENT FORM (2-Step Wizard) */}
                {selectedForm === 'event' && (
                    <motion.form
                        onSubmit={handlePublishEvent}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        className="glass-panel p-6 rounded-3xl border border-white/8 space-y-6 shadow-xl"
                    >
                        {/* Wizard Progress Stepper */}
                        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
                            <span className="text-[9px] font-mono text-signal-orange font-bold uppercase tracking-widest">Host Convoy</span>
                            <span className="text-zinc-600 font-mono text-xs">•</span>
                            <span className="text-xs font-bold text-white font-mono">Step {convoyStep} of 2</span>
                        </div>

                        {convoyStep === 1 ? (
                            /* ── STEP 1: CONVOY ESSENTIALS ── */
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Event Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        required
                                        placeholder="e.g. Angeles Crest Canyon Cruise"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">General Location Hub</label>
                                        <input
                                            type="text"
                                            value={location}
                                            onChange={e => setLocation(e.target.value)}
                                            required
                                            placeholder="e.g. LA, California / Paris, FR"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                        />
                                    </div>

                                    {/* Date & Time Pickers */}
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Date</label>
                                            <input
                                                type="date"
                                                value={eventDate}
                                                onChange={e => setEventDate(e.target.value)}
                                                required
                                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none font-bold"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Meeting Time</label>
                                            <input
                                                type="time"
                                                value={eventTime}
                                                onChange={e => setEventTime(e.target.value)}
                                                required
                                                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <ImageUpload 
                                        value={customImageUrl} 
                                        onChange={setCustomImageUrl} 
                                        label="Upload Event Banner Image" 
                                    />
                                    
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase font-mono block">Or select from presets</label>
                                        <div className="flex gap-2 overflow-x-auto py-1">
                                            {PRESET_IMAGES.map((img, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setImageUrl(img);
                                                        setCustomImageUrl('');
                                                    }}
                                                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 ${imageUrl === img && !customImageUrl ? 'border-signal-orange scale-102' : 'border-transparent'}`}
                                                >
                                                    <img src={img} alt="preset" className="w-full h-full object-cover" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* ── STEP 2: ROUTE, CHECKLIST & RULES ── */
                            <div className="space-y-5 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Starting Point Address</label>
                                        <input
                                            type="text"
                                            value={startPoint}
                                            onChange={e => setStartPoint(e.target.value)}
                                            required
                                            placeholder="Shell Station, La Cañada"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Ending Destination</label>
                                        <input
                                            type="text"
                                            value={endPoint}
                                            onChange={e => setEndPoint(e.target.value)}
                                            required
                                            placeholder="Newcomb's Ranch Peak"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {/* Cruise Style Pills */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Cruise Style</label>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {['Canyon Run', 'Cars & Coffee', 'Track Day', 'Scenic Tour'].map(opt => (
                                                <button
                                                    key={opt}
                                                    type="button"
                                                    onClick={() => setCruiseStyle(opt)}
                                                    className={`py-2 px-1 text-center font-bold text-[9px] rounded-lg border transition-all ${
                                                        cruiseStyle === opt 
                                                            ? 'border-signal-orange bg-signal-orange/10 text-white' 
                                                            : 'border-white/8 bg-white/2 text-zinc-400'
                                                    }`}
                                                >
                                                    {opt}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Pace Intensity Pills */}
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Pace Intensity</label>
                                        <div className="grid grid-cols-3 gap-1">
                                            {[
                                                { label: 'Chill', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5' },
                                                { label: 'Spirited', color: 'border-signal-orange/20 text-signal-orange bg-signal-orange/5' },
                                                { label: 'Hot Laps', color: 'border-red-500/20 text-red-400 bg-red-500/5' }
                                            ].map(opt => (
                                                <button
                                                    key={opt.label}
                                                    type="button"
                                                    onClick={() => setPace(opt.label)}
                                                    className={`py-2 text-center font-bold text-[9px] rounded-lg border transition-all ${
                                                        pace === opt.label 
                                                            ? 'border-white bg-white text-carbon shadow-lg' 
                                                            : opt.color
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Checklist of required gear */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono block">Required gear & safety checklist</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            'Walkie-Talkie (Comms)',
                                            'Toll Pass Active',
                                            'Performance / Winter Tires',
                                            'Full Tank of Gas'
                                        ].map(item => {
                                            const active = requiredGear.includes(item);
                                            return (
                                                <button
                                                    key={item}
                                                    type="button"
                                                    onClick={() => toggleGear(item)}
                                                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-bold transition-all ${
                                                        active 
                                                            ? 'border-signal-orange bg-signal-orange/5 text-white' 
                                                            : 'border-white/8 bg-white/2 text-zinc-400 hover:border-white/15'
                                                    }`}
                                                >
                                                    <div className={`h-4 w-4 rounded border flex items-center justify-center ${active ? 'bg-signal-orange border-signal-orange text-white' : 'border-white/20'}`}>
                                                        {active && <Check className="h-3 w-3" />}
                                                    </div>
                                                    {item}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Driver Limit</label>
                                        <input
                                            type="number"
                                            value={driverLimit}
                                            onChange={e => setDriverLimit(e.target.value)}
                                            placeholder="e.g. 25"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none"
                                        />
                                    </div>
                                    <div className="space-y-1.5 col-span-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Eligible Cars</label>
                                        <input
                                            type="text"
                                            value={eligibleCars}
                                            onChange={e => setEligibleCars(e.target.value)}
                                            placeholder="e.g. All classes / JDM Only"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono font-bold">Event Details & Cruise Rules</label>
                                    <textarea
                                        value={body}
                                        onChange={e => setBody(e.target.value)}
                                        required
                                        rows={3}
                                        placeholder="Rules, speeds, radio frequency PMR channels, rest points, lunch stops..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none resize-none font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-mono">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={tags}
                                        onChange={e => setTags(e.target.value)}
                                        placeholder="CanyonRun, JDM, Porsche, WeekendCruise"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm"
                                    />
                                </div>
                            </div>
                        )}

                        {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-mono">{error}</div>}

                        {/* Navigation buttons */}
                        <div className="flex gap-3 pt-3 border-t border-white/5">
                            {convoyStep === 2 && (
                                <button
                                    type="button"
                                    onClick={() => setConvoyStep(1)}
                                    className="px-5 py-3 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all font-mono"
                                >
                                    Back
                                </button>
                            )}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-3 bg-signal-orange text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-orange-600 transition-all active:scale-[0.98] font-mono"
                            >
                                {loading 
                                    ? 'Processing...' 
                                    : convoyStep === 1 
                                        ? 'Next: Route & Checklist →' 
                                        : 'Publish Convoy Event'}
                            </button>
                        </div>
                    </motion.form>
                )}
            </AnimatePresence>

        </div>
    );
}

export default function CreatePage() {
    return (
        <Suspense fallback={<div className="py-20 text-center text-zinc-500 font-mono uppercase tracking-widest animate-pulse">Loading creation console...</div>}>
            <CreateFormContent />
        </Suspense>
    );
}
