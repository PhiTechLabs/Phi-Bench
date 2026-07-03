// ─── CANDIDATE STATUS SYNC ───────────────────────────────────────────────────
// Derives a candidate's overall status from all their current submissions,
// mirroring how Ceipal / Bullhorn approach this: the candidate's status is
// always derived from their most advanced active submission, not maintained
// as a separate independent field.
//
// Called from every place a submission status changes:
//   - submissionService.js  (create, update, forceStatus)
//   - interviewService.js   (createInterview auto-advance, addFeedback advance)
//
// Rules (priority order — first match wins):
//   hired     → "Hired"       (Joined, Offer Accepted, Project Completed…)
//   positive  → "Offer"       (Offer Sent, HR Discussion, Final Select)
//   interview → "Interview"   (any Lx Scheduled / Rescheduled)
//   submitted → "Shortlisted" (Submitted To Client, Hold by Client)
//   pending   → "Screening"   (For Validation, Need More Info, Internal Hold…)
//   backout   → "On Hold"     (any Backout — candidate may re-enter pipeline)
//   rejected  → "Rejected"    (only when ALL submissions are rejected/neutral)
//
// If a candidate has no submissions, their status is NOT touched — recruiters
// may still set it manually for pre-submission states (e.g. bench hold).

import Submission, { SUBMISSION_STATUS_CATEGORY } from "../models/Submission.js";
import Candidate from "../models/Candidate.js";

// Priority ordering for category → candidate status mapping.
// Higher index = higher priority. We pick the highest-priority category found.
const CATEGORY_PRIORITY = [
    "neutral",   // 0 — lowest
    "rejected",  // 1
    "backout",   // 2
    "pending",   // 3
    "hold",      // 4
    "submitted", // 5
    "interview", // 6
    "positive",  // 7
    "hired",     // 8 — highest
];

const CATEGORY_TO_CANDIDATE_STATUS = {
    hired:     "Hired",
    positive:  "Offer",
    interview: "Interview",
    submitted: "Shortlisted",
    pending:   "Screening",
    hold:      "On Hold",
    backout:   "On Hold",
    rejected:  "Rejected",
    neutral:   null, // don't change candidate status for closed/duplicate/etc.
};

export const syncCandidateStatus = async (candidateId) => {
    if (!candidateId) return;

    // Fetch all submissions for this candidate (lean for speed)
    const submissions = await Submission.find(
        { candidate: candidateId },
        { status: 1 }
    ).lean();

    if (!submissions.length) return; // no submissions — leave status as-is

    // Find the highest-priority category across all submissions
    let highestPriorityIdx = -1;

    for (const sub of submissions) {
        const category = SUBMISSION_STATUS_CATEGORY[sub.status];
        if (!category) continue;
        const idx = CATEGORY_PRIORITY.indexOf(category);
        if (idx > highestPriorityIdx) {
            highestPriorityIdx = idx;
        }
    }

    if (highestPriorityIdx === -1) return; // no recognisable statuses

    const highestCategory = CATEGORY_PRIORITY[highestPriorityIdx];
    const newCandidateStatus = CATEGORY_TO_CANDIDATE_STATUS[highestCategory];

    if (!newCandidateStatus) return; // neutral category — don't touch

    // Only write if the status actually needs to change
    await Candidate.findByIdAndUpdate(
        candidateId,
        { $set: { status: newCandidateStatus } },
        { runValidators: true }
    );
};