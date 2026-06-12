"use client";

import { Card } from "@/components/ui/Card";
import { DollarSign, Briefcase, LifeBuoy, CheckCircle, Clock } from "lucide-react";
import type { AnalyticsData, NamedValue } from "@/lib/types";
import { 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export function ClientAnalyticsDashboard({ data }: { data: AnalyticsData }) {
  const COLORS = ['#0891b2', '#a855f7', '#10b981', '#f59e0b', '#ef4444']; // Cyan, Amethyst, Emerald, Amber, Red

  const operationsData = [
    { name: 'Completed', value: data.operations.completedTasks, fill: '#10b981' },
    { name: 'Pending', value: data.operations.pendingTasks, fill: '#64748b' }
  ];

  return (
    <div className="space-y-8">
      {/* 1. FINANCIAL & SALES */}
      <section>
        <h2 className="text-xl font-bold text-platinum mb-4 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-cyan" /> Financial & Pipeline Health
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="p-6 bg-obsidian border-fg/10 border-l-4 border-l-cyan">
            <p className="text-slate text-sm font-bold uppercase mb-1">CRM Pipeline Value</p>
            <h3 className="text-3xl font-bold text-platinum">${data.financials.pipelineValue.toLocaleString()}</h3>
            <p className="text-xs text-slate mt-2">Active leads potential</p>
          </Card>
          <Card className="p-6 bg-obsidian border-fg/10 border-l-4 border-l-green-500">
            <p className="text-slate text-sm font-bold uppercase mb-1">Revenue Collected</p>
            <h3 className="text-3xl font-bold text-green-400">${data.financials.revenueCollected.toLocaleString()}</h3>
            <p className="text-xs text-slate mt-2">From paid invoices</p>
          </Card>
          <Card className={`p-6 bg-obsidian border-fg/10 border-l-4 ${data.financials.revenueAtRisk > 0 ? 'border-l-red-500' : 'border-l-slate'}`}>
            <p className="text-slate text-sm font-bold uppercase mb-1">Revenue At Risk</p>
            <h3 className={`text-3xl font-bold ${data.financials.revenueAtRisk > 0 ? 'text-red-400' : 'text-platinum'}`}>${data.financials.revenueAtRisk.toLocaleString()}</h3>
            <p className="text-xs text-slate mt-2">From overdue invoices</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-obsidian border-fg/10">
            <h3 className="text-sm font-bold text-slate uppercase mb-6 text-center">Lead Sources Breakdown</h3>
            {data.leadSources.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.leadSources}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {data.leadSources.map((entry: NamedValue, index: number) => (
                        <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                      itemStyle={{ color: '#0891b2' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center space-x-4 mt-2 flex-wrap">
                  {data.leadSources.map((entry: NamedValue, index: number) => (
                    <div key={entry.name} className="flex items-center text-xs text-slate">
                      <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      {entry.name} ({entry.value})
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate">No lead data available.</div>
            )}
          </Card>
        </div>
      </section>

      {/* 2. OPERATIONAL HEALTH */}
      <section>
        <h2 className="text-xl font-bold text-platinum mb-4 flex items-center mt-12">
          <Briefcase className="w-5 h-5 mr-2 text-amethyst" /> Operational Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 bg-obsidian border-fg/10">
            <h3 className="text-sm font-bold text-slate uppercase mb-6 text-center">Task Completion Overview</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={operationsData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis dataKey="name" type="category" stroke="#64748b" />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}} 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {operationsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <div className="grid grid-rows-2 gap-6">
             <Card className="p-6 bg-obsidian border-fg/10 flex flex-col justify-center items-center text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mb-2" />
                <h3 className="text-4xl font-bold text-platinum">{data.operations.completedTasks}</h3>
                <p className="text-slate text-sm font-bold uppercase mt-1">Total Tasks Completed</p>
             </Card>
             <Card className="p-6 bg-obsidian border-fg/10 flex flex-col justify-center items-center text-center">
                <Clock className="w-10 h-10 text-slate/50 mb-2" />
                <h3 className="text-4xl font-bold text-platinum">{data.operations.pendingTasks}</h3>
                <p className="text-slate text-sm font-bold uppercase mt-1">Pending Tasks in Queue</p>
             </Card>
          </div>
        </div>
      </section>

      {/* 3. SUPPORT EFFICIENCY */}
      <section>
        <h2 className="text-xl font-bold text-platinum mb-4 flex items-center mt-12">
          <LifeBuoy className="w-5 h-5 mr-2 text-cyan" /> Support Efficiency
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="grid grid-cols-2 gap-6">
            <Card className="p-6 bg-obsidian border-fg/10 text-center">
               <h3 className="text-4xl font-bold text-cyan">{data.support.openTickets}</h3>
               <p className="text-slate text-xs font-bold uppercase mt-2">Active Tickets</p>
            </Card>
            <Card className="p-6 bg-obsidian border-fg/10 text-center">
               <h3 className="text-4xl font-bold text-green-400">{data.support.resolvedTickets}</h3>
               <p className="text-slate text-xs font-bold uppercase mt-2">Resolved/Closed</p>
            </Card>
            <Card className="col-span-2 p-6 bg-obsidian border-fg/10">
               <h3 className="text-sm font-bold text-slate uppercase mb-4 text-center">Active Tickets By Priority</h3>
               {data.support.ticketPriorities.length > 0 ? (
                 <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.support.ticketPriorities}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          cursor={{fill: '#1e293b'}} 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                        />
                        <Bar dataKey="value" fill="#a855f7" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                 </div>
               ) : (
                 <div className="h-48 flex flex-col items-center justify-center text-slate">
                   <CheckCircle className="w-8 h-8 text-green-500/50 mb-2" />
                   <p>No active tickets. Inbox zero!</p>
                 </div>
               )}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
