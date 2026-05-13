export const MOCK_PATIENTS = [
  { id: "P-1001", name: "Meera Nair", age: 34, gender: "Female", phone: "+91 98765 43210", doctor: "Dr. Priya S.", symptoms: "Persistent Migraine, Sensitivity to Light", diagnosis: "Chronic Migraine" },
  { id: "P-1002", name: "Arjun Pillai", age: 29, gender: "Male", phone: "+91 87654 32109", doctor: "Dr. Arjun K.", symptoms: "Allergic Rhinitis, Frequent Sneezing", diagnosis: "Seasonal Allergies" },
  { id: "P-1003", name: "Divya Menon", age: 42, gender: "Female", phone: "+91 76543 21098", doctor: "Dr. Priya S.", symptoms: "Joint Pain, Morning Stiffness", diagnosis: "Early Rheumatoid Arthritis" }
];

export const MOCK_MEDICINES = [
  { id: 1, name: "Arnica Montana 200", price: 150 },
  { id: 2, name: "Nux Vomica 30", price: 120 },
  { id: 3, name: "Rhus Tox 200C", price: 180 },
  { id: 4, name: "Belladonna 1M", price: 200 },
  { id: 5, name: "Pulsatilla 30", price: 140 }
];

export const RECENT_BILLING = [
  { id: "B-501", patient: "Rahul Thomas", date: "2026-05-11", amount: 1250, status: "Paid" },
  { id: "B-502", patient: "Sreelakshmi V.", date: "2026-05-11", amount: 840, status: "Paid" },
  { id: "B-503", patient: "Kiran Das", date: "2026-05-10", amount: 2100, status: "Pending" }
];
