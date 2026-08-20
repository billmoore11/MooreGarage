import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  Firestore 
} from 'firebase/firestore';
import { Vehicle, OilChangeRecord, FirebaseConfig } from './types';
import { INITIAL_VEHICLES, INITIAL_OIL_CHANGES } from './sampleData';

const FIREBASE_CONFIG_KEY = 'apexfleet_firebase_config_v1';
const LOCAL_VEHICLES_KEY = 'apexfleet_local_vehicles_v1';
const LOCAL_CHANGES_KEY = 'apexfleet_local_changes_v1';
const CUSTOM_INTERVALS_KEY = 'apexfleet_custom_intervals_v1';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
export let lastFirebaseError: string | null = null;

export const getSavedFirebaseConfig = (): FirebaseConfig | null => {
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse saved Firebase config', e);
  }

  // Support environment variables (.env file)
  const envApiKey = (import.meta as any).env?.VITE_FIREBASE_API_KEY;
  const envProjectId = (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      projectId: envProjectId,
      authDomain: (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || '',
      storageBucket: (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: (import.meta as any).env?.VITE_FIREBASE_APP_ID || '',
    };
  }

  return null;
};

export const saveFirebaseConfig = (config: FirebaseConfig | null) => {
  if (config) {
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
  } else {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
  }
  appInstance = null;
  dbInstance = null;
  lastFirebaseError = null;
};

export const initFirebase = (): { app: FirebaseApp | null; db: Firestore | null } => {
  if (dbInstance) return { app: appInstance, db: dbInstance };

  const config = getSavedFirebaseConfig();
  if (!config || !config.apiKey || !config.projectId) {
    return { app: null, db: null };
  }

  try {
    if (!getApps().length) {
      appInstance = initializeApp(config);
    } else {
      appInstance = getApp();
    }
    dbInstance = getFirestore(appInstance);
    return { app: appInstance, db: dbInstance };
  } catch (e: any) {
    console.error('Error initializing Firebase', e);
    lastFirebaseError = e?.message || String(e);
    return { app: null, db: null };
  }
};

