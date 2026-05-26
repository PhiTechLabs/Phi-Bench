import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaTrash,
  FaEdit,
  FaUserCheck,
  FaUserMinus,
  FaBriefcase,
  FaCalendarAlt,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLinkedin,
  FaBriefcase as FaBriefcaseIcon,
  FaCalendar,
  FaDollarSign,
  FaFileAlt,
  FaGlobe,
  FaBuilding,
  FaUser,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { getAvatarProps } from "../utils/avatar";

// ═══════════════════════════════════════════════════════════════════════════
// API IMPORTS
// ═══════════════════════════════════════════════════════════════════════════
import { getCandidate, deleteCandidate, updateCandidate, toggleBench } from "../api/candidatesApi";
import { getJob, deleteJob } from "../api/jobsApi";
import { getClient, deleteClient } from "../api/clientApi";
import { listOpenJobs } from "../api/jobsApi";
import { getCandidateSubmissions } from "../api/submissionsApi";
import { createInterview, getCandidateInterviews } from "../api/interviewsApi";

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format duration from month/year fields
 */
export const formatDuration = (fromMonth, fromYear, toMonth, toYear, isCurrent) => {
  if (!fromMonth && !fromYear) return "—";
  
  const start = fromMonth && fromYear ? `${fromMonth} ${fromYear}` : fromYear || fromMonth || "—";
  const end = isCurrent ? "Present" : (toMonth && toYear ? `${toMonth} ${toYear}` : toYear || toMonth || "—");
  
  return `${start} - ${end}`;
};

/**
 * Format date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return "—";
  }
};

/**
 * Get status badge color classes
 */
