import React from 'react';
import { CreditCard, Save, Printer, Download, X } from 'lucide-react';

const PaymentSection = ({ paymentMethod, setPaymentMethod, paymentStatus, setPaymentStatus }) => {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
          <CreditCard className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-white uppercase tracking-wider text-xs">Payment Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] uppercase text-zinc-500 font-bold">Payment Method</label>
          <select 
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="input-field w-full"
          >
            <option value="Cash" className="bg-aesthetic-black">Cash</option>
            <option value="UPI" className="bg-aesthetic-black">UPI / Digital Wallet</option>
            <option value="Card" className="bg-aesthetic-black">Debit / Credit Card</option>
            <option value="Insurance" className="bg-aesthetic-black">Insurance Claim</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase text-zinc-500 font-bold">Payment Status</label>
          <select 
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className={`input-field w-full font-bold ${
              paymentStatus === 'Paid' ? 'text-green-500' : 
              paymentStatus === 'Pending' ? 'text-amber-500' : 'text-blue-500'
            }`}
          >
            <option value="Paid" className="bg-aesthetic-black">Full Payment Received (Paid)</option>
            <option value="Pending" className="bg-aesthetic-black">Awaiting Payment (Pending)</option>
            <option value="Partial" className="bg-aesthetic-black">Deposit Received (Partial)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-aesthetic-border">
        <button className="btn-primary flex items-center justify-center gap-2 text-sm col-span-2 md:col-span-1">
          <Save className="w-4 h-4" /> Save Bill
        </button>
        <button className="btn-secondary flex items-center justify-center gap-2 text-sm">
          <Printer className="w-4 h-4" /> Print
        </button>
        <button className="btn-secondary flex items-center justify-center gap-2 text-sm">
          <Download className="w-4 h-4" /> PDF
        </button>
        <button className="flex items-center justify-center gap-2 text-sm text-zinc-500 hover:text-red-500 transition-colors">
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  );
};

export default PaymentSection;
