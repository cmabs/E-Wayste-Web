import React, { useState, useEffect } from "react";
import '../styleSheet/report.css';
import { db } from '../firebase-config';
import { getFirestore, collection, getDocs, getDoc, addDoc, doc, deleteDoc, where, query  } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaSearch, FaBell } from 'react-icons/fa';
import { MdOutlineModeEdit, MdDelete } from 'react-icons/md';
import { ImCheckmark } from 'react-icons/im';
import { Button } from "@mui/material";

export default function Report() {
  const [userReports, setUserReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortDirection, setSortDirection] = useState('desc'); 
  const [originalUserReports, setOriginalUserReports] = useState([]);  

  const [collectedCount, setCollectedCount] = useState(0);
  const [uncollectedCount, setUncollectedCount] = useState(0);
  const [reportsToday, setReportsToday] = useState(0);
  const [totalReports, setTotalReports] = useState(0);
  const [reports, setReports] = useState([]);
  const [usersData, setUsersData] = useState({});
  
  const storage = getStorage();
  let imageURL, viewImageURL;

  const [openImage, setOpenImage] = useState(false);
  const [imageToView, setImageToView] = useState();
  const imageColRef = ref(storage, "postImages/");
  const [reportImage, setReportImage] = useState([]);

  

  useEffect(() => {
    listAll(imageColRef).then((response) => {
      setReportImage([]);
      response.items.forEach((item) => {
          getDownloadURL(item).then((url) => {
            setReportImage((prev) => [...prev, url])
          })
      })
  })
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const reportsCollection = collection(db, 'generalUsersReports');
      const collectedQuery = query(reportsCollection, where('status', '==', 'collected'));
      const uncollectedQuery = query(reportsCollection, where('status', '==', 'uncollected'));

      const collectedSnapshot = await getDocs(collectedQuery);
      const uncollectedSnapshot = await getDocs(uncollectedQuery);

      setCollectedCount(collectedSnapshot.size);
      setUncollectedCount(uncollectedSnapshot.size);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];

    const fetchReports = async () => {
      try {
        const todayQuery = query(collection(db, 'generalUsersReports'), where('dateTime', '>=', currentDate));
        const todaySnapshot = await getDocs(todayQuery);
        const todayReports = todaySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setReportsToday(todayReports.length);

        const allReportsQuery = query(collection(db, 'generalUsersReports'));
        const allReportsSnapshot = await getDocs(allReportsQuery);
        const totalReportsCount = allReportsSnapshot.size;

        setTotalReports(totalReportsCount);
      } catch (error) {
        console.log('Error fetching reports:', error);
      }
    };

    fetchReports();
  }, []);

  const collectedPercentage = totalReports !== 0 ? (collectedCount / totalReports) * 100 : 0;
  const uncollectedPercentage = totalReports !== 0 ? (uncollectedCount / totalReports) * 100 : 0;

/*
useEffect(() => {
  const fetchUserReports = async () => {
    try {
      const reportsCollection = collection(db, 'generalUsersReports');
      const reportsQuery = query(reportsCollection);
      const reportsSnapshot = await getDocs(reportsQuery);

      const userReportsData = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUserReports(userReportsData);
    } catch (error) {
      console.error('Error fetching user reports:', error);
    }
  };

  fetchUserReports();
}, []);*/

