import { React, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/mapTabStyle.css'

import { FaSearch, FaBell } from 'react-icons/fa';
import { GiMineTruck } from 'react-icons/gi';
import { BsFillPersonFill } from 'react-icons/bs';

export default function Map() {

    function CollectionListContent() {
        let temp = [];
        for (let i = 0; i < 50; i++) {
            temp.push(
                <div className="collectionB">
                    <button>
                        <div style={{display: 'flex', flexDirection: 'row', width: '100%'}}>
                            <div style={{display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start'}}>
                                <p style={{padding: 0, margin: 0, marginBottom: 3, fontWeight: 600, color: 'rgb(120,120,120)'}}>Plate Number</p>
                                <p style={{padding: 0, margin: 0, fontSize: '1.1em', fontWeight: 800}}>HAS 1234</p>
                            </div>
                            <div style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <GiMineTruck style={{fontSize: 50, color: 'rgb(110,170,46)'}} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start', textAlign: 'left', paddingTop: 45, borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderColor: 'rgb(13,86,1)'}}>
                            <p style={{padding: 0, margin: 0, marginBottom: 3, fontWeight: 600, color: 'rgb(120,120,120)'}}>Location</p>
                            <p style={{padding: 0, margin: 0, marginBottom: 15, fontSize: '1.3em', fontWeight: 800, color: 'rgb(13,86,1)'}}>Jumabon St., Apas, Cebu City, 6000</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', textAlign: 'left', paddingTop: 8 }}>
                            <div style={{ display: 'flex', height: 40, width: 40, backgroundColor: 'rgb(249, 227, 181)', borderRadius: 100, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgb(226,160,43)', justifyContent: 'center', alignItems: 'center', marginLeft: 10}}>
                                <BsFillPersonFill style={{fontSize: 30, color: 'rgb(226,160,43)'}} />
                            </div>
                            <div style={{ display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start', marginLeft: 10}}>
                                <p style={{padding: 0, margin: 0, fontSize: '1.1em', fontWeight: 800}}>Arturo Jansen</p>
                                <p style={{padding: 0, margin: 0, fontWeight: 600, color: 'rgb(120,120,120)'}}>Apas, Cebu City</p>
                            </div>
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
            <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
                {temp}
            </div>
        );
    }

    return (
        <>
            <div style={{ marginLeft: 40, marginTop: 40, width: 902 }}>
                <div style={{display: 'flex', flexDirection: 'row', marginBottom: 0}}>
                    <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650}}>Map</h1>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: 10 }}>
                        <button className="notifIcon">
                            <FaBell />
                        </button>
                    </div>
                </div>
                <div style={{marginTop: 20, display: 'flex', flexDirection: 'row', gap: 20, width: 980}}>
                    <div className="mapList">
                        <div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'flex-end'}}>
                            <input type="text" placeholder="Search" className="searchBar2" />
                            <button className="searchButton"><FaSearch style={{fontSize: 20}} /></button>
                        </div>
                        <p style={{fontFamily: 'Inter', fontWeight: 600, color: 'rgb(69,168,53)', paddingBottom: 0, marginBottom: 10}}>Ongoing Collection</p>
                        {CollectionListContent ()}
                    </div>
                    <div className="mapPage" />
                </div>
            </div>
        </>
    );
}