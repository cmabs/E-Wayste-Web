import React, { useState, useEffect } from "react";
import '../styleSheet/manageTabStyle.css';
import { db } from '../firebase-config';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

import { FaSearch, FaBell } from 'react-icons/fa';
import { MdOutlineModeEdit, MdDelete } from 'react-icons/md';
import { ImCheckmark } from 'react-icons/im';

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

  const fetchUsers = async () => {
    try {
      const firestore = getFirestore();
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);

      const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    console.log('Fetching users...');
    fetchUsers();
  }, []);

  const handleDeleteUser = async (event, userId) => {
    event.preventDefault();

    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      await deleteDoc(userRef);
      console.log('User deleted successfully!');
      // Fetch the updated list of users after deletion
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  function UserListContent() {
    return (
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {users.map((user, userID) => (
          <li key={userID}>
            <div className='userListB'>
              <button style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '15%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{`${user.firstName} ${user.lastName}`}</p>
                </div>
                <div style={{ width: '15%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.username}</p>
                </div>
                <div style={{ width: '18%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.email}</p>
                </div>
                <div style={{ width: '23%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.accountType}</p>
                </div>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(200,200,200)', overflow: 'hidden' }}>
                  <p>{`${user.barangay}, ${user.municipality}, ${user.province}`}</p>
                </div>
                <div style={{ width: '9%', overflow: 'hidden', justifyContent: 'space-around', alignItems: 'center' }}>
                  <MdOutlineModeEdit style={{ fontSize: 24, cursor: 'pointer', color: 'green' }} />
                  <MdDelete style={{ fontSize: 24, gap: 5, cursor: 'pointer', color: 'red' }} onClick={(event) => handleDeleteUser(event, user.id)} />
                </div>
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div style={{ marginLeft: 40, marginTop: 40, width: 902 }}>
      <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
        <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650 }}>User Management</h1>
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
      <div style={{ marginTop: 50, marginBottom: 40, backgroundColor: 'rgb(243,243,243)', padding: 10, borderRadius: 20, width: 1100 }}>
        <div style={{ display: 'flex', width: '100%', borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderColor: 'rgb(210,210,210)', marginBottom: 10, fontFamily: 'Inter', fontWeight: 500, fontSize: 14 }}>
          <div style={{ display: 'flex', marginLeft: 60, overflow: 'hidden', justifyContent: 'center' }}>
            <p>Name</p>
          </div>
          <div style={{ display: 'flex', marginLeft: 120, overflow: 'hidden', justifyContent: 'center' }}>
            <p>Username</p>
          </div>
          <div style={{ display: 'flex', marginLeft: 126, overflow: 'hidden', justifyContent: 'center' }}>
            <p>Email</p>
          </div>
          <div style={{ display: 'flex', marginLeft: 165, overflow: 'hidden', justifyContent: 'center' }}>
            <p>Account Type</p>
          </div>
          <div style={{ display: 'flex', marginLeft: 160, overflow: 'hidden', justifyContent: 'center' }}>
            <p>Location</p>
          </div>
          <div style={{ display: 'flex', marginLeft: 100, overflow: 'hidden', justifyContent: 'center' }}>
            <p>Action</p>
          </div>
        </div>
        {UserListContent()}
      </div>
    </div>
  );
}
