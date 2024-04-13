import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import '../styleSheet/schedTabStyle.css';
import { db } from '../firebase-config';
import { MdOutlineModeEdit, MdDelete } from 'react-icons/md';
import AddSchedModal from "../Modals/AddSched";
import EditAssignmentModal from "../Modals/EditAssignment";
import EditCollectionModal from "../Modals/EditCollection";
import EditEventModal from "../Modals/EditEvent";

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
    const [isEditEventModalOpen, setIsEditEventModalOpen] =useState (false);
    const [isEditAssignmentModalOpen, setIsEditAssignmentModalOpen] = useState(false);
    const [isEditCollectionModalOpen, setIsEditCollectionModalOpen] =useState (false);
    const [selectedCollection, setSelectedCollection] =useState ();

    const scheduleCollection = collection(db, 'schedule');

    useEffect(() => {
      const fetchLoggedInUserMunicipality = async () => {
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
                const userMunicipality = userData.municipality;

                setLoggedInUserMunicipality(userMunicipality); // Set the municipality of the logged-in user
                console.log(userMunicipality); // Log the municipality
              }
            }
          });
        } catch (error) {
          console.error('Error fetching logged-in user data:', error);
        }
      };

      fetchLoggedInUserMunicipality();
    }, []);

    useEffect(() => {
      const fetchDataByType = async (type, setData) => {
        try {
          const q = query(scheduleCollection, where('type', '==', type));
          const scheduleSnapshot = await getDocs(q);
          const data = scheduleSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setData(data);
        } catch (error) {
          console.error(`Error fetching ${type} data:`, error);
        }
      };
    
      fetchDataByType('Collection', setCollectionData);
      fetchDataByType('Event', setEventsData);
      fetchDataByType('Assignment', setAssignmentsData);
    }, []);
    
    
    useEffect(() => {
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
    }, []);

    const handleAllSchedulesButtonClick = async () => {
      try {
        const q = query(scheduleCollection);
        const collectionSnapshot = await getDocs(q);
        const data = collectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const filteredData = data.filter(schedule => {
          const locationIncludesUserMunicipality = schedule.location && schedule.location.includes(loggedInUserMunicipality);
          const collectionRouteIncludesUserMunicipality = schedule.collectionRoute && schedule.collectionRoute.coordinates.some(coord => coord.locationName && coord.locationName.includes(loggedInUserMunicipality));
          return locationIncludesUserMunicipality || collectionRouteIncludesUserMunicipality;
        });
        setAllSchedulesData(filteredData);
        setShowAllScheduleTable(true);
        setShowCollectionTable(false);
        setShowEventsTable(false);
        setShowAssignmentsTable(false);
      } catch (error) {
        console.error('Error fetching collection data:', error);
      }
    };
    
    const handleCollectionButtonClick = async () => {
      try {
        const q = query(scheduleCollection, where('type', '==', 'Collection'));
        const collectionSnapshot = await getDocs(q);
        const data = collectionSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const filteredData = data.filter(schedule => {
          const collectionRouteIncludesUserMunicipality = schedule.collectionRoute && schedule.collectionRoute.coordinates.some(coord => coord.locationName && coord.locationName.includes(loggedInUserMunicipality));
          return collectionRouteIncludesUserMunicipality;
        });
        setCollectionSchedules(filteredData);
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
        
        const filteredData = data.filter(schedule => {
          const locationIncludesUserMunicipality = schedule.location && schedule.location.includes(loggedInUserMunicipality);
          const collectionRouteIncludesUserMunicipality = schedule.collectionRoute && schedule.collectionRoute.coordinates.some(coord => coord.locationName && coord.locationName.includes(loggedInUserMunicipality));
          return locationIncludesUserMunicipality || collectionRouteIncludesUserMunicipality;
        });
        setEventsData(filteredData);
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
        const filteredData = data.filter(schedule => {
          const locationIncludesUserMunicipality = schedule.location && schedule.location.includes(loggedInUserMunicipality);
          return locationIncludesUserMunicipality;
        });
        setAssignmentsData(filteredData);
        setShowAssignmentsTable(true); 
        setShowCollectionTable(false); 
        setShowEventsTable(false); 
        setShowAllScheduleTable(false);
      } catch (error) {
        console.error('Error fetching assignments data:', error);
      }
    };

    const handleAddSchedClick = () => {
      setIsModalOpen(true);
    };
    

  
    const handleCloseModal = () => {
      setIsModalOpen(false);
    };
    const handleEventCloseModal = () => {
      setIsEditEventModalOpen(false);
    }
    const handleEventEditClick = () => {
      setIsEditEventModalOpen(true);
      setIsEditAssignmentModalOpen(false);
      setIsEditCollectionModalOpen(false);
    };
    const handleCollectionCloseModal = () => {
      setIsEditCollectionModalOpen(false);
    }
   
    const handleCollectionEditClick = (selectedCollection) => {
      setSelectedCollection(selectedCollection); // Set the selected collection data
      setIsEditCollectionModalOpen(true); // Open the edit collection modal
    };
    
    const handleAssignmentCloseModal = () => {
      setIsEditAssignmentModalOpen(false);
    }
    const handleAssignmentEditClick = () => {
      setIsEditAssignmentModalOpen(true);
      setIsEditEventModalOpen(false);
      setIsEditCollectionModalOpen(false);
    };


    const getRouteLocationNames = (coordinates) => {
      return coordinates.map(coord => coord.locationName).join(', ');
    };

    useEffect(() => {
      const filteredCollectionSchedules = collectionData.filter(schedule => schedule.type === 'Collection');
      setCollectionSchedules(filteredCollectionSchedules);
    }, [collectionData]);

    const eventsLength = scheduleData.filter(item => 
      item.type === 'Event' && item.location && item.location.includes(loggedInUserMunicipality)).length;
    const assignmentsLength = scheduleData.filter(item => 
      item.type === 'Assignment' && item.location && item.location.includes(loggedInUserMunicipality)).length;    
    const collectionLength = scheduleData.filter(item => 
        item.type === 'Collection' &&
        item.collectionRoute && 
        item.collectionRoute.coordinates.some(coord => coord.locationName && coord.locationName.includes(loggedInUserMunicipality))
      ).length;
      
      return (
        <div style={{ marginLeft: 40, marginTop: 40, width: 1000 }}>
          <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
            <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650 }}>
              Schedule
            </h1>
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
            <div className="filterSchedule" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="allschedules" onClick={handleAllSchedulesButtonClick} style={{ width: '10%' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ padding: 5, margin: 0, marginBottom: 3, fontWeight: 600 }}>All</p>
                  </div>
                </div>
              </button>
              <button className="collection" onClick={handleCollectionButtonClick} style={{ width: '20%' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ padding: 5, margin: 0, marginBottom: 3, fontWeight: 600 }}>Collection</p>
                  </div>
                </div>
              </button>
              <button className="events" onClick={handleEventsButtonClick} style={{ width: '20%' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ padding: 5, margin: 0, marginBottom: 3, fontWeight: 600 }}>Events</p>
                  </div>
                </div>
              </button>
              <button className="assignments" onClick={handleAssignmentsButtonClick} style={{ width: '20%' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ padding: 5, margin: 0, marginBottom: 3, fontWeight: 600 }}>Assignments</p>
                  </div>
                </div>
              </button>
              <button className="addSched" onClick={handleAddSchedClick} style={{ width: '30%', marginLeft: '-40px' }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <p style={{ padding: 5, margin: 0, marginBottom: 3, width: 100, fontWeight: 600 }}>+ Add Schedule</p>
                  </div>
                </div>
              </button>
              {isModalOpen && <AddSchedModal isOpen={isModalOpen} handleClose={handleCloseModal} />}
            </div>
            {showAllScheduleTable && (
              <div className="allschedule-table">
                {allSchedulesData.length > 0 && (
                  <table style={{ marginTop: 20, borderCollapse: 'collapse', width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Assigned Driver</th>
                        <th>Action</th>
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
                            {schedule.location && schedule.location}
                            {schedule.collectionRoute && schedule.collectionRoute.coordinates && 
                              getRouteLocationNames(schedule.collectionRoute.coordinates)}
                          </td>
                          <td>{schedule.assignCollector || 'N/A'}</td>
                          <td>
                            <MdOutlineModeEdit style={{ fontSize: '24px', color: 'green' }} /> {/* Edit icon */}
                            <MdDelete style={{ fontSize: '24px', color: 'red' }} /> {/* Delete icon */}
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
                        <th>Description</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Collection Route</th>
                        <th>Assigned Driver</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {collectionSchedules.map(schedule => (
                        <tr key={schedule.id}>
                          <td>{schedule.description}</td>
                          <td>{schedule.selectedDate}</td>
                          <td>{schedule.startTime}</td>
                          <td>{getRouteLocationNames(schedule.collectionRoute.coordinates)}</td>
                          <td>{schedule.assignCollector}</td>
                          <td>
                            <MdOutlineModeEdit style={{ fontSize: '24px', color: 'green' }} onClick={handleCollectionEditClick} /> {/* Edit icon */}
                            <MdDelete style={{ fontSize: '24px', color: 'red' }} /> {/* Delete icon */}
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
                        <th>Date</th>
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
                          <td>{event.location}</td>
                          <td>
                            <MdOutlineModeEdit style={{ fontSize: '24px', color: 'green' }} onClick={handleEventEditClick} /> {/* Edit icon */}
                            <MdDelete style={{ fontSize: '24px', color: 'red' }} /> {/* Delete icon */}
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
                        <th>Description</th>
                        <th>Date</th>
                        <th>Time</th>
                        <th>Location</th>
                        <th>Assigned Driver</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignmentsData.map(assignment => (
                        <tr key={assignment.id}>
                          <td>{assignment.description}</td>
                          <td>{assignment.selectedDate}</td>
                          <td>{assignment.startTime}</td>
                          <td>{assignment.location}</td>
                          <td>{assignment.assignCollector}</td>
                          <td>
                            <MdOutlineModeEdit style={{ fontSize: '24px', color: 'green' }} onClick={handleAssignmentEditClick} /> {/* Edit icon */}
                            <MdDelete style={{ fontSize: '24px', color: 'red' }} /> {/* Delete icon */}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
            <div>
                  {isEditEventModalOpen && <EditEventModal isOpen={isEditEventModalOpen} handleClose={handleEventCloseModal} />}
                  {isEditCollectionModalOpen && (
                  <EditCollectionModal
                    isOpen={isEditCollectionModalOpen}
                    handleClose={handleCollectionCloseModal}
                    selectedCollection={selectedCollection} // Pass the selected collection data
                  />
                )}
                  {isEditAssignmentModalOpen && <EditAssignmentModal isOpen={isEditAssignmentModalOpen} handleClose={handleAssignmentCloseModal} />}
              </div>
          </div>
        </div>
      );
    }