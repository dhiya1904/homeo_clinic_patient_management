import React, { useState } from 'react';
import { 
  User, Activity, History, Users, Heart, Brain, 
  Stethoscope, ClipboardList, Save, RotateCcw, 
  Search, CheckCircle, FileText, Pill 
} from 'lucide-react';
import { SectionCard, InputGroup, MedicalInput, MedicalTextArea, DynamicTable } from '../components/FormComponents';

const CaseSheet = () => {
  const [activeSection, setActiveSection] = useState('basic');
  const [progress, setProgress] = useState(15);

  // Form State
  const [formData, setFormData] = useState({
    // 1. Basic Info
    regNo: 'JH-2026-0042',
    date: new Date().toISOString().split('T')[0],
    fullName: '',
    age: '',
    gender: '',
    occupation: '',
    education: '',
    maritalStatus: '',
    phone: '',
    dob: '',
    religion: '',
    referredBy: '',
    provisionalDiagnosis: '',
    finalDiagnosis: '',

    // 2. Complaints
    complaints: '',
    historyOfPresentIllness: '',
    onset: '',
    duration: '',
    precipitatingFactors: '',

    // 3. Past History
    pastHistory: [{ disease: '', age: '', duration: '', recovery: '', medication: '' }],

    // 4. Substance Use
    substanceUse: [{ substance: 'Alcohol', lastUse: '', initiation: '', dependence: 'None', amount: '' }],

    // 5. Family History
    familyHistory: [{ relationship: '', status: 'Alive', age: '', illness: '', cause: '' }],

    // 7. Physical Generals
    physicalGenerals: {
      appetite: '', thirst: '', bowels: '', bladder: '', sleep: '', dreams: '', thermal: ''
    }
  });

  const updateTable = (section, index, field, value) => {
    const newRows = [...formData[section]];
    newRows[index][field] = value;
    setFormData({ ...formData, [section]: newRows });
  };

  const addRow = (section, template) => {
    setFormData({ ...formData, [section]: [...formData[section], template] });
  };

  const removeRow = (section, index) => {
    const newRows = formData[section].filter((_, i) => i !== index);
    setFormData({ ...formData, [section]: newRows });
  };

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-slate-100">
          <div className="flex items-center gap-3 text-teal-600 mb-2">
            <Heart className="w-8 h-8 fill-current" />
            <span className="font-black text-xl tracking-tight text-slate-800">JIREH</span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Homeopathy Case Sheet</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
          {[
            { id: 'basic', label: 'Basic Information', icon: User },
            { id: 'complaints', label: 'Complaints & Illness', icon: Activity },
            { id: 'past', label: 'Past Medical History', icon: History },
            { id: 'substance', label: 'Substance History', icon: Pill },
            { id: 'family', label: 'Family History', icon: Users },
            { id: 'generals', label: 'Physical Generals', icon: Stethoscope },
            { id: 'mental', label: 'Mental Generals', icon: Brain },
            { id: 'mse', label: 'Mental Status (MSE)', icon: ClipboardList },
            { id: 'analysis', label: 'Final Analysis', icon: FileText },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                activeSection === item.id 
                ? 'bg-teal-50 text-teal-700 shadow-sm' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-teal-600' : 'text-slate-400'}`} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Case Completion</span>
              <span className="text-xs font-bold text-teal-600">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Navbar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="lg:hidden w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-800">New Patient Entry</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <span>EHR</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>Case No: JH-2026-0042</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Find existing patient..." 
                className="bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-xs w-64 focus:ring-2 focus:ring-teal-500/20 transition-all"
              />
            </div>
            <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-full text-xs font-bold hover:bg-slate-50 transition-all shadow-sm">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button className="flex items-center gap-2 bg-teal-600 text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-teal-700 transition-all shadow-lg shadow-teal-500/20">
              <Save className="w-4 h-4" /> Save Case Sheet
            </button>
          </div>
        </header>

        {/* Form Sections */}
        <div className="p-8 max-w-5xl mx-auto space-y-8">
          
          {/* Section 1: Basic Info */}
          <SectionCard title="Basic Patient Information" icon={User}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InputGroup label="Registration Number" required>
                <MedicalInput value={formData.regNo} readOnly />
              </InputGroup>
              <InputGroup label="Date" required>
                <MedicalInput type="date" value={formData.date} />
              </InputGroup>
              <InputGroup label="Full Name" required>
                <MedicalInput placeholder="Enter patient's full name" />
              </InputGroup>
              <InputGroup label="Age" required>
                <MedicalInput type="number" placeholder="Years" />
              </InputGroup>
              <InputGroup label="Gender" required>
                <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm outline-none">
                  <option>Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </InputGroup>
              <InputGroup label="Phone Number" required>
                <MedicalInput type="tel" placeholder="+91 XXXXX XXXXX" />
              </InputGroup>
            </div>
          </SectionCard>

          {/* Section 2: Complaints */}
          <SectionCard title="Complaints & Present Illness" icon={Activity}>
            <div className="space-y-6">
              <InputGroup label="Principal Complaints with duration" required>
                <MedicalTextArea placeholder="Describe the main health issues..." rows={4} />
              </InputGroup>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Onset">
                  <MedicalInput placeholder="e.g. Gradual, Sudden" />
                </InputGroup>
                <InputGroup label="Duration">
                  <MedicalInput placeholder="e.g. 2 months" />
                </InputGroup>
              </div>
              <InputGroup label="Precipitating Factors">
                <MedicalTextArea placeholder="Any specific events that triggered the condition?" />
              </InputGroup>
            </div>
          </SectionCard>

          {/* Section 3: Past History */}
          <SectionCard title="Past Medical History" icon={History}>
            <DynamicTable 
              headers={['Disease/Condition', 'Age', 'Duration', 'Medication']}
              rows={formData.pastHistory}
              onAddRow={() => addRow('pastHistory', { disease: '', age: '', duration: '', medication: '' })}
              onRemoveRow={(idx) => removeRow('pastHistory', idx)}
              renderRow={(row, idx) => (
                <>
                  <td className="px-4 py-3"><input className="w-full bg-transparent outline-none" value={row.disease} onChange={(e) => updateTable('pastHistory', idx, 'disease', e.target.value)} /></td>
                  <td className="px-4 py-3 w-20"><input className="w-full bg-transparent outline-none" value={row.age} onChange={(e) => updateTable('pastHistory', idx, 'age', e.target.value)} /></td>
                  <td className="px-4 py-3 w-32"><input className="w-full bg-transparent outline-none" value={row.duration} onChange={(e) => updateTable('pastHistory', idx, 'duration', e.target.value)} /></td>
                  <td className="px-4 py-3"><input className="w-full bg-transparent outline-none" value={row.medication} onChange={(e) => updateTable('pastHistory', idx, 'medication', e.target.value)} /></td>
                </>
              )}
            />
          </SectionCard>

          {/* Section 11: Final Analysis (Preview) */}
          <SectionCard title="Final Analysis & Totality" icon={CheckCircle}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputGroup label="Symptoms of Patient">
                  <MedicalTextArea placeholder="Holistic symptoms..." />
                </InputGroup>
                <InputGroup label="Symptoms of Disease">
                  <MedicalTextArea placeholder="Pathological symptoms..." />
                </InputGroup>
              </div>
              <InputGroup label="Prescription Plan">
                <MedicalTextArea placeholder="Enter medicine, potency and dosage..." rows={4} />
              </InputGroup>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <InputGroup label="Review Date">
                    <MedicalInput type="date" />
                 </InputGroup>
                 <div className="md:col-span-2 flex items-end">
                    <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl w-full text-teal-800 text-xs italic">
                      "Homeopathy treats the patient, not just the disease." - Samuel Hahnemann
                    </div>
                 </div>
              </div>
            </div>
          </SectionCard>

        </div>

        {/* Footer info */}
        <footer className="p-12 text-center">
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            © 2026 Jireh Homeopathy Clinic • Modern EMR Platform
          </p>
        </footer>
      </main>
    </div>
  );
};

export default CaseSheet;
