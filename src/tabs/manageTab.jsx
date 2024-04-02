import React, { useState, useEffect } from "react";
import '../styleSheet/manageTabStyle.css';
import { navigate } from "react-router-dom"; 
import { db, storage } from '../firebase-config';
import { getFirestore, collection, getDocs, getDoc, addDoc, doc, deleteDoc, query, where, } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import AddTruckModal from "../Modals/AddTruck";

import { FaSearch, FaBell } from 'react-icons/fa';
import { MdOutlineModeEdit, MdDelete } from 'react-icons/md';
import { ImCheckmark } from 'react-icons/im';
import { Button } from "@mui/material";
import { render } from "@testing-library/react";

export default function UserManage() {
  const [users, setUsers] = useState([]);
  const [isPendingUsers, setIsPendingUsers] = useState(false);
  const [lguCode, setLguCode] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserLguCode, setCurrentUserLguCode] = useState(""); // Added state for current user's lguCode

  let imageURL, viewImageURL;
  const [userLicense, setUserLicense] = useState([]);
  const [openImage, setOpenImage] = useState(false);
  const [imageToView, setImageToView] = useState();
  const imageColRef = ref(storage, "userWorkID/");

  const [isAddSchedOpen, setAddSchedOpen] =useState(false);
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState("collector");  // Set default selected section to "collector"
  const [isCollectorOpen, setIsCollectorOpen] = useState(true); // Initially open
  const [isUsersListOpen, setIsUsersListOpen]  =useState(true);
  const [isTruckOpen, setIsTruckOpen] = useState(false);
  const [isUserListVisible, setUserListVisible] = useState(true);
  const [trucks, setTrucks] = useState([]);

  const fetchLoggedInUserLguCode = async () => {
    try {
      const auth = getAuth();
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // User is signed in
          const email = user.email;
  
          // Fetch user data from 'users' collection based on email
          const firestore = getFirestore();
          const usersCollection = collection(firestore, 'users');
          const querySnapshot = await getDocs(query(usersCollection, where('email', '==', email)));
  
          if (!querySnapshot.empty) {
            // Assuming email is unique, there should be only one user
            const userData = querySnapshot.docs[0].data();
            const userLguCode = userData.lguCode;
  
            // Set the user's LGU code in state
            setCurrentUserLguCode(userLguCode);
          }
        }
      });
    } catch (error) {
      console.error('Error fetching logged-in user data:', error);
    }
  };
  
  // Call the function when the component mounts
  useEffect(() => {
    fetchLoggedInUserLguCode();
  }, []);

  const fetchTrucks = async () => {
    try {
      const firestore = getFirestore();
      const trucksCollection = collection(firestore, 'trucks');
      const trucksSnapshot = await getDocs(trucksCollection);
      const trucksData = trucksSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      // Sort the trucks based on the dateTime field in descending order
      const sortedTrucks = trucksData.sort((a, b) => b.dateTime - a.dateTime);
      
      setTrucks(sortedTrucks);
    } catch (error) {
      console.error('Error fetching trucks:', error);
    }
  };
  
  // Call fetchTrucks function when component mounts
  useEffect(() => {
    if (selectedSection === 'trucks' && isTruckOpen) {
      fetchTrucks();
    }
  }, [selectedSection, isTruckOpen]);

  const handleCloseModal = () => {
    setAddSchedOpen(false);
  };
  
  const toggleUserListVisibility = () => {
    setUserListVisible(!isUserListVisible);
    setUserListVisible(false);   
  };

  const handlePendingUsersClick = () => {
    setIsPendingUsers(!isPendingUsers);
    setUserListVisible(true);
    setIsCollectorOpen(false);
    setIsTruckOpen(false);
  };
  
  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    if (section === "collector") {
      setIsCollectorOpen(true);
      setIsTruckOpen(false);
      setUserListVisible(true); 
      setUsers([]); 
      fetchUsers(); 
    } else if (section === "trucks") {
      setIsCollectorOpen(false);
      setIsTruckOpen(true);
      setUserListVisible(false); 
    }
  };

  const handleEditTruck = (truckId) => {
    // Implement logic to handle editing the truck with the given ID
  };
  
  const handleDeleteTruck = async (truckId) => {
    try {
      const firestore = getFirestore();
      const truckRef = doc(firestore, 'trucks', truckId);
      await deleteDoc(truckRef);
      console.log('Truck deleted successfully!');
      fetchTrucks(); // Optionally, you may fetch trucks again to update the UI
    } catch (error) {
      console.error('Error deleting truck:', error);
    }
  };
  
  

  const renderTableContent = () => {
    if (isPendingUsers) {
      return null; // Return null when Pending Users is active
    }
    if (selectedSection === "collector" && isCollectorOpen) {
      const filteredUsers = users.filter(user => user.accountType === 'Garbage Collector');
  
      return (
        <table className="reportTable" style={{ border: '1px solid #ddd', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Location</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="reportTableBody">
            {filteredUsers.map((user) => (
              <tr key={user.id} style={{ border: '1px solid #ddd', textAlign: 'center'}}>
                <td style={{ borderRight: '1px solid #ddd' }}>{`${user.firstName} ${user.lastName}`}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{user.username}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{user.email}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{user.contactNo}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{`${user.barangay}, ${user.municipality}, ${user.province}`}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>
                  <MdDelete
                    style={{ fontSize: 24, cursor: 'pointer', color: 'red' }}
                    onClick={(event) => handleDeleteUser(event, user.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else if (selectedSection === "trucks" && isTruckOpen) {
      //const sortedTrucks = trucks.sort((a, b) => b.dateTime - a.dateTime);

      return (
        <table className="reportTable" style={{ border: '1px solid #ddd', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th>Truck No.</th>
              <th>Plate No.</th>
              <th>Driver Name</th>
              <th>Collector/s</th> 
              <th>Action</th> 
            </tr>
          </thead>
          <tbody className="reportTableBody">
            {trucks.map((truck, index) => {
              const collectorNames = getCollectorNames(truck.members);
              console.log("Collector Names for Truck", index + 1, ":", collectorNames);
              return (
                <tr key={truck.id} style={{ border: '1px solid #ddd', textAlign: 'center'}}>
                  <td style={{ borderRight: '1px solid #ddd' }}>{index + 1}</td>
                  <td style={{ borderRight: '1px solid #ddd' }}>{truck.plateNo}</td>
                  <td style={{ borderRight: '1px solid #ddd' }}>{getDriverName(truck.driverID)}</td>
                  <td style={{ borderRight: '1px solid #ddd' }}>{getCollectorNames(truck.members)}</td>
                  <td style={{ borderRight: '1px solid #ddd' }}>
                    <MdOutlineModeEdit
                      style={{ fontSize: 22, cursor: 'pointer', color: 'green', marginRight: '10px' }}
                      onClick={() => handleEditTruck(truck.id)} // Implement handleEditTruck function
                    />
                    <MdDelete
                      style={{ fontSize: 22, cursor: 'pointer', color: 'red' }}
                      onClick={() => handleDeleteTruck(truck.id)} // Implement handleDeleteTruck function
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
  }

  const getDriverName = (driverID) => {
    const driver = users.find(user => user.id === driverID);
    return driver ? `${driver.firstName} ${driver.lastName}` : '';
  };

  const getCollectorNames = (members) => {
    if (!members || !Array.isArray(members.collector)) return ''; // Return empty string if members or members.collector is not defined or not an array
    const collectorNames = members.collector.map(collector => {
      const foundUser = users.find(user => user.id === collector.id);
      return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : '';
    });
    return collectorNames.join(', ');
  };
  
  const fetchUsers = async () => {
    try {
      const firestore = getFirestore();
      let usersCollection;
  
      if (isPendingUsers) {
        const q = query(collection(firestore, 'pendingUsers'), where('lguCode', '==', currentUserLguCode));
        const usersSnapshot = await getDocs(q);
        const pendingUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setUsers(pendingUsers);
        return;
      } else {
        usersCollection = collection(firestore, 'users');
  
        if (selectedSection === 'collector') {
          const q = query(usersCollection, where('accountType', '==', 'Garbage Collector'), where('lguCode', '==', currentUserLguCode));
          const usersSnapshot = await getDocs(q);
          const filteredUsers = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setUsers(filteredUsers);
          return;
        }
      }
  
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error(`Error fetching ${isPendingUsers ? 'pendingUsers' : 'users'}:`, error);
    }
  };
  
  
  
  useEffect(() => {
    console.log(`Fetching ${isPendingUsers ? 'pendingUsers' : 'users'}...`);
    fetchUsers();
  }, [isPendingUsers]);

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
  
    if (isPendingUsers) {
      return (
        <table className="reportTable" style={{ border: '1px solid #ddd', width: '100%' }}>
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
          <tbody className="reportTableBody">
            {users.map((user, userID) => (
              <tr key={userID} style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                <td style={{ borderRight: '1px solid #ddd' }}>{`${user.firstName} ${user.lastName}`}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{user.username}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{user.email}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{user.accountType}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{`${user.barangay}, ${user.municipality}, ${user.province}`}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>
                  {user.associatedImage && (
                    <a href="#" onClick={() => { setOpenImage(true); setImageToView(user.associatedImage) }}>
                      View License
                    </a>
                  )}
                </td>
                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    } else {
      //return renderTableContent();  
    }
  }
  
  return (
    <>
      <div style={{ marginLeft: 40, marginTop: 40, width: 902 }}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
          <button className="pending-users-button" onClick={handlePendingUsersClick}>Pending Users</button>
          {!isPendingUsers && (
            <>
              <div
                className={selectedSection === "collector" ? "click-collector active" : "click-collector"}
                onClick={() => { handleSectionSelect("collector"); toggleUserListVisibility(); setIsCollectorOpen(true);
                }}>Collector</div>
              <div className={selectedSection === "trucks" ? "click-trucks active" : "click-trucks"}
                onClick={() => {handleSectionSelect("trucks");  toggleUserListVisibility();
                }}> Trucks</div>
            </>
          )}
        <button className="add-users-button" onClick={handleAddSchedClick}>Add Truck +</button>
          {isAddSchedOpen && (
              <div className="modal-overlay"> 
                  <AddTruckModal isOpen={isAddSchedOpen} handleClose={handleCloseModal} />
              </div>
            )}
          <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650 }}>
            {isPendingUsers ? 'Pending Users' : 'User Management'}
          </h1>
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