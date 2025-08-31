import React, { useState } from "react";
import "./home.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import Workers from "../Workers/Workers";
import { Addworker } from "../Addworker/Addworker";
import Login from "../Login/Login";
import { Housingdata } from "../Housingdata/Housingdata";

export const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <header>
        <div className="logo">
          <img
            src="https://mag-sa.com/wp-content/uploads/2024/05/Logo-3.svg"
            alt="Logo"
          />
          <h1 className="logo-text">
            إدارة بيانات العمال لشركة المجال العربي بالمنطقة الغربية
          </h1>
        </div>
      </header>

      <div className="cards-container">
        <Card title="بيانات العمال" path="/workers" />
        {isLoggedIn && <Card title="إضافة عامل جديد" path="/addworker" />}
        <Card title="بيانات السكنات" path="/houses" />
        {isLoggedIn && <Card title="إضافة سكن جديد" path="/addhouse" />}
        {!isLoggedIn && <Card title="تسجيل الدخول" path="/login" />}
      </div>

      <Routes>
        <Route
          path="/workers"
          element={
            <Workers isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          }
        />
        <Route
          path="/addworker"
          element={
            isLoggedIn ? <Addworker /> : <Login setIsLoggedIn={setIsLoggedIn} />
          }
        />
        <Route
          path="/login"
          element={<Login setIsLoggedIn={setIsLoggedIn} />}
        />
        <Route path="/houses" element={<Housingdata />} />
      </Routes>
    </Router>
  );
};

const Card = ({ title, path }) => {
  const navigate = useNavigate();
  return (
    <div className="card" onClick={() => navigate(path)}>
      <h2>{title}</h2>
    </div>
  );
};
