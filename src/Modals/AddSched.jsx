import React, { useState, useEffect, useRef } from "react";
import { getFirestore, collection, getDocs, getDoc, doc, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import "../styleSheet/schedTabStyle.css";
import { GoogleMap, LoadScript, Autocomplete } from '@react-google-maps/api'; // Import the necessary components
import { FaMapMarkerAlt, FaTimes} from 'react-icons/fa'; // Import the Map Marker icon from react-icons/fa
import moment from 'moment';

const libraries = ["places"];
const mapContainerStyle = {
  width: '100%',
  height: '200px',
};

export default function AddSchedModal({ isOpen, handleClose }) {
  const [selectedType, setSelectedType] = useState("");
  const [garbageTrucks, setGarbageTrucks] = useState([]); 
  const [selectedTruck, setSelectedTruck] = useState(""); 
  const [currentUserLguCode, setCurrentUserLguCode] = useState(""); 
  const [location, setLocation] = useState(""); 
  const [selectedDate, setSelectedDate] = useState(""); 
  const [startTime, setStartTime] = useState(""); 
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState(""); 
  const [longitude, setLongitude] = useState(""); 
  const [userData, setUserData] = useState("");
  const [locations, setLocations] = useState([]); 
  const [collectionRoute, setCollectionRoute] = useState({ coordinates: [] }); 

  const autocompleteRef = useRef(null); 
  const db = getFirestore();

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

            const userID = querySnapshot.docs[0].id;
            setUserData({ ...userData, userID });
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
          driverFirstName: '', 
          driverLastName: '', 
        }));

        for (const truck of trucksData) {
          const driverDoc = await getDoc(doc(collection(db, 'users'), truck.driverID));
          if (driverDoc.exists()) {
            const driverData = driverDoc.data();
            truck.driverFirstName = driverData.firstName;
            truck.driverLastName = driverData.lastName;
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
  
  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleTruckChange = async (e) => {
    setSelectedTruck(e.target.value);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleAddLocation = () => {
    if (location && latitude && longitude) {
      setLocations([...locations, { name: locations.length, locationName: location, latitude, longitude }]);
  
      setCollectionRoute(prevRoute =>
         ({
        coordinates: [
          ...prevRoute.coordinates,
          { name: locations.length, locationName: location, latitude, longitude }
        ]
      }));
      setLocation(""); 
    } else {
      alert("Please select a location properly.");
    }
  };
     

  const handleRemoveLocation = (indexToRemove) => {
    const updatedLocations = locations.filter((_, index) => index !== indexToRemove);
    setLocations(updatedLocations);
  
    const updatedCoordinates = collectionRoute.coordinates.filter((_, index) => index !== indexToRemove);
    setCollectionRoute(prevRoute => ({
      ...prevRoute,
      coordinates: updatedCoordinates
    }));
  };
  

  const handlePlaceSelect = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      setLocation(place.formatted_address);

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      setLatitude(lat); 
      setLongitude(lng);
      console.log("Latitude:", lat);
      console.log("Longitude:", lng);
    }
  };  

  const formatTime = (time) => {
    const date = new Date(`1970-01-01T${time}`);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const generateUniqueScheduleID = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let scheduleID = '';
  
    for (let i = 0; i < 10; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      scheduleID += characters.charAt(randomIndex);
    }
  
    return scheduleID;
  };  

  const handleSave = async () => {
    try {
      const formattedStartTime = formatTime(startTime);
      const fullDateTime = moment().utcOffset('+08:00').format('YYYY/MM/DD hh:mm:ss a');
  
      if (!selectedType) {
        alert("Please select a schedule type.");
        return;
      }
  
      if (selectedType === "Collection" || selectedType === "Assignment") {
        if (!selectedTruck) {
          alert("Please select a garbage truck.");
          return;
        }
        if (selectedType === "Collection" && collectionRoute.coordinates.length === 0) {
          alert("Please add at least one location for collection.");
          return;
        }
        if (collectionRoute.coordinates.some(coord => !coord.latitude || !coord.longitude)) {
          alert("Please select locations properly.");
          return;
        }
      } else {
        if (!location) {
          alert("Please enter a location.");
          return;
        }
        if (!latitude || !longitude) {
          alert("Please select a location properly.");
          return;
        }
      }
  
      let scheduleData;
  
      if (selectedType === 'Collection') {
        scheduleData = {
          scheduleID: generateUniqueScheduleID(),
          type: selectedType,
          description: description || 'N/A',
          startTime: formattedStartTime,
          userID: userData ? userData.userID : null,
          assignedTruck: selectedTruck,
          selectedDate,
          collectionRoute,
          dateTimeUploaded: fullDateTime,
          collectionRecord: [],
          visibility: 'enable'
        };
      } else if (selectedType === 'Assignment') {
        scheduleData = {
          scheduleID: generateUniqueScheduleID(),
          type: selectedType,
          description: description || 'N/A',
          startTime: formattedStartTime,
          userID: userData ? userData.userID : null,
          assignedTruck: selectedTruck,
          selectedDate,
          location,
          latitude,
          longitude,
          dateTimeUploaded: fullDateTime,
          collectionRecord: {
            status: 'uncollected',
            dateTimeCollected: ''
          }
        };
      } else if (selectedType === 'Event') {
        scheduleData = {
          scheduleID: generateUniqueScheduleID(),
          type: selectedType,
          description: description || 'N/A',
          startTime: formattedStartTime,
          title: title || 'N/A',
          userID: userData ? userData.userID : null,
          location,
          latitude,
          longitude,
          selectedDate,
          dateTimeUploaded: fullDateTime
        };
      }
  
      // Add scheduleData to Firestore
      await addDoc(collection(db, 'schedule'), scheduleData);
      alert("Schedule successfully added!");
  
      // Clear form fields and state
      setSelectedType("");
      setSelectedTruck("");
      setLocation("");
      setSelectedDate("");
      setStartTime("");
      setDescription("");
      setLocations([]);
      setCollectionRoute({ coordinates: [] });
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  
  return (
    <>
      {isOpen && (
        <div className="addsched-modal-overlay">
        <div className="add-sched-modal" style={{ height: '550px', overflowY: 'auto'}}> 
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
                <input type="text" placeholder="Description" value={description} onChange={handleDescriptionChange} />
                <select value={selectedTruck} onChange={handleTruckChange}>
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
                    autocompleteRef.current = autocomplete;
                  }}
                  onPlaceChanged={handlePlaceSelect}
                >
                  <>
                  <input
                    id="location"
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    style={{ width: 'calc(78% - 50px)', marginRight: '-2px' }} // Adjust width and add right margin
                  />
                  <button className="add-location-button" onClick={handleAddLocation}>+</button>
                </>
                </Autocomplete>
                <div>
                  {locations.map((location, index) => (
                    <div key={index} className="selected-location">
                      <span className="location-icon" style={{ color: 'red' }}><FaMapMarkerAlt /></span> 
                      <span>{location.locationName}</span> 
                      <span className="remove-location" onClick={() => handleRemoveLocation(index)}><FaTimes /></span> {/* Use the Times icon for removal */}
                    </div>
                  ))}
                </div>
                <input type="date" placeholder="Date" value={selectedDate} onChange={handleDateChange} />
                <input type="time" placeholder="Time" value={startTime} onChange={handleTimeChange} />
              </>
            )}
            {selectedType === "Assignment" && (
              <>
                <input type="text" placeholder="Description" value={description} onChange={handleDescriptionChange} />
                <select value={selectedTruck} onChange={handleTruckChange}>
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
                    autocompleteRef.current = autocomplete;
                  }}
                  onPlaceChanged={handlePlaceSelect}
                >
                  <input
                    id="location"
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Autocomplete>
                <input type="date" placeholder="Date" value={selectedDate} onChange={handleDateChange} />
                <input type="time" placeholder="Time" value={startTime} onChange={handleTimeChange} />
              </>
            )}
            {selectedType === "Event" && (
              <>
                <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <input type="text" placeholder="Description" value={description} onChange={handleDescriptionChange} />
                <Autocomplete
                  onLoad={(autocomplete) => {
                    console.log('Autocomplete loaded:', autocomplete);
                    autocompleteRef.current = autocomplete;
                  }}
                  onPlaceChanged={handlePlaceSelect}
                >
                  <input
                    id="location"
                    type="text"
                    placeholder="Enter location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Autocomplete>
                <input type="date" placeholder="Date" value={selectedDate} onChange={handleDateChange} />
                <input type="time" placeholder="Time" value={startTime} onChange={handleTimeChange} />
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
              <button className="cancel" onClick={handleClose}>Cancel</button>
              <button className="submit" onClick={handleSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
