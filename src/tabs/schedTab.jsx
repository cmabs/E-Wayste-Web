import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where, doc, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../styleSheet/schedTabStyle.css';
import { db } from '../firebase-config';
import { MdOutlineModeEdit, MdDelete, MdPlace } from 'react-icons/md';
import { FaSearch, FaBell } from 'react-icons/fa';
import Notification from './Notification';


  export default function Schedule() {
    const [scheduleData, setScheduleData] = useState([]);
    const [collectionData, setCollectionData] = useState([]);
    const [eventsData, setEventsData] = useState([]);
    const [allSchedulesData, setAllSchedulesData] = useState([]);
    const [assignmentsData, setAssignmentsData] = useState([]);
    const [collectionSchedules, setCollectionSchedules] = useState([]); 
    const [loggedInUserMunicipality, setLoggedInUserMunicipality] = useState(null); 
    const [showCollectionTable, setShowCollectionTable] = useState(false); 
    const [showEventsTable, setShowEventsTable] = useState(false); 
    const [showAssignmentsTable, setShowAssignmentsTable] = useState(false); 
    const [showAllScheduleTable, setShowAllScheduleTable] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [collectionLength, setCollectionLength] = useState(0);
    const [eventsLength, setEventsLength] = useState(0);
    const [assignmentsLength, setAssignmentsLength] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);


    const scheduleCollection = collection(db, 'schedule');

    const [sortOrder, setSortOrder] = useState('');
    
    const toggleNotification = () => {
        setIsNotificationOpen(!isNotificationOpen);
      };
    const handleSearch = () => {
      if (searchTerm.trim() === '') {
        setAllSchedulesData(scheduleData);
        return;
      }
    
      const filteredAllSchedules = allSchedulesData.map(schedule => {
        const location = `${schedule.location}, ${schedule.collectionRoute && schedule.collectionRoute.coordinates ? schedule.collectionRoute.coordinates.map(coord => coord.locationName).join(', ') : ''}`;
        const searchTermLower = searchTerm.toLowerCase();
        const locationLower = location.toLowerCase();
    
        if (locationLower.includes(searchTermLower)) {
          const startIndex = locationLower.indexOf(searchTermLower);
          const endIndex = startIndex + searchTermLower.length;
          const highlightedLocation = `${location.substring(0, startIndex)}<span class="highlight">${location.substring(startIndex, endIndex)}</span>${location.substring(endIndex)}`;
          return { ...schedule, highlightedLocation };
        } else {
          return null;
        }
      }).filter(schedule => schedule !== null);
    
      const filteredCollectionSchedules = collectionSchedules.map(schedule => {
        const location = `${schedule.location}, ${schedule.collectionRoute && schedule.collectionRoute.coordinates ? schedule.collectionRoute.coordinates.map(coord => coord.locationName).join(', ') : ''}`;
        const searchTermLower = searchTerm.toLowerCase();
        const locationLower = location.toLowerCase();
    
        if (locationLower.includes(searchTermLower)) {
          const startIndex = locationLower.indexOf(searchTermLower);
          const endIndex = startIndex + searchTermLower.length;
          const highlightedLocation = `${location.substring(0, startIndex)}<span class="highlight">${location.substring(startIndex, endIndex)}</span>${location.substring(endIndex)}`;
          return { ...schedule, highlightedLocation };
        } else {
          return null;
        }
      }).filter(schedule => schedule !== null);
    
      const filteredEventsData = eventsData.map(event => {
        const location = `${event.location}, ${event.collectionRoute && event.collectionRoute.coordinates ? event.collectionRoute.coordinates.map(coord => coord.locationName).join(', ') : ''}`;
        const searchTermLower = searchTerm.toLowerCase();
        const locationLower = location.toLowerCase();
    
        if (locationLower.includes(searchTermLower)) {
          const startIndex = locationLower.indexOf(searchTermLower);
          const endIndex = startIndex + searchTermLower.length;
          const highlightedLocation = `${location.substring(0, startIndex)}<span class="highlight">${location.substring(startIndex, endIndex)}</span>${location.substring(endIndex)}`;
          return { ...event, highlightedLocation };
        } else {
          return null;
        }
      }).filter(event => event !== null);
    
      const filteredAssignmentsData = assignmentsData.map(assignment => {
        const location = `${assignment.location}, ${assignment.collectionRoute && assignment.collectionRoute.coordinates ? assignment.collectionRoute.coordinates.map(coord => coord.locationName).join(', ') : ''}`;
        const searchTermLower = searchTerm.toLowerCase();
        const locationLower = location.toLowerCase();
    
        if (locationLower.includes(searchTermLower)) {
          const startIndex = locationLower.indexOf(searchTermLower);
          const endIndex = startIndex + searchTermLower.length;
          const highlightedLocation = `${location.substring(0, startIndex)}<span class="highlight">${location.substring(startIndex, endIndex)}</span>${location.substring(endIndex)}`;
          return { ...assignment, highlightedLocation };
        } else {
          return null;
        }
      }).filter(assignment => assignment !== null);
    
      if (filteredAllSchedules.length === 0 && filteredCollectionSchedules.length === 0 && filteredEventsData.length === 0 && filteredAssignmentsData.length === 0 && searchTerm.trim() !== '') {
      }
    
      setAllSchedulesData(filteredAllSchedules);
      setCollectionSchedules(filteredCollectionSchedules);
      setEventsData(filteredEventsData);
      setAssignmentsData(filteredAssignmentsData);
    };
    
  
    useEffect(() => {
      handleSearch();
    }, [searchTerm]);
    
  

    // Function to handle sorting by date
    const handleSortByDate = () => {
      // Toggle sorting order
      const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
      setSortOrder(newSortOrder);
    
      // Sort collectionSchedules based on the selected order
      const sortedCollectionSchedules = [...collectionSchedules].sort((a, b) => {
        const dateA = new Date(a.selectedDate).getTime();
        const dateB = new Date(b.selectedDate).getTime();
        return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
    
      // Sort allSchedulesData based on the selected order
      const sortedAllSchedulesData = [...allSchedulesData].sort((a, b) => {
        const dateA = new Date(a.selectedDate).getTime();
        const dateB = new Date(b.selectedDate).getTime();
        return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      
      const sortedEventsSchedules = [...eventsData].sort((a, b) => {
        const dateA = new Date(a.selectedDate).getTime();
        const dateB = new Date(b.selectedDate).getTime();
        return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      
      const sortedAssignments = [...assignmentsData].sort((a, b) => {
        const dateA = new Date(a.selectedDate).getTime();
        const dateB = new Date(b.selectedDate).getTime();
        return newSortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      });
      

      // Update state variables with the sorted data
      setCollectionSchedules(sortedCollectionSchedules);
      setAllSchedulesData(sortedAllSchedulesData);
      setEventsData(sortedEventsSchedules);
      setAssignmentsData(sortedAssignments);
    };
    

    useEffect(() => {
      const fetchDataByType = async (type) => {
        try {
          const q = query(collection(db, 'schedule'), where('type', '==', type));
          const snapshot = await getDocs(q);
          const data = snapshot.docs.map(doc => doc.data());
          switch (type) {
            case 'Collection':
              setCollectionLength(data.length);
              break;
            case 'Event':
              setEventsLength(data.length);
              break;
            case 'Assignment':
              setAssignmentsLength(data.length);
              break;
            default:
              break;
          }
        } catch (error) {
          console.error(`Error fetching ${type} data:`, error);
        }
      };
  
      fetchDataByType('Collection');
      fetchDataByType('Event');
      fetchDataByType('Assignment');
    }, []);
    

      const fetchScheduleData = async () => {
        try {
          const scheduleCollection = collection(db, 'schedule');
          const scheduleSnapshot = await getDocs(scheduleCollection);
          const data = scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setScheduleData(data);
        } catch (error) {
          console.error('Error fetching schedule data:', error);
        }
      };

      fetchScheduleData();

      const handleAllSchedulesButtonClick = async () => {
        try {
          const scheduleCollection = collection(db, 'schedule');
          const scheduleSnapshot = await getDocs(scheduleCollection);
          const data = scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setAllSchedulesData(data);
          setShowAllScheduleTable(true);
          setShowCollectionTable(false);
          setShowEventsTable(false);
          setShowAssignmentsTable(false);
        } catch (error) {
          console.error('Error fetching all schedules:', error);
        }
      };
      
    const handleCollectionButtonClick = async () => {
      try {
        const q = query(scheduleCollection, where('type', '==', 'Collection'));
        const collectionSnapshot = await getDocs(q);
        const data = collectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCollectionSchedules(data);
        setShowCollectionTable(true); 
        setShowEventsTable(false);
        setShowAssignmentsTable(false); 
        setShowAllScheduleTable(false);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    
    const handleEventsButtonClick = async () => {
      try {
        const q = query(scheduleCollection, where('type', '==', 'Event'));
        const eventsSnapshot = await getDocs(q);
        const data = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setEventsData(data);
        setShowEventsTable(true); 
        setShowCollectionTable(false); 
        setShowAssignmentsTable(false); 
        setShowAllScheduleTable(false);
      } catch (error) {
        console.error('Error fetching events data:', error);
      }
    };

    const handleAssignmentsButtonClick = async () => {
      try {
        const q = query(scheduleCollection, where('type', '==', 'Assignment'));
        const assignmentsSnapshot = await getDocs(q);
        const data = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAssignmentsData(data);
        setShowAssignmentsTable(true); 
        setShowCollectionTable(false); 
        setShowEventsTable(false); 
        setShowAllScheduleTable(false);
      } catch (error) {
        console.error('Error fetching assignments data:', error);
      }
    };

    const deleteSchedule = async (id) => {
      try {
        const scheduleRef = doc(db, 'schedule', id);
        await deleteDoc(scheduleRef);
    
        if (showAllScheduleTable) {
          const updatedAllSchedulesData = allSchedulesData.filter(schedule => schedule.id !== id);
          setAllSchedulesData(updatedAllSchedulesData);
        } else if (showCollectionTable) {
          const updatedCollectionSchedules = collectionSchedules.filter(schedule => schedule.id !== id);
          setCollectionSchedules(updatedCollectionSchedules);
        } else if (showEventsTable) {
          const updatedEventsData = eventsData.filter(schedule => schedule.id !== id);
          setEventsData(updatedEventsData);
        } else if (showAssignmentsTable) {
          const updatedAssignmentsData = assignmentsData.filter(schedule => schedule.id !== id);
          setAssignmentsData(updatedAssignmentsData);
        }
        fetchScheduleData();
        window.alert('Schedule successfully deleted');
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    };
      
      return (
        <div style={{ marginLeft: 40, marginTop: 40, width: 1000 }}>
          <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
            <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650 }}>
              Schedule
            </h1>
            <input
                  type="text"
                  placeholder="Search location"
                  className="searchBar"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                  <button className="searchButton" onClick={() => { handleSearch(); setSearchTerm(''); }}>
                  <FaSearch style={{ fontSize: 20}} />
              </button>
              <button className="notifIcon" onClick={toggleNotification}>
                <FaBell />
              </button>
            <Notification isOpen={isNotificationOpen} onClose={toggleNotification} />
          </div>
        
          <div className="schedule-container">
            <div className="schedule-Total" >
              <p style={{ marginTop: 20, display: 'flex', fontFamily: 'Inter', justifyContent: 'center', fontWeight: 600 }}>Total Collection</p>
              <p style={{ margin: 0, display: 'flex', fontFamily: 'Inter', justifyContent: 'center', fontWeight: 'bold', fontSize: '4.1em', }}>{collectionLength}</p>
            </div>
            <div className="schedule-Total" style={{ marginLeft: 310 }}>
              <p style={{ marginTop: 20, display: 'flex', fontFamily: 'Inter', justifyContent: 'center', fontWeight: 600 }}>Total Events</p>
              <p style={{ margin: 0, display: 'flex', fontFamily: 'Inter', justifyContent: 'center', fontWeight: 'bold', fontSize: '4.1em', }}>{eventsLength}</p>
            </div>
            <div className="schedule-Total" style={{ marginLeft: 620 }}>
              <p style={{ marginTop: 15, display: 'flex', fontFamily: 'Inter', justifyContent: 'center', fontWeight: 600 }}>Total Assignments</p>
              <p style={{ margin: 0, display: 'flex', fontFamily: 'Inter', justifyContent: 'center', fontWeight: 'bold', fontSize: '4.1em', }}>{assignmentsLength}</p>
            </div>
          </div>
          <div style={{ marginTop: 230 }}>
            <div className="filterSchedule" style={{ display: 'flex', justifyContent: 'left' }}>
              <button className="allschedules" onClick={handleAllSchedulesButtonClick} style={{ width: '40px' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ padding: 5, margin: 0, marginBottom: 3, fontWeight: 600 }}>All</p>
                  </div>
                </div>
              </button>
              <button className="collection" onClick={handleCollectionButtonClick} style={{ width: '86px' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ padding: 5, margin: 0, marginBottom: 3, fontWeight: 600 }}>Collection</p>
                  </div>
                </div>
              </button>
              <button className="events" onClick={handleEventsButtonClick} style={{ width: '65px' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ padding: 5, margin: 0, marginBottom: 3, fontWeight: 600 }}>Events</p>
                  </div>
                </div>
              </button>
              <button className="assignments" onClick={handleAssignmentsButtonClick} style={{ width: '100px' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ padding: 5, margin: 0, marginBottom: 3, fontWeight: 600 }}>Assignments</p>
                  </div>
                </div>
              </button>
              
            </div>
            {showAllScheduleTable && (
              <div className="allschedule-table">
                {allSchedulesData.length > 0 && (
                  <table style={{ marginTop: 20, borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                    <tr>
                      <th style={{ width: '10%' }}>Type</th>
                      <th style={{ width: '15%' }}>Description</th>
                      <th style={{ width: '10%'}} onClick={handleSortByDate}>
                        Date
                       {sortOrder === 'asc' ? '▲' : '▼'}
                      </th>
                      <th style={{ width: '10%' }}>Time</th>
                      <th style={{ width: '25%' }}>Location</th>
                      <th style={{ width: '12%' }}>Assigned Driver/Truck</th>
                      <th style={{ width: '8%' }}>Action</th>
                    </tr>
                    </thead>
                    <tbody>
                      {allSchedulesData.map(schedule => (
                        <tr key={schedule.id}>
                          <td>{schedule.type}</td>
                          <td>{schedule.description}</td>
                          <td>{schedule.selectedDate}</td>
                          <td>{schedule.startTime}</td>
                          <td>
                            {schedule.highlightedLocation ? (
                              <span dangerouslySetInnerHTML={{ __html: schedule.highlightedLocation }}></span>
                            ) : (
                              <div>
                                {schedule.location && (
                                  <div>
                                    <MdPlace style={{ marginRight: '2px', color: 'red' }} /> 
                                    {schedule.location}
                                  </div>
                                )}
                                {schedule.collectionRoute && schedule.collectionRoute.coordinates && (
                                  <div>
                                    {schedule.collectionRoute.coordinates.map((coord, index) => (
                                      <div key={index}>
                                        <MdPlace style={{ marginRight: '2px', color: 'red' }} /> 
                                        {coord.locationName}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                          <td>{schedule.assignCollector || schedule.assignedTruck || 'N/A'}</td>
                          <td>
                            <MdOutlineModeEdit style={{ fontSize: '24px', color: 'green' }} /> 
                            <MdDelete style={{ fontSize: '24px', color: 'red' }}  onClick={() => deleteSchedule(schedule.id)}/> 
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            {showCollectionTable && (
              <div className="colschedule-table">
                {collectionSchedules.length > 0 && (
                  <table style={{ marginTop: 20, borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '15%' }}>Description</th>
                        <th style={{ width: '10%'}} onClick={handleSortByDate}>
                        Date
                       {sortOrder === 'asc' ? '▲' : '▼'}
                      </th>
                        <th>Time</th>
                        <th style={{ width: '45%' }}>Collection Route</th>
                        <th style={{ width: '10%' }}>Assigned Driver/Truck</th>
                        <th style={{ width: '9%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectionSchedules.map(schedule => (
                        <tr key={schedule.id}>
                          <td>{schedule.description}</td>
                          <td>{schedule.selectedDate}</td>
                          <td>{schedule.startTime}</td>
                          <td>
                            {schedule.highlightedLocation ? (
                              <span dangerouslySetInnerHTML={{ __html: schedule.highlightedLocation }}></span>
                            ) : (
                              <div>                       
                                {schedule.collectionRoute && schedule.collectionRoute.coordinates && (
                                  <div>
                                    {schedule.collectionRoute.coordinates.map((coord, index) => (
                                      <div key={index}>
                                        <MdPlace style={{ marginRight: '2px', color: 'red' }} /> 
                                        {coord.locationName}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        <td>{schedule.assignCollector || schedule.assignedTruck || 'N/A'}</td> {/* Modified line */}
                          <td>
                            <MdOutlineModeEdit style={{ fontSize: '24px', color: 'green' }} />
                            <MdDelete style={{ fontSize: '24px', color: 'red' }}  onClick={() => deleteSchedule(schedule.id)}/>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            {showEventsTable && (
              <div className="events-table">
                {eventsData.length > 0 && (
                  <table style={{ marginTop: 20, borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th style={{ width: '10%'}} onClick={handleSortByDate}>
                        Date
                       {sortOrder === 'asc' ? '▲' : '▼'}
                      </th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventsData.map(event => (
                        <tr key={event.id}>
                          <td>{event.title}</td>
                          <td>{event.description}</td>
                          <td>{event.selectedDate}</td>
                          <td>{event.startTime}</td>
                          <td>
                          {event.highlightedLocation ? (
                            <span dangerouslySetInnerHTML={{ __html: event.highlightedLocation }}></span>
                          ) : (
                            <span>{event.location}</span>
                          )}
                        </td>
                          <td>
                            <MdOutlineModeEdit style={{ fontSize: '24px', color: 'green' }} /> {/* Edit icon */}
                            <MdDelete style={{ fontSize: '24px', color: 'red' }} onClick={() => deleteSchedule(event.id)} /> {/* Delete icon */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            {showAssignmentsTable && (
              <div className="assignments-table">
                {assignmentsData.length > 0 && (
                  <table style={{ marginTop: 20, borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th style={{ width: '25%' }}>Description</th>
                        <th style={{ width: '10%'}} onClick={handleSortByDate}>
                          Date
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </th>
                        <th style={{ width: '10%' }}>Time</th>
                        <th style={{ width: '30%' }}>Location</th>
                        <th style={{ width: '15%' }}>Assigned Driver</th>
                        <th style={{ width: '10%' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignmentsData.map(assignment => (
                        <tr key={assignment.id}>
                          <td>{assignment.description}</td>
                          <td>{assignment.selectedDate}</td>
                          <td>{assignment.startTime}</td>
                          <td>
                          {assignment.highlightedLocation ? (
                            <span dangerouslySetInnerHTML={{ __html: assignment.highlightedLocation }}></span>
                          ) : (
                            <span>{assignment.location}</span>
                          )}
                        </td>
                          <td>{assignment.assignCollector || assignment.assignedTruck || 'N/A'}</td>
                          <td>
                            <MdDelete style={{ fontSize: '24px', color: 'red' }} onClick={() => deleteSchedule(assignment.id)} /> {/* Delete icon */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }