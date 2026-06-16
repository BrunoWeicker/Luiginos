import React, { useState } from "react";
import { Shift, TeamMember } from "../types";
import {
  Phone,
  Calendar,
  Users,
  Briefcase,
  Zap,
  Star,
  Plus,
  Trash2,
  Check,
  RefreshCw,
  X,
  GripVertical,
  Layers,
  ChevronDown,
  Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DienstplanModuleProps {
  weeklyShifts: Record<string, Shift[]>;
  setWeeklyShifts: React.Dispatch<React.SetStateAction<Record<string, Shift[]>>>;
  team: TeamMember[];
}

export default function DienstplanModule({ weeklyShifts, setWeeklyShifts, team }: DienstplanModuleProps) {
  // Ensure we have a selected week, default to first available key
  const weekKeys = Object.keys(weeklyShifts);
  const [selectedWeek, setSelectedWeek] = React.useState<string>(weekKeys[0] || "KW 24 (08.06. - 14.06.2026)");

  // State for adding a custom calendar week
  const [isAddingWeek, setIsAddingWeek] = useState(false);
  const [newWeekNum, setNewWeekNum] = useState("");
  const [newWeekStart, setNewWeekStart] = useState("");
  const [newWeekEnd, setNewWeekEnd] = useState("");

  // Assignment states
  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [assignmentMode, setAssignmentMode] = useState<"replace" | "add">("add");
  const [draggedOverCell, setDraggedOverCell] = useState<{ day: string; type: "frueh" | "spaet" | "produktion" } | null>(null);
  const [pendingAssignment, setPendingAssignment] = useState<{
    day: string;
    type: "frueh" | "spaet" | "produktion";
    personName: string;
  } | null>(null);
  const [customTime, setCustomTime] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get active week shifts
  const currentWeekShifts = weeklyShifts[selectedWeek] || [];

  // Helper to parse name and custom shifted time from the stored string
  const parseShiftMember = (fullName: string) => {
    const trimmed = fullName.trim();
    const match = trimmed.match(/^(.*?)(?:\s*\((.*?)\))?$/);
    return {
      raw: trimmed,
      cleanName: match ? match[1].trim() : trimmed,
      time: match && match[2] ? match[2].trim() : ""
    };
  };

  // Helper to resolve colors and initials based on team members
  const getMemberInitialsAndColor = (memberName: string) => {
    const cleanName = memberName.replace(/\s*\(.*?\)/g, "").trim();
    const normalized = cleanName.toLowerCase();
    
    // Find matching member in team
    const member = team.find((m) => normalized.includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(normalized));
    if (member) {
      return {
        initials: member.name.substring(0, 2).toUpperCase(),
        color: `${member.color} text-white`
      };
    }

    // Secondary matches / presets
    if (normalized.includes("luigino")) return { initials: "LU", color: "bg-emerald-600 text-white" };
    if (normalized.includes("marco")) return { initials: "MA", color: "bg-blue-600 text-white" };
    if (normalized.includes("francesca")) return { initials: "FR", color: "bg-rose-600 text-white" };
    if (normalized.includes("matteo")) return { initials: "MT", color: "bg-amber-600 text-white" };
    if (normalized.includes("sofia")) return { initials: "SO", color: "bg-purple-600 text-white" };

    return { initials: cleanName.substring(0, 2).toUpperCase() || "MA", color: "bg-zinc-600 text-white" };
  };

  // Assign person to a cell with optional exact time
  const handleAssign = (day: string, type: "frueh" | "spaet" | "produktion", personName: string, timeString?: string) => {
    if (!personName) return;

    const cleanedPersonName = personName.replace(/\s*\(.*?\)/g, "").trim();
    const saveValue = timeString?.trim() ? `${cleanedPersonName} (${timeString.trim()})` : cleanedPersonName;

    setWeeklyShifts((prev) => {
      const activeShifts = prev[selectedWeek] || [];
      const updatedShifts = activeShifts.map((s) => {
        if (s.day === day) {
          const currentVal = s[type] || "";
          
          if (assignmentMode === "replace" || currentVal === "Offen" || !currentVal) {
            return { ...s, [type]: saveValue };
          } else {
            // "Add" mode: split and append/update
            const names = currentVal.split(/(?:\s*\+\s*|\s+und\s+|\s*,\s*)/i).map(n => n.trim());
            const cleanNames = names.map(n => n.replace(/\s*\(.*?\)/g, "").trim().toLowerCase());
            const alreadyIdx = cleanNames.indexOf(cleanedPersonName.toLowerCase());
            
            if (alreadyIdx >= 0) {
              // Update existing person's time range
              names[alreadyIdx] = saveValue;
              return { ...s, [type]: names.join(" + ") };
            } else {
              // Append new assignee
              return { ...s, [type]: `${currentVal} + ${saveValue}` };
            }
          }
        }
        return s;
      });

      return {
        ...prev,
        [selectedWeek]: updatedShifts
      };
    });

    // Clear active click selection to reset Kiosk tap focus
    setSelectedTeamMember(null);
  };

  // Open time dialog modal with defaults
  const openTimeInputModal = (day: string, type: "frueh" | "spaet" | "produktion", personName: string) => {
    let defaultVal = "";
    if (type === "frueh") defaultVal = "09:00 - 13:00";
    else if (type === "spaet") defaultVal = "13:00 - 18:00";
    else if (type === "produktion") defaultVal = "08:00 - 16:30";
    
    // Check if the person is already scheduled to fetch their existing time if editing
    const currentVal = (weeklyShifts[selectedWeek] || []).find(s => s.day === day)?.[type] || "";
    const names = currentVal.split(/(?:\s*\+\s*|\s+und\s+|\s*,\s*)/i).map(n => n.trim());
    const matched = names.find(n => n.replace(/\s*\(.*?\)/g, "").trim().toLowerCase() === personName.replace(/\s*\(.*?\)/g, "").trim().toLowerCase());
    
    if (matched) {
      const { time } = parseShiftMember(matched);
      if (time) {
        defaultVal = time;
      }
    }

    const cleaned = personName.replace(/\s*\(.*?\)/g, "").trim();
    setPendingAssignment({ day, type, personName: cleaned });
    setCustomTime(defaultVal);
  };

  // Edit action when clicking badge
  const handleEditBadgeTime = (day: string, type: "frueh" | "spaet" | "produktion", personNameWithTime: string) => {
    const { cleanName, time } = parseShiftMember(personNameWithTime);
    setPendingAssignment({ day, type, personName: cleanName });
    setCustomTime(time);
  };

  // Remove a single person from multi-person cell or clear it
  const handleRemovePerson = (day: string, type: "frueh" | "spaet" | "produktion", personName: string) => {
    const cleanRemoveTarget = personName.replace(/\s*\(.*?\)/g, "").trim().toLowerCase();
    
    setWeeklyShifts((prev) => {
      const activeShifts = prev[selectedWeek] || [];
      const updatedShifts = activeShifts.map((s) => {
        if (s.day === day) {
          const currentVal = s[type] || "";
          
          const names = currentVal.split(/(?:\s*\+\s*|\s+und\s+|\s*,\s*)/i).map(n => n.trim());
          const filteredNames = names.filter(n => {
            const cleanN = n.replace(/\s*\(.*?\)/g, "").trim().toLowerCase();
            return cleanN !== cleanRemoveTarget;
          });
          
          const newValue = filteredNames.length > 0 ? filteredNames.join(" + ") : "Offen";
          return { ...s, [type]: newValue };
        }
        return s;
      });

      return {
        ...prev,
        [selectedWeek]: updatedShifts
      };
    });
  };

  // Clear all shifts for current week
  const handleClearWeek = () => {
    setShowClearConfirm(true);
  };

  const confirmClearWeek = () => {
    setWeeklyShifts((prev) => {
      const activeShifts = prev[selectedWeek] || [];
      const cleared = activeShifts.map((s) => ({
        ...s,
        frueh: "Offen",
        spaet: "Offen",
        produktion: "Offen"
      }));
      return { ...prev, [selectedWeek]: cleared };
    });
    setShowClearConfirm(false);
  };

  // Load sample pattern/template schedule
  const handleLoadSample = () => {
    const defaultShifts = [
      { day: "Montag", frueh: "Matteo", spaet: "Francesca", produktion: "Marco" },
      { day: "Dienstag", frueh: "Matteo", spaet: "Francesca", produktion: "Luigino" },
      { day: "Mittwoch", frueh: "Francesca", spaet: "Sofia", produktion: "Marco" },
      { day: "Donnerstag", frueh: "Matteo", spaet: "Sofia", produktion: "Marco" },
      { day: "Freitag", frueh: "Francesca", spaet: "Sofia", produktion: "Marco + Luigino" },
      { day: "Samstag", frueh: "Matteo + Francesca", spaet: "Sofia + Luigino", produktion: "Marco" }
    ];
    setWeeklyShifts((prev) => ({
      ...prev,
      [selectedWeek]: defaultShifts
    }));
  };

  // Create a new week in the dictionary
  const handleCreateWeek = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWeekNum) return;

    const rangeStr = newWeekStart && newWeekEnd ? `(${newWeekStart} - ${newWeekEnd})` : "";
    const newKey = `KW ${newWeekNum} ${rangeStr}`.trim();

    if (weeklyShifts[newKey]) {
      setErrorMessage("Diese Kalenderwoche existiert bereits.");
      return;
    }

    const emptyWeek: Shift[] = [
      { day: "Montag", frueh: "Offen", spaet: "Offen", produktion: "Offen" },
      { day: "Dienstag", frueh: "Offen", spaet: "Offen", produktion: "Offen" },
      { day: "Mittwoch", frueh: "Offen", spaet: "Offen", produktion: "Offen" },
      { day: "Donnerstag", frueh: "Offen", spaet: "Offen", produktion: "Offen" },
      { day: "Freitag", frueh: "Offen", spaet: "Offen", produktion: "Offen" },
      { day: "Samstag", frueh: "Offen", spaet: "Offen", produktion: "Offen" }
    ];

    setWeeklyShifts((prev) => ({
      ...prev,
      [newKey]: emptyWeek
    }));

    setSelectedWeek(newKey);
    setIsAddingWeek(false);
    setNewWeekNum("");
    setNewWeekStart("");
    setNewWeekEnd("");
  };

  // Render a cell's custom split visual structure
  const renderCellContents = (val: string, day: string, type: "frueh" | "spaet" | "produktion") => {
    const isOver = draggedOverCell?.day === day && draggedOverCell?.type === type;
    const isClickTargetable = !!selectedTeamMember;

    if (!val || val === "Offen") {
      return (
        <div
          className={`min-h-12 w-full flex items-center justify-center rounded-xl border border-dashed transition-all p-2 ${
            isOver
              ? "bg-emerald-100/70 border-emerald-500 scale-102"
              : isClickTargetable
              ? "border-amber-400 bg-amber-50/20 hover:bg-amber-50 cursor-pointer animate-pulse"
              : "border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/40"
          }`}
          onClick={() => {
            if (isClickTargetable && selectedTeamMember) {
              openTimeInputModal(day, type, selectedTeamMember.name);
            }
          }}
        >
          <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 font-medium">Offen</span>
        </div>
      );
    }

    // Split on separators (e.g. "Matteo + Francesca", "Sofia und Luigino")
    const names = val.split(/(?:\s*\+\s*|\s+und\s+|\s*,\s*)/i);

    return (
      <div
        className={`min-h-12 w-full p-1.5 rounded-xl border transition-all flex flex-wrap gap-1.5 items-center ${
          isOver
            ? "bg-emerald-100/70 border-emerald-500 scale-102"
            : isClickTargetable
            ? "border-amber-300 bg-amber-50/20 hover:bg-amber-50 cursor-pointer"
            : "border-transparent"
        }`}
        onClick={() => {
          if (isClickTargetable && selectedTeamMember) {
            openTimeInputModal(day, type, selectedTeamMember.name);
          }
        }}
      >
        {names.map((name, idx) => {
          const cleanedName = name.trim();
          if (!cleanedName) return null;
          const { cleanName, time } = parseShiftMember(cleanedName);
          const { initials, color } = getMemberInitialsAndColor(cleanName);
          return (
            <div
              key={idx}
              id={`cell-badge-${day}-${type}-${cleanName}`}
              onClick={(e) => {
                e.stopPropagation();
                handleEditBadgeTime(day, type, cleanedName);
              }}
              className="flex items-center gap-2 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 pl-1.5 pr-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 shadow-xs hover:border-emerald-700 cursor-pointer select-none group/badge transition-all"
              title="Zeit bearbeiten"
            >
              <div className={`h-6 w-6 rounded-md flex items-center justify-center text-[10px] font-mono font-black ${color} shrink-0 shadow-xs`}>
                {initials}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold font-sans tracking-tight leading-tight text-zinc-950 dark:text-zinc-50">{cleanName}</span>
                {time && (
                  <span className="text-[10px] font-mono text-emerald-800 dark:text-emerald-450 font-semibold leading-none mt-0.5">
                    {time}
                  </span>
                )}
              </div>
              <button
                type="button"
                id={`btn-del-person-${day}-${type}-${cleanName}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePerson(day, type, cleanedName);
                }}
                className="w-4.5 h-4.5 rounded-full flex items-center justify-center text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-bold leading-none ml-1 transition-colors cursor-pointer shrink-0"
                title={`${cleanName} austragen`}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="dienstplan-view-container">
      {/* LEFT COLUMN: WEEK CALENDAR & ASSIGNMENT GRID */}
      <div className="xl:col-span-8 space-y-4" id="calendar-left-pane">
        
        {/* WEEK DATEPICKER & ACTIONS HEADER */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs" id="roster-top-actions">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="picker-wrapper">
            
            {/* Week Selector Dropdown simulating a datepicker */}
            <div className="space-y-1" id="week-selector-block">
              <label className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400 font-mono block">
                Kalenderwoche wählen (KW-Datepicker)
              </label>
              <div className="relative inline-block w-full sm:w-72" id="week-select-dropdown-container">
                <select
                  id="datepicker-week-select"
                  value={selectedWeek}
                  onChange={(e) => setSelectedWeek(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 py-2.5 pl-3.5 pr-10 rounded-xl text-sm font-sans font-bold text-zinc-800 dark:text-zinc-100 focus:outline-none focus:border-emerald-800 cursor-pointer appearance-none shadow-xs"
                >
                  {weekKeys.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-zinc-500" id="select-arrow-box">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap items-end gap-2 shrink-0 pt-2 sm:pt-0" id="week-util-buttons-row">
              <button
                type="button"
                id="btn-add-week-modal-toggle"
                onClick={() => setIsAddingWeek(!isAddingWeek)}
                className="py-2.5 px-3.5 bg-zinc-150 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-200/40"
              >
                <Plus className="h-4 w-4 text-emerald-800" />
                + Kalenderwoche
              </button>

              <button
                type="button"
                id="btn-load-sample-shifts"
                onClick={handleLoadSample}
                title="Muster-Dienstplan für diese Woche voreinstellen"
                className="py-2.5 px-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-emerald-800 dark:text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer border border-zinc-200 dark:border-zinc-800"
              >
                <RefreshCw className="h-3.5 w-3.5 animate-spin-hover" />
                Musterplan laden
              </button>

              <button
                type="button"
                id="btn-clear-active-shifts"
                onClick={handleClearWeek}
                title="Diese Woche leeren"
                className="py-2.5 px-3 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 dark:hover:text-red-400 text-zinc-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Leeren
              </button>
            </div>
          </div>

          {/* Collapsible form to create a new calendar week */}
          <AnimatePresence>
            {isAddingWeek && (
              <motion.form
                key="week-form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                onSubmit={handleCreateWeek}
                className="border-t border-zinc-150 dark:border-zinc-800 mt-4 pt-4 space-y-4 overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1" id="form-week-num">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Kalenderwoche (z.B. 28)
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="z.B. 28"
                      value={newWeekNum}
                      onChange={(e) => setNewWeekNum(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-lg focus:outline-none focus:border-emerald-800 font-bold"
                    />
                  </div>

                  <div className="space-y-1" id="form-week-start">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      Start-Datum (z.B. 06.07.2026)
                    </label>
                    <input
                      type="text"
                      placeholder="z.B. 06.07."
                      value={newWeekStart}
                      onChange={(e) => setNewWeekStart(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1" id="form-week-end">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                      End-Datum (z.B. 12.07.2026)
                    </label>
                    <input
                      type="text"
                      placeholder="z.B. 12.07."
                      value={newWeekEnd}
                      onChange={(e) => setNewWeekEnd(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm rounded-lg focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2" id="week-form-actions">
                  <button
                    type="button"
                    id="btn-week-form-cancel"
                    onClick={() => setIsAddingWeek(false)}
                    className="py-1.5 px-3.5 bg-transparent hover:bg-zinc-150 text-zinc-500 hover:text-zinc-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                  >
                    Stornieren
                  </button>
                  <button
                    type="submit"
                    id="btn-week-form-submit"
                    className="py-1.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-all shadow-xs cursor-pointer"
                  >
                    Anlegen
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        {/* INTEGRATED WEEKLY ROSTER BOARD */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4" id="calendar-card">
          <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-4" id="calendar-head">
            <h4 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Calendar className="h-4.5 w-4.5 text-emerald-850" />
              Wochenplan • {selectedWeek}
            </h4>
            
            {/* Visual indicator of active Tablet-friendly click system */}
            {selectedTeamMember && (
              <div className="bg-amber-100 border border-amber-200 text-amber-900 px-3 py-1 rounded-full text-[10px] font-bold font-mono flex items-center gap-1.5" id="click-assign-active">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                Tippe Schicht zum Verknüpfen von [{selectedTeamMember.name}]
                <button
                  type="button"
                  id="btn-cancel-click-assign"
                  onClick={() => setSelectedTeamMember(null)}
                  className="font-black text-xs hover:text-red-600 focus:outline-none ml-1 cursor-pointer"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto" id="calendar-table-responsive-box">
            <table className="w-full text-left font-sans border-collapse" id="roster-table">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800" id="table-head-row">
                  <th className="py-3 px-4 font-mono text-xs uppercase text-zinc-400 font-extrabold w-[130px]">Wochentag</th>
                  <th className="py-3 px-4 font-mono text-xs uppercase text-zinc-400 font-extrabold">Frühdienst (ab 9:00)</th>
                  <th className="py-3 px-4 font-mono text-xs uppercase text-zinc-400 font-extrabold">Spätdienst (ab 13:00)</th>
                  <th className="py-3 px-4 font-mono text-xs uppercase text-zinc-400 font-extrabold">Küche / Produktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-800" id="table-body">
                {currentWeekShifts.map((shift) => (
                  <tr
                    key={shift.day}
                    id={`table-row-${shift.day}`}
                    className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors"
                  >
                    {/* Weekday cell */}
                    <td className="py-4 px-4 font-sans font-extrabold text-sm text-zinc-900 dark:text-zinc-100">
                      {shift.day}
                    </td>

                    {/* Morning shift cell */}
                    <td
                      className="py-3 px-3 relative"
                      id={`morning-cell-${shift.day}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setDraggedOverCell({ day: shift.day, type: "frueh" })}
                      onDragLeave={() => setDraggedOverCell(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const name = e.dataTransfer.getData("text/plain");
                        openTimeInputModal(shift.day, "frueh", name);
                        setDraggedOverCell(null);
                      }}
                    >
                      {renderCellContents(shift.frueh, shift.day, "frueh")}
                    </td>

                    {/* Late shift cell */}
                    <td
                      className="py-3 px-3 relative"
                      id={`evening-cell-${shift.day}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setDraggedOverCell({ day: shift.day, type: "spaet" })}
                      onDragLeave={() => setDraggedOverCell(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const name = e.dataTransfer.getData("text/plain");
                        openTimeInputModal(shift.day, "spaet", name);
                        setDraggedOverCell(null);
                      }}
                    >
                      {renderCellContents(shift.spaet, shift.day, "spaet")}
                    </td>

                    {/* Production shift cell */}
                    <td
                      className="py-3 px-3 relative"
                      id={`production-cell-${shift.day}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDragEnter={() => setDraggedOverCell({ day: shift.day, type: "produktion" })}
                      onDragLeave={() => setDraggedOverCell(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        const name = e.dataTransfer.getData("text/plain");
                        openTimeInputModal(shift.day, "produktion", name);
                        setDraggedOverCell(null);
                      }}
                    >
                      {renderCellContents(shift.produktion, shift.day, "produktion")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational shift guidelines */}
        <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl flex items-start gap-2.5" id="roster-note">
          <Star className="text-emerald-800 h-4 w-4 shrink-0 mt-0.5" />
          <p className="font-sans text-xs text-zinc-500 leading-normal">
            <strong>Kiosk Admin Tipp:</strong> Zuweisungen können auf zwei Arten vorgenommen werden: Entweder per <strong>Drag-and-Drop</strong> vom Mitarbeiter-Verzeichnis rechts, oder per Klick auf ein Teammitglied und anschließendes Tippen auf ein offenes Feld (ideal auf Tablets!).
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: REIMAGINED DRAGGABLE TEAM DIRECTORY */}
      <div className="xl:col-span-4 space-y-4" id="team-right-pane">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs space-y-5" id="draggable-team-card">
          <div className="border-b border-zinc-150 dark:border-zinc-800 pb-3" id="team-head">
            <h4 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Users className="h-4.5 w-4.5 text-emerald-850" />
              Mitarbeiter-Verzeichnis
            </h4>
            <p className="font-sans text-xs text-zinc-400 mt-1">
              Klicke oder ziehe Mitarbeiter per Drag & Drop auf Schichten.
            </p>
          </div>

          {/* DYNAMIC MODE TOGGLE FOR DRAG ASSIGNMENTS */}
          <div className="bg-zinc-50 dark:bg-zinc-950 p-2.5 rounded-xl border border-zinc-150 dark:border-zinc-800 space-y-2" id="mode-selector-panel">
            <span className="text-[9px] uppercase font-extrabold tracking-widest text-zinc-400 font-mono block">
              Zuweisungsmodus (Replace / Append)
            </span>
            <div className="grid grid-cols-2 gap-1.5" id="mode-buttons-row">
              <button
                type="button"
                id="btn-mode-add"
                onClick={() => setAssignmentMode("add")}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  assignmentMode === "add"
                    ? "bg-slate-800 text-white shadow-xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-155 dark:hover:bg-zinc-900"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                Hinzufügen (+)
              </button>

              <button
                type="button"
                id="btn-mode-replace"
                onClick={() => setAssignmentMode("replace")}
                className={`py-1.5 px-3.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  assignmentMode === "replace"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-155 dark:hover:bg-zinc-900"
                }`}
              >
                <Check className="h-3.5 w-3.5" />
                Ersetzen 📋
              </button>
            </div>
          </div>

          {/* DRAGGABLE LIST */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1" id="team-draggable-list">
            {team.map((member) => {
              const isSelectedForClickAssign = selectedTeamMember?.id === member.id;
              
              return (
                <div
                  key={member.id}
                  id={`draggable-member-${member.id}`}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", member.name);
                    // Add standard feedback
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onClick={() => {
                    if (isSelectedForClickAssign) {
                      setSelectedTeamMember(null);
                    } else {
                      setSelectedTeamMember(member);
                    }
                  }}
                  className={`p-3 border rounded-xl flex items-center justify-between gap-2 cursor-grab group transition-all relative ${
                    isSelectedForClickAssign
                      ? "border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 shadow-md ring-2 ring-amber-400"
                      : "bg-zinc-50/50 hover:bg-white dark:bg-zinc-950 border-zinc-150 dark:border-zinc-800 hover:border-zinc-200/80 hover:shadow-xs"
                  }`}
                  title="Mitarbeiter herüberziehen oder anklicken"
                >
                  <div className="flex items-center gap-3" id={`draggable-info-${member.id}`}>
                    {/* Drag Grip icon */}
                    <div className="text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400 shrink-0 cursor-grab" id={`grip-${member.id}`}>
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {/* Initials circle */}
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-extrabold border shadow-xs leading-none shrink-0 border-white/20 ${member.color} text-white`}>
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="block leading-snug" id={`member-text-${member.id}`}>
                      <h5 className="font-sans font-bold text-sm text-zinc-900 dark:text-zinc-100 flex items-center gap-1">
                        {member.name}
                      </h5>
                      <div className="flex items-center gap-1 text-[10px] text-zinc-400 font-sans" id={`member-subtext-${member.id}`}>
                        <Briefcase className="h-3 w-3 text-zinc-400 shrink-0" />
                        <span>{member.role}</span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Dial Tel Button */}
                  <a
                    href={`tel:${member.phone}`}
                    id={`dial-btn-${member.id}`}
                    onClick={(e) => e.stopPropagation()} // Don't trigger tap-to-place assignment selection
                    className="h-8 w-8 bg-zinc-100 hover:bg-emerald-800 hover:text-white dark:bg-zinc-800 text-zinc-500 rounded-lg flex items-center justify-center transition-all shadow-xs shrink-0"
                    title={`${member.name} anrufen`}
                  >
                    <Phone className="h-3.5 w-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
          
          <div className="bg-zinc-50/50 dark:bg-zinc-950 p-3 rounded-xl border border-zinc-150 dark:border-zinc-800 flex gap-2" id="drag-action-tip">
            <Info className="h-4 w-4 text-emerald-800 shrink-0 mt-0.5" />
            <span className="text-[10px] text-zinc-400 leading-normal">
              <strong>Mobil/Kiosk-Betrieb:</strong> Einfach einen Mitarbeiter antippen (orangefarbener Rahmen leuchtet auf), dann die gewünschte Schicht in der Tabelle antippen. Zum Abbrechen erneut antippen.
            </span>
          </div>
        </div>
      </div>

      {/* TIME PROMPT POPUP MODAL */}
      <AnimatePresence>
        {pendingAssignment && (
          <div key="time-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs" id="time-input-modal-overlay">
            {/* Backdrop Area */}
            <div className="absolute inset-0" onClick={() => setPendingAssignment(null)} />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-4"
              id="time-input-modal-box"
            >
              <div className="space-y-1 block md:text-left text-center">
                <h4 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Arbeitszeit festlegen
                </h4>
                <p className="font-sans text-xs text-zinc-400">
                  Gib die genaue Arbeitszeit für <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{pendingAssignment.personName}</strong> am <strong className="text-zinc-900 dark:text-zinc-100 font-bold">{pendingAssignment.day}</strong> ein.
                </p>
              </div>

              {/* Instant Presets based on shift category */}
              <div className="space-y-1.5 md:text-left text-center" id="time-presets-sec">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Schnellauswahl Vorlagen
                </span>
                <div className="flex flex-wrap gap-1.5 justify-start" id="time-picker-presets">
                  {(pendingAssignment.type === "frueh"
                    ? ["09:00 - 13:00", "09:00 - 15:00", "08:00 - 14:00", "Keine Zeit"]
                    : pendingAssignment.type === "spaet"
                    ? ["13:00 - 18:00", "14:00 - 18:00", "13:00 - 20:00", "Keine Zeit"]
                    : ["08:00 - 16:30", "07:00 - 15:30", "09:00 - 17:30", "Keine Zeit"]
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        if (preset === "Keine Zeit") {
                          setCustomTime("");
                        } else {
                          setCustomTime(preset);
                        }
                      }}
                      className={`text-xs px-2.5 py-1.5 rounded-lg font-sans font-bold transition-all border cursor-pointer ${
                        (preset === "Keine Zeit" && customTime === "") || customTime === preset
                          ? "bg-emerald-800 text-white border-emerald-800 shadow-sm"
                          : "bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Freeform input row */}
              <div className="space-y-1 text-left" id="time-custom-input-sec">
                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">
                  Manuelle Arbeitszeit (Freitext)
                </label>
                <input
                  type="text"
                  placeholder="z.B. 08:30 - 16:30"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-805 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-700 font-bold font-sans text-zinc-900 dark:text-zinc-50"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2" id="time-modal-actions">
                <button
                  type="button"
                  onClick={() => setPendingAssignment(null)}
                  className="py-2 px-4 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleAssign(pendingAssignment.day, pendingAssignment.type, pendingAssignment.personName, customTime);
                    setPendingAssignment(null);
                  }}
                  className="py-2.5 px-4 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Übernehmen
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Clear Week Dialog */}
      <AnimatePresence>
        {showClearConfirm && (
          <div key="clear-week-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs" id="clear-shifts-modal">
            <div className="absolute inset-0" onClick={() => setShowClearConfirm(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative z-10 space-y-4 text-left"
            >
              <div className="flex gap-3 text-left">
                <div className="h-8 w-8 rounded-lg bg-red-50 dark:bg-red-950/35 flex items-center justify-center shrink-0">
                  <Trash2 className="h-4.5 w-4.5 text-red-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-sans font-bold text-base text-zinc-950 dark:text-zinc-50">Dienstplan leeren?</h4>
                  <p className="font-sans text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Möchtest du den gesamten Dienstplan für <strong className="text-zinc-950 dark:text-zinc-50 font-extrabold">{selectedWeek}</strong> leeren und alle Schichten auf 'Offen' setzen?
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="py-2 px-4 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  onClick={confirmClearWeek}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Ja, Plan leeren
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Calendar Week Alert */}
      <AnimatePresence>
        {errorMessage && (
          <div key="alert-error-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs" id="schedule-error-modal">
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
    </div>
  );
}
