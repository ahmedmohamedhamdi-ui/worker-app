import React, { useState } from "react";
import { auth } from "../../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

export default function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("تم التسجيل بنجاح ✅");
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("تم تسجيل الدخول ✅");
      setIsLoggedIn(true);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "70vh" }}
    >
      <div className="card shadow-lg p-4" style={{ width: "350px" }}>
        <h3 className="text-center mb-4" style={{ color: "white" }}>
          تسجيل الدخول / إنشاء حساب
        </h3>
        <input
          type="email"
          className="form-control mb-3"
          placeholder="الإيميل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="form-control mb-3"
          placeholder="الباسورد"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="d-flex justify-content-between">
          <button className="btn btn-success w-50 me-2" onClick={register}>
            تسجيل
          </button>
          <button className="btn btn-primary w-50" onClick={login}>
            دخول
          </button>
        </div>
      </div>
    </div>
  );
}
