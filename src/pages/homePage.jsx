import React, { useState, useEffect } from "react";
import { NavLink, useNavigate, } from "react-router-dom"; 
import '../styleSheet/homePageStyle.css';
import Logo from '../images/E-Wayste-logo.png';
import Dashboard from "../tabs/dashTab";
import UserManage from "../tabs/manageTab";
import Report from "../tabs/reportTab";
import Map from "../tabs/mapTab";
import Schedule from "../tabs/schedTab";
import Newsfeed from "../tabs/newsfeedTab";
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

export default function Home() {
  const [sideNavlink, setSideNavlink] = useState('option1');
  const [openTab, setOpenTab] = useState(<Dashboard />);
  const [adminName, setAdminName] = useState("Admin Name");
  
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
              <button className={sideNavlink === 'option7' ? 'activeB' : 'inactiveB'} onClick={() => handleNavClick('option6')}><MdAccountCircle style={{ fontSize: '1.5em' }} />User Profile</button>
            </div>
          </div>

          {/* Profile Section */}
          <div className="profileSection">
            <div className="profilePicture small">
              <img src={userlogo} alt="user-logo" className="logoImage" onClick={() => { setSideNavlink('option7') }} />
            </div>
            <p className="adminName">{adminName}</p>
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