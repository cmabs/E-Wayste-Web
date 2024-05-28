import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';
import moment from 'moment';

export default function AddCollectorModal({ isOpen, handleClose }) {
  const [plateNo, setPlateNo] = useState("");
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedCollectors, setSelectedCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [province, setProvince] = useState("");
  const [municipality, setMunicipality] = useState("");
  const [barangay, setBarangay] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [associatedImage, setAssociatedImage] = useState(""); // Assuming you'll handle the image upload separately
  const [provincesData, setProvincesData] = useState([]);
  const [municipalitiesData, setMunicipalitiesData] = useState([]);
  const [barangaysData, setBarangaysData] = useState([]);
  const [currentUserLguCode, setCurrentUserLguCode] = useState(""); 
  const [currentUserLguID, setCurrentUserLguID] = useState("");// Added state for current user's lguCode
  
  const firestore = getFirestore();
  const auth = getAuth();
  const usersCollection = collection(firestore, "users");

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch('https://psgc.cloud/api/provinces');
        const data = await response.json();
        setProvincesData(data);
      } catch (error) {
        console.error('Error fetching provinces data:', error);
      }
    };

    fetchProvinces();
  }, []);

  useEffect(() => {
    if (province) {
      const fetchMunicipalities = async () => {
        try {
          const response = await fetch(`https://psgc.cloud/api/provinces/${province}/cities-municipalities`);
          let data = await response.json();
          data = data.map(municipalityData => ({
            ...municipalityData,
            name: municipalityData.name.includes("City") ? municipalityData.name.replace("City of", "").trim() + " City" : municipalityData.name
          }));
          setMunicipalitiesData(data);
        } catch (error) {
          console.error('Error fetching municipalities data:', error);
        }
      };

      fetchMunicipalities();
    }
  }, [province]);

  useEffect(() => {
    if (municipality) {
      const fetchBarangays = async () => {
        try {
          const response = await fetch(`https://psgc.cloud/api/cities-municipalities/${municipality}/barangays`);
          const data = await response.json();
          setBarangaysData(data);
        } catch (error) {
          console.error('Error fetching barangays data:', error);
        }
      };

      fetchBarangays();
    }
  }, [municipality]);

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

  useEffect(() => {
    fetchLoggedInUserLguCode();
  }, []);

  const generatePassword = () => {
    // Generate a random password of length 8
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
  };

  const handleSaveCollector = async () => {
    if (!firstName || !lastName || !username || !email || !province || !municipality || !barangay || !contactNo) {
      alert('Please fill in all required fields.');
      return;
    }
  
    try {
      const generatedPassword = generatePassword();
      setPassword(generatedPassword);
  
      console.log('Creating user with email:', email, 'and password:', generatedPassword);
  
      // Check if the provided email is the same as the logged-in user's email
      const loggedInUser = auth.currentUser;
      if (loggedInUser && loggedInUser.email !== email) {
        // Create a new user only if the email is different
        const collectorUserCredential = await createUserWithEmailAndPassword(auth, email, generatedPassword);
        const collectorUser = collectorUserCredential.user;
        console.log('Collector user created successfully:', collectorUser.uid);
      }
  
      const fullDateTime = moment().utcOffset('+08:00').format('YYYY/MM/DD HH:mm:ss');
  
      const newCollector = {
        accountType: "Garbage Collector",
        associatedImage,
        barangay: barangaysData.find(b => b.code === barangay)?.name || "",
        contactNo,
        dateMade: fullDateTime,
        email,
        firstName,
        lastName,
        lguCode: currentUserLguCode,
        municipality: municipalitiesData.find(m => m.code === municipality)?.name || "",
        password: generatedPassword,
        province: provincesData.find(p => p.code === province)?.name || "",
        username
      };
  
      console.log('Saving new collector:', newCollector);
  
      // Log the current user's ID before saving the collector
      console.log('Current user ID before saving:', loggedInUser.uid);
  
      await addDoc(usersCollection, newCollector);
      console.log('Collector saved successfully!');
      alert('Collector saved successfully!');
  
      // Reset collector input fields
      setFirstName("");
      setLastName("");
      setUsername("");
      setEmail("");
      setPassword("");
      setProvince("");
      setMunicipality("");
      setBarangay("");
      setContactNo("");
  
      // Log the current user's ID after saving the collector
      console.log('Current user ID after saving:', loggedInUser.uid);
  
    } catch (error) {
      console.error('Error saving collector:', error);
      alert('Error saving collector:', error.message);
    }
  };
  

