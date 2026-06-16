import React, { useState, useEffect } from "react";
import { GuideArticle, ChecklistItem, Recipe, DeficitItem, TaskItem, TeamMember, Shift } from "./types";
import {
  initialArticles,
  initialFruehChecklist,
  initialSpaetChecklist,
  initialRecipes,
  initialDeficits,
  initialTasks,
  initialTeam,
  initialShifts
} from "./data/mockData";

// Components
import HandbuchModule from "./components/HandbuchModule";
import RezepteModule from "./components/RezepteModule";
import ProduktionModule from "./components/ProduktionModule";
import TodoModule from "./components/TodoModule";
import DienstplanModule from "./components/DienstplanModule";
import MitarbeiterModule from "./components/MitarbeiterModule";

// Icons
import {
  BookOpen,
  ClipboardCheck,
  TrendingDown,
  CalendarDays,
  Menu,
  Clock,
  Shield,
  Coffee,
  HelpCircle,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [activeTab, setActiveTab] = useState<"handbuch" | "rezepte" | "produktion" | "todo" | "dienstplan" | "mitarbeiter">("handbuch");

  // State managed globally and synced with localStorage for persistent kiosk utilization
  const [articles, setArticles] = useState<GuideArticle[]>(initialArticles);
  
  const [fruehChecklist, setFruehChecklist] = useState<ChecklistItem[]>(() => {
    const cached = localStorage.getItem("luigi_frueh_checklist");
    return cached ? JSON.parse(cached) : initialFruehChecklist;
  });

  const [spaetChecklist, setSpaetChecklist] = useState<ChecklistItem[]>(() => {
    const cached = localStorage.getItem("luigi_spaet_checklist");
    return cached ? JSON.parse(cached) : initialSpaetChecklist;
  });

  const [deficits, setDeficits] = useState<DeficitItem[]>(() => {
    const cached = localStorage.getItem("luigi_deficits");
    return cached ? JSON.parse(cached) : initialDeficits;
  });

  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    const cached = localStorage.getItem("luigi_tasks");
    return cached ? JSON.parse(cached) : initialTasks;
  });

  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const cached = localStorage.getItem("luigi_recipes");
    return cached ? JSON.parse(cached) : initialRecipes;
  });

  const [team, setTeam] = useState<TeamMember[]>(() => {
    const cached = localStorage.getItem("luigi_team_members");
    if (cached) return JSON.parse(cached);
    return initialTeam.map((member) => ({
      ...member,
      vorname: member.name,
      nachname: member.name === "Luigino" ? "Chef" : (member.name === "Francesca" ? "Rossi" : member.name === "Marco" ? "Polo" : "Bianchi"),
      birthDate: member.name === "Luigino" ? "1980-05-12" : member.name === "Marco" ? "1988-09-17" : member.name === "Francesca" ? "1992-02-04" : "1996-11-20",
      documents: []
    }));
  });
  const [weeklyShifts, setWeeklyShifts] = useState<Record<string, Shift[]>>(() => {
    const cached = localStorage.getItem("luigi_weekly_shifts");
    if (cached) return JSON.parse(cached);
    return {
      "KW 24 (08.06. - 14.06.2026)": initialShifts,
      "KW 25 (15.06. - 21.06.2026)": initialShifts.map((s) => ({ ...s, frueh: "Offen", spaet: "Offen", produktion: "Offen" })),
      "KW 26 (22.06. - 28.06.2026)": initialShifts.map((s) => ({ ...s, frueh: "Offen", spaet: "Offen", produktion: "Offen" })),
      "KW 27 (29.06. - 05.07.2026)": initialShifts.map((s) => ({ ...s, frueh: "Offen", spaet: "Offen", produktion: "Offen" })),
    };
  });

  // Syncing modifications with LocalStorage
  useEffect(() => {
    localStorage.setItem("luigi_team_members", JSON.stringify(team));
  }, [team]);

  useEffect(() => {
    localStorage.setItem("luigi_weekly_shifts", JSON.stringify(weeklyShifts));
  }, [weeklyShifts]);

  useEffect(() => {
    localStorage.setItem("luigi_frueh_checklist", JSON.stringify(fruehChecklist));
  }, [fruehChecklist]);

  useEffect(() => {
    localStorage.setItem("luigi_spaet_checklist", JSON.stringify(spaetChecklist));
  }, [spaetChecklist]);

  useEffect(() => {
    localStorage.setItem("luigi_deficits", JSON.stringify(deficits));
  }, [deficits]);

  useEffect(() => {
    localStorage.setItem("luigi_tasks", JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem("luigi_recipes", JSON.stringify(recipes));
  }, [recipes]);

  // Clock state for kiosk tablet display
  const [timeString, setTimeString] = useState("");
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit"
        }) + " Uhr"
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="full-app-root" className="flex flex-col lg:flex-row min-h-screen bg-[#F8F9FA] dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 select-none font-sans overflow-x-hidden md:overflow-y-auto">
      {/* SIDEBAR NAVIGATION */}
      <nav id="app-sidebar" className="w-full lg:w-[260px] bg-[#064E3B] flex flex-col shadow-xl z-20 shrink-0">
        {/* Sidebar Header */}
        <div className="p-6 lg:p-8 shrink-0 flex justify-between items-center lg:block border-b border-emerald-800 lg:border-none" id="sidebar-header-box">
          <div>
            <div className="text-white font-black text-2xl lg:text-3xl tracking-tight mb-0.5">LUIGINOS</div>
            <div className="text-emerald-300 text-[10px] uppercase tracking-[0.2em] font-extrabold font-mono">Viktualienmarkt</div>
          </div>
          {/* Circular Badge indicating tablet state */}
          <div className="bg-emerald-900/50 text-emerald-300 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono border border-emerald-700/30 flex items-center gap-1.5" id="sidebar-status-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Tablet-Kiosk
          </div>
        </div>
        
        {/* Navigation Items */}
        <div className="flex-1 px-4 py-4 space-y-2 lg:space-y-2.5 overflow-x-auto lg:overflow-x-visible flex flex-row lg:flex-col items-center lg:items-stretch border-b border-emerald-800 lg:border-none" id="sidebar-navigation-items">
          {[
            { id: "handbuch", label: "Betriebshandbuch", icon: BookOpen },
            { id: "rezepte", label: "Rezept-Datenbank", icon: HelpCircle },
            { id: "produktion", label: "Küche/Produktion", icon: TrendingDown },
            { id: "todo", label: "Aufgaben-Manager", icon: ClipboardCheck },
            { id: "dienstplan", label: "Dienstplan", icon: CalendarDays },
            { id: "mitarbeiter", label: "Mitarbeiter-Verwaltung", icon: Users }
          ].map((item) => {
            const IconComponent = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`tab-btn-${item.id}`}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-auto lg:w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-white/10 text-white font-semibold backdrop-blur-md"
                    : "text-emerald-100 hover:bg-emerald-800/30"
                }`}
              >
                <div className={`w-2.5 h-2.5 rounded-full transition-all shrink-0 ${
                  isSelected ? "bg-emerald-400 scale-110 shadow-sm shadow-emerald-400/50" : "bg-transparent border border-emerald-400"
                }`}></div>
                <IconComponent className="h-4 w-4 opacity-80" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer User Info block */}
        <div className="p-6 border-t border-emerald-800 hidden lg:block" id="sidebar-user-block">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center text-white font-extrabold text-sm border-2 border-emerald-600/50">
              L
            </div>
            <div>
              <div className="text-white text-xs font-bold leading-tight">Luigino (Chef)</div>
              <div className="text-emerald-400 text-[10px] uppercase tracking-wider font-extrabold font-mono mt-0.5">Admin-Modus</div>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0" id="main-content-pane">
        {/* HEADER AREA */}
        <header className="py-4 px-6 lg:px-8 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs" id="app-nav-header">
          <div>
            <h1 className="text-xl lg:text-2xl font-black text-slate-800 dark:text-zinc-100 tracking-tight">
              {activeTab === "handbuch" && "Digitales Betriebshandbuch"}
              {activeTab === "rezepte" && "Rezept-Datenbank & Standards"}
              {activeTab === "produktion" && "Küche & Produktion"}
              {activeTab === "todo" && "Aufgaben- & Todo-Management"}
              {activeTab === "dienstplan" && "Wochen-Dienstplan & Team"}
              {activeTab === "mitarbeiter" && "Mitarbeiterverwaltung & Akten"}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Aktualisiert vor einigen Momenten • Single Source of Truth
            </p>
          </div>

          <div className="flex items-center gap-4" id="header-right-meta">
            {/* Live Timer readout */}
            <div className="bg-zinc-50 dark:bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 flex items-center gap-2.5 font-mono text-zinc-400 text-sm font-semibold whitespace-nowrap shadow-xs">
              <Clock className="h-4 w-4 text-emerald-800 animate-pulse" />
              <span className="text-zinc-800 dark:text-zinc-100">{timeString || "Lädt..."}</span>
            </div>
          </div>
        </header>

        {/* VIEWPORT CONTENT: INTERACTIVE DASHBOARD */}
        <div className="flex-1 p-6 lg:p-8" id="viewport-content-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              id={`tab-viewport-${activeTab}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "handbuch" && (
                <HandbuchModule
                  articles={articles}
                  fruehChecklist={fruehChecklist}
                  setFruehChecklist={setFruehChecklist}
                  spaetChecklist={spaetChecklist}
                  setSpaetChecklist={setSpaetChecklist}
                />
              )}

              {activeTab === "rezepte" && (
                <RezepteModule recipes={recipes} setRecipes={setRecipes} />
              )}

              {activeTab === "produktion" && (
                <ProduktionModule deficits={deficits} setDeficits={setDeficits} setTasks={setTasks} />
              )}

              {activeTab === "todo" && (
                <TodoModule tasks={tasks} setTasks={setTasks} setDeficits={setDeficits} />
              )}

              {activeTab === "dienstplan" && (
                <DienstplanModule weeklyShifts={weeklyShifts} setWeeklyShifts={setWeeklyShifts} team={team} />
              )}

              {activeTab === "mitarbeiter" && (
                <MitarbeiterModule team={team} setTeam={setTeam} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* FOOTER STATUS BAR */}
        <footer className="py-4 px-6 lg:px-8 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-400 font-mono" id="app-footer-bar">
          <div className="flex gap-4 lg:gap-6 flex-wrap" id="footer-left-meta">
            <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span> System Online</span>
            <span>Verbindung: Local Kiosk Cache (Firebase-Ready)</span>
          </div>
          <div className="flex gap-4 lg:gap-6 flex-wrap" id="footer-right-meta">
            <span>Standort: Marktstand Luiginos (Münchner Viktualienmarkt)</span>
            <span className="font-bold text-slate-600 dark:text-zinc-400">v2.1.0-release</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
