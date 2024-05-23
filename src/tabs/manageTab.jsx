import React, { useState, useEffect } from "react";
import '../styleSheet/manageTabStyle.css';
import { db, storage } from '../firebase-config';
import { getFirestore, collection, getDocs, getDoc, addDoc, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { v4 as uuidv4 } from "uuid";
import { FaSearch, FaBell } from 'react-icons/fa';
import { MdDelete } from 'react-icons/md';
import { ImCheckmark } from 'react-icons/im';
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
  const [viewMode, setViewMode] = useState('users'); // New state for view mode
  const [openImage, setOpenImage] = useState(false);
const [imageToView, setImageToView] = useState('');
// const [viewImageURL, setViewImageURL] = useState('');
const [truckLicenseImages, setTruckLicenseImages] = useState({});



  const [trucks, setTrucks] = useState([]);
  let imageURL, viewImageURL;
  const [userLicense, setUserLicense] = useState([]);
  const imageColRef = ref(storage, "userWorkID/");

  const handleViewImage = (imageUrl) => {
    setImageToView(imageUrl);
    setOpenImage(true);
  };
   
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

  
  

  useEffect(() => {
    fetchTrucks();
    fetchUsers();
  }, []);

  const fetchTrucks = async () => {
    try {
      const firestore = getFirestore();
      const trucksCollection = collection(firestore, 'trucks');
      const trucksSnapshot = await getDocs(trucksCollection);
      const trucksData = trucksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTrucks(trucksData);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const firestore = getFirestore();
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
  
      let usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      usersData = usersData.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toUpperCase();
        const nameB = `${b.firstName} ${b.lastName}`.toUpperCase();
  
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
  
      setUsers(usersData);
      setUserTotal(usersData.length);
    } catch (error) {
      console.error(`Error fetching ${isPendingUsers ? 'pendingUsers' : 'users'}:`, error);
    }
  };
  
  const fetchPendingUsers = async () => {
    try {
      const firestore = getFirestore();
      const pendingUsersCollection = collection(firestore, 'pendingUsers');
      const pendingUsersSnapshot = await getDocs(pendingUsersCollection);
  
      let pendingUsersData = pendingUsersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  
      pendingUsersData = pendingUsersData.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toUpperCase();
        const nameB = `${b.firstName} ${b.lastName}`.toUpperCase();
  
        if (sortOrder === 'asc') {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
  
      setUsers(pendingUsersData);
      setUserTotal(pendingUsersData.length);
    } catch (error) {
      console.error('Error fetching pendingUsers:', error);
    }
  };
 
  useEffect(() => {
    if (isPendingUsers) {
      fetchPendingUsers();
    } else {
      fetchUsers();
    }
  }, [isPendingUsers]);
  

  const getDriverName = (driverID) => {
    const driver = users.find(user => user.id === driverID);
    return driver ? `${driver.firstName} ${driver.lastName}` : '';
  };

  const getCollectorNames = (members) => {
    if (!members || !Array.isArray(members.collector)) return '';
    const collectorNames = members.collector.map(collector => {
      const foundUser = users.find(user => user.id === collector.id);
      return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : '';
    });
    return collectorNames.join(', ');
  };

  const toggleNotification = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  useEffect(() => {
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
      fetchUsers();
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
    setSortOrder((prevSortOrder) => (prevSortOrder === 'asc' ? 'desc' : 'asc'));
  };
  
  const handleDeleteUser = async (event, userId) => {
    event.preventDefault();
    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'users', userId);
      await deleteDoc(userRef);
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
        fetchUsers();
        openSuccessModal();
      } else {
        console.error('User not found in pendingUsers collection.');
      }
    } catch (error) {
      console.error('Error approving user:', error);
  
      if (error.code === 'auth/email-already-in-use') {
        alert('The email address is already in use.');
      } else {
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
      <table className="userTable" style={{justifyContent: 'center'}}>
        <thead style={{ backgroundColor: '#BDE47C',cursor: 'pointer', justifyContent: 'center', }}>
          <tr>
            <th onClick={toggleSortOrder} style={{ cursor: 'pointer' }}>
              Name {sortOrder === 'asc' ? '↑' : '↓'}
            </th>
            <th>Username</th>
            <th>Email</th>
            <th>Account Type</th>
            <th>Location</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>
                {user.highlightedName ? (
                  <span dangerouslySetInnerHTML={{ __html: user.highlightedName }}></span>
                ) : (
                  `${user.firstName} ${user.lastName}`
                )}
              </td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.accountType}</td>
              <td>{`${user.barangay}, ${user.municipality}, ${user.province}`}</td>
              <td>
                <button
                  className="delete-button"
                  onClick={(event) => handleDeleteUser(event, user.id)}
                >
                  <MdDelete size={24}  style={{color:'red'}}/>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  function TruckListContent() {
    return (
      <table className="userTable">
        <thead>
          <tr>
            <th>Plate No.</th>
            <th>Driver Name</th>
            <th>Collector/s</th> 
            <th>Action</th> 
          </tr>
        </thead>
        <tbody>
          {trucks.map((truck) => (
            <tr key={truck.id}>
              <td>{truck.plateNo}</td>
              <td>{getDriverName(truck.driverID)}</td>
              <td>{getCollectorNames(truck.members)}</td>
              <td>
                <button
                  className="delete-button"
                  onClick={(event) => handleDeleteUser(event, truck.id)}
                >
                  <MdDelete size={24} style={{color:'red'}} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  

  function PendingUserList() {
    useEffect(() => {
      fetchPendingUsers();
    }, []); // Ensure this only runs once on mount to fetch pending users
  
    return (
      <table className="userTablePending">
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Account Type</th>
            <th>Location</th>
            <th>License</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>{user.accountType}</td>
              <td>{`${user.barangay}, ${user.municipality}, ${user.province}`}</td>
              <td>
              {isPendingUsers && (
                  <>
                    {userLicense.map((url) => {
                      if(url.includes(user.associatedImage)) {
                          imageURL = url;
                      }
                    })}
                    <div style={{ width: '100%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
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
            </td>
              <td>
                <button
                  className="approve-button"
                  onClick={(event) => handleApproveUser(event, user.id)}
                >
                  <ImCheckmark size={24} style={{color:'green'}}/>
                </button>
                <button
                  className="reject-button"
                  onClick={(event) => handleRejectUser(event, user.id)}
                >
                  <MdDelete size={24} style={{color:'red'}} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  
  

  return (
    <div className="user-manage">
      <div className="header">
      <h2>
          {viewMode === 'trucks' 
            ? 'Manage Trucks' 
            : viewMode === 'pending' 
            ? 'Manage Pending Users' 
            : 'Manage Users'}
      </h2>

        <div className="toggle-buttons">
        <button className="users-button" onClick={() => { setViewMode('users'); setIsPendingUsers(false); }}>Users</button>
        <button  className ="trucks-button" onClick={() => { setViewMode('trucks'); setIsPendingUsers(false); }}>Trucks</button>
        <button className="pending-users-button" onClick={() => { setViewMode('pending'); setIsPendingUsers(true); }}>Pending Users</button>
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
            <FaBell size={24} />
          </button>
        </div>
      </div>
      <div>
        <div style={{ marginBottom: 30, marginTop: 20, display: 'flex', marginLeft: 700, fontFamily: 'Inter', fontSize: 14 }}>
          <label style={{ marginTop: 10 }} htmlFor="accountType">Account Type:</label>
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
        </div>
        <div className="user-list">
          {viewMode === 'trucks' ? <TruckListContent /> : viewMode === 'pending' ? <PendingUserList /> : <UserListContent />}
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
        {isNotificationOpen && <Notification />}
      </div>
    </div>
  );
}
