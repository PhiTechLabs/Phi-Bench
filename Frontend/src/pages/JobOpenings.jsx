import React, { useState, useEffect } from "react";
import JobForm from "./JobForm";

const JobOpenings = () => {
  const [showForm, setShowForm] = useState(false);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("jobs")) || [];
    setJobs(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("jobs", JSON.stringify(jobs));
  }, [jobs]);

  const handleSave = (data) => {
    const newJob = {
      id: Date.now(),
      ...data,
    };

    setJobs([newJob, ...jobs]);
    setShowForm(false);
  };

  if (showForm) {
    return <JobForm setShowForm={setShowForm} onSave={handleSave} />;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Job Openings</h1>

        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          + Add Job
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500">
            <tr>
              <th className="px-5 py-3 text-left">Title</th>
              <th className="px-5 py-3 text-left">Client</th>
              <th className="px-5 py-3 text-left">Experience</th>
              <th className="px-5 py-3 text-left">Status</th>
            </tr>
          </thead>

          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="border-t">
                <td className="px-5 py-4">{j.title}</td>
                <td className="px-5 py-4">{j.client}</td>
                <td className="px-5 py-4">{j.experience}</td>
                <td className="px-5 py-4">{j.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default JobOpenings;