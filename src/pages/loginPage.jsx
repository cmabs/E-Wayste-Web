import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase-config";
import { getDocs, collection, query, where } from 'firebase/firestore';
import "../styleSheet/registerPageStyle.css";
import Logo from "../images/E-Wayste-logo.png";

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(); // Initialize Firebase Auth

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Check if the entered identifier is an email or username
      const isEmail = identifier.includes('@');
      const userCredential = isEmail
        ? await signInWithEmailAndPassword(auth, identifier, password)
        : await signInWithUsernameAndPassword(identifier, password);

      const user = userCredential.user;
      console.log('Logged in successfully!');
      console.log('User UID:', user.uid);
      navigate('/Home');
    } catch (error) {
      console.error('Error logging in: ', error);
      alert('Failed to log in. Please check your credentials.');
    }
  };

  // Create a custom authentication method for username/password
  const signInWithUsernameAndPassword = async (username, password) => {
    try {
      // Query the 'usersAdmin' collection for the provided username
      const usersRef = collection(db, 'usersAdmin');
      const q = query(usersRef, where('username', '==', username));
      const querySnapshot = await getDocs(q);

      // Check if a user with the provided username exists
      if (querySnapshot.docs.length === 0) {
        throw new Error('User not found');
      }

      // Get the first user from the query result
      const userData = querySnapshot.docs[0].data();

      // Use signInWithEmailAndPassword with the user's email and provided password
      const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);

      return userCredential;
    } catch (error) {
      throw error;
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
                required="required"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
