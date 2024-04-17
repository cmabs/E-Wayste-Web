import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { db } from "../firebase-config";
import "../styleSheet/registerPageStyle.css";
import Logo from "../images/E-Wayste-logo.png";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const auth = getAuth(); 

  const handleLogin = async (e) => {
    e.preventDefault(); 
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("email", "==", user.email));
      const querySnapshot = await getDocs(q);
  
      let allowedAccountType = false;
      querySnapshot.forEach((doc) => {
        if (doc.data().accountType === 'LGU / Waste Management Head') {
          allowedAccountType = true;
        }
      });
  
      if (!allowedAccountType) {
        console.log('User does not have the required account type.');
        alert('You do not have permission to log in. Please contact an administrator.');
        return; 
      }
      localStorage.setItem('userId', user.email);
      console.log('Logged in successfully!');
      console.log('User Email:', user.email); 
      try {
        navigate('/Home');
      } catch (navigationError) {
        console.error('Error navigating to Home:', navigationError);
        alert('Failed to navigate to Home page. Please try again.');
      }
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
