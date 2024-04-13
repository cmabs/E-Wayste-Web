import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import Logo from "../images/E-Wayste-logo.png";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [missingFields, setMissingFields] = useState([]);
  const navigate = useNavigate();

  const handleCreateAccount = async () => {
    const missing = [];
    if (firstName.trim() === "") {
      missing.push("firstName");
    }
    if (lastName.trim() === "") {
      missing.push("lastName");
    }
    if (username.trim() === "") {
      missing.push("username");
    }
    if (email.trim() === "") {
      missing.push("email");
    }
    if (password.trim() === "") {
      missing.push("password");
    }
    if (confirmPassword.trim() === "") {
      missing.push("confirmPassword");
    }
    if (missing.length > 0) {
      setMissingFields(missing);
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      alert("Password must have at least 6 characters");
      return;
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Get the newly created user's UID
      const userId = userCredential.user.uid;

      const newUser = {
        userId,
        firstName,
        lastName,
        username,
        email,
        password
      };
      const docRef = await addDoc(collection(db, "usersAdmin"), newUser);

      console.log("User account created successfully! User ID:", userId);
      alert("User account created successfully!");
      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      navigate("/Login"); // Redirect to login page after successful registration
    } catch (error) {
      console.error("Error creating user account: ", error);
      alert("Failed to create user account. Please try again.");
    }
  };
  return ( 
    <> 
      <div className="registerPage"> 
        <div className="areaForm"> 
          <div className="form"> 
            <h1 style={{ fontFamily: 'inter', fontSize: 35, color: 'rgb(81,175,91)', marginLeft: -3, marginBottom: -15 }}>Welcome</h1> 
            <h2 style={{ fontFamily: 'inter', fontSize: 20, color: 'rgb(136,132,132)', marginBottom: 40 }}>Create an Admin Account</h2> 
            <div className="inputBox"> 
              <input type="text" name="firstName" required="required" value={firstName} onChange={(e) => setFirstName(e.target.value)} /> 
              <p>First Name{missingFields.includes("firstName") && <span style={{ color: 'red' }}>*</span>}</p> 
              <i></i> 
            </div> 
            <div className="inputBox"> 
              <input type="text" name="lastName" required="required" value={lastName} onChange={(e) => setLastName(e.target.value)} /> 
              <p>Last Name{missingFields.includes("lastName") && <span style={{ color: 'red' }}>*</span>}</p> 
              <i></i> 
            </div> 
            <div className="inputBox"> 
              <input type="text" name="username" required="required" value={username} onChange={(e) => setUsername(e.target.value)} /> 
              <p>Username{missingFields.includes("username") && <span style={{ color: 'red' }}>*</span>}</p> 
              <i></i> 
            </div> 
            <div className="inputBox"> 
              <input type="text" name="email" required="required" value={email} onChange={(e) => setEmail(e.target.value)} /> 
              <p>Email Address{missingFields.includes("email") && <span style={{ color: 'red' }}>*</span>}</p> 
              <i></i> 
            </div> 
            <div className="inputBox"> 
              <input type="password" name="password" required="required" value={password} onChange={(e) => setPassword(e.target.value)} /> 
              <p>Password{missingFields.includes("password") && <span style={{ color: 'red' }}>*</span>}</p> 
              <i></i> 
            </div> 
            <div className="inputBox"> 
              <input type="password" name="confirmPassword" required="required" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /> 
              <p>Confirm Password{missingFields.includes("confirmPassword") && <span style={{ color: 'red' }}>*</span>}</p> 
              <i></i> 
            </div> 
            <div style={{ marginTop: 50 }}> 
              <button className="accountB1" onClick={handleCreateAccount}>Create Account</button> 
            </div> 
            <p style={{ marginTop: 20, textAlign: 'center', fontFamily: 'inter' }}> 
              Already have an account?  
              <NavLink to="/Login" style={{ color: 'rgb(81,175,91)', textDecoration: 'underline', marginLeft: 5 }}> 
                <b>Sign in</b> 
              </NavLink> 
            </p> 
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