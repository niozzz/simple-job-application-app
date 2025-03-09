// JobList.js
import React, { useState, useEffect } from "react";
import axios from "axios"; // Import Axios
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // akan hilang jika browser di-refresh
  //   const { user } = useContext(UserContext);

  const userRole = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login", { replace: true });
  };

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
          if (error.response.status === 401 || error.response.status === 403) {
            // Redirect to login page if unauthorized or forbidden
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
        />
        <div className="ml-4">
          <select className="p-2 pl-10 text-sm text-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600">
            <option value="all">All Locations</option>
            <option value="new-york">New York</option>
            <option value="los-angeles">Los Angeles</option>
          </select>
        </div>
      </div>
      {jobs.map((job) => (
        <div key={job.id} className="bg-white shadow-md rounded-lg p-6 mb-4">
          <h2 className="text-2xl font-bold mb-2">{job.title}</h2>
          <p className="text-gray-600 mb-2">Company: {job.companyName}</p>
          <p className="text-gray-600 mb-2">Location: {job.location}</p>
          <p className="text-gray-600 mb-2">Salary Range: {job.salaryRange}</p>
          <p className="text-gray-600 mb-4">{job.description}</p>
          <div className="flex justify-end">
            {userRole === "jobSeeker" && (
              <Link to={`/jobs/${job.id}/apply`}>
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Apply
                </button>
              </Link>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default JobList;
