import React, { useState } from "react";
import { Recipe } from "../types";
import { BookOpen, AlertCircle, Sparkles, Thermometer, Eye, CheckCircle2, Plus, Save, RotateCcw, Upload, Camera, Trash2, Image } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface RezepteModuleProps {
  recipes: Recipe[];
  setRecipes: React.Dispatch<React.SetStateAction<Recipe[]>>;
}

export default function RezepteModule({ recipes, setRecipes }: RezepteModuleProps) {
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>(recipes[0]?.id || "");
  const [isAddingRecipe, setIsAddingRecipe] = useState<boolean>(false);

  // Form State
  const [name, setName] = useState("");
  const [type, setType] = useState<"sandwich" | "kaeseplatte">("sandwich");
  const [ingredientsText, setIngredientsText] = useState("");
  const [stepsText, setStepsText] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [selectedColor, setSelectedColor] = useState("bg-gradient-to-br from-amber-600 to-yellow-800");
  const [imageUrl, setImageUrl] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, recipeId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Datei ist zu groß (max. 5MB erlaubt)");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      if (recipeId) {
        setRecipes((prev) =>
          prev.map((r) => (r.id === recipeId ? { ...r, imageUrl: base64Data } : r))
        );
      } else {
        setImageUrl(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent, recipeId?: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Datei ist zu groß (max. 5MB erlaubt)");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result as string;
        if (recipeId) {
          setRecipes((prev) =>
            prev.map((r) => (r.id === recipeId ? { ...r, imageUrl: base64Data } : r))
          );
        } else {
          setImageUrl(base64Data);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (recipeId?: string) => {
    if (recipeId) {
      setRecipes((prev) =>
        prev.map((r) => {
          if (r.id === recipeId) {
            const updated = { ...r };
            delete updated.imageUrl;
            return updated;
          }
          return r;
        })
      );
    } else {
      setImageUrl("");
    }
  };

  const selectedRecipe = recipes.find((r) => r.id === selectedRecipeId);

  // Fallback if none selected and not adding
  const activeRecipe = selectedRecipe || recipes[0];

  const presetColors = [
    { value: "bg-gradient-to-br from-amber-600 to-yellow-800", label: "Krustengold" },
    { value: "bg-gradient-to-br from-emerald-700 to-teal-900", label: "Kräuteroliv" },
    { value: "bg-gradient-to-br from-rose-600 to-amber-950", label: "Toskanarot" },
    { value: "bg-gradient-to-br from-amber-500 to-orange-700", label: "Käsegelb" },
    { value: "bg-gradient-to-br from-zinc-700 to-zinc-900", label: "Basaltgrau" },
  ];

  const commonAllergens = [
    { key: "A", label: "A (Gluten / Weizen)" },
    { key: "G", label: "G (Milch / Laktose)" },
    { key: "H", label: "H (Schalenfrüchte / Nüsse)" },
    { key: "L", label: "L (Sellerie)" },
    { key: "M", label: "M (Senf)" },
    { key: "N", label: "N (Sesamsamen)" },
  ];

  const toggleAllergen = (key: string) => {
    if (selectedAllergens.includes(key)) {
      setSelectedAllergens(selectedAllergens.filter((a) => a !== key));
    } else {
      setSelectedAllergens([...selectedAllergens, key]);
    }
  };

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedIngredients = ingredientsText
      .split("\n")
      .map((i) => i.trim())
      .filter((i) => i.length > 0);

    const parsedSteps = stepsText
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newRecipe: Recipe = {
      id: "recipe_" + Date.now(),
      name: name.trim(),
      type,
      ingredients: parsedIngredients.length > 0 ? parsedIngredients : ["Zutaten laut Rezept"],
      steps: parsedSteps.length > 0 ? parsedSteps : ["Zubereitungsschritte folgen"],
      allergens: selectedAllergens.length > 0 ? selectedAllergens : ["Keine"],
      imagePlaceholderColor: selectedColor,
      imageUrl: imageUrl || undefined,
    };

    setRecipes([newRecipe, ...recipes]);
    setSelectedRecipeId(newRecipe.id);
    setIsAddingRecipe(false);

    // Reset Form Fields
    setName("");
    setType("sandwich");
    setIngredientsText("");
    setStepsText("");
    setSelectedAllergens([]);
    setImageUrl("");
    setSelectedColor("bg-gradient-to-br from-amber-600 to-yellow-800");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="rezepte-container">
      {/* LEFT SIDEBAR: RECIPE SELECTION & ADD ACTION */}
      <div className="lg:col-span-4 space-y-4" id="rezepte-sidebar">
        {/* Prominent Action Button for adding a recipe */}
        <button
          id="btn-add-recipe-sidebar"
          onClick={() => {
            setIsAddingRecipe(true);
            setSelectedRecipeId("");
          }}
          className={`w-full py-3 px-4 flex items-center justify-center gap-2.5 rounded-xl font-bold text-sm tracking-wide transition-all shadow-sm cursor-pointer ${
            isAddingRecipe
              ? "bg-slate-800 text-white ring-2 ring-slate-800"
              : "bg-emerald-800 hover:bg-emerald-700 text-white"
          }`}
        >
          <Plus className="h-4.5 w-4.5" />
          Rezept hinzufügen
        </button>

        {/* Recipe list */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 shadow-xs space-y-3" id="recipe-selector-list">
          <div className="flex justify-between items-center px-1" id="recipe-list-header">
            <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider">Verzeichnis</span>
            <span className="text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full font-mono">
              {recipes.length} Rezepte
            </span>
          </div>
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto" id="recipe-buttons-wrap">
            {recipes.map((rec) => {
              const isSelected = activeRecipe?.id === rec.id && !isAddingRecipe;
              return (
                <button
                  key={rec.id}
                  id={`recipe-btn-${rec.id}`}
                  onClick={() => {
                    setSelectedRecipeId(rec.id);
                    setIsAddingRecipe(false);
                  }}
                  className={`w-full text-left p-4 rounded-xl transition-all border flex flex-col gap-1 cursor-pointer ${
                    isSelected
                      ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-800/40 text-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-800/20"
                      : "bg-transparent border-transparent text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/10"
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 w-full" id={`recipe-btn-title-box-${rec.id}`}>
                    <span className="font-sans font-bold text-base leading-tight">
                      {rec.name}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full shrink-0 font-bold ${
                      rec.type === "sandwich" 
                        ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300" 
                        : "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300"
                    }`}>
                      {rec.type === "sandwich" ? "Sandwich" : "Platte"}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-sans line-clamp-1">
                    Zutaten: {rec.ingredients.join(", ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT WORK AREA: DETAILED DISPLAY OR CREATE FORM */}
      <div className="lg:col-span-8" id="rezepte-detail-pane">
        <AnimatePresence mode="wait">
          {isAddingRecipe ? (
            <motion.div
              key="add-recipe-form"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6"
              id="recipe-form-card"
            >
              {/* Form Title */}
              <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4" id="form-header">
                <span className="text-xs uppercase font-extrabold tracking-widest font-mono text-emerald-700 dark:text-emerald-400">
                  Kiosk Systempflege
                </span>
                <h2 className="font-sans text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight mt-0.5">
                  Neues Standardrezept erfassen
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Trage hier die Kiosk-Standards ein. Nach dem Speichern ist das Rezept sofort im Verzeichnis gelistet.
                </p>
              </div>

              <form onSubmit={handleSaveRecipe} className="space-y-6" id="add-recipe-html-form">
                {/* Name & Type row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="form-row-basic">
                  <div className="md:col-span-2 space-y-1.5" id="form-group-name">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                      Rezeptname *
                    </label>
                    <input
                      required
                      type="text"
                      id="input-recipe-name"
                      placeholder="z.B. Panini Porchetta Speciale"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-800"
                    />
                  </div>

                  <div className="space-y-1.5" id="form-group-type">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                      Rezeptart
                    </label>
                    <select
                      id="select-recipe-type"
                      value={type}
                      onChange={(e) => setType(e.target.value as "sandwich" | "kaeseplatte")}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-800 font-sans cursor-pointer"
                    >
                      <option value="sandwich">Panini / Sandwich</option>
                      <option value="kaeseplatte">Käse- & Feinkostplatte</option>
                    </select>
                  </div>
                </div>

                {/* Ingredients & Steps rows */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="form-row-ingredients-steps">
                  {/* Ingredients input */}
                  <div className="space-y-1.5" id="form-group-ingredients">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono flex justify-between">
                      <span>Zutatenliste</span>
                      <span className="text-zinc-400 capitalize normal-case font-normal">Bitte eine Zutat pro Zeile</span>
                    </label>
                    <textarea
                      rows={5}
                      id="textarea-recipe-ingredients"
                      placeholder={"z.B.\nTrüffelpekorino\nSalami Milano\nSchnittlauch\nSauerteig-Panini"}
                      value={ingredientsText}
                      onChange={(e) => setIngredientsText(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-sans focus:outline-none focus:border-emerald-800"
                    />
                  </div>

                  {/* Steps list input */}
                  <div className="space-y-1.5" id="form-group-steps">
                    <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono flex justify-between">
                      <span>Zubereitung & Anrichten</span>
                      <span className="text-zinc-400 capitalize normal-case font-normal">Bitte ein Schritt pro Zeile</span>
                    </label>
                    <textarea
                      rows={5}
                      id="textarea-recipe-steps"
                      placeholder={"z.B.\nPanini mittig aufschneiden und mit Olivenöl beträufeln\nZutaten gleichmäßig schichten (nicht quetschen)\nAuf dem Grill für 4 Minuten knusprig backen"}
                      value={stepsText}
                      onChange={(e) => setStepsText(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm font-sans focus:outline-none focus:border-emerald-800"
                    />
                  </div>
                </div>

                {/* Allergens tickbox list */}
                <div className="space-y-2" id="form-group-allergens">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                    HACCP Allergenkennzeichnung
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" id="allergens-grid-wrapper">
                    {commonAllergens.map((all) => {
                      const isChecked = selectedAllergens.includes(all.key);
                      return (
                        <button
                          key={all.key}
                          type="button"
                          id={`allergen-toggle-${all.key}`}
                          onClick={() => toggleAllergen(all.key)}
                          className={`py-2 px-3 rounded-xl border text-xs font-medium text-left flex items-center gap-2 transition-all cursor-pointer ${
                            isChecked
                              ? "bg-amber-50 dark:bg-amber-950/20 border-amber-800/40 text-amber-900 dark:text-amber-300 font-bold"
                              : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400"
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-all ${
                            isChecked ? "bg-amber-600 border-amber-600 text-white" : "border-zinc-300 bg-white"
                          }`}>
                            {isChecked && (
                              <svg className="h-2.5 w-2.5 fill-current" viewBox="0 0 20 20">
                                <path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/>
                              </svg>
                            )}
                          </div>
                          <span>{all.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Styling Illustrative Preset Themes */}
                <div className="space-y-2" id="form-group-styling-presets">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                    Optisches Farbschema der Karte
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" id="presets-color-grid">
                    {presetColors.map((color) => {
                      const isSelected = selectedColor === color.value;
                      return (
                        <button
                          key={color.value}
                          type="button"
                          id={`preset-color-btn-${color.label}`}
                          onClick={() => setSelectedColor(color.value)}
                          className={`p-3 rounded-xl border text-xs flex items-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? "border-emerald-800 ring-2 ring-emerald-800 dark:ring-emerald-400 text-zinc-900 dark:text-white font-bold"
                              : "border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/10"
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full ${color.value} block shrink-0 border border-white/25 shadow-xs`} />
                          <span className="truncate">{color.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Rezeptbild hochladen */}
                <div className="space-y-2" id="form-group-image-upload">
                  <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-mono">
                    Rezept-Foto hochladen (optional)
                  </span>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={(e) => handleDrop(e)}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all relative ${
                      dragActive
                        ? "border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-950/20"
                    }`}
                  >
                    <input
                      type="file"
                      id="recipe-form-image-input"
                      accept="image/*"
                      onChange={(e) => handleImageFileChange(e)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    
                    {imageUrl ? (
                      <div className="space-y-4 flex flex-col items-center justify-center relative z-20">
                        <div className="w-full max-w-xs h-36 rounded-xl overflow-hidden relative shadow-sm border border-zinc-200 dark:border-zinc-800">
                          <img
                            src={imageUrl}
                            alt="Rezept Vorschau"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => removeImage()}
                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Foto entfernen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 py-4 flex flex-col items-center justify-center">
                        <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-800">
                          <Camera className="h-5 w-5" />
                        </div>
                        <div className="text-xs text-zinc-650 dark:text-zinc-300">
                          <span className="font-bold text-emerald-830 dark:text-emerald-400 hover:underline">Datei auswählen</span> oder hierher ziehen (Drag & Drop)
                        </div>
                        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">
                          PNG, JPG oder WEBP bis zu 5 MB
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Actions bar */}
                <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800" id="form-actions-row">
                  <button
                    type="button"
                    id="btn-recipe-form-cancel"
                    onClick={() => {
                      setIsAddingRecipe(false);
                      if (recipes.length > 0) {
                        setSelectedRecipeId(recipes[0].id);
                      }
                    }}
                    className="px-5 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold rounded-xl text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Abbrechen
                  </button>

                  <button
                    type="submit"
                    id="btn-recipe-form-save"
                    className="px-6 py-3 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    Rezept speichern
                  </button>
                </div>
              </form>
            </motion.div>
          ) : activeRecipe ? (
            <motion.div
              key={activeRecipe.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -25 }}
              transition={{ duration: 0.15 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6"
              id={`recipe-detail-${activeRecipe.id}`}
            >
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-5" id="detail-header-row">
                <div className="space-y-1" id="detail-title-block">
                  <div className="flex items-center gap-2" id="detail-badge-block">
                    <span className="text-xs uppercase font-extrabold tracking-wider font-mono text-emerald-700 dark:text-emerald-400">
                      {activeRecipe.type === "sandwich" ? "Original Panini Rezept" : "Feinkost Servier-Standard"}
                    </span>
                  </div>
                  <h2 className="font-sans text-2xl lg:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
                    {activeRecipe.name}
                  </h2>
                </div>

                {/* Recipe Image preview slot supporting live upload */}
                <div id="recipe-pic-section" className="relative w-full sm:w-60 h-32 rounded-xl overflow-hidden border border-zinc-100 dark:border-zinc-800 text-white shrink-0 group shadow-xs">
                  {activeRecipe.imageUrl ? (
                    <>
                      <img
                        src={activeRecipe.imageUrl}
                        alt={activeRecipe.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 z-20">
                        <label className="cursor-pointer bg-white text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-100 flex items-center gap-1 shadow-md">
                          <Camera className="h-3.5 w-3.5" />
                          Bild ändern
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileChange(e, activeRecipe.id)}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => removeImage(activeRecipe.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 shadow-md cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Löschen
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className="absolute inset-0 flex flex-col items-center justify-center p-4 cursor-pointer text-center group-hover:brightness-95 transition-all">
                      <div className={`absolute inset-0 ${activeRecipe.imagePlaceholderColor || "bg-gradient-to-br from-amber-600 to-yellow-800"} opacity-90`}></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>
                      <div className="relative z-10 flex flex-col items-center gap-1.5 text-white">
                        <Camera className="h-5 w-5 text-white/90 group-hover:scale-110 transition-transform" />
                        <span className="font-sans font-black text-[10px] tracking-wider">FOTO HINZUFÜGEN</span>
                        <span className="text-[8px] text-white/70 font-mono">Klicken für Upload</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileChange(e, activeRecipe.id)}
                      />
                    </label>
                  )}
                </div>
              </div>
 
              {/* Recipe Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="recipe-content-grid">
                {/* Ingredients Card */}
                <div className="space-y-3" id="recipe-ingredients-card">
                  <h4 className="font-sans font-bold text-sm text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-emerald-700" />
                    Zutatenliste
                  </h4>
                  <ul className="space-y-2 bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800" id="ingredients-unordered-list">
                    {activeRecipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex items-start gap-2.5 font-sans text-sm text-zinc-700 dark:text-zinc-300" id={`ingredient-li-${i}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-700 mt-2 shrink-0"></span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
 
                  {/* Allergens block */}
                  <div className="bg-zinc-50 dark:bg-zinc-950 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 space-y-1.5" id="allergens-box">
                    <h5 className="font-sans text-xs font-bold text-zinc-400 uppercase font-mono flex items-center gap-1.5">
                      <AlertCircle className="h-3.5 w-3.5 text-zinc-400" />
                      Allergenhinweise (HACCP)
                    </h5>
                    <div className="flex flex-wrap gap-1.5" id="allergens-chips">
                      {activeRecipe.allergens.map((all) => (
                        <span key={all} className="text-xs font-mono bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2.5 py-0.5 rounded font-bold">
                          {all}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
 
                {/* Steps Card */}
                <div className="space-y-3" id="recipe-steps-card">
                  <h4 className="font-sans font-bold text-sm text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                    Zubereitungsschritte
                  </h4>
                  <ol className="space-y-3" id="steps-ordered-list">
                    {activeRecipe.steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-sm text-zinc-700 dark:text-zinc-300" id={`step-li-${i}`}>
                        <span className="font-mono text-zinc-400 dark:text-zinc-500 font-bold shrink-0 mt-0.5">
                          {String(i + 1).padStart(2, "0")}.
                        </span>
                        <span className="font-sans leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800" id="no-recipe-active">
              <p className="text-zinc-400 font-sans">Bitte wähle links ein Rezept aus der Liste aus oder trage ein neues Rezept ein.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
