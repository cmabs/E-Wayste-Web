import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import moment from 'moment';

export default function AddTruckModal({ isOpen, handleClose }) {
  const [truckCount, setTruckCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedCollectors, setSelectedCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [currentUserLguCode, setCurrentUserLguCode] = useState(""); 
  const [currentUserLguID, setCurrentUserLguID] = useState("");// Added state for current user's lguCode
  const [plateNo, setPlateNo] = useState("");

  useEffect(() => {
    fetchTruckCount();
    fetchGarbageCollectors();
    fetchLoggedInUserLguCode();
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
            const userID = querySnapshot.docs[0].id;

            setCurrentUserLguCode(userLguCode);
            console.log('Logged-in user LGU code:', userLguCode);
            setCurrentUserLguID(userID);
            console.log('Logged-in user ID:', userID);
          }
        }
      });
    } catch (error) {
      console.error('Error fetching logged-in user data:', error);
    }
  };

  const fetchTruckCount = async () => {
    try {
      const firestore = getFirestore();
      const trucksCollection = collection(firestore, 'trucks');
      const q = query(trucksCollection, where('lguCode', '==', currentUserLguCode));
      const trucksSnapshot = await getDocs(q);
      const count = trucksSnapshot.docs.length;
      console.log('Truck count for current user LGU code:', count);
      setTruckCount(count);
    } catch (error) {
      console.error('Error fetching truck count:', error);
    }
  };
  

  const fetchGarbageCollectors = async () => {
    try {
      const firestore = getFirestore();
      const usersCollection = collection(firestore, 'users');
      const q = query(usersCollection, where('accountType', '==', 'Garbage Collector'));
      const usersSnapshot = await getDocs(q);
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log("Fetched users:", usersData); // Log fetched users
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching garbage collectors:', error);
    }
  };

  const handleSaveTruck = async () => {
    try {
      // Check if any required fields are missing
      if (!plateNo || !selectedDriver || selectedCollectors.length === 0) {
        alert('Please fill in all required fields.');
        return;
      }
  
      const firestore = getFirestore();
      const trucksCollection = collection(firestore, 'trucks');
      const fullDateTime = moment().utcOffset('+08:00').format('YYYY/MM/DD HH:mm:ss');
      
      const collectorIDs = selectedCollectors.map(collector => ({ id: collector }));
      const truckData = {
        plateNo: plateNo,
        dateTime: fullDateTime,
        lguCode: currentUserLguCode,
        lguID: currentUserLguID,
        driverID: selectedDriver,
        members: {
          collector: collectorIDs 
        }
      };
      await addDoc(trucksCollection, truckData);
      console.log('Truck saved successfully!');
      
      setPlateNo(""); 
      setSelectedDriver(""); 
      setSelectedCollector(""); 
      setSelectedCollectors([]); 
    } catch (error) {
      console.error('Error saving truck:', error);
    }
  };
  

  const handleDriverChange = (event) => {
    const selectedDriverId = event.target.value;
  
    // Check if the selected driver is also selected as a collector
    if (selectedCollectors.includes(selectedDriverId)) {
      alert('The selected driver cannot be chosen as a collector.');
      return;
    }
  
    setSelectedDriver(selectedDriverId);
  };

  const handleCreateCollectorClick = () => {
    if (selectedCollector === '') {
      alert('No collector is chosen.');
      return;
    }

    setSelectedCollectors([...selectedCollectors, selectedCollector]);
    setSelectedCollector(''); 
  };
  
  const handleDeleteCollector = (collectorIndex) => {
    setSelectedCollectors(selectedCollectors.filter((_, index) => index !== collectorIndex));
  };

  const handleCollectorChange = (event) => {
    const selectedCollectorId = event.target.value;

    if (!selectedDriver) {
      alert('Please select a driver first.');
      return;
    }
    if ((selectedCollectorId === selectedDriver) || (selectedDriver && selectedDriver === selectedCollectorId)) {
      alert('The selected driver cannot be chosen as a collector.');
      return;
    }
    if (!selectedCollectors.find(collector => collector === selectedCollectorId)) {
      setSelectedCollector(selectedCollectorId);
    }
  };
  
  return (
    <div className="add-sideUsers" style={{ padding: '10px' }}>
      <div>
        <p style={{ marginLeft: 20, fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 30, fontWeight: 800, marginBottom: 10, width: 650 }}>
          Add Truck
        </p>
      </div>
      <div className="input-container" style={{ display: 'flex', flexDirection: 'column', marginTop: 20, alignItems: 'flex-start' }}>
        <div className="input-group">
          <label className="label-addtruck" htmlFor="plateNo">Plate No.</label>
          <input className="input-addtruck" type="text" id="plateNo" placeholder="Enter Plate No." value={plateNo} onChange={(e) => setPlateNo(e.target.value)} />
        </div>
        <div className="input-group">
          <label className="label-addtruck" htmlFor="assignedDriver">Assigned Driver</label>
          <select className="input-addtruck" id="assignedDriver" value={selectedDriver} onChange={handleDriverChange} style={{ background: 'white', borderRadius: '5px', padding: '5px', width: '298%' }}>
            <option value="">Select Driver</option>
            {users
              .filter(user => user.lguCode === currentUserLguCode)
              .map(user => (
                <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
              ))}
          </select>
        </div>

        <div className="input-group">
          <label className="label-addtruck" htmlFor="assignedCollector">Assigned Collector</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select className="input-addtruck" id="assignedCollector" value={selectedCollector} onChange={handleCollectorChange} style={{ background: 'white', borderRadius: '5px', padding: '5px', width: '240%', marginRight: '5px' }}>
              <option value="">Select Collector</option>
              {users
                .filter(user => user.lguCode === currentUserLguCode && user.id !== selectedDriver && !selectedCollectors.includes(user.id))
                .map(user => (
                  <option key={user.id} value={user.id}>{`${user.firstName} ${user.lastName}`}</option>
                ))}
            </select>
            <button className="add-collector-btn" onClick={handleCreateCollectorClick} disabled={users.filter(user => user.lguCode === currentUserLguCode && user.id !== selectedDriver && !selectedCollectors.includes(user.id)).length === 0}>+</button>
          </div>
        </div>

        <div className="selected-collectors" style={{ display: 'flex', flexWrap: 'wrap', marginRight: '-50px'}}>
          {selectedCollectors.map((collector, index) => (
            <div key={index} className="selected-collector" style={{ marginRight: '10px', marginBottom: '10px' }}>
              <span>{users.find(user => user.id === collector)?.firstName} {users.find(user => user.id === collector)?.lastName}</span>
              <button className="delete-col-btn" onClick={() => handleDeleteCollector(index)}>x</button>
            </div>
          ))}
        </div>
      </div>    
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 30 }}>
        <button className="cancel" onClick={handleClose}>Cancel</button>
        <button className="submit" onClick={handleSaveTruck}>Save</button>
      </div>
    </div>
  );
}
