import React, { useState } from "react";
import { DeficitItem, TaskItem } from "../types";
import { AlertCircle, Plus, ToggleLeft, ToggleRight, ChefHat, ShoppingBag, Check, RefreshCw, Trash2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ProduktionModuleProps {
  deficits: DeficitItem[];
  setDeficits: React.Dispatch<React.SetStateAction<DeficitItem[]>>;
  setTasks?: React.Dispatch<React.SetStateAction<TaskItem[]>>;
}

export default function ProduktionModule({ deficits, setDeficits, setTasks }: ProduktionModuleProps) {
  // Unified flow: Counter reports, Kitchen produces
  // Form states for counter reporting
  const [newItemName, setNewItemName] = useState("");

  // Quick-reporting options with state and localStorage persistence
  const [quickOptions, setQuickOptions] = useState<{ name: string }[]>(() => {
    const cached = localStorage.getItem("luigi_quick_options");
    if (cached) return JSON.parse(cached);
    return [
      { name: "Panino Classico" },
      { name: "Panino Trufola" },
      { name: "Panino Dolce Gorgonzola" },
      { name: "Gorgonzola Dolce" },
      { name: "Pecorino Toscano" },
      { name: "Büffelmozzarella" },
      { name: "Münchner Kräuterbrie" },
      { name: "Grana Padano" }
    ];
  });

  const [newQuickName, setNewQuickName] = useState("");

  const handleAddQuickOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuickName.trim()) return;

    if (quickOptions.some(opt => opt.name.toLowerCase() === newQuickName.trim().toLowerCase())) {
      setNewQuickName("");
      return;
    }

    const updated = [...quickOptions, { name: newQuickName.trim() }];
    setQuickOptions(updated);
    localStorage.setItem("luigi_quick_options", JSON.stringify(updated));
    setNewQuickName("");
  };

  const handleRemoveQuickOption = (nameToRemove: string) => {
    const updated = quickOptions.filter(opt => opt.name !== nameToRemove);
    setQuickOptions(updated);
    localStorage.setItem("luigi_quick_options", JSON.stringify(updated));
  };

  const handleAddDeficit = (name: string) => {
    if (!name.trim()) return;

    // Get current local time format HH:MM
    const now = new Date();
    const timestampStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const uniqueId = "def-" + Date.now();

    const newItem: DeficitItem = {
      id: uniqueId,
      item: name,
      type: "sandwich",     // Default internal value
      priority: "hoch",     // Default internal value
      status: "fehlt",
      timestamp: timestampStr
    };

    setDeficits((prev) => [newItem, ...prev]);

    // Also add as task directly with tag "produktion"
    if (setTasks) {
      const newTask: TaskItem = {
        id: `task-prod-${uniqueId}`,
        title: `Produktion: ${name}`,
        shift: "allgemein",
        priority: "hoch",
        completed: false,
        tags: ["produktion"]
      };
      setTasks((prev) => [newTask, ...prev]);
    }

    setNewItemName("");
  };

  const updateDeficitStatus = (id: string, nextStatus: "fehlt" | "produktion" | "bereit") => {
    setDeficits((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );

    // Sync task state when status changes
    if (setTasks) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === `task-prod-${id}`
            ? { ...task, completed: nextStatus === "bereit" }
            : task
        )
      );
    }
  };

  const removeDeficit = (id: string) => {
    setDeficits((prev) => prev.filter((item) => item.id !== id));

    // Sync task state (delete task if deficit is deleted)
    if (setTasks) {
      setTasks((prev) => prev.filter((task) => task.id !== `task-prod-${id}`));
    }
  };

  const clearCompleted = () => {
    setDeficits((prev) => prev.filter((item) => item.status !== "bereit"));
  };

  return (
    <div className="space-y-6" id="produktion-container">
      {/* Header block (No switcher, no real-time sync texts) */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl flex flex-wrap justify-between items-center gap-4 shadow-sm" id="role-switcher-card">
        <div className="space-y-1" id="role-text-block">
          <h3 className="font-sans font-bold text-lg text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ChefHat className="h-5 w-5 text-emerald-800 dark:text-emerald-400" />
            Produktion & Küchen-Monitor
          </h3>
          <p className="font-sans text-xs text-zinc-400">
            Live-Bedarfsmeldungen aus der Theke direkt an das Küchenteam.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="role-main-grid">
        {/* Left Column: Counter Staff inputs */}
        <div className="lg:col-span-5 space-y-6" id="counter-left-side">
          {/* Form Input Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4" id="manual-deficit-card">
            <h4 className="font-sans font-bold text-md text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
              <ShoppingBag className="h-4 w-4 text-emerald-800" /> Bedarfs-Meldung
            </h4>
            <div className="space-y-3" id="manual-form">
              <div id="form-item-name">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Produktname</label>
                <input
                  id="deficit-input-name"
                  type="text"
                  placeholder="z.B. Panino Trufola, Gorgonzola, etc."
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-700 font-sans font-bold"
                />
              </div>

              <button
                id="submit-deficit-btn"
                onClick={() => handleAddDeficit(newItemName)}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-sans font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="h-5 w-5" /> In die Küche senden
              </button>
            </div>
          </div>

          {/* Quick Touch Panel Card */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4" id="quick-touch-deficits">
            <div className="space-y-1" id="quick-touch-headers">
              <h4 className="font-sans font-bold text-md text-zinc-900 dark:text-zinc-100">
                Schnellwahl-Tasten für die Theke
              </h4>
              <p className="font-sans text-xs text-zinc-400">
                Ein Klick meldet das Produkt direkt in die Küche.
              </p>
            </div>

            {/* POS-Style Add form for custom quick buttons */}
            <form onSubmit={handleAddQuickOption} className="flex gap-2 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-xl border border-zinc-200 dark:border-zinc-800" id="add-quick-btn-form">
              <input
                type="text"
                required
                placeholder="Neues Schnellwahl-Produkt..."
                value={newQuickName}
                onChange={(e) => setNewQuickName(e.target.value)}
                className="flex-grow px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-sans text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
              />
              <button
                type="submit"
                className="px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-sans font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" /> Hinzufügen
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2" id="quick-add-grid">
              {quickOptions.map((opt, i) => (
                <div key={i} className="group relative" id={`quick-wrapper-${i}`}>
                  <button
                    id={`quick-add-${i}`}
                    onClick={() => handleAddDeficit(opt.name)}
                    className="w-full p-3 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-950 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-sans text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-left transition-all active:scale-95 flex flex-col justify-between min-h-[72px]"
                  >
                    <span className="truncate w-full pr-4 text-zinc-900 dark:text-zinc-100 font-bold">{opt.name}</span>
                    <span className="text-[9px] uppercase font-mono tracking-wider text-emerald-850 dark:text-emerald-400 mt-2 block">
                      + Melden
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveQuickOption(opt.name)}
                    className="absolute top-1.5 right-1.5 p-1 text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity rounded cursor-pointer"
                    title="Schnellwahltaste löschen"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Kitchen Monitor & Live Status */}
        <div className="lg:col-span-7 space-y-6" id="kitchen-right-side">
          {/* Active Production Cards (Innenküche) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4" id="kitchen-display-card">
            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-4" id="kdisplay-header">
              <div className="flex items-center gap-2.5 font-sans" id="chef-head-label">
                <ChefHat className="h-6 w-6 text-emerald-800" />
                <h4 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Produktionsmonitor (Küche)
                </h4>
              </div>
              <button
                id="clear-ready-kitchen-btn"
                onClick={clearCompleted}
                className="text-xs text-zinc-400 hover:text-emerald-800 font-mono flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" /> Erledigte archivieren
              </button>
            </div>

            {/* Grid of active production cards for staff */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans" id="kitchen-cards-grid">
              <AnimatePresence mode="popLayout">
                {deficits.filter(x => x.status !== "bereit").length > 0 ? (
                  deficits.filter(x => x.status !== "bereit").map((item) => (
                    <motion.div
                      key={item.id}
                      id={`kitchen-def-card-${item.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`p-5 rounded-2xl border flex flex-col gap-4 relative overflow-hidden ${
                        item.status === "produktion"
                          ? "bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900"
                          : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                      }`}
                    >
                      {/* Status bar marker */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-850" />

                      <div className="flex justify-between items-start gap-2 pt-2" id={`kcard-header-${item.id}`}>
                        <div>
                          <h5 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 leading-snug">
                            {item.item}
                          </h5>
                        </div>
                        <span className="font-mono text-xs text-zinc-400 shrink-0 font-bold">
                          Seit {item.timestamp} Uhr
                        </span>
                      </div>

                      {/* Current Status Badge inside card */}
                      <div className="text-xs" id={`kcard-status-block-${item.id}`}>
                        {item.status === "fehlt" ? (
                          <span className="inline-flex items-center gap-1 text-red-750 font-bold uppercase tracking-wider font-mono">
                            <AlertCircle className="h-4 w-4 shrink-0" /> In Warteschlange
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold uppercase tracking-wider font-mono">
                            <RefreshCw className="h-3.5 w-3.5 animate-spin shrink-0" /> Wird produziert...
                          </span>
                        )}
                      </div>

                      {/* Interactive Buttons for kitchen crew */}
                      <div className="mt-auto grid grid-cols-2 gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800" id={`kcard-actions-${item.id}`}>
                        {item.status === "fehlt" ? (
                          <button
                            id={`start-prod-btn-${item.id}`}
                            onClick={() => updateDeficitStatus(item.id, "produktion")}
                            className="col-span-2 py-3 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Produktion starten
                          </button>
                        ) : (
                          <>
                            <button
                              id={`revert-status-btn-${item.id}`}
                              onClick={() => updateDeficitStatus(item.id, "fehlt")}
                              className="py-2.5 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                            >
                              Warteschlange
                            </button>
                            <button
                              id={`complete-prod-btn-${item.id}`}
                              onClick={() => updateDeficitStatus(item.id, "bereit")}
                              className="py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                            >
                              <Check className="h-4 w-4" /> Fertig!
                            </button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12 text-zinc-400 font-sans" id="no-active-work-kitchen">
                    Keine ausstehenden Produktionswünsche! <br /> Das Küchenteam hat momentan alle Arbeiten erledigt.
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Ready items segment at bottom of kitchen view */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6 mt-4" id="kitchen-ready-products">
              <h5 className="font-sans font-bold text-sm text-zinc-400 uppercase tracking-wider font-mono mb-3">
                Kürzlich fertiggestellt und zur Vitrine geliefert
              </h5>
              <div className="flex flex-wrap gap-2" id="ready-items-badges">
                {deficits.filter((x) => x.status === "bereit").length > 0 ? (
                  deficits.filter((x) => x.status === "bereit").map((item) => (
                    <div
                      key={item.id}
                      id={`ready-pill-${item.id}`}
                      className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/35 px-3.5 py-2 rounded-xl flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-sans text-sm"
                    >
                      <Check className="h-4 w-4 text-emerald-800 shrink-0" />
                      <span className="font-semibold">{item.item}</span>
                      <span className="text-zinc-400 font-mono text-xs">({item.timestamp})</span>
                      <button
                        id={`unready-item-btn-${item.id}`}
                        onClick={() => removeDeficit(item.id)}
                        className="text-zinc-400 hover:text-red-500 font-bold ml-1 cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-zinc-400 text-xs italic font-sans">Noch keine Lieferungen in dieser Sitzung.</p>
                )}
              </div>
            </div>
          </div>

          {/* Deficit Monitor status log (Theke status feedback) */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4" id="counter-monitor-card">
            <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-4" id="monitor-header">
              <h4 className="font-sans font-bold text-zinc-900 dark:text-zinc-100">
                Status-Übersicht aller gemeldeten Artikel
              </h4>
              <button
                id="clear-ready-counter-btn"
                onClick={clearCompleted}
                className="text-xs text-zinc-400 hover:text-emerald-800 font-mono flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="h-3 w-3" /> Bereitgestellte aufräumen
              </button>
            </div>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[350px] overflow-y-auto pr-1" id="deficit-reported-list">
              <AnimatePresence mode="popLayout">
                {deficits.length > 0 ? (
                  deficits.map((item) => (
                    <motion.div
                      key={item.id}
                      id={`counter-def-row-${item.id}`}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="py-4 flex gap-4 items-center justify-between"
                    >
                      <div className="space-y-1 block" id={`def-row-info-${item.id}`}>
                        <div className="flex items-center gap-2 flex-wrap" id={`def-row-head-${item.id}`}>
                          <span className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100">
                            {item.item}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono" id={`def-row-sub-${item.id}`}>
                          <span>Gemeldet um: {item.timestamp} Uhr</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3" id={`def-row-action-${item.id}`}>
                        {/* Color-coded Status pill */}
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider font-mono ${
                          item.status === "fehlt"
                            ? "bg-red-50 text-red-700 animate-pulse border border-red-200"
                            : item.status === "produktion"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-100 text-emerald-800"
                        }`}>
                          {item.status === "fehlt" && "Warteschlange"}
                          {item.status === "produktion" && "Wird produziert"}
                          {item.status === "bereit" && "Bereit (In Vitrine)"}
                        </span>

                        {/* Delete button (only if ready or to correct mistakes) */}
                        <button
                          id={`delete-def-btn-${item.id}`}
                          onClick={() => removeDeficit(item.id)}
                          className="p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/20 cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12 text-zinc-400 font-sans" id="no-deficits-reported">
                    Aktuell keine Bedarfe gelistet. Volle Vitrinen!
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
