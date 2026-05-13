import React, { useState, useMemo } from 'react';
import { Search, Plus, Leaf } from 'lucide-react';
import { MOCK_PATIENTS } from './data/mockData';
import PatientInfoCard from './components/PatientInfoCard';
import ConsultationSummary from './components/ConsultationSummary';
import MedicineBillingTable from './components/MedicineBillingTable';
import BillSummaryPanel from './components/BillSummaryPanel';
import PaymentSection from './components/PaymentSection';
import RecentActivity from './components/RecentActivity';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  // Billing States
  const [consultationFee, setConsultationFee] = useState(500);
  const [medicines, setMedicines] = useState([]);
  const [labCharges, setLabCharges] = useState(0);
  const [serviceCharges, setServiceCharges] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  const medicineTotal = useMemo(() => {
    return medicines.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  }, [medicines]);

  const handleSearch = () => {
    const patient = MOCK_PATIENTS.find(p => p.id.toLowerCase() === searchQuery.toLowerCase());
    if (patient) {
      setSelectedPatient(patient);
    } else {
      alert("Patient not found. Try P-1001, P-1002, or P-1003");
    }
  };

  return (
    <div className="min-h-screen bg-aesthetic-black p-4 md:p-8">
      {/* Header */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-aesthetic-accent rounded-xl flex items-center justify-center text-black">
            <Leaf className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">HomeoCare Billing</h1>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Medical Management System</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-zinc-900 border border-aesthetic-border p-1.5 rounded-2xl w-full md:w-96">
          <div className="pl-3 text-zinc-500">
            <Search className="w-5 h-5" />
          </div>
          <input 
            type="text" 
            placeholder="Search Patient ID (e.g. P-1001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="bg-transparent border-none text-sm text-white focus:ring-0 w-full outline-none py-2"
          />
          <button 
            onClick={handleSearch}
            className="bg-aesthetic-border text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-zinc-800 transition-all"
          >
            Find
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Data Entry */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Patient and Consultation Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PatientInfoCard patient={selectedPatient} />
            <ConsultationSummary 
              patient={selectedPatient} 
              consultationFee={consultationFee}
              setConsultationFee={setConsultationFee}
            />
          </div>

          {/* Medicines Dynamic Table */}
          <MedicineBillingTable medicines={medicines} setMedicines={setMedicines} />

          {/* Payment Section */}
          <PaymentSection 
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            paymentStatus={paymentStatus}
            setPaymentStatus={setPaymentStatus}
          />

        </div>

        {/* Right Column: Summaries & Activity */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Billing Summary Panel */}
          <BillSummaryPanel 
            consultationFee={consultationFee}
            medicineTotal={medicineTotal}
            labCharges={labCharges}
            setLabCharges={setLabCharges}
            serviceCharges={serviceCharges}
            setServiceCharges={setServiceCharges}
            discount={discount}
            setDiscount={setDiscount}
          />

          {/* Side Panel Activity */}
          <RecentActivity />

        </div>

      </main>

      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-aesthetic-border text-center">
        <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
          © 2026 HomeoCareCRM • Secure Medical Billing Module
        </p>
      </footer>
    </div>
  );
}

export default App;
