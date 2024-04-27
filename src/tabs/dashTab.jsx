import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../styleSheet/dashTabStyle.css';
import { auth } from '../firebase-config';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [generalUsersReports, setGeneralUsersReports] = useState([]);
  const [totalCollectors, setTotalCollectors] = useState(0);
  const [loggedInUserLguCode, setLoggedInUserLguCode] = useState(null);
  const [totalCollected, setTotalCollected] = useState(0);
  const [totalUncollected, setTotalUncollected] = useState(0);
  const [loggedInUserMunicipality, setLoggedInUserMunicipality] = useState(null);

  const [filteredUsers, setFilteredUsers] = useState([]);

  const fetchLoggedInUserLguCode = async () => {
    try {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const email = user.email;
          const firestore = getFirestore();
          const usersCollection = collection(firestore, 'users');
          const querySnapshot = await getDocs(query(usersCollection, where('email', '==', email)));
  
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const userLguCode = userData.lguCode;
            const userMunicipality = userData.municipality; 

            setLoggedInUserLguCode(userLguCode);
            setLoggedInUserMunicipality(userMunicipality);
          }
        }
      });
    } catch (error) {
      console.error('Error fetching logged-in user data:', error);
    }
  };
    
  useEffect(() => {
    fetchLoggedInUserLguCode();
  }, []); 
  
  useEffect(() => {
    if (loggedInUserLguCode && users.length > 0) {
      const totalCollectors = users.filter(
        (user) =>
          user.accountType === 'Garbage Collector' &&
          user.lguCode === loggedInUserLguCode
      ).length;
      setTotalCollectors(totalCollectors);
    }
  }, [users, loggedInUserLguCode]);

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
    fetchUsers();
  }, []);

  const fetchGeneralUsersReports = async () => {
    try {
      const firestore = getFirestore();
      const reportsCollection = collection(firestore, 'generalUsersReports');
      const querySnapshot = await getDocs(query(reportsCollection, 
        where('municipality', '==', loggedInUserMunicipality),
        where('status', 'in', ['collected', 'uncollected'])
      ));
  
      const reportsData = querySnapshot.docs.map((doc) => doc.data());
      setGeneralUsersReports(reportsData);
      
      const collectedCount = reportsData.filter(report => report.status === 'collected').length;
      const uncollectedCount = reportsData.filter(report => report.status === 'uncollected').length;
      
      setTotalCollected(collectedCount);
      setTotalUncollected(uncollectedCount);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    if (loggedInUserMunicipality || users.length > 0) {
      fetchGeneralUsersReports();
    }
  }, [loggedInUserMunicipality, users]);


  useEffect(() => {
    if (loggedInUserLguCode) { 
      const totalCollectors = users.filter(
        (user) =>
          user.accountType === 'Garbage Collector' &&
          user.lguCode === loggedInUserLguCode
      ).length;
      setTotalCollectors(totalCollectors);
    }
  }, [users, loggedInUserLguCode]);

  // Render user list content
  function UserListContent() {
    const filteredUsers = users.filter(user => user.lguCode === loggedInUserLguCode);
    return (
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredUsers.map((user, userID) => (
          <li key={userID}>
            <div className="userListB">
              <button>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{`${user.firstName} ${user.lastName}`}</p>
                </div>
                <div style={{ width: '15%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p style={{ color: user.status === 'ACTIVE' ? 'green' : 'green' }}>ACTIVE</p>
                </div>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.email}</p>
                </div>
                <div style={{ width: '25%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
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
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <input
                    type="text"
                    placeholder="Search "
                    className="searchBar"
              
                  />
                  <button className="searchButton" >
                  <FaSearch style={{ fontSize: 20 }} />
              </button>

            </div>
            <button className="notifIcon">
              <FaBell />
            </button>
          </div>
        </div>
        <h4 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 800, marginBottom: 15 }}>Summary</h4>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>TOTAL COLLECTORS</p>
            <p style={{ fontWeight: 700, fontSize: 50, color: 'rgb(50,50,50)', marginTop: -3 }}>{totalCollectors}</p>
          </div>
          <div className="orangeBox2">  
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>TOTAL REPORTS</p>
            <p style={{ fontWeight: 700, fontSize: 50, color: 'rgb(50,50,50)', marginTop: -3 }}>{generalUsersReports.length}</p>
          </div>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>TOTAL COLLECTED</p>
            <p style={{ fontWeight: 700, fontSize: 50, color: 'rgb(50,50,50)', marginTop: -3 }}>{totalCollected}</p>
          </div>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>TOTAL UNCOLLECTED</p>
            <p style={{ fontWeight: 700, fontSize: 50, color: 'rgb(50,50,50)', marginTop: -3 }}>{totalUncollected}</p>
          </div>
        </div>
        <h4 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 800, marginBottom: 5 }}>Users</h4>
        <div className="userList">
          <div style={{ fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: 'rgb(80,80,80)', display: 'flex', flexDirection: 'row', height: 30, backgroundColor: 'rgb(245,245,245)', borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderRightWidth: 1, borderColor: 'rgb(200,200,200)', alignItems: 'center' }}>
            <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
              <p>Name</p>
            </div>
            <div style={{ width: '15%', display: 'flex', justifyContent: 'center' }}>
              <p>Status</p>
            </div>
            <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
              <p>Email</p>
            </div>
            <div style={{ width: '25%', display: 'flex', justifyContent: 'center' }}>
              <p>Type</p>
            </div>
            <div style={{ width: '20%', display: 'flex', justifyContent: 'center' }}>
              <p>Location</p>
            </div>
          </div>
          <UserListContent />
        </div>
      </div>
    </>
  );
}