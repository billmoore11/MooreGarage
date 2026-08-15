export interface Vehicle {
  id: string;
  name: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  licensePlate?: string;
  vin?: string;
  currentMileage: number; // Current Odometer in kilometers (km)
  oilIntervalMiles: number; // Interval distance in kilometers (km)
  oilIntervalMonths: number; // Interval time in months
  preferredOil: string; // e.g. "Mobil 1 5W-30 Full Synthetic"
  oilCapacity?: string; // e.g. "6.0 Liters"
  filterPartNumber?: string; // e.g. "Motorcraft FL-500S"
  notes?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OilChangeRecord {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  mileage: number; // Odometer in kilometers (km) at time of change
  oilBrandGrade: string;
  filterBrandPart: string;
  cost: number;
  performedBy: 'self' | 'shop' | 'dealer';
  locationName?: string;
  notes?: string;
  createdAt: string;
}

export type StatusTier = 'good' | 'due_soon' | 'overdue';

export interface ServiceStatus {
  status: StatusTier;
  lastMileage: number | null;
  lastDate: string | null;
  nextMileage: number;
  milesRemaining: number; // Kilometers remaining
  percentRemaining: number;
  estimatedDueDate: string | null;
  daysRemaining: number | null;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}
