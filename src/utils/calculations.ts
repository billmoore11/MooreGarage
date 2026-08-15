import { Vehicle, OilChangeRecord, ServiceStatus, StatusTier } from '../types';

export const calculateServiceStatus = (
  vehicle: Vehicle,
  records: OilChangeRecord[]
): ServiceStatus => {
  // Sort vehicle records descending by date and odometer (km)
  const vehicleRecords = records
    .filter(r => r.vehicleId === vehicle.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.mileage - a.mileage);

  const lastRecord = vehicleRecords[0] || null;

  let lastMileage: number | null = null;
  let lastDate: string | null = null;
  let nextMileage: number = vehicle.currentMileage + vehicle.oilIntervalMiles;

  if (lastRecord) {
    lastMileage = lastRecord.mileage;
    lastDate = lastRecord.date;
    nextMileage = lastRecord.mileage + vehicle.oilIntervalMiles;
  }

  const milesRemaining = nextMileage - vehicle.currentMileage;
  const rawPercent = (milesRemaining / vehicle.oilIntervalMiles) * 100;
  const percentRemaining = Math.max(0, Math.min(100, Math.round(rawPercent)));

  let estimatedDueDate: string | null = null;
  let daysRemaining: number | null = null;

  if (lastDate) {
    const lastDateObj = new Date(lastDate);
    const dueObj = new Date(lastDateObj);
    dueObj.setMonth(dueObj.getMonth() + vehicle.oilIntervalMonths);
    estimatedDueDate = dueObj.toISOString().split('T')[0];

    const today = new Date();
    const diffTime = dueObj.getTime() - today.getTime();
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
