import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import "../styleSheet/schedTabStyle.css";

export default function AddSchedModal({ isOpen, handleClose }) {
  const [selectedType, setSelectedType] = useState("");
  const [garbageTrucks, setGarbageTrucks] = useState([]); 
  const [selectedTruck, setSelectedTruck] = useState(""); 
  const [currentUserLguCode, setCurrentUserLguCode] = useState(""); 

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
  

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleTruckChange = async (e) => {
    setSelectedTruck(e.target.value);
  };

  return (
    <>
      {isOpen && (
        <div className="addsched-modal-overlay">
          <div className="add-sched-modal">
            <div>
              <p style={{ marginLeft: 30, fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 30, fontWeight: 800, marginBottom: 10, width: 650 }}>
                Add Schedule
              </p>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label htmlFor="scheduleType">Select Type:</label>
              <select id="scheduleType" value={selectedType} onChange={handleTypeChange}>
                <option value="">Select Type</option>
                <option value="Collection">Collection</option>
                <option value="Assignment">Assignment</option>
                <option value="Event">Event</option>
              </select>
            </div>
            {selectedType === "Collection" && (
              <>
                <input type="text" placeholder="Description" />
                <select value={selectedTruck} onChange={handleTruckChange}>
                  <option value="">Select Garbage Truck</option>
                    {garbageTrucks.map(truck => (
                      <option key={truck.id} value={truck.plateNo}>
                      {`${truck.plateNo} [Driver: ${truck.driverFirstName} ${truck.driverLastName}]`}
                  </option>
                  ))}
                </select>
                <input type="text" placeholder="Location" />
                <input type="date" placeholder="Date" />
                <input type="time" placeholder="Time" />
              </>
            )}
            {selectedType === "Assignment" && (
              <>
                <input type="text" placeholder="Description" />
                <select value={selectedTruck} onChange={handleTruckChange}>
                  <option value="">Select Garbage Truck</option>
                  {garbageTrucks.map(truck => (
                    <option key={truck.id} value={truck.plateNo}>
                    {`${truck.plateNo} [Driver: ${truck.driverFirstName} ${truck.driverLastName}]`}
                  </option>
                  ))}
                </select>
                <input type="text" placeholder="Location" />
                <input type="date" placeholder="Date" />
                <input type="time" placeholder="Time" />
              </>
            )}
            {selectedType === "Event" && (
              <>
                <input type="text" placeholder="Title" />
                <input type="text" placeholder="Description" />
                <input type="text" placeholder="Location" />
                <input type="date" placeholder="Date" />
                <input type="time" placeholder="Time" />
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <button className="cancel" onClick={handleClose}>Cancel</button>
              <button className="submit">Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
