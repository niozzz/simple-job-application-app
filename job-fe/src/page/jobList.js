// JobList.js
import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import { Link } from "react-router-dom";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Use Axios to make the request
        const response = await axios.get("http://localhost:4000/api/jobs");
        console.log(response);
        setJobs(response.data.data); // Axios returns data directly
        setLoading(false);
      } catch (error) {
        // Handle Axios error
        if (error.response) {
          setError(error.response.data);
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

  return (
    <div className="max-w-5xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-4">Job Listings</h1>
      <Link to="/jobs/create">
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-4">
          Create Job
        </button>
      </Link>
      {jobs.map((job) => (
        <div key={job.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
          <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
          <p className="text-gray-600 mb-2">Company: {job.companyName}</p>
          <p className="text-gray-600 mb-2">Location: {job.location}</p>
          <p className="text-gray-600 mb-2">Salary Range: {job.salaryRange}</p>
          <p className="text-gray-600 mb-4">{job.description}</p>
          <Link to={`/jobs/${job.id}/apply`}>
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Apply
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default JobList;
