import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, } from "react-router-dom"; 
import '../styleSheet/homePageStyle.css';
import Logo from '../images/E-Wayste-logo.png';
import Dashboard from "../tabs/dashTab";
import UserManage from "../tabs/manageTab";
import Report from "../tabs/reportTab";
import Map from "../tabs/mapTab";
import Schedule from "../tabs/schedTab";
import Profile from "../tabs/userProfile";
import { RxDashboard } from 'react-icons/rx';
import { MdPersonOutline, MdAccountCircle } from 'react-icons/md';
import { TbReportAnalytics } from 'react-icons/tb';
import { FaRegMap } from 'react-icons/fa';
import { BiCalendar } from 'react-icons/bi';
import { IoLogOutOutline } from 'react-icons/io5';
import { MdLibraryBooks } from 'react-icons/md';
import userlogo from '../images/userlogo.png'; 
import { auth, db } from '../firebase-config';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore"; // Import needed Firestore functions

export default function Home() {
  const [sideNavlink, setSideNavlink] = useState('option1');
  const [openTab, setOpenTab] = useState(<Dashboard />);
  
  const navigate = useNavigate();


  const handleNavClick = (option) => {
      setSideNavlink(option);
      switch (option) {
          case 'option1':
              setOpenTab(<Dashboard />);
              break;
          case 'option2':
              setOpenTab(<UserManage />);
              break;
          case 'option3':
              setOpenTab(<Report />);
              break;
          case 'option4':
              setOpenTab(<Map />);
              break;
          case 'option5':
              setOpenTab(<Schedule />);
              break;
          case 'option6':
              setOpenTab(<Profile />);
              break;
          default:
              setOpenTab(null);
      }
  };

  const handleLogout = () => { 
    navigate("/"); 
  };

  const [userProfile, setUserProfile] = useState(null);
    
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                // User is signed in, fetch user profile
                fetchUserProfile(user);
            } else {
                // No user is signed in, redirect to login
                navigate("/login");
            }
        });

        // Fetch user profile function moved inside useEffect
        const fetchUserProfile = async (user) => {
            try {
                if (user) {
                    const userEmail = user.email;
                    const userRef = query(collection(db, "usersAdmin"), where('email', '==', userEmail));
                    const querySnapshot = await getDocs(userRef);
                    if (!querySnapshot.empty) {
                        const doc = querySnapshot.docs[0];
                        const { firstName, lastName } = doc.data();
                        const displayName = `${firstName} ${lastName}`;
                        setUserProfile({ displayName });
                    } else {
                        console.log("User profile not found");
                    }
                } else {
                    console.log("No user is currently signed in");
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        return () => unsubscribe(); // Cleanup subscription
    }, [navigate]);

  
  return (
    <>
      <div className="homePage">
        <div className="sideNav">
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 }}>
            <div className="containLogo3">
              <img src={Logo} alt="logo" className="imgLogo3" />
            </div>
            <h1 className="titleLogo3">E-Wayste</h1>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 15, gap: 6 }}> {/* Adjusted marginTop */}
            <div className="divNavB">
              <button className={sideNavlink === 'option1' ? 'activeB' : 'inactiveB'} onClick={() => handleNavClick('option1')}><RxDashboard style={{ fontSize: '1.5em' }} />Dashboard</button>
            </div>
            <div className="divNavB">
              <button className={sideNavlink === 'option2' ? 'activeB' : 'inactiveB'} onClick={() => handleNavClick('option2')}><MdPersonOutline style={{ fontSize: '1.5em' }} />User Management</button>
            </div>
            <div className="divNavB">
              <button className={sideNavlink === 'option3' ? 'activeB' : 'inactiveB'} onClick={() => handleNavClick('option3')}><TbReportAnalytics style={{ fontSize: '1.5em' }} />Garbage Reports</button>
            </div>
            <div className="divNavB">
              <button className={sideNavlink === 'option4' ? 'activeB' : 'inactiveB'} onClick={() => handleNavClick('option4')}><FaRegMap style={{ fontSize: '1.5em' }} />Map</button>
            </div>
            <div className="divNavB">
              <button className={sideNavlink === 'option5' ? 'activeB' : 'inactiveB'} onClick={() => handleNavClick('option5')}><BiCalendar style={{ fontSize: '1.5em' }} />Schedule</button>
            </div>
            <div className="divNavB">
              <button className={sideNavlink === 'option6' ? 'activeB' : 'inactiveB'} onClick={() => handleNavClick('option6')}><MdAccountCircle style={{ fontSize: '1.5em' }} />User Profile</button>
            </div>
          </div>
          {/* Profile Section */}
          <div className="profileSection">
            <div className="profilePicture small">
              <img src={userlogo} alt="user-logo" className="logoImage" onClick={() => { setSideNavlink('option6') }} />
            </div>
            <p className="adminName">{userProfile?.displayName || "Loading..."}</p>
            <button className="logoutButton" onClick={handleLogout}>
              <IoLogOutOutline />
            </button>
          </div>
        </div>

        <div style={{ marginLeft: 300 }}>
          {openTab}
        </div>
      </div>
    </>
  );
}