import React, { useState, useEffect } from "react";
import { FaTimes, FaBriefcase, FaBuilding, FaMapMarkerAlt, FaEnvelope, FaPhone, FaUser, FaCalendar } from "react-icons/fa";
import { createSubmission } from "../../api/submissionsApi";

/**
 * SubmitToJobModal - Professional modal for submitting candidate to a job
 * Clean, minimalist design matching Ceipal ATS standards
 */
const SubmitToJobModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  candidateData = null,
  jobs = []
}) => {
  const [formData, setFormData] = useState({
    candidateId: "",
    candidateName: "",
    candidateEmail: "",
    jobId: "",
    jobTitle: "",
    clientId: "",
    clientName: "",
    status: "Submitted",
    recruiterNotes: "",
    submittedDate: new Date().toISOString().split('T')[0]
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Pre-fill candidate data if provided
  useEffect(() => {
    if (candidateData && isOpen) {
      setFormData(prev => ({
        ...prev,
        candidateId: candidateData.id || candidateData._id,
        candidateName: candidateData.name || "",
        candidateEmail: candidateData.email || ""
      }));
    }
  }, [candidateData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleJobChange = (e) => {
    const selectedJob = jobs.find(j => (j.id || j._id) === e.target.value);
    setFormData(prev => ({
      ...prev,
      jobId: e.target.value,
      jobTitle: selectedJob?.title || "",
      clientId: selectedJob?.clientId || "",
      clientName: selectedJob?.clientName || ""
    }));
    if (errors.jobId) {
      setErrors(prev => ({ ...prev, jobId: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.candidateName.trim()) {
      newErrors.candidateName = "Candidate name is required";
    }
    if (!formData.jobId) {
      newErrors.jobId = "Please select a job position";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const submission = await createSubmission(formData);
      if (onSubmit) onSubmit(submission);
      handleClose();
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitError("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      candidateId: "",
      candidateName: "",
      candidateEmail: "",
      jobId: "",
      jobTitle: "",
      clientId: "",
      clientName: "",
      status: "Submitted",
      recruiterNotes: "",
      submittedDate: new Date().toISOString().split('T')[0]
    });
    setErrors({});
    setSubmitError("");
    onClose();
  };

  if (!isOpen) return null;

  const isFromCandidatePage = !!candidateData;

  // Get initials for avatar
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Professional Backdrop - Subtle blur */}
      <div 
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Modal Container */}
      <div className="flex min-h-screen items-start justify-center p-6 pt-20">
        <div className="relative w-full max-w-5xl bg-white rounded-lg shadow-xl">
          
          {/* Header - Clean and Professional */}
          <div className="flex items-center justify-between px-8 py-5 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Submit Candidate to Job</h2>
              <p className="text-sm text-gray-500 mt-1">Review details and submit for consideration</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-400 hover:text-gray-600"
              aria-label="Close"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-8">
            
            {/* Candidate Card - Same as profile */}
            {isFromCandidatePage && candidateData && (
              <div className="mb-6">
                <div className="flex gap-4">
                  <label className="text-sm font-medium text-gray-700 w-40 flex items-center gap-2">
                    <FaUser className="text-gray-400 text-sm" />
                    Candidate
                  </label>
                  <div className="flex-1">
                    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                      <span className="text-white font-semibold text-lg">
                        {getInitials(candidateData.name)}
                      </span>
                    </div>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-base font-semibold text-gray-900">
                          {candidateData.name}
                        </h3>
                        {candidateData.status && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded bg-orange-100 text-orange-700 border border-orange-200">
                            {candidateData.status}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{candidateData.title}</p>
                      
                      {/* Contact Details */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        {candidateData.email && (
                          <div className="flex items-center gap-1.5">
                            <FaEnvelope className="text-gray-400" />
                            <span>{candidateData.email}</span>
                          </div>
                        )}
                        {candidateData.phone && (
                          <div className="flex items-center gap-1.5">
                            <FaPhone className="text-gray-400" />
                            <span>{candidateData.phone}</span>
                          </div>
                        )}
                        {candidateData.location && (
                          <div className="flex items-center gap-1.5">
                            <FaMapMarkerAlt className="text-gray-400" />
                            <span>{candidateData.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

            {/* Job Selection Section */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-40 flex items-center gap-2">
                  <FaBriefcase className="text-gray-400 text-sm" />
                  Job Position <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobId"
                  value={formData.jobId}
                  onChange={handleJobChange}
                  className={`flex-1 px-4 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    errors.jobId 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100' 
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-100'
                  }`}
                >
                  <option value="">Select a job position...</option>
                  {jobs.map(job => (
                    <option key={job.id || job._id} value={job.id || job._id}>
                      {job.title}
                    </option>
                  ))}
                </select>
              </div>
              {errors.jobId && (
                <p className="text-xs text-red-600 mt-1.5 ml-44">{errors.jobId}</p>
              )}
            </div>

            {/* Client Info - Auto-filled */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-40 flex items-center gap-2">
                  <FaBuilding className="text-gray-400 text-sm" />
                  Client Company
                </label>
                <div className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50">
                  <span className="text-sm text-gray-700 font-medium">
                    {formData.clientName || "Auto-filled from selected job"}
                  </span>
                </div>
              </div>
            </div>

            {/* Submission Date and Status */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              {/* Submission Date */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-40 flex items-center gap-2">
                  <FaCalendar className="text-gray-400 text-sm" />
                  Submission Date
                </label>
                <input
                  type="date"
                  name="submittedDate"
                  value={formData.submittedDate}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Status */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700 w-32 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Offer Extended">Offer Extended</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                </select>
              </div>
            </div>

            {/* Recruiter Notes */}
            <div className="mb-6">
              <div className="flex gap-4">
                <label className="text-sm font-medium text-gray-700 w-40 flex items-center gap-2 pt-3">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Recruiter Notes
                </label>
                <div className="flex-1">
                  <textarea
                    name="recruiterNotes"
                    value={formData.recruiterNotes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add any relevant notes about this submission..."
                    className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-100 transition-all resize-none"
                  />
                  <p className="text-xs text-gray-500 mt-1.5">These notes are internal and won't be shared with the candidate</p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
              {submitError && (
                <p className="text-sm text-red-600 mr-auto">{submitError}</p>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <FaBriefcase className="text-sm" />
                    <span>Submit Candidate</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitToJobModal;