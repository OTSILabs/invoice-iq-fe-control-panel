import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Layout } from "./components/layout"
import { LoginPage } from "./components/Login/login-page"
import { APP_ROUTES } from "./config/routes"

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          {APP_ROUTES.map((route) => (
            <Route 
              key={route.path} 
              path={route.path.replace(/^\//, '')} // Remove leading slash for nested routes
              element={<route.component />} 
            />
          ))}
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
