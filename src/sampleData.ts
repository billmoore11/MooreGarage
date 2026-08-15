import { Vehicle, OilChangeRecord } from './types';

export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'veh-1',
    name: '2022 Ford F-150 Lariat',
    year: 2022,
    make: 'Ford',
    model: 'F-150',
    trim: '3.5L EcoBoost V6 4x4',
    licensePlate: '7XYZ89',
    vin: '1FTFW1E85NFC00129',
    currentMileage: 42850,
    oilIntervalMiles: 5000,
    oilIntervalMonths: 6,
    preferredOil: 'Motorcraft 5W-30 Full Synthetic',
    oilCapacity: '6.0 qts',
    filterPartNumber: 'Motorcraft FL-500S',
    notes: 'Requires 6 quarts with filter change. Torque drain plug to 19 ft-lbs.',
    imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=800&q=80',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2026-08-14T12:00:00Z'
  },
  {
    id: 'veh-2',
    name: '2020 Porsche 911 Carrera S',
    year: 2020,
    make: 'Porsche',
    model: '911',
    trim: '3.0L Twin-Turbo H6 (992)',
    licensePlate: 'APEX911',
    vin: 'WP0AB2A90LS204812',
    currentMileage: 18420,
    oilIntervalMiles: 7500,
    oilIntervalMonths: 12,
    preferredOil: 'Mobil 1 FS X2 5W-40 C40',
    oilCapacity: '8.7 qts',
    filterPartNumber: 'Porsche OEM 9A2-107-225-00',
    notes: 'C40 specification mandatory for OPF/GPF compatibility. Oil filter torque 25 Nm.',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=800&q=80',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2026-08-14T12:00:00Z'
  },
  {
    id: 'veh-3',
    name: '2023 Toyota RAV4 Hybrid',
    year: 2023,
    make: 'Toyota',
    model: 'RAV4',
    trim: 'XSE AWD',
    licensePlate: 'ECO439',
    vin: 'JTMBWRFV4PD098432',
    currentMileage: 31200,
    oilIntervalMiles: 10000,
    oilIntervalMonths: 12,
    preferredOil: 'Toyota Genuine 0W-16 Advanced Fuel Economy',
    oilCapacity: '4.8 qts',
    filterPartNumber: 'Toyota 90915-YZZN1',
    notes: 'Daily commuter vehicle. Ensure new crush washer is installed every drain.',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80',
    createdAt: '2024-03-01T10:00:00Z',
    updatedAt: '2026-08-14T12:00:00Z'
  }
];

export const INITIAL_OIL_CHANGES: OilChangeRecord[] = [
  // F-150 History
  {
    id: 'log-1',
    vehicleId: 'veh-1',
    date: '2026-04-10',
    mileage: 39500,
    oilBrandGrade: 'Motorcraft 5W-30 Full Synthetic',
    filterBrandPart: 'Motorcraft FL-500S',
    cost: 54.99,
    performedBy: 'self',
    locationName: 'Home Garage',
    notes: 'Replaced oil & filter. Inspected air filter.',
    createdAt: '2026-04-10T14:30:00Z'
  },
  {
    id: 'log-2',
    vehicleId: 'veh-1',
    date: '2025-10-18',
    mileage: 34200,
    oilBrandGrade: 'Pennzoil Ultra Platinum 5W-30',
    filterBrandPart: 'Motorcraft FL-500S',
    cost: 62.50,
    performedBy: 'self',
    locationName: 'Home Garage',
    notes: 'Tire rotation completed at same time.',
    createdAt: '2025-10-18T16:00:00Z'
  },
  {
    id: 'log-3',
    vehicleId: 'veh-1',
    date: '2025-04-02',
    mileage: 29100,
    oilBrandGrade: 'Mobil 1 Extended Performance 5W-30',
    filterBrandPart: 'Mobil 1 M1-212A',
    cost: 58.00,
    performedBy: 'shop',
    locationName: 'Quick Lube Pro',
    notes: 'Standard 5k service interval.',
    createdAt: '2025-04-02T11:15:00Z'
  },

  // Porsche 911 History
  {
    id: 'log-4',
    vehicleId: 'veh-2',
    date: '2026-01-20',
    mileage: 14800,
    oilBrandGrade: 'Mobil 1 FS X2 5W-40 (C40 Spec)',
    filterBrandPart: 'Porsche OEM 9A2-107-225-00',
    cost: 285.00,
    performedBy: 'dealer',
    locationName: 'Porsche Center West',
    notes: 'Annual oil service and multi-point inspection. All clear.',
    createdAt: '2026-01-20T15:00:00Z'
  },
  {
    id: 'log-5',
    vehicleId: 'veh-2',
    date: '2025-01-15',
    mileage: 8200,
    oilBrandGrade: 'Mobil 1 ESP X3 0W-40',
    filterBrandPart: 'Porsche OEM 9A2-107-225-00',
    cost: 260.00,
    performedBy: 'dealer',
    locationName: 'Porsche Center West',
    notes: 'Break-in follow up service.',
    createdAt: '2025-01-15T10:30:00Z'
  },

  // RAV4 History
  {
    id: 'log-6',
    vehicleId: 'veh-3',
    date: '2025-11-05',
    mileage: 21500,
    oilBrandGrade: 'Toyota Genuine 0W-16',
    filterBrandPart: 'Toyota 90915-YZZN1',
    cost: 48.00,
    performedBy: 'self',
    locationName: 'Home Garage',
    notes: 'Fast 20 minute service.',
    createdAt: '2025-11-05T13:00:00Z'
  },
  {
    id: 'log-7',
    vehicleId: 'veh-3',
    date: '2025-01-10',
    mileage: 11000,
    oilBrandGrade: 'Toyota Genuine 0W-16',
    filterBrandPart: 'Toyota 90915-YZZN1',
    cost: 0.00,
    performedBy: 'dealer',
    locationName: 'Toyota Care Service',
    notes: 'Covered under ToyotaCare 20k complimentary service.',
    createdAt: '2025-01-10T09:00:00Z'
  }
];
