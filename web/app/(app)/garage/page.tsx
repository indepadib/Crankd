'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Car, 
    Plus, 
    Shield, 
    Wrench, 
    BarChart3, 
    ChevronRight, 
    X, 
    FileText, 
    Check, 
    AlertCircle, 
    ArrowUpRight,
    Paperclip,
    Trash2,
    Calendar,
    Gauge,
    DollarSign,
    Layers,
    Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

const PRESET_VEHICLE_IMAGES = [
    { name: 'M3 Black', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80' },
    { name: 'Singer 911', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80' },
    { name: 'JDM Supra', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=600&q=80' },
    { name: 'GT-R R35', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=600&q=80' },
    { name: '488 Pista', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&q=80' }
];

const MOCK_VEHICLES = [
    {
        id: 'mock-1',
        make: 'BMW',
        model: 'M3 Competition',
        year: 2019,
        health_score: 98,
        color: 'Individual Frozen Black',
        image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80',
        logs: 14,
        mods: 8,
        verified: true,
    },
    {
        id: 'mock-2',
        make: 'Porsche',
        model: '911 GT3',
        year: 2022,
        health_score: 100,
        color: 'Guards Red',
        image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80',
        logs: 6,
        mods: 2,
        verified: true,
    },
];

export default function GaragePage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [activeVehicle, setActiveVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Active Vehicle Logs state
    const [activeLogs, setActiveLogs] = useState<any[]>([]);
    
    // Modal state (Add Vehicle)
    const [showModal, setShowModal] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    
    // Form Inputs: Vehicle
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [selectedImage, setSelectedImage] = useState(PRESET_VEHICLE_IMAGES[0].url);
    const [customImage, setCustomImage] = useState('');

    // Rich specs states
    const [vin, setVin] = useState('');
    const [trim, setTrim] = useState('');
    const [color, setColor] = useState('');
    const [engine, setEngine] = useState('');
    const [power, setPower] = useState('');
    const [torque, setTorque] = useState('');
    const [weight, setWeight] = useState('');
    const [drivetrain, setDrivetrain] = useState('RWD');
    const [transmission, setTransmission] = useState('Manual');
    const [stage, setStage] = useState('Stock');
    const [chassisCode, setChassisCode] = useState('');
    const [interiorColor, setInteriorColor] = useState('');
    const [mileage, setMileage] = useState('');

    const [modalError, setModalError] = useState<string | null>(null);
    const [modalLoading, setModalLoading] = useState(false);

    // Modal state (Add Log)
    const [showLogModal, setShowLogModal] = useState(false);
    const [logTitle, setLogTitle] = useState('');
    const [logType, setLogType] = useState('maintenance');
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [logCost, setLogCost] = useState('');
    const [logOdometer, setLogOdometer] = useState('');
    const [logDescription, setLogDescription] = useState('');
    const [attachedFile, setAttachedFile] = useState<any>(null);
    const [logError, setLogError] = useState<string | null>(null);
    const [logLoading, setLogLoading] = useState(false);

    const loadActiveLogs = useCallback(async (vehicleId: string) => {
        if (!vehicleId) return;
        try {
            const { data, error } = await supabase
                .from('maintenance_logs')
                .select('*')
                .eq('vehicle_id', vehicleId)
                .order('occurred_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                setActiveLogs(data);
            } else {
                // Default fallback logs for look & feel
                setActiveLogs([
                    { id: 'm-1', occurred_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), title: 'Oil Change & Filter (Vidange)', cost_amount: 120, service_type: 'maintenance', description: 'Used Motul 5W40 and OEM Filter. Self-serviced in garage.' },
                    { id: 'm-2', occurred_at: new Date(Date.now() - 3600000 * 24 * 35).toISOString(), title: 'Brembo Brake Upgrade', cost_amount: 1850, service_type: 'modification', description: 'Installed Front Brembo 6-Pot Calipers & Slotted Rotors. [Attached: invoice_brembo.pdf]' },
                    { id: 'm-3', occurred_at: new Date(Date.now() - 3600000 * 24 * 90).toISOString(), title: 'Changement d\'amortisseurs', cost_amount: 1400, service_type: 'repair', description: 'Replaced leaky front shocks with Bilstein B8 dampers.' }
                ]);
            }
        } catch (e) {
            console.warn('[Garage] Failed to fetch logs, falling back:', e);
            setActiveLogs([
                { id: 'm-1', occurred_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(), title: 'Oil Change & Filter (Vidange)', cost_amount: 120, service_type: 'maintenance', description: 'Used Motul 5W40 and OEM Filter. Self-serviced in garage.' },
                { id: 'm-2', occurred_at: new Date(Date.now() - 3600000 * 24 * 35).toISOString(), title: 'Brembo Brake Upgrade', cost_amount: 1850, service_type: 'modification', description: 'Installed Front Brembo 6-Pot Calipers & Slotted Rotors. [Attached: invoice_brembo.pdf]' },
                { id: 'm-3', occurred_at: new Date(Date.now() - 3600000 * 24 * 90).toISOString(), title: 'Changement d\'amortisseurs', cost_amount: 1400, service_type: 'repair', description: 'Replaced leaky front shocks with Bilstein B8 dampers.' }
            ]);
        }
    }, []);

    const loadVehicles = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                const parsed = data.map(v => ({
                    ...v,
                    health_score: 98,
                    logs: 0,
                    mods: 0,
                    verified: false
                }));
                setVehicles(parsed);
                setActiveVehicle(parsed[0]);
            } else {
                setVehicles(MOCK_VEHICLES);
                setActiveVehicle(MOCK_VEHICLES[0]);
            }
        } catch (err) {
            console.warn('[Garage] Fetch failed, using mock data:', err);
            setVehicles(MOCK_VEHICLES);
            setActiveVehicle(MOCK_VEHICLES[0]);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    useEffect(() => {
        if (activeVehicle?.id) {
            loadActiveLogs(activeVehicle.id);
        }
    }, [activeVehicle, loadActiveLogs]);

    const handleAddVehicle = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (wizardStep === 1) {
            setWizardStep(2);
            return;
        }

        setModalLoading(true);
        setModalError(null);

        const finalImage = customImage.trim() || selectedImage;

        try {
            const { data, error } = await supabase.from('vehicles').insert({
                owner_id: user.id,
                make,
                model,
                year: parseInt(year),
                image_url: finalImage
            }).select();

            if (error) throw error;

            if (data && data[0]) {
                const newId = data[0].id;
                // Store rich metadata specs in localStorage registry
                const richSpecs = {
                    vin: vin || 'WBAXXXXXXXXXXXXXX',
                    trim: trim || 'OEM Spec',
                    color: color || 'OEM Color',
                    engine: engine || 'Naturally Aspirated',
                    power: power || 'N/A',
                    torque: torque || 'N/A',
                    weight: weight || 'N/A',
                    drivetrain: drivetrain || 'RWD',
                    transmission: transmission || 'Manual',
                    stage: stage || 'Stock',
                    chassisCode: chassisCode || 'N/A',
                    interiorColor: interiorColor || 'N/A',
                    mileage: mileage || 'N/A'
                };
                localStorage.setItem(`vehicle-specs-${newId}`, JSON.stringify(richSpecs));
            }

            // Close and reset
            setShowModal(false);
            setWizardStep(1);
            setMake('');
            setModel('');
            setYear('');
            setVin('');
            setTrim('');
            setColor('');
            setEngine('');
            setPower('');
            setTorque('');
            setWeight('');
            setDrivetrain('RWD');
            setTransmission('Manual');
            setStage('Stock');
            setChassisCode('');
            setInteriorColor('');
            setMileage('');
            setCustomImage('');
            
            await loadVehicles();
        } catch (err: any) {
            setModalError(err.message || 'Error inserting vehicle.');
        } finally {
            setModalLoading(false);
        }
    };

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !activeVehicle) return;

        setLogLoading(true);
        setLogError(null);

        try {
            const attachmentInfo = attachedFile ? ` [Attached Invoice: ${attachedFile.name}]` : '';
            const fullDescription = `${logDescription}${attachmentInfo}`;

            const { error } = await supabase.from('maintenance_logs').insert({
                vehicle_id: activeVehicle.id,
                performed_by_user_id: user.id,
                occurred_at: new Date(logDate).toISOString(),
                service_type: logType,
                title: logTitle,
                description: fullDescription,
                cost_amount: logCost ? parseFloat(logCost) : null,
                odometer_reading: logOdometer ? parseInt(logOdometer) : null,
                is_verified: true
            });

            if (error) throw error;

            // Reset & Close
            setShowLogModal(false);
            setLogTitle('');
            setLogType('maintenance');
            setLogDate(new Date().toISOString().split('T')[0]);
            setLogCost('');
            setLogOdometer('');
            setLogDescription('');
            setAttachedFile(null);

            await loadActiveLogs(activeVehicle.id);
        } catch (err: any) {
            setLogError(err.message || 'Error saving log.');
        } finally {
            setLogLoading(false);
        }
    };

    const handleFileSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAttachedFile({
                name: file.name,
                size: (file.size / 1024).toFixed(1) + ' KB'
            });
        }
    };

    // Load active specs from registry
    let activeSpecs: any = null;
    if (activeVehicle && typeof window !== 'undefined') {
        const saved = localStorage.getItem(`vehicle-specs-${activeVehicle.id}`);
        if (saved) {
            try {
                activeSpecs = JSON.parse(saved);
            } catch (e) {}
        }
    }

    // Quick suggestions preset list
    const SUGGESTIONS = [
        { label: 'Oil Change / Vidange', type: 'maintenance' },
        { label: 'Shock Absorber Swap', type: 'repair' },
        { label: 'Brembo Brakes Upgrade', type: 'modification' },
        { label: 'Brake Pad Change', type: 'maintenance' },
        { label: 'Spark Plugs Replace', type: 'maintenance' },
        { label: 'New Tires Fitting', type: 'maintenance' }
    ];

    return (
        <div className="space-y-8 relative pb-12">
            
            {/* Header */}
            <div className="flex items-end justify-between">
                <div>
                    <p className="text-text-dim text-sm font-bold uppercase tracking-wider mb-1 font-mono">Your Collection</p>
                    <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">The Garage<span className="text-signal-orange">.</span></h1>
                </div>
                <button 
                    onClick={() => {
                        setWizardStep(1);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-5 py-3 bg-signal-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-orange-600/10"
                >
                    <Plus className="h-4 w-4" />
                    Register Vehicle
                </button>
            </div>

            {loading ? (
                <div className="py-20 text-center text-zinc-500 font-bold font-mono uppercase tracking-widest animate-pulse">
                    Scanning Garage Telemetry...
                </div>
            ) : (
                <>
                    {/* Vehicle Selector */}
                    <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                        {vehicles.map(v => (
                            <motion.button
                                key={v.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveVehicle(v)}
                                className={`flex-shrink-0 w-64 rounded-2xl border p-4 text-left transition-all relative overflow-hidden group ${
                                    activeVehicle?.id === v.id 
                                        ? 'border-signal-orange/60 bg-signal-orange/5 shadow-[0_0_25px_rgba(249,115,22,0.1)]' 
                                        : 'border-white/8 bg-steel/40 hover:border-white/20'
                                }`}
                            >
                                {/* Holographic Refraction Sweep Effect */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full ease-out" style={{ transitionDuration: '1s' }} />

                                <div className="aspect-video rounded-xl overflow-hidden mb-3 border border-white/5">
                                    <img src={v.image_url || v.image} alt={v.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="truncate pr-2">
                                        <p className="text-white font-black text-sm truncate uppercase tracking-tight">{v.year} {v.model}</p>
                                        <p className="text-text-dim text-xs font-semibold">{v.make}</p>
                                    </div>
                                    {v.verified && (
                                        <div className="flex items-center gap-1 text-[9px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-full shrink-0">
                                            <Shield className="h-2.5 w-2.5" /> VERIFIED
                                        </div>
                                    )}
                                </div>
                            </motion.button>
                        ))}

                        {/* Add Vehicle card link */}
                        <button 
                            onClick={() => {
                                setWizardStep(1);
                                setShowModal(true);
                            }}
                            className="flex-shrink-0 w-64 rounded-2xl border border-dashed border-white/10 hover:border-signal-orange/40 transition-all flex flex-col items-center justify-center gap-2 text-text-dim hover:text-signal-orange min-h-[160px] bg-white/2 hover:bg-signal-orange/2"
                        >
                            <Plus className="h-6 w-6" />
                            <span className="text-xs uppercase font-mono font-bold tracking-wider">Register Vehicle</span>
                        </button>
                    </div>

                    {/* Active Vehicle Detail */}
                    {activeVehicle && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                            
                            {/* Main Display & Spec Wall */}
                            <div className="lg:col-span-2 rounded-3xl bg-steel border border-white/8 overflow-hidden flex flex-col justify-between shadow-xl">
                                <div>
                                    <div className="aspect-[16/9] md:aspect-video relative overflow-hidden group">
                                        <img 
                                            src={activeVehicle.image_url || activeVehicle.image} 
                                            alt={activeVehicle.model} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102" 
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e10] via-black/30 to-transparent" />
                                        
                                        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                                            <div>
                                                <p className="text-white/60 text-xs font-mono uppercase tracking-wider mb-1">
                                                    {activeVehicle.year} • {activeSpecs?.color || activeVehicle.color || 'OEM Paint'} • {activeSpecs?.trim || activeVehicle.trim || 'OEM Trim'}
                                                </p>
                                                <h2 className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter leading-none">
                                                    {activeVehicle.make} {activeVehicle.model}
                                                </h2>
                                            </div>
                                            
                                            <Link 
                                                href={`/vehicle/${activeVehicle.id}`}
                                                className="px-4 py-2.5 bg-signal-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-orange-600/20 active:scale-95 flex items-center gap-1"
                                            >
                                                Open Ledger <ChevronRight className="h-3 w-3" />
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Glassmorphic Stats Row */}
                                    <div className="p-6 grid grid-cols-3 gap-4 border-b border-white/5 bg-carbon/20">
                                        {[
                                            { label: 'Health Score', value: `${activeVehicle.health_score || 98}%`, icon: BarChart3, color: 'text-emerald-400' },
                                            { label: 'Service Logs', value: (activeLogs.length).toString(), icon: Wrench, color: 'text-blue-400' },
                                            { label: 'Mods Installed', value: activeSpecs?.stage && activeSpecs.stage !== 'Stock' ? 'Yes' : 'OEM', icon: Car, color: 'text-signal-orange' },
                                        ].map(stat => (
                                            <div key={stat.label} className="text-center p-3.5 bg-white/2 border border-white/5 rounded-2xl">
                                                <stat.icon className={`h-4 w-4 mx-auto mb-1.5 ${stat.color}`} />
                                                <p className="text-xl font-black text-white">{stat.value}</p>
                                                <p className="text-[10px] text-text-dim uppercase tracking-wider mt-0.5 font-semibold font-mono">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Tech Spec Wall */}
                                    <div className="p-6 space-y-4">
                                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest font-mono">Technical Spec Sheet</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                <span className="text-[9px] text-zinc-500 uppercase font-mono block">Engine Code/Layout</span>
                                                <span className="text-xs font-bold text-white block truncate">{activeSpecs?.engine || 'OEM Configured'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                <span className="text-[9px] text-zinc-500 uppercase font-mono block">Power Output</span>
                                                <span className="text-xs font-bold text-white block truncate">
                                                    {activeSpecs?.power ? `${activeSpecs.power} HP` : 'N/A'}
                                                    {activeSpecs?.torque ? ` / ${activeSpecs.torque} Nm` : ''}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                <span className="text-[9px] text-zinc-500 uppercase font-mono block">Gearbox Type</span>
                                                <span className="text-xs font-bold text-white block truncate">{activeSpecs?.transmission || 'Manual'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                <span className="text-[9px] text-zinc-500 uppercase font-mono block">Drivetrain</span>
                                                <span className="text-xs font-bold text-white block truncate">{activeSpecs?.drivetrain || 'RWD'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                <span className="text-[9px] text-zinc-500 uppercase font-mono block">Tuning Stage</span>
                                                <span className="text-xs font-bold text-white block truncate">{activeSpecs?.stage || 'Stock'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                <span className="text-[9px] text-zinc-500 uppercase font-mono block">Chassis Code</span>
                                                <span className="text-xs font-bold text-white block truncate">{activeSpecs?.chassisCode || 'N/A'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                <span className="text-[9px] text-zinc-500 uppercase font-mono block">Paint Code / Color</span>
                                                <span className="text-xs font-bold text-white block truncate">{activeSpecs?.color || 'OEM Spec'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl hover:border-white/10 transition-colors">
                                                <span className="text-[9px] text-zinc-500 uppercase font-mono block">Odometer reading</span>
                                                <span className="text-xs font-bold text-white block truncate">
                                                    {activeSpecs?.mileage ? `${parseInt(activeSpecs.mileage).toLocaleString()} mi` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Service Timeline (Provenance Log) */}
                            <div className="rounded-3xl bg-steel border border-white/8 p-6 flex flex-col justify-between shadow-xl min-h-[400px]">
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-5 flex items-center justify-between font-mono uppercase tracking-tight pb-3 border-b border-white/5">
                                        <div className="flex items-center gap-2">
                                            <Wrench className="h-4 w-4 text-signal-orange" />
                                            Provenance Log
                                        </div>
                                        <button 
                                            onClick={() => setShowLogModal(true)}
                                            className="px-2.5 py-1 text-[9px] font-black bg-signal-orange text-white rounded-lg hover:bg-orange-600 transition-all uppercase tracking-wider active:scale-95"
                                        >
                                            + Add Log
                                        </button>
                                    </h3>

                                    <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                                        {activeLogs.length === 0 ? (
                                            <div className="py-12 text-center text-zinc-600 text-xs font-bold font-mono uppercase">
                                                No service records recorded.
                                            </div>
                                        ) : (
                                            activeLogs.map((log, i) => {
                                                const isMod = log.service_type === 'modification';
                                                const isRepair = log.service_type === 'repair';
                                                const logTypeColor = isMod 
                                                    ? 'bg-signal-orange' 
                                                    : isRepair 
                                                        ? 'bg-red-500' 
                                                        : 'bg-blue-500';
                                                
                                                const dateStr = new Date(log.occurred_at).toLocaleDateString([], { 
                                                    month: 'short', 
                                                    year: 'numeric' 
                                                });

                                                return (
                                                    <div key={log.id || i} className="flex gap-3 group">
                                                        <div className="flex flex-col items-center shrink-0">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${logTypeColor} mt-1.5 flex-shrink-0 shadow-lg`} />
                                                            {i < activeLogs.length - 1 && <div className="w-px flex-1 bg-white/10 mt-1" />}
                                                        </div>
                                                        <div className="pb-4 flex-1">
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-[9px] text-text-muted uppercase font-mono tracking-wider">{dateStr}</p>
                                                                <span className="text-[10px] font-bold text-white font-mono bg-white/5 px-1.5 py-0.5 rounded">
                                                                    {log.cost_amount ? `$${log.cost_amount.toLocaleString()}` : 'Free'}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm font-black text-white group-hover:text-signal-orange transition-colors uppercase tracking-tight">{log.title}</p>
                                                            <p className="text-xs text-text-dim line-clamp-2 mt-0.5 leading-relaxed">{log.description}</p>
                                                            {log.odometer_reading && (
                                                                <span className="inline-block text-[9px] font-bold font-mono text-zinc-600 uppercase mt-1 bg-white/2 px-1 rounded">
                                                                    Odo: {log.odometer_reading.toLocaleString()} mi
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>

                                <Link 
                                    href={`/vehicle/${activeVehicle.id}`}
                                    className="w-full mt-4 py-3 rounded-xl border border-white/8 hover:border-white/20 text-text-dim hover:text-white text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-center gap-2 bg-white/1"
                                >
                                    View Full Provenance Timeline <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── ADD VEHICLE POPUP MODAL (2-Step Wizard) ── */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <div>
                                    <span className="text-signal-orange text-[9px] font-mono uppercase tracking-widest block mb-0.5">Step {wizardStep} of 2</span>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Register Vehicle Ledger</h3>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Form Content */}
                            <form onSubmit={handleAddVehicle} className="space-y-4">
                                {wizardStep === 1 ? (
                                    /* ── STEP 1: CAR IDENTITY ── */
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Make</label>
                                                <input 
                                                    type="text" 
                                                    value={make}
                                                    onChange={e => setMake(e.target.value)}
                                                    required
                                                    placeholder="Toyota / BMW"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Model</label>
                                                <input 
                                                    type="text" 
                                                    value={model}
                                                    onChange={e => setModel(e.target.value)}
                                                    required
                                                    placeholder="Supra RZ / M3 CSL"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Year</label>
                                                <input 
                                                    type="number" 
                                                    value={year}
                                                    onChange={e => setYear(e.target.value)}
                                                    required
                                                    placeholder="1998 / 2003"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Trim / Generation</label>
                                                <input 
                                                    type="text" 
                                                    value={trim}
                                                    onChange={e => setTrim(e.target.value)}
                                                    placeholder="e.g. JZA80 / E46"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none focus:border-signal-orange/40 font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Chassis Code</label>
                                                <input 
                                                    type="text" 
                                                    value={chassisCode}
                                                    onChange={e => setChassisCode(e.target.value)}
                                                    placeholder="e.g. JZA80"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Odometer (mi)</label>
                                                <input 
                                                    type="number" 
                                                    value={mileage}
                                                    onChange={e => setMileage(e.target.value)}
                                                    placeholder="e.g. 84500"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">VIN Number / Chassis Serial</label>
                                            <input 
                                                type="text" 
                                                value={vin}
                                                onChange={e => setVin(e.target.value)}
                                                placeholder="e.g. WBA333XE46CSL007"
                                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* ── STEP 2: SPECS, STYLING & COVER ── */
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Engine Specs / Code</label>
                                                <input 
                                                    type="text" 
                                                    value={engine}
                                                    onChange={e => setEngine(e.target.value)}
                                                    placeholder="e.g. 3.0L 2JZ-GTE"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Power (HP)</label>
                                                    <input 
                                                        type="number" 
                                                        value={power}
                                                        onChange={e => setPower(e.target.value)}
                                                        placeholder="320"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Torque (Nm)</label>
                                                    <input 
                                                        type="number" 
                                                        value={torque}
                                                        onChange={e => setTorque(e.target.value)}
                                                        placeholder="440"
                                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Transmission Selector Cards */}
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Transmission</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['Manual', 'Automatic', 'DCT / PDK'].map(opt => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setTransmission(opt)}
                                                        className={`py-2 px-3 rounded-xl border text-center font-bold text-xs transition-all ${
                                                            transmission === opt 
                                                                ? 'border-signal-orange bg-signal-orange/10 text-white shadow-lg' 
                                                                : 'border-white/8 bg-white/2 text-zinc-400 hover:border-white/15'
                                                        }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Drivetrain & Tuning Stage Selectors */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Drivetrain</label>
                                                <div className="grid grid-cols-3 gap-1.5">
                                                    {['RWD', 'AWD', 'FWD'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setDrivetrain(opt)}
                                                            className={`py-2 text-center font-bold text-[10px] rounded-lg border transition-all ${
                                                                drivetrain === opt 
                                                                    ? 'border-signal-orange bg-signal-orange/10 text-white' 
                                                                    : 'border-white/8 bg-white/2 text-zinc-400'
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Tuning Stage</label>
                                                <div className="grid grid-cols-4 gap-1">
                                                    {['Stock', 'Stg 1', 'Stg 2', 'Stg 3+'].map(opt => (
                                                        <button
                                                            key={opt}
                                                            type="button"
                                                            onClick={() => setStage(opt)}
                                                            className={`py-2 text-center font-bold text-[9px] rounded-lg border transition-all ${
                                                                stage === opt 
                                                                    ? 'border-signal-orange bg-signal-orange/10 text-white' 
                                                                    : 'border-white/8 bg-white/2 text-zinc-400'
                                                            }`}
                                                        >
                                                            {opt}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Paint Color Code/Spec</label>
                                                <input 
                                                    type="text" 
                                                    value={color}
                                                    onChange={e => setColor(e.target.value)}
                                                    placeholder="Royal Sapphire / Chalk Grey"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Weight (kg)</label>
                                                <input 
                                                    type="number" 
                                                    value={weight}
                                                    onChange={e => setWeight(e.target.value)}
                                                    placeholder="1510"
                                                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold"
                                                />
                                            </div>
                                        </div>

                                        {/* Cover Image Selector */}
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Cover Image Presets</label>
                                            <div className="flex gap-2 overflow-x-auto py-1">
                                                {PRESET_VEHICLE_IMAGES.map((img, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedImage(img.url);
                                                            setCustomImage('');
                                                        }}
                                                        className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                                                            selectedImage === img.url && !customImage ? 'border-signal-orange scale-105 shadow-md shadow-orange-500/10' : 'border-transparent'
                                                        }`}
                                                    >
                                                        <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[9px] text-zinc-600 font-semibold block font-mono">OR CUSTOM COVER URL:</span>
                                                <input 
                                                    type="text" 
                                                    value={customImage}
                                                    onChange={e => setCustomImage(e.target.value)}
                                                    placeholder="https://images.unsplash.com/your-car..."
                                                    className="w-full px-3 py-2 bg-white/2 border border-white/8 rounded-lg text-white placeholder-text-muted text-xs focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {modalError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-mono flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {modalError}
                                    </div>
                                )}

                                {/* Navigation buttons */}
                                <div className="flex gap-3 pt-3 border-t border-white/5">
                                    {wizardStep === 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setWizardStep(1)}
                                            className="px-4 py-3 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                                        >
                                            Back
                                        </button>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={modalLoading}
                                        className="flex-1 py-3 bg-signal-orange text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-orange-600 transition-all active:scale-[0.98]"
                                    >
                                        {modalLoading 
                                            ? 'Processing...' 
                                            : wizardStep === 1 
                                                ? 'Next Specs Step →' 
                                                : 'Complete Registry'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── ADD PROVENANCE LOG MODAL (Interactive Repairs/Upgrade Recorder) ── */}
            <AnimatePresence>
                {showLogModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.7 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            className="bg-[#0c0c0e] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <div>
                                    <span className="text-signal-orange text-[9px] font-mono uppercase tracking-widest block mb-0.5">Active ledger logging</span>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Add Provenance Log</h3>
                                </div>
                                <button onClick={() => setShowLogModal(false)} className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleAddLog} className="space-y-4">
                                
                                {/* Quick Suggestions Tag Wall */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Quick Sugggestions</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SUGGESTIONS.map(sugg => (
                                            <button
                                                key={sugg.label}
                                                type="button"
                                                onClick={() => {
                                                    setLogTitle(sugg.label);
                                                    setLogType(sugg.type);
                                                }}
                                                className="px-2 py-1 bg-white/2 border border-white/5 rounded-lg hover:border-signal-orange/40 hover:bg-signal-orange/2 text-[10px] text-zinc-300 font-bold transition-all"
                                            >
                                                {sugg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Log Title (Reparation / Upgrade / Maintenance)</label>
                                    <input 
                                        type="text" 
                                        value={logTitle}
                                        onChange={e => setLogTitle(e.target.value)}
                                        required
                                        placeholder="e.g. Brembo Brakes Swap, Oil Change..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none font-bold focus:border-signal-orange/40"
                                    />
                                </div>

                                {/* Log Type Pills */}
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Service Type</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { label: 'Maintenance', value: 'maintenance', accent: 'border-blue-500/20 text-blue-400 bg-blue-500/5' },
                                            { label: 'Repair', value: 'repair', accent: 'border-red-500/20 text-red-400 bg-red-500/5' },
                                            { label: 'Modification', value: 'modification', accent: 'border-signal-orange/20 text-signal-orange bg-signal-orange/5' },
                                            { label: 'Detailing', value: 'detailing', accent: 'border-green-500/20 text-green-400 bg-green-500/5' }
                                        ].map(opt => (
                                            <button
                                                key={opt.value}
                                                type="button"
                                                onClick={() => setLogType(opt.value)}
                                                className={`py-2 text-center font-bold text-[10px] rounded-xl border transition-all ${
                                                    logType === opt.value 
                                                        ? 'border-white bg-white text-carbon shadow-lg' 
                                                        : opt.accent
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Date</label>
                                        <input 
                                            type="date" 
                                            value={logDate}
                                            onChange={e => setLogDate(e.target.value)}
                                            required
                                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-signal-orange/40 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Cost (USD)</label>
                                        <input 
                                            type="number" 
                                            value={logCost}
                                            onChange={e => setLogCost(e.target.value)}
                                            placeholder="120"
                                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-signal-orange/40 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Odometer (mi)</label>
                                        <input 
                                            type="number" 
                                            value={logOdometer}
                                            onChange={e => setLogOdometer(e.target.value)}
                                            placeholder="85400"
                                            className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-xs focus:outline-none focus:border-signal-orange/40 font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono font-bold">Details / Technical Notes</label>
                                    <textarea 
                                        value={logDescription}
                                        onChange={e => setLogDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Specific parts installed, brand names, service center location, oils used..."
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-text-muted text-sm focus:outline-none resize-none"
                                    />
                                </div>

                                {/* Receipt / Invoice Attachment Zone */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Attach Invoice / Receipt (Facture)</label>
                                    
                                    {attachedFile ? (
                                        <div className="p-3 bg-white/2 border border-white/8 rounded-xl flex items-center justify-between animate-in zoom-in-95 duration-200">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2 bg-signal-orange/15 rounded-lg text-signal-orange border border-signal-orange/20">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-white max-w-[200px] truncate">{attachedFile.name}</p>
                                                    <p className="text-[10px] text-zinc-500 font-mono font-semibold">{attachedFile.size}</p>
                                                </div>
                                            </div>
                                            <button 
                                                type="button" 
                                                onClick={() => setAttachedFile(null)}
                                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 border border-white/5 rounded-lg transition-all"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative border border-dashed border-white/10 rounded-xl p-6 hover:border-signal-orange/40 hover:bg-signal-orange/1 transition-all text-center cursor-pointer group">
                                            <input 
                                                type="file" 
                                                onChange={handleFileSimulation}
                                                accept=".pdf,.png,.jpg,.jpeg"
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            />
                                            <Paperclip className="h-5 w-5 mx-auto mb-2 text-zinc-500 group-hover:text-signal-orange transition-colors" />
                                            <p className="text-xs text-zinc-400 font-bold">Click to upload or drag Invoice / Receipt</p>
                                            <p className="text-[9px] text-zinc-600 font-mono mt-0.5 uppercase">PDF, PNG, JPG up to 10MB</p>
                                        </div>
                                    )}
                                </div>

                                {logError && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold font-mono flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 shrink-0" />
                                        {logError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={logLoading}
                                    className="w-full py-3 bg-signal-orange text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-orange-600 transition-all active:scale-[0.98]"
                                >
                                    {logLoading ? 'Saving Log...' : 'Record Provenance Log'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
