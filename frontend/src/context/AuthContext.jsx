import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('app_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    const authData = btoa(`${username}:${password}`);
    const apiUrl = import.meta.env.VITE_API_URL;

    try {
      const res = await fetch(`${apiUrl}/auth/me`, {
        headers: { 'Authorization': `Basic ${authData}` }
      });
      console.log("Res status:", res.status);

      if (res.ok) {
        const authInfo = await res.json();
        
        const authorities = authInfo.authorities.map(a => a.authority);
        
        const userData = { 
          username, 
          authData, 
          roles: authorities.filter(a => a.startsWith('ROLE_')),
          permissions: authorities.filter(a => !a.startsWith('ROLE_'))
        }; 

        setUser(userData);
        localStorage.setItem('app_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, status: res.status };
      }
    } catch (err) {
      console.error("Login error:", err);
      return { success: false, message: "Servera kļūda" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('app_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);