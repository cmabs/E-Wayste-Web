import React, { useState, useEffect } from "react";
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import moment from 'moment';

export default function AddCollectorModal({ isOpen, handleClose }) {
  const [plateNo, setPlateNo] = useState("");
  const [selectedDriver, setSelectedDriver] = useState('');
  const [selectedCollectors, setSelectedCollectors] = useState([]);
  const [selectedCollector, setSelectedCollector] = useState('');
  const [currentUserLguCode, setCurrentUserLguCode] = useState(""); 
  const [currentUserLguID, setCurrentUserLguID] = useState("");
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

  const generatePassword = () => {
    // Prefix to start the password with
    const prefix = 'pass-';
    // Length of the random part of the password
    const randomPartLength = 8 - prefix.length;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = prefix;
    for (let i = 0; i < randomPartLength; i++) {
      password += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return password;
  };
  
  console.log(generatePassword());
  
  const handleSaveCollector = async () => {
    if (!firstName || !lastName || !username || !email || !province || !municipality || !barangay || !contactNo) {
      alert('Please fill in all required fields.');
      return;
    }
  
    try {
      const generatedPassword = generatePassword();
      setPassword(generatedPassword);
  
      await createUserWithEmailAndPassword(auth, email, generatedPassword);
  
      const fullDateTime = moment().utcOffset('+08:00').format('YYYY/MM/DD HH:mm:ss');
  
      const newCollector = {
        accountType: "Garbage Collector",
        associatedImage, 
        barangay: barangaysData.find(b => b.code === barangay)?.name || "", // Get the name corresponding to the selected barangay code
        contactNo,
        dateMade: fullDateTime,
        email,
        firstName,
        lastName,
        lguCode: currentUserLguCode,
        municipality: municipalitiesData.find(m => m.code === municipality)?.name || "", // Get the name corresponding to the selected municipality code
        password: generatedPassword,
        province: provincesData.find(p => p.code === province)?.name || "", // Get the name corresponding to the selected province code
        username
      };
  
      await addDoc(usersCollection, newCollector);
  
      console.log('Collector saved successfully!');
      alert('Collector saved successfully!');
  
      setFirstName(""); 
      setLastName(""); 
      setUsername(""); 
      setEmail(""); 
      setPassword(""); 
      setProvince("");
      setMunicipality("");
      setBarangay("");
      setContactNo("");
  
    } catch (error) {
      console.error('Error saving collector:', error);
      alert('Error saving collector:', error)
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
    <div className="add-colUsers" style={{ padding: '10px' }}>
      <div>
        <p style={{ marginLeft: 20, fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 30, fontWeight: 800, marginBottom: 10, width: 650 }}>
          Add Collector
        </p>
      </div>
      <div className="input-container" style={{ display: 'flex', flexDirection: 'column', marginTop: 8, alignItems: 'flex-start' }}>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="First Name">First Name</label>
          <input className="input-addCol" type="text" id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter First Name." />
        </div>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="Last Name">Last Name</label>
          <input className="input-addCol" type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Enter Last Name." />
        </div>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="username">Username</label>
          <input className="input-addCol" type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ex. firstname.lastname@ewayste" />
        </div>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="Email">Email</label>
          <input className="input-addCol" type="text" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email Address." />
        </div>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="password">Password</label>
          <input className="input-addCol" type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Generated Password" disabled />
        </div>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="province">Province</label>
          <select className="input-addCol" id="province" value={province} onChange={handleProvinceChange}>
            <option value="">Select province</option>
            {ProvinceOptions.map(option => (
              <option key={option.key} value={option.key}>{option.value}</option>
            ))}
          </select>
        </div>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="municipality">Municipality</label>
          <select className="input-addCol" id="municipality" value={municipality} onChange={handleMunicipalityChange} disabled={!province}>
            <option value="">Select Municipality</option>
            {MunicipalityOptions.map(option => (
              <option key={option.key} value={option.key}>{option.value}</option>
            ))}
          </select>
        </div>
        <div className="input-groupCollector">
          <label className="label-addCol" htmlFor="barangay">Barangay</label>
          <select className="input-addCol" id="barangay" value={barangay} onChange={(e) => setBarangay(e.target.value)} disabled={!municipality}>
            <option value="">Select Barangay</option>
            {BarangayOptions.map(option => (
              <option key={option.key} value={option.key}>{option.value}</option>
            ))}
          </select>
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

