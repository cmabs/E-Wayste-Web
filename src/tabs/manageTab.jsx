import React, { useState, useEffect } from "react";
import '../styleSheet/manageTabStyle.css';
import { db, storage } from '../firebase-config';
import { getFirestore, collection, getDocs, getDoc, addDoc, doc, deleteDoc, where, query } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';

import { FaSearch, FaBell, FaArrowLeft } from 'react-icons/fa';
import { MdOutlineModeEdit, MdDelete } from 'react-icons/md';
import { ImCheckmark } from 'react-icons/im';
import { Button } from "@mui/material";




export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [deleteUserId, setDeleteUserId] = useState(null);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isPendingUsers, setIsPendingUsers] = useState(false);
  const storage = getStorage();

  let imageURL, viewImageURL;
  const [userLicense, setUserLicense] = useState([]);
  const [openImage, setOpenImage] = useState(false);
  const [imageToView, setImageToView] = useState();
  const imageColRef = ref(storage, "userWorkID/");
  const [loggedInUser, setLoggedInUser] = useState(null);

  const [isAddSchedOpen, setAddSchedOpen] =useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isCollectorOpen, setIsCollectorOpen] = useState(true); // Initially open
  const [isUsersListOpen, setIsUsersListOpen]  =useState(true);
  const [isTruckOpen, setIsTruckOpen] = useState(false);
  const [isUserListVisible, setUserListVisible] = useState(true);


  const [selectedSection, setSelectedSection] = useState(null);
  const [collectors, setCollectors] = useState([]); 
  const [searchTerm, setSearchTerm] = useState(''); 

  useEffect(() => {
    const fetchLoggedInUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (user) {
          setLoggedInUser(user);
        }
      } catch (error) {
        console.error('Error fetching logged-in user data:', error);
      }
    };

    fetchLoggedInUserData();
  }, []);

  useEffect(() => {
    if (loggedInUser && loggedInUser.uid) {
      fetchGarbageCollectors(loggedInUser.uid);
    }
  }, [loggedInUser]);

  const handleSearch = () => {
    const filtered = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const collectorUsername = user.username ? user.username.toLowerCase() : '';
      const searchTermLower = searchTerm.toLowerCase();
  
      return (
        collectorUsername.includes(searchTermLower) ||
        fullName.includes(searchTermLower) ||
        user.username.includes(searchTermLower)
      );
    });
    setUsers(filtered);
  };
  
  
  const fetcCollectorUsers = async () => {
    try {
      const firestore = getFirestore();
      const usersCollection = collection(firestore, isPendingUsers ? 'pendingUsers' : 'users');
      const usersSnapshot = await getDocs(usersCollection);

      const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error(`Error fetching ${isPendingUsers ? 'pendingUsers' : 'users'}:`, error);
    }
  };

  useEffect(() => {
    fetcCollectorUsers();
  }, [isPendingUsers]);


  const toggleUserListVisibility = () => {
    setUserListVisible(!isUserListVisible);
    setUserListVisible(false); 
   
  };
  
  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    if (section === "collector") {
      setIsCollectorOpen(true);
      setSelectedSection(section);
      setUserListVisible(false); // Hide UserListContent when "Collector" is clicked
      
      
    } else if (section === "trucks") {
      setIsCollectorOpen(false);
      setIsTruckOpen(true);
      setUserListVisible(false); // Hide UserListContent when "Trucks" is clicked
    }
  };
  const renderTableContent = () => {
    if (isPendingUsers) {
      return null; // Return null when Pending Users is active
    }

    if (selectedSection === "collector" && isCollectorOpen) {
      const collectors = users.filter(user => user.accountType === "Garbage Collector");
      const collectorsJSX = collectors.map(collector => (
        <tr key={collector.id}  style={{ border: '1px solid #ddd', textAlign: 'center'}}>
          <td style={{ borderRight: '1px solid #ddd' }}>{collector.username}</td>
          <td style={{ borderRight: '1px solid #ddd' }}>{collector.accountType}</td>
          <td style ={{color:'red', borderRight: '1px solid #ddd'}}>Active</td>
          <td style={{ borderRight: '1px solid #ddd' }}>{`${collector.barangay}, ${collector.municipality}, ${collector.province}`}</td>
          <td style={{ borderRight: '1px solid #ddd' }}>
          <MdOutlineModeEdit style={{ fontSize: 24, cursor: 'pointer', color: 'green' }} />
           <MdDelete
              style={{ fontSize: 24, gap: 5, cursor: 'pointer', color: 'red' }}
              onClick={(event) => handleDeleteUser(event, collector.id)}
            />
        </td>
        </tr>
      ));

      return (
        <table className="reportTable" style={{ border: '1px solid #ddd', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Type</th>
              <th>Status</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="reportTableBody">{collectorsJSX}</tbody>
        </table>
      );
    }  else if (selectedSection === "trucks" && isTruckOpen) {
      return (
        <table className="reportTable" style={{ border: '1px solid #ddd', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Truck No.</th>
              <th>Plate No.</th>
              <th>Assigned Driver</th>
              <th>Assigned Collector</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="reportTableBody">
            <tr style={{ border: '1px solid #ddd', textAlign: 'center'}}>
              <td style={{ borderRight: '1px solid #ddd' }}>1234</td>
              <td style={{ borderRight: '1px solid #ddd' }}></td>
              <td style={{ borderRight: '1px solid #ddd' }}></td>
              <td style={{ borderRight: '1px solid #ddd' }}></td>
              <td style={{ borderRight: '1px solid #ddd' }}></td>
            </tr>
          </tbody>
        </table>
      );
    } else {
      return null; // Return null if the section is not selected or isOpen is false
    }
  };
  
  const fetchGarbageCollectors = async (loggedInUserId) => {
    try {
      const firestore = getFirestore();
      const usersCollection = collection(firestore, 'users');
      const q = query(usersCollection, where('accountType', '==', 'Garbage Collector'));

      const querySnapshot = await getDocs(q);

      const usersData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => user.lguCode === loggedInUserId); // Assuming LGU code is stored as 'lguCode' in user data

      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching garbage collectors:', error);
    }
  };
  
  const fetchUsers = async () => {
  try {
    const firestore = getFirestore();
    const usersCollection = collection(firestore, isPendingUsers ? 'pendingUsers' : 'users');
    const usersSnapshot = await getDocs(usersCollection);

    const usersData = usersSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(user => user.accountType === 'Garbage Collector' && user.lguCode === loggedInUser.lguCode);

    setUsers(usersData);
  } catch (error) {
    console.error(`Error fetching ${isPendingUsers ? 'pendingUsers' : 'users'}:`, error);
  }
};

useEffect(() => {
  console.log(`Fetching ${isPendingUsers ? 'pendingUsers' : 'users'}...`);
  fetchUsers();
}, [isPendingUsers, loggedInUser]);


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

  const handleApproveUser = async (event, userId) => {
    event.preventDefault();
    try {
      const firestore = getFirestore();
      const auth = getAuth();
  
      const pendingUserRef = doc(firestore, 'pendingUsers', userId);
      const pendingUserSnapshot = await getDoc(pendingUserRef);
  
      if (pendingUserSnapshot.exists()) {
        const userData = pendingUserSnapshot.data();
  
        // Create user in Firebase Authentication
        const { email, password } = userData; // You need to have a password for the user
        await createUserWithEmailAndPassword(auth, email, password);
  
        // Remove user from pendingUsers collection
        await deleteDoc(pendingUserRef);
  
        // Update the users collection with the approved user data
        const usersCollection = collection(firestore, 'users');
        await addDoc(usersCollection, userData);
  
        console.log('User approved successfully!');
        fetchUsers();
      } else {
        console.error('User not found in pendingUsers collection.');
      }
    } catch (error) {
      console.error('Error approving user:', error);
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

  const handleAddSchedClick =() =>{
        
    setAddSchedOpen(!isAddSchedOpen);
  }
  

  function UserListContent() {
    if (!isUsersListOpen) {
      return null; // Return null if isUserListOpen is false
    }
  
    return (
      <table className="reportTable" style={{ border: '1px solid #ddd', width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Account Type</th>
            <th>Location</th>
            {isPendingUsers && <th>License</th>}
            <th>Action</th>
          </tr>
        </thead>
        <tbody className="reportTableBody">
          {users.map((user, userID) => (
            <tr key={userID} style={{ border: '1px solid #ddd', textAlign: 'center'}}>
              <td style={{ borderRight: '1px solid #ddd' }}>{`${user.firstName} ${user.lastName}`}</td>
              <td style={{ borderRight: '1px solid #ddd' }}>{user.username}</td>
              <td style={{ borderRight: '1px solid #ddd' }}>{user.email}</td>
              <td style={{ borderRight: '1px solid #ddd' }}>{user.accountType}</td>
              <td style={{ borderRight: '1px solid #ddd' }}>{`${user.barangay}, ${user.municipality}, ${user.province}`}</td>
              {isPendingUsers && (
                <td style={{ borderRight: '1px solid #ddd' }}>
                  {user.associatedImage && (
                    <a href="#" onClick={() => { setOpenImage(true); setImageToView(user.associatedImage) }}>
                      View License
                    </a>
                  )}
                </td>
              )}
              <td>
                {isPendingUsers ? (
                  <>
                    <ImCheckmark
                      style={{ fontSize: 24, cursor: 'pointer', color: 'green', marginRight: '5px' }}
                      onClick={(event) => handleApproveUser(event, user.id)}
                    />
                    <MdDelete
                      style={{ fontSize: 24, cursor: 'pointer', color: 'red' }}
                      onClick={(event) => handleRejectUser(event, user.id)}
                    />
                  </>
                ) : (
                  <>
                    <MdOutlineModeEdit style={{ fontSize: 24, cursor: 'pointer', color: 'green' }} />
                    <MdDelete
                      style={{ fontSize: 24, gap: 5, cursor: 'pointer', color: 'red' }}
                      onClick={(event) => handleDeleteUser(event, user.id)}
                    />
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function addSideUsers() {
    return (
      <div className="add-sideUsers" style={{ padding: '10px' }}>
        <div>
          <p style={{ marginLeft: 8, fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 30, fontWeight: 800, marginBottom: 10, width: 650 }}>
            Add Users
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
        <button style={{ width: 100,  backgroundColor: '#FF6347', borderRadius: 10, borderColor: '#FF6347', padding: '8px', color: '#fff' }} onClick={handleAddSchedClick}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{ marginLeft: 40, marginTop: 40, width: 902 }}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
        <button className="pending-users-button" onClick={() => { setIsPendingUsers(!isPendingUsers); setUserListVisible(true);  setIsCollectorOpen(false);  setIsTruckOpen(false);}}>Pending Users</button>
        <div className={selectedSection === "collector" ? "click-collector active" : "click-collector"} onClick={() => { handleSectionSelect("collector"); toggleUserListVisibility(); setIsCollectorOpen(true)}}>
          Collector
        </div>
        <div className={selectedSection === "trucks" ? "click-trucks active" : "click-trucks"} onClick={() => { handleSectionSelect("trucks"); toggleUserListVisibility(); }}>
          Trucks
        </div>
        <button className="add-users-button" onClick={handleAddSchedClick}>Add+</button>

          {isAddSchedOpen && (
              <div className="modal-overlay">
                {addSideUsers()}
              </div>
            )}
      
          <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650 }}>
            {isPendingUsers ? 'Pending Users' : 'User Management'}
          </h1>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
          <input 
            type="text" 
            placeholder="Search" 
            className="searchBar" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} // Add onChange event handler
          />
          <button 
            className="searchButton" 
            onClick={handleSearch} // Add onClick event handler
          >
            <FaSearch style={{ fontSize: 20 }} />
          </button>
        </div>

            <button className="notifIcon">
              <FaBell />
            </button>
          </div>
        </div>
        <div style={{  marginTop: 70, marginBottom: 40, padding: 10, borderRadius: 20, width: 1100 }}>  
        {renderTableContent()}
        <div style={{ display: isUserListVisible ? 'block' : 'none' }}>
        <UserListContent />
      </div>
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
    </>
  );
}