// ----------------------------------------------------
// CUSTOM INTERVAL PERSISTENCE STORE
// ----------------------------------------------------
const getCustomIntervalsMap = (): Record<string, { miles: number; months: number }> => {
  try {
    const raw = localStorage.getItem(CUSTOM_INTERVALS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse custom intervals', e);
  }
  return {};
};

export const saveCustomInterval = (vehicleId: string, miles: number, months: number) => {
  const map = getCustomIntervalsMap();
  map[vehicleId] = { miles, months };
  localStorage.setItem(CUSTOM_INTERVALS_KEY, JSON.stringify(map));
};

// ----------------------------------------------------
// DATE & TIMESTAMP PARSING HELPER
// ----------------------------------------------------
const parseDateValue = (dateVal: any, timestampVal: any): string => {
  if (dateVal && typeof dateVal === 'string' && dateVal.trim().length > 0) {
    return dateVal.trim();
  }
  if (timestampVal) {
    try {
      if (typeof timestampVal === 'object' && typeof timestampVal.toDate === 'function') {
        return timestampVal.toDate().toISOString().split('T')[0];
      }
      const d = new Date(timestampVal);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {
      console.warn('Failed to parse timestamp', timestampVal);
    }
  }
  return new Date().toISOString().split('T')[0];
};

const parseTimestampMs = (dateVal: any, timestampVal: any): number => {
  if (timestampVal) {
    if (typeof timestampVal === 'object' && typeof timestampVal.toDate === 'function') {
      return timestampVal.toDate().getTime();
    }
    if (typeof timestampVal === 'number') {
      return timestampVal;
    }
    const d = new Date(timestampVal);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  if (dateVal) {
    const d = new Date(dateVal);
    if (!isNaN(d.getTime())) return d.getTime();
  }
  return 0;
};

// ----------------------------------------------------
// LOCAL STORAGE DATA LAYER
// ----------------------------------------------------
const getLocalVehicles = (): Vehicle[] => {
  const raw = localStorage.getItem(LOCAL_VEHICLES_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(INITIAL_VEHICLES));
    return INITIAL_VEHICLES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_VEHICLES;
  }
};

const saveLocalVehicles = (vehicles: Vehicle[]) => {
  localStorage.setItem(LOCAL_VEHICLES_KEY, JSON.stringify(vehicles));
};

const getLocalChanges = (): OilChangeRecord[] => {
  const raw = localStorage.getItem(LOCAL_CHANGES_KEY);
  if (!raw) {
    localStorage.setItem(LOCAL_CHANGES_KEY, JSON.stringify(INITIAL_OIL_CHANGES));
    return INITIAL_OIL_CHANGES;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return INITIAL_OIL_CHANGES;
  }
};

const saveLocalChanges = (changes: OilChangeRecord[]) => {
  localStorage.setItem(LOCAL_CHANGES_KEY, JSON.stringify(changes));
};

// ----------------------------------------------------
// DIAGNOSTIC SCANNER TO AUTO-DETECT FIRESTORE COLLECTIONS
// ----------------------------------------------------

export interface ScanResult {
  collectionName: string;
  count: number;
  sampleDocKeys: string[];
}

export const scanFirestoreCollections = async (): Promise<ScanResult[]> => {
  const { db } = initFirebase();
  if (!db) return [];

  const candidateCollections = [
    'logs', 'vehicles', 'cars', 'fleet', 'Vehicles', 'Cars', 'Fleet', 
    'Logs', 'settings', 'Settings', 'my_vehicles', 'garage',
    'oil_changes', 'oilChanges', 'records', 'services', 'history'
  ];

  const results: ScanResult[] = [];

  for (const name of candidateCollections) {
    try {
      const snap = await getDocs(collection(db, name));
      if (!snap.empty) {
        let sampleKeys: string[] = [];
        snap.forEach(d => {
          if (sampleKeys.length === 0) {
            sampleKeys = Object.keys(d.data());
          }
        });
        results.push({
          collectionName: name,
          count: snap.size,
          sampleDocKeys: sampleKeys
        });
      }
    } catch (e) {
      console.warn(`Scan for collection '${name}' skipped`, e);
    }
  }

  return results;
};

// ----------------------------------------------------
// HYBRID FIREBASE / LOCAL STORAGE CRUD API
// ----------------------------------------------------

export const fetchVehicles = async (): Promise<{ vehicles: Vehicle[]; isFirebase: boolean; error?: string }> => {
  const { db } = initFirebase();
  const customIntervals = getCustomIntervalsMap();

  if (db) {
    lastFirebaseError = null;
    let caughtError: string | null = null;
    
    const vehicleGroups = new Map<string, {
      id: string;
      name: string;
      maxMiles: number;
      rawDoc: any;
    }>();

    const possibleCollections = [
      'vehicles', 'logs', 'cars', 'fleet', 'Vehicles', 'Cars', 'Fleet', 
      'Logs', 'my_vehicles', 'garage', 'oil_changes', 'records'
    ];
    
    for (const collName of possibleCollections) {
      try {
        const snap = await getDocs(collection(db, collName));
        if (!snap.empty) {
          snap.forEach(d => {
            const data = d.data();
            const carName = (data.car || data.name || data.vehicleName || data.vehicle_name || data.title || '').toString().trim();
            const miles = Number(data.miles ?? data.mileage ?? data.currentMileage ?? data.odometer ?? 0);

            if (carName) {
              const vehicleId = carName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              const existing = vehicleGroups.get(vehicleId);
              
              if (!existing) {
                vehicleGroups.set(vehicleId, {
                  id: vehicleId,
                  name: carName,
                  maxMiles: miles,
                  rawDoc: data
                });
              } else {
                if (miles > existing.maxMiles) {
                  existing.maxMiles = miles;
                }
                // Prefer document with more fields if existing was from a log
                if (data.oilIntervalMiles || data.oil_interval_miles || data.oilIntervalKm) {
                  existing.rawDoc = { ...existing.rawDoc, ...data };
                }
              }
            } else if (data.make || data.model || data.year) {
              const vName = `${data.year || ''} ${data.make || ''} ${data.model || ''}`.trim() || d.id;
              const vehicleId = d.id;
              vehicleGroups.set(vehicleId, {
                id: vehicleId,
                name: vName,
                maxMiles: miles,
                rawDoc: data
              });
            }
          });
        }
      } catch (e: any) {
        console.warn(`Firebase query for '${collName}' error`, e);
        caughtError = e?.message || String(e);
      }
    }

    if (vehicleGroups.size > 0) {
      const vehiclesList: Vehicle[] = Array.from(vehicleGroups.values()).map(g => {
        const d = g.rawDoc;
        const savedInterval = customIntervals[g.id];
        
        const oilIntervalMiles = savedInterval
          ? savedInterval.miles
          : Number(d.oilIntervalMiles ?? d.oil_interval_miles ?? d.oilIntervalKm ?? d.intervalKm ?? d.interval ?? 8000);
        
        const oilIntervalMonths = savedInterval
          ? savedInterval.months
          : Number(d.oilIntervalMonths ?? d.oil_interval_months ?? d.intervalMonths ?? 6);

        return {
          id: g.id,
          name: g.name,
          year: Number(d.year) || new Date().getFullYear(),
          make: d.make || '',
          model: d.model || '',
          trim: d.trim || '',
          licensePlate: d.licensePlate || d.plate || '',
          vin: d.vin || '',
          currentMileage: g.maxMiles,
          oilIntervalMiles,
          oilIntervalMonths,
          preferredOil: d.preferredOil || d.oil || d.oilType || '5W-30 Full Synthetic',
          oilCapacity: d.oilCapacity || d.capacity || '',
          filterPartNumber: d.filterPartNumber || d.filter || '',
          notes: d.notes || d.comments || '',
          imageUrl: d.imageUrl || d.photo || '',
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      });

      return { vehicles: vehiclesList, isFirebase: true };
    }

    if (caughtError) {
      lastFirebaseError = caughtError;
      return { vehicles: [], isFirebase: true, error: caughtError };
    }
    return { vehicles: [], isFirebase: true };
  }
  
  // Local Storage fallback
  const localList = getLocalVehicles().map(v => {
    const saved = customIntervals[v.id];
    if (saved) {
      return { ...v, oilIntervalMiles: saved.miles, oilIntervalMonths: saved.months };
    }
    return v;
  });
  return { vehicles: localList, isFirebase: false };
};

export const upsertVehicle = async (vehicle: Vehicle): Promise<boolean> => {
  // Always save custom interval to local store and Firestore
  saveCustomInterval(vehicle.id, vehicle.oilIntervalMiles, vehicle.oilIntervalMonths);

  const { db } = initFirebase();
  if (db) {
    try {
      await setDoc(doc(db, 'vehicles', vehicle.id), vehicle, { merge: true });
    } catch (e: any) {
      console.error('Firebase save vehicle failed', e);
      lastFirebaseError = e?.message || String(e);
    }
  }
  
  const current = getLocalVehicles();
  const index = current.findIndex(v => v.id === vehicle.id);
  if (index >= 0) {
    current[index] = vehicle;
  } else {
    current.unshift(vehicle);
  }
  saveLocalVehicles(current);
  return true;
};

export const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
  const { db } = initFirebase();
  if (db) {
    try {
      await deleteDoc(doc(db, 'vehicles', vehicleId));
    } catch (e: any) {
      console.error('Firebase delete vehicle failed', e);
      lastFirebaseError = e?.message || String(e);
    }
  }

  const currentVehicles = getLocalVehicles().filter(v => v.id !== vehicleId);
  saveLocalVehicles(currentVehicles);

  const currentChanges = getLocalChanges().filter(c => c.vehicleId !== vehicleId);
  saveLocalChanges(currentChanges);
  return true;
};

export const fetchOilChanges = async (vehicleId?: string): Promise<{ records: OilChangeRecord[]; isFirebase: boolean; error?: string }> => {
  const { db } = initFirebase();
  if (db) {
    const recordMap = new Map<string, OilChangeRecord>();
    const possibleCollections = [
      'logs', 'oil_changes', 'oilChanges', 'oil_logs', 'services', 'records', 'history'
    ];

    for (const collName of possibleCollections) {
      try {
        const snap = await getDocs(collection(db, collName));
        if (!snap.empty) {
          snap.forEach(d => {
            const data = d.data();
            const carName = (data.car || data.name || data.vehicleName || data.vehicleId || '').toString().trim();
            const logVehicleId = carName ? carName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : (data.vehicleId || '');

            if (!vehicleId || logVehicleId === vehicleId || data.vehicleId === vehicleId) {
              const recDate = parseDateValue(data.date, data.timestamp);
              const miles = Number(data.miles ?? data.mileage ?? data.odometer ?? 0);
              const tsMs = parseTimestampMs(data.date, data.timestamp);

              recordMap.set(d.id, {
                id: d.id,
                vehicleId: logVehicleId || vehicleId || '',
                date: recDate,
                mileage: miles,
                oilBrandGrade: data.oilBrandGrade || data.oil || data.oilType || 'Synthetic Oil',
                filterBrandPart: data.filterBrandPart || data.filter || '',
                cost: Number(data.cost ?? data.price ?? 0),
                performedBy: String(data.performedBy || 'self').toLowerCase().includes('shop') ? 'shop' : 'self',
                locationName: data.locationName || data.location || data.shop || '',
                notes: data.notes || data.comments || '',
                createdAt: new Date(tsMs || Date.now()).toISOString()
              });
            }
          });
        }
      } catch (e: any) {
        console.warn(`Firestore query for '${collName}' error`, e);
      }
    }

    const records = Array.from(recordMap.values());
    records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.mileage - a.mileage);
    return { records, isFirebase: true };
  }

  const all = getLocalChanges();
  const filtered = vehicleId ? all.filter(r => r.vehicleId === vehicleId) : all;
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.mileage - a.mileage);
  return { records: filtered, isFirebase: false };
};

