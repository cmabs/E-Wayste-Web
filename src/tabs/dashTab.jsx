import React, { useState, useEffect } from 'react';
import { FaSearch, FaBell } from 'react-icons/fa';
import { getFirestore, collection, getDocs } from 'firebase/firestore'; 
import '../styleSheet/dashTabStyle.css';
import { auth } from '../firebase-config';
import Notification from './Notification';

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [generalUsersReports, setGeneralUsersReports] = useState([]);
  const [totalLGUs, setTotalLGUs] = useState(0);
  const [reportsToday, setReportsToday] = useState(0); 
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };
  const handleSearch = () => {
    const filteredUsers = users.filter((user) => {
        const name = `${user.firstName} ${user.lastName}`.toLowerCase();
        const location = `${user.barangay}, ${user.municipality}, ${user.province}`.toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || location.includes(searchTerm.toLowerCase());
    });
    setFilteredUsers(filteredUsers);
  };

  useEffect(() => {
    handleSearch(); // Call handleSearch whenever searchTerm changes
  }, [searchTerm, users]); // Re-run the effect when searchTerm or users change

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
      const firestore = getFirestore(); // Get Firestore instance
      const reportsCollection = collection(firestore, 'generalUsersReports');
      const reportsSnapshot = await getDocs(reportsCollection);

      const reportsData = reportsSnapshot.docs.map((doc) => doc.data());
      setGeneralUsersReports(reportsData);

      const currentDate = new Date().toISOString().split('T')[0];
      const reportsTodayCount = reportsData.filter(report => {
        const reportDate = new Date(report.dateTime).toISOString().split('T')[0];
        return reportDate === currentDate;
      }).length;

      setReportsToday(reportsTodayCount); // Set the count of reports submitted today
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  useEffect(() => {
    fetchGeneralUsersReports();
  }, []);

  function UserListContent({ users }) {
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
                  <p style={{ color: user.status === 'ACTIVE' ? 'rgb(0,123,0)' : 'green' }}>Active</p>
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
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
            <input
                    type="text"
                    placeholder="Search by name, or location"
                    className="searchBar"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button className="searchButton" onClick={() => { handleSearch(); setSearchTerm(''); }}>
                  <FaSearch style={{ fontSize: 20 }} />
              </button>

            </div>
            <button className="notifIcon" onClick={toggleNotification}>
        <FaBell />
      </button>
      <Notification isOpen={isNotificationOpen} onClose={toggleNotification} />
          </div>
        </div>
        <h4 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 800, marginBottom: 5 }}>Summary</h4>
        <div style={{ display: 'flex', flexDirection: 'row', gap: 20, marginTop: 20 }}>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>TOTAL USERS</p>
            <p style={{ fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3 }}>{users.length}</p>
          </div>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>TOTAL REPORTS</p>
            <p style={{ fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3 }}>{generalUsersReports.length}</p>
          </div>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>REPORTS TODAY</p>
            <p style={{ fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3 }}>{reportsToday}</p>
          </div>
          <div className="orangeBox2">
            <p style={{ fontWeight: 700, color: 'rgb(60,60,60)' }}>REGISTERED LGUs</p>
            <p style={{ fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3 }}>{totalLGUs}</p>
          </div>
          
        </div>
        <h4 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 800, marginBottom: 20 }}>Users</h4>
        <div className="userList" style={{ width: '100%' }}>
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
          <UserListContent users={searchTerm ? filteredUsers : users} />
        </div>
      </div>
    </>
  );
}
// for admin