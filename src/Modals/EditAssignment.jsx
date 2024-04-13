import React, { useState, useEffect, useRef } from "react";
import { getFirestore, collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { Autocomplete } from '@react-google-maps/api'; // Import Autocomplete

import '../styleSheet/EditModal.css';

export default function EditAssignmentModal({ isOpen, handleClose }) {
  const [garbageTrucks, setGarbageTrucks] = useState([]); 
  const [selectedTruck, setSelectedTruck] = useState(""); 
  const [currentUserLguCode, setCurrentUserLguCode] = useState(""); 
  const [location, setLocation] = useState("");

  const handleLocationChange = (e) => {
    setLocation(e.target.value);
  };

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyCCKJQavilVTZguPP8Bxy0GCPVasd3Ravg&libraries=places`;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

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
  
            setCurrentUserLguCode(userLguCode);
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
    const fetchTrucks = async () => {
      try {
        const db = getFirestore();
        const trucksCollection = collection(db, 'trucks');
        const trucksQuery = query(trucksCollection, where('lguCode', '==', currentUserLguCode));
        const trucksSnapshot = await getDocs(trucksQuery);
        const trucksData = trucksSnapshot.docs.map(doc => ({
          id: doc.id,
          plateNo: doc.data().plateNo,
          driverID: doc.data().driverID,
          driverFirstName: '', // Initialize with empty strings
          driverLastName: '', // Initialize with empty strings
        }));
    
        // After fetching trucks data, update driver names
        for (const truck of trucksData) {
          const driverDoc = await getDoc(doc(collection(db, 'users'), truck.driverID));
          if (driverDoc.exists()) {
            const driverData = driverDoc.data();
            truck.driverFirstName = driverData.firstName;
            truck.driverLastName = driverData.lastName;
            console.log(`Driver: ${truck.driverFirstName} ${truck.driverLastName}`); // Add this line for debugging
          } else {
            console.log(`Driver not found for truck with plateNo: ${truck.plateNo}`); // Add this line for debugging
          }
        }
    
        setGarbageTrucks(trucksData);
      } catch (error) {
        console.error("Error fetching trucks:", error);
      }
    };

    if(currentUserLguCode) {
      fetchTrucks();
    }
  }, [currentUserLguCode]);
  
  const handleTruckChange = async (e) => {
    setSelectedTruck(e.target.value);
  };


  const handleCancel = () => {
    handleClose();
  };

  return (
    <div className={`modal ${isOpen ? 'is-open' : ''}`}>
      <div className="modal-overlay" onClick={handleCancel}></div>
      <div className="modal-content">
        <div className="modal-header">
        <p style={{  fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 30, fontWeight: 800, marginBottom: 10, width: 650 }}>
                  Edit Assignment
          </p>
        </div>
        <div  style={{ marginBottom: 20 }}> 
          {/* <label htmlFor="scheduleType">Select Type:</label> */}
        </div>
        <div className='edit-sched-modal' >
        <input type="text" placeholder="Description" />
        <select value={selectedTruck} onChange={handleTruckChange}
          style={{ width: '80%', padding: '8px',marginBottom: '10px',border: '1px solid #ccc',borderRadius: '5px',boxSizing: 'border-box',
            marginLeft: '60px',fontFamily: 'Inter',fontSize: '16px'}}>
            <option value="">Select Garbage Truck</option>
            {garbageTrucks.map(truck => (
              <option key={truck.id} value={truck.plateNo}>
                {`${truck.plateNo} [Driver: ${truck.driverFirstName} ${truck.driverLastName}]`}
              </option>
            ))}
          </select>
          <Autocomplete
                  onLoad={(autocomplete) => {
                    console.log('Autocomplete loaded:', autocomplete);
                  }}
                  onPlaceChanged={() => {
                    console.log('Place changed');
                  }}
                >
                 <input type="text" value={location} onChange={handleLocationChange} placeholder="Location" />
                </Autocomplete>

          <input type="date" placeholder="Date" />
          <input type="time" placeholder="Time" />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <button className="cancel" onClick={handleCancel}>Cancel</button>
              <button className="submit">Save</button>
            </div>
          </div>
      </div>
  );
}
