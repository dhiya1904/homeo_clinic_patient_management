import React from 'react';
import { Clock, TrendingUp, IndianRupee } from 'lucide-react';
import { RECENT_BILLING } from '../data/mockData';

const RecentActivity = () => {
  return (
    <div className="space-y-6">
      {/* Today's Revenue Mini Card */}
      <div className="card bg-gradient-to-br from-aesthetic-accent/20 to-transparent p-5 border-aesthetic-accent/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase font-bold text-aesthetic-accent tracking-widest">Today's Revenue</span>
          <TrendingUp className="w-4 h-4 text-aesthetic-accent" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">₹12,450</span>
          <span className="text-[10px] text-green-500 font-bold">+15%</span>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-aesthetic-border">
          <Clock className="w-4 h-4 text-zinc-500" />
          <h4 className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">Recent Billing Activity</h4>
        </div>
        
        <div className="space-y-4">
          {RECENT_BILLING.map((bill) => (
            <div key={bill.id} className="group cursor-pointer">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-bold text-white group-hover:text-aesthetic-accent transition-colors">{bill.patient}</span>
                <span className="text-xs font-bold text-zinc-300">₹{bill.amount}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-tighter">
                <span className="text-zinc-500">{bill.date} • {bill.id}</span>
                <span className={bill.status === 'Paid' ? 'text-green-500' : 'text-amber-500'}>{bill.status}</span>
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-6 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white border border-aesthetic-border hover:border-zinc-700 rounded-lg transition-all">
          View All History
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;
