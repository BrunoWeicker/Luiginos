import React, { useState } from "react";
import { TeamMember, EmployeeDocument } from "../types";
import {
  Users,
  UserPlus,
  Trash2,
  Plus,
  Phone,
  Calendar,
  Briefcase,
  FileText,
  Upload,
  Download,
  Eye,
  Gift,
  Search,
  FileCheck,
  Info,
  X,
  CreditCard,
  User,
  Heart,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface MitarbeiterModuleProps {
  team: TeamMember[];
  setTeam: React.Dispatch<React.SetStateAction<TeamMember[]>>;
}

export default function MitarbeiterModule({ team, setTeam }: MitarbeiterModuleProps) {
  const [selectedMemberId, setSelectedMemberId] = useState<string>(team[0]?.id || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Form states for a new member
  const [vorname, setVorname] = useState("");
  const [nachname, setNachname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const role = "Mitarbeiter";
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedColor, setSelectedColor] = useState("bg-emerald-600");

  // Document states
  const [selectedDocCategory, setSelectedDocCategory] = useState<"vertrag" | "gesundheit" | "ausweis" | "sonstiges">("vertrag");
  const [uploadError, setUploadError] = useState("");

  // Custom dialog / confirmation modal states to prevent iframe/sandbox blockages
  const [deleteCandidateId, setDeleteCandidateId] = useState<string | null>(null);
  const [deleteDocCandidate, setDeleteDocCandidate] = useState<{ id: string; name: string } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const colorPresets = [
    { class: "bg-emerald-600", label: "Smaragd Grün" },
    { class: "bg-blue-600", label: "Klassisch Blau" },
    { class: "bg-rose-600", label: "Kirsch Rot" },
    { class: "bg-amber-600", label: "Bernstein Gelb" },
    { class: "bg-purple-600", label: "Lavendel Violett" },
    { class: "bg-teal-600", label: "Ozean Türkis" },
    { class: "bg-indigo-600", label: "Indigo Blau" },
    { class: "bg-stone-700", label: "Schiefer Grau" }
  ];

  const categoriesMap = {
    vertrag: { label: "Arbeitsvertrag 📜", color: "bg-blue-50 text-blue-800 dark:bg-blue-955 dark:text-blue-300 border-blue-200 dark:border-blue-900" },
    gesundheit: { label: "Gesundheitszeugnis 🩺", color: "bg-red-50 text-red-800 dark:bg-red-955 dark:text-red-300 border-red-200 dark:border-red-900" },
    ausweis: { label: "Ausweis & ID 📁", color: "bg-purple-50 text-purple-800 dark:bg-purple-955 dark:text-purple-300 border-purple-200 dark:border-purple-900" },
    sonstiges: { label: "Sonstiges Dokument 📄", color: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700" }
  };

  const getActiveMember = () => {
    return team.find((m) => m.id === selectedMemberId) || team[0];
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vorname || !nachname) return;

    const displayName = `${vorname} ${nachname.charAt(0)}.`;
    const newMember: TeamMember = {
      id: "member-" + Date.now(),
      name: displayName,
      vorname: vorname,
      nachname: nachname,
      birthDate: birthDate || undefined,
      role: role,
      phone: phone || "+49 151 0000000",
      email: email || undefined,
      color: selectedColor,
      documents: []
    };

    setTeam((prev) => [...prev, newMember]);
    setSelectedMemberId(newMember.id);

    // Reset Form
    setVorname("");
    setNachname("");
    setBirthDate("");
    setPhone("");
    setEmail("");
  };

  const handleDeleteMember = (id: string) => {
    if (team.length <= 1) {
      setErrorMessage("Es muss mindestens ein Mitarbeiter im Kiosk verbleiben.");
      return;
    }
    setDeleteCandidateId(id);
  };

  const confirmDeleteMember = () => {
    if (!deleteCandidateId) return;
    const id = deleteCandidateId;
    setTeam((prev) => prev.filter((m) => m.id !== id));
    // Set focus to another member
    const remaining = team.filter((m) => m.id !== id);
    if (remaining.length > 0) {
      setSelectedMemberId(remaining[0].id);
    } else {
      setSelectedMemberId("");
    }
    setDeleteCandidateId(null);
  };

  // Safe client-side file-upload handler converting file to persistent low-footprint Base64
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit client storage size for localStorage performance (e.g., max 1.5MB)
    if (file.size > 1536 * 1024) {
      setUploadError("Fehler: Datei ist zu groß. Max 1.5 MB erlaubt für Kiosk-Caching.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      const docId = "doc-" + Date.now();
      
      const newDoc: EmployeeDocument = {
        id: docId,
        name: file.name,
        category: selectedDocCategory,
        uploadedAt: new Date().toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        fileSize: (file.size / (1024 * 1024)).toFixed(2) + " MB",
        fileData: base64Data
      };

      setTeam((prev) =>
        prev.map((m) => {
          if (m.id === selectedMemberId) {
            const currentDocs = m.documents || [];
            return {
              ...m,
              documents: [newDoc, ...currentDocs]
            };
          }
          return m;
        })
      );
    };
    reader.onerror = () => {
      setUploadError("Fehler beim Verarbeiten der Datei.");
    };
    reader.readAsDataURL(file);

    // Reset native input so the same file name can be uploaded again if needed
    e.target.value = "";
  };

  const handleDeleteDocument = (docId: string, docName: string) => {
    setDeleteDocCandidate({ id: docId, name: docName });
  };

  const confirmDeleteDocument = () => {
    if (!deleteDocCandidate) return;
    const { id: docId } = deleteDocCandidate;
    setTeam((prev) =>
      prev.map((m) => {
        if (m.id === selectedMemberId) {
          const currentDocs = m.documents || [];
          return {
            ...m,
            documents: currentDocs.filter((d) => d.id !== docId)
          };
        }
        return m;
      })
    );
    setDeleteDocCandidate(null);
  };

  // Helper to calculate age nicely
  const calculateAge = (dobString?: string) => {
    if (!dobString) return null;
    const birth = new Date(dobString);
    if (isNaN(birth.getTime())) return null;
    const diff = Date.now() - birth.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Helper for birthdate formatting
  const formatBirthdate = (dobString?: string) => {
    if (!dobString) return "Nicht hinterlegt";
    const parts = dobString.split("-");
    if (parts.length === 3) {
      return `${parts[2]}.${parts[1]}.${parts[0]}`;
    }
    return dobString;
  };

  const activeMember = getActiveMember();

  // Filters
  const filteredTeam = team.filter((m) => {
    const fullName = `${m.vorname || m.name} ${m.nachname || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase()) || m.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || m.role.toLowerCase().includes(roleFilter.toLowerCase());
    return matchesSearch && matchesRole;
  });

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="employee-view-container">
      {/* LEFT PANE: EMPLOYEE LIST & QUICK STATS */}
      <div className="xl:col-span-4 space-y-4" id="employee-list-panel">
        
        {/* ADD EMPLOYEE CARD */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs" id="add-employee-card">
          <h4 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
            <UserPlus className="h-4 w-4 text-emerald-850" />
            Neuen Mitarbeiter anlegen
          </h4>

          <form onSubmit={handleCreateMember} className="space-y-4" id="create-employee-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Vorname *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Max"
                  value={vorname}
                  onChange={(e) => setVorname(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-emerald-800 font-sans font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Nachname *
                </label>
                <input
                  required
                  type="text"
                  placeholder="Mustermann"
                  value={nachname}
                  onChange={(e) => setNachname(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-emerald-800 font-sans font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Geburtsdatum
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 text-sm rounded-lg focus:outline-none focus:border-emerald-800 font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Telefonnummer
                </label>
                <input
                  type="tel"
                  placeholder="+49 151..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-emerald-800 font-sans text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                E-Mail-Adresse (optional)
              </label>
              <input
                type="email"
                placeholder="mitarbeiter@kiosk.de"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-emerald-800 font-sans text-xs"
              />
            </div>



            {/* COLOR GRID */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">
                Schichtplan Farbe
              </label>
              <div className="grid grid-cols-4 gap-1.5" id="color-picker-grid">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.class}
                    type="button"
                    title={preset.label}
                    onClick={() => setSelectedColor(preset.class)}
                    className={`h-7 rounded-lg border transition-all flex items-center justify-center relative cursor-pointer ${preset.class} ${
                      selectedColor === preset.class ? "border-zinc-900 dark:border-white ring-2 ring-amber-400" : "border-transparent"
                    }`}
                  >
                    {selectedColor === preset.class && (
                      <span className="w-1.5 h-1.5 rounded-full bg-white absolute"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              id="btn-submit-employee"
              className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white font-sans font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <UserPlus className="h-4 w-4" />
              Mitarbeiter hinzufügen
            </button>
          </form>
        </div>

        {/* SEARCH & TEAM LIST CARD */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-4" id="team-list-card">
          <div className="flex items-center justify-between" id="employee-list-title-row">
            <h4 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-emerald-850" />
              Belegschaft ({team.length})
            </h4>
          </div>

          {/* Search bar */}
          <div className="relative" id="employee-search-bar">
            <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-450 pointer-events-none" />
            <input
              type="text"
              placeholder="Suchen nach Name, Rolle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 pl-9 pr-3 py-2.5 text-xs rounded-xl focus:outline-none focus:border-emerald-800 font-sans"
            />
          </div>

          {/* List items */}
          <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1" id="team-manager-scroller">
            {filteredTeam.map((member) => {
              const numDocs = member.documents?.length || 0;
              const isSelected = member.id === selectedMemberId;
              return (
                <div
                  key={member.id}
                  id={`list-member-${member.id}`}
                  onClick={() => setSelectedMemberId(member.id)}
                  className={`p-3 border rounded-xl flex items-center justify-between gap-2 cursor-pointer transition-all ${
                    isSelected
                      ? "border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs"
                      : "bg-zinc-50/50 hover:bg-white dark:bg-zinc-950 border-zinc-150 dark:border-zinc-850 hover:border-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Circle badge */}
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-mono font-black ${member.color} text-white shrink-0`}>
                      {(member.vorname || member.name).substring(0, 2).toUpperCase()}
                    </div>

                    <div className="block leading-snug">
                      <span className="font-sans font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                        {member.vorname ? `${member.vorname} ${member.nachname || ""}` : member.name}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-sans block">{member.role}</span>
                    </div>
                  </div>

                  {/* Documents badge */}
                  <div className="flex items-center gap-1 shrink-0" id={`badge-row-${member.id}`}>
                    {numDocs > 0 ? (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50">
                        {numDocs} {numDocs === 1 ? "Dokument" : "Dokumente"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md text-[9px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                        keine Dok.
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            
            {filteredTeam.length === 0 && (
              <div className="py-8 text-center text-zinc-450 text-xs font-sans">
                Keine Mitarbeiter gefunden.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANE: ACTIVE EMPLOYEE RECORD & DOCUMENT UPLOAD */}
      <div className="xl:col-span-8" id="active-employee-detail-panel">
        {activeMember ? (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-xs space-y-6" id="member-profile-cabinet">
            
            {/* CABINET HEADER */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5" id="cabinet-title-bar">
              <div className="flex items-center gap-4">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center text-lg font-mono font-black ${activeMember.color} text-white shadow-sm shrink-0`}>
                  {(activeMember.vorname || activeMember.name).substring(0, 2).toUpperCase()}
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-sans font-extrabold text-xl text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2">
                    {activeMember.vorname ? `${activeMember.vorname} ${activeMember.nachname || ""}` : activeMember.name}
                    <span className="text-xs bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 px-2.5 py-0.5 rounded-md text-zinc-550 font-bold font-mono">
                      ID: {activeMember.id.replace("member-", "").substring(0, 6).toUpperCase()}
                    </span>
                  </h3>
                  <p className="text-xs font-sans text-zinc-450 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-emerald-800" />
                    <strong>{activeMember.role}</strong> • Gelistet im Kiosk-Plan
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="btn-delete-employee-record"
                onClick={() => handleDeleteMember(activeMember.id)}
                className="py-2 px-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-bold rounded-lg border border-red-200 dark:border-red-900 transition-all flex items-center gap-1 w-full sm:w-auto justify-center cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Mitarbeiter kündigen / entfernen
              </button>
            </div>

            {/* DETAILED STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4" id="worker-facts-blocks">
              <div className="bg-zinc-50 dark:bg-zinc-955 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/60 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/45 flex items-center justify-center shrink-0">
                  <Calendar className="h-4 w-4 text-emerald-800" />
                </div>
                <div className="leading-tight min-w-0">
                  <span className="text-[10px] font-bold text-zinc-400 block font-mono">GEBURTSDATUM</span>
                  <span className="text-xs font-sans font-extrabold text-zinc-800 dark:text-zinc-100 truncate block">
                    {formatBirthdate(activeMember.birthDate)}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-955 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/60 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/45 flex items-center justify-center shrink-0">
                  <Gift className="h-4 w-4 text-emerald-800" />
                </div>
                <div className="leading-tight min-w-0">
                  <span className="text-[10px] font-bold text-zinc-400 block font-mono">ALTER (CALC)</span>
                  <span className="text-xs font-sans font-extrabold text-zinc-800 dark:text-zinc-100 truncate block">
                    {activeMember.birthDate ? `${calculateAge(activeMember.birthDate)} Jahre` : "Keine Angabe"}
                  </span>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-955 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/60 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/45 flex items-center justify-center shrink-0">
                  <Phone className="h-4 w-4 text-emerald-800" />
                </div>
                <div className="leading-tight min-w-0">
                  <span className="text-[10px] font-bold text-zinc-400 block font-mono">TELEFONNUMMER</span>
                  <a
                    href={`tel:${activeMember.phone}`}
                    className="text-xs font-sans font-extrabold text-emerald-830 dark:text-emerald-430 hover:underline block truncate"
                  >
                    {activeMember.phone}
                  </a>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-955 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800/60 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/45 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-emerald-800" />
                </div>
                <div className="leading-tight min-w-0">
                  <span className="text-[10px] font-bold text-zinc-400 block font-mono">E-MAIL-ADRESSE</span>
                  {activeMember.email ? (
                    <a
                      href={`mailto:${activeMember.email}`}
                      className="text-xs font-sans font-extrabold text-emerald-830 dark:text-emerald-430 hover:underline block truncate"
                      title={activeMember.email}
                    >
                      {activeMember.email}
                    </a>
                  ) : (
                    <span className="text-xs font-sans font-extrabold text-zinc-400 block truncate">
                      Nicht hinterlegt
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* DYNAMIC DOCUMENT SUB-SYSTEM */}
            <div className="space-y-4 pt-1" id="file-management-substructure">
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center justify-between" id="doc-shelf-bar">
                <h4 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4.5 w-4.5 text-emerald-850" />
                  Geschützte Dokumenten-Ablage (Tablet Archiv)
                </h4>
              </div>

              {/* SIMULATED UPLOAD FORM BOX */}
              <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800 space-y-4" id="upload-interactive-box">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3" id="doc-meta-setup">
                  <div className="space-y-1.5 w-full sm:w-auto flex-1">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">
                      Kategorie des Hochzuladenden Dokuments
                    </span>
                    <div className="flex flex-wrap gap-1.5" id="doc-category-pills">
                      {(Object.keys(categoriesMap) as Array<keyof typeof categoriesMap>).map((key) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setSelectedDocCategory(key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                            selectedDocCategory === key
                              ? "bg-slate-800 text-white border-zinc-900 shadow-xs"
                              : "bg-white dark:bg-zinc-900 text-zinc-550 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100"
                          }`}
                        >
                          {categoriesMap[key].label.split(" ")[0]} {categoriesMap[key].label.split(" ")[1]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* File input drag area */}
                <div className="relative border-2 border-dashed border-zinc-350 dark:border-zinc-800 hover:border-emerald-800 dark:hover:border-emerald-600 rounded-xl p-6 transition-all bg-white dark:bg-zinc-900 text-center flex flex-col items-center justify-center gap-2 cursor-pointer" id="drag-drop-viewport">
                  <Upload className="h-8 w-8 text-zinc-450 hover:text-emerald-800 animate-pulse" />
                  
                  <div className="space-y-1">
                    <p className="font-sans font-extrabold text-sm text-zinc-800 dark:text-zinc-100">
                      Hier klicken zum Hochladen
                    </p>
                    <p className="font-mono text-[10px] text-zinc-400">
                      PDF, JPG oder PNG (Maximal 1.5 Megabytes)
                    </p>
                  </div>

                  {/* Absolute invisible native click input */}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                {uploadError && (
                  <div className="text-xs text-red-700 dark:text-red-400 font-bold bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 px-3 py-2 rounded-lg" id="doc-upload-error-box">
                    {uploadError}
                  </div>
                )}
              </div>

              {/* UPLOADED DOCUMENTS LIST */}
              <div className="space-y-2.5" id="archived-docs-list">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-450 font-mono block">
                  Vorhandene Dokumente
                </span>

                {activeMember.documents && activeMember.documents.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="docs-grid">
                    {activeMember.documents.map((doc) => {
                      const catInfo = categoriesMap[doc.category] || categoriesMap.sonstiges;
                      return (
                        <div
                          key={doc.id}
                          id={`doc-card-${doc.id}`}
                          className="p-3.5 bg-zinc-50/40 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl hover:shadow-xs transition-shadow flex items-start gap-3.5 relative"
                        >
                          <div className="h-10 w-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5 text-zinc-500" />
                          </div>

                          <div className="flex-1 min-w-0 pr-6">
                            <h5 className="font-sans font-extrabold text-xs text-zinc-900 dark:text-zinc-100 truncate" title={doc.name}>
                              {doc.name}
                            </h5>
                            
                            <div className="flex flex-wrap gap-1.5 items-center mt-1">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider border ${catInfo.color}`}>
                                {catInfo.label.split(" ")[0]}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-400">{doc.fileSize}</span>
                            </div>

                            <p className="text-[9px] font-sans text-zinc-400 mt-1">
                              Hochgeladen am: {doc.uploadedAt}
                            </p>
                          </div>

                          {/* Quick action buttons row inside badge */}
                          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5" id={`doc-action-btns-${doc.id}`}>
                            {doc.fileData && (
                              <a
                                href={doc.fileData}
                                download={doc.name}
                                className="p-1 h-6 w-6 bg-white dark:bg-zinc-800 text-zinc-500 hover:text-emerald-800 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-all"
                                title="Herunterladen"
                              >
                                <Download className="h-3 w-3" />
                              </a>
                            )}
                            <button
                              type="button"
                              id={`btn-del-doc-${doc.id}`}
                              onClick={() => handleDeleteDocument(doc.id, doc.name)}
                              className="p-1 h-6 w-6 bg-white dark:bg-zinc-800 text-zinc-400 hover:text-red-600 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center transition-all cursor-pointer"
                              title="Dokument löschen"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl text-center bg-zinc-50/30 text-zinc-400" id="docs-empty-state">
                    <FileCheck className="h-6 w-6 mx-auto mb-2 text-zinc-350" />
                    <p className="text-xs font-sans">
                      Bislang wurden keine Dokumente für {activeMember.vorname || activeMember.name} hinterlegt.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* SECURITY/CREDENTIAL INFO */}
            <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-150 dark:border-zinc-800 flex gap-2.5" id="cabinet-notes">
              <Info className="h-4.5 w-4.5 text-emerald-850 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block">DSGVO-konforme Stand-Akte</span>
                <p className="text-[10px] text-zinc-400 leading-normal">
                  Dokumenten-Anhänge werden für diesen Kiosk zwischengespeichert und lokal verschlüsselt gespeichert. Sobald Sie im letzten Schritt die Firestore Cloud-Anbindung aktivieren, werden alle Beschäftigungsakten mit einem gesicherten Firebase Storage Bucket verlinkt, auf den ausschließlich autorisierte Benutzer Zugriff erhalten.
                </p>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-xs text-center text-zinc-450 font-sans" id="cabinet-inactive">
            <Users className="h-10 w-10 mx-auto mb-3 text-zinc-350" />
            <h4 className="font-bold mb-1">Kein Mitarbeiter ausgewählt</h4>
            <p className="text-xs">Wähle links ein Belegschaftsmitglied aus, um die Akte zu öffnen.</p>
          </div>
        )}
      </div>

      {/* Custom Error / Notice Modal */}
      <AnimatePresence>
        {errorMessage && (
          <div key="error-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs" id="mitarbeiter-error-modal">
            <div className="absolute inset-0" onClick={() => setErrorMessage(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-4 text-left"
            >
              <div className="flex gap-3 text-left">
                <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                  <X className="h-4.5 w-4.5 text-red-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-base text-zinc-950 dark:text-zinc-50">Hinweis</h4>
                  <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{errorMessage}</p>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="py-2 px-4 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Ok
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Custom Confirm Delete Employee Modal */}
      <AnimatePresence>
        {deleteCandidateId && (
          (() => {
            const candidate = team.find((m) => m.id === deleteCandidateId);
            return (
              <div key="delete-employee-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs" id="mitarbeiter-delete-modal">
                <div className="absolute inset-0" onClick={() => setDeleteCandidateId(null)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-4 text-left"
                >
                  <div className="flex gap-3 text-left">
                    <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                      <Trash2 className="h-4.5 w-4.5 text-red-600" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-sans font-bold text-base text-zinc-950 dark:text-zinc-50">Mitarbeiter entlassen?</h4>
                      <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        Möchtest du <strong className="text-zinc-950 dark:text-zinc-50 font-bold">{candidate?.vorname ? `${candidate.vorname} ${candidate.nachname || ""}` : candidate?.name}</strong> wirklich kündigen bzw. dauerhaft entfernen? Alle hinterlegten Dokumente gehen verloren.
                      </p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setDeleteCandidateId(null)}
                      className="py-2 px-4 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={confirmDeleteMember}
                      className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                    >
                      Ja, Kündigen
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()
        )}
      </AnimatePresence>

      {/* Custom Confirm Delete Document Modal */}
      <AnimatePresence>
        {deleteDocCandidate && (
          <div key="delete-doc-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs" id="mitarbeiter-delete-doc-modal">
            <div className="absolute inset-0" onClick={() => setDeleteDocCandidate(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-4 text-left"
            >
              <div className="flex gap-3 text-left">
                <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                  <X className="h-4.5 w-4.5 text-red-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-base text-zinc-950 dark:text-zinc-50">Dokument löschen?</h4>
                  <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Möchtest du das Dokument <strong className="text-zinc-950 dark:text-zinc-50 font-bold">{deleteDocCandidate.name}</strong> wirklich unwiderruflich löschen?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteDocCandidate(null)}
                  className="py-2 px-4 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteDocument}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Dokument löschen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