const handleProvinceChange = (e) => {
  setProvince(e.target.value);
  setMunicipality('');
  setBarangay('');
  setMunicipalitiesData([]);
  setBarangaysData([]);
};

const handleMunicipalityChange = (e) => {
  setMunicipality(e.target.value);
  setBarangay('');
  setBarangaysData([]);
};

const sortedProvincesData = provincesData.slice().sort((a, b) => a.name.localeCompare(b.name));
const ProvinceOptions = sortedProvincesData.map(provinceData => ({ key: provinceData.code, value: provinceData.name }));
const MunicipalityOptions = municipalitiesData.map(municipalityData => ({ key: municipalityData.code, value: municipalityData.name }));
const BarangayOptions = barangaysData.map(barangayData => ({ key: barangayData.code, value: barangayData.name }));

return (
  <div className="add-colUsers" style={{ padding: '10px', maxHeight: '650px' }}>
    <div>
      <p style={{ marginLeft: 20, fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 30, fontWeight: 800, marginBottom: 10, width: 650 }}>
        Add Collector
      </p>
    </div>
    <div className="input-container" style={{ display: 'flex', flexDirection: 'column', marginTop: 8, alignItems: 'flex-start' }}>
      <div className="input-groupCollector">
        <label className="label-addCol" htmlFor="firstName">First Name</label>
        <input className="input-addCol" type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter First Name." />
      </div>
      <div className="input-groupCollector">
        <label className="label-addCol" htmlFor="lastName">Last Name</label>
        <input className="input-addCol" type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter Last Name." />
      </div>
      <div className="input-groupCollector">
        <label className="label-addCol" htmlFor="username">Username</label>
        <input className="input-addCol" type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex. firstname.lastname@ewayste" />
      </div>
      <div className="input-groupCollector">
        <label className="label-addCol" htmlFor="email">Email</label>
        <input className="input-addCol" type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email Address." />
      </div>
      <div className="input-groupCollector">
        <label className="label-addCol" htmlFor="password">Password</label>
        <input className="input-addCol" type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Generated Password" disabled />
      </div>
      <div className="dropdown-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1px' }}>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="province">Province</label>
          <select className="input-addCol" id="province" value={province} onChange={handleProvinceChange} style={{ width: '160px' }}>
            <option value="">Select province</option>
            {ProvinceOptions.map(option => (
              <option key={option.key} value={option.key}>{option.value}</option>
            ))}
          </select>
        </div>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="municipality">Municipality</label>
          <select className="input-addCol" id="municipality" value={municipality} onChange={handleMunicipalityChange} disabled={!province} style={{ width: '190px' }}>
            <option value="">Select Municipality</option>
            {MunicipalityOptions.map(option => (
              <option key={option.key} value={option.key}>{option.value}</option>
            ))}
          </select>
        </div>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="barangay">Barangay</label>
          <select className="input-addCol" id="barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} disabled={!municipality} style={{ width: '160px' }}>
            <option value="">Select Barangay</option>
            {BarangayOptions.map(option => (
              <option key={option.key} value={option.key}>{option.value}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="input-groupCollector">
        <label className="label-addCol" htmlFor="contactNumber">Contact Number</label>
        <input className="input-addCol" type="text" id="contactNumber" value={contactNo} onChange={(e) => setContactNo(e.target.value)} placeholder="Enter Contact Number" />
      </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: -4 }}>
      <button className="cancel"  onClick={handleClose}>Cancel</button>
      <button className="submit" onClick={handleSaveCollector}>Save</button>
    </div>
  </div>
);
}