useEffect(() => {
  const fetchUserReports = async () => {
    try {
      // Fetch user reports
      const reportsCollection = collection(db, 'generalUsersReports');
      const reportsSnapshot = await getDocs(reportsCollection);
      const userReportsData = reportsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Fetch user data to associate names with reports
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersData = usersSnapshot.docs.reduce((acc, doc) => {
        acc[doc.id] = doc.data();
        return acc;
      }, {});

      // Update userReportsData with user names
      const reportsWithNames = userReportsData.map(report => ({
        ...report,
        userName: `${usersData[report.userId]?.firstName || ''} ${usersData[report.userId]?.lastName || ''}`
      }));

      setUserReports(reportsWithNames);
      setFilteredReports(reportsWithNames); // Set initial filtered data
      setOriginalUserReports(reportsWithNames);
      
      // Set the usersData state here
      setUsersData(usersData);
    } catch (error) {
      console.error('Error fetching user reports:', error);
    }
  };

  fetchUserReports();
}, []); // Removed [selectedLocation] dependency

  const formatDateTime = (dateTime) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateTime).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSearch = () => {
    const filtered = userReports.filter(item =>
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.dateReported && item.dateReported.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredReports(filtered);
  };
  
  const handleEdit = (id) => {
    // Implement edit logic here
    console.log(`Edit item with ID: ${id}`);
  };

  const handleDelete = (id) => {
    // Implement delete logic here
    console.log(`Delete item with ID: ${id}`);
  };

  const handleSort = () => {
    const sortedReports = [...filteredReports].sort((a, b) => {
      const dateA = new Date(a.dateTime);
      const dateB = new Date(b.dateTime);

      if (sortDirection === 'asc') {
        return dateA - dateB;
      } else {
        return dateB - dateA;
      }
    });

    setFilteredReports(sortedReports);
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
  };
function Summary() {
    return (
      <div className="summary-con">
        <div id="rectangle_279">
          <p className="report-text">Total Reports</p>
          <p className="number-text">{totalReports}</p>
        </div>
        <div id="rectangle_280">
          <p className="total-text">Total Collected</p>
          <p className="total-num">{collectedCount}</p>
        </div>
        <div id="total_colle"></div>
        <div id="rectangle_248">
          <p className="reportstoday">Reports Today</p>
          <p className="total-num total-count">{reportsToday}</p>
        </div>
        <div id="rectangle_281">
          <div className="collected-garbage">
            <CircularProgressbar
              value={collectedPercentage}
              styles={buildStyles({
                pathColor: '#4CAF50',
                textColor: '#4CAF50',
                trailColor: '#d6d6d6',
              })}
            />
          </div>
          <div className="uncollected-garbage">
            <CircularProgressbar
              value={uncollectedPercentage}
              styles={buildStyles({
                pathColor: '#87FF74',
                textColor: '#FF0000',
                trailColor: '#d6d6d6',
              })}
            />
          </div>
        </div>
        <div id="some_id_4">{totalReports}</div>
        <div id="reports">REPORTS</div>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
            <div id="rectangle_282">
              <p style={{marginLeft: 50, marginTop:5, fontSize: '1.1em', fontWeight: 500}}>Uncollected</p>
            </div>
          </div>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
            <div id="rectangle_283">
              <p style={{marginLeft: 50, marginTop:5,fontSize: '1.1em', fontWeight: 500 }}>Collected</p>
            </div>
          </div>
        <div id="uncollected"></div>
        <div id="collected"></div>
          <div id="line"> </div>
      </div>
    );
  }
     return (
      <>
      <div style={{ marginLeft: 40, width: 1100 }}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650 }}>Garbage Reports</h1>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: 20 }}>
          <div className="summary-con">
            {Summary()}
          </div>
          </div>
        </div>
        <div style={{ marginTop: 290, marginBottom: 40,}}>
        <div style={{ display: 'flex', flexDirection: 'row' , marginBottom :10}}>
            <input
                  type="text"
                  placeholder="Search by location, or date"
                  className="searchBar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="searchButton" onClick={() => { handleSearch(); setSearchTerm(''); }}>
                  <FaSearch style={{ fontSize: 20 }} />
                </button>
                <Button style={{ backgroundColor: '#51AF5B', marginLeft: 8, color: 'white', borderRadius: 13}} onClick={handleSort}>Sort</Button>
          </div>
        <table className="reportTable" style={{ border: '1px solid #ddd', borderCollapse: 'collapse', width: '100%' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Date Reported</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Time Reported</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Location</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Image</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
            </tr>
          </thead>
          <tbody className="reportTableBody" style={{ width: 2000 }}>
            {filteredReports.map((item) => (
              <tr key={item.id} className="tableRow" onClick={() => handleEdit(item.id)}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
        {item.userId && usersData[item.userId] ? `${usersData[item.userId]?.firstName || ''} ${usersData[item.userId]?.lastName || ''}` : 'N/A'}
      </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatDateTime(item.dateTime)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatTime(item.dateTime)}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.location}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {reportImage.map((url) => {
                if(url.includes(item.associatedImage)) {
                    imageURL = url;
                }
              })}
              <div style={{ width: '100%', height: 50, borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden' }}>
                {item.associatedImage && (
                  <a
                    href="#"
                    onClick={() => {setOpenImage(true); setImageToView(item.associatedImage)}}
                  >
                    <img src={imageURL} alt="Report" style={{ width: 90, height: 'auto', resizeMode: 'cover' }} />
                    <span style={{ textDecoration: 'underline', color: 'blue', cursor: 'pointer' }}></span>
                  </a>
                )}
              </div>
              </td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  <MdOutlineModeEdit style={{ cursor: 'pointer' }} />
                  <MdDelete onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} style={{ cursor: 'pointer', marginLeft: '8px' }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </>
  );
}