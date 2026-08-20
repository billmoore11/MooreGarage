import React from 'react';
import { ServiceStatus, Vehicle } from '../types';
import { formatMileage, formatDateString } from '../utils/calculations';
import { AlertTriangle, CheckCircle2, Clock, Gauge, ArrowRight, SlidersHorizontal } from 'lucide-react';

interface MileageGaugeProps {
  vehicle: Vehicle;
  statusInfo: ServiceStatus;
  onLogOilChange: () => void;
  onEditInterval?: () => void;
}

export const MileageGauge: React.FC<MileageGaugeProps> = ({
  vehicle,
  statusInfo,
  onLogOilChange,
  onEditInterval,
}) => {
  const {
    status = 'good',
    lastMileage = null,
    lastDate = null,
    nextMileage = 8000,
    milesRemaining = 8000,
    percentRemaining = 100,
    estimatedDueDate = null,
    daysRemaining = null,
  } = statusInfo || {};

  const getStatusBadge = () => {
    switch (status) {
      case 'overdue':
        return (
          <span className="badge badge-overdue">
            <AlertTriangle size={14} /> Service Overdue
          </span>
        );
      case 'due_soon':
        return (
          <span className="badge badge-due_soon">
            <Clock size={14} /> Service Due Soon
          </span>
        );
      case 'good':
      default:
        return (
          <span className="badge badge-good">
            <CheckCircle2 size={14} /> Service Good
          </span>
        );
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'overdue': return '#ef4444';
      case 'due_soon': return '#f59e0b';
      case 'good': default: return '#10b981';
    }
  };

  return (
    <div className="card gauge-card">
      <style>{`
        .gauge-card {
          padding: 1.75rem;
          background: linear-gradient(145deg, #121826 0%, #172033 100%);
          position: relative;
          overflow: hidden;
        }
        .gauge-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: ${getStatusColor()};
          box-shadow: 0 0 12px ${getStatusColor()};
        }
        .gauge-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .gauge-heading-title {
          font-size: 0.8125rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .gauge-hero-container {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 2rem;
          align-items: center;
          margin-bottom: 1.75rem;
        }
        @media (max-width: 768px) {
          .gauge-hero-container {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
        }
        .next-mileage-display {
          font-size: 2.75rem;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.03em;
          color: var(--text-main);
          margin-top: 0.25rem;
          display: flex;
          align-items: baseline;
          gap: 0.75rem;
        }
        .remaining-subtext {
          font-size: 0.9375rem;
          margin-top: 0.5rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .remaining-highlight {
          font-weight: 700;
          color: ${getStatusColor()};
        }
        
        .progress-bar-track {
          height: 12px;
          background: rgba(30, 41, 59, 0.8);
          border-radius: 9999px;
          overflow: hidden;
          position: relative;
          border: 1px solid var(--border-color);
          margin-bottom: 1.5rem;
        }
        .progress-bar-fill {
          height: 100%;
          width: ${percentRemaining}%;
          background: linear-gradient(90deg, #3b82f6, ${getStatusColor()});
          border-radius: 9999px;
          transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 0 10px ${getStatusColor()};
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 1rem;
          padding-top: 1.25rem;
          border-top: 1px solid var(--border-color);
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-dim);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }
        .stat-value {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .edit-interval-badge-btn {
          background: rgba(245, 158, 11, 0.15);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #f59e0b;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 0.25rem 0.625rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          transition: var(--transition);
        }
        .edit-interval-badge-btn:hover {
          background: rgba(245, 158, 11, 0.25);
          border-color: rgba(245, 158, 11, 0.5);
          color: #ffffff;
        }
      `}</style>

      {/* Top Bar */}
      <div className="gauge-top">
        <div className="gauge-heading-title">
          <Gauge size={16} style={{ color: 'var(--accent-primary)' }} />
          <span>Next Scheduled Oil Change (km)</span>
          {onEditInterval && (
            <button
              type="button"
              className="edit-interval-badge-btn"
              onClick={onEditInterval}
              title="Edit service interval in km for this vehicle"
            >
              <SlidersHorizontal size={12} />
              <span>Edit Interval</span>
            </button>
          )}
        </div>
        {getStatusBadge()}
      </div>

      {/* Main Gauge Hero */}
      <div className="gauge-hero-container">
        <div>
          <div className="next-mileage-display mono">
            <span>{formatMileage(nextMileage)}</span>
          </div>

          <div className="remaining-subtext">
            {milesRemaining > 0 ? (
              <>
                <span className="remaining-highlight mono">{formatMileage(milesRemaining)}</span> remaining until next service
              </>
            ) : (
              <>
                <span className="remaining-highlight mono">{formatMileage(Math.abs(milesRemaining))}</span> past due service distance
              </>
            )}
          </div>
        </div>

        <button className="btn btn-primary" onClick={onLogOilChange} style={{ padding: '0.875rem 1.5rem', fontSize: '0.9375rem' }}>
          <span>Log Oil Change</span>
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Progress Bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '0.375rem', fontWeight: 600 }}>
          <span>Oil Life Remaining</span>
          <span>{percentRemaining}%</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" />
        </div>
      </div>

      {/* Stat Breakdown */}
      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-label">Current Odometer</span>
          <span className="stat-value mono">{formatMileage(vehicle?.currentMileage ?? 0)}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Last Service Odometer</span>
          <span className="stat-value mono">{lastMileage !== null ? formatMileage(lastMileage) : 'None logged'}</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Service Interval</span>
          <span className="stat-value mono">{formatMileage(vehicle?.oilIntervalMiles ?? 8000)} / {vehicle?.oilIntervalMonths ?? 6} mos</span>
        </div>

        <div className="stat-item">
          <span className="stat-label">Est. Due Date</span>
          <span className="stat-value">
            {estimatedDueDate ? formatDateString(estimatedDueDate) : 'N/A'}
            {daysRemaining !== null && (
              <span style={{ fontSize: '0.75rem', color: daysRemaining < 0 ? '#ef4444' : 'var(--text-muted)', display: 'block', fontWeight: 500 }}>
                {daysRemaining > 0 ? `${daysRemaining} days left` : `${Math.abs(daysRemaining)} days ago`}
              </span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
