import React, { useState } from 'react';
import { Claim } from '../types';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  IndianRupee,
  Layers,
  PieChart as PieIcon,
  BarChart3,
  Percent,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';

interface AdminAnalyticsSummaryProps {
  claims: Claim[];
}

export const AdminAnalyticsSummary: React.FC<AdminAnalyticsSummaryProps> = ({ claims }) => {
  const [activeChartTab, setActiveChartTab] = useState<'status-bars' | 'cashback-flow' | 'platform-share'>('status-bars');

  // Core metrics
  const totalClaims = claims.length;
  const pendingClaims = claims.filter((c) => c.status === 'Pending').length;
  const approvedClaims = claims.filter((c) => c.status === 'Approved').length;
  const rejectedClaims = claims.filter((c) => c.status === 'Rejected').length;

  const totalCashbackDisbursed = claims
    .filter((c) => c.status === 'Approved')
    .reduce((sum, c) => sum + (c.cashbackAmount || 150), 0);

  const pendingCashbackLiability = claims
    .filter((c) => c.status === 'Pending')
    .reduce((sum, c) => sum + (c.cashbackAmount || 150), 0);

  const approvalRate = totalClaims > 0 ? Math.round((approvedClaims / totalClaims) * 100) : 0;
  const avgCashback = approvedClaims > 0 ? Math.round(totalCashbackDisbursed / approvedClaims) : 0;

  // Data for Status Bar Chart
  const statusChartData = [
    {
      name: 'Total Claims',
      count: totalClaims,
      amount: claims.reduce((sum, c) => sum + (c.cashbackAmount || 150), 0),
      fill: '#6366f1', // Indigo
      badge: 'All Submitted'
    },
    {
      name: 'Pending Approvals',
      count: pendingClaims,
      amount: pendingCashbackLiability,
      fill: '#f59e0b', // Amber
      badge: 'Needs Review'
    },
    {
      name: 'Approved (Paid)',
      count: approvedClaims,
      amount: totalCashbackDisbursed,
      fill: '#10b981', // Emerald
      badge: 'Disbursed'
    },
    {
      name: 'Rejected',
      count: rejectedClaims,
      amount: claims
        .filter((c) => c.status === 'Rejected')
        .reduce((sum, c) => sum + (c.cashbackAmount || 150), 0),
      fill: '#f43f5e', // Rose
      badge: 'Denied'
    }
  ];

  // Data by Merchant Platform (Amazon, Flipkart, Blinkit, Other)
  const platforms = ['Amazon', 'Flipkart', 'Blinkit'];
  const platformSummaryData = platforms.map((platform) => {
    const platformClaims = claims.filter((c) => c.platform === platform);
    const approved = platformClaims.filter((c) => c.status === 'Approved');
    const pending = platformClaims.filter((c) => c.status === 'Pending');
    const disbursed = approved.reduce((sum, c) => sum + (c.cashbackAmount || 150), 0);
    const liability = pending.reduce((sum, c) => sum + (c.cashbackAmount || 150), 0);

    return {
      platform,
      totalCount: platformClaims.length,
      pendingCount: pending.length,
      approvedCount: approved.length,
      cashbackDisbursed: disbursed,
      pendingLiability: liability
    };
  });

  // Pie chart data for Platform Cashback Disbursed share
  const COLORS = ['#f59e0b', '#2563eb', '#10b981', '#8b5cf6'];
  const platformPieData = platformSummaryData
    .map((item, index) => ({
      name: item.platform,
      value: item.cashbackDisbursed || 1, // Fallback for empty
      count: item.approvedCount,
      color: COLORS[index % COLORS.length]
    }))
    .filter((item) => item.value > 0);

  // Status Distribution Pie
  const statusPieData = [
    { name: 'Pending Review', value: pendingClaims, color: '#f59e0b' },
    { name: 'Approved & Paid', value: approvedClaims, color: '#10b981' },
    { name: 'Rejected', value: rejectedClaims, color: '#f43f5e' }
  ].filter((item) => item.value > 0);

  // Custom Tooltip for Recharts
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1 backdrop-blur-md">
          <p className="font-bold text-slate-100 flex items-center justify-between gap-3">
            <span>{label}</span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">
              {data.badge}
            </span>
          </p>
          <div className="pt-1 border-t border-slate-800 space-y-0.5">
            <p className="text-slate-300">
              Claim Count: <span className="font-bold text-white font-mono">{data.count}</span>
            </p>
            <p className="text-slate-300">
              Total Cashback Value:{' '}
              <span className="font-bold text-emerald-400 font-mono">₹{data.amount}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomCurrencyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-xl border border-slate-700 text-xs space-y-1">
          <p className="font-bold text-slate-200">{label}</p>
          <div className="pt-1 border-t border-slate-800 space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                  {entry.name}:
                </span>
                <span className="font-bold font-mono">₹{entry.value}</span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs">
          <p className="font-bold" style={{ color: data.payload.color }}>
            {data.name}
          </p>
          <p className="text-slate-300 mt-0.5">
            Value: <span className="font-mono font-bold text-white">₹{data.value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Analytics Summary Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap justify-between items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Recharts Analytics & Disbursement Summary
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Visual overview of submitted claims volume, pending verification queue & disbursed cashback totals.
            </p>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs flex items-center gap-2">
              <Percent className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300">Approval Rate:</span>
              <span className="font-bold text-emerald-400 font-mono">{approvalRate}%</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs flex items-center gap-2">
              <IndianRupee className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-slate-300">Avg Cashback:</span>
              <span className="font-bold text-amber-300 font-mono">₹{avgCashback}</span>
            </div>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
      </div>

      {/* 3 Featured KPI Cards Visualizing the Target Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Total Claims */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Claims
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-slate-900 font-mono">{totalClaims}</span>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  100% Submissions
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Approved: <strong className="text-emerald-600 font-bold">{approvedClaims}</strong></span>
            <span>•</span>
            <span>Rejected: <strong className="text-rose-600 font-bold">{rejectedClaims}</strong></span>
            <span>•</span>
            <span>Pending: <strong className="text-amber-600 font-bold">{pendingClaims}</strong></span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: totalClaims ? `${(approvedClaims / totalClaims) * 100}%` : '0%' }}
              title="Approved"
            ></div>
            <div
              className="bg-amber-500 h-full"
              style={{ width: totalClaims ? `${(pendingClaims / totalClaims) * 100}%` : '0%' }}
              title="Pending"
            ></div>
            <div
              className="bg-rose-500 h-full"
              style={{ width: totalClaims ? `${(rejectedClaims / totalClaims) * 100}%` : '0%' }}
              title="Rejected"
            ></div>
          </div>
        </div>

        {/* Metric 2: Pending Approvals */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Pending Approvals
              </span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-amber-600 font-mono">{pendingClaims}</span>
                {pendingClaims > 0 ? (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 animate-pulse">
                    Action Needed
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    All Caught Up
                  </span>
                )}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-inner">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Pending Payout Liability:</span>
            <span className="font-bold text-amber-700 font-mono">₹{pendingCashbackLiability}</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            Awaiting screenshot inspection & UPI verification in table below.
          </p>
        </div>

        {/* Metric 3: Total Cashback Disbursed */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/90 relative overflow-hidden group hover:shadow-md transition">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Total Cashback Disbursed
              </span>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-4xl font-black text-emerald-600 font-mono">
                  ₹{totalCashbackDisbursed}
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-inner">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Successfully Credited Claims:</span>
            <span className="font-bold text-emerald-700 font-mono">{approvedClaims} orders</span>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            Directly transferred to customer verified UPI handles.
          </p>
        </div>
      </div>

      {/* Main Interactive Recharts Charts Grid */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
        {/* Chart View Selector Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-bold text-slate-900 text-base">Recharts Dynamic Data Visualizations</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Select visual mode to inspect claims count, cashback disbursements, or merchant platform distribution.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveChartTab('status-bars')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeChartTab === 'status-bars'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Claims Volume & Status</span>
            </button>

            <button
              onClick={() => setActiveChartTab('cashback-flow')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeChartTab === 'cashback-flow'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <IndianRupee className="w-3.5 h-3.5" />
              <span>Disbursed vs Pending (₹)</span>
            </button>

            <button
              onClick={() => setActiveChartTab('platform-share')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                activeChartTab === 'platform-share'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Merchant Distribution</span>
            </button>
          </div>
        </div>

        {/* View 1: Status & Claims Volume BarChart */}
        {activeChartTab === 'status-bars' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>Bar visualization comparing Total Claims, Pending Approvals, Approved, and Rejected volume.</span>
              <span className="font-semibold text-slate-700">Hover bars to view exact cashback values</span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusChartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar
                    dataKey="count"
                    name="Claim Count"
                    radius={[10, 10, 0, 0]}
                    animationDuration={1000}
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick summary footer under the chart */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {statusChartData.map((item) => (
                <div key={item.name} className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }}></span>
                    <span className="text-[11px] font-bold text-slate-600">{item.name}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-black text-slate-900 font-mono">{item.count}</span>
                    <span className="text-[11px] font-bold text-slate-500 font-mono">₹{item.amount}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 2: Cashback Disbursed vs Pending Liability by Merchant Platform */}
        {activeChartTab === 'cashback-flow' && (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>Comparing Total Cashback Disbursed (Paid) vs Pending Liability (Awaiting Approval) by Store.</span>
              <span className="font-semibold text-emerald-600">Disbursed Total: ₹{totalCashbackDisbursed}</span>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformSummaryData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="platform"
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <Tooltip content={<CustomCurrencyTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ paddingBottom: 15, fontSize: 12, fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="cashbackDisbursed"
                    name="Cashback Disbursed (₹)"
                    fill="#10b981"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="pendingLiability"
                    name="Pending Liability (₹)"
                    fill="#f59e0b"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Merchant platform breakdown pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {platformSummaryData.map((item) => (
                <div key={item.platform} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                    {item.platform}
                  </span>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Disbursed:</span>
                    <span className="font-bold text-emerald-600 font-mono">₹{item.cashbackDisbursed}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-0.5">
                    <span className="text-slate-500">Pending:</span>
                    <span className="font-bold text-amber-600 font-mono">₹{item.pendingLiability}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* View 3: Merchant Platform & Status Distribution (Pie & Donut Charts) */}
        {activeChartTab === 'platform-share' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Donut 1: Disbursed Cashback by Platform */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Disbursed Cashback by Merchant Platform (₹)
              </h5>
              <p className="text-[11px] text-slate-500 mb-2">
                Share of approved rewards paid out across Amazon, Flipkart, Blinkit
              </p>

              <div className="h-56 w-full flex items-center justify-center">
                {totalCashbackDisbursed > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={platformPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {platformPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 text-xs py-8">
                    No approved payouts yet to display breakdown.
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 text-xs mt-2 flex-wrap">
                {platformPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-slate-700">{item.name}:</span>
                    <span className="font-mono font-bold text-slate-900">₹{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Donut 2: Claims Review Status Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Submissions Status Breakdown
              </h5>
              <p className="text-[11px] text-slate-500 mb-2">
                Total Claims split into Pending, Approved, and Rejected ratios
              </p>

              <div className="h-56 w-full flex items-center justify-center">
                {totalClaims > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip content={<CustomPieTooltip />} />
                      <Pie
                        data={statusPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusPieData.map((entry, index) => (
                          <Cell key={`cell-status-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center text-slate-400 text-xs py-8">
                    No claims submitted yet.
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-4 text-xs mt-2 flex-wrap">
                {statusPieData.map((item) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="font-semibold text-slate-700">{item.name}:</span>
                    <span className="font-mono font-bold text-slate-900">{item.value} claims</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
