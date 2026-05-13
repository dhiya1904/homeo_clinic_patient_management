import React from 'react';
import { Receipt, Info } from 'lucide-react';

const BillSummaryPanel = ({ 
  consultationFee, 
  medicineTotal, 
  labCharges, 
  setLabCharges,
  serviceCharges,
  setServiceCharges,
  discount,
  setDiscount,
  taxRate = 18 // Default GST 18%
}) => {
  const subtotal = consultationFee + medicineTotal + labCharges + serviceCharges;
  const discountAmount = (subtotal * discount) / 100;
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = (taxableAmount * taxRate) / 100;
  const grandTotal = taxableAmount + taxAmount;

  return (
    <div className="card bg-zinc-900/40 border-aesthetic-accent/20 sticky top-6">
      <div className="p-6 border-b border-aesthetic-border flex items-center gap-3">
        <Receipt className="w-5 h-5 text-aesthetic-accent" />
        <h3 className="font-bold text-white uppercase tracking-wider text-xs">Bill Summary</h3>
      </div>

      <div className="p-6 space-y-4">
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-500 font-bold">Lab Charges</label>
            <input 
              type="number" 
              value={labCharges} 
              onChange={(e) => setLabCharges(Number(e.target.value))}
              className="w-full bg-black border border-aesthetic-border rounded-lg px-3 py-2 text-sm text-white focus:border-aesthetic-accent outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] uppercase text-zinc-500 font-bold">Service Fee</label>
            <input 
              type="number" 
              value={serviceCharges} 
              onChange={(e) => setServiceCharges(Number(e.target.value))}
              className="w-full bg-black border border-aesthetic-border rounded-lg px-3 py-2 text-sm text-white focus:border-aesthetic-accent outline-none"
            />
          </div>
        </div>

        {/* Breakdown */}
        <div className="space-y-3 pb-4 border-b border-aesthetic-border/50">
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Consultation</span>
            <span className="text-white font-medium">₹{consultationFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Medicines</span>
            <span className="text-white font-medium">₹{medicineTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">Other Charges</span>
            <span className="text-white font-medium">₹{(labCharges + serviceCharges).toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-400">Discount (%)</span>
            <input 
              type="number" 
              value={discount} 
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="w-16 bg-black border border-aesthetic-border rounded-lg px-2 py-1 text-right text-sm text-green-500 font-bold focus:border-green-500 outline-none"
            />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-zinc-400">GST ({taxRate}%)</span>
            <span className="text-white font-medium">₹{taxAmount.toFixed(2)}</span>
          </div>
        </div>

        {/* Total */}
        <div className="mt-8 p-4 bg-aesthetic-accent rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-black text-[10px] uppercase font-black tracking-widest">Total Amount</span>
            <span className="text-black text-2xl font-black">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 p-3 bg-zinc-800/50 rounded-lg">
          <Info className="w-4 h-4 text-zinc-500 mt-0.5" />
          <p className="text-[10px] text-zinc-500 leading-tight">
            Tax is calculated on the discounted amount. This is a computer-generated invoice.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BillSummaryPanel;
