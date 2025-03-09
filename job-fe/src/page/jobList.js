import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function formatApplicationDate(isoDate) {
  // Remove milliseconds and 'Z', then parse the date
  const parsedDate = new Date(isoDate.replace("Z", "+00:00").split(".")[0]);

  // Add 7 hours to convert to UTC+7
  const utcPlus7Date = new Date(parsedDate.getTime() + 7 * 60 * 60 * 1000);

  // Format the date to H:M DD-MM-YYYY
  const hours = utcPlus7Date.getHours().toString().padStart(2, "0");
  const minutes = utcPlus7Date.getMinutes().toString().padStart(2, "0");
  const day = utcPlus7Date.getDate().toString().padStart(2, "0");
  const month = (utcPlus7Date.getMonth() + 1).toString().padStart(2, "0");
  const year = utcPlus7Date.getFullYear();

  return `${hours}:${minutes} ${day}-${month}-${year}`;
}

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasApplied, setHasApplied] = useState({}); // Track application status
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("all");
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
      // Update hasApplied state
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
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const uniqueLocations = loading
    ? []
    : [...new Set(jobs.map((job) => job.location))];

  // Filter jobs based on search query and selected location
  const filteredJobs = jobs.filter((job) => {
    const searchMatch =
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    const locationMatch =
      selectedLocation === "all" || job.location === selectedLocation;
    return searchMatch && locationMatch;
  });

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-bold ">Job Listings</h1>
      <p className="text-gray-600 mb-4">Role: {userRole}</p>
      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          {userRole === "employer" && (
            <Link to="/jobs/create">
              <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ">
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
      <div className="flex mb-4">
        <input
          type="search"
          placeholder="Search jobs"
          className="w-full p-2 pl-10 text-sm text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="ml-4">
          <select
            className="p-2 pl-10 text-sm text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600"
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
      </div>
      {filteredJobs.map((job) => (
        <div key={job.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
          <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
          <p className="text-gray-600 mb-2">Company: {job.companyName}</p>
          <p className="text-gray-600 mb-2">Location: {job.location}</p>
          <p className="text-gray-600 mb-2">Salary Range: {job.salaryRange}</p>
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
      ))}
    </div>
  );
};

export default JobList;
