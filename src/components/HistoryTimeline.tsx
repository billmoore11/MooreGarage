import React from 'react';
import { OilChangeRecord } from '../types';
import { formatDateString, formatMileage, formatCurrency } from '../utils/calculations';
import { Calendar, Droplet, Filter, Edit2, Trash2, User, Building2, Wrench, Plus, DollarSign } from 'lucide-react';

interface HistoryTimelineProps {
  records: OilChangeRecord[];
  onLogOilChange: () => void;
  onEditRecord: (record: OilChangeRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({
  records,
  onLogOilChange,
  onEditRecord,
  onDeleteRecord,
}) => {
  const getPerformerBadge = (performedBy: 'self' | 'shop' | 'dealer') => {
    switch (performedBy) {
      case 'self':
        return (
          <span className="performer-badge badge-self">
            <Wrench size={12} /> DIY Self Service
          </span>
        );
      case 'shop':
        return (
          <span className="performer-badge badge-shop">
            <Building2 size={12} /> Independent Shop
          </span>
        );
      case 'dealer':
        return (
          <span className="performer-badge badge-dealer">
            <Building2 size={12} /> Dealership
          </span>
        );
    }
  };

  return (
    <div className="card timeline-card">
      <style>{`
        .timeline-card {
          padding: 1.5rem;
        }
        .timeline-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .timeline-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--text-main);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .records-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
        }
        .records-list::before {
          content: '';
          position: absolute;
          top: 1rem;
          bottom: 1rem;
          left: 19px;
          width: 2px;
          background: var(--border-color);
          z-index: 1;
        }
        .record-item {
          position: relative;
          z-index: 2;
          padding-left: 3.25rem;
        }
        .timeline-dot {
          position: absolute;
          left: 10px;
          top: 1.25rem;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg-card);
          border: 2px solid var(--accent-primary);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .record-box {
          background: var(--bg-input);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.125rem;
          transition: var(--transition);
        }
        .record-box:hover {
          border-color: var(--border-highlight);
        }
        .record-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .record-date-mileage {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .record-mileage-tag {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .record-date-tag {
          font-size: 0.8125rem;
          color: var(--text-muted);
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .record-details-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 0.75rem;
          margin-bottom: 0.75rem;
          font-size: 0.8125rem;
        }
        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
        }
        .detail-value {
          color: var(--text-main);
          font-weight: 600;
        }
        .performer-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.2rem 0.6rem;
          border-radius: var(--radius-sm);
          font-size: 0.75rem;
          font-weight: 600;
        }
        .badge-self { background: rgba(59, 130, 246, 0.15); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.3); }
        .badge-shop { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); }
        .badge-dealer { background: rgba(236, 72, 153, 0.15); color: #f472b6; border: 1px solid rgba(236, 72, 153, 0.3); }
        
        .record-actions {
          display: flex;
          align-items: center;
          gap: 0.375rem;
        }
        .action-btn {
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.375rem;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: var(--transition);
        }
        .action-btn:hover {
          color: var(--text-main);
          background: var(--bg-card-hover);
          border-color: var(--border-highlight);
        }
        .action-btn-delete:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
        }
        
        .empty-history {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-muted);
        }
      `}</style>

      <div className="timeline-header">
        <div className="timeline-title">
          <Droplet size={20} style={{ color: 'var(--accent-primary)' }} />
          <span>Oil Change Service History</span>
        </div>

        <button className="btn btn-secondary" onClick={onLogOilChange} style={{ fontSize: '0.8125rem' }}>
          <Plus size={14} />
          <span>Record Oil Change</span>
        </button>
      </div>

      {records.length === 0 ? (
        <div className="empty-history">
          <Droplet size={36} style={{ margin: '0 auto 1rem', opacity: 0.4, color: 'var(--accent-primary)' }} />
          <h4 style={{ color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Oil Changes Logged Yet</h4>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.25rem' }}>Record your first oil change for this vehicle to start tracking service intervals.</p>
          <button className="btn btn-primary" onClick={onLogOilChange}>
            Log First Oil Change
          </button>
        </div>
      ) : (
        <div className="records-list">
          {records.map((record) => (
            <div key={record.id} className="record-item">
              <div className="timeline-dot">
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
              </div>

              <div className="record-box">
                <div className="record-top">
                  <div className="record-date-mileage">
                    <span className="record-mileage-tag mono">{formatMileage(record.mileage)}</span>
                    <span className="record-date-tag">
                      <Calendar size={13} /> {formatDateString(record.date)}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {getPerformerBadge(record.performedBy)}
                    
                    <div className="record-actions">
                      <button
                        className="action-btn"
                        onClick={() => onEditRecord(record)}
                        title="Edit Record"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="action-btn action-btn-delete"
                        onClick={() => onDeleteRecord(record.id)}
                        title="Delete Record"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="record-details-grid">
                  <div className="detail-row">
                    <Droplet size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span>Oil: <strong className="detail-value">{record.oilBrandGrade}</strong></span>
                  </div>

                  <div className="detail-row">
                    <Filter size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span>Filter: <strong className="detail-value">{record.filterBrandPart || 'Standard'}</strong></span>
                  </div>

                  {record.cost > 0 && (
                    <div className="detail-row">
                      <DollarSign size={14} style={{ color: '#10b981' }} />
                      <span>Cost: <strong className="detail-value mono" style={{ color: '#10b981' }}>{formatCurrency(record.cost)}</strong></span>
                    </div>
                  )}

                  {record.locationName && (
                    <div className="detail-row">
                      <Building2 size={14} />
                      <span>Location: <strong className="detail-value">{record.locationName}</strong></span>
                    </div>
                  )}
                </div>

                {record.notes && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '2px solid var(--border-highlight)' }}>
                    <strong>Notes:</strong> {record.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
