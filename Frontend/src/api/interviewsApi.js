/**
 * ────────────────────────────────────────────────────────────
 *  INTERVIEWS API LAYER (localStorage stub)
 * ────────────────────────────────────────────────────────────
 *  Backend doesn't exist yet — this file uses localStorage as
 *  a temporary store so the UI works today.
 *
 *  When backend ships, swap the implementations below with
 *  axiosInstance calls — page components don't need to change.
 *  See candidatesApi.js for the target shape.
 * ────────────────────────────────────────────────────────────
 */

const STORAGE_KEY = "phibench_interviews";

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
  `iv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const normalize = (iv) => {
  if (!iv) return iv;
  return { ...iv, id: iv.id || iv._id };
};

/* ── public API ── */

export const listInterviews = async () => {
  return read().map(normalize);
};

export const getInterview = async (id) => {
  return normalize(read().find((iv) => iv.id === id)) || null;
};

export const createInterview = async (payload) => {
  const list = read();
  const now = new Date().toISOString();
  const newIv = {
    id: uid(),
    status: "Scheduled",
    ...payload,
    createdAt: now,
    updatedAt: now,
  };
  list.unshift(newIv);
  write(list);
  return normalize(newIv);
};

export const updateInterview = async (id, patch) => {
  const list = read();
  const idx = list.findIndex((iv) => iv.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
  write(list);
  return normalize(list[idx]);
};

export const deleteInterview = async (id) => {
  const list = read().filter((iv) => iv.id !== id);
  write(list);
  return true;
};

/* ── derived: upcoming interviews (next 7 days) ── */
export const listUpcomingInterviews = async (limit = 5) => {
  const now = Date.now();
  const weekAhead = now + 7 * 24 * 60 * 60 * 1000;
  return (await listInterviews())
    .filter((iv) => {
      const t = new Date(iv.dateTime).getTime();
      return t >= now && t <= weekAhead && iv.status === "Scheduled";
    })
    .sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime))
    .slice(0, limit);
};