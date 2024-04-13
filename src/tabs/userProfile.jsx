import { React, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import userlogo from '../images/userlogo.png';
import '../styleSheet/Profile.css';
import { db } from "../firebase-config";

import { FaSearch, FaBell } from 'react-icons/fa';
import { MdEdit } from "react-icons/md";

export default function Profile() {
    
    return (
        <>
            <div style={{ marginLeft: 40, marginTop: 40, width: 902 }}>
                <div style={{display: 'flex', flexDirection: 'row', marginBottom: 0}}>
                    <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650}}>Profile</h1>
                </div>
                <div style={{display:'flex', flexDirection:'row', alignItems:'center', gap: 40  }}>
                    <div className="profilePic">
                        <img src={userlogo} alt="user-logo" className="logoImage" />
                    </div>
                    <h1 style={{margin: 0, padding: 0, fontFamily: 'Inter', fontSize:25, fontWeight: 800}}>John Doe</h1>
                </div>
                <div style={{marginTop:40, display:'flex', flexDirection:'column'}}>
                    <h1 style={{fontFamily:'Inter', color:'rgb(50, 50, 50)', fontWeight: 800, fontSize: 20}}>Personal Info</h1>
                    <div style={{display:'flex', width: '100%', flexDirection:'column', alignItems:"flex-end"}}>
                        <div style={{display:'flex', flexDirection:'column', width:'100%', borderStyle:"solid", borderWidth: 1, borderColor: 'green', paddingTop: 15, paddingBottom: 20}}>
                            <div style={{display: 'flex', flexDirection:'row',flex: 1, marginLeft: 20, }}>
                                <div style={{display: 'flex',flex: 1, flexDirection: 'column', gap: 43, paddingTop: 26}}>
                                    <p className="form-label">Name</p>
                                    <p className="form-label">Email</p>
                                    <p className="form-label">Contact No.</p>
                                </div>
                                <div style={{display: 'flex',flex: 3,  flexDirection: 'column', gap: 30, paddingTop: 10, paddingRight: 20}}>
                                    <input className="form-input" type="text" />
                                    <input className="form-input" type="text" />
                                    <input className="form-input" type="text" />
                                </div>
                            </div>
                            <div style={{display: 'flex', flex: 1, justifyContent:"center", paddingTop: 50, gap: 30}}>
                                <button className="btnSave">Save</button>
                                <button className="btnCancel" >Cancel</button>
                            </div>
                        </div>
                    </div>
                </div>
        
            </div>          
        </>
    );
}