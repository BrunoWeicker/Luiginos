import React, { useState } from "react";
import { TaskItem, DeficitItem } from "../types";
import { CheckSquare, Square, Plus, Trash2, Calendar, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TodoModuleProps {
  tasks: TaskItem[];
  setTasks: React.Dispatch<React.SetStateAction<TaskItem[]>>;
  setDeficits?: React.Dispatch<React.SetStateAction<DeficitItem[]>>;
}

export default function TodoModule({ tasks, setTasks, setDeficits }: TodoModuleProps) {
  const [filterShift, setFilterShift] = useState<"all" | "frueh" | "spaet" | "allgemein" | "produktion">("all");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskShift, setNewTaskShift] = useState<"frueh" | "spaet" | "allgemein">("allgemein");
  const [newTaskPriority, setNewTaskPriority] = useState<"hoch" | "mittel" | "niedrig">("mittel");

  const toggleTaskCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newCompleted = !item.completed;
          if (id.startsWith("task-prod-")) {
            const deficitId = id.replace("task-prod-", "");
            setDeficits?.((defPrev) =>
              defPrev.map((deficit) =>
                deficit.id === deficitId
                  ? { ...deficit, status: newCompleted ? "bereit" : "fehlt" }
                  : deficit
              )
            );
          }
          return { ...item, completed: newCompleted };
        }
        return item;
      })
    );
  };

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: "task-" + Date.now(),
      title: newTaskTitle,
      shift: newTaskShift,
      priority: newTaskPriority,
      completed: false
    };

    setTasks((prev) => [newTask, ...prev]);
    setNewTaskTitle("");
  };

  const deleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks((prev) => prev.filter((item) => item.id !== id));
    if (id.startsWith("task-prod-")) {
      const deficitId = id.replace("task-prod-", "");
      setDeficits?.((defPrev) => defPrev.filter((deficit) => deficit.id !== deficitId));
    }
  };

  const filteredTasks = tasks.filter((x) => {
    if (filterShift === "all") return true;
    if (filterShift === "produktion") {
      return x.tags?.includes("produktion") || x.title.toLowerCase().includes("produktion");
    }
    return x.shift === filterShift;
  });

  const completedCount = filteredTasks.filter((x) => x.completed).length;
  const progressPercent = filteredTasks.length ? Math.round((completedCount / filteredTasks.length) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="todo-container">
      {/* LEFT FORM COLUMN: ADD TASK */}
      <div className="lg:col-span-4 space-y-4" id="todo-sidebar-form">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm space-y-4" id="add-task-card">
          <h3 className="font-sans font-bold text-base text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-emerald-800" />
            Tagesaufgabe anlegen
          </h3>
          <p className="font-sans text-xs text-zinc-400">
            Ergänze hier spontane Sonderaufgaben, die bei der Schichtübergabe abgearbeitet werden müssen.
          </p>

          <div className="space-y-3 pt-1" id="add-task-form">
            <div id="add-task-title-field">
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Aufgabentext</label>
              <input
                id="task-input-title"
                type="text"
                placeholder="z.B. Vitrine außen nachwischen"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3" id="add-task-meta-fields">
              <div id="add-task-shift-field">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Zuweisung Schicht</label>
                <select
                  id="task-select-shift"
                  value={newTaskShift}
                  onChange={(e) => setNewTaskShift(e.target.value as any)}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none text-xs font-sans"
                >
                  <option value="allgemein">Allgemein</option>
                  <option value="frueh">Frühdienst 🌅</option>
                  <option value="spaet">Spätdienst 🌌</option>
                </select>
              </div>

              <div id="add-task-priority-field">
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-400 mb-1">Priorität</label>
                <select
                  id="task-select-priority"
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full px-4 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-800 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-700 text-xs font-sans"
                >
                  <option value="hoch">Hoch 🚨</option>
                  <option value="mittel">Mittel 🟡</option>
                  <option value="niedrig">Niedrig 🟢</option>
                </select>
              </div>
            </div>

            <button
              id="submit-task-btn"
              onClick={handleAddTask}
              className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-sans font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-1.5"
            >
              <Plus className="h-5 w-5" /> Hinzufügen
            </button>
          </div>
        </div>

        {/* Status completion box */}
        <div className="bg-emerald-800 text-white p-5 rounded-2xl shadow-sm space-y-3" id="todo-stats-card">
          <div className="flex justify-between items-start" id="todo-stats-head">
            <h4 className="font-sans font-bold text-base">Schicht-Umsatz</h4>
            <Calendar className="h-5 w-5 text-emerald-300" />
          </div>
          <div className="space-y-1" id="todo-stats-progress">
            <div className="flex justify-between text-xs font-mono text-emerald-200" id="todo-stats-progress-label">
              <span>Fortschritt Schichtliste</span>
              <span>{completedCount}/{filteredTasks.length} erledigt</span>
            </div>
            <div className="w-full h-2 bg-black/25 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <p className="font-sans text-[11px] text-emerald-200 leading-relaxed">
            Ein sauberes To-Do Portal beugt Konflikten vor und sorgt für lückenloses Qualitätsniveau am Viktualienmarkt.
          </p>
        </div>
      </div>

      {/* RIGHT COLUMN: TASK DIRECTORY */}
      <div className="lg:col-span-8 flex flex-col gap-4" id="todo-tasks-pane">
        {/* Switch tab buttons */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-2.5 rounded-2xl flex flex-wrap gap-1.5 shadow-sm" id="todo-shift-filters">
          {[
            { value: "all", label: "Alle To-Dos" },
            { value: "frueh", label: "Frühschicht 🌅" },
            { value: "spaet", label: "Spätschicht 🌌" },
            { value: "allgemein", label: "Allgemein 📋" },
            { value: "produktion", label: "Produktion 🍳" }
          ].map((tab) => (
            <button
              key={tab.value}
              id={`filter-todo-${tab.value}`}
              onClick={() => setFilterShift(tab.value as any)}
              className={`px-4 py-2 text-xs font-medium font-sans rounded-xl transition-all ${
                filterShift === tab.value
                  ? "bg-emerald-800 text-white shadow-sm"
                  : "bg-zinc-50 hover:bg-zinc-100 text-zinc-600 dark:bg-zinc-950 dark:hover:bg-zinc-900 dark:text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Task lists grouped by status/priority */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex-1 min-h-[400px]" id="todo-items-list-card">
          <div className="flex justify-between items-center text-sm border-b border-zinc-100 dark:border-zinc-800 pb-4 mb-4" id="todo-list-header">
            <h4 className="font-sans font-bold text-zinc-900 dark:text-zinc-100">
              Aktive Tagesübersicht: {filterShift === "all" ? "Alle" : filterShift === "frueh" ? "Frühdienst" : filterShift === "spaet" ? "Spätdienst" : filterShift === "produktion" ? "Produktions-Anweisungen" : "Allgemein"}
            </h4>
            <span className="font-mono text-zinc-400 text-xs">{filteredTasks.length} Aufgaben gelistet</span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800" id="todo-rows-list">
            <AnimatePresence mode="popLayout">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((item) => (
                  <motion.div
                    key={item.id}
                    id={`todo-row-${item.id}`}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => toggleTaskCompleted(item.id)}
                    className="py-4 flex gap-4 items-center justify-between cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-850/20 px-2 rounded-xl transition-colors group"
                  >
                    <div className="flex items-start gap-3.5" id={`todo-row-main-${item.id}`}>
                      <div className="pt-0.5 shrink-0" id={`todo-checkbox-${item.id}`}>
                        {item.completed ? (
                          <CheckSquare className="h-5 w-5 text-emerald-800 dark:text-emerald-400" />
                        ) : (
                          <Square className="h-5 w-5 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400" />
                        )}
                      </div>
                      <div className="space-y-0.5 block" id={`todo-text-block-${item.id}`}>
                        <span className={`font-sans font-semibold text-base transition-all ${
                          item.completed ? "text-zinc-400 line-through" : "text-zinc-800 dark:text-zinc-100"
                        }`}>
                          {item.title}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono" id={`todo-chips-${item.id}`}>
                          <span className="uppercase text-[10px] tracking-wider font-semibold">
                            Shift: {item.shift === "frueh" ? "Früh" : item.shift === "spaet" ? "Spät" : "Allg"}
                          </span>
                          <span>•</span>
                          {(item.tags?.includes("produktion") || item.id.startsWith("task-prod-")) && (
                            <>
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-semibold shadow-xs">
                                PRODUKTION 🍳
                              </span>
                              <span>•</span>
                            </>
                          )}
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                            item.priority === "hoch"
                              ? "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400"
                              : item.priority === "mittel"
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-950/20"
                              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30"
                          }`}>
                            {item.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      id={`delete-todo-btn-${item.id}`}
                      onClick={(e) => deleteTask(item.id, e)}
                      className="p-2 text-zinc-300 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-16 text-zinc-400 font-sans" id="todo-empty-state">
                  Keine To-Dos in dieser Kategorie gefunden. <br /> Nutze das Formular links, um Aufgaben zu registrieren.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
