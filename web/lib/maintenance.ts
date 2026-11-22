export type MaintenanceRule = {
  code:string;label:string;group:string;
  serviceType:'maintenance'|'repair'|'modification'|'other';
  odometer:'required'|'optional'|'not_needed';
  nextDueKm:boolean;
  guidance?:string;
};
// This rulebook controls FORM DATA REQUIRED at the time of recording.
// It never claims that a given part is due for replacement at a fixed interval.
export const MAINTENANCE_RULES: MaintenanceRule[] = [
  {code:'oil_change',label:'Vidange moteur + huile',group:'Moteur',serviceType:'maintenance',odometer:'required',nextDueKm:true,guidance:'Le kilométrage est indispensable pour suivre la prochaine vidange. Respecte les préconisations du constructeur pour l’échéance.'},
  {code:'oil_filter',label:'Filtre à huile',group:'Filtres',serviceType:'maintenance',odometer:'required',nextDueKm:true},
  {code:'air_filter',label:'Filtre à air',group:'Filtres',serviceType:'maintenance',odometer:'required',nextDueKm:true},
  {code:'fuel_filter',label:'Filtre à carburant',group:'Filtres',serviceType:'maintenance',odometer:'required',nextDueKm:true},
  {code:'cabin_filter',label:'Filtre habitacle',group:'Filtres',serviceType:'maintenance',odometer:'optional',nextDueKm:true},
  {code:'timing_belt',label:'Courroie de distribution + kit',group:'Distribution',serviceType:'maintenance',odometer:'required',nextDueKm:true,guidance:'Important : documente le km exact et, si connue, la date. Les délais varient fortement selon le moteur.'},
  {code:'timing_chain',label:'Chaîne de distribution',group:'Distribution',serviceType:'repair',odometer:'required',nextDueKm:false},
  {code:'accessory_belt',label:'Courroie accessoires',group:'Distribution',serviceType:'maintenance',odometer:'required',nextDueKm:true},
  {code:'water_pump',label:'Pompe à eau',group:'Refroidissement',serviceType:'repair',odometer:'required',nextDueKm:false},
  {code:'coolant',label:'Liquide de refroidissement',group:'Fluides',serviceType:'maintenance',odometer:'required',nextDueKm:true},
  {code:'brake_fluid',label:'Liquide de frein',group:'Freinage',serviceType:'maintenance',odometer:'optional',nextDueKm:true},
  {code:'brake_pads',label:'Plaquettes de frein',group:'Freinage',serviceType:'maintenance',odometer:'required',nextDueKm:false},
  {code:'brake_discs',label:'Disques de frein',group:'Freinage',serviceType:'maintenance',odometer:'required',nextDueKm:false},
  {code:'brake_caliper',label:'Étrier de frein',group:'Freinage',serviceType:'repair',odometer:'required',nextDueKm:false},
  {code:'clutch',label:'Embrayage',group:'Transmission',serviceType:'repair',odometer:'required',nextDueKm:false},
  {code:'gearbox_oil',label:'Vidange boîte de vitesses',group:'Transmission',serviceType:'maintenance',odometer:'required',nextDueKm:true},
  {code:'automatic_gearbox',label:'Entretien boîte automatique',group:'Transmission',serviceType:'maintenance',odometer:'required',nextDueKm:true},
  {code:'battery',label:'Batterie 12 V',group:'Électricité',serviceType:'repair',odometer:'optional',nextDueKm:false},
  {code:'starter',label:'Démarreur / alternateur',group:'Électricité',serviceType:'repair',odometer:'optional',nextDueKm:false},
  {code:'spark_plugs',label:'Bougies d’allumage',group:'Allumage',serviceType:'maintenance',odometer:'required',nextDueKm:true},
  {code:'glow_plugs',label:'Bougies de préchauffage',group:'Allumage',serviceType:'repair',odometer:'required',nextDueKm:false},
  {code:'injectors',label:'Injecteurs',group:'Injection',serviceType:'repair',odometer:'required',nextDueKm:false},
  {code:'turbo',label:'Turbo',group:'Moteur',serviceType:'repair',odometer:'required',nextDueKm:false},
  {code:'suspension',label:'Amortisseurs / suspensions',group:'Train roulant',serviceType:'repair',odometer:'required',nextDueKm:false},
  {code:'wheel_bearing',label:'Roulement de roue',group:'Train roulant',serviceType:'repair',odometer:'required',nextDueKm:false},
  {code:'tires',label:'Changement de pneus',group:'Pneus',serviceType:'maintenance',odometer:'required',nextDueKm:false},
  {code:'alignment',label:'Géométrie / parallélisme',group:'Pneus',serviceType:'maintenance',odometer:'optional',nextDueKm:false},
  {code:'aircon',label:'Climatisation / recharge gaz',group:'Confort',serviceType:'maintenance',odometer:'optional',nextDueKm:false},
  {code:'diagnostic',label:'Diagnostic électronique',group:'Diagnostic',serviceType:'other',odometer:'optional',nextDueKm:false},
  {code:'technical_inspection',label:'Contrôle technique',group:'Contrôle',serviceType:'other',odometer:'optional',nextDueKm:false},
  {code:'bodywork',label:'Carrosserie / peinture',group:'Carrosserie',serviceType:'repair',odometer:'not_needed',nextDueKm:false},
  {code:'windscreen',label:'Pare-brise / vitrage',group:'Carrosserie',serviceType:'repair',odometer:'not_needed',nextDueKm:false},
  {code:'cleaning',label:'Lavage / nettoyage',group:'Esthétique',serviceType:'other',odometer:'not_needed',nextDueKm:false},
  {code:'detailing',label:'Polissage / detailing',group:'Esthétique',serviceType:'other',odometer:'not_needed',nextDueKm:false},
  {code:'accessory',label:'Accessoire installé',group:'Personnalisation',serviceType:'modification',odometer:'not_needed',nextDueKm:false},
  {code:'other',label:'Autre intervention',group:'Autre',serviceType:'other',odometer:'optional',nextDueKm:false},
];
export const maintenanceRule=(code:string)=>MAINTENANCE_RULES.find(rule=>rule.code===code)||MAINTENANCE_RULES[MAINTENANCE_RULES.length-1];
