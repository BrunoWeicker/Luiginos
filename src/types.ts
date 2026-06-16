export interface GuideArticle {
  id: string;
  category: "allgemein" | "prozesse" | "hygiene" | "geraete" | "notfall";
  title: string;
  question: string;
  answer: string;
  tags: string[];
}

export interface ChecklistItem {
  id: string;
  task: string;
  detail: string;
  requiredTime?: string;
  completed: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  type: "sandwich" | "kaeseplatte";
  ingredients: string[];
  steps: string[];
  allergens: string[];
  visualTips?: string;
  storageRule?: string;
  imagePlaceholderColor: string; // Used for ultra-sleek CSS illustrations
  imageUrl?: string; // Base64 data-url for uploaded image
}

export interface DeficitItem {
  id: string;
  item: string;
  type: "sandwich" | "kaese";
  priority: "hoch" | "mittel" | "niedrig";
  status: "fehlt" | "produktion" | "bereit";
  timestamp: string; // HH:MM
  quantitySuggested?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  shift: "frueh" | "spaet" | "allgemein";
  priority: "hoch" | "mittel" | "niedrig";
  completed: boolean;
  tags?: string[];
}

export interface EmployeeDocument {
  id: string;
  name: string;
  category: "vertrag" | "gesundheit" | "ausweis" | "sonstiges";
  uploadedAt: string;
  fileSize: string;
  fileData?: string; // Base64 data-URL for preview / local download
}

export interface TeamMember {
  id: string;
  name: string; // Full name or Display Name
  vorname?: string;
  nachname?: string;
  birthDate?: string; // YYYY-MM-DD
  role: string;
  phone: string;
  email?: string;
  color: string;
  documents?: EmployeeDocument[];
}

export interface Shift {
  day: string; // e.g., "Montag"
  frueh: string; // member name
  spaet: string; // member name
  produktion: string; // member name
}
