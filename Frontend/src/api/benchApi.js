/**
 * ────────────────────────────────────────────────────────────
 *  BENCH API LAYER
 * ────────────────────────────────────────────────────────────
 *  Bench is a filtered view of candidates where `onBench: true`.
 *  This file is a thin facade over candidatesApi — it doesn't
 *  own its own storage. All writes go through candidatesApi so
 *  there's only one source of truth.
 *
 *  When backend is ready, point these at /bench endpoints if
 *  the API exposes them, or keep them as wrappers over the
 *  candidates endpoints.
 * ────────────────────────────────────────────────────────────
 */

import {
  listBenchCandidates,
  getCandidate,
  updateCandidate,
  deleteCandidate,
  toggleBench,
} from "./candidatesApi";

/* ── public API ── */

export const listBench = async () => listBenchCandidates();

export const getBenchEntry = async (id) => {
  const candidate = await getCandidate(id);
  return candidate?.onBench ? candidate : null;
};

export const updateBenchEntry = async (id, patch) =>
  updateCandidate(id, patch);

export const removeFromBench = async (id) =>
  updateCandidate(id, { onBench: false });

export const addToBench = async (id) =>
  updateCandidate(id, { onBench: true });

export const toggleBenchStatus = async (id) => toggleBench(id);

export const deleteBenchCandidate = async (id) => deleteCandidate(id);