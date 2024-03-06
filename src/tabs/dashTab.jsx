import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import '../styleSheet/dashTabStyle.css';
import { auth } from '../firebase-config';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [generalUsersReports, setGeneralUsersReports] = useState([]);
  const [totalLGUs, setTotalLGUs] = useState(0);
  const [lguCode, setLguCode] = useState("");   

  const fetchUsers = async () => {
    try {
      const firestore = getFirestore();
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);

      const usersData = usersSnapshot.docs.map((doc) => doc.data());
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    // Retrieve lguCode from localStorage
    const storedLguCode = localStorage.getItem("lguCode");
    setLguCode(storedLguCode || ""); // Set the lguCode to state
  }, []); 

  useEffect(() => {
    console.log('Fetching users...');
    fetchUsers();
  }, []);

  useEffect(() => {
    // Calculate the total number of LGUs
    setTotalLGUs(
      users.filter(
        (user) =>
          user.accountType === 'LGU / Waste Management Head'
      ).length
    );
  }, [users]);

  const fetchGeneralUsersReports = async () => {
    try {
      // Replace 'yourReportsCollection' with the actual name of your reports collection
      const reportsCollection = collection(getFirestore(), 'generalUsersReports');
      const reportsSnapshot = await getDocs(reportsCollection);

      const reportsData = reportsSnapshot.docs.map((doc) => doc.data());
      setGeneralUsersReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    console.log('Fetching reports...');
    fetchGeneralUsersReports();
  }, []);
  
  
  function UserListContent() {
    return (
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {users.map((user, userID) => (
          <li key={userID}>
            <div className="userListB">
              <button>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{`${user.firstName} ${user.lastName}`}</p>
                </div>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p style={{ color: user.status === 'ACTIVE' ? 'rgb(0,123,0)' : 'rgb(255,0,0)' }}>Active</p>
                </div>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.email}</p>
                </div>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.accountType}</p>
                </div>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(200,200,200)', overflow: 'hidden' }}>
                  <p>{`${user.barangay}, ${user.municipality}, ${user.province}`}</p>
                </div>
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      <div style={{ marginLeft: 40, marginTop: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0 }}>Dashboard</h1>
          <p style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontSize: 16, fontWeight: 600, marginBottom: 5 }}>LGU Code: {lguCode}</p> {/* Display the lguCode */}
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <input type="text" placeholder="Search" className="searchBar" />
              <button className="searchButton"><FaSearch style={{ fontSize: 20 }} /></button>
            </div>
            <button className="notifIcon">
              <FaBell />
            </button>
          </div>
        </div>
        <h4 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 800, marginBottom: 5 }}>Summary</h4>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>TOTAL USERS</p>
            <p style={{ fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3 }}>{users.length}</p>
          </div>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>TOTAL REPORTS</p>
            <p style={{ fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3 }}>{generalUsersReports.length}</p>
          </div>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>REGISTERED LGUs</p>
            <p style={{ fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3 }}>{totalLGUs}</p>
          </div>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>REGISTERED PROVINCES</p>
            <p style={{ fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3 }}>{users.length}</p>
          </div>
        </div>
        <h4 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 800, marginBottom: 5 }}>Users</h4>
        <div className="userList">
          <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: 'rgb(80,80,80)', display: 'flex', flexDirection: 'row', height: 30, backgroundColor: 'rgb(245,245,245)', borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderRightWidth: 1, borderColor: 'rgb(200,200,200)', alignItems: 'center' }}>
            <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
              <p>Name</p>
            </div>
            <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
              <p>Status</p>
            </div>
            <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
              <p>Email</p>
            </div>
            <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
              <p>Type</p>
            </div>
            <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
              <p>Location</p>
            </div>
          </div>
          {UserListContent()}
        </div>
      </div>
    </>
  );
}