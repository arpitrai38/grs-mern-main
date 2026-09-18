import React, { useState, useMemo } from 'react';
import { FaChartBar, FaChartPie, FaCheckCircle, FaClock, FaExclamationCircle } from 'react-icons/fa';

const ComplaintCharts = ({ complaints = [], title = "Grievance Analytics" }) => {
  const [chartType, setChartType] = useState('bar'); // 'bar' or 'pie'
  const [metricMode, setMetricMode] = useState('status'); // 'status' or 'category'

  // Aggregate Status Stats
  const statusStats = useMemo(() => {
    const counts = { closed: 0, pending: 0, notProcessed: 0 };
    complaints.forEach((c) => {
      if (c.status === 'closed') counts.closed++;
      else if (c.status === 'pending') counts.pending++;
      else counts.notProcessed++;
    });

    const total = complaints.length;
    return [
      {
        id: 'closed',
        label: 'Resolved / Closed',
        count: counts.closed,
        percent: total > 0 ? Math.round((counts.closed / total) * 100) : 0,
        color: '#10B981',
        bg: 'var(--success-bg)',
        icon: <FaCheckCircle />
      },
      {
        id: 'pending',
        label: 'In Progress / Pending',
        count: counts.pending,
        percent: total > 0 ? Math.round((counts.pending / total) * 100) : 0,
        color: '#F59E0B',
        bg: 'var(--warning-bg)',
        icon: <FaClock />
      },
      {
        id: 'notProcessed',
        label: 'Awaiting Action / In Review',
        count: counts.notProcessed,
        percent: total > 0 ? Math.round((counts.notProcessed / total) * 100) : 0,
        color: '#3E3FD8',
        bg: 'var(--primary-light)',
        icon: <FaExclamationCircle />
      }
    ];
  }, [complaints]);

  // Aggregate Category Stats
  const categoryStats = useMemo(() => {
    const catMap = {};
    complaints.forEach((c) => {
      const catName = c.complaintType?.name || 'General';
      catMap[catName] = (catMap[catName] || 0) + 1;
    });

    const palette = ['#3E3FD8', '#EF8B8D', '#10B981', '#F59E0B', '#6366F1', '#EC4899', '#14B8A6'];
    const total = complaints.length;
    const entries = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    return entries.map(([name, count], idx) => ({
      id: name,
      label: name,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
      color: palette[idx % palette.length],
      bg: '#F8FAFC'
    }));
  }, [complaints]);

  const activeStats = metricMode === 'status' ? statusStats : categoryStats;
  const totalCount = complaints.length;
  const maxCount = Math.max(...activeStats.map((s) => s.count), 1);

  // SVG Donut Slices calculation
  const donutSlices = useMemo(() => {
    if (totalCount === 0) return [];
    let accumulatedAngle = 0;
    const radius = 70;
    const circumference = 2 * Math.PI * radius;

    return activeStats.map((item) => {
      const sliceLength = (item.count / totalCount) * circumference;
      const strokeDashoffset = -accumulatedAngle;
      accumulatedAngle += sliceLength;
      return {
        ...item,
        strokeDasharray: `${sliceLength} ${circumference}`,
        strokeDashoffset
      };
    });
  }, [activeStats, totalCount]);

  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
      {/* Chart Top Header & Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        flexWrap: 'wrap', 
        gap: '1rem',
        marginBottom: '2rem',
        paddingBottom: '1.25rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.2rem' }}>{title}</h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Interactive metrics breakdown across {totalCount} total cases
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Mode Switcher */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-page)', 
            padding: '4px', 
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setMetricMode('status')}
              style={{
                border: 'none',
                background: metricMode === 'status' ? 'var(--primary)' : 'transparent',
                color: metricMode === 'status' ? '#FFFFFF' : 'var(--text-body)',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              By Status
            </button>
            <button
              onClick={() => setMetricMode('category')}
              style={{
                border: 'none',
                background: metricMode === 'category' ? 'var(--primary)' : 'transparent',
                color: metricMode === 'category' ? '#FFFFFF' : 'var(--text-body)',
                padding: '0.35rem 0.9rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              By Department
            </button>
          </div>

          {/* Type Switcher: Bar vs Pie */}
          <div style={{ 
            display: 'flex', 
            background: 'var(--bg-page)', 
            padding: '4px', 
            borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--border)'
          }}>
            <button
              onClick={() => setChartType('bar')}
              title="Bar Chart View"
              style={{
                border: 'none',
                background: chartType === 'bar' ? '#FFFFFF' : 'transparent',
                color: chartType === 'bar' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: chartType === 'bar' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FaChartBar size={14} /> Bar
            </button>
            <button
              onClick={() => setChartType('pie')}
              title="Pie / Donut Chart View"
              style={{
                border: 'none',
                background: chartType === 'pie' ? '#FFFFFF' : 'transparent',
                color: chartType === 'pie' ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: chartType === 'pie' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <FaChartPie size={14} /> Pie
            </button>
          </div>
        </div>
      </div>

      {/* Chart Visual Content */}
      {chartType === 'bar' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.35rem' }}>
          {activeStats.map((stat) => {
            const barWidthPercent = Math.max((stat.count / maxCount) * 100, 3);
            return (
              <div key={stat.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: stat.color }} />
                    {stat.label}
                  </span>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: '800', color: 'var(--text-heading)', fontSize: '1rem' }}>
                      {stat.count}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', minWidth: '40px', textAlign: 'right' }}>
                      {stat.percent}%
                    </span>
                  </div>
                </div>

                {/* Bar Track & Fill */}
                <div style={{ 
                  width: '100%', 
                  height: '14px', 
                  backgroundColor: 'var(--bg-page)', 
                  borderRadius: '9999px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div 
                    style={{ 
                      width: `${barWidthPercent}%`, 
                      height: '100%', 
                      backgroundColor: stat.color,
                      borderRadius: '9999px',
                      transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Pie / Donut Chart View */
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'minmax(220px, 300px) 1fr', 
          alignItems: 'center', 
          gap: '2.5rem',
          padding: '1rem 0'
        }}>
          {/* SVG Donut Circle */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
            <svg width="220" height="220" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              {/* Background ring */}
              <circle
                cx="100"
                cy="100"
                r="70"
                fill="transparent"
                stroke="var(--bg-page)"
                strokeWidth="28"
              />
              {/* Slices */}
              {donutSlices.map((slice) => (
                <circle
                  key={slice.id}
                  cx="100"
                  cy="100"
                  r="70"
                  fill="transparent"
                  stroke={slice.color}
                  strokeWidth="28"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  style={{ transition: 'stroke-dashoffset 0.5s ease, stroke-dasharray 0.5s ease' }}
                />
              ))}
            </svg>

            {/* Donut Center Hole Text */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '1.9rem', fontWeight: '800', color: 'var(--text-heading)', display: 'block', lineHeight: 1 }}>
                {totalCount}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Cases
              </span>
            </div>
          </div>

          {/* Donut Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activeStats.map((stat) => (
              <div 
                key={stat.id}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ 
                    width: '14px', 
                    height: '14px', 
                    borderRadius: '4px', 
                    backgroundColor: stat.color,
                    flexShrink: 0
                  }} />
                  <span style={{ fontWeight: '700', fontSize: '0.92rem', color: 'var(--text-heading)' }}>
                    {stat.label}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontWeight: '800', color: 'var(--text-heading)', fontSize: '1.05rem' }}>
                    {stat.count}
                  </span>
                  <span style={{ 
                    fontSize: '0.78rem', 
                    fontWeight: '700', 
                    padding: '2px 8px', 
                    borderRadius: 'var(--radius-pill)', 
                    background: '#FFFFFF',
                    border: '1px solid var(--border)',
                    color: 'var(--text-body)'
                  }}>
                    {stat.percent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintCharts;
