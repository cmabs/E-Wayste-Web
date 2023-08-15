import { React, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/dashTabStyle.css'

import { FaSearch, FaBell } from 'react-icons/fa';

export default function UserManage() {

    function UserListContent() {
        let temp = [];
        for (let i = 0; i < 50; i++) {
            temp.push(
                <div className='userListB'>
                    <button>
                        <div style={{width: '20%', borderStyle: 'solid', borderWidth: 0, borderRightWidth: 1, borderLeftWidth: 1, borderColor: 'rgb(220,220,220)', overflow: 'hidden'}}>
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
            <div style={{ marginLeft: 40, marginTop: 40, width: 902 }}>
                <div style={{display: 'flex', flexDirection: 'row', marginBottom: 0}}>
                    <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650}}>User Management</h1>
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
                <div style={{marginTop: 50, marginBottom: 40}}>
                    {UserListContent()}
                </div>
            </div>
        </>
    );
}