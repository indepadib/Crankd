'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Activity,
    Calendar,
    MapPin,
    Share2,
    Shield,
    Zap,
    Gauge,
    Scale,
    GitCommit,
    Wrench,
    Trophy,
    ArrowRightLeft,
    DollarSign,
    X,
    Plus
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';
import { usePreferences } from '@/hooks/usePreferences';
import { ImageUpload } from '@/components/ui/ImageUpload';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function VehicleProfilePage() {
    const params = useParams();
    const vehicleId = params.id as string;
    const { user } = useAuth();
    const { formatCurrency, formatDistance } = usePreferences();

    const [vehicle, setVehicle] = useState<any>(null);
    const [timeline, setTimeline] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Photo Upload States
    const [uploadImg, setUploadImg] = useState('');
    const [uploadTitle, setUploadTitle] = useState('Chassis Gallery Add');
    const [publishingPhoto, setPublishingPhoto] = useState(false);
    const [selectedPhotoUrl, setSelectedPhotoUrl] = useState<string | null>(null);

    const fetchVehicle = useCallback(async () => {
        if (!vehicleId) return;
        setLoading(true);

        try {
            // Fetch vehicle and join profile owner
            const { data, error } = await supabase
                .from('vehicles')
                .select('*, profiles:owner_id(username, avatar_url)')
                .eq('id', vehicleId)
                .maybeSingle();

            let targetVehicle: any = null;

            if (!error && data) {
                targetVehicle = data;
            } else {
                // Check in local vehicles
                const localSaved = localStorage.getItem('local-vehicles');
                const localList = localSaved ? JSON.parse(localSaved) : [];
                const foundLocal = localList.find((v: any) => v.id === vehicleId);
                if (foundLocal) {
                    targetVehicle = foundLocal;
                }
            }

            if (targetVehicle) {
                // Fetch timeline logs from database
                const { data: logs } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('vehicle_id', vehicleId)
                    .order('created_at', { ascending: false });

                const dbLogs = logs || [];

                // Fetch local posts
                const savedLocal = localStorage.getItem('local-posts');
                const localList = savedLocal ? JSON.parse(savedLocal) : [];
                const vehicleLocalPosts = localList.filter((p: any) => p.vehicle_id === vehicleId || p.vehicle?.id === vehicleId);

                const combinedLogs = [...vehicleLocalPosts, ...dbLogs];

                // Remove duplicate IDs from logs
                const uniqueLogs = combinedLogs.reduce((acc: any[], cur) => {
                    if (!acc.some(l => l.id === cur.id)) acc.push(cur);
                    return acc;
                }, []);

                const parsedTimeline = uniqueLogs.map((log: any) => {
                    const isMaintenance = log.content_type === 'maintenance_log' || log.title?.toLowerCase().includes('service');
                    const isMod = log.content_type === 'media' || log.title?.toLowerCase().includes('upgrade') || log.title?.toLowerCase().includes('install');
                    
                    return {
                        id: log.id,
                        type: isMaintenance ? 'maintenance' : isMod ? 'mod' : 'event',
                        title: log.title || 'Build Update',
                        date: new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
                        detail: log.body || 'No description provided.',
                        icon: isMaintenance ? Wrench : isMod ? Zap : Trophy,
                        cost: log.log?.cost_amount || log.cost_amount || null,
                        odometer: log.log?.odometer_reading || log.odometer_reading || null,
                        image_url: log.image_url || log.imageUrl || null
                    };
                });

                let activeSpecs: any = null;
                if (typeof window !== 'undefined') {
                    const saved = localStorage.getItem(`vehicle-specs-${targetVehicle.id}`);
                    if (saved) {
                        try {
                            activeSpecs = JSON.parse(saved);
                        } catch (e) {}
                    }
                }

                // Get owner details
                let ownerUsername = targetVehicle.profiles?.username || 'Chassis Owner';
                if (!data && user) {
                    ownerUsername = user.user_metadata?.username || user.email?.split('@')[0] || 'Chassis Owner';
                }

                setVehicle({
                    id: targetVehicle.id,
                    owner_id: targetVehicle.owner_id,
                    vin: activeSpecs?.vin || targetVehicle.vin || 'WBAXXXXXXXXXXXXXX',
                    year: targetVehicle.year,
                    make: targetVehicle.make,
                    model: targetVehicle.model,
                    trim: activeSpecs?.trim || targetVehicle.trim || 'OEM Spec',
                    health_score: activeSpecs?.healthScore || targetVehicle.health_score || 95,
                    image_url: targetVehicle.image_url || 'https://images.unsplash.com/photo-1605515298946-d062f2e9da53?q=80&w=2600&auto=format&fit=crop',
                    specs: {
                        engine: activeSpecs?.engine || 'OEM Configured',
                        power: activeSpecs?.power ? `${activeSpecs.power} HP` : 'N/A HP',
                        weight: activeSpecs?.weight ? `${activeSpecs.weight} kg` : 'OEM Curb Weight',
                        drivetrain: activeSpecs?.drivetrain || 'N/A',
                        transmission: activeSpecs?.transmission || 'Manual',
                        stage: activeSpecs?.stage || 'Stock',
                        chassisCode: activeSpecs?.chassisCode || 'N/A',
                        color: activeSpecs?.color || 'OEM Spec'
                    },
                    owner: {
                        name: ownerUsername,
                        handle: `@${ownerUsername.toLowerCase().replace(/[^a-z0-9_]/g, '')}`,
                        avatar: ownerUsername[0]?.toUpperCase() || 'C'
                    }
                });

                setTimeline(parsedTimeline.length > 0 ? parsedTimeline : [
                    { id: 99, type: 'transfer', title: 'Ledger Created', date: new Date(targetVehicle.created_at).toLocaleDateString(), detail: 'Vehicle recorded on the Vrooq public database.', icon: ArrowRightLeft }
                ]);
            } else {
                setVehicle(null);
            }
        } catch (err) {
            console.warn('[VehicleProfile] Fetch failed:', err);
            setVehicle(null);
        } finally {
            setLoading(false);
        }
    }, [vehicleId, user]);

    useEffect(() => {
        fetchVehicle();
    }, [fetchVehicle]);

    const handlePublishPhoto = async () => {
        if (!uploadImg || !user || !vehicle) return;
        setPublishingPhoto(true);

        const newPostId = `local-post-${Date.now()}`;
        const newPost = {
            id: newPostId,
            author_id: user.id,
            vehicle_id: vehicle.id,
            title: uploadTitle.trim() || 'Chassis Gallery Add',
            body: `Uploaded new chassis photo for ${vehicle.year} ${vehicle.make} ${vehicle.model}.`,
            image_url: uploadImg,
            content_type: 'media',
            tags: [vehicle.make, vehicle.model, 'Chassis'],
            created_at: new Date().toISOString(),
            like_count: 0,
            view_count: 0,
            comment_count: 0,
            author: { id: user.id, username: `@${user.email?.split('@')[0] || 'driver'}`, avatar_url: '', garage_rank: 1 },
            vehicle: { id: vehicle.id, make: vehicle.make, model: vehicle.model, year: vehicle.year, image_url: vehicle.image_url }
        };

        try {
            const { error } = await supabase.from('posts').insert({
                author_id: user.id,
                vehicle_id: vehicle.id,
                title: uploadTitle.trim() || 'Chassis Gallery Add',
                body: `Uploaded new chassis photo for ${vehicle.year} ${vehicle.make} ${vehicle.model}.`,
                image_url: uploadImg,
                content_type: 'media',
                tags: [vehicle.make, vehicle.model, 'Chassis']
            });

            if (error) throw error;
        } catch (err: any) {
            console.warn('[VehicleProfile] DB write failed for photo, saving locally:', err.message);
            const saved = localStorage.getItem('local-posts');
            const list = saved ? JSON.parse(saved) : [];
            localStorage.setItem('local-posts', JSON.stringify([newPost, ...list]));
        }

        setUploadImg('');
        setUploadTitle('Chassis Gallery Add');
        setPublishingPhoto(false);
        fetchVehicle();
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-zinc-500 font-mono font-bold uppercase tracking-widest animate-pulse">
                Reading chassis telemetry...
            </div>
        );
    }

    if (!vehicle) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto text-signal-orange">
                    <Shield className="h-8 w-8 animate-pulse" />
                </div>
                <h2 className="text-2xl font-black text-white uppercase italic">Vehicle telemetry unavailable</h2>
                <p className="text-sm text-text-dim max-w-sm mx-auto">
                    The chassis record requested was not found or has been purged from the network register.
                </p>
                <Link href="/garage" className="px-6 py-3 bg-signal-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all font-mono">
                    Return to Garage
                </Link>
            </div>
        );
    }

    const isOwner = user && (vehicle.owner_id === user.id || vehicle.id.startsWith('local-'));
    const galleryPhotos = timeline.filter((e: any) => e.image_url);

    return (
        <div className="max-w-7xl mx-auto pb-24 relative px-4">
            
            {/* HERO SECTION */}
            <div className="relative h-[40vh] md:h-[50vh] min-h-[350px] w-full rounded-b-3xl overflow-hidden group border-b border-white/5 bg-[#0a0a0c]">
                <img
                    src={vehicle.image_url}
                    alt={vehicle.model}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-101"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-carbon via-carbon/30 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="bg-signal-orange text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-lg shadow-signal-orange/20 font-mono">
                                    {vehicle.specs.stage} Spec
                                </span>
                                <span className="flex items-center gap-1 text-white/70 text-xs font-mono">
                                    <Shield className="h-4 w-4 text-signal-orange" />
                                    {vehicle.vin}
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase italic drop-shadow-2xl">
                                {vehicle.model}
                            </h1>
                            <p className="text-lg md:text-xl text-white/70 font-light mt-1">
                                {vehicle.year} {vehicle.make}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="flex items-center gap-6"
                        >
                            {/* Health Score Badge */}
                            <div className="h-20 w-20 md:h-24 md:w-24 rounded-full border-4 border-signal-orange bg-carbon/80 backdrop-blur-md flex flex-col items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.3)]">
                                <span className="text-2xl md:text-3xl font-black text-white font-mono">{vehicle.health_score}</span>
                                <span className="text-[9px] uppercase text-signal-orange font-bold font-mono">Health</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6 relative z-10">
                
                {/* LEFT COLUMN: SPECS & ACTIONS */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Owner Card */}
                    <div className="block glass-panel p-6 rounded-2xl border border-white/5">
                        <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3 font-black font-mono">Current Custodian</div>
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-lg bg-steel flex items-center justify-center text-white font-black border border-white/10 text-lg font-mono">
                                {vehicle.owner.avatar}
                            </div>
                            <div>
                                <div className="text-white font-bold text-base leading-none">{vehicle.owner.name}</div>
                                <div className="text-signal-orange text-xs font-bold font-mono mt-1">{vehicle.owner.handle}</div>
                            </div>
                        </div>
                    </div>

                    {/* Specs Grid */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="glass-panel p-6 rounded-2xl border border-white/5"
                    >
                        <h3 className="text-white font-bold uppercase tracking-wider mb-4 flex items-center gap-2 font-mono text-xs">
                            <Activity className="h-4 w-4 text-signal-orange" />
                            Technical Specs Ledger
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            <SpecItem label="Engine" value={vehicle.specs.engine} icon={Zap} />
                            <SpecItem label="Power Output" value={vehicle.specs.power} icon={Gauge} />
                            <SpecItem label="Gearbox" value={vehicle.specs.transmission || 'Manual'} icon={GitCommit} />
                            <SpecItem label="Drivetrain" value={vehicle.specs.drivetrain} icon={Activity} />
                            <SpecItem label="Tuning Stage" value={vehicle.specs.stage || 'Stock'} icon={Shield} />
                            <SpecItem label="Chassis" value={vehicle.specs.chassisCode || 'N/A'} icon={Calendar} />
                            <SpecItem label="Weight" value={vehicle.specs.weight} icon={Scale} />
                            <SpecItem label="Paint Color" value={vehicle.specs.color || 'OEM Spec'} icon={Shield} />
                        </div>
                    </motion.div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3">
                        <button className="w-full py-3.5 bg-white text-carbon font-mono font-black uppercase tracking-wider rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 text-xs">
                            <ArrowRightLeft className="h-4 w-4" />
                            Transfer Ownership
                        </button>
                        <Link href="/create" className="w-full py-3.5 bg-steel border border-white/10 text-white font-mono font-bold uppercase tracking-wider rounded-xl hover:bg-white/5 transition-colors flex items-center justify-center gap-2 text-center text-xs">
                            <DollarSign className="h-4 w-4 text-signal-orange" />
                            List for Sale
                        </Link>
                    </div>
                </div>

                {/* RIGHT COLUMN: GALLERY, UPLOADER, TIMELINE */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Chassis Photo Gallery */}
                    <div className="glass-panel p-6 rounded-2xl border border-white/5">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-4 flex items-center gap-3 italic">
                            <Zap className="h-5 w-5 text-signal-orange" />
                            Chassis Photo Gallery
                        </h2>
                        
                        {galleryPhotos.length === 0 ? (
                            <p className="text-text-dim text-[10px] font-mono uppercase py-4 border border-dashed border-white/5 rounded-xl text-center">No photos uploaded for this chassis yet.</p>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {galleryPhotos.map((photo: any) => (
                                    <div 
                                        key={photo.id} 
                                        onClick={() => setSelectedPhotoUrl(photo.image_url)}
                                        className="aspect-[4/3] rounded-xl overflow-hidden border border-white/5 bg-black/40 hover:border-signal-orange/30 transition-all cursor-pointer relative group"
                                    >
                                        <img src={photo.image_url} alt={photo.title} className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-2.5">
                                            <span className="text-[9px] font-mono font-black text-white truncate w-full">{photo.title}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Upload Photo Section (Only Custodians) */}
                    {isOwner && (
                        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                            <div>
                                <h3 className="text-base font-black text-white uppercase italic tracking-tight flex items-center gap-2">
                                    <Plus className="h-4.5 w-4.5 text-signal-orange" /> Add Car Photo
                                </h3>
                                <p className="text-text-dim text-[10px] uppercase font-bold mt-0.5 font-mono">Upload a new shot of this car to its gallery & timeline</p>
                            </div>
                            
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={uploadTitle}
                                    onChange={e => setUploadTitle(e.target.value)}
                                    placeholder="Photo Description (e.g. Installed new exhaust, Track day fitment)"
                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none focus:border-signal-orange/40 transition-all font-semibold"
                                />
                                
                                <ImageUpload
                                    value={uploadImg}
                                    onChange={setUploadImg}
                                    label="Upload Photo File"
                                />

                                <button
                                    onClick={handlePublishPhoto}
                                    disabled={publishingPhoto || !uploadImg}
                                    className="w-full py-3.5 bg-signal-orange hover:bg-orange-600 text-white font-mono font-bold rounded-xl text-xs uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none"
                                >
                                    {publishingPhoto ? 'Publishing Photo...' : 'Publish to chassis registry'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Provenance Timeline */}
                    <div className="glass-panel p-6 md:p-8 rounded-2xl min-h-[400px] border border-white/5">
                        <h2 className="text-xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-3 italic">
                            <Shield className="h-5 w-5 text-signal-orange" />
                            Provenance Timeline
                        </h2>

                        <motion.div
                            variants={container}
                            initial="hidden"
                            whileInView="show"
                            viewport={{ once: true }}
                            className="space-y-8 relative before:absolute before:inset-y-0 before:left-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent"
                        >
                            {timeline.map((event) => (
                                <motion.div
                                    key={event.id}
                                    variants={item}
                                    className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
                                >
                                    {/* Icon Marker */}
                                    <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 border-carbon bg-steel text-white shadow-xl shadow-black/50 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                        <event.icon className="w-5 h-5 text-signal-orange" />
                                    </div>

                                    {/* Content Card */}
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-5 glass-panel rounded-xl border border-white/5 hover:border-signal-orange/30 transition-all hover:bg-white/5 space-y-2">
                                        <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1">
                                            <span className="font-bold text-white/90 text-sm uppercase font-mono tracking-tight">{event.title}</span>
                                            <time className="font-mono text-[9px] text-text-dim shrink-0">{event.date}</time>
                                        </div>
                                        <p className="text-text-dim text-xs leading-relaxed">{event.detail}</p>
                                        {(event.cost || event.odometer) && (
                                            <div className="flex flex-wrap gap-3 mt-3 pt-2 border-t border-white/5 text-[10px] font-mono font-bold text-signal-orange">
                                                {event.cost !== null && <span>Cost: {formatCurrency(event.cost)}</span>}
                                                {event.odometer !== null && <span>Odometer: {formatDistance(event.odometer)}</span>}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

            </div>

            {/* Photo Zoom Overlay Modal */}
            <AnimatePresence>
                {selectedPhotoUrl && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedPhotoUrl(null)}
                        className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 cursor-pointer"
                    >
                        <button className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:text-signal-orange transition-colors">
                            <X className="h-5 w-5" />
                        </button>
                        <img src={selectedPhotoUrl} alt="Enlarged Chassis View" className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/5" />
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}

function SpecItem({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
    return (
        <div className="p-3 rounded-lg bg-white/5 border border-white/5">
            <div className="flex items-center gap-2 mb-1 text-text-dim text-[10px] uppercase font-mono font-bold">
                <Icon className="h-3 w-3" />
                {label}
            </div>
            <div className="text-white font-bold text-xs">{value}</div>
        </div>
    );
}
