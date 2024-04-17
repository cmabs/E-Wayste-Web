import React, { useState, useEffect, useRef } from "react";
import { getFirestore, collection, getDocs, getDoc, doc, query, updateDoc, where, addDoc, serverTimestamp } from 'firebase/firestore';
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

export default function EditSchedModal({ isOpen, handleClose, selectedScheduleId }) {
  const [scheduleData, setScheduleData] = useState(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedTruck, setSelectedTruck] = useState(""); 
  const [garbageTrucks, setGarbageTrucks] = useState([])
  const [location, setLocation] = useState(""); 
  const [selectedDate, setSelectedDate] = useState(""); 
  const [startTime, setStartTime] = useState(""); 
  const [description, setDescription] = useState("");
  const [title, setTitle] = useState("");
  const [latitude, setLatitude] = useState(""); 
  const [longitude, setLongitude] = useState(""); 
  const [locations, setLocations] = useState([]); 
  const [collectionRoute, setCollectionRoute] = useState({ coordinates: [] }); 
  const autocompleteRef = useRef(null); // Define the autocompleteRef

  useEffect(() => {
    const fetchScheduleData = async () => {
      try {
        const db = getFirestore();
        const scheduleDocRef = doc(db, 'schedule', selectedScheduleId);
        const scheduleDocSnapshot = await getDoc(scheduleDocRef);
        if (scheduleDocSnapshot.exists()) {
          const scheduleData = scheduleDocSnapshot.data();
          setScheduleData(scheduleData);
          setSelectedType(scheduleData.type);
          setSelectedTruck(scheduleData.assignedTruck);
          setLocation(scheduleData.location);
          setSelectedDate(scheduleData.selectedDate);
          const startTime24Hour = moment(scheduleData.startTime, 'hh:mm A').format('HH:mm');
          setStartTime(startTime24Hour);
          setDescription(scheduleData.description);
          setTitle(scheduleData.title);
          setLocations(scheduleData.collectionRoute.coordinates);
          setCollectionRoute(scheduleData.collectionRoute);
          setLatitude(scheduleData.latitude);
          setLongitude(scheduleData.longitude);
        } else {
          console.log("Schedule not found");
        }
      } catch (error) {
        console.error("Error fetching schedule data:", error);
      }
    };

    if (isOpen && selectedScheduleId) {
      fetchScheduleData();
    }
  }, [isOpen, selectedScheduleId]);

  useEffect(() => {
    const fetchGarbageTrucks = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        
        // Check if user is logged in
        if (user) {
          const userEmail = user.email;
          const db = getFirestore();
          const usersCollection = collection(db, 'users');
          const querySnapshot = await getDocs(query(usersCollection, where("email", "==", userEmail)));
          
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            const lguCode = userData.lguCode;
  
            const trucksCollection = collection(db, 'trucks');
            const trucksQuerySnapshot = await getDocs(query(trucksCollection, where("lguCode", "==", lguCode)));
            
            const trucksData = trucksQuerySnapshot.docs.map(doc => ({
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
                console.log(`Driver not found for truck with plateNo: ${truck.plateNo}`);
              }
            }
  
            setGarbageTrucks(trucksData);
          } else {
            console.log("User document not found");
          }
        }
      } catch (error) {
        console.error("Error fetching garbage trucks:", error);
      }
    };
  
    fetchGarbageTrucks();
  }, []);
  
  const formatTime = (time) => {
    const date = new Date(`1970-01-01T${time}`);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleTypeChange = (e) => {
    setSelectedType(e.target.value);
  };

  const handleTruckChange = (e) => {
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

  const handleSaveChanges = async () => {
    try {
      const formattedStartTime = formatTime(startTime);
      const fullDateTime = moment().utcOffset('+08:00').format('YYYY/MM/DD hh:mm:ss a');

      const db = getFirestore();
      const scheduleDocRef = doc(db, 'schedule', selectedScheduleId);
      await updateDoc(scheduleDocRef, {
        type: selectedType,
        assignedTruck: selectedTruck,
        dateTimeUploaded: fullDateTime,
        location,
        selectedDate,
        startTime: formattedStartTime,
        description,
        title,
        latitude,
        longitude,
        collectionRoute,
      });
      alert("Changes saved successfully!");
      handleClose();
    } catch (error) {
      console.error("Error saving changes:", error);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="addsched-modal-overlay">
        <div className="add-sched-modal" style={{ height: '550px', overflowY: 'auto'}}> 
            <div>
              <p style={{ marginLeft: 30, fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 30, fontWeight: 800, marginBottom: 10, width: 650 }}>
                Edit Schedule
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
                <select id="assignedTruck" value={selectedTruck} onChange={handleTruckChange}>
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
                <input type="text" placeholder="Assigned Truck" value={selectedTruck} onChange={(e) => setSelectedTruck(e.target.value)} />
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
              <button className="submit" onClick={handleSaveChanges}>Save</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}