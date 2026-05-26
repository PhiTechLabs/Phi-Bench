import React, { useState, useEffect } from "react";
import { FaTimes, FaCalendarAlt, FaClock, FaVideo, FaPhone, FaMapMarkerAlt, FaPlus, FaTrash } from "react-icons/fa";

/**
 * ScheduleInterviewModal - Professional full-screen interview scheduling modal
 * Context-aware: Auto-fills candidate data when opened from candidate page
 */
const ScheduleInterviewModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  candidateData = null, // If provided, pre-fill candidate info
  submissions = [] // Available submissions for the candidate
}) => {
  const [formData, setFormData] = useState({
    // Candidate Information
    candidateName: "",
    candidateEmail: "",
    candidatePhone: "",
    
    // Job & Submission
    jobId: "",
    jobTitle: "",
    clientName: "",
    submissionId: "",
    
    // Interview Details
    interviewRound: "Phone Screen",
    interviewType: "Video Call",
    scheduledDate: "",
    scheduledTime: "",
    duration: "60",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    
    // Interviewers
    interviewers: [{ name: "", email: "", role: "" }],
    
    // Meeting Details
    meetingMode: "video",
    meetingLink: "",
    phoneNumber: "",
    address: "",
    
    // Additional Info
    instructions: "",
    internalNotes: "",
    sendCalendarInvite: true,
    sendReminder: true,
    reminderTime: "1 day before"
  });

  const [errors, setErrors] = useState({});

  // Pre-fill candidate data if provided
  useEffect(() => {
    if (candidateData && isOpen) {
      setFormData(prev => ({
        ...prev,
        candidateName: candidateData.name || "",
        candidateEmail: candidateData.email || "",
        candidatePhone: candidateData.phone || ""
      }));
    }
  }, [candidateData, isOpen]);

  // Update meeting mode based on interview type
  useEffect(() => {
    if (formData.interviewType === "Phone Call") {
      setFormData(prev => ({ ...prev, meetingMode: "phone" }));
    } else if (formData.interviewType === "Video Call") {
      setFormData(prev => ({ ...prev, meetingMode: "video" }));
    } else if (formData.interviewType === "In-Person") {
      setFormData(prev => ({ ...prev, meetingMode: "in-person" }));
    }
  }, [formData.interviewType]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleJobChange = (e) => {
    const selectedSubmission = submissions.find(s => s.jobId === e.target.value);
    setFormData(prev => ({
      ...prev,
      jobId: e.target.value,
      jobTitle: selectedSubmission?.jobTitle || "",
      clientName: selectedSubmission?.clientName || "",
      submissionId: selectedSubmission?.id || ""
    }));
  };

  const handleAddInterviewer = () => {
    setFormData(prev => ({
      ...prev,
      interviewers: [...prev.interviewers, { name: "", email: "", role: "" }]
    }));
  };

  const handleRemoveInterviewer = (index) => {
    setFormData(prev => ({
      ...prev,
      interviewers: prev.interviewers.filter((_, i) => i !== index)
    }));
  };

  const handleInterviewerChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      interviewers: prev.interviewers.map((interviewer, i) => 
        i === index ? { ...interviewer, [field]: value } : interviewer
      )
    }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.candidateName) newErrors.candidateName = "Candidate name is required";
    if (!formData.candidateEmail) newErrors.candidateEmail = "Candidate email is required";
    if (!formData.jobId) newErrors.jobId = "Job selection is required";
    if (!formData.scheduledDate) newErrors.scheduledDate = "Interview date is required";
    if (!formData.scheduledTime) newErrors.scheduledTime = "Interview time is required";
    
    if (formData.meetingMode === "phone" && !formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required for phone interviews";
    }
    if (formData.meetingMode === "video" && !formData.meetingLink) {
      newErrors.meetingLink = "Meeting link is required for video interviews";
    }
    if (formData.meetingMode === "in-person" && !formData.address) {
      newErrors.address = "Address is required for in-person interviews";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      candidateName: "",
      candidateEmail: "",
      candidatePhone: "",
      jobId: "",
      jobTitle: "",
      clientName: "",
      submissionId: "",
      interviewRound: "Phone Screen",
      interviewType: "Video Call",
      scheduledDate: "",
      scheduledTime: "",
      duration: "60",
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      interviewers: [{ name: "", email: "", role: "" }],
      meetingMode: "video",
      meetingLink: "",
      phoneNumber: "",
      address: "",
      instructions: "",
      internalNotes: "",
      sendCalendarInvite: true,
      sendReminder: true,
      reminderTime: "1 day before"
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const isFromCandidatePage = !!candidateData;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop - Lighter */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal - Better Positioning */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-16">
        <div className="relative w-full max-w-[1400px] bg-white rounded-lg shadow-2xl z-10 my-8">
          {/* Header - Compact */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-t-lg">
            <div>
              <h2 className="text-xl font-bold text-white">Schedule Interview</h2>
              <p className="text-blue-100 text-xs mt-0.5">
                {isFromCandidatePage ? `For ${candidateData?.name}` : "Create new interview schedule"}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition text-white"
            >
              <FaTimes className="text-lg" />
            </button>
          </div>

          {/* Form - Compact Grid Layout */}
          <form onSubmit={handleSubmit} className="p-6 bg-gray-50 max-h-[calc(100vh-200px)] overflow-y-auto">
            <div className="grid grid-cols-12 gap-4">
              
              {/* LEFT COLUMN (8 cols) - Main Form */}
              <div className="col-span-8 space-y-4">
                
                {/* Candidate Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Candidate Information</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      label="Name"
                      name="candidateName"
                      value={formData.candidateName}
                      onChange={handleChange}
                      error={errors.candidateName}
                      disabled={isFromCandidatePage}
                      required
                      compact
                    />
                    <FormField
                      label="Email"
                      type="email"
                      name="candidateEmail"
                      value={formData.candidateEmail}
                      onChange={handleChange}
                      error={errors.candidateEmail}
                      disabled={isFromCandidatePage}
                      required
                      compact
                    />
                    <FormField
                      label="Phone"
                      type="tel"
                      name="candidatePhone"
                      value={formData.candidatePhone}
                      onChange={handleChange}
                      disabled={isFromCandidatePage}
                      compact
                    />
                  </div>
                </div>

                {/* Job & Client Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Job & Client Details</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <FormSelect
                      label="Job Position"
                      name="jobId"
                      value={formData.jobId}
                      onChange={handleJobChange}
                      error={errors.jobId}
                      required
                      compact
                    >
                      <option value="">Select Job...</option>
                      {submissions.map(sub => (
                        <option key={sub.jobId} value={sub.jobId}>
                          {sub.jobTitle}
                        </option>
                      ))}
                    </FormSelect>
                    <FormField
                      label="Client Name"
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleChange}
                      disabled
                      placeholder="Auto-filled from job"
                      compact
                    />
                  </div>
                </div>

                {/* Interview Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Interview Details</h3>
                  <div className="grid grid-cols-5 gap-3">
                    <FormSelect
                      label="Round"
                      name="interviewRound"
                      value={formData.interviewRound}
                      onChange={handleChange}
                      required
                      compact
                    >
                      <option value="Phone Screen">Phone Screen</option>
                      <option value="Technical Round">Technical</option>
                      <option value="HR Round">HR Round</option>
                      <option value="Manager Round">Manager</option>
                      <option value="Final Round">Final</option>
                      <option value="Client Interview">Client</option>
                      <option value="Panel Interview">Panel</option>
                    </FormSelect>

                    <FormSelect
                      label="Type"
                      name="interviewType"
                      value={formData.interviewType}
                      onChange={handleChange}
                      required
                      compact
                    >
                      <option value="Phone Call">📞 Phone</option>
                      <option value="Video Call">📹 Video</option>
                      <option value="In-Person">🏢 In-Person</option>
                      <option value="Panel">👥 Panel</option>
                    </FormSelect>

                    <FormField
                      label="Date"
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                      onChange={handleChange}
                      error={errors.scheduledDate}
                      required
                      compact
                    />
                    
                    <FormField
                      label="Time"
                      type="time"
                      name="scheduledTime"
                      value={formData.scheduledTime}
                      onChange={handleChange}
                      error={errors.scheduledTime}
                      required
                      compact
                    />
                    
                    <FormSelect
                      label="Duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleChange}
                      compact
                    >
                      <option value="15">15 min</option>
                      <option value="30">30 min</option>
                      <option value="45">45 min</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hrs</option>
                      <option value="120">2 hrs</option>
                    </FormSelect>
                  </div>
                </div>

                {/* Meeting Details */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Meeting Details</h3>
                  {formData.meetingMode === "video" && (
                    <FormField
                      label="Meeting Link"
                      name="meetingLink"
                      value={formData.meetingLink}
                      onChange={handleChange}
                      error={errors.meetingLink}
                      placeholder="https://zoom.us/j/... or Google Meet link"
                      icon={<FaVideo />}
                      required
                      compact
                    />
                  )}
                  {formData.meetingMode === "phone" && (
                    <FormField
                      label="Phone Number"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      error={errors.phoneNumber}
                      placeholder="+1 (555) 123-4567"
                      icon={<FaPhone />}
                      required
                      compact
                    />
                  )}
                  {formData.meetingMode === "in-person" && (
                    <FormField
                      label="Address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      error={errors.address}
                      placeholder="123 Main St, City, State 12345"
                      icon={<FaMapMarkerAlt />}
                      required
                      compact
                    />
                  )}
                </div>

                {/* Additional Information */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Additional Information</h3>
                  <div className="space-y-3">
                    <FormTextarea
                      label="Instructions (Visible to Candidate)"
                      name="instructions"
                      value={formData.instructions}
                      onChange={handleChange}
                      placeholder="Please prepare to discuss..."
                      rows={2}
                      compact
                    />
                    <FormTextarea
                      label="Internal Notes (Private)"
                      name="internalNotes"
                      value={formData.internalNotes}
                      onChange={handleChange}
                      placeholder="Candidate shows strong potential..."
                      rows={2}
                      compact
                    />
                    
                    <div className="flex flex-wrap gap-4 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="sendCalendarInvite"
                          checked={formData.sendCalendarInvite}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-xs font-medium text-gray-700">Send calendar invite</span>
                      </label>
                      
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="sendReminder"
                          checked={formData.sendReminder}
                          onChange={handleChange}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                        <span className="text-xs font-medium text-gray-700">Send reminder</span>
                      </label>
                      
                      {formData.sendReminder && (
                        <select
                          name="reminderTime"
                          value={formData.reminderTime}
                          onChange={handleChange}
                          className="text-xs border border-gray-300 rounded-lg px-2 py-1"
                        >
                          <option value="1 hour before">1 hour before</option>
                          <option value="1 day before">1 day before</option>
                          <option value="2 days before">2 days before</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN (4 cols) - Interviewers */}
              <div className="col-span-4">
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 sticky top-4">
                  <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Interviewers</h3>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {formData.interviewers.map((interviewer, index) => (
                      <div key={index} className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm">
                        <div className="space-y-2">
                          <FormField
                            label="Name"
                            value={interviewer.name}
                            onChange={(e) => handleInterviewerChange(index, "name", e.target.value)}
                            placeholder="John Smith"
                            compact
                            small
                          />
                          <FormField
                            label="Email"
                            type="email"
                            value={interviewer.email}
                            onChange={(e) => handleInterviewerChange(index, "email", e.target.value)}
                            placeholder="john@company.com"
                            compact
                            small
                          />
                          <FormField
                            label="Role"
                            value={interviewer.role}
                            onChange={(e) => handleInterviewerChange(index, "role", e.target.value)}
                            placeholder="Tech Lead"
                            compact
                            small
                          />
                        </div>
                        {formData.interviewers.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveInterviewer(index)}
                            className="mt-2 w-full text-xs text-red-600 hover:bg-red-50 py-1 rounded transition flex items-center justify-center gap-1"
                          >
                            <FaTrash className="text-xs" /> Remove
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddInterviewer}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-blue-300 transition"
                    >
                      <FaPlus /> Add Interviewer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions - Compact */}
            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t">
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 text-sm font-medium shadow-lg shadow-blue-500/30 transition"
              >
                Save & Schedule Interview
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Helper Components - Removed Section, using inline divs now

const FormField = ({ label, error, icon, disabled, required, small, compact, ...props }) => (
  <div>
    {label && (
      <label className={`block ${small ? 'text-[10px]' : compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <div className="relative">
      {icon && (
        <div className={`absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 ${compact ? 'text-xs' : ''}`}>
          {icon}
        </div>
      )}
      <input
        {...props}
        disabled={disabled}
        className={`w-full ${icon ? 'pl-8' : 'px-2'} ${small ? 'py-1 text-xs' : compact ? 'py-1.5 text-sm' : 'py-2'} border ${
          error ? 'border-red-500' : 'border-gray-300'
        } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500`}
      />
    </div>
    {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
  </div>
);

const FormSelect = ({ label, error, required, compact, children, ...props }) => (
  <div>
    {label && (
      <label className={`block ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
    )}
    <select
      {...props}
      className={`w-full px-2 ${compact ? 'py-1.5 text-sm' : 'py-2'} border ${
        error ? 'border-red-500' : 'border-gray-300'
      } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
    >
      {children}
    </select>
    {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
  </div>
);

const FormTextarea = ({ label, compact, ...props }) => (
  <div>
    {label && (
      <label className={`block ${compact ? 'text-xs' : 'text-sm'} font-medium text-gray-700 mb-1`}>
        {label}
      </label>
    )}
    <textarea
      {...props}
      className={`w-full px-2 ${compact ? 'py-1.5 text-sm' : 'py-2'} border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
    />
  </div>
);

export default ScheduleInterviewModal;