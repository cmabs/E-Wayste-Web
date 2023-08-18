import { React, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/manageTabStyle.css'

import { FaSearch, FaBell } from 'react-icons/fa';
import { MdOutlineModeEdit } from 'react-icons/md';
import { ImCheckmark } from 'react-icons/im';

export default function UserManage() {

    function UserListContent() {
        let temp = [];
        for (let i = 0; i < 50; i++) {
            temp.push(
                <div className='userManageB'>
                    <button>
                        <div style={{ flex: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                            <input type="checkbox" className="checkInput" style={{ width: 18, height: 18 }} />
                            <ImCheckmark className="checkmark" />
                        </div>
                        <div style={{ flex: 3, overflow: 'hidden' }}>
                            <p>Username</p>
                        </div>
                        <div style={{ flex: 2, overflow: 'hidden' }}>
                            <p>General Users</p>
                        </div>
                        <div style={{ flex: 2, overflow: 'hidden' }}>
                            <p>ACTIVE</p>
                        </div>
                        <div style={{ flex: 5, overflow: 'hidden' }}>
                            <p>Jugan, Consolacion, Cebu</p>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <button className="editB">
                                <MdOutlineModeEdit />
                            </button>
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
            <div>
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
                <div style={{ marginTop: 50, marginBottom: 40, backgroundColor: 'rgb(243,243,243)', padding: 10, borderRadius: 20 }}>
                    <div style={{ display: 'flex', width: '100%', borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderColor: 'rgb(210,210,210)', marginBottom: 10, fontFamily: 'Inter', fontWeight: 500, fontSize: 14 }}>
                        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' }}>
                            <input type="checkbox" className="checkInput" style={{ width: 18, height: 18 }} />
                            <ImCheckmark className="checkmark2" />
                        </div>
                        <div style={{ display: 'flex', flex: 3, overflow: 'hidden', justifyContent: 'center' }}>
                            <p>Username</p>
                        </div> 
                        <div style={{ display: 'flex', flex: 2, overflow: 'hidden', justifyContent: 'center' }}>
                            <p>Type</p>
                        </div> 
                        <div style={{ display: 'flex', flex: 2, overflow: 'hidden', justifyContent: 'center' }}>
                            <p>Status</p>
                        </div> 
                        <div style={{ display: 'flex', flex: 5, overflow: 'hidden', justifyContent: 'center' }}>
                            <p>Location</p>
                        </div>
                        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', justifyContent: 'center' }}>
                            <p>Edit</p>
                        </div> 
                    </div>
                    {UserListContent()}
                </div>
            </div>
        </>
    );
}