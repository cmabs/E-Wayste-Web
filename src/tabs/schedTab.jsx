import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, getDoc, addDoc, doc, deleteDoc, where, query  } from 'firebase/firestore';
import { FaSearch, FaBell } from 'react-icons/fa';
import '../styleSheet/schedTabStyle.css';
import { db } from '../firebase-config';


export default function Schedule() {
  const [selectedType, setSelectedType] = useState("");
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isAddSchedOpen, setAddSchedOpen] =useState(false);

  const [isCollectionModalOpen, setCollectionModalOpen] = useState(false);
  const [isEventsModalOpen, setEventsModalOpen] = useState(false);
  const [isAssignmentsModalOpen, setAssignmentsModalOpen] = useState(false);

  const [scheduleData, setScheduleData] = useState([]);

  const [collectionData, setCollectionData] = useState([]);
  const [eventsData, setEventsData] = useState([]);
  const [assignmentsData, setAssignmentsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data for Collection
        const collectionCollection = collection(db, 'schedule').where('type', '==', 'Collection');
        const collectionSnapshot = await getDocs(collectionCollection);
        const collectionData = collectionSnapshot.docs.map(doc => doc.data());
        setCollectionData(collectionData);

        // Fetch data for Events
        const eventsCollection = collection(db, 'schedule').where('type', '==', 'Event');
        const eventsSnapshot = await getDocs(eventsCollection);
        const eventsData = eventsSnapshot.docs.map(doc => doc.data());
        setEventsData(eventsData);

        // Fetch data for Assignments
        const assignmentsCollection = collection(db, 'schedule').where('type', '==', 'Assignment');
        const assignmentsSnapshot = await getDocs(assignmentsCollection);
        const assignmentsData = assignmentsSnapshot.docs.map(doc => doc.data());
        setAssignmentsData(assignmentsData);
      } catch (error) {
        console.error('Error fetching schedule data:', error);
      }
    };

    fetchData();
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
    const eventsLength = scheduleData.filter(item => item.type === 'Event').length;
    const assignmentsLength = scheduleData.filter(item => item.type === 'Assignment').length;
    const collectionLength = scheduleData.filter(item => item.type === 'Collection').length;

      const [selectedTime, setSelectedTime] = useState({
        hour: '',
        minute: '',
        ampm: ''
    });
   
    const handleTimeChange = (event, field) => {
      setSelectedTime({
          ...selectedTime,
          [field]: event.target.value
      });
    };


    const handleSelectChange = (selectedValue) => {
      setSelectedType(selectedValue);
  
      if (selectedValue === "collection") {
        setCollectionModalOpen(true);
        setEventsModalOpen(false);
        setAssignmentsModalOpen(false);
      } else if (selectedValue === "events") {
        setEventsModalOpen(true);
        setCollectionModalOpen(false);
        setAssignmentsModalOpen(false);
      } else if (selectedValue === "assignments") {
        setAssignmentsModalOpen(true);
        setCollectionModalOpen(false);
        setEventsModalOpen(false);
      } else {
        setCollectionModalOpen(false);
        setEventsModalOpen(false);
        setAssignmentsModalOpen(false);
      }
    };

  
      const handleAddSchedClick =() =>{
        
        setAddSchedOpen(!isAddSchedOpen);
      }

      const [selectedDate, setSelectedDate] = useState({
        year: '',
        month: '',
        day: ''
    });
    const handleDateChange = (event, field) => {
      setSelectedDate({
          ...selectedDate,
          [field]: event.target.value
      });
    };
      

 
