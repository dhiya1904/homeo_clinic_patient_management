import React from 'react';
import { Activity, Stethoscope, IndianRupee } from 'lucide-react';

const ConsultationSummary = ({ patient, consultationFee, setConsultationFee }) => {
  if (!patient) return null;

  return (
    <div className="card p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
          <Stethoscope className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-white uppercase tracking-wider text-xs">Consultation Summary</h3>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Symptoms</label>
          <p className="text-sm text-zinc-300 leading-relaxed italic border-l-2 border-aesthetic-accent/20 pl-4">
            "{patient.symptoms}"
          </p>
        </div>

        <div>
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Diagnosis</label>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-aesthetic-accent" />
            <p className="text-sm text-white font-medium">{patient.diagnosis}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-aesthetic-border">
          <label className="block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Consultation Fee</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">₹</span>
            <input 
              type="number" 
              value={consultationFee}
              onChange={(e) => setConsultationFee(Number(e.target.value))}
              className="input-field w-full pl-8 py-2 text-white font-bold"
              placeholder="0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationSummary;
