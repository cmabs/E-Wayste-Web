import React, { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import moment from 'moment';
import '../styleSheet/NotificationStyle.css';
import { FaFileAlt, FaTrash, FaCalendarAlt } from 'react-icons/fa';


export default function Notification({ isOpen, onClose }) {
  
  const [reports, setReports] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [users, setUsers] = useState([]);
  const db = getFirestore();
  useEffect(() => {
    const fetchReportsData = async () => {
      try {
        const reportRef = collection(db, 'generalUsersReports');
        const snapshot = await getDocs(reportRef);
        const reportData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReports(reportData);

        // Subscribe to real-time updates for reports
        const unsubscribeReports = reportRef.onSnapshot(snapshot => {
          const newReports = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setReports(newReports);
        });

        return unsubscribeReports; // Cleanup subscription
      } catch (error) {
        console.error('Error fetching reports:', error);
      }
    };

    const fetchSchedulesData = async () => {
      try {
        const schedRef = collection(db, 'schedule');
        const snapshot = await getDocs(schedRef);
        const schedData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setSchedules(schedData);
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    // Fetch data from Firestore collections
    fetchReportsData();
    fetchSchedulesData();

    // Cleanup subscriptions
  }, [db]);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const userRef = collection(db, 'users');
        const snapshot = await getDocs(userRef);
        const userData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(userData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    // Fetch user data
    fetchUsersData();
  }, [db]);

  // Define function to get username based on userId
  function getUserUsername(userId) {
    const user = users.find(user => user.id === userId);
    return user ? user.username : 'Unknown';
  }

  // Define function to display notifications
  function displayNotif(displayNotifType) {
    const currentDate = moment().utcOffset('+08').format('YYYY-MM-DD');
  
    // Filter notifications based on display type
    const filteredNotifications = [];
    if (displayNotifType === 'Reminder') {
      schedules.forEach(sched => {
        if (moment(sched.selectedDate).isSame(currentDate, 'day')) {
          if (sched.type === 'Collection') {
            const username = getUserUsername(sched.userID);
            filteredNotifications.push(
              <div key={sched.id} style={{ display: 'flex', flex: 1, width: 370, height: 110, backgroundColor: 'rgb(231, 247, 233)', borderRadius: 15, overflow: 'hidden', flexDirection: 'row' , marginBottom: 10}}>
            <div style={{ height: '100%', width: 70, backgroundColor: 'rgb(189,228,124)', justifyContent: 'center', alignItems: 'center' }}>
              <div style={{ width: 50, height: 50, borderRadius: 100, backgroundColor: 'rgb(81,175,91)', justifyContent: 'center', alignItems: 'center' }}>
                {/* Report icon */}
                {/* <Ionicons name='file-tray-full' style={{ fontSize: 35, color: 'rgb(13,86,1)' }} /> */}
              </div>
            </div>
            <div style={{ display: 'flex', flex: 1, marginLeft: 10, marginTop: 7 }}>
            <div style={{ marginLeft: 10 }}>
                <div style={{ width: '100%', margin: 0, padding: 0 }}>
                  <p style={{ fontSize: 19, fontWeight: 500, color: 'rgb(13,86,1)', marginTop: 5, marginBottom: 2 }}>{sched.type}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, marginTop: 3, margin: 0, padding: 3 }}>Garbage Collection scheduled by {username}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, marginTop: 3, margin: 0, padding: 0 }}>{sched.description}</p>
                  <p style={{ fontSize: 10, marginBottom:3,  padding: 0 }}>{sched.startTime}</p>
                </div>
              </div>
              </div>
          </div> 
            );
          } else if (sched.type === 'Event') {
            const username = getUserUsername(sched.userID);
            filteredNotifications.push(
              <div key={sched.id} style={{ display: 'flex', flex: 1, width: 370, height: 110, backgroundColor: 'rgb(231, 247, 233)', borderRadius: 15, overflow: 'hidden', flexDirection: 'row' , marginBottom: 10}}>
              <div style={{ height: '100%', width: 70, backgroundColor: 'rgb(189,228,124)', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: 100, backgroundColor: 'rgb(81,175,91)', justifyContent: 'center', alignItems: 'center' }}>
                  {/* Report icon */}
                  {/* <Ionicons name='file-tray-full' style={{ fontSize: 35, color: 'rgb(13,86,1)' }} /> */}
                </div>
              </div>
              <div style={{ display: 'flex', flex: 1, marginLeft: 10, marginTop: 7 }}>
              <div style={{ marginLeft: 10 }}>
                  <div style={{ width: '100%', margin: 0, padding: 0 }}>
                    <p style={{ fontSize: 19, fontWeight: 500, color: 'rgb(13,86,1)', marginTop: 5, marginBottom: 2 }}>{sched.type}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, marginTop: 3, margin: 0, padding: 3 }}>Event scheduled by {username}</p>
                    <p style={{ fontSize: 14, fontWeight: 600, marginTop: 3, margin: 0, padding: 0 }}>{sched.description}</p>
                    <p style={{ fontSize: 10, marginBottom:3,  padding: 0 }}>{sched.startTime}</p>
                  </div>
                </div>
                </div>
            </div> 
            );
          }
        }
      });
    } else if (displayNotifType === 'All') {
      reports.forEach(report => {
        const username = getUserUsername(report.userId);
        filteredNotifications.push( 
          <div key={report.id} style={{ display: 'flex', flex: 1, width: 370, height: 110, backgroundColor: 'rgb(231, 247, 233)', borderRadius: 15, overflow: 'hidden', flexDirection: 'row' , marginBottom: 10}}>
          <div style={{ height: '100%', width: 85, backgroundColor: 'rgb(189,228,124)', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 60, height: 60, marginTop: 30, marginLeft: 13, borderRadius: 100, backgroundColor: 'rgb(81,175,91)', justifyContent: 'center', alignItems: 'center' }}>
            <FaFileAlt style={{ fontSize: 35, color: 'rgb(13,86,1)', marginLeft: 12, marginTop: 12}} />
            </div>
          </div>
          <div style={{ display: 'flex', flex: 1, marginLeft: 10, marginTop: 7 }}>
          <div style={{ marginLeft: 10 }}>
              <div style={{ width: '100%', margin: 0, padding: 0 }}>
                <p style={{ fontSize: 19, fontWeight: 500, color: 'rgb(13,86,1)', marginTop: 5, marginBottom: 2 }}>{report.type} Report</p>
                <p style={{ fontSize: 12, fontWeight: 600, marginTop: 3, margin: 0, padding: 3 }}>Garbage Report by {username}</p>
                <p style={{ fontSize: 14, fontWeight: 600, marginTop: 3, margin: 0, padding: 0 }}>{report.description}</p>
                <p style={{ fontSize: 10, marginBottom:3,  padding: 0 }}>{report.dateTime}</p>
              </div>
            </div>
            </div>
        </div>
          
        );
      });
      schedules.forEach(sched => {
        if (sched.type === 'Collection') {
          const username = getUserUsername(sched.userID);
          filteredNotifications.push(
            <div key={sched.id} style={{ display: 'flex', flex: 1, width: 370, height: 110, backgroundColor: 'rgb(231, 247, 233)', borderRadius: 15, overflow: 'hidden', flexDirection: 'row' , marginBottom: 10}}>
            <div style={{ height: '100%', width: 85, backgroundColor: 'rgb(189,228,124)', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 60, height: 60, marginTop: 30, marginLeft: 13, borderRadius: 100, backgroundColor: 'rgb(81,175,91)', justifyContent: 'center', alignItems: 'center' }}>
            <FaTrash style={{ fontSize: 35, color: 'rgb(13,86,1)', marginLeft: 12, marginTop: 12}} />
            </div>
          </div>
            <div style={{ display: 'flex', flex: 1, marginLeft: 10, marginTop: 7 }}>
            <div style={{ marginLeft: 10 }}>
                <div style={{ width: '100%', margin: 0, padding: 0 }}>
                  <p style={{ fontSize: 19, fontWeight: 500, color: 'rgb(13,86,1)', marginTop: 5, marginBottom: 2 }}>{sched.type}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, marginTop: 3, margin: 0, padding: 3 }}>Garbage Collection scheduled by {username}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, marginTop: 3, margin: 0, padding: 0 }}>{sched.description}</p>
                  <p style={{ fontSize: 10, marginBottom:3,  padding: 0 }}>{sched.dateTimeUploaded}</p>
                </div>
              </div>
              </div>
          </div> 
          );
        } else if (sched.type === 'Event') {
          const username = getUserUsername(sched.userID);
          filteredNotifications.push(
            <div key={sched.id} style={{ display: 'flex', flex: 1, width: 370, height: 110, backgroundColor: 'rgb(231, 247, 233)', borderRadius: 15, overflow: 'hidden', flexDirection: 'row' , marginBottom: 10}}>
            <div style={{ height: '100%', width: 85, backgroundColor: 'rgb(189,228,124)', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ width: 60, height: 60, marginTop: 30, marginLeft: 13, borderRadius: 100, backgroundColor: 'rgb(81,175,91)', justifyContent: 'center', alignItems: 'center' }}>
            <FaCalendarAlt style={{ fontSize: 35, color: 'rgb(13,86,1)', marginLeft: 12, marginTop: 12}} />
            </div>
          </div>
            <div style={{ display: 'flex', flex: 1, marginLeft: 10, marginTop: 7 }}>
            <div style={{ marginLeft: 10 }}>
                <div style={{ width: '100%', margin: 0, padding: 0 }}>
                  <p style={{ fontSize: 19, fontWeight: 500, color: 'rgb(13,86,1)', marginTop: 5, marginBottom: 2 }}>{sched.type}</p>
                  <p style={{ fontSize: 12, fontWeight: 600, marginTop: 3, margin: 0, padding: 3 }}>Event scheduled by {username}</p>
                  <p style={{ fontSize: 14, fontWeight: 600, marginTop: 3, margin: 0, padding: 0 }}>{sched.description}</p>
                  <p style={{ fontSize: 10, marginBottom:3,  padding: 0 }}>{sched.startTime}</p>
                </div>
              </div>
              </div>
          </div> 
          );
        }
      });
    }
  
    return (
      <div className="notification-list">
        {filteredNotifications.length > 0 ? filteredNotifications : <p>No notifications</p>}
      </div>
    );
  }
  return (
    <div className={`notification ${isOpen ? 'open' : ''}`}>
      <div className="notification-content">
        <button className="close-btn" onClick={onClose}>Close</button>
        <h2 style={{ fontSize: 28, color: 'green' }}>Notification</h2>
        <div className="modal-scrollable-content">
        
            <div style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'rgb(13,86,1)', marginBottom: 5 }}>Reminder Today</div>
              <div className="scrollable-notification">
                {/* Call displayNotif function with appropriate parameters */}
                {displayNotif('Reminder')}
              </div>
            </div>
            <div style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <h1 style={{ fontSize: 20, fontWeight: 700, color: 'rgb(13,86,1)', marginBottom: 5 }}>Notification History</h1>
              <div className="scrollable-notification">
                {/* Call displayNotif function with appropriate parameters */}
                {displayNotif('All')}
              </div>
            </div>
       
        </div>
      </div>
    </div>
  );
}  