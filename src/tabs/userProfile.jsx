import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import userlogo from '../images/userlogo.png';
import '../styleSheet/Profile.css';
import { db } from "../firebase-config";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore"; // Import needed Firestore functions
import EditIcon from '@mui/icons-material/Edit';

export default function Profile() {
    const [userProfile, setUserProfile] = useState(null);
    //const [editedAddress, setEditedAddress] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [editedContactNo, setEditedContactNo] = useState('');
    const [editedFirstname, setEditedFirstname] = useState('');
    const [editedLastname, setEditedLastname] = useState('');
    const [editedUsername, setEditedUsername] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
  
    const navigate = useNavigate();
    const auth = getAuth();
  
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user) {
          fetchUserProfile(user);
        } else {
          navigate("/login");
        }
      });
  
      const fetchUserProfile = async (user) => {
        try {
          if (user) {
            const userEmail = user.email;
            const userRef = query(collection(db, "usersAdmin"), where('email', '==', userEmail));
            const querySnapshot = await getDocs(userRef);
            if (!querySnapshot.empty) {
              const doc = querySnapshot.docs[0];
              const { firstName, lastName, username,email,  contactNo} = doc.data();
              const displayName = `${firstName} ${lastName}`;
  
              setUserProfile({ displayName, username, email, contactNo });
              setEditedUsername(username)
              setEditedEmail(email);
              setEditedContactNo(contactNo);

            } else {
              console.log("User profile not found");
            }
          } else {
            console.log("No user is currently signed in");
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      };
  
      return () => unsubscribe(); // Cleanup subscription
    }, [auth, navigate]);

    const handleSaveProfile = async () => {
      try {
          // Query the collection to find the document with the user's email
          const userRef = query(collection(db, "users"), where('email', '==', userProfile.email));
          const querySnapshot = await getDocs(userRef);
  
          // Ensure the query result is not empty and extract the document ID (UID)
          if (!querySnapshot.empty) {
              const doc = querySnapshot.docs[0];
              const userId = doc.id;
  
              // Update the document with the extracted UID
              const userDocRef = doc(db, `users/${userId}`); // Corrected line
              await updateDoc(userDocRef, {
                  username: editedUsername,
                  email: editedEmail,
                  contactNo: editedContactNo,
              });
              console.log("Profile updated successfully!");
              setIsEditMode(false); // Exit edit mode upon successful save
              // Optionally, refetch or update local state to reflect changes
              alert("Profile updated successfully!");
          } else {
              console.log("No user document found for the email:", userProfile.email);
              alert("Failed to save profile. Please try again.");
          }
      } catch (error) {
          console.error("Error updating profile:", error);
          alert("Failed to save profile. Please try again.");
      }
  };
  
  
   
  return (
    <>
      <div style={{ marginLeft: 40, marginTop: 0, width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 10 }}> User Profile</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20, backgroundColor: '#F6F6F6', padding: 20, borderRadius: 10, width: 1050 }}>
          <div className="profilePic">
            <img src={userlogo} alt="user-logo" className="logoImage" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
              <h1 style={{ margin: 0, padding: 0, marginTop: 0, fontFamily: 'Inter', fontSize: '2.4em', fontWeight: 800 }}>{userProfile?.displayName || "Loading..."}</h1>
              <div onClick={() => setIsEditMode(true)} style={{ cursor: 'pointer', color: 'white', borderRadius: 20, marginLeft: 'auto' }}>
                <EditIcon style={{ backgroundColor: '#51AF5B', padding: 5, borderRadius: 20 }} />
              </div>
            </div>
            <p style={{ margin: 0, padding: 0, fontFamily: 'Inter', fontSize: '1.2em', color: '#555' }}>Admin</p>
          </div>
        </div>,
        <div style={{ marginTop: 0, display: 'flex', flexDirection: 'column' }}>
          <div className="bgInfo">
            <h1 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 700, fontSize: 20 }}>Personal Info</h1>
            <div style={{ display: 'flex', width: '100%', flexDirection: 'column', alignItems: "flex-end" }}>
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', borderStyle: "solid", borderWidth: 1, borderColor: 'green', paddingTop: 15, paddingBottom: 20 }}>
                <div style={{ display: 'flex', flexDirection: 'row', flex: 1, marginLeft: 20 }}>
                  <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: 43, paddingTop: 26 }}>
                    <p className="form-label">Username</p>
                    <p className="form-label">Email</p>
                    <p className="form-label">Contact No.</p>
                  </div>
                  <div style={{ display: 'flex', flex: 3, flexDirection: 'column', gap: 20, paddingTop: 10, paddingRight: 20 }}>
                    <input className={`form-input ${!isEditMode ? 'form-input-read-only' : ''}`} type="text" value={editedUsername} onChange={(e) => setEditedUsername(e.target.value)} readOnly={!isEditMode} />
                    <input className={`form-input ${!isEditMode ? 'form-input-read-only' : ''}`} type="text" value={editedEmail} onChange={(e) => setEditedEmail(e.target.value)} readOnly={!isEditMode} />
                    <input className={`form-input ${!isEditMode ? 'form-input-read-only' : ''}`} type="text" value={editedContactNo} onChange={(e) => setEditedContactNo(e.target.value)} readOnly={!isEditMode} />
                  </div>
                </div>
                <div style={{ display: 'flex', flex: 1, justifyContent: "center", paddingTop: 50, gap: 30 }}>
                  {isEditMode && (
                    <>
                      <button className="btnSave" onClick={handleSaveProfile} disabled={!isEditMode}>Save</button>
                      <button className="btnCancel" onClick={() => setIsEditMode(false)}>Cancel</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
