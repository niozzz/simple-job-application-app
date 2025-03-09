import logo from "./logo.svg";
import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import JobList from "./page/jobList";
import Home from "./page/Home";
import JobCreate from "./page/job/jobCreate";
import LoginForm from "./page/auth/loginForm";
import { UserProvider } from "./context/userContext";
import AuthGuard from "./authGuard";
import RegisterForm from "./page/auth/registerForm";

function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route
            path="/jobs/*"
            element={
              <AuthGuard>
                <Routes>
                  <Route path="" element={<JobList />} />
                  <Route path="create" element={<JobCreate />} />
                </Routes>
              </AuthGuard>
            }
          />
        </Routes>
      </UserProvider>
    </Router>
  );
}

export default App;
