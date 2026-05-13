import React from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { MOCK_MEDICINES } from '../data/mockData';

const MedicineBillingTable = ({ medicines, setMedicines }) => {
  const addMedicine = () => {
    setMedicines([...medicines, { id: Date.now(), name: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeMedicine = (id) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const updateMedicine = (id, field, value) => {
    setMedicines(medicines.map(m => {
      if (m.id === id) {
        const updated = { ...m, [field]: value };
        // If selecting from dropdown, update unit price automatically
        if (field === 'name') {
          const med = MOCK_MEDICINES.find(mock => mock.name === value);
          if (med) updated.unitPrice = med.price;
        }
        return updated;
      }
      return m;
    }));
  };

  return (
    <div className="card overflow-hidden">
      <div className="p-6 border-b border-aesthetic-border flex items-center justify-between bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
            <Package className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-white uppercase tracking-wider text-xs">Medicines Billing</h3>
        </div>
        <button 
          onClick={addMedicine}
          className="flex items-center gap-2 text-xs font-bold text-aesthetic-accent hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-black/50 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
              <th className="px-6 py-4">Medicine Name</th>
              <th className="px-6 py-4 text-center">Qty</th>
              <th className="px-6 py-4">Unit Price</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-aesthetic-border">
            {medicines.map((item) => (
              <tr key={item.id} className="group hover:bg-zinc-900/30 transition-colors">
                <td className="px-6 py-4">
                  <select 
                    value={item.name}
                    onChange={(e) => updateMedicine(item.id, 'name', e.target.value)}
                    className="bg-transparent border-none text-white text-sm font-medium focus:ring-0 w-full outline-none"
                  >
                    <option value="" className="bg-aesthetic-black">Select Medicine</option>
                    {MOCK_MEDICINES.map(mock => (
                      <option key={mock.id} value={mock.name} className="bg-aesthetic-black">{mock.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-3">
                    <input 
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateMedicine(item.id, 'quantity', Number(e.target.value))}
                      className="bg-zinc-900/50 border border-aesthetic-border text-white text-xs w-16 px-2 py-1 rounded text-center outline-none focus:border-aesthetic-accent"
                    />
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-300 font-medium">
                  ₹{item.unitPrice}
                </td>
                <td className="px-6 py-4 text-sm text-white font-bold">
                  ₹{item.quantity * item.unitPrice}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => removeMedicine(item.id)}
                    className="text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {medicines.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-zinc-600 italic text-sm">
                  No medicines added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MedicineBillingTable;
