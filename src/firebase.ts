import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  Firestore,
} from 'firebase/firestore';
import { Vehicle, OilChangeRecord } from './types';
import { INITIAL_VEHICLES, INITIAL_OIL_CHANGES } from './sampleData';

export interface FirebaseConfig {
  apiKey: string;
  projectId: string;
  authDomain?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

const FIREBASE_CONFIG_KEY = 'apexfleet_firebase_config_v1';
const LOCAL_VEHICLES_KEY = 'apexfleet_local_vehicles_v1';
const LOCAL_CHANGES_KEY = 'apexfleet_local_changes_v1';
const CUSTOM_INTERVALS_KEY = 'apexfleet_custom_intervals_v1';

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
export let lastFirebaseError: string | null = null;

// Clean string helper to remove accidental quotes/spaces from env variables
const cleanStr = (val: any): string => {
  if (!val) return '';
  return String(val).trim().replace(/^["']|["']$/g, '');
};

export const getSavedFirebaseConfig = (): FirebaseConfig | null => {
  // 1. Check URL Query Parameters for 1-click mobile auto-configuration links
  try {
    const params = new URLSearchParams(window.location.search);
    const qApiKey = cleanStr(params.get('apiKey') || params.get('key'));
    const qProjectId = cleanStr(params.get('projectId') || params.get('pid') || params.get('proj'));
    if (qApiKey && qProjectId) {
      const cfg: FirebaseConfig = {
        apiKey: qApiKey,
        projectId: qProjectId,
        authDomain: cleanStr(params.get('authDomain')) || `${qProjectId}.firebaseapp.com`,
        storageBucket: cleanStr(params.get('storageBucket')) || `${qProjectId}.appspot.com`,
      };
      localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(cfg));
      return cfg;
    }
  } catch (e) {
    console.warn('Query params config parse error', e);
  }

  // 2. Check LocalStorage
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.apiKey && parsed?.projectId) return parsed;
    }
  } catch (e) {
    console.error('Failed to parse saved Firebase config', e);
  }

  // 3. Support environment variables (.env file or Vercel Environment Variables)
  const envApiKey = cleanStr((import.meta as any).env?.VITE_FIREBASE_API_KEY);
  const envProjectId = cleanStr((import.meta as any).env?.VITE_FIREBASE_PROJECT_ID);

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      projectId: envProjectId,
      authDomain: cleanStr((import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN) || `${envProjectId}.firebaseapp.com`,
      storageBucket: cleanStr((import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET) || `${envProjectId}.appspot.com`,
      messagingSenderId: cleanStr((import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID) || '',
      appId: cleanStr((import.meta as any).env?.VITE_FIREBASE_APP_ID) || '',
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

const cleanProjectId = (val: any): string => {
  if (!val) return '';
  return String(val).trim().replace(/^["']|["']$/g, '').toLowerCase().replace(/[^a-z0-9\-]/g, '-');
};

export const initFirebase = (): { app: FirebaseApp | null; db: Firestore | null } => {
  if (dbInstance) return { app: appInstance, db: dbInstance };

  try {
    const config = getSavedFirebaseConfig();
    if (!config || !config.apiKey || !config.projectId) {
      return { app: null, db: null };
    }

    const safeProjectId = cleanProjectId(config.projectId);
    if (!safeProjectId) return { app: null, db: null };

    const safeConfig: FirebaseConfig = {
      ...config,
      projectId: safeProjectId,
      authDomain: config.authDomain || `${safeProjectId}.firebaseapp.com`,
      storageBucket: config.storageBucket || `${safeProjectId}.appspot.com`,
    };

    if (!getApps().length) {
      appInstance = initializeApp(safeConfig);
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

// Timeout wrapper helper to guarantee network calls never hang indefinitely
const withTimeout = <T>(promise: Promise<T>, ms: number = 3500, fallback: T): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
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

    const fetchCollection = async (collName: string) => {
      try {
        const snap = await getDocs(collection(db, collName));
        return { collName, docs: snap.docs.map(d => d.data()) };
      } catch (e: any) {
        if (!caughtError) caughtError = e?.message || String(e);
        return { collName, docs: [] };
      }
    };

    // Execute queries in parallel with a 3.5s timeout guard
    const queryPromises = possibleCollections.map(name => withTimeout(fetchCollection(name), 3500, { collName: name, docs: [] }));
    const results = await Promise.all(queryPromises);

    for (const res of results) {
      for (const data of res.docs) {
        const carName = (data.car || data.name || data.vehicleName || data.vehicle_name || data.title || '').toString().trim();
        const miles = Number(data.miles ?? data.mileage ?? data.currentMileage ?? data.odometer ?? 0);

        if (carName) {
          const vehicleId = carName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const existing = vehicleGroups.get(vehicleId);

          if (!existing || miles > existing.maxMiles) {
            vehicleGroups.set(vehicleId, {
              id: vehicleId,
              name: carName,
              maxMiles: miles,
              rawDoc: data,
            });
          }
        }
      }
    }

    if (vehicleGroups.size > 0) {
      const vehiclesList: Vehicle[] = Array.from(vehicleGroups.values()).map(({ id, name, maxMiles, rawDoc }) => {
        const saved = customIntervals[id];
        return {
          id,
          name,
          make: rawDoc.make || name.split(' ')[1] || 'Vehicle',
          model: rawDoc.model || name.split(' ').slice(2).join(' ') || name,
          year: Number(rawDoc.year) || (parseInt(name, 10) || 2024),
          trim: rawDoc.trim || '',
          currentMileage: maxMiles,
          oilIntervalMiles: saved?.miles || Number(rawDoc.oilIntervalMiles ?? rawDoc.intervalMiles ?? 8000),
          oilIntervalMonths: saved?.months || Number(rawDoc.oilIntervalMonths ?? rawDoc.intervalMonths ?? 6),
          preferredOil: rawDoc.preferredOil || rawDoc.oil || rawDoc.oilType || '5W-30 Synthetic',
          oilCapacity: rawDoc.oilCapacity || rawDoc.capacity || '',
          filterPartNumber: rawDoc.filterPartNumber || rawDoc.filter || '',
          licensePlate: rawDoc.licensePlate || rawDoc.plate || '',
          imageUrl: rawDoc.imageUrl || rawDoc.image || rawDoc.photo || '',
          notes: rawDoc.notes || '',
          createdAt: new Date().toISOString(),
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

export const fetchOilChanges = async (vehicleId?: string): Promise<{ records: OilChangeRecord[]; isFirebase: boolean; error?: string }> => {
  const { db } = initFirebase();
  if (db) {
    const recordMap = new Map<string, OilChangeRecord>();
    const possibleCollections = [
      'logs', 'oil_changes', 'oilChanges', 'oil_logs', 'services', 'records', 'history'
    ];

    const fetchCollection = async (collName: string) => {
      try {
        const snap = await getDocs(collection(db, collName));
        return snap.docs.map(d => ({ id: d.id, data: d.data() }));
      } catch (e: any) {
        return [];
      }
    };

    const queryPromises = possibleCollections.map(name => withTimeout(fetchCollection(name), 3500, []));
    const results = await Promise.all(queryPromises);

    for (const docs of results) {
      for (const { id, data } of docs) {
        const carName = (data.car || data.name || data.vehicleName || data.vehicleId || '').toString().trim();
        const logVehicleId = carName ? carName.toLowerCase().replace(/[^a-z0-9]+/g, '-') : (data.vehicleId || '');

        if (!vehicleId || logVehicleId === vehicleId || data.vehicleId === vehicleId) {
          const recDate = parseDateValue(data.date, data.timestamp);
          const miles = Number(data.miles ?? data.mileage ?? data.odometer ?? 0);
          const tsMs = parseTimestampMs(data.date, data.timestamp);

          recordMap.set(id, {
            id,
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

export const upsertVehicle = async (vehicle: Vehicle): Promise<boolean> => {
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
    } catch (e) {
      console.error('Firebase delete vehicle failed', e);
    }
  }

  const current = getLocalVehicles().filter(v => v.id !== vehicleId);
  saveLocalVehicles(current);
  return true;
};

export const upsertOilChange = async (record: OilChangeRecord): Promise<boolean> => {
  const { db } = initFirebase();
  if (db) {
    try {
      await setDoc(doc(db, 'oil_changes', record.id), record, { merge: true });
    } catch (e: any) {
      console.error('Firebase save oil change failed', e);
      lastFirebaseError = e?.message || String(e);
    }
  }

  const current = getLocalChanges();
  const index = current.findIndex(r => r.id === record.id);
  if (index >= 0) {
    current[index] = record;
  } else {
    current.unshift(record);
  }
  saveLocalChanges(current);
  return true;
};

export const deleteOilChange = async (recordId: string): Promise<boolean> => {
  const { db } = initFirebase();
  if (db) {
    try {
      await deleteDoc(doc(db, 'oil_changes', recordId));
    } catch (e) {
      console.error('Firebase delete oil change failed', e);
    }
  }

  const current = getLocalChanges().filter(r => r.id !== recordId);
  saveLocalChanges(current);
  return true;
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
    console.error('Error seeding sample data to Firebase', e);
    lastFirebaseError = e?.message || String(e);
    return false;
  }
};
