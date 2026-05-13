import React from 'react';
import { User, IdentificationCard, Phone, Calendar, UserRound } from 'lucide-react';

const PatientInfoCard = ({ patient }) => {
  if (!patient) return (
    <div className="card p-8 flex flex-col items-center justify-center text-zinc-500 border-dashed">
      <IdentificationCard className="w-12 h-12 mb-4 opacity-20" />
      <p>Search and select a patient to view details</p>
    </div>
  );

  return (
    <div className="card p-6 hover:border-aesthetic-accent/30 transition-all duration-300 group">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-aesthetic-accent/10 rounded-2xl flex items-center justify-center text-aesthetic-accent group-hover:bg-aesthetic-accent group-hover:text-black transition-all duration-300">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{patient.name}</h2>
            <p className="text-aesthetic-accent font-medium">{patient.id}</p>
          </div>
        </div>
        <div className="px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-xs font-bold uppercase tracking-wider">
          Active Patient
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{patient.age} Years • {patient.gender}</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <Phone className="w-4 h-4" />
            <span className="text-sm font-medium">{patient.phone}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-zinc-400">
            <UserRound className="w-4 h-4" />
            <span className="text-sm font-medium">Dr. {patient.doctor}</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-400">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">{new Date().toLocaleDateString()} • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientInfoCard;
