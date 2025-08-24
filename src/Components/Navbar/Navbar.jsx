import React from "react";
import { NavLink } from "react-router-dom";
import "./navbar.css";

export const Navbar = () => {
  return (
    <div>
      <div className="navbar justify-content-space-evenly">
        <li className="nav-item">
          <NavLink to="/workers" className="nav-link">
            بيانات العمال
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/addworker" className="nav-link">
            اضافة عمل جديد
          </NavLink>
        </li>
      </div>
    </div>
  );
};
