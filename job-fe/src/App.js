import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JobList from "./page/jobList";
import Home from "./page/Home";
import JobCreate from "./page/job/jobCreate";
import LoginForm from "./page/auth/loginForm";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/create" element={<JobCreate />} />
        {/* <Route path="/jobs/:jobId" element={<JobDetails />} /> */}

        <Route path="/login" element={<LoginForm />} />
      </Routes>
    </Router>
  );
}

export default App;