function addSideSchedule() {
  return (
    <div className="sideschedule" style={{ padding: '10px'}}>
      <div>
        <p style={{ marginLeft: 8, fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 30, fontWeight: 800, marginBottom: 10, width: 650 }}>
          Add Schedule
        </p>
      </div>
      <div className="selectType" style={{ display: 'flex', justifyContent: 'center', marginTop: 20 }}>
        <select  value={selectedType}
          onChange={handleSelectChange}
          style={{ fontSize: '16px', backgroundColor: '#BDE47C', padding: '8px 6px', fontSize: 23, borderColor: '#51AF5B', borderRadius: 5,
           width: 720, textAlignLast: 'center', lineHeight: '1.5' }}>
          <option value="collection">Collection</option>
          <option value="events">Events</option>
          <option value="assignments">Assignments</option>
 
        </select>
      </div>
      {isCollectionModalOpen && (
        <div>
         <div className="selectType" >
              <input
                  placeholder="Add Description"
                  type="text"
                 style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                 width: 708, textAlignLast: 'left', lineHeight: '1.5',border: '1px solid #0D5601', marginTop: 20, marginLeft: 35 }}/>
         </div>
         <div className="selectType" >
              <input
                  placeholder="Select Collector to Assign"
                  type="text"
                 style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                 width: 708, textAlignLast: 'left', lineHeight: '1.5',border: '1px solid #0D5601', marginTop: 10, marginLeft: 35 }}/>
         </div>
         <div className="selectType" >
              <input
                  placeholder="Collection Route"
                  type="text"
                 style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                 width: 708, textAlignLast: 'left', lineHeight: '1.5',border: '1px solid #0D5601', marginTop: 10, marginLeft: 35 }}/>
         </div>
         <div className="selectType">
         <label style={{ marginLeft: 34 }}> Select Date : </label>
          <select
              value={selectedDate.year}
              onChange={(e) => handleDateChange(e, 'year')}
              style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                  width: 100, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 15 }}>
              <option value="" disabled hidden>
                  Year
              </option>
        
              {Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                  <option key={year} value={year}>
                      {year}
                  </option>
              ))}
          </select>

          <select
            value={selectedDate.month}
            onChange={(e) => handleDateChange(e, 'month')}
            style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                width: 100, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 15 }}
          >
            <option value="" disabled hidden>
                Month
            </option>
            
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                    {month}
                </option>
            ))}
        </select>

        <select
            value={selectedDate.day}
            onChange={(e) => handleDateChange(e, 'day')}
            style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                width: 100, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 15 }}
        >
            <option value="" disabled hidden>
                Day
            </option>
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>
                    {day}
                </option>
            ))}
        </select>
    </div>
      <div className="selectType">
            <label style={{ marginLeft: 34 }}> Select Time: </label>
            <select
                value={selectedTime.hour}
                onChange={(e) => handleTimeChange(e, 'hour')}
                style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                    width: 80, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 5 }}
            >
                <option value="" disabled hidden>
                    Hr
                </option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
                    <option key={hour} value={hour}>
                        {hour}
                    </option>
                ))}
            </select>
            <select
                value={selectedTime.minute}
                onChange={(e) => handleTimeChange(e, 'minute')}
                style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                    width: 80, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginRight: 5 }}
            >
                <option value="" disabled hidden>
                    Min
                </option>
                {Array.from({ length: 60 }, (_, index) => index).map((minute) => (
                    <option key={minute} value={minute}>
                        {minute < 10 ? `0${minute}` : minute}
                    </option>
                ))}
            </select>
            <select
                value={selectedTime.ampm}
                onChange={(e) => handleTimeChange(e, 'ampm')}
                style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                    width: 90, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10 }}
            >
                <option value="" disabled hidden>
                    AM
                </option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
         </div>
         <div className="buttonAdd">
           <button style={{  width: 110,  backgroundColor: '#51AF5B', borderRadius: 10, borderColor: '#51AF5B', padding: '8px', color: '#fff', marginRight:20  }}>Save</button>
           <button style={{ width: 100,  backgroundColor: '#FF6347', borderRadius: 10, borderColor: '#FF6347', padding: '8px', color: '#fff' }} onClick={handleAddSchedClick}>Cancel</button>
         </div>
        </div>
      )}
  {/* for  Add Events */}
      {isEventsModalOpen && (
         <div>
         <div className="selectType" >
              <input
                  placeholder="Add Title"
                  type="text"
                 style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                 width: 708, textAlignLast: 'left', lineHeight: '1.5',border: '1px solid #0D5601', marginTop: 20, marginLeft: 35 }}/>
         </div>
         <div className="selectType" >
              <input
                  placeholder="Add Description"
                  type="text"
                 style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                 width: 708, textAlignLast: 'left', lineHeight: '1.5',border: '1px solid #0D5601', marginTop: 10, marginLeft: 35 }}/>
         </div>
         <div className="selectType" >
              <input
                  placeholder="Select Location"
                  type="text"
                 style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                 width: 708, textAlignLast: 'left', lineHeight: '1.5',border: '1px solid #0D5601', marginTop: 10, marginLeft: 35 }}/>
         </div>
         <div className="selectType">
         <label style={{ marginLeft: 34 }}> Select Date : </label>
          <select
              value={selectedDate.year}
              onChange={(e) => handleDateChange(e, 'year')}
              style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                  width: 100, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 15 }}>
              <option value="" disabled hidden>
                  Year
              </option>
        
              {Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                  <option key={year} value={year}>
                      {year}
                  </option>
              ))}
          </select>

          <select
            value={selectedDate.month}
            onChange={(e) => handleDateChange(e, 'month')}
            style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                width: 100, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 15 }}
          >
            <option value="" disabled hidden>
                Month
            </option>
            
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                    {month}
                </option>
            ))}
        </select>

        <select
            value={selectedDate.day}
            onChange={(e) => handleDateChange(e, 'day')}
            style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                width: 100, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 15 }}
        >
            <option value="" disabled hidden>
                Day
            </option>
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>
                    {day}
                </option>
            ))}
        </select>
    </div>
      <div className="selectType">
            <label style={{ marginLeft: 34 }}> Select Time: </label>
            <select
                value={selectedTime.hour}
                onChange={(e) => handleTimeChange(e, 'hour')}
                style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                    width: 80, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 5 }}
            >
                <option value="" disabled hidden>
                    Hr
                </option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
                    <option key={hour} value={hour}>
                        {hour}
                    </option>
                ))}
            </select>
            <select
                value={selectedTime.minute}
                onChange={(e) => handleTimeChange(e, 'minute')}
                style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                    width: 80, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginRight: 5 }}
            >
                <option value="" disabled hidden>
                    Min
                </option>
                {Array.from({ length: 60 }, (_, index) => index).map((minute) => (
                    <option key={minute} value={minute}>
                        {minute < 10 ? `0${minute}` : minute}
                    </option>
                ))}
            </select>
            <select
                value={selectedTime.ampm}
                onChange={(e) => handleTimeChange(e, 'ampm')}
                style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                    width: 90, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10 }}
            >
                <option value="" disabled hidden>
                    AM
                </option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
         </div>
         <div className="buttonAdd">
           <button style={{  width: 110,  backgroundColor: '#51AF5B', borderRadius: 10, borderColor: '#51AF5B', padding: '8px', color: '#fff', marginRight:20  }}>Save</button>
           <button style={{ width: 100,  backgroundColor: '#FF6347', borderRadius: 10, borderColor: '#FF6347', padding: '8px', color: '#fff' }} onClick={handleAddSchedClick}>Cancel</button>
         </div>
        </div>
      )}
     {/* for add Assigments */}
      {isAssignmentsModalOpen && (
         <div>
         <div className="selectType" >
              <input
                  placeholder="Add Description"
                  type="text"
                 style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                 width: 708, textAlignLast: 'left', lineHeight: '1.5',border: '1px solid #0D5601', marginTop: 20, marginLeft: 35 }}/>
         </div>
         <div className="selectType" >
              <input
                  placeholder="Select Collector to Assign"
                  type="text"
                 style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                 width: 708, textAlignLast: 'left', lineHeight: '1.5',border: '1px solid #0D5601', marginTop: 10, marginLeft: 35 }}/>
         </div>
         <div className="selectType" >
              <input
                  placeholder="Select Assigment Location"
                  type="text"
                 style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                 width: 708, textAlignLast: 'left', lineHeight: '1.5',border: '1px solid #0D5601', marginTop: 10, marginLeft: 35 }}/>
         </div>
         <div className="selectType">
         <label style={{ marginLeft: 34 }}> Select Date : </label>
          <select
              value={selectedDate.year}
              onChange={(e) => handleDateChange(e, 'year')}
              style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                  width: 100, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 15 }}>
              <option value="" disabled hidden>
                  Year
              </option>
        
              {Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                  <option key={year} value={year}>
                      {year}
                  </option>
              ))}
          </select>

          <select
            value={selectedDate.month}
            onChange={(e) => handleDateChange(e, 'month')}
            style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                width: 100, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 15 }}
          >
            <option value="" disabled hidden>
                Month
            </option>
            
            {Array.from({ length: 12 }, (_, index) => index + 1).map((month) => (
                <option key={month} value={month}>
                    {month}
                </option>
            ))}
        </select>

        <select
            value={selectedDate.day}
            onChange={(e) => handleDateChange(e, 'day')}
            style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                width: 100, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 15 }}
        >
            <option value="" disabled hidden>
                Day
            </option>
            {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                <option key={day} value={day}>
                    {day}
                </option>
            ))}
        </select>
    </div>
      <div className="selectType">
            <label style={{ marginLeft: 34 }}> Select Time: </label>
            <select
                value={selectedTime.hour}
                onChange={(e) => handleTimeChange(e, 'hour')}
                style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                    width: 80, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginLeft: 10, marginRight: 5 }}
            >
                <option value="" disabled hidden>
                    Hr
                </option>
                {Array.from({ length: 12 }, (_, index) => index + 1).map((hour) => (
                    <option key={hour} value={hour}>
                        {hour}
                    </option>
                ))}
            </select>
            <select
                value={selectedTime.minute}
                onChange={(e) => handleTimeChange(e, 'minute')}
                style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                    width: 80, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10, marginRight: 5 }}
            >
                <option value="" disabled hidden>
                    Min
                </option>
                {Array.from({ length: 60 }, (_, index) => index).map((minute) => (
                    <option key={minute} value={minute}>
                        {minute < 10 ? `0${minute}` : minute}
                    </option>
                ))}
            </select>
            <select
                value={selectedTime.ampm}
                onChange={(e) => handleTimeChange(e, 'ampm')}
                style={{ fontSize: '17px', backgroundColor: '#E5F7E7', padding: '8px 6px', borderColor: '#51AF5B', borderRadius: 5,
                    width: 90, textAlignLast: 'left', lineHeight: '1.5', border: '1px solid #0D5601', marginTop: 10 }}
            >
                <option value="" disabled hidden>
                    AM
                </option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
            </select>
         </div>
         <div className="buttonAdd">
           <button style={{  width: 110,  backgroundColor: '#51AF5B', borderRadius: 10, borderColor: '#51AF5B', padding: '8px', color: '#fff', marginRight:20  }}>Save</button>
           <button style={{ width: 100,  backgroundColor: '#FF6347', borderRadius: 10, borderColor: '#FF6347', padding: '8px', color: '#fff' }} onClick={handleAddSchedClick}>Cancel</button>
         </div>
        </div>
      )}

      {/* Other components or content */}
    </div>
  );
} 
    return (
     <div style={{ marginLeft: 40, marginTop: 10, width: 902 }}>
        <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0 }}>
          <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650 }}>
           Schedule
          </h1>
        </div>  
          {/* {addSideSchedule()} */}
        <div className="schedule-container">
          <div className="schedule-Total" >
            <p style={{ marginTop: 20, display:'flex', fontFamily:'Inter', justifyContent:'center', fontWeight: 600}}>Total Collection</p>
            <p style={{ margin:0, display:'flex', fontFamily:'Inter', justifyContent:'center', fontWeight: 'bold', fontSize: '4.1em',}}>{collectionLength}</p>
           </div> 
           <div className="schedule-Total" style={{ marginLeft: 310}}>
            <p style={{marginTop: 20,display:'flex', fontFamily:'Inter', justifyContent:'center', fontWeight: 600}}>Total Events</p>
            <p style={{ margin:0, display:'flex', fontFamily:'Inter', justifyContent:'center', fontWeight: 'bold',  fontSize: '4.1em',}}>{eventsLength}</p>
           
           </div> 
           <div className="schedule-Total" style={{ marginLeft: 620}}>
            <p style={{marginTop: 15,display:'flex', fontFamily:'Inter', justifyContent:'center', fontWeight: 600}}>Total Assigments</p>
            <p style={{ margin:0, display:'flex', fontFamily:'Inter', justifyContent:'center', fontWeight: 'bold', fontSize: '4.1em',}}>{assignmentsLength}</p>
           
           </div> 
          </div>
          <div style={{marginTop: 200}}>
            <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
             <div style={{padding: 0, margin: 0, fontSize: '1.2em', fontWeight: 600,marginRight: 15, color: '#0D5601'}}>Filter : </div>
             <div className="filter-box">
           </div> 
            </div>
          <div className="filterSchedule">
          
            <button className="collection" onClick={() => handleSelectChange("collection")}>
              <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                <div style={{display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{padding: 0, margin: 0, marginBottom: 3, fontWeight: 600}}>Collection</p>    
                </div>
              </div>
            </button>     
            <button className="events" onClick={() => handleSelectChange("events")}>
              <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                <div style={{display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{padding: 0, margin: 0, marginBottom: 3, fontWeight: 600}}>Events</p>    
                </div>
              </div>
            </button>     
            <button className="assignments" onClick={() => handleSelectChange("assignments")}>
              <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                <div style={{display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{padding: 0, margin: 0, marginBottom: 3, fontWeight: 600}}>Assignments</p>    
                </div>
              </div>
            </button>     
            <button className="addSched" onClick={handleAddSchedClick} >
              <div style={{display: 'flex', flexDirection: 'row'}}>
                <div style={{display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{padding: 3, margin: 0, marginBottom: 3, fontWeight: 600}}>+ AddSchedule</p>    
                </div>
              </div>
            </button>  
          <div style={{marginTop: 15}}>
            {isCollectionModalOpen && (
              <table style={{backgroundColor: '#E5E4E2', border: '2px solid #E5E4E2', borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody className="schedTableBody">
              {collectionData.map(item => (
              <tr key={item.id} style={{ border: '1px solid #ddd', textAlign: 'center' }}>
                <td style={{ borderRight: '1px solid #ddd' }}>{item.title}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{item.description}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{item.location}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{item.selectedDate}</td>
                <td style={{ borderRight: '1px solid #ddd' }}>{item.time}</td>
              </tr>
            ))}
              </tbody>
            </table>
            )}
            {isEventsModalOpen && (
              <table style={{backgroundColor: '#E5E4E2', border: '2px solid #E5E4E2', borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody className="schedTableBody">
                <tr style={{ border: '1px solid #ddd', textAlign: 'center'}}>
                  <td style={{ borderRight: '1px solid #ddd' }}>1234</td>
                  <td style={{ borderRight: '1px solid #ddd' }}></td>
                  <td style={{ borderRight: '1px solid #ddd' }}></td>
                  <td style={{ borderRight: '1px solid #ddd' }}></td>
                  <td style={{ borderRight: '1px solid #ddd' }}></td>
                </tr>
              </tbody>
            </table>
            )}

            {isAssignmentsModalOpen && (
              <table style={{ backgroundColor: '#E5E4E2',border: '2px solid #E5E4E2', borderCollapse: 'collapse', width: '100%' }}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Location</th>
                  <th>Date</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody className="schedTableBody">
                <tr style={{ border: '1px solid #ddd', textAlign: 'center'}}>
                  <td style={{ borderRight: '1px solid #ddd' }}>1234</td>
                  <td style={{ borderRight: '1px solid #ddd' }}></td>
                  <td style={{ borderRight: '1px solid #ddd' }}></td>
                  <td style={{ borderRight: '1px solid #ddd' }}></td>
                  <td style={{ borderRight: '1px solid #ddd' }}></td>
                </tr>
              </tbody>
            </table>
            )}
        </div>
            {isAddSchedOpen && (
              <div className="modal-overlay">
                {addSideSchedule()}
              </div>
            )}
            {!isAddSchedOpen && (
                <div className="schedule-set">
                
                </div>
            )}
           </div>
          </div>
      </div>
   
    );
  }
