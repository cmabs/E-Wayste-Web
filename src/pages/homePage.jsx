import { React, useState, useEffect } from "react"; 
import { NavLink, useNavigate } from "react-router-dom"; 
import { getFirestore, doc, getDoc} from "firebase/firestore"; 
import { db } from "../firebase-config"; 
import '../styleSheet/homePageStyle.css'; 
import Logo from '../images/E-Wayste-logo.png'; 
import Dashboard from "../tabs/dashTab"; 
import UserManage from "../tabs/manageTab"; 
import Report from "../tabs/reportTab"; 
import Map from "../tabs/mapTab"; 
import Schedule from "../tabs/schedTab"; 
import Newsfeed from "../tabs/newsfeedTab"; 
import { RxDashboard } from 'react-icons/rx'; 
import { MdPersonOutline } from 'react-icons/md'; 
import { TbReportAnalytics } from 'react-icons/tb'; 
import { FaRegMap } from 'react-icons/fa'; 
import { BiCalendar, BiNews } from 'react-icons/bi'; 
import { IoPersonOutline, IoLogOutOutline } from 'react-icons/io5'; 
import userlogo from '../images/userlogo.png'; 
export default function Home() { 
  const [adminName, setAdminName] = useState(""); 
  const [sideNavlink, setSideNavlink] = useState('option1'); 
  const [nav1Style, setNav1Style] = useState(); 
  const [nav2Style, setNav2Style] = useState(); 
  const [nav3Style, setNav3Style] = useState(); 
  const [nav4Style, setNav4Style] = useState(); 
  const [nav5Style, setNav5Style] = useState(); 
  const [nav6Style, setNav6Style] = useState(); 
  const [openTab, setOpenTab] = useState(); 
  const navigate = useNavigate(); 
  useEffect(() => { 
    const fetchAdminName = async () => { 
      try { 
        const userSnapshot = await getDoc(doc(db, "usersAdmin", "adminId")); // Replace "adminId" with the actual ID of the logged-in user 
        const userData = userSnapshot.data(); 
        const { firstName, lastName } = userData; 
        setAdminName(`${firstName} ${lastName}`); 
      } catch (error) { 
        console.error("Error fetching admin name: ", error); 
      } 
    }; 
    fetchAdminName(); 
  }, []); 
  useEffect(() => { 
    if (sideNavlink === 'option1') { 
      setNav1Style('activeB'); 
      setNav2Style('inactiveB'); 
      setNav3Style('inactiveB'); 
      setNav4Style('inactiveB'); 
      setNav5Style('inactiveB'); 
      setNav6Style('inactiveB') 
      setOpenTab(Dashboard); 
    } 
    if (sideNavlink === 'option2') { 
      setNav1Style('inactiveB'); 
      setNav2Style('activeB'); 
      setNav3Style('inactiveB'); 
      setNav4Style('inactiveB'); 
      setNav5Style('inactiveB'); 
      setNav6Style('inactiveB') 
      setOpenTab(Newsfeed); 
    } 
    if (sideNavlink === 'option3') { 
      setNav1Style('inactiveB'); 
      setNav2Style('inactiveB'); 
      setNav3Style('activeB'); 
      setNav4Style('inactiveB'); 
      setNav5Style('inactiveB'); 
      setNav6Style('inactiveB') 
      setOpenTab(Report); 
    } 
    if (sideNavlink === 'option4') { 
      setNav1Style('inactiveB'); 
      setNav2Style('inactiveB'); 
      setNav3Style('inactiveB'); 
      setNav4Style('activeB'); 
      setNav5Style('inactiveB'); 
      setNav6Style('inactiveB') 
      setOpenTab(Map); 
    } 
    if (sideNavlink === 'option5') { 
      setNav1Style('inactiveB'); 
      setNav2Style('inactiveB'); 
      setNav3Style('inactiveB'); 
      setNav4Style('inactiveB'); 
      setNav5Style('activeB'); 
      setNav6Style('inactiveB') 
      setOpenTab(Schedule); 
    } 
    if (sideNavlink === 'option6') { 
      setNav1Style('inactiveB'); 
      setNav2Style('inactiveB'); 
      setNav3Style('inactiveB'); 
      setNav4Style('inactiveB'); 
      setNav5Style('inactiveB'); 
      setNav6Style('activeB') 
      setOpenTab(UserManage); 
    } 
  }, [sideNavlink]); 
  const handleLogout = () => { 
    navigate("/"); 
  }; 

  const handleProfileClick = () => { 
    navigate("/userProfile");    
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
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 25, gap: 6 }}> 
            <div className="divNavB"> 
              <button className={nav1Style} onClick={() => { setSideNavlink('option1') }}><RxDashboard style={{ fontSize: '1.5em' }} />Dashboard</button> 
              <i /> 
            </div> 
            <div className="divNavB"> 
              <button className={nav2Style} onClick={() => { setSideNavlink('option2') }}><BiNews style={{ fontSize: '1.5em' }} />Newsfeed</button> 
              <i /> 
            </div> 
            <div className="divNavB"> 
              <button className={nav3Style} onClick={() => { setSideNavlink('option3') }}><TbReportAnalytics style={{ fontSize: '1.5em' }} />Garbage Reports</button> 
              <i /> 
            </div> 
            <div className="divNavB"> 
              <button className={nav4Style} onClick={() => { setSideNavlink('option4') }}><FaRegMap style={{ fontSize: '1.5em' }} />Map</button> 
              <i /> 
            </div> 
            <div className="divNavB"> 
              <button className={nav5Style} onClick={() => { setSideNavlink('option5') }}><BiCalendar style={{ fontSize: '1.5em' }} />Schedule</button> 
              <i /> 
            </div> 
            <div className="divNavB"> 
              <button className={nav6Style} onClick={() => { setSideNavlink('option6') }}><MdPersonOutline style={{ fontSize: '1.5em' }} />User Management</button> 
              <i /> 
            </div> 
          </div> 
          <div className="profileSection">
            <div className="profilePicture small">
              <img src={userlogo} alt="user-logo" className="logoImage" onClick={handleProfileClick} />
            </div>
            <p className="adminName">{adminName}John Doe</p>
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