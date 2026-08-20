import { Vehicle, OilChangeRecord, ServiceStatus, StatusTier } from '../types';

export const calculateServiceStatus = (
  vehicle?: Vehicle | null,
  records?: OilChangeRecord[] | null
): ServiceStatus => {
  const safeVehicle: Vehicle = vehicle || {
    id: 'unknown',
    name: 'Vehicle',
    make: 'Unknown',
    model: 'Vehicle',
    year: 2024,
    currentMileage: 0,
    oilIntervalMiles: 8000,
    oilIntervalMonths: 6,
    preferredOil: '5W-30 Synthetic',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const safeRecords = Array.isArray(records) ? records : [];
  const currentKm = Number(safeVehicle.currentMileage || 0);
  const intervalKm = Number(safeVehicle.oilIntervalMiles || 8000);
  const intervalMonths = Number(safeVehicle.oilIntervalMonths || 6);

  // Sort vehicle records descending by date and odometer (km)
  const vehicleRecords = safeRecords
    .filter(r => r && r.vehicleId === safeVehicle.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || (b.mileage || 0) - (a.mileage || 0));

  const lastRecord = vehicleRecords[0] || null;

  let lastMileage: number | null = null;
  let lastDate: string | null = null;
  let nextMileage: number = currentKm + intervalKm;

  if (lastRecord) {
    lastMileage = Number(lastRecord.mileage || 0);
    lastDate = lastRecord.date;
    nextMileage = lastMileage + intervalKm;
  }

  const milesRemaining = nextMileage - currentKm;
  const rawPercent = intervalKm > 0 ? (milesRemaining / intervalKm) * 100 : 100;
  const percentRemaining = Math.max(0, Math.min(100, Math.round(rawPercent)));

  let estimatedDueDate: string | null = null;
  let daysRemaining: number | null = null;

  if (lastDate) {
    const lastDateObj = new Date(lastDate);
    if (!isNaN(lastDateObj.getTime())) {
      const dueObj = new Date(lastDateObj);
      dueObj.setMonth(dueObj.getMonth() + intervalMonths);
      estimatedDueDate = dueObj.toISOString().split('T')[0];

      const today = new Date();
      const diffTime = dueObj.getTime() - today.getTime();
      daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  let status: StatusTier = 'good';

  if (milesRemaining <= 0 || (daysRemaining !== null && daysRemaining <= 0)) {
    status = 'overdue';
  } else if (milesRemaining <= 1000 || (daysRemaining !== null && daysRemaining <= 30)) {
    status = 'due_soon';
  } else {
    status = 'good';
  }

  return {
    status,
    lastMileage,
    lastDate,
    nextMileage,
    milesRemaining,
    percentRemaining,
    estimatedDueDate,
    daysRemaining
  };
};

export const formatMileage = (km: number): string => {
  return new Intl.NumberFormat('en-US').format(km) + ' km';
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export const formatDateString = (dateStr: string): string => {
  if (!dateStr) return 'N/A';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return dateStr;
};
