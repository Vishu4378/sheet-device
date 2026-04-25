"use client";

import { useState } from "react";
import { FormData, Field } from "@/app/builder/page";

interface Props {
  formData: FormData;
  update: (partial: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const FIELD_TYPES: {
  value: Field["type"];
  label: string;
  icon: string;
  bg: string;
  text: string;
}[] = [
  { value: "text",     label: "Short Text", icon: "Aa", bg: "bg-sky-50",     text: "text-sky-700"     },
  { value: "email",    label: "Email",      icon: "@",  bg: "bg-violet-50",  text: "text-violet-700"  },
  { value: "phone",    label: "Phone",      icon: "☎",  bg: "bg-emerald-50", text: "text-emerald-700" },
  { value: "dropdown", label: "Dropdown",   icon: "▾",  bg: "bg-orange-50",  text: "text-orange-700"  },
  { value: "checkbox", label: "Checkbox",   icon: "✓",  bg: "bg-teal-50",    text: "text-teal-700"    },
  { value: "date",     label: "Date",       icon: "▦",  bg: "bg-rose-50",    text: "text-rose-700"    },
  { value: "section",  label: "Section",    icon: "—",  bg: "bg-gray-100",   text: "text-gray-500"    },
];

const defaultField = (): Field => ({
  label: "",
  type: "text",
  required: false,
  options: [],
  sheetColumn: "",
  placeholder: "",
  helpText: "",
  width: "full",
});

export default function StepAddFields({ formData, update, onNext, onBack }: Props) {
  const [modalOpen, setModalOpen]     = useState(false);
  const [editingIdx, setEditingIdx]   = useState<number | null>(null);
  const [draft, setDraft]             = useState<Field | null>(null);
  const [optionInput, setOptionInput] = useState("");

  const [dragIndex,     setDragIndex]     = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const fields = formData.fields;

  const openAdd = () => {
    setDraft(defaultField());
    setEditingIdx(null);
    setModalOpen(true);
  };

  const openEdit = (i: number) => {
    setDraft({ ...fields[i] });
    setEditingIdx(i);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setDraft(null);
    setEditingIdx(null);
    setOptionInput("");
  };

  const saveField = () => {
    if (!draft || !draft.label) return;
    if (draft.type !== "section" && !draft.sheetColumn) return;
    const updated = [...fields];
    if (editingIdx === null) {
      updated.push(draft);
    } else {
      updated[editingIdx] = draft;
    }
    update({ fields: updated });
    closeModal();
  };

  const removeField = (i: number) => {
    update({ fields: fields.filter((_, idx) => idx !== i) });
  };

  const addOption = () => {
    if (!optionInput.trim() || !draft) return;
    setDraft({ ...draft, options: [...(draft.options || []), optionInput.trim()] });
    setOptionInput("");
  };

  const removeOption = (i: number) => {
    if (!draft) return;
    setDraft({ ...draft, options: draft.options.filter((_, idx) => idx !== i) });
  };

  const handleDragStart = (i: number) => setDragIndex(i);

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOverIndex(i);
  };

  const handleDrop = (i: number) => {
    if (dragIndex === null || dragIndex === i) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const reordered = [...fields];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(i, 0, moved);
    update({ fields: reordered });
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const getTypeInfo = (type: Field["type"]) =>
    FIELD_TYPES.find((t) => t.value === type) ?? FIELD_TYPES[0];

  const columnCounts = fields.reduce<Record<string, number>>((acc, f) => {
    if (f.sheetColumn) acc[f.sheetColumn] = (acc[f.sheetColumn] ?? 0) + 1;
    return acc;
  }, {});
  const hasDuplicates = Object.values(columnCounts).some((c) => c > 1);

  const isSection = draft?.type === "section";

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Add Fields</h2>
        <p className="text-gray-500 text-sm">
          Build your fields, map them to sheet columns, and drag to reorder.
        </p>
      </div>

      {hasDuplicates && (
        <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 mb-4">
          <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 1.5L13.5 13H1.5L7.5 1.5Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1.2" />
            <path d="M7.5 6V9M7.5 11V11.5" stroke="#d97706" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Two or more fields map to the same sheet column — submissions may overwrite each other.
        </div>
      )}

      {/* Field list */}
      <div className="space-y-2 mb-4">
        {fields.length === 0 && (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-3xl mb-2 opacity-30">⊞</div>
            <p className="text-sm font-medium text-gray-500">No fields yet</p>
            <p className="text-xs mt-1 text-gray-400">Add your first field below</p>
          </div>
        )}

        {fields.map((f, i) => {
          const typeInfo  = getTypeInfo(f.type);
          const isDragging  = dragIndex === i;
          const isDragOver  = dragOverIndex === i && dragIndex !== i;

          if (f.type === "section") {
            return (
              <div
                key={i}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={(e) => handleDragOver(e, i)}
                onDrop={() => handleDrop(i)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 border-dashed transition-all ${
                  isDragOver
                    ? "border-violet-400 bg-violet-50"
                    : isDragging
                    ? "opacity-40"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300 cursor-grab active:cursor-grabbing"
                }`}
              >
                <span className="text-gray-300 flex-shrink-0">
                  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                    <circle cx="3" cy="2"  r="1.4" /><circle cx="7" cy="2"  r="1.4" />
                    <circle cx="3" cy="7"  r="1.4" /><circle cx="7" cy="7"  r="1.4" />
                    <circle cx="3" cy="12" r="1.4" /><circle cx="7" cy="12" r="1.4" />
                  </svg>
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-600 truncate">{f.label || "Section Heading"}</p>
                  {f.placeholder && (
                    <p className="text-xs text-gray-400 truncate">{f.placeholder}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full flex-shrink-0">
                  section
                </span>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button onClick={() => openEdit(i)} className="w-8 h-8 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors flex items-center justify-center">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 1.5L11 4L4.5 10.5H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                  </button>
                  <button onClick={() => removeField(i)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex items-center justify-center">
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3H11.5M4.5 3V2C4.5 1.5 5 1 6.5 1C8 1 8.5 1.5 8.5 2V3M5 11.5L4.5 5M8 11.5L8.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={i}
              draggable
              onDragStart={() => handleDragStart(i)}
              onDragOver={(e) => handleDragOver(e, i)}
              onDrop={() => handleDrop(i)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border transition-all ${
                isDragOver
                  ? "border-violet-400 bg-violet-50 scale-[1.01] shadow-sm"
                  : isDragging
                  ? "opacity-40 border-dashed border-gray-300"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-grab active:cursor-grabbing"
              }`}
            >
              <span className="text-gray-300 flex-shrink-0">
                <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
                  <circle cx="3" cy="2"  r="1.4" /><circle cx="7" cy="2"  r="1.4" />
                  <circle cx="3" cy="7"  r="1.4" /><circle cx="7" cy="7"  r="1.4" />
                  <circle cx="3" cy="12" r="1.4" /><circle cx="7" cy="12" r="1.4" />
                </svg>
              </span>

              <span className={`w-7 h-7 flex-shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${typeInfo.bg} ${typeInfo.text}`}>
                {typeInfo.icon}
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 truncate">{f.label}</span>
                  {f.required && (
                    <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-1.5 py-0.5 rounded-md leading-none flex-shrink-0">required</span>
                  )}
                  {f.width === "half" && (
                    <span className="text-xs bg-sky-50 text-sky-600 border border-sky-100 px-1.5 py-0.5 rounded-md leading-none flex-shrink-0">½</span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-xs text-gray-400">{typeInfo.label}</span>
                  {f.sheetColumn && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium leading-none ${
                        (columnCounts[f.sheetColumn] ?? 0) > 1
                          ? "bg-amber-50 text-amber-600"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {f.sheetColumn}
                      </span>
                    </>
                  )}
                  {f.helpText && (
                    <>
                      <span className="text-gray-200">·</span>
                      <span className="text-xs text-gray-400 truncate max-w-[120px]">{f.helpText}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={() => openEdit(i)} className="w-8 h-8 rounded-lg hover:bg-violet-50 text-gray-400 hover:text-violet-600 transition-colors flex items-center justify-center" title="Edit">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M8.5 1.5L11 4L4.5 10.5H2V8L8.5 1.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
                </button>
                <button onClick={() => removeField(i)} className="w-8 h-8 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors flex items-center justify-center" title="Remove">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 3H11.5M4.5 3V2C4.5 1.5 5 1 6.5 1C8 1 8.5 1.5 8.5 2V3M5 11.5L4.5 5M8 11.5L8.5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={openAdd}
        className="w-full border-2 border-dashed border-gray-200 hover:border-violet-300 hover:bg-violet-50/40 text-gray-400 hover:text-violet-600 text-sm font-medium py-3.5 rounded-xl transition-all mb-4 flex items-center justify-center gap-2"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Add Field
      </button>

      <div className="flex justify-between pt-4 border-t border-gray-100">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-900 text-sm font-medium px-4 py-2.5 flex items-center gap-1.5 transition-colors">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={fields.filter((f) => f.type !== "section").length === 0}
          className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
        >
          Next: Customize
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 7H11M8 4L11 7L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>

      {/* ── Field editor modal ── */}
      {modalOpen && draft !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-900">
                {editingIdx === null ? "New Field" : "Edit Field"}
              </h3>
              <button onClick={closeModal} className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-400 flex items-center justify-center transition-colors">
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 1.5L11.5 11.5M11.5 1.5L1.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-5 max-h-[68vh] overflow-y-auto">
              {/* Field type grid */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2.5">Field Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {FIELD_TYPES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setDraft({ ...draft, type: t.value, options: t.value !== "dropdown" ? [] : draft.options, sheetColumn: t.value === "section" ? "" : draft.sheetColumn })}
                      className={`flex flex-col items-center gap-1.5 py-2.5 px-1 rounded-xl border-2 text-center transition-all ${
                        draft.type === t.value
                          ? "border-violet-500 bg-violet-50"
                          : "border-gray-100 hover:border-gray-200 bg-gray-50"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${t.bg} ${t.text}`}>{t.icon}</span>
                      <span className={`text-[10px] font-medium leading-tight ${draft.type === t.value ? "text-violet-700" : "text-gray-600"}`}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Label */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                  {isSection ? "Heading" : "Label"} <span className="text-red-400 normal-case font-normal">*</span>
                </label>
                <input
                  autoFocus
                  value={draft.label}
                  onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && saveField()}
                  placeholder={isSection ? "e.g. Personal Information" : "e.g. Full Name"}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                />
              </div>

              {/* Section subtitle OR regular fields */}
              {isSection ? (
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Subtitle <span className="text-gray-400 normal-case font-normal">optional</span>
                  </label>
                  <input
                    value={draft.placeholder}
                    onChange={(e) => setDraft({ ...draft, placeholder: e.target.value })}
                    placeholder="Short description for this section"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                  />
                </div>
              ) : (
                <>
                  {/* Sheet column */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Sheet Column <span className="text-red-400 normal-case font-normal">*</span>
                    </label>
                    {formData.headers.length > 0 ? (
                      <select
                        value={draft.sheetColumn}
                        onChange={(e) => setDraft({ ...draft, sheetColumn: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400 bg-white"
                      >
                        <option value="">— select column —</option>
                        {formData.headers.map((h) => <option key={h} value={h}>{h}</option>)}
                      </select>
                    ) : (
                      <input
                        value={draft.sheetColumn}
                        onChange={(e) => setDraft({ ...draft, sheetColumn: e.target.value })}
                        placeholder="e.g. A or Name"
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                      />
                    )}
                  </div>

                  {/* Placeholder */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Placeholder <span className="text-gray-400 normal-case font-normal">optional</span>
                    </label>
                    <input
                      value={draft.placeholder}
                      onChange={(e) => setDraft({ ...draft, placeholder: e.target.value })}
                      placeholder="Hint text inside the input"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                    />
                  </div>

                  {/* Help text */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Help Text <span className="text-gray-400 normal-case font-normal">optional</span>
                    </label>
                    <input
                      value={draft.helpText}
                      onChange={(e) => setDraft({ ...draft, helpText: e.target.value })}
                      placeholder="Short description shown below the label"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                    />
                  </div>

                  {/* Field width */}
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                      Field Width
                    </label>
                    <div className="flex gap-2">
                      {(["full", "half"] as const).map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setDraft({ ...draft, width: w })}
                          className={`flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-xl border-2 transition-all ${
                            draft.width === w
                              ? "border-violet-500 bg-violet-50"
                              : "border-gray-100 bg-gray-50 hover:border-gray-200"
                          }`}
                        >
                          <div className={`flex gap-0.5 ${w === "half" ? "w-8" : "w-10"}`}>
                            {w === "full" ? (
                              <div className="h-3 bg-gray-300 rounded flex-1" />
                            ) : (
                              <>
                                <div className="h-3 bg-violet-300 rounded flex-1" />
                                <div className="h-3 bg-gray-200 rounded flex-1" />
                              </>
                            )}
                          </div>
                          <span className={`text-xs font-medium ${draft.width === w ? "text-violet-700" : "text-gray-600"}`}>
                            {w === "full" ? "Full" : "Half"}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dropdown options */}
                  {draft.type === "dropdown" && (
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">Options</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          value={optionInput}
                          onChange={(e) => setOptionInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && addOption()}
                          placeholder="Add option, press Enter"
                          className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-400"
                        />
                        <button onClick={addOption} className="bg-violet-600 hover:bg-violet-700 text-white text-sm px-4 rounded-xl font-medium transition-colors">Add</button>
                      </div>
                      {draft.options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {draft.options.map((o, i) => (
                            <span key={i} className="inline-flex items-center gap-1 bg-violet-50 border border-violet-100 text-violet-700 text-xs px-2.5 py-1 rounded-lg">
                              {o}
                              <button onClick={() => removeOption(i)} className="text-violet-400 hover:text-red-500 ml-0.5 transition-colors leading-none">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Required toggle */}
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={draft.required}
                      onClick={() => setDraft({ ...draft, required: !draft.required })}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors ${draft.required ? "bg-violet-600" : "bg-gray-200"}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${draft.required ? "translate-x-6" : "translate-x-1"}`} />
                    </button>
                    <span className="text-sm text-gray-700 font-medium">Required field</span>
                  </label>
                </>
              )}
            </div>

            <div className="flex gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50/80">
              <button onClick={closeModal} className="flex-1 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 text-sm font-medium py-2.5 rounded-xl transition-colors">Cancel</button>
              <button
                onClick={saveField}
                disabled={!draft.label || (!isSection && !draft.sheetColumn)}
                className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-200 disabled:text-gray-400 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                {editingIdx === null ? "Add Field" : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
