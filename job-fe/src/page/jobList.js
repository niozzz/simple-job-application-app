import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function formatApplicationDate(isoDate) {
  if (!isoDate) return "Unknown date";
  try {
    const parsedDate = new Date(isoDate.replace("Z", "+00:00").split(".")[0]);
    const utcPlus7Date = new Date(parsedDate.getTime() + 7 * 60 * 60 * 1000);

    const hours = utcPlus7Date.getHours().toString().padStart(2, "0");
    const minutes = utcPlus7Date.getMinutes().toString().padStart(2, "0");
    const day = utcPlus7Date.getDate().toString().padStart(2, "0");
    const month = (utcPlus7Date.getMonth() + 1).toString().padStart(2, "0");
    const year = utcPlus7Date.getFullYear();

    return `${hours}:${minutes} ${day}-${month}-${year}`;
  } catch (error) {
    console.error("Date formatting error:", error);
    return "Invalid date";
  }
}

// Updated function to handle both "9000000" and "1000000 - 2000000" formats
function extractSalaryRange(salaryString) {
  if (!salaryString) return { min: 0, max: 0 };

  // Convert to string to ensure we can process it
  const salaryText = String(salaryString).trim();

  // Check if it has a range format (contains a dash)
  if (salaryText.includes("-")) {
    const parts = salaryText.split("-").map((part) => part.trim());
    const min = parseInt(parts[0].replace(/[^0-9]/g, "")) || 0;
    const max = parseInt(parts[1].replace(/[^0-9]/g, "")) || 0;
    return { min, max };
  }

  // Single value format
  const singleValue = parseInt(salaryText.replace(/[^0-9]/g, "")) || 0;
  return { min: singleValue, max: singleValue };
}

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [minSalary, setMinSalary] = useState(0);
  const [maxSalary, setMaxSalary] = useState(10000000); // Increased max for Indonesian salary ranges
  const navigate = useNavigate();

  const userRole = localStorage.getItem("role");
  const userId = parseInt(localStorage.getItem("userId"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    navigate("/login", { replace: true });
  };

  const handleApply = async (jobId) => {
    try {
      const applicationDate = new Date().toISOString();

      const response = await axios.post(
        `http://localhost:4000/api/jobs/${jobId}/apply`,
        {
          userId,
          applicationDate,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Job application submitted successfully!");
      setHasApplied((prevHasApplied) => ({
        ...prevHasApplied,
        [jobId]: { isApplied: true, applicationDate },
      }));
    } catch (error) {
      console.error("Error applying for the job:", error);
      alert("Error applying for the job. Please try again.");
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/jobs");
        console.log("Fetched Jobs:", response.data.data); // Log for debugging
        setJobs(response.data.data);

        const appliedResponse = await axios.get(
          "http://localhost:4000/api/applies"
        );
        const applies = appliedResponse.data.data;

        const appliedStatus = response.data.data.reduce((acc, job) => {
          const applyRecord = applies.find(
            (apply) => apply.jobId === job.id && apply.userId === userId
          );
          acc[job.id] = applyRecord
            ? { isApplied: true, applicationDate: applyRecord.applicationDate }
            : { isApplied: false, applicationDate: null };
          return acc;
        }, {});

        setHasApplied(appliedStatus);
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        if (error.response) {
          if (error.response.status === 401 || error.response.status === 403) {
            navigate("/login");
          } else {
            setError(error.response.data);
          }
        } else if (error.request) {
          setError("No response received");
        } else {
          setError(error.message);
        }
        setLoading(false);
      }
    };
    fetchJobs();
  }, [navigate, userId]);

  // Process and normalize job data for consistent filtering
  const processedJobs = useMemo(() => {
    return jobs.map((job) => {
      const normalizedSalary = extractSalaryRange(job.salaryRange);
      return {
        ...job,
        normalizedSalary,
      };
    });
  }, [jobs]);

  // Filter jobs based on criteria
  const filteredJobs = useMemo(() => {
    return processedJobs.filter((job) => {
      // Search match
      const searchMatch =
        !searchQuery ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Location match
      const locationMatch =
        selectedLocation === "all" || job.location === selectedLocation;

      // Salary match - check for overlap between the ranges
      const salary = job.normalizedSalary;
      const salaryMatch = salary.min <= maxSalary && salary.max >= minSalary;

      return searchMatch && locationMatch && salaryMatch;
    });
  }, [processedJobs, searchQuery, selectedLocation, minSalary, maxSalary]);

  const uniqueLocations = useMemo(() => {
    if (loading) return [];
    return [...new Set(jobs.map((job) => job.location))];
  }, [jobs, loading]);

  if (loading) return <div className="text-center py-10">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold">Job Listings</h1>
      <p className="text-gray-600 mb-4">Role: {userRole}</p>

      {/* Header actions */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          {userRole === "employer" && (
            <Link to="/jobs/create">
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                Create Job
              </button>
            </Link>
          )}
        </div>
        <button
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-semibold mb-3">Filter Jobs</h2>

        {/* Search filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Jobs
          </label>
          <input
            type="search"
            placeholder="Search by title, company or description"
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Location filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <select
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="all">All Locations</option>
            {uniqueLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Salary range filter */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Salary Range: Rp {minSalary.toLocaleString()} - Rp{" "}
            {maxSalary.toLocaleString()}
          </label>
          <div className="flex items-center mb-2">
            <span className="text-xs text-gray-500 w-20">
              Min: Rp {minSalary.toLocaleString()}
            </span>
            <input
              type="range"
              min="0"
              max="10000000"
              step="500000"
              value={minSalary}
              onChange={(e) => {
                const newMinSalary = parseInt(e.target.value);
                setMinSalary(newMinSalary);
                if (newMinSalary > maxSalary) {
                  setMaxSalary(newMinSalary);
                }
              }}
              className="w-full mx-2"
            />
          </div>
          <div className="flex items-center">
            <span className="text-xs text-gray-500 w-20">
              Max: Rp {maxSalary.toLocaleString()}
            </span>
            <input
              type="range"
              min="0"
              max="10000000"
              step="500000"
              value={maxSalary}
              onChange={(e) => {
                const newMaxSalary = parseInt(e.target.value);
                setMaxSalary(newMaxSalary);
                if (newMaxSalary < minSalary) {
                  setMinSalary(newMaxSalary);
                }
              }}
              className="w-full mx-2"
            />
          </div>
        </div>
      </div>

      {/* Job list results */}
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">
          {filteredJobs.length} {filteredJobs.length === 1 ? "Job" : "Jobs"}{" "}
          Found
        </h2>
      </div>

      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-600">No jobs found matching your criteria.</p>
          <button
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              setSearchQuery("");
              setSelectedLocation("all");
              setMinSalary(0);
              setMaxSalary(10000000);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        filteredJobs.map((job) => (
          <div key={job.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
            <p className="text-gray-600 mb-2">Company: {job.companyName}</p>
            <p className="text-gray-600 mb-2">Location: {job.location}</p>
            <p className="text-gray-600 mb-2">
              Salary:{" "}
              {job.salaryRange.includes("-")
                ? `Rp ${job.normalizedSalary.min.toLocaleString()} - Rp ${job.normalizedSalary.max.toLocaleString()}`
                : `Rp ${job.normalizedSalary.min.toLocaleString()}`}
            </p>
            <p className="text-gray-600 mb-4">{job.description}</p>
            <div className="flex justify-end">
              {userRole === "jobSeeker" &&
                (hasApplied[job.id] && hasApplied[job.id].isApplied ? (
                  <p className="text-gray-600 font-bold">
                    Applied on{" "}
                    {formatApplicationDate(hasApplied[job.id].applicationDate)}
                  </p>
                ) : (
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleApply(job.id)}
                  >
                    Apply
                  </button>
                ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default JobList;
