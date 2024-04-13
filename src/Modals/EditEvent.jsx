import React from 'react';

export default function EditEventModal({ isOpen, handleClose, handleSave }) {
  const handleCancel = () => {
    handleClose();
  };

  const handleSaveClick = () => {
    // Call the handleSave function passed from the parent component
    handleSave();
  };

  return (
    <div className={`modal ${isOpen ? 'is-open' : ''}`}>
      <div className="modal-overlay" onClick={handleClose}></div>
      <div className="modal-content">
        <div className="modal-header">
        <p style={{  fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 30, fontWeight: 800, marginBottom: 10, width: 650 }}>
                  Edit Event
          </p>
          <button className="close-button" onClick={handleClose}>X</button>
        </div>
        <div className="modal-body">
          {/* Add form fields for editing event */}
          <button onClick={handleSaveClick}>Save</button>
          <button onClick={handleCancel}>Cancel</button>
        </div>
      </div>
      
    </div>
  );
} 