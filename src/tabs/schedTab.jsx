import React, { useState } from "react";
import '../styleSheet/schedTabStyle.css';

export default function Schedule() {
    const [selectedSchedule, setSelectedSchedule] = useState(null);
  
    // Sample events for demonstration
    const schedules = [
      { id: 1, title: 'Events' },
      { id: 2, title: 'Assigments' },
      { id: 3, title: 'Collections' },
    ];
  
    const handleEventClick = (scheduleId) => {
      const selected = schedules.find(schedules => schedules.id === scheduleId);
      setSelectedSchedule(selected);
    };
  
    return (
      <div className="schedule-container">
        <div className="tab-header-sched">Schedule</div>
        <div className="schedule-content">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="event-card" onClick={() => handleEventClick(schedule.id)}>
              <div className="event-title">{schedule.title}</div>
              <div className="event-details">
              </div>
            </div>
          ))}
        </div>
  
        {/* {selectedSchedule && (
          <div className="event-details-container">
            <h2>Event Details</h2>
            <p>Title: {selectedSchedule.title}</p>
            <p>Date: {selectedSchedule.date}</p>
            <p>Time: {selectedSchedule.time}</p>
            <p>Details: {selectedSchedule.details}</p>
          </div>
        )} */}
      </div>
    );
  }
