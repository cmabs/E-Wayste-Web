import React, { useState, useEffect } from "react";
import '../styleSheet/manageTabStyle.css';
import { db, storage } from '../firebase-config';
import { getFirestore, collection, getDocs, getDoc, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';

import { FaSearch, FaBell } from 'react-icons/fa';
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

  const fetchUsers = async () => {
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

  const handleApproveUser = async (event, userId) => {
    event.preventDefault();
    try {
      const firestore = getFirestore();
      
      const pendingUserRef = doc(firestore, 'pendingUsers', userId);
      const pendingUserSnapshot = await getDoc(pendingUserRef);
      
      if (pendingUserSnapshot.exists()) {
        const userData = pendingUserSnapshot.data();
        const usersCollection = collection(firestore, 'users');
        await addDoc(usersCollection, userData);
        await deleteDoc(pendingUserRef);
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

  // const handleImageClick = async () => {
  //   try {
  //     const imageUrl = await getDownloadURL(ref(storage, `${userWorkID}/${imageFileName}`));
  //     console.log('Displaying image:', imageUrl);
  //   } catch (error) {
  //     console.error('Error getting image download URL:', error);
  //   }
  // };

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
                <div style={{ width: '18%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.username}</p>
                </div>
                <div style={{ width: '23%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.email}</p>
                </div>
                <div style={{ width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                  <p>{user.accountType}</p>
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
                        onClick={(event) => handleApproveUser(event, user.id)}
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
                  {/* Conditionally show "Edit" and "Delete" buttons based on whether it is pending users or not */}
                  {!isPendingUsers && (
                    <>
                      <MdOutlineModeEdit style={{ fontSize: 24, cursor: 'pointer', color: 'green' }} />
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
      <div style={{ marginLeft: 40, marginTop: 40, width: 902 }}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
          <button className="pending-users-button" onClick={() => setIsPendingUsers(!isPendingUsers)}>Pending Users</button>
          <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650 }}>
            {isPendingUsers ? 'Pending Users' : 'User Management'}
          </h1>
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
        <div style={{ marginTop: 70, marginBottom: 40, backgroundColor: 'rgb(243,243,243)', padding: 10, borderRadius: 20, width: 1100 }}>
          <div style={{ display: 'flex', width: '100%', borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderColor: 'rgb(210,210,210)', marginBottom: 10, fontFamily: 'Inter', fontWeight: 500, fontSize: 14 }}>
            {!isPendingUsers ?
              <>
                <div style={{ display: 'flex', marginLeft: 60, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Name</p>
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
                <div style={{ display: 'flex', marginLeft: 50, overflow: 'hidden', justifyContent: 'center' }}>
                  <p>Name</p>
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
    </>
  );
}
