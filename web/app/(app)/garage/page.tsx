'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    Sparkles,
    Flame,
    Zap,
    TrendingUp,
    Volume2,
    VolumeX
} from 'lucide-react';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { ImageUpload } from '@/components/ui/ImageUpload';
import Link from 'next/link';

// Preset high-fidelity imagery for vehicles
const PRESET_VEHICLE_IMAGES = [
    { name: 'M3 Black', url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80' },
    { name: 'Singer 911', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80' },
    { name: 'JDM Supra', url: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?w=800&q=80' },
    { name: 'GT-R R35', url: 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&q=80' },
    { name: '488 Pista', url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800&q=80' }
];

const MOCK_VEHICLES = [
    {
        id: 'mock-v-1',
        owner_id: 'u1',
        make: 'BMW',
        model: 'M3 (E46)',
        year: 2003,
        image_url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80',
        health_score: 98,
        logs: 3,
        mods: 4,
        verified: true
    },
    {
        id: 'mock-v-2',
        owner_id: 'u1',
        make: 'Porsche',
        model: '911 Singer',
        year: 1990,
        image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
        health_score: 99,
        logs: 2,
        mods: 1,
        verified: true
    }
];

// Web Audio API Synthesizer engine simulation class
class WebAudioEngineSynth {
    private ctx: AudioContext | null = null;
    private osc1: OscillatorNode | null = null;
    private osc2: OscillatorNode | null = null;
    private osc3: OscillatorNode | null = null;
    private filter: BiquadFilterNode | null = null;
    private mainGain: GainNode | null = null;
    private initialized = false;
    public muted = false;

    constructor() {}

    public init() {
        if (this.initialized) return;
        if (typeof window === 'undefined') return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) return;
            this.ctx = new AudioContextClass();

            // Oscillators configuration
            this.osc1 = this.ctx.createOscillator(); // Main growl
            this.osc2 = this.ctx.createOscillator(); // Sub rumble
            this.osc3 = this.ctx.createOscillator(); // Valve clicks

            this.osc1.type = 'sawtooth';
            this.osc2.type = 'square';
            this.osc3.type = 'sawtooth';

            // Resonant lowpass filter
            this.filter = this.ctx.createBiquadFilter();
            this.filter.type = 'lowpass';
            this.filter.Q.value = 5.0;

            // Main output gain
            this.mainGain = this.ctx.createGain();
            this.mainGain.gain.value = 0.0;

            // Connections
            this.osc1.connect(this.filter);
            this.osc2.connect(this.filter);
            this.osc3.connect(this.filter);
            this.filter.connect(this.mainGain);
            this.mainGain.connect(this.ctx.destination);

            // Start generators
            this.osc1.start(0);
            this.osc2.start(0);
            this.osc3.start(0);

            this.initialized = true;
        } catch (e) {
            console.error('[WebAudioEngine] Failed to initialize synth:', e);
        }
    }

    public updateTelemetry(rpm: number, throttle: number) {
        if (!this.initialized) this.init();
        if (!this.ctx) return;
        
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        // Calculate pitch based on RPM
        const baseFreq = 22 + (rpm / 9000) * 130;
        const now = this.ctx.currentTime;

        if (this.osc1 && this.osc2 && this.osc3 && this.filter && this.mainGain) {
            this.osc1.frequency.setTargetAtTime(baseFreq, now, 0.03);
            this.osc2.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.03); // Sub octave
            this.osc3.frequency.setTargetAtTime(baseFreq * 2.0, now, 0.04); // High harmonics

            // Sweep filter cutoff with RPM and load
            const cutoff = 150 + (rpm / 9000) * 2200 + (throttle * 900);
            this.filter.frequency.setTargetAtTime(cutoff, now, 0.02);

            // Compute overall volume
            const targetVolume = this.muted ? 0.0 : (0.01 + (throttle * 0.14) + (rpm / 9000) * 0.05);
            this.mainGain.gain.setTargetAtTime(targetVolume, now, 0.05);
        }
    }

    public triggerCrackle() {
        if (!this.initialized || !this.ctx || this.muted) return;
        const now = this.ctx.currentTime;
        const pops = Math.floor(Math.random() * 3) + 3; // 3 to 5 crackles

        for (let i = 0; i < pops; i++) {
            const timeOffset = i * 0.07 + Math.random() * 0.04;
            const popTime = now + timeOffset;

            // Short high pass click oscillator
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const popFilter = this.ctx.createBiquadFilter();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(60 + Math.random() * 80, popTime);
            osc.frequency.exponentialRampToValueAtTime(10, popTime + 0.03);

            popFilter.type = 'highpass';
            popFilter.frequency.setValueAtTime(120, popTime);

            gain.gain.setValueAtTime(0.15, popTime);
            gain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.04);

            osc.connect(popFilter);
            popFilter.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(popTime);
            osc.stop(popTime + 0.05);
        }
    }

    public stop() {
        if (this.mainGain && this.ctx) {
            this.mainGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
        }
    }
}

export default function GaragePage() {
    const { user } = useAuth();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [activeVehicle, setActiveVehicle] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeLogs, setActiveLogs] = useState<any[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<any[]>([]);

    // HUD & Telemetry Live states
    const [liveRpm, setLiveRpm] = useState(1000); // Idle RPM
    const [liveBoost, setLiveBoost] = useState(0.0);
    const [liveThrottle, setLiveThrottle] = useState(0.0);
    const [liveEgt, setLiveEgt] = useState(350); // Idle temperature Celsius
    const [isRevving, setIsRevving] = useState(false);
    
    // Dyno Simulation state
    const [isDynoRunning, setIsDynoRunning] = useState(false);
    const [dynoPoints, setDynoPoints] = useState<{ rpm: number; hp: number; tq: number }[]>([]);
    const [peakDynoStats, setPeakDynoStats] = useState<{ hp: number; hpRpm: number; tq: number; tqRpm: number } | null>(null);
    const [showDynoCertificate, setShowDynoCertificate] = useState(false);

    // Filter by blueprint hotspot
    const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
    const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);

    // Audio controls
    const [isMuted, setIsMuted] = useState(false);

    // Modals
    const [showModal, setShowModal] = useState(false);
    const [wizardStep, setWizardStep] = useState(1);
    const [showLogModal, setShowLogModal] = useState(false);

    // New Vehicle Wizard inputs
    const [make, setMake] = useState('');
    const [model, setModel] = useState('');
    const [year, setYear] = useState('');
    const [selectedImage, setSelectedImage] = useState(PRESET_VEHICLE_IMAGES[0].url);
    const [customImage, setCustomImage] = useState('');
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

    // New Log inputs
    const [logTitle, setLogTitle] = useState('');
    const [logType, setLogType] = useState('maintenance');
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [logCost, setLogCost] = useState('');
    const [logOdometer, setLogOdometer] = useState('');
    const [logDescription, setLogDescription] = useState('');
    const [attachedFile, setAttachedFile] = useState<any>(null);
    const [logError, setLogError] = useState<string | null>(null);
    const [logLoading, setLogLoading] = useState(false);
    
    // Receipt overlay
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    // References
    const synthRef = useRef<WebAudioEngineSynth | null>(null);
    const rpmInterval = useRef<any>(null);
    const dynoAnimationRef = useRef<number | null>(null);

    // Initialize audio synth singleton
    useEffect(() => {
        synthRef.current = new WebAudioEngineSynth();
        return () => {
            if (synthRef.current) {
                synthRef.current.stop();
            }
        };
    }, []);

    // Set mute settings on synth engine
    useEffect(() => {
        if (synthRef.current) {
            synthRef.current.muted = isMuted;
        }
    }, [isMuted]);

    // Handle interactive revving sweeps
    useEffect(() => {
        if (isDynoRunning) return; // Dyno control takes priority

        if (isRevving) {
            // Speed up to redline
            if (rpmInterval.current) clearInterval(rpmInterval.current);
            const startTimestamp = Date.now();
            const startRpm = liveRpm;
            const targetRpm = 8600; // Limiter tap

            rpmInterval.current = setInterval(() => {
                const elapsed = Date.now() - startTimestamp;
                const progress = Math.min(elapsed / 600, 1.0); // 600ms to max revs
                
                // Add some engine limit fluctuation at redline
                let nextRpm = startRpm + (targetRpm - startRpm) * Math.pow(progress, 1.5);
                if (progress >= 1.0) {
                    nextRpm = 8400 + Math.random() * 300; // bounce off limiter
                }

                setLiveRpm(nextRpm);
                setLiveThrottle(1.0);

                // Derived telemetry
                setLiveBoost(parseFloat((Math.min(nextRpm / 5000, 1.0) * 18.5 + Math.random() * 0.8).toFixed(1)));
                setLiveEgt(Math.floor(350 + (nextRpm / 9000) * 480));

                if (synthRef.current) {
                    synthRef.current.updateTelemetry(nextRpm, 1.0);
                }
            }, 20);
        } else {
            // Drop back to idle
            if (rpmInterval.current) clearInterval(rpmInterval.current);
            const startTimestamp = Date.now();
            const startRpm = liveRpm;
            const targetRpm = 1000; // Idle

            if (startRpm > 1500 && synthRef.current) {
                synthRef.current.triggerCrackle(); // Play overrun bubbles
            }

            rpmInterval.current = setInterval(() => {
                const elapsed = Date.now() - startTimestamp;
                const progress = Math.min(elapsed / 800, 1.0); // 800ms drop
                const nextRpm = startRpm - (startRpm - targetRpm) * progress;

                setLiveRpm(nextRpm);
                setLiveThrottle(0.0);
                
                const boostDrop = Math.max(0, liveBoost - (liveBoost * progress));
                setLiveBoost(parseFloat(boostDrop.toFixed(1)));
                setLiveEgt(Math.max(350, Math.floor(liveEgt - (liveEgt - 350) * progress * 0.3)));

                if (synthRef.current) {
                    synthRef.current.updateTelemetry(nextRpm, 0.0);
                }

                if (progress >= 1.0) {
                    clearInterval(rpmInterval.current);
                    if (synthRef.current) {
                        synthRef.current.stop();
                    }
                }
            }, 20);
        }

        return () => {
            if (rpmInterval.current) clearInterval(rpmInterval.current);
        };
    }, [isRevving, isDynoRunning]);

    // Dyno pull automatic sweep animation loop
    const runDynoPull = () => {
        if (isDynoRunning) return;
        setIsDynoRunning(true);
        setShowDynoCertificate(false);
        setPeakDynoStats(null);
        setDynoPoints([]);
        
        // Grab vehicle peak specifications
        let vehicleSpecs: any = null;
        if (activeVehicle) {
            const saved = localStorage.getItem(`vehicle-specs-${activeVehicle.id}`);
            if (saved) {
                try { vehicleSpecs = JSON.parse(saved); } catch (e) {}
            }
        }

        const peakHP = vehicleSpecs?.power ? parseInt(vehicleSpecs.power) : 320;
        const peakTQ = vehicleSpecs?.torque ? parseInt(vehicleSpecs.torque) : 410;

        const duration = 4000; // 4 second run
        const startTime = Date.now();
        const startRpm = 1000;
        const endRpm = 8400;

        const dynoTick = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1.0);
            
            const currentRpm = startRpm + (endRpm - startRpm) * progress;
            setLiveRpm(currentRpm);
            
            // Sweep throttle to 100%
            const currentThrottle = progress < 0.1 ? progress / 0.1 : 1.0;
            setLiveThrottle(currentThrottle);

            // Compute physics telemetry
            const currentBoost = parseFloat(((progress < 0.3 ? progress / 0.3 : 1.0) * 19.5 + Math.random() * 0.6).toFixed(1));
            setLiveBoost(currentBoost);

            const currentEgt = Math.floor(350 + progress * 510 + Math.random() * 10);
            setLiveEgt(currentEgt);

            // Audio pitch update
            if (synthRef.current) {
                synthRef.current.updateTelemetry(currentRpm, currentThrottle);
            }

            // Calculate current power/torque values on quadratic curves
            // Horsepower peaks around 6600 RPM
            const hpCurve = Math.max(0, peakHP * (1 - Math.pow((currentRpm - 6600) / 5500, 2)));
            // Torque peaks around 4200 RPM
            const tqCurve = Math.max(0, peakTQ * (1 - Math.pow((currentRpm - 4200) / 3800, 2)));

            setDynoPoints(prev => [...prev, { 
                rpm: Math.round(currentRpm), 
                hp: Math.round(hpCurve), 
                tq: Math.round(tqCurve) 
            }]);

            if (progress < 1.0) {
                dynoAnimationRef.current = requestAnimationFrame(dynoTick);
            } else {
                // Done! Play limiter backfire, drop RPM, show stats
                setIsDynoRunning(false);
                setLiveThrottle(0.0);
                if (synthRef.current) {
                    synthRef.current.triggerCrackle();
                    synthRef.current.stop();
                }

                // Compile certificate statistics
                setPeakDynoStats({
                    hp: peakHP,
                    hpRpm: 6600,
                    tq: peakTQ,
                    tqRpm: 4200
                });
                setShowDynoCertificate(true);
            }
        };

        dynoAnimationRef.current = requestAnimationFrame(dynoTick);
    };

    // Load active logs
    const loadActiveLogs = useCallback(async (vehicleId: string) => {
        if (!vehicleId) return;
        
        let dbLogs: any[] = [];
        try {
            const { data, error } = await supabase
                .from('maintenance_logs')
                .select('*')
                .eq('vehicle_id', vehicleId)
                .order('occurred_at', { ascending: false });

            if (!error && data) {
                dbLogs = data;
            }
        } catch (e) {
            console.warn('[Garage] Failed to fetch logs from DB, fallback to local:', e);
        }

        const savedLocal = localStorage.getItem(`local-logs-${vehicleId}`);
        const localList = savedLocal ? JSON.parse(savedLocal) : [];

        const combined = [...localList, ...dbLogs];

        if (combined.length > 0) {
            setActiveLogs(combined);
        } else {
            // World-class seed logs if empty
            setActiveLogs([
                { id: 'm-1', occurred_at: new Date(Date.now() - 3600000 * 24 * 6).toISOString(), title: 'Liquid Moly 5W40 Oil Service', cost_amount: 140, service_type: 'maintenance', description: 'Replaced oil & filter using premium Liqui Moly engine oil. Inspection completed, visual check passed.', odometer_reading: 84620 },
                { id: 'm-2', occurred_at: new Date(Date.now() - 3600000 * 24 * 40).toISOString(), title: 'Brembo GT Series Brakes', cost_amount: 2200, service_type: 'modification', description: 'Installed GT 6-pot calipers and slotted zinc rotors. Replaced fluid with racing grade DOT 4.', odometer_reading: 83100 },
                { id: 'm-3', occurred_at: new Date(Date.now() - 3600000 * 24 * 110).toISOString(), title: 'Bilstein B16 Coilover Kit', cost_amount: 1850, service_type: 'modification', description: 'Replaced OEM suspension with fully adjustable coilovers. Height lowered by 15mm. Full chassis corner balancing performed.', odometer_reading: 81200 },
                { id: 'm-4', occurred_at: new Date(Date.now() - 3600000 * 24 * 180).toISOString(), title: 'O2 Sensor Repair', cost_amount: 320, service_type: 'repair', description: 'Bank 1 O2 sensor malfunction causing check engine code. Swapped with OEM Bosch replacement.', odometer_reading: 78500 }
            ]);
        }
    }, []);

    // Filter logs based on blueprint hotspots or active choices
    useEffect(() => {
        if (!selectedHotspot) {
            setFilteredLogs(activeLogs);
            return;
        }

        // Apply filters based on chassis element
        const tag = selectedHotspot.toLowerCase();
        const filtered = activeLogs.filter(log => {
            const title = log.title.toLowerCase();
            const desc = (log.description || '').toLowerCase();
            
            if (tag === 'engine' && (title.includes('oil') || title.includes('engine') || title.includes('spark') || desc.includes('motor') || desc.includes('plug'))) return true;
            if (tag === 'turbo' && (title.includes('turbo') || title.includes('boost') || desc.includes('charger') || desc.includes('intake') || title.includes('sensor'))) return true;
            if (tag === 'brakes' && (title.includes('brake') || title.includes('pad') || title.includes('rotor') || desc.includes('caliper') || desc.includes('fluid'))) return true;
            if (tag === 'suspension' && (title.includes('coil') || title.includes('shock') || title.includes('suspension') || desc.includes('balance') || desc.includes('height'))) return true;
            if (tag === 'exhaust' && (title.includes('exhaust') || title.includes('muffler') || title.includes('catback') || desc.includes('pipe') || desc.includes('downpipe'))) return true;
            
            return false;
        });

        setFilteredLogs(filtered);
    }, [selectedHotspot, activeLogs]);

    const loadVehicles = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        
        let dbVehicles: any[] = [];
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('owner_id', user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                dbVehicles = data;
            }
        } catch (err) {
            console.warn('[Garage] DB fetch failed, using local + mock:', err);
        }

        const localSaved = localStorage.getItem('local-vehicles');
        const localList = localSaved ? JSON.parse(localSaved) : [];

        const combined = [
            ...localList.filter((v: any) => v.owner_id === user.id),
            ...dbVehicles
        ];

        // Ensure duplicates are purged
        const unique = combined.reduce((acc: any[], cur) => {
            if (!acc.some(v => v.id === cur.id)) acc.push(cur);
            return acc;
        }, []);

        if (unique.length > 0) {
            const parsed = unique.map(v => ({
                ...v,
                health_score: v.id.startsWith('local-') ? 97 : 99,
                verified: !v.id.startsWith('local-')
            }));
            setVehicles(parsed);
            setActiveVehicle(parsed[0]);
        } else {
            setVehicles(MOCK_VEHICLES);
            setActiveVehicle(MOCK_VEHICLES[0]);
        }
        setLoading(false);
    }, [user]);

    useEffect(() => {
        loadVehicles();
    }, [loadVehicles]);

    useEffect(() => {
        if (activeVehicle?.id) {
            loadActiveLogs(activeVehicle.id);
            setSelectedHotspot(null); // Clear filter on swap
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
        let newId = `local-v-${Date.now()}`;

        const localVehicle = {
            id: newId,
            owner_id: user.id,
            make,
            model,
            year: parseInt(year),
            image_url: finalImage,
            created_at: new Date().toISOString()
        };

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
                newId = data[0].id;
            }
        } catch (err: any) {
            console.warn('[Garage] Database insert failed, using local storage fallback:', err.message);
            const localSaved = localStorage.getItem('local-vehicles');
            const localList = localSaved ? JSON.parse(localSaved) : [];
            localStorage.setItem('local-vehicles', JSON.stringify([localVehicle, ...localList]));
        }

        // Registry vehicle specifications
        const richSpecs = {
            vin: vin || 'WBAXXXXXXXXXXXXXX',
            trim: trim || 'OEM Spec',
            color: color || 'OEM Paint',
            engine: engine || 'Inline Engine Configuration',
            power: power || '300',
            torque: torque || '400',
            weight: weight || '1450',
            drivetrain: drivetrain || 'RWD',
            transmission: transmission || 'Manual',
            stage: stage || 'Stock',
            chassisCode: chassisCode || 'N/A',
            interiorColor: interiorColor || 'N/A',
            mileage: mileage || '60000'
        };
        localStorage.setItem(`vehicle-specs-${newId}`, JSON.stringify(richSpecs));

        // Reset inputs
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
        setModalLoading(false);
        
        await loadVehicles();
    };

    const handleAddLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !activeVehicle) return;

        setLogLoading(true);
        setLogError(null);

        const attachmentInfo = attachedFile ? ` [Attached Invoice: ${attachedFile.name}]` : '';
        const fullDescription = `${logDescription}${attachmentInfo}`;

        const localLog = {
            id: `local-log-${Date.now()}`,
            vehicle_id: activeVehicle.id,
            performed_by_user_id: user.id,
            occurred_at: new Date(logDate).toISOString(),
            service_type: logType,
            title: logTitle,
            description: fullDescription,
            cost_amount: logCost ? parseFloat(logCost) : null,
            odometer_reading: logOdometer ? parseInt(logOdometer) : null,
            is_verified: false
        };

        try {
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
        } catch (err: any) {
            console.warn('[Logs] Database insert failed, using local storage fallback:', err.message);
            const savedLocal = localStorage.getItem(`local-logs-${activeVehicle.id}`);
            const localList = savedLocal ? JSON.parse(savedLocal) : [];
            localStorage.setItem(`local-logs-${activeVehicle.id}`, JSON.stringify([localLog, ...localList]));
        }

        setShowLogModal(false);
        setLogTitle('');
        setLogType('maintenance');
        setLogDate(new Date().toISOString().split('T')[0]);
        setLogCost('');
        setLogOdometer('');
        setLogDescription('');
        setAttachedFile(null);
        setLogLoading(false);

        await loadActiveLogs(activeVehicle.id);
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

    // Calculate vehicle statistics for investment allocation
    const getStatsAllocation = () => {
        let totals = { maintenance: 0, repair: 0, modification: 0, detailing: 0 };
        activeLogs.forEach(l => {
            if (l.cost_amount) {
                const cat = l.service_type as keyof typeof totals;
                if (totals[cat] !== undefined) {
                    totals[cat] += l.cost_amount;
                }
            }
        });

        const sum = Object.values(totals).reduce((a, b) => a + b, 0);
        return { totals, sum };
    };

    const allocationData = getStatsAllocation();

    // Load rich specs from registry
    let activeSpecs: any = null;
    if (activeVehicle && typeof window !== 'undefined') {
        const saved = localStorage.getItem(`vehicle-specs-${activeVehicle.id}`);
        if (saved) {
            try {
                activeSpecs = JSON.parse(saved);
            } catch (e) {}
        }
    }

    const SUGGESTIONS = [
        { label: 'Liqui Moly Oil Service', type: 'maintenance' },
        { label: 'Brembo Calipers Upgrade', type: 'modification' },
        { label: 'Bilstein Coilovers Install', type: 'modification' },
        { label: 'Spark Plugs Replacement', type: 'maintenance' },
        { label: 'Oxygen O2 Sensor Repair', type: 'repair' },
        { label: 'Full Paint Protection Detail', type: 'detailing' }
    ];

    return (
        <div className="space-y-8 relative pb-16 noise-overlay">
            
            {/* Header section with futuristic design */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-signal-orange animate-pulse" />
                        <p className="text-text-dim text-xs font-bold uppercase tracking-widest font-mono">Telemetry & Registry Center</p>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic leading-none">
                        The Garage<span className="text-signal-orange">.</span>
                    </h1>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-3 bg-steel border border-white/5 text-zinc-400 hover:text-white rounded-xl transition-all"
                        title={isMuted ? 'Unmute engine audio' : 'Mute engine audio'}
                    >
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                    <button 
                        onClick={() => {
                            setWizardStep(1);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-6 py-3.5 bg-signal-orange hover:bg-orange-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-lg shadow-orange-600/10"
                    >
                        <Plus className="h-4 w-4" />
                        Register Vehicle
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="py-24 text-center">
                    <div className="h-8 w-8 border-2 border-signal-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-zinc-500 font-bold font-mono uppercase tracking-widest text-xs">Accessing encrypted telemetry files...</p>
                </div>
            ) : (
                <>
                    {/* Vehicle Quick Carousel */}
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {vehicles.map(v => (
                            <motion.button
                                key={v.id}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setActiveVehicle(v)}
                                className={`flex-shrink-0 w-72 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                                    activeVehicle?.id === v.id 
                                        ? 'border-signal-orange/60 bg-signal-orange/5 shadow-[0_0_30px_rgba(249,115,22,0.12)]' 
                                        : 'border-white/8 bg-steel/30 hover:border-white/15'
                                }`}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full ease-out" style={{ transitionDuration: '1.2s' }} />

                                <div className="aspect-video rounded-xl overflow-hidden m-3 border border-white/5 relative">
                                    <img 
                                        src={v.image_url || v.image} 
                                        alt={v.model} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                                    />
                                    {v.verified && (
                                        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 text-[9px] font-black text-cyan-400 bg-black/60 border border-cyan-500/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
                                            <Shield className="h-2.5 w-2.5" /> VERIFIED
                                        </div>
                                    )}
                                </div>
                                <div className="px-4 pb-4">
                                    <p className="text-white font-black text-sm uppercase tracking-tight truncate">{v.year} {v.model}</p>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-text-dim text-xs font-bold">{v.make}</p>
                                        <span className="text-[10px] font-mono text-zinc-500 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                            Stage: {v.id.startsWith('local-') ? (activeSpecs?.stage || 'Stock') : 'Stage 2'}
                                        </span>
                                    </div>
                                </div>
                            </motion.button>
                        ))}

                        <button 
                            onClick={() => {
                                setWizardStep(1);
                                setShowModal(true);
                            }}
                            className="flex-shrink-0 w-72 rounded-2xl border border-dashed border-white/10 hover:border-signal-orange/40 transition-all flex flex-col items-center justify-center gap-2 text-text-dim hover:text-signal-orange min-h-[160px] bg-white/1 hover:bg-signal-orange/2"
                        >
                            <Plus className="h-6 w-6" />
                            <span className="text-xs uppercase font-mono font-bold tracking-wider">Add New Chassis</span>
                        </button>
                    </div>

                    {/* Active Vehicle Core Console */}
                    {activeVehicle && (
                        <div className="space-y-6">
                            
                            {/* Visual HUD section (Chassis Blueprint & Telemetry) */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                
                                {/* 1. Chassis Blueprint Configurator Panel (7 cols) */}
                                <div className="lg:col-span-7 rounded-3xl bg-steel border border-white/8 p-6 flex flex-col justify-between relative overflow-hidden shadow-xl glass-panel">
                                    <div>
                                        <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                            <div>
                                                <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest">Active Chassis Blueprint HUD</h3>
                                                <p className="text-[10px] text-zinc-500 font-semibold font-mono">HOVER HOTSPOT TO CONFIGURE SPECS / FILTER TIMELINE</p>
                                            </div>
                                            {selectedHotspot && (
                                                <button 
                                                    onClick={() => setSelectedHotspot(null)}
                                                    className="px-2 py-1 text-[9px] font-bold border border-white/15 hover:border-white/30 text-white rounded bg-white/5 uppercase transition-all"
                                                >
                                                    Clear filter [x]
                                                </button>
                                            )}
                                        </div>

                                        {/* Stylized Vector Chassis Silhouette */}
                                        <div className="relative py-4 flex items-center justify-center">
                                            <svg viewBox="0 0 580 180" className="w-full h-auto max-w-lg select-none">
                                                {/* Blueprint grid lines */}
                                                <defs>
                                                    <pattern id="chassis-grid" width="15" height="15" patternUnits="userSpaceOnUse">
                                                        <path d="M 15 0 L 0 0 0 15" fill="none" stroke="rgba(255, 255, 255, 0.02)" strokeWidth="1" />
                                                    </pattern>
                                                </defs>
                                                <rect width="100%" height="100%" fill="url(#chassis-grid)" />

                                                {/* Main wireframe body silhouette */}
                                                <path 
                                                    d="M 50,135 L 75,135 C 80,105 125,105 130,135 L 430,135 C 435,105 480,105 485,135 L 530,135 C 542,135 550,128 554,115 C 558,102 552,80 525,80 C 510,80 470,75 450,75 C 390,55 330,48 240,68 C 180,80 150,85 90,92 L 50,105 Z" 
                                                    fill="none" 
                                                    stroke={selectedHotspot ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.25)"} 
                                                    strokeWidth="2.5" 
                                                    strokeDasharray={selectedHotspot ? "2, 4" : ""}
                                                    className="transition-colors duration-300"
                                                />

                                                {/* Chassis internal structure lines */}
                                                <line x1="130" y1="135" x2="430" y2="135" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
                                                <line x1="240" y1="68" x2="240" y2="135" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                                                <line x1="390" y1="58" x2="390" y2="135" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" />
                                                
                                                {/* Rear exhaust lines */}
                                                <path 
                                                    d="M 280,132 L 515,132 C 522,132 525,128 532,128" 
                                                    fill="none" 
                                                    stroke={hoveredHotspot === 'Exhaust' || selectedHotspot === 'Exhaust' ? '#f97316' : 'rgba(255, 255, 255, 0.12)'} 
                                                    strokeWidth="2.5"
                                                    className="transition-colors duration-300"
                                                />

                                                {/* HOTSPOT 1: ENGINE BLOCK (Front wheel overlap) */}
                                                <g 
                                                    className="cursor-pointer"
                                                    onMouseEnter={() => setHoveredHotspot('Engine')}
                                                    onMouseLeave={() => setHoveredHotspot(null)}
                                                    onClick={() => setSelectedHotspot(selectedHotspot === 'Engine' ? null : 'Engine')}
                                                >
                                                    <circle 
                                                        cx="140" 
                                                        cy="95" 
                                                        r="25" 
                                                        fill={hoveredHotspot === 'Engine' || selectedHotspot === 'Engine' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.02)'} 
                                                        stroke={hoveredHotspot === 'Engine' || selectedHotspot === 'Engine' ? '#f97316' : 'rgba(255, 255, 255, 0.15)'} 
                                                        strokeWidth="1.5"
                                                        className="transition-all duration-300"
                                                    />
                                                    <text x="140" y="99" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">ENG</text>
                                                </g>

                                                {/* HOTSPOT 2: TURBO / INTAKE */}
                                                <g 
                                                    className="cursor-pointer"
                                                    onMouseEnter={() => setHoveredHotspot('Turbo')}
                                                    onMouseLeave={() => setHoveredHotspot(null)}
                                                    onClick={() => setSelectedHotspot(selectedHotspot === 'Turbo' ? null : 'Turbo')}
                                                >
                                                    <rect 
                                                        x="180" 
                                                        y="75" 
                                                        width="35" 
                                                        height="22" 
                                                        rx="4"
                                                        fill={hoveredHotspot === 'Turbo' || selectedHotspot === 'Turbo' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.02)'} 
                                                        stroke={hoveredHotspot === 'Turbo' || selectedHotspot === 'Turbo' ? '#f97316' : 'rgba(255, 255, 255, 0.15)'} 
                                                        strokeWidth="1.5"
                                                        className="transition-all duration-300"
                                                    />
                                                    <text x="198" y="89" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono">BOOST</text>
                                                </g>

                                                {/* HOTSPOT 3: BRAKES & WHEELS (Front & Rear) */}
                                                <g 
                                                    className="cursor-pointer"
                                                    onMouseEnter={() => setHoveredHotspot('Brakes')}
                                                    onMouseLeave={() => setHoveredHotspot(null)}
                                                    onClick={() => setSelectedHotspot(selectedHotspot === 'Brakes' ? null : 'Brakes')}
                                                >
                                                    {/* Front wheel/rotor */}
                                                    <circle 
                                                        cx="105" 
                                                        cy="135" 
                                                        r="30" 
                                                        fill={hoveredHotspot === 'Brakes' || selectedHotspot === 'Brakes' ? 'rgba(249, 115, 22, 0.15)' : 'none'} 
                                                        stroke={hoveredHotspot === 'Brakes' || selectedHotspot === 'Brakes' ? '#f97316' : 'rgba(255, 255, 255, 0.2)'} 
                                                        strokeWidth="2"
                                                        strokeDasharray="4, 2"
                                                        className="transition-all duration-300"
                                                    />
                                                    {/* Rear wheel/rotor */}
                                                    <circle 
                                                        cx="455" 
                                                        cy="135" 
                                                        r="30" 
                                                        fill={hoveredHotspot === 'Brakes' || selectedHotspot === 'Brakes' ? 'rgba(249, 115, 22, 0.15)' : 'none'} 
                                                        stroke={hoveredHotspot === 'Brakes' || selectedHotspot === 'Brakes' ? '#f97316' : 'rgba(255, 255, 255, 0.2)'} 
                                                        strokeWidth="2"
                                                        strokeDasharray="4, 2"
                                                        className="transition-all duration-300"
                                                    />
                                                    <text x="105" y="138" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">BRK</text>
                                                    <text x="455" y="138" fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" className="font-mono">BRK</text>
                                                </g>

                                                {/* HOTSPOT 4: SUSPENSION / STRUT (Rear axle area) */}
                                                <g 
                                                    className="cursor-pointer"
                                                    onMouseEnter={() => setHoveredHotspot('Suspension')}
                                                    onMouseLeave={() => setHoveredHotspot(null)}
                                                    onClick={() => setSelectedHotspot(selectedHotspot === 'Suspension' ? null : 'Suspension')}
                                                >
                                                    {/* Spring line representation */}
                                                    <path 
                                                        d="M 445,130 L 435,78" 
                                                        stroke={hoveredHotspot === 'Suspension' || selectedHotspot === 'Suspension' ? '#f97316' : 'rgba(255, 255, 255, 0.25)'} 
                                                        strokeWidth="4" 
                                                        strokeDasharray="3, 3"
                                                        className="transition-colors duration-300"
                                                    />
                                                    <path 
                                                        d="M 115,130 L 122,85" 
                                                        stroke={hoveredHotspot === 'Suspension' || selectedHotspot === 'Suspension' ? '#f97316' : 'rgba(255, 255, 255, 0.25)'} 
                                                        strokeWidth="4" 
                                                        strokeDasharray="3, 3"
                                                        className="transition-colors duration-300"
                                                    />
                                                    <text x="380" y="80" fill="white" fontSize="9" fontWeight="bold" className="font-mono">SUSPENSION</text>
                                                </g>

                                                {/* HOTSPOT 5: CATBACK EXHAUST (Tailpipe) */}
                                                <g 
                                                    className="cursor-pointer"
                                                    onMouseEnter={() => setHoveredHotspot('Exhaust')}
                                                    onMouseLeave={() => setHoveredHotspot(null)}
                                                    onClick={() => setSelectedHotspot(selectedHotspot === 'Exhaust' ? null : 'Exhaust')}
                                                >
                                                    <circle 
                                                        cx="535" 
                                                        cy="128" 
                                                        r="12" 
                                                        fill={hoveredHotspot === 'Exhaust' || selectedHotspot === 'Exhaust' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(255,255,255,0.02)'} 
                                                        stroke={hoveredHotspot === 'Exhaust' || selectedHotspot === 'Exhaust' ? '#f97316' : 'rgba(255, 255, 255, 0.15)'} 
                                                        strokeWidth="1.5"
                                                        className="transition-all duration-300"
                                                    />
                                                    <text x="535" y="131" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle" className="font-mono">EXH</text>
                                                </g>
                                            </svg>

                                            {/* Exhaust backfire flame animation on revving */}
                                            <AnimatePresence>
                                                {(isRevving && liveRpm > 7000) && (
                                                    <motion.div 
                                                        initial={{ opacity: 0, scale: 0.5, x: 20 }}
                                                        animate={{ opacity: 1, scale: [1, 1.4, 0.8], x: [10, 45, 20] }}
                                                        exit={{ opacity: 0 }}
                                                        transition={{ duration: 0.15, repeat: Infinity }}
                                                        className="absolute right-[12%] bottom-[18%] flex gap-1 pointer-events-none"
                                                    >
                                                        <div className="h-4 w-10 bg-gradient-to-r from-orange-400 via-red-500 to-transparent blur-xs rounded-full origin-left rotate-[10deg]" />
                                                        <div className="h-3 w-8 bg-gradient-to-r from-yellow-300 via-orange-500 to-transparent blur-xs rounded-full origin-left -rotate-[10deg]" />
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>

                                    {/* Selected component specification panel */}
                                    <div className="mt-4 p-4 bg-white/2 border border-white/5 rounded-2xl">
                                        {selectedHotspot || hoveredHotspot ? (
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-[10px] font-black text-signal-orange uppercase tracking-wider font-mono">
                                                        SYSTEM SPECS: {selectedHotspot || hoveredHotspot}
                                                    </span>
                                                    <span className="text-[8px] bg-signal-orange/15 text-signal-orange border border-signal-orange/20 px-1.5 py-0.5 rounded font-mono font-bold">
                                                        ACTIVE WIDGET
                                                    </span>
                                                </div>
                                                
                                                {(selectedHotspot === 'Engine' || hoveredHotspot === 'Engine') && (
                                                    <p className="text-xs text-white font-mono leading-relaxed">
                                                        Layout: <span className="font-bold text-white">{activeSpecs?.engine || 'Naturally Aspirated / Twin-scroll inline configuration'}</span> • Chassis: <span className="font-bold text-white">{activeSpecs?.chassisCode || 'OEM Block'}</span> • Stage: <span className="font-bold text-white">{activeSpecs?.stage || 'Stock Config'}</span>
                                                    </p>
                                                )}
                                                {(selectedHotspot === 'Turbo' || hoveredHotspot === 'Turbo') && (
                                                    <p className="text-xs text-white font-mono leading-relaxed">
                                                        Peak Boost Target: <span className="font-bold text-white">21.5 PSI</span> • Intercooler: <span className="font-bold text-white">Upgraded Front Mount Core</span> • Intake: <span className="font-bold text-white">Performance cold air intake filter assembly.</span>
                                                    </p>
                                                )}
                                                {(selectedHotspot === 'Brakes' || hoveredHotspot === 'Brakes') && (
                                                    <p className="text-xs text-white font-mono leading-relaxed">
                                                        Rotor setup: <span className="font-bold text-white">Carbon-Ceramic Cross Drilled Ventilated</span> • Calipers: <span className="font-bold text-white">Upgraded Brembo 6-Pot Front / 4-Pot Rear</span> • Fluid: <span className="font-bold text-white">Racing high temp DOT 4</span>
                                                    </p>
                                                )}
                                                {(selectedHotspot === 'Suspension' || hoveredHotspot === 'Suspension') && (
                                                    <p className="text-xs text-white font-mono leading-relaxed">
                                                        Dampers: <span className="font-bold text-white">Bilstein B16 Fully Adjustable Coilovers</span> • Ride Height: <span className="font-bold text-white">-15mm lowered</span> • Cornering: <span className="font-bold text-white">Polynylon sway bars and dynamic strut tower brace</span>
                                                    </p>
                                                )}
                                                {(selectedHotspot === 'Exhaust' || hoveredHotspot === 'Exhaust') && (
                                                    <p className="text-xs text-white font-mono leading-relaxed">
                                                        Exhaust System: <span className="font-bold text-white">Full Catback Lightweight Titanium Exhaust</span> • Layout: <span className="font-bold text-white">Twin exit dual valves with exhaust controller module</span>
                                                    </p>
                                                )}
                                                
                                                <p className="text-[10px] text-zinc-500 font-mono mt-1">
                                                    *Timeline below filtered. Click again to reset timeline filter.
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2.5 text-zinc-500">
                                                <Zap className="h-4 w-4 text-signal-orange animate-pulse" />
                                                <p className="text-xs font-mono font-semibold">Hover over a component hotspot (ENG, BOOST, BRK, SUSPENSION, EXH) to view system specifications and filter log history.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 2. Gran Turismo Telemetry & Dyno Pull Testbed (5 cols) */}
                                <div className="lg:col-span-5 rounded-3xl bg-steel border border-white/8 p-6 flex flex-col justify-between shadow-xl glass-panel relative">
                                    
                                    {/* Circular Tachometer Dial */}
                                    <div className="text-center relative">
                                        <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
                                            <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest flex items-center gap-1.5">
                                                <Gauge className="h-4 w-4 text-signal-orange" /> Dyno Telemetry HUD
                                            </h3>
                                            <span className="text-[9px] font-mono font-bold text-zinc-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                Active Link
                                            </span>
                                        </div>

                                        <div className="relative w-44 h-44 mx-auto flex items-center justify-center mt-2">
                                            {/* Radial SVG Tachometer arc */}
                                            <svg className="absolute inset-0 w-full h-full transform -rotate-225">
                                                <circle 
                                                    cx="88" 
                                                    cy="88" 
                                                    r="70" 
                                                    fill="none" 
                                                    stroke="rgba(255, 255, 255, 0.04)" 
                                                    strokeWidth="8" 
                                                />
                                                <circle 
                                                    cx="88" 
                                                    cy="88" 
                                                    r="70" 
                                                    fill="none" 
                                                    stroke="#f97316" 
                                                    strokeWidth="8" 
                                                    strokeDasharray="439.8" 
                                                    strokeDashoffset={439.8 - (439.8 * 270 / 360) * (liveRpm / 9000)}
                                                    className="transition-all duration-75 ease-out"
                                                />
                                                {/* Redline indicator */}
                                                <circle 
                                                    cx="88" 
                                                    cy="88" 
                                                    r="70" 
                                                    fill="none" 
                                                    stroke="#ef4444" 
                                                    strokeWidth="8" 
                                                    strokeDasharray="439.8" 
                                                    strokeDashoffset={439.8 - (439.8 * 270 / 360) * (1500 / 9000)}
                                                    className="transform origin-center rotate-[210deg]"
                                                />
                                            </svg>

                                            {/* Tachometer needle */}
                                            <div 
                                                className="absolute w-1.5 h-20 bg-signal-orange origin-bottom bottom-[50%] left-[calc(50%-3px)] transition-all duration-75 ease-out rounded-t-full shadow-lg"
                                                style={{ 
                                                    transform: `rotate(${-135 + (liveRpm / 9000) * 270}deg)`,
                                                    boxShadow: '0 0 10px #f97316'
                                                }}
                                            />

                                            {/* RPM Digital readout */}
                                            <div className="z-10 text-center select-none">
                                                <span className={`text-3xl font-black text-white font-mono block leading-none ${liveRpm > 8000 ? 'text-red-500 animate-pulse' : ''}`}>
                                                    {Math.round(liveRpm)}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-bold font-mono tracking-widest uppercase mt-0.5 block">RPM x100</span>
                                            </div>

                                            {/* Limiter Warning Light */}
                                            {liveRpm >= 8000 && (
                                                <div className="absolute top-[18%] left-[45%] h-4 w-4 bg-red-600 rounded-full border-2 border-white animate-ping" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Telemetry Sensor Dashboard Grid */}
                                    <div className="grid grid-cols-3 gap-2 my-4">
                                        <div className="bg-white/2 border border-white/5 rounded-xl p-2.5 text-center">
                                            <span className="text-[8px] text-zinc-500 font-mono font-bold block uppercase">BOOST PRESSURE</span>
                                            <span className="text-lg font-black text-white font-mono block mt-0.5">{liveBoost} <span className="text-[9px] text-zinc-500">PSI</span></span>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                <div 
                                                    className="h-full bg-cyan-400 transition-all duration-100" 
                                                    style={{ width: `${Math.min((liveBoost / 22) * 100, 100)}%` }} 
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white/2 border border-white/5 rounded-xl p-2.5 text-center">
                                            <span className="text-[8px] text-zinc-500 font-mono font-bold block uppercase">THROTTLE</span>
                                            <span className="text-lg font-black text-white font-mono block mt-0.5">{Math.round(liveThrottle * 100)} <span className="text-[9px] text-zinc-500">%</span></span>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                <div 
                                                    className="h-full bg-signal-orange transition-all duration-100" 
                                                    style={{ width: `${liveThrottle * 100}%` }} 
                                                />
                                            </div>
                                        </div>
                                        <div className="bg-white/2 border border-white/5 rounded-xl p-2.5 text-center">
                                            <span className="text-[8px] text-zinc-500 font-mono font-bold block uppercase">EXHAUST TEMP</span>
                                            <span className="text-lg font-black text-white font-mono block mt-0.5">{liveEgt} <span className="text-[9px] text-zinc-500">°C</span></span>
                                            <div className="w-full bg-white/5 h-1.5 rounded-full mt-1.5 overflow-hidden">
                                                <div 
                                                    className="h-full bg-red-500 transition-all duration-100" 
                                                    style={{ width: `${Math.min(((liveEgt - 350) / 600) * 100, 100)}%` }} 
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interactive Dyno controls */}
                                    <div className="flex gap-2.5">
                                        <button
                                            onMouseDown={() => setIsRevving(true)}
                                            onMouseUp={() => setIsRevving(false)}
                                            onMouseLeave={() => setIsRevving(false)}
                                            onTouchStart={() => setIsRevving(true)}
                                            onTouchEnd={() => setIsRevving(false)}
                                            disabled={isDynoRunning}
                                            className="flex-1 py-3.5 bg-steel-light hover:bg-steel-mid text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all border border-white/8 active:scale-[0.98] select-none text-center"
                                        >
                                            Press & Hold Throttle
                                        </button>
                                        
                                        <button
                                            onClick={runDynoPull}
                                            disabled={isDynoRunning}
                                            className="flex-1 py-3.5 bg-signal-orange hover:bg-orange-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all active:scale-[0.98] shadow-md shadow-orange-500/10 text-center"
                                        >
                                            {isDynoRunning ? 'Dyno sweeping...' : 'Run Dyno Pull'}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Live Dyno Graph Plots (Rendered only on Dyno sweep trigger or done) */}
                            {dynoPoints.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="rounded-3xl bg-steel border border-white/8 p-6 shadow-xl glass-panel relative overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                        <div>
                                            <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest flex items-center gap-1.5">
                                                <TrendingUp className="h-4 w-4 text-cyan-400" /> Dyno Engine Diagnostics Graph
                                            </h3>
                                            <p className="text-[10px] text-zinc-500 font-bold font-mono">TORQUE (CYAN / NM) VS HORSEPOWER (ORANGE / WHP) PLOTTED AGAINST RPM</p>
                                        </div>
                                        
                                        <button 
                                            onClick={() => {
                                                setDynoPoints([]);
                                                setShowDynoCertificate(false);
                                            }}
                                            className="text-zinc-500 hover:text-white transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                        {/* Dyno curves plot */}
                                        <div className="md:col-span-3 h-52 bg-carbon/50 border border-white/5 rounded-2xl relative p-4">
                                            {/* Graph layout background grids */}
                                            <svg className="w-full h-full" viewBox="0 0 500 150">
                                                <g stroke="rgba(255,255,255,0.03)" strokeWidth="1">
                                                    <line x1="0" y1="25" x2="500" y2="25" />
                                                    <line x1="0" y1="50" x2="500" y2="50" />
                                                    <line x1="0" y1="75" x2="500" y2="75" />
                                                    <line x1="0" y1="100" x2="500" y2="100" />
                                                    <line x1="0" y1="125" x2="500" y2="125" />
                                                    
                                                    <line x1="83" y1="0" x2="83" y2="150" />
                                                    <line x1="166" y1="0" x2="166" y2="150" />
                                                    <line x1="250" y1="0" x2="250" y2="150" />
                                                    <line x1="333" y1="0" x2="333" y2="150" />
                                                    <line x1="416" y1="0" x2="416" y2="150" />
                                                </g>

                                                {/* Curves render */}
                                                {/* Torque (Cyan) */}
                                                <path 
                                                    d={`M ${dynoPoints.map((pt, idx) => {
                                                        const x = (idx / dynoPoints.length) * 500;
                                                        // Max torque scales to 150 height
                                                        const y = 140 - (pt.tq / 600) * 110; 
                                                        return `${x},${y}`;
                                                    }).join(' L ')}`}
                                                    fill="none"
                                                    stroke="#22d3ee"
                                                    strokeWidth="2.5"
                                                    className="transition-all duration-75"
                                                />

                                                {/* Horsepower (Orange) */}
                                                <path 
                                                    d={`M ${dynoPoints.map((pt, idx) => {
                                                        const x = (idx / dynoPoints.length) * 500;
                                                        const y = 140 - (pt.hp / 600) * 110; 
                                                        return `${x},${y}`;
                                                    }).join(' L ')}`}
                                                    fill="none"
                                                    stroke="#f97316"
                                                    strokeWidth="2.5"
                                                    className="transition-all duration-75"
                                                />
                                            </svg>
                                        </div>

                                        {/* Dyno certification results */}
                                        <div className="bg-[#0c0c0e] border border-white/8 rounded-2xl p-4 h-full flex flex-col justify-center text-center md:text-left relative">
                                            {showDynoCertificate && peakDynoStats ? (
                                                <div className="space-y-3 animate-in fade-in duration-500">
                                                    <div>
                                                        <span className="text-[9px] font-black text-signal-orange font-mono uppercase tracking-widest block">Peak Power Output</span>
                                                        <p className="text-3xl font-black text-white font-mono leading-none mt-1">
                                                            {peakDynoStats.hp} <span className="text-xs text-zinc-500 font-bold">WHP</span>
                                                        </p>
                                                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">@ {peakDynoStats.hpRpm} RPM</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-black text-cyan-400 font-mono uppercase tracking-widest block">Peak Crank Torque</span>
                                                        <p className="text-3xl font-black text-white font-mono leading-none mt-1">
                                                            {peakDynoStats.tq} <span className="text-xs text-zinc-500 font-bold">Nm</span>
                                                        </p>
                                                        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">@ {peakDynoStats.tqRpm} RPM</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="py-8 text-center text-zinc-600 font-mono text-xs animate-pulse uppercase">
                                                    Sweep sweep... plotting power curves
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Main specifications table, Investment breakdown and Provenance Log */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                                
                                {/* A. Spec Sheet details & Cost Breakdown (5 cols) */}
                                <div className="lg:col-span-5 space-y-6">
                                    
                                    {/* 1. Spec Sheet wall */}
                                    <div className="rounded-3xl bg-steel border border-white/8 p-6 shadow-xl glass-panel">
                                        <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest mb-4 border-b border-white/5 pb-3 flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-signal-orange" /> Technical Spec Sheet
                                        </h3>
                                        
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                                <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Engine Layout</span>
                                                <span className="text-xs font-bold text-white block truncate mt-0.5">{activeSpecs?.engine || 'Naturally Aspirated / Inline'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                                <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Gearbox Type</span>
                                                <span className="text-xs font-bold text-white block truncate mt-0.5">{activeSpecs?.transmission || 'Manual'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                                <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Chassis Code</span>
                                                <span className="text-xs font-bold text-white block truncate mt-0.5">{activeSpecs?.chassisCode || 'N/A'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                                <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Drivetrain layout</span>
                                                <span className="text-xs font-bold text-white block truncate mt-0.5">{activeSpecs?.drivetrain || 'RWD'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                                <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Power / Dyno Spec</span>
                                                <span className="text-xs font-bold text-white block truncate mt-0.5">
                                                    {activeSpecs?.power ? `${activeSpecs.power} HP` : '320 HP'}
                                                    {activeSpecs?.torque ? ` / ${activeSpecs.torque} Nm` : ' / 410 Nm'}
                                                </span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                                <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Kerb Weight (kg)</span>
                                                <span className="text-xs font-bold text-white block truncate mt-0.5">{activeSpecs?.weight ? `${activeSpecs.weight} kg` : '1450 kg'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                                <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Paint Color / Spec</span>
                                                <span className="text-xs font-bold text-white block truncate mt-0.5">{activeSpecs?.color || 'OEM Spec'}</span>
                                            </div>
                                            <div className="p-3 bg-white/2 border border-white/5 rounded-xl">
                                                <span className="text-[8px] text-zinc-500 uppercase font-mono font-bold block">Mileage Reading</span>
                                                <span className="text-xs font-bold text-white block truncate mt-0.5">
                                                    {activeSpecs?.mileage ? `${parseInt(activeSpecs.mileage).toLocaleString()} mi` : '84,620 mi'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 2. Concentric investment analytics meter */}
                                    <div className="rounded-3xl bg-steel border border-white/8 p-6 shadow-xl glass-panel">
                                        <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest mb-4 border-b border-white/5 pb-3">
                                            Investment Allocation
                                        </h3>

                                        <div className="grid grid-cols-2 gap-4 items-center">
                                            {/* Concentric radial rings SVG */}
                                            <div className="relative w-36 h-36 mx-auto">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                    {/* Concentric rings background */}
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
                                                    <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
                                                    <circle cx="50" cy="50" r="24" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />
                                                    <circle cx="50" cy="50" r="16" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="4" />

                                                    {/* ring 1: Mod (Orange) */}
                                                    <circle 
                                                        cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="4" 
                                                        strokeDasharray="251.2" 
                                                        strokeDashoffset={251.2 - (251.2 * Math.min(allocationData.sum ? allocationData.totals.modification / allocationData.sum : 0, 1))}
                                                        className="transition-all duration-500"
                                                    />
                                                    {/* ring 2: Repair (Red) */}
                                                    <circle 
                                                        cx="50" cy="50" r="32" fill="none" stroke="#ef4444" strokeWidth="4" 
                                                        strokeDasharray="201" 
                                                        strokeDashoffset={201 - (201 * Math.min(allocationData.sum ? allocationData.totals.repair / allocationData.sum : 0, 1))}
                                                        className="transition-all duration-500"
                                                    />
                                                    {/* ring 3: Maintenance (Blue) */}
                                                    <circle 
                                                        cx="50" cy="50" r="24" fill="none" stroke="#3b82f6" strokeWidth="4" 
                                                        strokeDasharray="150.7" 
                                                        strokeDashoffset={150.7 - (150.7 * Math.min(allocationData.sum ? allocationData.totals.maintenance / allocationData.sum : 0, 1))}
                                                        className="transition-all duration-500"
                                                    />
                                                    {/* ring 4: Detail (Green) */}
                                                    <circle 
                                                        cx="50" cy="50" r="16" fill="none" stroke="#10b981" strokeWidth="4" 
                                                        strokeDasharray="100.5" 
                                                        strokeDashoffset={100.5 - (100.5 * Math.min(allocationData.sum ? allocationData.totals.detailing / allocationData.sum : 0, 1))}
                                                        className="transition-all duration-500"
                                                    />
                                                </svg>
                                                
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-none select-none">
                                                    <span className="text-[8px] text-zinc-500 font-mono font-bold uppercase block">TOTAL</span>
                                                    <span className="text-sm font-black text-white font-mono mt-0.5">
                                                        ${allocationData.sum.toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Details list */}
                                            <div className="space-y-2 font-mono text-[10px]">
                                                <div className="flex justify-between items-center border-l-2 border-orange-500 pl-2">
                                                    <span className="text-zinc-400 font-bold uppercase">MODS</span>
                                                    <span className="text-white font-bold">${allocationData.totals.modification.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-l-2 border-red-500 pl-2">
                                                    <span className="text-zinc-400 font-bold uppercase">REPAIRS</span>
                                                    <span className="text-white font-bold">${allocationData.totals.repair.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-l-2 border-blue-500 pl-2">
                                                    <span className="text-zinc-400 font-bold uppercase">MAINT</span>
                                                    <span className="text-white font-bold">${allocationData.totals.maintenance.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between items-center border-l-2 border-emerald-500 pl-2">
                                                    <span className="text-zinc-400 font-bold uppercase">DETAIL</span>
                                                    <span className="text-white font-bold">${allocationData.totals.detailing.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* B. Provenance Log Timeline (7 cols) */}
                                <div className="lg:col-span-7 rounded-3xl bg-steel border border-white/8 p-6 flex flex-col justify-between shadow-xl glass-panel min-h-[400px]">
                                    <div>
                                        <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-3">
                                            <h3 className="text-sm font-black text-white font-mono uppercase tracking-widest flex items-center gap-2">
                                                <Wrench className="h-4 w-4 text-signal-orange animate-pulse" />
                                                Chassis Service History Log
                                            </h3>
                                            
                                            <button 
                                                onClick={() => setShowLogModal(true)}
                                                className="px-4 py-2 text-[10px] font-black bg-signal-orange hover:bg-orange-600 text-white rounded-lg transition-all uppercase tracking-wider active:scale-95 shadow-md shadow-orange-500/10"
                                            >
                                                + Record Log
                                            </button>
                                        </div>

                                        {/* Glowing Laser Vertical Timeline Track */}
                                        <div className="relative pl-6 space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            {/* Glowing laser line */}
                                            <div className="absolute left-2.5 top-2 bottom-6 w-0.5 bg-gradient-to-b from-signal-orange via-blue-500 to-steel-light shadow-[0_0_8px_#f97316]" />

                                            {filteredLogs.length === 0 ? (
                                                <div className="py-16 text-center text-zinc-500 font-mono text-xs font-bold uppercase">
                                                    No service records found. Try clearing the blueprint HUD filter.
                                                </div>
                                            ) : (
                                                filteredLogs.map((log, idx) => {
                                                    const isMod = log.service_type === 'modification';
                                                    const isRepair = log.service_type === 'repair';
                                                    const isDetail = log.service_type === 'detailing';

                                                    // Border styling matching category colors
                                                    const logColor = isMod 
                                                        ? 'border-signal-orange/30 shadow-[0_0_15px_rgba(249,115,22,0.06)]' 
                                                        : isRepair 
                                                            ? 'border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.06)]' 
                                                            : isDetail 
                                                                ? 'border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.06)]' 
                                                                : 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.06)]';
                                                    
                                                    const bulletColor = isMod 
                                                        ? 'bg-signal-orange shadow-[0_0_8px_#f97316]' 
                                                        : isRepair 
                                                            ? 'bg-red-500 shadow-[0_0_8px_#ef4444]' 
                                                            : isDetail 
                                                                ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' 
                                                                : 'bg-blue-500 shadow-[0_0_8px_#3b82f6]';

                                                    const dateStr = new Date(log.occurred_at).toLocaleDateString([], { 
                                                        month: 'short', 
                                                        year: 'numeric' 
                                                    });

                                                    return (
                                                        <div key={log.id || idx} className="relative group">
                                                            {/* Bullets positioning */}
                                                            <div className={`absolute -left-[20px] top-1.5 w-3 h-3 rounded-full ${bulletColor} border-2 border-steel z-10 transition-transform group-hover:scale-125`} />

                                                            {/* Glass card panel */}
                                                            <div className={`bg-white/2 border rounded-2xl p-4 transition-all hover:bg-white/4 ${logColor}`}>
                                                                <div className="flex justify-between items-start">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase">{dateStr}</span>
                                                                        <span className="text-[8px] bg-white/5 border border-white/5 px-2 py-0.5 rounded font-mono font-black uppercase text-zinc-400">
                                                                            {log.service_type}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-xs font-black text-white font-mono bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                                                        {log.cost_amount ? `$${log.cost_amount.toLocaleString()}` : 'No Cost'}
                                                                    </span>
                                                                </div>

                                                                <h4 className="text-sm font-black text-white mt-1.5 uppercase tracking-tight group-hover:text-signal-orange transition-colors">
                                                                    {log.title}
                                                                </h4>
                                                                <p className="text-xs text-text-dim mt-1 leading-relaxed">
                                                                    {log.description}
                                                                </p>

                                                                <div className="flex items-center justify-between mt-3 border-t border-white/5 pt-2">
                                                                    {log.odometer_reading ? (
                                                                        <span className="text-[9px] font-mono text-zinc-500 font-bold bg-white/2 px-2 py-0.5 rounded">
                                                                            Odometer: {log.odometer_reading.toLocaleString()} mi
                                                                        </span>
                                                                    ) : (
                                                                        <div />
                                                                    )}

                                                                    {/* Simulated invoice attachment node */}
                                                                    {log.description.includes('[Attached') && (
                                                                        <button 
                                                                            onClick={() => setSelectedInvoice({
                                                                                title: log.title,
                                                                                cost: log.cost_amount,
                                                                                date: dateStr,
                                                                                type: log.service_type,
                                                                                notes: log.description
                                                                            })}
                                                                            className="flex items-center gap-1 text-[9px] font-black text-signal-orange bg-signal-orange/10 border border-signal-orange/20 px-2 py-0.5 rounded-md hover:bg-signal-orange hover:text-white transition-all uppercase font-mono tracking-wider"
                                                                        >
                                                                            <Paperclip className="h-2.5 w-2.5" /> View Receipt
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                    
                                    <Link 
                                        href={`/vehicle/${activeVehicle.id}`}
                                        className="w-full mt-4 py-3.5 rounded-xl border border-white/8 hover:border-white/20 text-text-dim hover:text-white text-xs uppercase tracking-wider font-mono font-bold transition-all flex items-center justify-center gap-2 bg-white/1"
                                    >
                                        Inspect Global Ledgers Ledger <ArrowUpRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── 2-STEP WIZARD REGISTER VEHICLE MODAL ── */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowModal(false)}
                            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                        />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-[#0b0b0d] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <div>
                                    <span className="text-signal-orange text-[9px] font-mono font-bold uppercase tracking-widest block">CHASSIS REGISTRY — STEP {wizardStep} OF 2</span>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Record Vehicle Identity</h3>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleAddVehicle} className="space-y-4">
                                {wizardStep === 1 ? (
                                    /* STEP 1: Core details */
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Make / Manufacturer</label>
                                                <input 
                                                    type="text" 
                                                    value={make}
                                                    onChange={e => setMake(e.target.value)}
                                                    required
                                                    placeholder="BMW / Toyota"
                                                    className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none focus:border-signal-orange/40 font-bold font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Model Name</label>
                                                <input 
                                                    type="text" 
                                                    value={model}
                                                    onChange={e => setModel(e.target.value)}
                                                    required
                                                    placeholder="M3 (E46) / Supra"
                                                    className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none focus:border-signal-orange/40 font-bold font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Build Year</label>
                                                <input 
                                                    type="number" 
                                                    value={year}
                                                    onChange={e => setYear(e.target.value)}
                                                    required
                                                    placeholder="2003"
                                                    className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none focus:border-signal-orange/40 font-bold font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Trim Specification</label>
                                                <input 
                                                    type="text" 
                                                    value={trim}
                                                    onChange={e => setTrim(e.target.value)}
                                                    placeholder="e.g. CSL / Coupe"
                                                    className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none focus:border-signal-orange/40 font-bold font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Chassis Code</label>
                                                <input 
                                                    type="text" 
                                                    value={chassisCode}
                                                    onChange={e => setChassisCode(e.target.value)}
                                                    placeholder="e.g. E46 / JZA80"
                                                    className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none font-bold font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Current Odometer (mi)</label>
                                                <input 
                                                    type="number" 
                                                    value={mileage}
                                                    onChange={e => setMileage(e.target.value)}
                                                    placeholder="e.g. 84500"
                                                    className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none font-bold font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">VIN Serial Number</label>
                                            <input 
                                                type="text" 
                                                value={vin}
                                                onChange={e => setVin(e.target.value)}
                                                placeholder="e.g. WBA333XE46CSL007"
                                                className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none font-bold font-mono"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* STEP 2: Spec configurations & Images */
                                    <div className="space-y-4 animate-in fade-in duration-300">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Engine Code / Specs</label>
                                                <input 
                                                    type="text" 
                                                    value={engine}
                                                    onChange={e => setEngine(e.target.value)}
                                                    placeholder="e.g. 3.2L S54 Inline-6"
                                                    className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none font-bold font-mono"
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Power (HP)</label>
                                                    <input 
                                                        type="number" 
                                                        value={power}
                                                        onChange={e => setPower(e.target.value)}
                                                        placeholder="343"
                                                        className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none font-bold font-mono"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Torque (Nm)</label>
                                                    <input 
                                                        type="number" 
                                                        value={torque}
                                                        onChange={e => setTorque(e.target.value)}
                                                        placeholder="365"
                                                        className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none font-bold font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1.5">
                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Gearbox Type</label>
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

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Drivetrain Configuration</label>
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
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Tuning Level</label>
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
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Body Paint Color Code</label>
                                                <input 
                                                    type="text" 
                                                    value={color}
                                                    onChange={e => setColor(e.target.value)}
                                                    placeholder="Royal Sapphire / Chalk Grey"
                                                    className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none font-bold font-mono"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Weight (kg)</label>
                                                <input 
                                                    type="number" 
                                                    value={weight}
                                                    onChange={e => setWeight(e.target.value)}
                                                    placeholder="1480"
                                                    className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none font-bold font-mono"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <ImageUpload 
                                                value={customImage} 
                                                onChange={setCustomImage} 
                                                label="Upload custom cover photo" 
                                            />
                                            
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black text-zinc-500 uppercase font-mono block">Or select from presets</label>
                                                <div className="flex gap-2 overflow-x-auto py-1 no-scrollbar">
                                                    {PRESET_VEHICLE_IMAGES.map((img, idx) => (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => {
                                                                setSelectedImage(img.url);
                                                                setCustomImage('');
                                                            }}
                                                            className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                                                                selectedImage === img.url && !customImage ? 'border-signal-orange scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                                                            }`}
                                                        >
                                                            <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                                                        </button>
                                                    ))}
                                                </div>
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

                                <div className="flex gap-3 pt-3 border-t border-white/5">
                                    {wizardStep === 2 && (
                                        <button
                                            type="button"
                                            onClick={() => setWizardStep(1)}
                                            className="px-5 py-3 border border-white/10 hover:border-white/20 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
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
                                            ? 'Registering...' 
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

            {/* ── RECORD PROVENANCE SERVICE LOG MODAL ── */}
            <AnimatePresence>
                {showLogModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.8 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLogModal(false)}
                            className="absolute inset-0 bg-black/85 backdrop-blur-sm"
                        />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-[#0b0b0d] border border-white/10 rounded-3xl p-6 w-full max-w-lg relative z-10 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
                        >
                            <div className="flex justify-between items-center pb-3 border-b border-white/5">
                                <div>
                                    <span className="text-signal-orange text-[9px] font-mono font-bold uppercase tracking-widest block">TELEMETRY RECORDING</span>
                                    <h3 className="text-lg font-black text-white uppercase italic tracking-tight">Record Provenance Log</h3>
                                </div>
                                <button onClick={() => setShowLogModal(false)} className="text-zinc-500 hover:text-white transition-colors p-1.5 rounded-lg bg-white/5 border border-white/10">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <form onSubmit={handleAddLog} className="space-y-4">
                                
                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Quick Suggestions</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SUGGESTIONS.map(sugg => (
                                            <button
                                                key={sugg.label}
                                                type="button"
                                                onClick={() => {
                                                    setLogTitle(sugg.label);
                                                    setLogType(sugg.type);
                                                }}
                                                className="px-2.5 py-1 bg-white/2 border border-white/5 rounded-lg hover:border-signal-orange/40 hover:bg-signal-orange/2 text-[10px] text-zinc-300 font-bold transition-all font-mono"
                                            >
                                                {sugg.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Log Title</label>
                                    <input 
                                        type="text" 
                                        value={logTitle}
                                        onChange={e => setLogTitle(e.target.value)}
                                        required
                                        placeholder="e.g. Brembo Brakes Swap, Oil Change..."
                                        className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none font-bold focus:border-signal-orange/40 font-mono"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono block">Service Type</label>
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
                                                        ? 'border-white bg-white text-carbon shadow-lg font-black' 
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
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Date</label>
                                        <input 
                                            type="date" 
                                            value={logDate}
                                            onChange={e => setLogDate(e.target.value)}
                                            required
                                            className="w-full px-3 py-2.5 bg-white/3 border border-white/8 rounded-xl text-white text-xs focus:outline-none focus:border-signal-orange/40 font-bold font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Cost (USD)</label>
                                        <input 
                                            type="number" 
                                            value={logCost}
                                            onChange={e => setLogCost(e.target.value)}
                                            placeholder="120"
                                            className="w-full px-3 py-2.5 bg-white/3 border border-white/8 rounded-xl text-white text-xs focus:outline-none focus:border-signal-orange/40 font-bold font-mono"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Odometer (mi)</label>
                                        <input 
                                            type="number" 
                                            value={logOdometer}
                                            onChange={e => setLogOdometer(e.target.value)}
                                            placeholder="85400"
                                            className="w-full px-3 py-2.5 bg-white/3 border border-white/8 rounded-xl text-white text-xs focus:outline-none focus:border-signal-orange/40 font-bold font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono font-bold">Details / Technical Notes</label>
                                    <textarea 
                                        value={logDescription}
                                        onChange={e => setLogDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Specific parts installed, brand names, service center location, oils used..."
                                        className="w-full px-4 py-3 bg-white/3 border border-white/8 rounded-xl text-white placeholder-text-muted text-xs focus:outline-none resize-none font-medium"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest font-mono">Attach Invoice / Receipt</label>
                                    
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
                                            <p className="text-xs text-zinc-400 font-bold font-mono">Click to upload or drag Invoice / Receipt</p>
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
                                    className="w-full py-3.5 bg-signal-orange text-white font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-orange-600 transition-all active:scale-[0.98]"
                                >
                                    {logLoading ? 'Saving Log...' : 'Record Provenance Log'}
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── HIGH FIDELITY INVOICE POPUP OVERLAY ── */}
            <AnimatePresence>
                {selectedInvoice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.85 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedInvoice(null)}
                            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        />

                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 15 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 15 }}
                            className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl space-y-5 my-8 select-none"
                        >
                            {/* Invoice details layout header */}
                            <div className="border-b-2 border-dashed border-white/10 pb-4 text-center">
                                <div className="h-12 w-12 bg-signal-orange/10 border border-signal-orange/20 text-signal-orange rounded-full flex items-center justify-center mx-auto mb-2">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <h3 className="text-base font-black text-white uppercase font-mono tracking-wide">VERIFIED INVOICE LEDGER</h3>
                                <p className="text-[9px] text-zinc-500 font-mono uppercase mt-0.5">VROOQ VERIFICATION SYSTEMS • ID #{Math.floor(100000 + Math.random() * 900000)}</p>
                            </div>

                            {/* Details table */}
                            <div className="space-y-3 font-mono text-xs border-b-2 border-dashed border-white/10 pb-4">
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span>SERVICE DESCRIPTION</span>
                                    <span className="text-white font-bold text-right truncate max-w-[180px]">{selectedInvoice.title}</span>
                                </div>
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span>SERVICE DATE</span>
                                    <span className="text-white font-bold">{selectedInvoice.date}</span>
                                </div>
                                <div className="flex justify-between items-center text-zinc-400">
                                    <span>LEDGER TYPE</span>
                                    <span className="text-white font-bold uppercase">{selectedInvoice.type}</span>
                                </div>
                                <div className="flex justify-between items-center text-zinc-400 border-t border-white/5 pt-2">
                                    <span>TOTAL RECORDED COST</span>
                                    <span className="text-signal-orange font-black text-sm">${selectedInvoice.cost ? selectedInvoice.cost.toLocaleString() : '0.00'}</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <span className="text-[8px] text-zinc-500 font-mono font-bold uppercase block">TECHNICAL SPECIFICATION NOTES</span>
                                <p className="text-[11px] text-zinc-400 leading-relaxed font-mono bg-black/30 border border-white/5 p-3 rounded-lg">
                                    {selectedInvoice.notes}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="w-full py-3 bg-white/5 border border-white/10 hover:border-white/20 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                            >
                                Close Receipt Ledger
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