export const seedSampleDataToFirebase = async (): Promise<boolean> => {
  const { db } = initFirebase();
  if (!db) return false;
  try {
    for (const v of INITIAL_VEHICLES) {
      await setDoc(doc(db, 'vehicles', v.id), v);
    }
    for (const c of INITIAL_OIL_CHANGES) {
      await setDoc(doc(db, 'oil_changes', c.id), c);
    }
    return true;
  } catch (e: any) {
    console.error('Failed to seed sample data to Firebase', e);
    lastFirebaseError = e?.message || String(e);
    return false;
  }
};

export const upsertOilChange = async (record: OilChangeRecord): Promise<boolean> => {
  const { db } = initFirebase();
  if (db) {
    try {
      await setDoc(doc(db, 'logs', record.id), {
        car: record.vehicleId,
        miles: record.mileage,
        date: record.date,
        timestamp: new Date(record.date).getTime(),
        oil: record.oilBrandGrade,
        filter: record.filterBrandPart,
        cost: record.cost,
        notes: record.notes || ''
      });
      await setDoc(doc(db, 'oil_changes', record.id), record);
    } catch (e: any) {
      console.error('Firebase save oil change failed', e);
      lastFirebaseError = e?.message || String(e);
    }
  }

  const current = getLocalChanges();
  const index = current.findIndex(c => c.id === record.id);
  if (index >= 0) {
    current[index] = record;
  } else {
    current.unshift(record);
  }
  saveLocalChanges(current);

  const vehicles = getLocalVehicles();
  const vIndex = vehicles.findIndex(v => v.id === record.vehicleId);
  if (vIndex >= 0 && record.mileage > vehicles[vIndex].currentMileage) {
    vehicles[vIndex].currentMileage = record.mileage;
    vehicles[vIndex].updatedAt = new Date().toISOString();
    saveLocalVehicles(vehicles);
    if (db) {
      setDoc(doc(db, 'vehicles', vehicles[vIndex].id), vehicles[vIndex]).catch(console.error);
    }
  }

  return true;
};

export const deleteOilChange = async (recordId: string): Promise<boolean> => {
  const { db } = initFirebase();
  if (db) {
    try {
      await deleteDoc(doc(db, 'logs', recordId));
      await deleteDoc(doc(db, 'oil_changes', recordId));
    } catch (e: any) {
      console.error('Firebase delete oil change failed', e);
    }
  }

  const current = getLocalChanges().filter(c => c.id !== recordId);
  saveLocalChanges(current);
  return true;
};
