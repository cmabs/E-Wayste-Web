import { React, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/dashTabStyle.css'

import { FaSearch, FaBell } from 'react-icons/fa';

export default function Dashboard() {

    function UserListContent() {
        let temp = [];
        for (let i = 0; i < 50; i++) {
            temp.push(
                <div className='userListB'>
                    <button>
                        <div style={{width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden'}}>
                            <p>User's Name</p>
                        </div>
                        <div style={{width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden'}}>
                            <p style={{color: 'rgb(0,123,0)'}}>ACTIVE</p>
                        </div>
                        <div style={{width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden'}}>
                            <p>SampleEmail@gmail.com</p>
                        </div>
                        <div style={{width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden'}}>
                            <p>General User</p>
                        </div>
                        <div style={{width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderColor: 'rgb(200,200,200)', overflow: 'hidden'}}>
                            <p>04/11/2023</p>
                        </div>
                    </button>
                </div>
            );
        }

        <ul>
            {temp.map(item =>
                <li key="{item}">{item}</li>    
            )}
        </ul>

        return (
            <div style={{display: 'flex', flexDirection: 'column'}}>
                {temp}
            </div>
        );
    }

    return (
        <>
            <div style={{ marginLeft: 40, marginTop: 40 }}>
                <div style={{display: 'flex', flexDirection: 'row', marginBottom: 0}}>
                    <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0 }}>Dashboard</h1>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: 20 }}>
                        <div style={{display: 'flex', flexDirection: 'row'}}>
                            <input type="text" placeholder="Search" className="searchBar" />
                            <button className="searchButton"><FaSearch style={{fontSize: 20}} /></button>
                        </div>
                        <button className="notifIcon">
                            <FaBell />
                        </button>
                    </div>
                </div>
                <h4 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 800, marginBottom: 5 }}>Map Overview</h4>
                <div className="mapDashboard" />
                <h4 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 800, marginBottom: 5 }}>Summary</h4>
                <div style={{ display: 'flex', flexDirection: 'row', gap: 20 }}>
                    <div className="orangeBox">
                        <p style={{fontWeight: 700, color: 'rgb(60,60,60)'}}>TOTAL USERS</p>
                        <p style={{fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3}}>534</p>
                    </div>
                    <div className="orangeBox">
                        <p style={{fontWeight: 700, color: 'rgb(60,60,60)'}}>TOTAL REPORTS</p>
                        <p style={{fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3}}>234</p>
                    </div>
                    <div className="orangeBox">
                        <p style={{fontWeight: 700, color: 'rgb(60,60,60)'}}>REGISTERED LGUs</p>
                        <p style={{fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3}}>45</p>
                    </div>
                    <div className="orangeBox2">
                        <p style={{fontWeight: 700, color: 'rgb(60,60,60)'}}>REGISTERED PROVINCES</p>
                        <p style={{fontWeight: 700, fontSize: 48, color: 'rgb(50,50,50)', marginTop: -3}}>12</p>
                    </div>
                </div>
                <h4 style={{ fontFamily: 'Inter', color: 'rgb(50, 50, 50)', fontWeight: 800, marginBottom: 5 }}>Users</h4>
                <div className="userList">
                    <div style={{fontFamily: 'Inter', fontSize: 13, fontWeight: 500, color: 'rgb(80,80,80)', display: 'flex', flexDirection: 'row', height: 30, backgroundColor: 'rgb(245,245,245)', borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderRightWidth: 1, borderColor: 'rgb(200,200,200)', alignItems: 'center'}}>
                        <div style={{width: '20%', display: 'flex', justifyContent: 'center'}}>
                            <p>Name</p>
                        </div>
                        <div style={{width: '20%', display: 'flex', justifyContent: 'center'}}>
                            <p>Status</p>
                        </div>
                        <div style={{width: '20%', display: 'flex', justifyContent: 'center'}}>
                            <p>Email</p>
                        </div>
                        <div style={{width: '20%', display: 'flex', justifyContent: 'center'}}>
                            <p>Type</p>
                        </div>
                        <div style={{width: '20%', display: 'flex', justifyContent: 'center'}}>
                            <p>Sign up date</p>
                        </div>
                    </div>
                    {UserListContent ()}
                </div>
            </div>
        </>
    );
}