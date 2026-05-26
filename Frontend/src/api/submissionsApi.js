/**
 * ────────────────────────────────────────────────────────────
 *  SUBMISSIONS API LAYER (localStorage stub)
 * ────────────────────────────────────────────────────────────
 *  Backend doesn't exist yet — localStorage temporary store.
 *  Swap to axiosInstance calls when /api/submissions ships.
 * ────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = "phibench_submissions";

/* ── helpers ── */
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const write = (list) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
};

const uid = () =>
  `sb_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const normalize = (s) => {
  if (!s) return s;
  return { ...s, id: s.id || s._id };
};

/* ── public API ── */

export const listSubmissions = async () => {
  return read().map(normalize);
};

export const getSubmission = async (id) => {
  return normalize(read().find((s) => s.id === id)) || null;
};

export const createSubmission = async (payload) => {
  const list = read();
  const now = new Date().toISOString();
  const newSub = {
    id: uid(),
    status: "Submitted",
    submissionDate: payload.submissionDate || now,
    ...payload,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(newSub);
  write(list);
  return normalize(newSub);
};

export const updateSubmission = async (id, patch) => {
  const list = read();
  const idx = list.findIndex((s) => s.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
  write(list);
  return normalize(list[idx]);
};

export const deleteSubmission = async (id) => {
  const list = read().filter((s) => s.id !== id);
  write(list);
  return true;
};

/* ── get submissions by candidate ── */
export const getCandidateSubmissions = async (candidateId) => {
  const list = read();
  return list
    .filter((s) => s.candidateId === candidateId)
    .map(normalize)
    .sort((a, b) => new Date(b.submittedDate || b.submissionDate) - new Date(a.submittedDate || a.submissionDate));
};