export const getStatusColor = (status) => {
  const statusColors = {
    New: "bg-blue-50 text-blue-700 border-blue-200",
    Screening: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Shortlisted: "bg-purple-50 text-purple-700 border-purple-200",
    Interview: "bg-indigo-50 text-indigo-700 border-indigo-200",
    Offer: "bg-orange-50 text-orange-700 border-orange-200",
    Hired: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
    "On Hold": "bg-gray-50 text-gray-700 border-gray-200",
    Withdrawn: "bg-gray-50 text-gray-500 border-gray-200",
    Open: "bg-green-50 text-green-700 border-green-200",
    Closed: "bg-red-50 text-red-700 border-red-200",
    Filled: "bg-blue-50 text-blue-700 border-blue-200",
    Active: "bg-green-50 text-green-700 border-green-200",
    Prospect: "bg-yellow-50 text-yellow-700 border-yellow-200",
    Onboarding: "bg-blue-50 text-blue-700 border-blue-200",
    Inactive: "bg-gray-50 text-gray-600 border-gray-200",
  };
  
  return statusColors[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

/**
 * Get status icon
 */
export const getStatusIcon = (status) => {
  const icons = {
    Open: <FaCheckCircle className="text-green-600" />,
    Active: <FaCheckCircle className="text-green-600" />,
    Hired: <FaCheckCircle className="text-green-600" />,
    Closed: <FaTimesCircle className="text-red-600" />,
    Rejected: <FaTimesCircle className="text-red-600" />,
    Inactive: <FaTimesCircle className="text-gray-600" />,
    "On Hold": <FaExclamationCircle className="text-yellow-600" />,
    Prospect: <FaExclamationCircle className="text-yellow-600" />,
  };
  return icons[status] || null;
};

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENTS - CANDIDATE PROFILE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Candidate Profile Header
 */
export const CandidateProfileHeader = ({ candidate }) => {
  if (!candidate) return null;

  const avatar = getAvatarProps(candidate.name || `${candidate.firstName} ${candidate.lastName}`);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0"
          style={{ backgroundColor: avatar.bgColor, color: avatar.textColor }}
        >
          {candidate.initials || avatar.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {candidate.name || `${candidate.firstName} ${candidate.lastName}`}
              </h1>
              <p className="text-sm text-gray-600">{candidate.jobTitle || "—"}</p>
            </div>
            <div className="flex items-center gap-2">
              {candidate.onBench && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full border border-purple-300">
                  On Bench
                </span>
              )}
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(candidate.status)}`}>
                {candidate.status || "New"}
              </span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            {candidate.email && (
              <div className="flex items-center gap-2 text-gray-700">
                <FaEnvelope className="text-gray-400 flex-shrink-0" />
                <a href={`mailto:${candidate.email}`} className="hover:text-blue-600 truncate">
                  {candidate.email}
                </a>
              </div>
            )}
            {candidate.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <FaPhone className="text-gray-400 flex-shrink-0" />
                <a href={`tel:${candidate.phone}`} className="hover:text-blue-600">
                  {candidate.phone}
                </a>
              </div>
            )}
            {(candidate.city || candidate.state) && (
              <div className="flex items-center gap-2 text-gray-700">
                <FaMapMarkerAlt className="text-gray-400 flex-shrink-0" />
                <span className="truncate">
                  {[candidate.city, candidate.state].filter(Boolean).join(", ")}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Candidate Profile Info Tab
 */
export const CandidateProfileInfoTab = ({ candidate }) => {
  if (!candidate) return null;

  return (
    <div className="space-y-6">
      {/* Skills */}
      {candidate.skills && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {String(candidate.skills)
              .split(",")
              .map((skill, index) => {
                const trimmed = skill.trim();
                if (!trimmed) return null;
                return (
                  <span
                    key={index}
                    className="px-3 py-1.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium"
                  >
                    {trimmed}
                  </span>
                );
              })}
          </div>
        </div>
      )}

      {/* Professional Details */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Professional Details</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DetailItem label="Experience" value={candidate.experienceYears ? `${candidate.experienceYears} years` : "—"} />
          <DetailItem label="Current Salary" value={candidate.currentSalary || "—"} />
          <DetailItem label="Expected Salary" value={candidate.expectedSalary || "—"} />
          <DetailItem label="Notice Period" value={candidate.noticePeriod || "—"} />
          <DetailItem label="Qualification" value={candidate.qualification || "—"} />
          {candidate.linkedin && (
            <div className="col-span-2 md:col-span-3">
              <a
                href={candidate.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
              >
                <FaLinkedin />
                LinkedIn Profile
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Work Experience */}
      {Array.isArray(candidate.experience) && candidate.experience.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Work Experience</h3>
          <div className="space-y-4">
            {candidate.experience.map((exp, index) => (
              <div key={index} className="border-l-2 border-blue-200 pl-4">
                <h4 className="font-semibold text-gray-900">{exp.title || "Untitled Role"}</h4>
                {exp.company && <p className="text-sm text-gray-600">{exp.company}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {formatDuration(exp.fromMonth, exp.fromYear, exp.toMonth, exp.toYear, exp.current)}
                </p>
                {exp.summary && <p className="text-sm text-gray-700 mt-2">{exp.summary}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {Array.isArray(candidate.education) && candidate.education.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Education</h3>
          <div className="space-y-4">
            {candidate.education.map((edu, index) => (
              <div key={index} className="border-l-2 border-green-200 pl-4">
                <h4 className="font-semibold text-gray-900">{edu.degree || "Degree"}</h4>
                {edu.institute && <p className="text-sm text-gray-600">{edu.institute}</p>}
                {edu.major && <p className="text-sm text-gray-600">{edu.major}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {formatDuration(edu.fromMonth, edu.fromYear, edu.toMonth, edu.toYear, edu.pursuing)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <DetailItem label="Street" value={candidate.street} />
          <DetailItem label="City" value={candidate.city} />
          <DetailItem label="State" value={candidate.state} />
          <DetailItem label="Country" value={candidate.country} />
          <DetailItem label="Pincode" value={candidate.pincode} />
        </div>
      </div>
    </div>
  );
};

/**
 * Candidate Submissions Tab
 */
export const CandidateSubmissionsTab = ({ candidateId, onSubmitToJob }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;
    
    getCandidateSubmissions(candidateId)
      .then((data) => {
        setSubmissions(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [candidateId]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading submissions...</div>;
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No submissions yet</p>
        {onSubmitToJob && (
          <button
            onClick={onSubmitToJob}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Submit to Job
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Submissions ({submissions.length})</h3>
        {onSubmitToJob && (
          <button
            onClick={onSubmitToJob}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Submit to Job
          </button>
        )}
      </div>
      <div className="space-y-3">
        {submissions.map((submission) => (
          <div key={submission.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{submission.jobTitle || "Untitled Job"}</h4>
                <p className="text-sm text-gray-600">{submission.clientName || "—"}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Submitted: {formatDate(submission.submittedDate)}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(submission.status)}`}>
                {submission.status}
              </span>
            </div>
            {submission.recruiterNotes && (
              <p className="text-sm text-gray-700 mt-3 border-t border-gray-200 pt-3">
                <span className="font-medium">Notes:</span> {submission.recruiterNotes}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Candidate Interviews Tab
 */
export const CandidateInterviewsTab = ({ candidateId, onScheduleInterview }) => {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!candidateId) return;
    
    getCandidateInterviews(candidateId)
      .then((data) => {
        setInterviews(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [candidateId]);

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading interviews...</div>;
  }

  if (interviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No interviews scheduled</p>
        {onScheduleInterview && (
          <button
            onClick={onScheduleInterview}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Schedule Interview
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Interviews ({interviews.length})</h3>
        {onScheduleInterview && (
          <button
            onClick={onScheduleInterview}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            + Schedule Interview
          </button>
        )}
      </div>
      <div className="space-y-3">
        {interviews.map((interview) => (
          <div key={interview.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{interview.jobTitle || "Untitled Job"}</h4>
                <p className="text-sm text-gray-600">{interview.interviewRound}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatDate(interview.scheduledDate)} at {interview.scheduledTime}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(interview.status)}`}>
                {interview.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Type:</span> {interview.interviewType}
              </div>
              <div>
                <span className="text-gray-500">Duration:</span> {interview.duration || "—"} min
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Candidate Action Panel (Right Sidebar)
 */
export const CandidateActionPanel = ({ candidate, onCandidateUpdate, onScheduleInterview, onSubmitToJob }) => {
  const navigate = useNavigate();
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isTogglingBench, setIsTogglingBench] = useState(false);

  if (!candidate) return null;

  const handleEditProfile = () => {
    navigate(`/candidates/edit/${candidate.id}`);
  };

  const handleStatusChange = async (newStatus) => {
    if (isUpdatingStatus) return;
    
    setIsUpdatingStatus(true);
    try {
      const updated = await updateCandidate(candidate.id, { status: newStatus });
      if (onCandidateUpdate) {
        onCandidateUpdate(updated);
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleToggleBench = async () => {
    if (isTogglingBench) return;
    
    setIsTogglingBench(true);
    try {
      const updated = await toggleBench(candidate.id);
      if (onCandidateUpdate) {
        onCandidateUpdate(updated);
      }
    } catch (error) {
      console.error("Failed to toggle bench:", error);
    } finally {
      setIsTogglingBench(false);
    }
  };

  const statusOptions = [
    "New", "Screening", "Shortlisted", "Interview", 
    "Offer", "Hired", "Rejected", "On Hold", "Withdrawn"
  ];

  return (
    <div className="space-y-4">
      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h3>
        <div className="space-y-2">
          <ActionButton
            icon={<FaBriefcase />}
            label="Submit to Job"
            onClick={onSubmitToJob}
            variant="primary"
          />
          <ActionButton
            icon={<FaCalendarAlt />}
            label="Schedule Interview"
            onClick={onScheduleInterview}
            variant="secondary"
          />
          <ActionButton
            icon={candidate.onBench ? <FaUserMinus /> : <FaUserCheck />}
            label={candidate.onBench ? "Remove from Bench" : "Add to Bench"}
            onClick={handleToggleBench}
            variant="secondary"
            disabled={isTogglingBench}
          />
          <ActionButton
            icon={<FaEdit />}
            label="Edit Profile"
            onClick={handleEditProfile}
            variant="secondary"
          />
        </div>
      </div>

      {/* Status Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Current Status</h3>
        <select
          value={candidate.status || "New"}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isUpdatingStatus}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Quick Info</h3>
        <div className="space-y-2 text-xs">
          <InfoItem
            label="Experience"
            value={candidate.experienceYears ? `${candidate.experienceYears} years` : "—"}
          />
          <InfoItem
            label="Expected Salary"
            value={candidate.expectedSalary || "—"}
          />
          <InfoItem
            label="Notice Period"
            value={candidate.noticePeriod || "—"}
          />
        </div>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENTS - JOB PROFILE (FULL SCREEN LAYOUT)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Profile Info Card - Icon, Label, Value display
 */
export const ProfileInfoCard = ({ icon, label, value, fullWidth = false }) => (
  <div className={`${fullWidth ? 'col-span-2' : ''}`}>
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</div>
        <div className="text-sm font-medium text-gray-900 break-words">{value || "—"}</div>
      </div>
    </div>
  </div>
);

/**
 * Profile Section Card - White card on gray background
 */
export const ProfileSectionCard = ({ title, children, action }) => (
  <div className="bg-white border-b border-gray-200">
    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
      <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">{title}</h2>
      {action}
    </div>
    <div className="px-6 py-5">
      {children}
    </div>
  </div>
);

/**
 * Job Profile Header - Full Screen Layout
 */
export const JobProfileHeader = ({ job, onEdit, onDelete, onBack }) => {
  if (!job) return null;

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      {/* Top Bar with Actions */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          <FaArrowLeft className="text-xs" />
          Back to Jobs
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
          >
            <FaEdit className="text-xs" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 flex items-center gap-2"
          >
            <FaTrash className="text-xs" />
            Delete
          </button>
        </div>
      </div>

      {/* Header Content */}
      <div className="px-6 py-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{job.title || "Untitled Job"}</h1>
              <div className="flex items-center gap-2">
                {getStatusIcon(job.status)}
                <span className={`px-3 py-1 text-xs font-semibold rounded border ${getStatusColor(job.status)}`}>
                  {job.status || "Open"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {job.client && (
                <div className="flex items-center gap-1.5">
                  <FaBuilding className="text-gray-400 text-xs" />
                  <span>{job.client}</span>
                </div>
              )}
              {job.jobType && (
                <div className="flex items-center gap-1.5">
                  <FaBriefcaseIcon className="text-gray-400 text-xs" />
                  <span>{job.jobType}</span>
                </div>
              )}
              {job.dateOpened && (
                <div className="flex items-center gap-1.5">
                  <FaClock className="text-gray-400 text-xs" />
                  <span>Opened {formatDate(job.dateOpened)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Highlights */}
        <div className="grid grid-cols-4 gap-6 pt-4 border-t border-gray-100">
          {job.experience && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Experience</div>
              <div className="text-sm font-semibold text-gray-900">{job.experience}</div>
            </div>
          )}
          {job.salary && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Salary Range</div>
              <div className="text-sm font-semibold text-gray-900">{job.salary}</div>
            </div>
          )}
          {(job.city || job.country) && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Location</div>
              <div className="text-sm font-semibold text-gray-900">
                {[job.city, job.country].filter(Boolean).join(", ")}
              </div>
            </div>
          )}
          {job.targetDate && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Target Date</div>
              <div className="text-sm font-semibold text-gray-900">{formatDate(job.targetDate)}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Job Profile Details - Full Screen Layout
 */
export const JobProfileDetails = ({ job }) => {
  if (!job) return null;

  return (
    <div className="bg-gray-50">
      {/* Job Information */}
      <ProfileSectionCard title="Job Information">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <ProfileInfoCard icon={<FaBriefcaseIcon />} label="Job Title" value={job.title} />
          <ProfileInfoCard icon={<FaBuilding />} label="Client" value={job.client} />
          <ProfileInfoCard icon={<FaBriefcase />} label="Job Type" value={job.jobType} />
          <ProfileInfoCard icon={<FaCalendar />} label="Experience Required" value={job.experience} />
          <ProfileInfoCard icon={<FaDollarSign />} label="Salary Range" value={job.salary} />
          <ProfileInfoCard icon={<FaBuilding />} label="Industry" value={job.industry} />
          {job.skills && (
            <ProfileInfoCard 
              icon={<FaFileAlt />} 
              label="Required Skills" 
              value={job.skills}
              fullWidth
            />
          )}
        </div>
      </ProfileSectionCard>

      {/* Location Details */}
      <ProfileSectionCard title="Location Details">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <ProfileInfoCard icon={<FaMapMarkerAlt />} label="City" value={job.city} />
          <ProfileInfoCard icon={<FaMapMarkerAlt />} label="Country" value={job.country} />
        </div>
      </ProfileSectionCard>

      {/* Hiring Team */}
      <ProfileSectionCard title="Hiring Team">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <ProfileInfoCard icon={<FaUser />} label="Hiring Manager" value={job.manager} />
          <ProfileInfoCard icon={<FaUser />} label="Recruiter" value={job.recruiter} />
          <ProfileInfoCard icon={<FaPhone />} label="Contact Person" value={job.contact} />
        </div>
      </ProfileSectionCard>

      {/* Important Dates */}
      <ProfileSectionCard title="Important Dates">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <ProfileInfoCard 
            icon={<FaCalendar />} 
            label="Date Opened" 
            value={job.dateOpened ? formatDate(job.dateOpened) : "—"} 
          />
          <ProfileInfoCard 
            icon={<FaCalendar />} 
            label="Target Date" 
            value={job.targetDate ? formatDate(job.targetDate) : "—"} 
          />
          <ProfileInfoCard 
            icon={<FaCalendar />} 
            label="Created Date" 
            value={job.createdAt ? formatDate(job.createdAt) : "—"} 
          />
        </div>
      </ProfileSectionCard>

      {/* Job Description */}
      {job.description && (
        <ProfileSectionCard title="Job Description">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.description}
            </p>
          </div>
        </ProfileSectionCard>
      )}

      {/* Additional Information */}
      {job.postInfo && (
        <ProfileSectionCard title="Posting Information">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {job.postInfo}
            </p>
          </div>
        </ProfileSectionCard>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// UI COMPONENTS - CLIENT PROFILE (FULL SCREEN LAYOUT)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Client Profile Header - Full Screen Layout
 */
export const ClientProfileHeader = ({ client, onEdit, onDelete, onBack }) => {
  if (!client) return null;

  const avatar = getAvatarProps(client.clientName || "?");

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      {/* Top Bar with Actions */}
      <div className="px-6 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
        >
          <FaArrowLeft className="text-xs" />
          Back to Clients
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 flex items-center gap-2"
          >
            <FaEdit className="text-xs" />
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 flex items-center gap-2"
          >
            <FaTrash className="text-xs" />
            Delete
          </button>
        </div>
      </div>

      {/* Header Content */}
      <div className="px-6 py-6">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-lg flex items-center justify-center text-xl font-bold flex-shrink-0"
            style={{ backgroundColor: avatar.bgColor, color: avatar.textColor }}
          >
            {avatar.initials}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{client.clientName || "Unnamed Client"}</h1>
              <div className="flex items-center gap-2">
                {getStatusIcon(client.status)}
                <span className={`px-3 py-1 text-xs font-semibold rounded border ${getStatusColor(client.status)}`}>
                  {client.status || "Active"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {client.industry && (
                <div className="flex items-center gap-1.5">
                  <FaBuilding className="text-gray-400 text-xs" />
                  <span>{client.industry}</span>
                </div>
              )}
              {client.accountManager && (
                <div className="flex items-center gap-1.5">
                  <FaUser className="text-gray-400 text-xs" />
                  <span>Account Manager: {client.accountManager}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key Contact Info */}
        <div className="grid grid-cols-4 gap-6 pt-4 border-t border-gray-100 mt-4">
          {client.contactNumber && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Contact Number</div>
              <div className="text-sm font-semibold text-gray-900">{client.contactNumber}</div>
            </div>
          )}
          {client.website && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Website</div>
              <a 
                href={client.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700 truncate block"
              >
                {client.website.replace(/^https?:\/\//, '')}
              </a>
            </div>
          )}
          {client.locations && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Locations</div>
              <div className="text-sm font-semibold text-gray-900">{client.locations.length || 0}</div>
            </div>
          )}
          {client.pocs && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Points of Contact</div>
              <div className="text-sm font-semibold text-gray-900">{client.pocs.length || 0}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Client Profile Details - Full Screen Layout
 */
export const ClientProfileDetails = ({ client }) => {
  if (!client) return null;

  return (
    <div className="bg-gray-50">
      {/* Basic Information */}
      <ProfileSectionCard title="Basic Information">
        <div className="grid grid-cols-2 gap-x-8 gap-y-5">
          <ProfileInfoCard icon={<FaBuilding />} label="Client Name" value={client.clientName} />
          <ProfileInfoCard icon={<FaBuilding />} label="Parent Client" value={client.parentClient} />
          <ProfileInfoCard icon={<FaPhone />} label="Contact Number" value={client.contactNumber} />
          <ProfileInfoCard icon={<FaGlobe />} label="Website" value={client.website} />
          <ProfileInfoCard icon={<FaUser />} label="Account Manager" value={client.accountManager} />
          <ProfileInfoCard icon={<FaBriefcaseIcon />} label="Industry" value={client.industry} />
          <ProfileInfoCard icon={<FaFileAlt />} label="Source" value={client.source} />
        </div>
      </ProfileSectionCard>

      {/* About */}
      {client.about && (
        <ProfileSectionCard title="About">
          <div className="prose prose-sm max-w-none">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
              {client.about}
            </p>
          </div>
        </ProfileSectionCard>
      )}

      {/* Social Media */}
      {client.linkedin && (
        <ProfileSectionCard title="Social Media">
          <div className="grid grid-cols-2 gap-x-8 gap-y-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 text-blue-600">
                <FaLinkedin />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">LinkedIn</div>
                <a
                  href={client.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-blue-600 hover:text-blue-700 break-all"
                >
                  {client.linkedin}
                </a>
              </div>
            </div>
          </div>
        </ProfileSectionCard>
      )}

      {/* Locations */}
      {Array.isArray(client.locations) && client.locations.length > 0 && (
        <ProfileSectionCard title={`Locations (${client.locations.length})`}>
          <div className="space-y-6">
            {client.locations.map((location, index) => (
              <div key={location._id || index} className="border-l-4 border-blue-500 pl-6 pb-6 last:pb-0">
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <ProfileInfoCard icon={<FaMapMarkerAlt />} label="Street" value={location.street} />
                  <ProfileInfoCard icon={<FaMapMarkerAlt />} label="City" value={location.city} />
                  <ProfileInfoCard icon={<FaMapMarkerAlt />} label="Province/State" value={location.province} />
                  <ProfileInfoCard icon={<FaMapMarkerAlt />} label="Postal Code" value={location.code} />
                  <ProfileInfoCard icon={<FaMapMarkerAlt />} label="Country" value={location.country} />
                </div>
              </div>
            ))}
          </div>
        </ProfileSectionCard>
      )}

      {/* Points of Contact */}
      {Array.isArray(client.pocs) && client.pocs.length > 0 && (
        <ProfileSectionCard title={`Points of Contact (${client.pocs.length})`}>
          <div className="space-y-6">
            {client.pocs.map((poc, index) => (
              <div key={poc._id || index} className="border-l-4 border-green-500 pl-6 pb-6 last:pb-0">
                <h4 className="text-base font-semibold text-gray-900 mb-4">
                  {poc.firstName} {poc.lastName}
                </h4>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <ProfileInfoCard icon={<FaBriefcaseIcon />} label="Designation" value={poc.designation} />
                  <ProfileInfoCard icon={<FaMapMarkerAlt />} label="Location" value={poc.location} />
                  <ProfileInfoCard icon={<FaEnvelope />} label="Email" value={poc.email} />
                  <ProfileInfoCard icon={<FaPhone />} label="Contact" value={poc.contact} />
                  {poc.linkedin && (
                    <div className="col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 text-blue-600">
                          <FaLinkedin />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">LinkedIn</div>
                          <a
                            href={poc.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 break-all"
                          >
                            {poc.linkedin}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ProfileSectionCard>
      )}

      {/* Documents */}
      {Array.isArray(client.documents) && client.documents.length > 0 && (
        <ProfileSectionCard title={`Documents (${client.documents.length})`}>
          <div className="grid grid-cols-2 gap-4">
            {client.documents.map((doc, index) => (
              <a
                key={doc._id || index}
                href={doc.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition"
              >
                <FaFileAlt className="text-gray-400 text-xl flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                  <p className="text-xs text-gray-500">
                    {doc.uploadedAt ? formatDate(doc.uploadedAt) : "—"}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </ProfileSectionCard>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// SHARED UI COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Tab Button Component
 */
export const TabButton = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2.5 text-sm font-medium border-b-2 transition-colors ${
      isActive
        ? "border-blue-600 text-blue-600 bg-blue-50"
        : "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50"
    }`}
  >
    {label}
  </button>
);

/**
 * Action Button Component
 */
export const ActionButton = ({ icon, label, onClick, variant = "secondary", disabled = false }) => {
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 border-blue-600",
    secondary: "bg-white text-gray-700 hover:bg-gray-50 border-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700 border-red-600",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium border transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

/**
 * Detail Item Component
 */
export const DetailItem = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
  </div>
);

/**
 * Info Item Component (for action panels)
 */
export const InfoItem = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-500">{label}:</span>
    <span className="font-medium text-gray-900">{value || "—"}</span>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PROFILE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Main Profile Component - Routes to specific entity profiles
 */
export const Profile = ({ entityType }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Entity type routing
  switch (entityType) {
    case "candidate":
      return <CandidateProfile id={id} navigate={navigate} />;
    case "job":
      return <JobProfile id={id} navigate={navigate} />;
    case "client":
      return <ClientProfile id={id} navigate={navigate} />;
    default:
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-red-600">Invalid entity type: {entityType}</div>
        </div>
      );
  }
};

/**
 * Candidate Profile Component
 */
export const CandidateProfile = ({ id, navigate }) => {
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  // Modals
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);

  // Fetch candidate data
  useEffect(() => {
    if (!id) return;

    getCandidate(id)
      .then((data) => {
        setCandidate(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch candidate:", error);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this candidate? This action cannot be undone.")) return;

    try {
      await deleteCandidate(id);
      navigate("/candidates");
    } catch (error) {
      console.error("Failed to delete candidate:", error);
    }
  };

  const handleCandidateUpdate = (updatedCandidate) => {
    setCandidate(updatedCandidate);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading candidate...</div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <div className="text-lg font-semibold text-gray-900 mb-2">Candidate Not Found</div>
          <p className="text-sm text-gray-600 mb-6">
            The candidate you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/candidates")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Back to Candidates
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "profile", label: "Profile Info" },
    { key: "submissions", label: "Submissions" },
    { key: "interviews", label: "Interviews" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-6 py-4">
        <div className="flex gap-4">
          {/* Left: Main Content */}
          <div className="flex-1 min-w-0">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
              <div className="border-b border-gray-200">
                <div className="flex items-center">
                  <button
                    onClick={() => navigate("/candidates")}
                    className="px-4 py-2.5 hover:bg-gray-100 transition border-r border-gray-200"
                    title="Back to Candidates"
                  >
                    <FaArrowLeft className="text-gray-600" />
                  </button>

                  <div className="flex-1 flex justify-center">
                    <div className="flex">
                      {tabs.map((tab) => (
                        <TabButton
                          key={tab.key}
                          label={tab.label}
                          isActive={activeTab === tab.key}
                          onClick={() => setActiveTab(tab.key)}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleDelete}
                    className="px-4 py-2.5 hover:bg-red-50 transition border-l border-gray-200 text-red-600"
                    title="Delete Candidate"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>

            {/* Profile Header */}
            <CandidateProfileHeader candidate={candidate} />

            {/* Tab Content */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              {activeTab === "profile" && <CandidateProfileInfoTab candidate={candidate} />}
              {activeTab === "submissions" && (
                <CandidateSubmissionsTab
                  candidateId={candidate.id}
                  onSubmitToJob={() => setIsSubmitModalOpen(true)}
                />
              )}
              {activeTab === "interviews" && (
                <CandidateInterviewsTab
                  candidateId={candidate.id}
                  onScheduleInterview={() => setIsInterviewModalOpen(true)}
                />
              )}
            </div>
          </div>

          {/* Right: Action Panel */}
          <div className="w-72 flex-shrink-0">
            <div className="sticky top-20">
              <CandidateActionPanel
                candidate={candidate}
                onCandidateUpdate={handleCandidateUpdate}
                onScheduleInterview={() => setIsInterviewModalOpen(true)}
                onSubmitToJob={() => setIsSubmitModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Job Profile Component - Full Screen Layout
 */
export const JobProfile = ({ id, navigate }) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getJob(id)
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch job:", error);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this job? This action cannot be undone.")) return;

    try {
      await deleteJob(id);
      navigate("/jobs");
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  const handleEdit = () => {
    navigate(`/jobs/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading job...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <div className="text-lg font-semibold text-gray-900 mb-2">Job Not Found</div>
          <p className="text-sm text-gray-600 mb-6">
            The job you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/jobs")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <JobProfileHeader 
        job={job}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={() => navigate("/jobs")}
      />
      <JobProfileDetails job={job} />
    </div>
  );
};

/**
 * Client Profile Component - Full Screen Layout
 */
export const ClientProfile = ({ id, navigate }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getClient(id)
      .then((data) => {
        setClient(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch client:", error);
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Delete this client? This action cannot be undone.")) return;

    try {
      await deleteClient(id);
      navigate("/client-list");
    } catch (error) {
      console.error("Failed to delete client:", error);
    }
  };

  const handleEdit = () => {
    navigate(`/client-list/edit/${id}`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">Loading client...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center max-w-md">
          <div className="text-lg font-semibold text-gray-900 mb-2">Client Not Found</div>
          <p className="text-sm text-gray-600 mb-6">
            The client you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => navigate("/client-list")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition"
          >
            Back to Clients
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ClientProfileHeader 
        client={client}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onBack={() => navigate("/client-list")}
      />
      <ClientProfileDetails client={client} />
    </div>
  );
};