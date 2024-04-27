import React, { useState, useEffect } from "react";
import '../styleSheet/report.css';
import { db } from '../firebase-config';
import { getFirestore, collection, getDocs, getDoc, addDoc, doc, deleteDoc, where, query  } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL, listAll } from 'firebase/storage';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import { FaSearch, FaBell } from 'react-icons/fa';
import { getAuth, onAuthStateChanged } from 'firebase/auth'; 
import {  MdDelete } from 'react-icons/md';
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
  const [reportStatus, setReportStatus] = useState({}); // New state for storing report status

  const storage = getStorage();
  let imageURL, viewImageURL;

  const [openImage, setOpenImage] = useState(false);
  const [imageToView, setImageToView] = useState();
  const imageColRef = ref(storage, "postImages/");
  const [reportImage, setReportImage] = useState([]);

  const [isAll, setIsAll] = useState(true); // State variable for All filter
  const [isCollected, setIsCollected] = useState(false); // State variable for Collected filter
  const [isUncollected, setIsUncollected] = useState(false); // State variable for Uncollected filter

  const handleFilterChange = (filter) => {
    if (filter === 'All') {
      setIsAll(true);
      setIsCollected(false);
      setIsUncollected(false);
      setFilteredReports(originalUserReports);
    } else if (filter === 'Collected') {
      setIsAll(false);
      setIsCollected(true);
      setIsUncollected(false);
      const filteredCollected = originalUserReports.filter(report => reportStatus[report.id] === 'collected');
      setFilteredReports(filteredCollected);
    } else if (filter === 'Uncollected') {
      setIsAll(false);
      setIsCollected(false);
      setIsUncollected(true);
      const filteredUncollected = originalUserReports.filter(report => reportStatus[report.id] === 'uncollected');
      setFilteredReports(filteredUncollected);
    }
  };

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

  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        const auth = getAuth();
        const user = await new Promise((resolve, reject) => {
          onAuthStateChanged(auth, user => {
            if (user) {
              resolve(user);
            } else {
              reject(new Error('User not found'));
            }
          });
        });
        
        const email = user.email;
        const firestore = getFirestore();
        const usersCollection = collection(firestore, 'users');
        const querySnapshot = await getDocs(query(usersCollection, where('email', '==', email)));
  
        if (!querySnapshot.empty) {
          const userData = querySnapshot.docs[0].data();
          const userMunicipality = userData.municipality;
          console.log('User municipality:', userMunicipality); // Logging the municipality
          
          const reportsCollection = collection(db, 'generalUsersReports');
          const reportsQuery = query(reportsCollection, where('municipality', '==', userMunicipality));
          const reportsSnapshot = await getDocs(reportsQuery);
          const userReportsData = reportsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          const allUsersSnapshot = await getDocs(usersCollection);
          const usersData = allUsersSnapshot.docs.reduce((acc, doc) => {
            acc[doc.id] = doc.data();
            return acc;
          }, {});

          // Fetching report status
          const statusData = userReportsData.reduce((acc, report) => {
            acc[report.id] = report.status;
            return acc;
          }, {});
  
          const reportsWithNames = userReportsData.map(report => ({
            ...report,
            userName: `${userData.firstName || ''} ${userData.lastName || ''}`
          }));
  
          setUserReports(reportsWithNames);
          setFilteredReports(reportsWithNames); 
          setOriginalUserReports(reportsWithNames);
          setReportStatus(statusData); // Set report status state
          
          setUsersData(usersData);
        }
      } catch (error) {
        console.error('Error fetching user reports:', error);
      }
    };
  
    fetchUserReports();
  }, []);
  
  const formatDateTime = (dateTime) => {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return new Date(dateTime).toLocaleDateString(undefined, options);
  };

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSearch = () => {

    if (searchTerm.trim() === '') {
      setFilteredReports(userReports); // Reset filtered reports to all reports
      return;
    }
    const filtered = userReports.filter(item =>
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.dateReported && item.dateReported.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredReports(filtered);
  }; 

  
  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'generalUsersReports', id));
      setUserReports(userReports.filter(report => report.id !== id));
      setFilteredReports(filteredReports.filter(report => report.id !== id));
      setOriginalUserReports(originalUserReports.filter(report => report.id !== id));
      setReportStatus((prevStatus) => {
        const newStatus = { ...prevStatus };
        delete newStatus[id];
        return newStatus;
      });
      console.log(`Report with ID ${id} deleted successfully.`);
    } catch (error) {
      console.error('Error deleting report:', error);
    }
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
    const totalReports = filteredReports.length;
  
    const currentDate = new Date().toISOString().split('T')[0];
    const reportsToday = filteredReports.filter(report => {
      const reportDate = new Date(report.dateTime).toISOString().split('T')[0];
      return reportDate === currentDate;
    }).length;
  
    const collectedCount = filteredReports.filter(report => report.status === 'collected').length;
    const collectedPercentage = totalReports !== 0 ? (collectedCount / totalReports) * 100 : 0;
    const uncollectedCount = totalReports - collectedCount;
    const uncollectedPercentage = totalReports !== 0 ? (uncollectedCount / totalReports) * 100 : 0;
    
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
          <div style={{ display: 'flex', flexDirection: 'row' , marginBottom :10, marginLeft: 500, marginTop: 40}}>
          <input
            type="text"
            placeholder="Search by location, or date"
            className="searchBar"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleSearch(); // Invoke handleSearch on every change in input
            }}
          />
            <button className="searchButton" onClick={() => { handleSearch(); setSearchTerm(''); }}>
              <FaSearch style={{ fontSize: 20 }} />
            </button>
          </div>
            <div className="summary-con">
              {Summary()}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 290, marginBottom: 40 }}>
          <div style={{ display: 'flex', flexDirection: 'row' , marginBottom :10}}>
            <Button onClick={() => handleFilterChange('All')} className={isAll ? 'activeFilter' : ''}>All</Button>
            <Button style={{color: 'green'}} onClick={() => handleFilterChange('Collected')} className={isCollected ? 'activeFilter' : ''}>Collected</Button>
            <Button style={{color: 'orange'}} onClick={() => handleFilterChange('Uncollected')} className={isUncollected ? 'activeFilter' : ''}>Uncollected</Button>
          </div>
          {isAll &&
          <table className="reportTable" style={{ border: '1px solid #ddd', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }} onClick={handleSort}>
                 Date<br />Reported {sortDirection === 'asc' ? '▲' : '▼'}
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Time Reported</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Location</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th> {/* New column for Status */}
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Image</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody className="reportTableBody" style={{ width: 2000 }}>
              {filteredReports.map((item) => (
                <tr key={item.id} className="tableRow">
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {item.userId && usersData[item.userId] ? `${usersData[item.userId]?.firstName || ''} ${usersData[item.userId]?.lastName || ''}` : 'N/A'}
                  </td>
                 <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {item.highlightedDate ? (
                    <span dangerouslySetInnerHTML={{ __html: item.highlightedDate }} style={{ color: 'green' }} />
                  ) : (
                    <>{formatDateTime(item.dateTime)}</>
                  )}
                </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatTime(item.dateTime)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {item.highlightedLocation ? (
                      <span dangerouslySetInnerHTML={{ __html: item.highlightedLocation }} style={{ color: 'green' }} />
                    ) : (
                      <>{item.location}</>
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reportStatus[item.id]}</td>
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
                    <MdDelete onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} style={{ cursor: 'pointer', marginLeft: '14px', color: 'red', fontSize: '20px'}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         }
         {isCollected &&
          <table className="reportTable" style={{ border: '1px solid #ddd', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }} onClick={handleSort}>
                 Date<br />Reported {sortDirection === 'asc' ? '▲' : '▼'}
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Time Reported</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Location</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th> {/* New column for Status */}
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Image</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody className="reportTableBody" style={{ width: 2000 }}>
              {filteredReports.map((item) => (
                <tr key={item.id} className="tableRow">
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {item.userId && usersData[item.userId] ? `${usersData[item.userId]?.firstName || ''} ${usersData[item.userId]?.lastName || ''}` : 'N/A'}
                  </td>
                 <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {item.highlightedDate ? (
                    <span dangerouslySetInnerHTML={{ __html: item.highlightedDate }} style={{ color: 'green' }} />
                  ) : (
                    <>{formatDateTime(item.dateTime)}</>
                  )}
                </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatTime(item.dateTime)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {item.highlightedLocation ? (
                      <span dangerouslySetInnerHTML={{ __html: item.highlightedLocation }} style={{ color: 'green' }} />
                    ) : (
                      <>{item.location}</>
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reportStatus[item.id]}</td>
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
                    <MdDelete onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} style={{ cursor: 'pointer', marginLeft: '14px', color: 'red', fontSize: '20px'}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         }
         {isUncollected &&
          <table className="reportTable" style={{ border: '1px solid #ddd', borderCollapse: 'collapse', width: '100%' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Name</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }} onClick={handleSort}>
                 Date<br />Reported {sortDirection === 'asc' ? '▲' : '▼'}
                </th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Time Reported</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Location</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th> {/* New column for Status */}
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Image</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Action</th>
              </tr>
            </thead>
            <tbody className="reportTableBody" style={{ width: 2000 }}>
              {filteredReports.map((item) => (
                <tr key={item.id} className="tableRow">
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {item.userId && usersData[item.userId] ? `${usersData[item.userId]?.firstName || ''} ${usersData[item.userId]?.lastName || ''}` : 'N/A'}
                  </td>
                 <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {item.highlightedDate ? (
                    <span dangerouslySetInnerHTML={{ __html: item.highlightedDate }} style={{ color: 'green' }} />
                  ) : (
                    <>{formatDateTime(item.dateTime)}</>
                  )}
                </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{formatTime(item.dateTime)}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {item.highlightedLocation ? (
                      <span dangerouslySetInnerHTML={{ __html: item.highlightedLocation }} style={{ color: 'green' }} />
                    ) : (
                      <>{item.location}</>
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{reportStatus[item.id]}</td>
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
                    <MdDelete onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }} style={{ cursor: 'pointer', marginLeft: '14px', color: 'red', fontSize: '20px'}} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
         }

        </div>
      </div>
    </>
  );
}