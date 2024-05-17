import React, { useState, useEffect } from "react";
import '../styleSheet/manageTabStyle.css';
import { db, storage } from '../firebase-config';
import { getFirestore, collection, getDocs, getDoc, addDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { v4 as uuidv4 } from "uuid";
import { Select, MenuItem } from '@mui/material';

import { FaSearch, FaBell } from 'react-icons/fa';
import { MdOutlineModeEdit, MdDelete } from 'react-icons/md';
import { ImCheckmark } from 'react-icons/im';
import { Button } from "@mui/material";
import Notification from './Notification';


export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSuccessModalOpen, setSuccessModalOpen] = useState(false);
  const [isPendingUsers, setIsPendingUsers] = useState(false);
  const [userTotal, setUserTotal] = useState(0); 
  const [sortOrder, setSortOrder] = useState('asc'); 
  const [selectedAccountType, setSelectedAccountType] = useState('All'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);


  let imageURL, viewImageURL;
  const [userLicense, setUserLicense] = useState([]);
  const [openImage, setOpenImage] = useState(false);
  const [imageToView, setImageToView] = useState();
  const imageColRef = ref(storage, "userWorkID/");

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  useEffect(() => {
    console.log(`Fetching ${isPendingUsers ? 'pendingUsers' : 'users'}...`);
    fetchUsers();
  }, [isPendingUsers]);

  useEffect(() => {
    if (isPendingUsers) {
      const pendingUsersCount = users.filter(user => user.accountType === 'LGU / Waste Management Head').length;
      setUserTotal(pendingUsersCount);
    } else {
      setUserTotal(users.length);
    }
  }, [users, isPendingUsers]);

  const handleSearch = () => {
    if (searchTerm.trim() === '') {
      fetchUsers(); // Fetch users again to reset the search
      return;
    }
  
    const filteredUsers = users.map(user => {
      const name = `${user.firstName} ${user.lastName}`;
      const searchTermLower = searchTerm.toLowerCase();
      const nameLower = name.toLowerCase();
  
      if (nameLower.includes(searchTermLower)) {
        const startIndex = nameLower.indexOf(searchTermLower);
        const endIndex = startIndex + searchTermLower.length;
        const highlightedName = `${name.substring(0, startIndex)}<span class="highlight">${name.substring(startIndex, endIndex)}</span>${name.substring(endIndex)}`;
        return { ...user, highlightedName };
      } else {
        return null;
      }
    }).filter(user => user !== null);
  
    setUsers(filteredUsers);
  };
  

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);
  

  const fetchUsers = async () => {
    try {
      console.log(`Fetching ${isPendingUsers ? 'pendingUsers' : 'users'}...`);
      const firestore = getFirestore();
      const usersCollection = collection(firestore, isPendingUsers ? 'pendingUsers' : 'users');
      const usersSnapshot = await getDocs(usersCollection);
  
      let usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      // Sort the users based on the 'Name' column
      usersData = usersData.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toUpperCase();
        const nameB = `${b.firstName} ${b.lastName}`.toUpperCase();
  
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
  
      console.log('Sorted Users:', usersData);
  
      setUsers(usersData);
      setUserTotal(usersData.length);
    } catch (error) {
      console.error(`Error fetching ${isPendingUsers ? 'pendingUsers' : 'users'}:`, error);
    }
  };
  

  useEffect(() => {
    console.log(`Fetching ${isPendingUsers ? 'pendingUsers' : 'users'}...`);
    fetchUsers();
  }, [isPendingUsers]);

  useEffect(() => {
    console.log('Fetching users...');
    fetchUsers();
  }, []);

  useEffect(() => {
    listAll(imageColRef).then((response) => {
      setUserLicense([]);
      response.items.forEach((item) => {
          getDownloadURL(item).then((url) => {
              setUserLicense((prev) => [...prev, url])
          })
      })
  })
  }, [])

  const toggleSortOrder = () => {
    console.log('Toggle sort order clicked');
    setSortOrder((prevSortOrder) => (prevSortOrder === 'asc' ? 'desc' : 'asc'));
  };
  
  const handleDeleteUser = async (event, userId) => {
    event.preventDefault();

    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      await deleteDoc(userRef);
      console.log('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const SuccessModal = () => {
    return (
      <div className="modal">
        <div className="modal-content">
          <p>User successfully added!</p>
          <button onClick={closeSuccessModal}>Close</button>
        </div>
      </div>
    );
  };
    

  const handleApproveUser = async (event, userId) => {
    event.preventDefault();
    console.log('Attempting to approve user:', userId);
  
    try {
      const firestore = getFirestore();
      const auth = getAuth();
  
      const pendingUserRef = doc(firestore, 'pendingUsers', userId);
      const pendingUserSnapshot = await getDoc(pendingUserRef);
  
      if (pendingUserSnapshot.exists()) {
        const userData = pendingUserSnapshot.data();
  
        const { email, password } = userData;
        await createUserWithEmailAndPassword(auth, email, password);
        await deleteDoc(pendingUserRef);
        const lguCode = uuidv4().substring(0, 8);
  
        const usersCollection = collection(firestore, 'users');
        const userDocRef = await addDoc(usersCollection, { ...userData, lguCode: lguCode });
  
        console.log('User approved successfully!');
        console.log('User added to users collection with ID:', userDocRef.id);
        fetchUsers();
        openSuccessModal();
      } else {
        console.error('User not found in pendingUsers collection.');
      }
    } catch (error) {
      console.error('Error approving user:', error);
  
      // Check if the error is due to email already in use
      if (error.code === 'auth/email-already-in-use') {
        // Provide feedback to the user about the email already being in use
        alert('The email address is already in use.');
      } else {
        // Handle other errors accordingly
        // You can provide a generic error message or handle other specific errors here
        alert('An error occurred while approving the user. Please try again later.');
      }
    }
  };  
  
  const handleRejectUser = async (event, userId) => {
    event.preventDefault();

    try {
      const firestore = getFirestore();
      const pendingUserRef = doc(firestore, 'pendingUsers', userId);
      await deleteDoc(pendingUserRef);
      
      console.log('User rejected successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  }; 

  const openSuccessModal = () => {
    setSuccessModalOpen(true);
  };
  const closeSuccessModal = () => {
    setSuccessModalOpen(false);
  };
  

  function UserListContent() {
    const filteredUsers = isPendingUsers
      ? users.filter((user) => user.accountType === 'LGU / Waste Management Head')
      : selectedAccountType === 'All'
      ? users
      : users.filter((user) => user.accountType === selectedAccountType);
    return (
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {filteredUsers.map((user, userID) => (
          <li key={userID}>
            <div className='userListB'>
              <button style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: '15%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                {user.highlightedName ? (
                  <p>
                    <span dangerouslySetInnerHTML={{ __html: user.highlightedName }} style={{ fontColor: 'green' }} />
                  </p>
                ) : (
                  <p>{`${user.firstName} ${user.lastName}`}</p>
                )}
                </div>
                <div style={{ width: '18%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.username}</p>
                </div>
                <div style={{ width: '23%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.email}</p>
                </div>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  {selectedAccountType === 'All' || user.accountType === selectedAccountType ? (
                    <p>{user.accountType}</p>
                  ) : null}
                </div>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(200,200,200)', overflow: 'hidden' }}>
                  <p>{`${user.barangay}, ${user.municipality}, ${user.province}`}</p>
                </div>
                {isPendingUsers && (
                  <>
                    {userLicense.map((url) => {
                      if(url.includes(user.associatedImage)) {
                          imageURL = url;
                      }
                    })}
                    <div style={{ width: '15%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                      {user.associatedImage && (
                        <a
                          href="#"
                          onClick={() => {setOpenImage(true); setImageToView(user.associatedImage)}}
                        >
                          <img src={imageURL} alt="License" style={{ width: 90, height: 'auto', resizeMode: 'cover' }} />
                          <span style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}></span>
                        </a>
                      )}
                    </div>
                  </>
               )}
                <div style={{ width: '9%', overflow: 'hidden', justifyContent: 'space-around', alignItems: 'center' }}>
                  {isPendingUsers && (
                    <>
                      <ImCheckmark
                style={{
                  fontSize: 24,
                  cursor: 'pointer',
                  color: 'green',
                  marginRight: '5px',
                }}
                onClick={(event) => {
                  console.log('Attempting to approve user:', user.id);
                  handleApproveUser(event, user.id);
                }}
              />
                      <MdDelete
                        style={{
                          fontSize: 24,
                          cursor: 'pointer',
                          color: 'red',
                        }}
                        onClick={(event) => handleRejectUser(event, user.id)}
                      />
                    </>
                  )}
                  {!isPendingUsers && (
                    <>
                      <MdDelete
                        style={{ fontSize: 24, gap: 5, cursor: 'pointer', color: 'red' }}
                        onClick={(event) => handleDeleteUser(event, user.id)}
                      />
                    </>
                  )}
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
      <div style={{ marginLeft: 40, marginTop: 40, width: 1080 }}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
          <button className="pending-users-button" onClick={() => setIsPendingUsers(!isPendingUsers)}>Pending Users</button>
          <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 1000 }}>
          {isPendingUsers ? 'Pending Users' : 'User Management'} ({userTotal})
          </h1></div>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', marginLeft: 40, marginTop: -45, gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
            <input
                  type="text"
                  placeholder="Search name"
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
          {!isPendingUsers && (
          <div style={{ marginBottom: -40, marginTop: 20,display:'flex', marginLeft: 700, fontFamily: 'Inter', fontSize: 14}}>
            <label htmlFor="accountTypeSelect">Select Account Type: </label>
            <select
              id="accountTypeSelect"
              onChange={(e) => setSelectedAccountType(e.target.value)}
              value={selectedAccountType}
            >
              <option value="All">All</option>
              <option value="Garbage Collector">Garbage Collector</option>
              <option value="LGU / Waste Management Head">LGU / Waste Management Head</option>
              <option value="Residents / General Users">Residents / General Users</option>
            </select>
          </div>)}
        <div style={{ marginTop: 70, marginBottom: 40, backgroundColor: 'rgb(243,243,243)', padding: 10, borderRadius: 20, width: 1100 }}>
          <div style={{ display: 'flex', width: '100%', borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderColor: 'rgb(210,210,210)', marginBottom: 10, fontFamily: 'Inter', fontWeight: 500, fontSize: 14 }}>
            {!isPendingUsers ?
              <>
                <div style={{ display: 'flex', marginLeft: 52, overflow: 'hidden', justifyContent: 'center' }}>
                  <p onClick={toggleSortOrder} style={{ cursor: 'pointer' }}>
                    Name {sortOrder === 'asc' ? '▲' : '▼'}
                  </p>
                </div>
                <div style={{ display: 'flex', marginLeft: 120, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Username</p>
                </div>
                <div style={{ display: 'flex', marginLeft: 155, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Email</p>
                </div>
                <div style={{ display: 'flex', marginLeft: 165, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Account Type</p>
                </div>
                <div style={{ display: 'flex', marginLeft: 130, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Location</p>
                </div>
                <div style={{ display: 'flex', marginLeft: 100, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Action</p> 
                </div>
              </>
              :
              <>
                <div style={{ display: 'flex', marginLeft: 40, overflow: 'hidden', justifyContent: 'center' }}>
                  <p onClick={toggleSortOrder} style={{ cursor: 'pointer' }}>
                    Name {sortOrder === 'asc' ? '▲' : '▼'}
                  </p>
                </div>
                <div style={{ display: 'flex', marginLeft: 100, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Username</p>
                </div>
                <div style={{ display: 'flex', marginLeft: 126, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Email</p>
                </div>
                <div style={{ display: 'flex', marginLeft: 140, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Account Type</p>
                </div>
                <div style={{ display: 'flex', marginLeft: 100, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Location</p>
                </div>
                <div style={{ display: 'flex', marginLeft: 110, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>License</p>
                </div>
                <div style={{ display: 'flex', marginLeft: 70, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Action</p> 
                </div>
              </>
            }
          </div>
          {UserListContent()}
        </div>
      </div>
      {openImage ?
        <>
          {userLicense.map((url) => {
            if(url.includes(imageToView)) {
                viewImageURL = url;
            }
          })}
          <div style={{position: 'fixed', display: 'flex', flex: 1, width: '100%', height: '100%', top: 0, left: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 99}}>
            <div style={{display: 'flex', flex: 1, justifyContent: 'center', alignItems: 'flex-start', gap: 5}}>
              <img src={viewImageURL} alt="License" style={{ width: 'auto', height: 500, resizeMode: 'cover' }} />
              <button onClick={() => {setOpenImage(false)}}>X</button>
            </div>
          </div>
        </>
        :
        <></>
      }
      {isSuccessModalOpen && <SuccessModal />}
    </>
  );
}