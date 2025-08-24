import React from "react";
import "./home.css";
import { Navbar } from "../Navbar/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Workers } from "../Workers/Workers";
import { NavLink } from "react-router-dom";
import { Addworker } from "../Addworker/Addworker";

import Login from "../Login/Login";

export const Home = () => {
  return (
    <>
      <Router>
        <header>
          <div className="logo">
            <img
              src="https://mag-sa.com/wp-content/uploads/2024/05/Logo-3.svg"
              alt=""
            />
            <NavLink to="/">الصفحة الرئيسية</NavLink>
          </div>
        </header>
        <Navbar />

        <Routes>
          <Route path="/workers" element={<Workers />} />
          <Route path="/" element={<div></div>} />
          <Route path="/addworker" element={<Addworker />} />
        </Routes>
      </Router>
      <Login />
    </>
  );
};
