import React, { useState } from "react";
import { FaSearch, FaBell } from 'react-icons/fa';
import '../styleSheet/schedTabStyle.css';


export default function Schedule() {
  const [selectedType, setSelectedType] = useState("");
  const [isDetailsOpen, setDetailsOpen] = useState(false);
  const [isAddSchedOpen, setAddSchedOpen] =useState(false);
  const [isCollectionModalOpen, setCollectionModalOpen] = useState(false);
  const [isEventsModalOpen, setEventsModalOpen] = useState(false);
  const [isAssignmentsModalOpen, setAssignmentsModalOpen] = useState(false);
 

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


  const handleSelectChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedType(selectedValue);

    // Check the selected value and open the corresponding modal
    switch (selectedValue) {
      case "collection":
        setCollectionModalOpen(true);
        setEventsModalOpen(false);
        setAssignmentsModalOpen(false);
        break;
      case "events":
        setEventsModalOpen(true);
        setCollectionModalOpen(false);
        setAssignmentsModalOpen(false);
        break;
      case "assignments":
        setAssignmentsModalOpen(true);
        setCollectionModalOpen(false);
        setEventsModalOpen(false);
        break;
      default:
        setCollectionModalOpen(false);
        setEventsModalOpen(false);
        setAssignmentsModalOpen(false);
        break;
    }
  };

      const handleButtonClick = () => {
        // Add logic here to perform any actions before opening the modal
        setDetailsOpen(true);
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
      
function ScheduleList() {
 
  let temp = [];
  for (let i = 0; i < 10; i++) {
    temp.push(
      <div className="scheduleB" key={i}>
        <button onClick={handleButtonClick}>
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <div style={{ display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start' }}>
              <p style={{ padding: 0, margin: 0, marginBottom: 3, fontWeight: 800 }}>Clean-Up Drive -Talamban Cebu City</p>
              <p style={{ padding: 0, margin: 0, fontSize: '1.1em', fontWeight: 600, color: 'rgb(120,120,120)' }}>January 2, 2024</p>
            </div>
            <div> 9:00 AM</div>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto', maxHeight: '600px' }}>
      {temp}
      {isDetailsOpen && (
        <div className="modal-overlay">
        <div className="modal-content">
          <div style={{ display: 'flex', flexDirection: 'column'}}>
          <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 25, fontWeight: 800, marginBottom: 8 }}>
           Schedule Details
          </h1>
          <h1 style={{ fontSize: '1.1em', fontWeight: 600, fontFamily: 'Inter', padding: 0, margin: 8, marginBottom: 5}}>Type </h1>
              <input
                type="text"
                style={{ backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '3px', border: '1px solid #0D5601', width: 450, marginLeft: 7}}
              />
              <p style={{ fontSize: '1.1em', fontWeight: 600, fontFamily: 'Inter',  padding: 0, margin: 8, marginBottom: 5}}>Description </p>
              <input
                type="text"
                style={{ backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '3px', border: '1px solid #0D5601', width: 450, marginLeft: 7}}
              />
               <p style={{ fontSize: '1.1em', fontWeight: 600, fontFamily: 'Inter',  padding: 0, margin: 8, marginBottom: 5}}>Location </p>
              <input
                type="text"
                style={{ backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '3px', border: '1px solid #0D5601', width: 450, marginLeft: 7}}
              />
               <p style={{ fontSize: '1.1em', fontWeight: 600, fontFamily: 'Inter',  padding: 0, margin: 8, marginBottom: 5}}>Title </p>
              <input
                type="text"
                style={{ backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '3px', border: '1px solid #0D5601', width: 450, marginLeft: 7}}
              />
               <p style={{ fontSize: '1.1em', fontWeight: 600, fontFamily: 'Inter',  padding: 0, margin: 8, marginBottom: 5}}>Date </p>
              <input
                type="text"
                style={{ backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '3px', border: '1px solid #0D5601', width: 450, marginLeft: 7}}
              />
               <p style={{ fontSize: '1.1em', fontWeight: 600, fontFamily: 'Inter',  padding: 0, margin: 8, marginBottom: 5}}>Time</p>
              <input
                type="text"
                style={{ backgroundColor: '#e0e0e0', padding: '15px', borderRadius: '3px', border: '1px solid #0D5601', width: 450, marginLeft: 7}}
              />
            </div>
           <button style={{backgroundColor: '#51AF5B', borderRadius:10, borderColor: '#51AF5B', marginTop: 20}} onClick={() => setDetailsOpen(false)}>Cancel</button>
        </div>
      </div>
      )}
    </div>
  );
}
 
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
          <option value="Select Type">Select Type</option>
          <option value="collection">Collection</option>
          <option value="events">Events</option>
          <option value="assignments">Assignments</option>
 
        </select>
      </div>
      
      {/* Conditionally render the modals based on the selected value */}
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
          <div className="schedule-Total">
            <p style={{ margin: 8, display:'flex', fontFamily:'Inter', justifyContent:'center', fontWeight: 600}}>Total Schedules</p>
            <p style={{ margin:0, display:'flex', fontFamily:'Inter', justifyContent:'center', fontWeight: 'bold', fontSize: '3.1em',}}>10</p>
           
           </div> 
          </div>
          <div style={{marginTop: 200}}>
            <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
             <div style={{padding: 0, margin: 0, fontSize: '1.2em', fontWeight: 600,marginRight: 15, color: '#0D5601'}}>Filter : </div>
             <div className="filter-box">
           </div> 
            </div>
          <div className="filterSchedule">
           <button className="all">
              <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                <div style={{display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{padding: 0, margin: 0, marginBottom: 3, fontWeight: 600}}>All</p>    
                </div>
              </div>
            </button>   
            <button className="collection">
              <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                <div style={{display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{padding: 0, margin: 0, marginBottom: 3, fontWeight: 600}}>Collection</p>    
                </div>
              </div>
            </button>     
            <button className="events">
              <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                <div style={{display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start'}}>
                    <p style={{padding: 0, margin: 0, marginBottom: 3, fontWeight: 600}}>Events</p>    
                </div>
              </div>
            </button>     
            <button className="assignments">
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
            {isAddSchedOpen && (
              <div className="modal-overlay">
                {addSideSchedule()}
              </div>
            )}
            {!isAddSchedOpen && (
                <div className="schedule-set">
                  {ScheduleList()}
                </div>
            )}
           </div>
          </div>
         
      </div>
   
    );
  }
