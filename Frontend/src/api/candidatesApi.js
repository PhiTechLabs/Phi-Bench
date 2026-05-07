/**
 * ────────────────────────────────────────────────────────────
 *  CANDIDATES API LAYER
 * ────────────────────────────────────────────────────────────
 *  Single source of truth for all candidate data operations.
 *
 *  Currently backed by localStorage. When backend is ready,
 *  ONLY this file needs to change — replace each function body
 *  with axios/fetch calls.
 * ────────────────────────────────────────────────────────────
 */

import { MdKeyboardReturn, MdOutlineContactSupport } from "react-icons/md";

const STORAGE_KEY = "candidates";

/* ── internal helpers ── */
const readAll = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};
const writeAll = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

/**
 * Auto-derive flat-level fields from nested form data.
 * The form stores work history in `experience[]` array, but the table
 * needs a quick `company` lookup. We pull from the entry that's marked
 * `current: true`, falling back to the first entry with a company name.
 *
 * Same pattern can be extended for other "current" derivations later.
 */
const deriveFlatFields = (data) => {
  const exp = Array.isArray(data.experience) ? data.experience : [];
  const currentExp =
    exp.find((e) => e?.current && e?.company) ||
    exp.find((e) => e?.company);
    

  return {
    company: currentExp?.company || data.company || "",
  };
};

/* ── public API ── */

export const listCandidates = async () => readAll();

export const getCandidate = async (id) =>
  readAll().find((c) => c.id === Number(id)) || null;

export const createCandidate = async (data) => {
  const list = readAll();
  const newCandidate = {
    id: Date.now(),
    name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
    initials: `${data.firstName?.[0] || ""}${data.lastName?.[0] || ""}`.toUpperCase(),
    status: "New",
    onBench: false,
    createdAt: new Date().toISOString(),
    ...data,
    ...deriveFlatFields(data), // overrides any direct company field with derived one
  };
  writeAll([newCandidate, ...list]);
  return newCandidate;
};

export const updateCandidate = async (id, patch) => {
  const list = readAll();
  const next = list.map((c) => {
    if (c.id !== Number(id)) return c;
    const merged = { ...c, ...patch, updatedAt: new Date().toISOString() };
    // Re-derive in case experience changed
    return { ...merged, ...deriveFlatFields(merged) };
  });
  writeAll(next);
  return next.find((c) => c.id === Number(id)) || null;
};

export const deleteCandidate = async (id) => {
  writeAll(readAll().filter((c) => c.id !== Number(id)));
  return true;
};

export const toggleBench = async (id) => {
  const candidate = await getCandidate(id);
  if (!candidate) return null;
  return updateCandidate(id, { onBench: !candidate.onBench });
};

export const listBenchCandidates = async () =>
  readAll().filter((c) => c.onBench);

/**
 * One-time migration: backfills `company` for existing candidates
 * who were created before this derivation existed.
 * Call once on app load — it's idempotent and safe to re-run.
 */
export const migrateExistingCandidates = () => {
  const list = readAll();
  let changed = false;
  const next = list.map((c) => {
    if (c.company && c.company.trim()) return c; // already has company
    const derived = deriveFlatFields(c);
    if (derived.company) {
      changed = true;
      return { ...c, ...derived };
    }
    return c;
  });
  if (changed) writeAll(next);
};
