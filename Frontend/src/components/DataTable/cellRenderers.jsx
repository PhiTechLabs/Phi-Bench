import React, { useState, useEffect, useRef } from "react";
import { getAvatarProps } from "../../utils/avatar";
import PermissionGuard from "../PermissionGuard";
import { PERMISSIONS } from "../../pages/settings/constants/permissions";

/**
 * ────────────────────────────────────────────────────────────
 *  CELL RENDERERS — Enhanced with avatar support
 * ────────────────────────────────────────────────────────────
 */

const Empty = () => <span className="text-[#C8C5BD]">—</span>;

export const renderCell = ({ column, row, rowIndex, pageStart = 0, ctx = {} }) => {
  if (typeof column.render === "function") {
    return column.render(row, { rowIndex, pageStart, ctx });
  }

  const value = row[column.key];

  switch (column.type) {
    case "sno":
      return <SerialNumber index={pageStart + rowIndex + 1} />;
    case "text":
    default:
      // AVATAR SUPPORT: if column.avatar === true, render with avatar circle
      if (column.avatar && value) {
        return <TextCellWithAvatar value={value} bold={column.bold} link={column.link} />;
      }
      return (
  <TextCell
    value={value}
    bold={column.bold}
    link={column.link}
    inlineEdit={column.inlineEdit}
    onEdit={column.onCellEdit}
    row={row}
    colKey={column.key}
  />
);
    case "chips":
      return <ChipsCell value={value} max={column.maxChips || 2} inlineEdit={column.inlineEdit} onEdit={column.onCellEdit} row={row} colKey={column.key} />;
    case "money":
      return <MoneyCell value={value} currency={column.currency || "₹"} inlineEdit={column.inlineEdit} onEdit={column.onCellEdit} row={row} colKey={column.key} />;
    case "date":
      return <DateCell value={value} format={column.dateFormat} />;
    case "experience":
      return <ExperienceCell row={row} valueKey={column.key} />;
    case "toggle":
    return (
      <PermissionGuard
          module="candidate"
          action="edit"
      >
        <ToggleCell
          on={!!value}
          onToggle={() => column.onToggle?.(row.id)}
        />
      </PermissionGuard>
    );
    case "status":
      return (
        <PermissionGuard
          module="candidate"
          action="edit"
        >
          <StatusCell
            value={value}
            options={column.statusOptions || []}
            onChange={(s) => column.onStatusChange?.(row.id, s)}
          />
        </PermissionGuard>
      );
    case "location":
      return <LocationCell row={row} cityKey={column.cityKey || "city"} stateKey={column.stateKey || "state"} />;
  }
};

/* ──────────────────── TEXT ──────────────────── */
const TextCell = ({ value, bold, link, inlineEdit, onEdit, row, colKey }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const showInlineEdit = inlineEdit && !value;

  const handleClick = (e) => {
    if (showInlineEdit) {
      e.stopPropagation();
      setDraft(value || "");
      setEditing(true);
    }
  };

  const handleSave = async () => {
    if (onEdit) await onEdit(row.id, colKey, draft);
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setDraft("");
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") handleCancel();
          }}
          className="min-w-0 flex-1 rounded border border-[#1C4ED8] px-2 py-0.5 text-[12px] outline-none"
        />
      </div>
    );
  }

  if (showInlineEdit) {
    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-1 text-[11.5px] text-[#9B9890] hover:text-[#1C4ED8]"
      >
        <span className="text-[14px] leading-none">+</span> Click to add
      </button>
    );
  }

  if (!value) return <Empty />;

  return (
    <span className={`block truncate ${bold ? "font-medium text-[#1C1B18]" : ""} ${link ? "group-hover:text-[#1C4ED8]" : ""}`}>
      {String(value)}
    </span>
  );
};

/* ──────────────────── TEXT WITH AVATAR ──────────────────── */
const TextCellWithAvatar = ({ value, bold, link }) => {
  if (!value) return <Empty />;
  
  const { initials, bgColor, textColor } = getAvatarProps(value);
  
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10.5px] font-semibold"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        {initials}
      </div>
      <span className={`block min-w-0 truncate ${bold ? "font-medium text-[#1C1B18]" : ""} ${link ? "group-hover:text-[#1C4ED8]" : ""}`}>
        {String(value)}
      </span>
    </div>
  );
};

/* ──────────────────── SERIAL NUMBER ──────────────────── */
const SerialNumber = ({ index }) => (
  <span className="text-[11.5px] font-medium text-[#6B6860]">{String(index).padStart(2, "0")}</span>
);

