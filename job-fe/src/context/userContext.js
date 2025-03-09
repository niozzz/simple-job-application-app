// UserContext.js
import { createContext, useState } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = async (username, password) => {
    try {
      const response = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      localStorage.setItem("token", data.token);

      // tidak disarankan untuk production
      localStorage.setItem("role", data.role);

      setUser({ token: data.token, role: data.role });
    } catch (error) {
      console.error("Error logging in:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, login }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
