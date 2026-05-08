import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { listBenchCandidates, toggleBench } from "../api/candidatesApi";

/* ──────────────────── BENCH PAGE ──────────────────── */

const Bench = () => {
  const [list, setList]     = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await listBenchCandidates();
    setList(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const handleRemove = async (id) => {
    await toggleBench(id);
    await refresh();
  };

  const filtered = list.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.skills || "").toLowerCase().includes(q) ||
      (c.jobTitle || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans">
      <div className="mx-auto max-w-7xl px-8 py-8">

        {/* HEADER */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#9B9890]">
              PhiBench
            </div>
            <h1 className="text-[26px] font-semibold leading-tight text-[#1C1B18]">
              Bench
            </h1>
            <p className="mt-1 text-[13px] text-[#9B9890]">
              Candidates currently available for new opportunities · {filtered.length}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="relative">
              <SearchIcon />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search bench…"
                className="h-10 w-70 rounded-[10px] border border-[#E0DDD6] bg-white pl-9 pr-3 text-[13px] text-[#1C1B18] outline-none transition-all focus:border-[#93AEFF] focus:ring-[3px] focus:ring-[#6382FF]/20"
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="rounded-2xl border border-[#E8E6E0] bg-white p-16 text-center text-[13px] text-[#9B9890]">
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <BenchCard
                key={c.id}
                candidate={c}
                onOpen={() => navigate(`/candidates/${c.id}`)}
                onRemove={() => handleRemove(c.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bench;

/* ──────────────────── BENCH CARD ──────────────────── */

const BenchCard = ({ candidate, onOpen, onRemove }) => (
  <div
    onClick={onOpen}
    className="group cursor-pointer overflow-hidden rounded-2xl border border-[#E8E6E0] bg-white p-5 transition-all hover:border-[#BFD3FF] hover:shadow-[0_4px_16px_rgba(28,78,216,0.08)]"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#1C4ED8] to-[#4F6FE8] text-[14px] font-semibold text-white shadow-[0_2px_4px_rgba(28,78,216,0.25)]">
          {candidate.initials || "?"}
        </div>
        <div className="min-w-0">
          <div className="truncate text-[14px] font-semibold text-[#1C1B18] group-hover:text-[#1C4ED8]">
            {candidate.name || "Unnamed"}
          </div>
          {candidate.jobTitle && (
            <div className="truncate text-[12px] text-[#6B6860]">{candidate.jobTitle}</div>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove from bench"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#9B9890] opacity-0 transition-all hover:bg-[#FEF2F2] hover:text-[#DC2626] group-hover:opacity-100"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div className="mt-4 flex flex-wrap gap-1">
      {(candidate.skills || "")
        .split(",")
        .slice(0, 4)
        .map((s, i) => {
          const t = s.trim();
          if (!t) return null;
          return (
            <span
              key={i}
              className="rounded-md border border-[#E0DDD6] bg-[#FAFAF8] px-2 py-0.5 text-[11px] font-medium text-[#4A4845]"
            >
              {t}
            </span>
          );
        })}
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-[#F0EDE8] pt-3 text-[11px] text-[#9B9890]">
      <span>{candidate.experienceYears ? `${candidate.experienceYears} yrs exp` : "Experience —"}</span>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2 py-0.5 font-medium text-[#1D4ED8]">
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        On Bench
      </span>
    </div>
  </div>
);

/* ──────────────────── EMPTY STATE ──────────────────── */

const EmptyState = () => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#E8E6E0] bg-white py-20 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F5F4F0] text-[#9B9890]">
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M8 12h8M8 8h8M8 16h5" />
      </svg>
    </div>
    <div>
      <div className="text-[15px] font-semibold text-[#1C1B18]">No candidates on bench</div>
      <div className="mt-0.5 text-[12px] text-[#9B9890]">
        Toggle the bench switch on any candidate to add them here
      </div>
    </div>
  </div>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9890]">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);