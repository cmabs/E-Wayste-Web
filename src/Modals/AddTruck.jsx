import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where, addDoc} from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import moment from 'moment';

export default function AddTruckModal({ isOpen, handleClose }) {
  const [truckCount, setTruckCount] = useState(0);
  const [users, setUsers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedCollectors, setSelectedCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [currentUserLguCode, setCurrentUserLguCode] = useState(""); 
  const [currentUserLguID, setCurrentUserLguID] = useState("");
  const [plateNo, setPlateNo] = useState("");
  const [DriverChoice, setDriverChoice] = useState([{ key: '', value: '[Select Driver]' }]);
  const [CollectorChoice, setCollectorChoice] = useState([{ key: '', value: '[Select Collector]' }]);

  useEffect(() => {
    fetchTruckCount();
    fetchGarbageCollectors();
    fetchLoggedInUserLguCode();
  }, []);

  useEffect(() => {
    generateDriverChoice();
    generateCollectorChoice();
  }, [users, trucks]);

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
            setCurrentUserLguID(userID);
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
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching garbage collectors:', error);
    }
  };

  const handleSaveTruck = async () => {
    try {
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
      
      setPlateNo(""); 
      setSelectedDriver(""); 
      setSelectedCollector(""); 
      setSelectedCollectors([]); 
    } catch (error) {
      console.error('Error saving truck:', error);
    }
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

  const generateDriverChoice = () => {
    try {
      let ctr = 1;
      const newDriverChoice = [{ key: '', value: '[Select Driver]' }];
      users.forEach((user) => {
        if (user.accountType === 'Garbage Collector' && user.lguCode === currentUserLguCode) {
          let isAssignedDriver = false;
  
          // Check if the user is already assigned as a driver in any truck
          trucks.forEach((truck) => {
            if (user.id === truck.driverID) {
              isAssignedDriver = true;
            }
          });
  
          // If the user is not already assigned as a driver, add them to the options
          if (!isAssignedDriver) {
            newDriverChoice[ctr] = { key: user.id, value: `${user.firstName} ${user.lastName}` };
            ctr++;
          }
        }
      });
      setDriverChoice(newDriverChoice);
    } catch (e) {
      console.error('Error generating driver choices:', e);
    }
  };
  
  const handleDriverChange = (event) => {
    const selectedDriverId = event.target.value;
    
    // Check if the selected driver is already assigned to another truck
    const isDriverAssigned = trucks.some(truck => truck.driverID === selectedDriverId);
    
    // If the selected driver is already assigned, show an alert and reset the selected driver
    if (isDriverAssigned) {
      alert('This driver is already assigned to another truck.');
      setSelectedDriver('');
      return;
    }
    
    // Set the selected driver
    setSelectedDriver(selectedDriverId);
  };
  
  

  const generateCollectorChoice = () => {
    try {
      let ctr = 1;
      const newCollectorChoice = [{ key: '', value: '[Select Collector]' }];
      users.forEach((user) => {
        if (user.accountType === 'Garbage Collector' && user.lguCode === currentUserLguCode && user.id !== selectedDriver) {
          let isRepeat = false;
          let isRepeatDriver = false;

          trucks.forEach((truck) => {
            if (user.id === truck.driverID) {
              isRepeatDriver = true;
            }
          });
          if (!isRepeat && !isRepeatDriver) {
            newCollectorChoice[ctr] = { key: user.id, value: `${user.firstName} ${user.lastName}` };
            ctr++;
          }
        }
      });
      setCollectorChoice(newCollectorChoice);
    } catch (e) {
      console.error('Error generating collector choices:', e);
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
            {DriverChoice.map(driver => (
              <option key={driver.key} value={driver.key}>{driver.value}</option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label className="label-addtruck" htmlFor="assignedCollector">Assigned Collector</label>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <select className="input-addtruck" id="assignedCollector" value={selectedCollector} onChange={handleCollectorChange} style={{ background: 'white', borderRadius: '5px', padding: '5px', width: '240%', marginRight: '5px' }}>
              {CollectorChoice.map(collector => (
                <option key={collector.key} value={collector.key}>{collector.value}</option>
              ))}
            </select>
            <button className="add-collector-btn" onClick={handleCreateCollectorClick} disabled={CollectorChoice.length <= 1}>+</button>
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

