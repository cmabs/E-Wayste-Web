import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase-config";
import "../styleSheet/registerPageStyle.css";
import Logo from "../images/E-Wayste-logo.png";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const userQuery = query(
        collection(db, "usersAdmin"),
        where("username", "==", username),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(userQuery);
      const users = querySnapshot.docs.map((doc) => {
        const userData = doc.data();
        return {
          id: doc.id,
          ...userData,
        };
      });
      if (users.length === 0) {
        alert("User not found. Please check your credentials.");
        return;
      }
      const loggedInUser = users[0];
      console.log("Logged in successfully! User ID:", loggedInUser.id);
      // Log the usersAdmin ID to the console
      console.log("usersAdmin ID:", loggedInUser.id);
      navigate("/Home");
    } catch (error) {
      console.error("Error logging in: ", error);
      alert("Failed to log in. Please check your credentials.");
    }
  };

  return (
    <>
      <div className="registerPage">
        <div className="areaForm">
          <div className="form">
            <h1
              style={{
                fontFamily: "inter",
                fontSize: 35,
                color: "rgb(81,175,91)",
                marginLeft: -3,
                marginBottom: -15,
              }}
            >
              Welcome
            </h1>
            <h2
              style={{
                fontFamily: "inter",
                fontSize: 20,
                color: "rgb(136,132,132)",
                marginBottom: 40,
              }}
            >
              Log into an Account
            </h2>
            <div className="inputBox">
              <input
                type="text"
                required="required"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <p>Username</p>
              <i></i>
            </div>
            <div className="inputBox"> 
              <input type="password" required="required" value={password} onChange={(e) => setPassword(e.target.value)} />
              <p>Password</p>
              <i></i>
            </div>
            <div style={{ marginTop: 50 }}>
              <button className="accountB1" onClick={handleLogin}>
                Sign in
              </button>
              <p style={{ marginTop: 20, textAlign: "center", fontSize: 14, fontFamily: "inter"}}>
                Already have an account?{" "}
                <NavLink to="/register" style={{ color: 'rgb(81,175,91)', textDecoration: "underline", fontWeight: "bold"}}>
                  Sign Up
                </NavLink>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="formSideDesign">
        <div className="containLogo2">
          <img src={Logo} alt="logo" className="imgLogo2" />
        </div>
        <h1 className="titleLogo2">E-Wayste</h1>
      </div>
    </>
  );
}