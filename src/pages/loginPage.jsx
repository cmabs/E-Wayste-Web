import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase-config";
import "../styleSheet/registerPageStyle.css";
import Logo from "../images/E-Wayste-logo.png";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase Auth

  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent the form from submitting the traditional way
    try {
      const allowedDomain = ".com"; // Set your domain here

      // Check if the entered email ends with the allowed domain
      if (!email.endsWith(allowedDomain)) {
        throw new Error('Email domain not allowed.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
    
      localStorage.setItem('userId', user.uid);

      console.log('Logged in successfully!');
      console.log('User UID:', user.uid); // Use user UID here as needed
      navigate('/Home'); // Navigate to the Home page
      
    } catch (error) {
      console.error('Error logging in: ', error);
      alert('Failed to log in. Please check your credentials.');
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
                type="email"
                required="required"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                //placeholder="Email"
              />
              <p>Email</p>
              <i></i>
            </div>
            <div className="inputBox">
              <input
                type="password"
                required="required"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                //placeholder="Password"
              />
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
