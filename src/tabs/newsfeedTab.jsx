import { React, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/dashTabStyle.css'

import { FaSearch, FaBell } from 'react-icons/fa';

export default function Newsfeed() {
    return (
        <>
            <div style={{ marginLeft: 40, marginTop: 40, width: 902 }}>
                <div style={{display: 'flex', flexDirection: 'row', marginBottom: 0}}>
                    <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650}}>Newsfeed</h1>
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
            </div>
        </>
    );
}