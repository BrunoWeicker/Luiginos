import React, { useState } from "react";
import { GuideArticle, ChecklistItem } from "../types";
import {
  Search,
  CheckCircle,
  Circle,
  Clock,
  Check,
  Info,
  ArrowRight,
  ShieldAlert,
  Coffee,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  FileEdit
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HandbuchModuleProps {
  articles: GuideArticle[];
  setArticles: React.Dispatch<React.SetStateAction<GuideArticle[]>>;
  fruehChecklist: ChecklistItem[];
  setFruehChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  spaetChecklist: ChecklistItem[];
  setSpaetChecklist: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
}

export default function HandbuchModule({
  articles,
  setArticles,
  fruehChecklist,
  setFruehChecklist,
  spaetChecklist,
  setSpaetChecklist
}: HandbuchModuleProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [activeSubTab, setActiveSubTab] = useState<"handbuch" | "checklists" | "layout">("handbuch");
  const [activeChecklist, setActiveChecklist] = useState<"frueh" | "spaet">("frueh");

  // State for editing checklists
  const [isEditing, setIsEditing] = useState(false);
  const [newCheckTask, setNewCheckTask] = useState("");
  const [newCheckDetail, setNewCheckDetail] = useState("");
  const [newCheckTime, setNewCheckTime] = useState("");

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCheckTask.trim()) return;

    const newItem: ChecklistItem = {
      id: `${activeChecklist}-${Date.now()}`,
      task: newCheckTask.trim(),
      detail: newCheckDetail.trim(),
      requiredTime: newCheckTime.trim() || undefined,
      completed: false
    };

    if (activeChecklist === "frueh") {
      setFruehChecklist((prev) => [...prev, newItem]);
    } else {
      setSpaetChecklist((prev) => [...prev, newItem]);
    }

    setNewCheckTask("");
    setNewCheckDetail("");
    setNewCheckTime("");
  };

  const updateItemField = (id: string, field: keyof ChecklistItem, value: any) => {
    if (activeChecklist === "frueh") {
      setFruehChecklist((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    } else {
      setSpaetChecklist((prev) =>
        prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
      );
    }
  };

  const deleteItem = (id: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Punkt dauerhaft aus der Checkliste löschen möchten?")) {
      if (activeChecklist === "frueh") {
        setFruehChecklist((prev) => prev.filter((item) => item.id !== id));
      } else {
        setSpaetChecklist((prev) => prev.filter((item) => item.id !== id));
      }
    }
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const list = activeChecklist === "frueh" ? [...fruehChecklist] : [...spaetChecklist];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    if (activeChecklist === "frueh") {
      setFruehChecklist(list);
    } else {
      setSpaetChecklist(list);
    }
  };

  // State for editing wiki articles
  const [isEditingWiki, setIsEditingWiki] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [newFaqCategory, setNewFaqCategory] = useState<GuideArticle["category"]>("allgemein");
  const [newFaqTags, setNewFaqTags] = useState("");

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFaqQuestion.trim() || !newFaqAnswer.trim()) return;

    const newArticle: GuideArticle = {
      id: `faq-${Date.now()}`,
      category: newFaqCategory,
      title: newFaqQuestion.trim().substring(0, 40) + "...",
      question: newFaqQuestion.trim(),
      answer: newFaqAnswer.trim(),
      tags: newFaqTags.split(",").map(t => t.trim()).filter(Boolean)
    };

    setArticles((prev) => [newArticle, ...prev]);
    setNewFaqQuestion("");
    setNewFaqAnswer("");
    setNewFaqCategory("allgemein");
    setNewFaqTags("");
  };

  const handleDeleteFaq = (id: string) => {
    if (window.confirm("Sind Sie sicher, dass Sie diesen Eintrag aus der Wissensdatenbank löschen möchten?")) {
      setArticles((prev) => prev.filter((art) => art.id !== id));
    }
  };

  // Filtering articles based on search query and category
  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === "all" || art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const toggleFruehCheck = (id: string) => {
    setFruehChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const toggleSpaetCheck = (id: string) => {
    setSpaetChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  // Checklist statistics
  const fruehCompletedCount = fruehChecklist.filter((x) => x.completed).length;
  const fruehProgress = fruehChecklist.length ? Math.round((fruehCompletedCount / fruehChecklist.length) * 100) : 0;

  const spaetCompletedCount = spaetChecklist.filter((x) => x.completed).length;
  const spaetProgress = spaetChecklist.length ? Math.round((spaetCompletedCount / spaetChecklist.length) * 100) : 0;

  return (
    <div className="space-y-6" id="handbuch-container">
      {/* Sub-header Navigation with beautiful buttons */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800" id="handbuch-subtabs">
        <button
          id="tab-handbuch-wiki"
          onClick={() => setActiveSubTab("handbuch")}
          className={`px-6 py-3 font-sans text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === "handbuch"
              ? "border-emerald-800 text-emerald-800 dark:text-emerald-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Wissensdatenbank
        </button>
        <button
          id="tab-handbuch-checklists"
          onClick={() => setActiveSubTab("checklists")}
          className={`px-6 py-3 font-sans text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === "checklists"
              ? "border-emerald-800 text-emerald-800 dark:text-emerald-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Checklisten Schichten
        </button>
        <button
          id="tab-handbuch-layout"
          onClick={() => setActiveSubTab("layout")}
          className={`px-6 py-3 font-sans text-sm font-medium border-b-2 transition-colors ${
            activeSubTab === "layout"
              ? "border-emerald-800 text-emerald-800 dark:text-emerald-400"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          Stand-Aufteilung
        </button>
      </div>

      {/* RENDER SUB-TAB: WISSENSDATENBANK */}
      {activeSubTab === "handbuch" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
          id="handbuch-wiki-view"
        >
          {/* Search bar & Categories filter */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4" id="wiki-controls">
            <div className="relative" id="wiki-search-box">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 h-5 w-5" />
              <input
                id="search-input"
                type="text"
                placeholder="Suchleiste: Frage oder Begriff heraussuchen... (z.B. 'Öffnung', 'Käse', 'Kasse')"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-sans text-base"
              />
            </div>

            <div className="flex flex-wrap gap-2 text-sm justify-between items-center w-full" id="wiki-category-filter">
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "Alle Rubriken" },
                  { value: "prozesse", label: "Prozesse & Standöffnung" },
                  { value: "hygiene", label: "Hygiene & Einlagerung" },
                  { value: "geraete", label: "Geräte & Pflege" },
                  { value: "allgemein", label: "Allgemein" },
                  { value: "notfall", label: "Notfallanweisungen" }
                ].map((cat) => (
                  <button
                    key={cat.value}
                    id={`cat-btn-${cat.value}`}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-2 rounded-lg font-sans transition-all border ${
                      selectedCategory === cat.value
                        ? "bg-emerald-800 text-white border-emerald-800"
                        : "bg-zinc-50 hover:bg-zinc-100 text-zinc-650 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIsEditingWiki(!isEditingWiki)}
                className={`px-4 py-2 rounded-lg font-sans font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isEditingWiki
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-zinc-100 dark:bg-zinc-850 text-zinc-650 dark:text-zinc-350 hover:bg-zinc-200"
                }`}
              >
                <FileEdit className="h-3.5 w-3.5" />
                {isEditingWiki ? "Bearbeiten beenden" : "Wissensdatenbank bearbeiten"}
              </button>
            </div>
          </div>

          {/* Quick-Help banner for tablet kiosk */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/35 p-4 rounded-xl flex items-start gap-3" id="kiosk-note">
            <Info className="text-emerald-700 dark:text-emerald-500 h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                Tablet Kiosk-Modus
              </p>
              <p className="font-sans text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                Dieses Handbuch dient als „Single Source of Truth”. Neues Personal kann hier über die Suchleiste oder die Touch-Rubriken sofort alle Betriebsstandards aufrufen.
              </p>
            </div>
          </div>

          {isEditingWiki && (
            <form onSubmit={handleAddFaq} className="bg-zinc-50 dark:bg-zinc-950 p-5 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4 animate-fadeIn" id="add-faq-form">
              <p className="font-sans font-bold text-[10px] text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <Plus className="h-4 w-4 text-emerald-800" /> Neuen Wissensdatenbank-Eintrag hinzufügen
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider font-mono">Rubrik *</label>
                  <select
                    value={newFaqCategory}
                    onChange={(e) => setNewFaqCategory(e.target.value as any)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-emerald-800 text-zinc-800 dark:text-zinc-100 font-sans"
                  >
                    <option value="prozesse">Prozesse & Standöffnung</option>
                    <option value="hygiene">Hygiene & Einlagerung</option>
                    <option value="geraete">Geräte & Pflege</option>
                    <option value="allgemein">Allgemein</option>
                    <option value="notfall">Notfallanweisungen</option>
                  </select>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider font-mono">Tags (kommagetrennt)</label>
                  <input
                    type="text"
                    placeholder="z.B. Kasse, Abrechnung, Abend"
                    value={newFaqTags}
                    onChange={(e) => setNewFaqTags(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-emerald-800 text-zinc-800 dark:text-zinc-100 font-sans"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider font-mono">Frage *</label>
                <input
                  type="text"
                  required
                  placeholder="z.B. Wie wird die Kasse am Abend abgerechnet?"
                  value={newFaqQuestion}
                  onChange={(e) => setNewFaqQuestion(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-emerald-800 text-zinc-800 dark:text-zinc-100 font-sans font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider font-mono">Antwort *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Gib hier die genaue Beschreibung / Anweisung ein..."
                  value={newFaqAnswer}
                  onChange={(e) => setNewFaqAnswer(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-emerald-800 text-zinc-800 dark:text-zinc-100 font-sans"
                />
              </div>
              <div className="flex justify-end pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-850 hover:bg-emerald-800 text-white font-sans font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Eintrag speichern
                </button>
              </div>
            </form>
          )}

          {/* Articles list */}
          <div className="grid grid-cols-1 gap-4" id="articles-list">
            <AnimatePresence mode="popLayout">
              {filteredArticles.length > 0 ? (
                filteredArticles.map((art) => (
                  <motion.div
                    key={art.id}
                    id={`article-card-${art.id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between" id={`article-header-${art.id}`}>
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider font-mono ${
                          art.category === "notfall"
                            ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400"
                            : art.category === "hygiene"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                        }`}
                      >
                        {art.category}
                      </span>
                      <div className="flex items-center gap-3" id={`article-meta-actions-${art.id}`}>
                        <div className="flex gap-1.5" id={`article-tags-${art.id}`}>
                          {art.tags.map((tag) => (
                            <span key={tag} className="text-xs text-zinc-400 font-sans">
                              #{tag}
                            </span>
                          ))}
                        </div>
                        {isEditingWiki && (
                          <button
                            type="button"
                            onClick={() => handleDeleteFaq(art.id)}
                            className="p-1.5 text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-red-200 dark:hover:border-red-900"
                            title="Eintrag löschen"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1" id={`article-content-wrapper-${art.id}`}>
                      <h4 className="font-sans text-lg font-bold text-zinc-900 dark:text-zinc-100">
                        Q: {art.question}
                      </h4>
                      <p className="font-sans text-zinc-600 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap pt-2">
                        {art.answer}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800" id="no-articles-view">
                  <p className="text-zinc-400 font-sans">Keine Einträge für diese Suchanfragen gefunden.</p>
                  <button
                    onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
                    className="mt-3 text-sm text-emerald-700 dark:text-emerald-400 underline font-sans"
                  >
                    Filter zurücksetzen
                  </button>
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* RENDER SUB-TAB: CHECKLISTEN */}
      {activeSubTab === "checklists" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
          id="checklists-view"
        >
          {/* Shift selection and live stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="checklist-selectors">
            {/* Frühschicht Widget */}
            <button
              id="select-frueh-checklist"
              onClick={() => setActiveChecklist("frueh")}
              className={`p-6 rounded-2xl border transition-all text-left relative overflow-hidden ${
                activeChecklist === "frueh"
                  ? "bg-gradient-to-br from-emerald-950 to-emerald-900 text-white border-emerald-800 shadow-md"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50"
              }`}
            >
              <div className="flex justify-between items-start mb-4" id="frueh-widget-head">
                <div>
                  <h4 className="font-sans font-bold text-lg">Frühschicht (Morgens)</h4>
                  <p className={`font-sans text-xs ${activeChecklist === "frueh" ? "text-emerald-200" : "text-zinc-400"}`}>
                    Beginn ab 08:45 Uhr • Aufheizen, Aufbau & Vorbereitung
                  </p>
                </div>
                <Clock className={`h-6 w-6 ${activeChecklist === "frueh" ? "text-emerald-300" : "text-zinc-400"}`} />
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5" id="frueh-widget-progress">
                <div className="flex justify-between text-xs font-mono" id="frueh-progress-text">
                  <span>Fortschritt: {fruehProgress}%</span>
                  <span>{fruehCompletedCount} von {fruehChecklist.length} erledigt</span>
                </div>
                <div className="w-full h-2 bg-black/20 dark:bg-zinc-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                    style={{ width: `${fruehProgress}%` }}
                  />
                </div>
              </div>
            </button>

            {/* Spätschicht Widget */}
            <button
              id="select-spaet-checklist"
              onClick={() => setActiveChecklist("spaet")}
              className={`p-6 rounded-2xl border transition-all text-left relative overflow-hidden ${
                activeChecklist === "spaet"
                  ? "bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-zinc-700 shadow-md"
                  : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-100 hover:bg-zinc-50"
              }`}
            >
              <div className="flex justify-between items-start mb-4" id="spaet-widget-head">
                <div>
                  <h4 className="font-sans font-bold text-lg">Spätschicht (Abbau)</h4>
                  <p className={`font-sans text-xs ${activeChecklist === "spaet" ? "text-zinc-300" : "text-zinc-400"}`}>
                    Abbau ab 18:00 Uhr • Einlagerung, Reinigung & Abschluss
                  </p>
                </div>
                <Clock className={`h-6 w-6 ${activeChecklist === "spaet" ? "text-zinc-300" : "text-zinc-400"}`} />
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5" id="spaet-widget-progress">
                <div className="flex justify-between text-xs font-mono" id="spaet-progress-text">
                  <span>Fortschritt: {spaetProgress}%</span>
                  <span>{spaetCompletedCount} von {spaetChecklist.length} erledigt</span>
                </div>
                <div className="w-full h-2 bg-black/20 dark:bg-zinc-950 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${spaetProgress}%` }}
                  />
                </div>
              </div>
            </button>
          </div>

          {/* Checklist Instructions Banner */}
          <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/35 p-4 rounded-xl flex items-start gap-3" id="checklist-notice">
            <Info className="text-amber-700 dark:text-amber-500 h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-sans text-xs text-amber-800 dark:text-amber-300 leading-relaxed font-semibold">
                Wichtiger Hinweis: Sandwichgrills benötigen 20 Minuten Aufheizzeit!
              </p>
              <p className="font-sans text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
                Diese Checklisten müssen JEDEN Tag lückenlos am Kiosk-Tablet abgehakt werden. So weiß das Spätteam bei der Schichtübergabe sofort, was Sache ist.
              </p>
            </div>
          </div>

          {/* Interactive list items */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4" id="checklist-items-card">
            <h3 className="font-sans font-bold text-lg text-zinc-950 dark:text-zinc-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                Ablauf {activeChecklist === "frueh" ? "Frühschicht" : "Spätschicht"}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-2.5 py-1 text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer font-sans font-bold ${
                    isEditing
                      ? "bg-amber-600 hover:bg-amber-700 text-white"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-650 dark:text-zinc-300 hover:bg-zinc-200"
                  }`}
                >
                  <FileEdit className="h-3 w-3" />
                  {isEditing ? "Bearbeiten beenden" : "Liste bearbeiten"}
                </button>
              </span>
              <button
                id="reset-checklist-btn"
                onClick={() => {
                  if (activeChecklist === "frueh") {
                    setFruehChecklist(prev => prev.map(item => ({ ...item, completed: false })));
                  } else {
                    setSpaetChecklist(prev => prev.map(item => ({ ...item, completed: false })));
                  }
                }}
                className="text-xs text-zinc-500 hover:text-emerald-800 hover:underline font-mono"
              >
                Liste zurücksetzen
              </button>
            </h3>

            {isEditing && (
              <form onSubmit={handleAddChecklistItem} className="bg-zinc-50 dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-850 rounded-xl space-y-3 animate-fadeIn" id="add-checklist-item-form">
                <p className="font-sans font-bold text-[10px] text-zinc-500 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                  <Plus className="h-4 w-4 text-emerald-800" /> Neuen Punkt hinzufügen
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider font-mono">Aufgabe *</label>
                    <input
                      type="text"
                      required
                      placeholder="z.B. Käsetheke bestücken"
                      value={newCheckTask}
                      onChange={(e) => setNewCheckTask(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-emerald-800 font-sans font-semibold text-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider font-mono">Beschreibung / Detail</label>
                    <input
                      type="text"
                      placeholder="z.B. Pecorino und Camembert auffüllen..."
                      value={newCheckDetail}
                      onChange={(e) => setNewCheckDetail(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-emerald-800 font-sans text-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider font-mono">Zeitbedarf (optional)</label>
                    <input
                      type="text"
                      placeholder="z.B. 15 Min"
                      value={newCheckTime}
                      onChange={(e) => setNewCheckTime(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-xs rounded-lg focus:outline-none focus:border-emerald-800 font-sans text-zinc-800 dark:text-zinc-100"
                    />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-850 hover:bg-emerald-800 text-white font-sans font-bold text-xs rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    Hinzufügen
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800" id="checklist-items-list">
              {(activeChecklist === "frueh" ? fruehChecklist : spaetChecklist).map((item, index) => {
                if (isEditing) {
                  return (
                    <div
                      key={item.id}
                      id={`checklist-item-edit-${item.id}`}
                      className="flex flex-col md:flex-row items-stretch md:items-center gap-3 py-4 text-left transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 rounded-lg px-2"
                    >
                      {/* Drag / Move Controls */}
                      <div className="flex md:flex-col justify-between md:justify-center items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1.5 md:p-1 rounded-lg shrink-0">
                        <button
                          type="button"
                          onClick={() => moveItem(index, "up")}
                          disabled={index === 0}
                          className="p-1 text-zinc-500 hover:text-emerald-800 hover:bg-white dark:hover:bg-zinc-900 rounded disabled:opacity-30 cursor-pointer"
                          title="Nach oben verschieben"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <span className="font-mono text-[10px] text-zinc-400 font-bold px-1">{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => moveItem(index, "down")}
                          disabled={index === (activeChecklist === "frueh" ? fruehChecklist.length : spaetChecklist.length) - 1}
                          className="p-1 text-zinc-500 hover:text-emerald-800 hover:bg-white dark:hover:bg-zinc-900 rounded disabled:opacity-30 cursor-pointer"
                          title="Nach unten verschieben"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {/* Editing Fields */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-grow">
                        <div className="space-y-0.5">
                          <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Aufgabe</label>
                          <input
                            type="text"
                            value={item.task}
                            onChange={(e) => updateItemField(item.id, "task", e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 py-1.5 text-xs rounded focus:outline-none focus:border-emerald-800 font-sans font-bold text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Detailbeschreibung</label>
                          <input
                            type="text"
                            value={item.detail}
                            onChange={(e) => updateItemField(item.id, "detail", e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 py-1.5 text-xs rounded focus:outline-none focus:border-emerald-800 font-sans text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                        <div className="space-y-0.5">
                          <label className="text-[8px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Zeitbedarf</label>
                          <input
                            type="text"
                            value={item.requiredTime || ""}
                            placeholder="Nicht gesetzt"
                            onChange={(e) => updateItemField(item.id, "requiredTime", e.target.value || undefined)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 px-2 py-1.5 text-xs rounded focus:outline-none focus:border-emerald-800 font-sans font-medium text-zinc-800 dark:text-zinc-100"
                          />
                        </div>
                      </div>

                      {/* Delete Action */}
                      <div className="flex items-center justify-end md:justify-center p-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-700 rounded-lg border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-colors cursor-pointer"
                          title="Löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    id={`checklist-item-${item.id}`}
                    onClick={() => activeChecklist === "frueh" ? toggleFruehCheck(item.id) : toggleSpaetCheck(item.id)}
                    className="w-full flex items-start gap-4 py-4 text-left transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 rounded-lg px-2 group"
                  >
                    <div className="pt-0.5 shrink-0" id={`checklist-item-icon-${item.id}`}>
                      {item.completed ? (
                        <CheckCircle className="h-6 w-6 text-emerald-800 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="h-6 w-6 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400" />
                      )}
                    </div>
                    <div className="space-y-1 block" id={`checklist-item-text-${item.id}`}>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-mono text-zinc-400 text-xs">{index + 1}.</span>
                        <h5 className={`font-sans font-semibold text-base transition-colors ${
                          item.completed ? "text-zinc-400 line-through" : "text-zinc-900 dark:text-zinc-100"
                        }`}>
                          {item.task}
                        </h5>
                        {item.requiredTime && (
                          <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-500 font-medium">
                            {item.requiredTime}
                          </span>
                        )}
                      </div>
                      <p className={`font-sans text-xs leading-relaxed ${
                        item.completed ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
                      }`}>
                        {item.detail}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* RENDER SUB-TAB: STAND-AUFTEILUNG */}
      {activeSubTab === "layout" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
          id="layout-view"
        >
          {/* Visual representations of areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="areas-layout-grid">
            {/* AUSSENBEREICH CARDS */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4" id="layout-ausserhalb-card">
              <h3 className="font-sans font-bold text-lg text-emerald-900 dark:text-emerald-400 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
                Außenbereich (Verkauf & Kundenfront)
              </h3>
              <p className="font-sans text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Der Außenbereich am Viktualienmarkt ist unsere primäre Verkaufsfläche und für die Kunden voll einsehbar. Sorgfalt und Sauberkeit sind hier oberste Pflicht.
              </p>

              <div className="space-y-3 pt-2" id="exterior-details">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="ext-section-1">
                  <h4 className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">Käseverkauf ungekühlt (bis max. 20°C)</h4>
                  <p className="font-sans text-xs text-zinc-500 mt-1">
                    Nur ausgereifte Hartkäse-Laibe wie Pecorino Romano oder Grana Padano dürfen hier draußen präsentiert werden. Falls Temperatur über 20°C steigt beziehungsweise abends: Alles rein in die Kühlung.
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="ext-section-2">
                  <h4 className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">Gekühlter Käseverkauf (2 separate Theken)</h4>
                  <p className="font-sans text-xs text-zinc-500 mt-1">
                    Für alle Weich- und Frischkäsesorten (Brie, Camembert, Gorgonzola, Mozzarella). Die Theken-Temperatur muss stündlich geprüft werden und darf 7°C nicht überschreiten.
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="ext-section-3">
                  <h4 className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">Sandwichverkauf mit Vorbereitungstheke</h4>
                  <p className="font-sans text-xs text-zinc-500 mt-1">
                    Kundenfront mit 2 Hochleistungs-Panini-Grills. Zutatenboxen aus Edelstahl müssen stets nachbestückt und sauber beschriftet sein.
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="ext-section-4">
                  <h4 className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">Die 6 Kiosk-Kühlschränke</h4>
                  <p className="font-sans text-xs text-zinc-500 mt-1">
                    Nummeriert von 1 bis 6: <br/>
                    • <strong>1 & 2:</strong> Getränke, Wurst- und Fleischwaren.<br/>
                    • <strong>3 & 4:</strong> Käse-Einlagerung und vorbereitete Käserohlinge.<br/>
                    • <strong>5 & 6:</strong> Backup-Getränke und Zutaten-Backups für Sandwiches.
                  </p>
                </div>
              </div>
            </div>

            {/* INNENBEREICH CARDS */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm space-y-4" id="layout-innenseitig-card">
              <h3 className="font-sans font-bold text-lg text-emerald-950 dark:text-emerald-300 border-b border-zinc-100 dark:border-zinc-800 pb-3 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-zinc-800 dark:bg-zinc-400"></span>
                Innenbereich (Vorbereitungsküche & Spüle)
              </h3>
              <p className="font-sans text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed">
                Der Innenbereich dient ausschließlich als geschützter Vorbereitungsraum für die Küche. Hier findet kein direkter Kundenkontakt statt.
              </p>

              <div className="space-y-3 pt-2" id="interior-details-box">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="int-section-1">
                  <h4 className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">Vorbereitungsinsel</h4>
                  <p className="font-sans text-xs text-zinc-500 mt-1">
                    Schneiden von Tomaten, Rucola waschen, Portionieren von Schinken und Käse. WICHTIG: Verwende getrennte Schneidebretter für Fleisch (ROT) und Salat/Käse (GRÜN).
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="int-section-2">
                  <h4 className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">Spülbereich & Entsorgung</h4>
                  <p className="font-sans text-xs text-zinc-500 mt-1">
                    Gastro-Geschirrspüler für Edelstahlbehälter und Schieferplatten. Auf hohe Wassertemperaturen zur Desinfektion achten.
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="int-section-3">
                  <h4 className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">Lagerregale & Trockenwaren</h4>
                  <p className="font-sans text-xs text-zinc-500 mt-1">
                    Lagerung von Verpackungsmaterial (Zellophan, Fettpapier, Servietten, Tüten), Gewürzen, Kaffee-Nachschub und Reinigungsutensilien.
                  </p>
                </div>

                <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="int-section-4">
                  <h4 className="font-sans font-bold text-sm text-zinc-800 dark:text-zinc-200">HACCP-Kontrolle</h4>
                  <p className="font-sans text-xs text-zinc-500 mt-1">
                    An der Innenwand hängt das physische HACCP-Ordnerwerk. In dieser App gepflegte digitale Listen dienen als schneller Nachweis für Temperatur- und Reinigungskontrollen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
