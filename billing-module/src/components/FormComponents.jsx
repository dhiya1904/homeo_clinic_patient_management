import React from 'react';

export const SectionCard = ({ title, children, icon: Icon }) => (
  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6 transition-all hover:shadow-md">
    <div className="bg-slate-50 px-6 py-4 border-bottom border-slate-200 flex items-center gap-3">
      {Icon && <Icon className="w-5 h-5 text-teal-600" />}
      <h2 className="text-lg font-bold text-slate-800">{title}</h2>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

export const InputGroup = ({ label, children, required }) => (
  <div className="space-y-1.5">
    <label className="text-sm font-semibold text-slate-600 flex items-center gap-1">
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

export const MedicalInput = ({ type = "text", placeholder, value, onChange, required }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400"
  />
);

export const MedicalTextArea = ({ placeholder, value, onChange, rows = 3 }) => (
  <textarea
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    rows={rows}
    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 resize-none"
  />
);

export const DynamicTable = ({ headers, rows, onAddRow, onRemoveRow, renderRow }) => (
  <div className="overflow-x-auto rounded-xl border border-slate-200">
    <table className="w-full text-sm text-left">
      <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold tracking-wider">
        <tr>
          {headers.map((h, i) => <th key={i} className="px-4 py-3">{h}</th>)}
          <th className="px-4 py-3 w-10"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200">
        {rows.map((row, index) => (
          <tr key={index} className="bg-white">
            {renderRow(row, index)}
            <td className="px-4 py-3">
              <button 
                onClick={() => onRemoveRow(index)}
                className="text-slate-400 hover:text-red-500 transition-colors"
              >
                <i className="fa-solid fa-trash-can"></i>
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    <button 
      onClick={onAddRow}
      className="w-full py-3 bg-slate-50 text-teal-600 font-bold text-xs hover:bg-teal-50 transition-colors border-t border-slate-200"
    >
      + ADD NEW RECORD
    </button>
  </div>
);