/* ──────────────────── CHIPS ──────────────────── */
const ChipsCell = ({ value, max }) => {
  if (!value) return <Empty />;
  const all = String(value).split(",").map((s) => s.trim()).filter(Boolean);
  return (
    <div className="flex flex-nowrap items-center gap-1 overflow-hidden">
      {all.slice(0, max).map((t, i) => (
        <span key={i} className="shrink-0 rounded border border-[#E0DDD6] bg-[#FAFAF8] px-1.5 py-0.5 text-[10.5px] font-medium text-[#4A4845]">
          {t}
        </span>
      ))}
      {all.length > max && <span className="shrink-0 text-[10.5px] text-[#9B9890]">+{all.length - max}</span>}
    </div>
  );
};

/* ──────────────────── MONEY ──────────────────── */
const MoneyCell = ({ value, currency }) => {
  if (!value) return <Empty />;
  const num = Number(value);
  if (Number.isNaN(num)) return <span>{String(value)}</span>;
  return <span className="text-[12px]">{currency}{num.toLocaleString("en-IN")}</span>;
};

/* ──────────────────── DATE ──────────────────── */
const DateCell = ({ value, format }) => {
  if (!value) return <Empty />;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return <span>{String(value)}</span>;
  const opts = format || { day: "2-digit", month: "short", year: "2-digit" };
  return <span className="text-[11.5px]">{d.toLocaleDateString("en-IN", opts)}</span>;
};

/* ──────────────────── EXPERIENCE ──────────────────── */
const ExperienceCell = ({ row, valueKey }) => {
  const v = row[valueKey];
  const years = row.experienceYears;
  if (!v && !years) return <Empty />;
  return <span className="text-[11.5px]">{years ? `${years}y` : v}</span>;
};

/* ──────────────────── LOCATION ──────────────────── */
const LocationCell = ({ row, cityKey, stateKey }) => {
  const parts = [row[cityKey], row[stateKey]].filter(Boolean).join(", ");
  return parts ? <span className="block truncate text-[11.5px]">{parts}</span> : <Empty />;
};

/* ──────────────────── TOGGLE ──────────────────── */
const ToggleCell = ({ on, onToggle }) => (
  <button
    type="button"
    onClick={(e) => {
        e.stopPropagation();

        if (onToggle) {
            onToggle();
        }
    }}
    className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full border transition-all ${
      on ? "border-[#1C4ED8] bg-[#1C4ED8]" : "border-[#E0DDD6] bg-[#F5F4F0]"
    }`}
  >
    <span
      className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform ${
        on ? "translate-x-3.5" : "translate-x-0.5"
      }`}
    />
  </button>
);

/* ──────────────────── STATUS DROPDOWN ──────────────────── */
const StatusCell = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [menuPos, setMenuPos] = useState({ left: 0, top: 0 });
  const ref = useRef();
  const current = value || options[0]?.value || "";
  const currentOption = options.find((o) => o.value === current);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
  ref={ref}
  className="relative inline-block overflow-visible"
  onClick={(e) => e.stopPropagation()}
>
      <button
       onClick={() => {
  if (!onChange) return;

  const rect = ref.current?.getBoundingClientRect();
  const menuHeight = 260;
  const spaceBelow = window.innerHeight - rect.bottom;

  setMenuPos({
    left: rect.left,
    top: spaceBelow < menuHeight ? rect.top - menuHeight - 8 : rect.bottom + 4,
  });

  setOpen((s) => !s);
}}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-all hover:shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${
          currentOption?.color || "bg-[#F1F5F9] text-[#475569] border-[#CBD5E1]"
        }`}
      >
        <span className="h-1 w-1 rounded-full bg-current" />
        <span className="max-w-25 truncate">{current || "—"}</span>
        <svg width="7" height="7" viewBox="0 0 12 12" className="opacity-60 shrink-0">
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div
  style={{
    position: "fixed",
    left: menuPos.left,
    top: menuPos.top,
    zIndex: 99999,
  }}
  className="w-40 overflow-hidden rounded-lg border border-[#E8E6E0] bg-white shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
>
          <div className="border-b border-[#F0EDE8] bg-[#FAFAF8] px-2.5 py-1.5 text-[9px] font-semibold uppercase tracking-[0.06em] text-[#9B9890]">
            Update Status
          </div>
          <div className="py-1">
            {options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`flex w-full items-center justify-between px-2.5 py-1 text-left text-[10.5px] transition-colors hover:bg-[#FAFAF8] ${
                  opt.value === current ? "bg-[#F0F5FF]" : ""
                }`}
              >
                <span className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9.5px] font-medium ${opt.color}`}>
                  <span className="h-1 w-1 rounded-full bg-current" />
                  {opt.value}
                </span>
                {opt.value === current && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1C4ED8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};