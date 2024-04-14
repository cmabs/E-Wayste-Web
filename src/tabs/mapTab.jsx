import { React, useState, useEffect , useCallback} from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/mapTabStyle.css'

import { FaSearch, FaBell } from 'react-icons/fa';
import { GiMineTruck } from 'react-icons/gi';
import { BsFillPersonFill } from 'react-icons/bs';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow} from '@react-google-maps/api';
import { db , storage} from '../firebase-config';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

const containerStyle = {
    width: '650px',
    height: '570px'
};

const center = {
    lat: 10.3157,
    lng: 123.8854
};
async function fetchUncollectedReports() {
    const q = query(collection(db, 'generalUsersReports'), where('status', '==', 'uncollected'));
    const querySnapshot = await getDocs(q);
    const uncollectedReports = [];
    querySnapshot.forEach((doc) => {
        const reportData = doc.data();
        uncollectedReports.push({
            id: doc.id,
            position: {
                lat: reportData.latitude,
                lng: reportData.longitude
            },
            associatedImage: reportData.associatedImage,
            location: reportData.location // Assuming the location field is stored in your Firestore document
        });
    });
    return uncollectedReports;
}

export default function Map() {

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyCJxjr37KaccJuCPGnJ_p6_N7Ke1I7b9ys" 
    });

    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [uncollectedReports, setUncollectedReports] = useState([]); 
    const [selectedMarker, setSelectedMarker] = useState(null);
    
    useEffect(() => {
        // Function to fetch markers from Firestore and associated images from Firebase Storage
        async function fetchMarkers() {
          // Fetch markers from Firestore (generalusersreports collection)
          const firestoreMarkers = []; // Store markers from Firestore
    
          // Assume you have fetched the markers from Firestore and stored them in an array named firestoreMarkers
    
          // Fetch associated images from Firebase Storage for each marker
        const firestoreMarkersWithImages = await Promise.all(firestoreMarkers.map(async (marker) => {
            const imageUrl = await storage.ref(`postImages/${marker.associatedImage}`).getDownloadURL();
            return { ...marker, imageUrl }; // Add imageUrl to the marker object
        }));

        setMarkers(firestoreMarkersWithImages);

        }
    
        fetchMarkers(); // Fetch markers when the component mounts
      }, []);
    const handleMarkerClick = useCallback((marker) => {
        setSelectedMarker(marker);
      }, []);
      
      const handleInfoClose = () => {
        setSelectedMarker(null);
      };
    const onLoad = useCallback(function callback(map) {
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    useEffect(() => {
        async function fetchData() {
            try {
                const uncollectedReportsData = await fetchUncollectedReports();
                setUncollectedReports(uncollectedReportsData);
            } catch (error) {
                console.error('Error fetching uncollected reports:', error);
            }
        }
        fetchData();
    }, []);

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
            <div style={{ marginLeft: 40, marginTop: 40, width: 1030 }}>
                <div style={{display: 'flex', flexDirection: 'row', marginBottom: 0}}>
                    <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650}}>Map</h1>
                    <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', gap: 10 }}>
                        <button className="notifIcon">
                            <FaBell />
                        </button>
                    </div>
                </div>
                <div style={{marginTop: 20, display: 'flex', flexDirection: 'row', gap: 20, width: 1020}}>
                    <div className="mapList">
                        <div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'flex-end'}}>
                            <input type="text" placeholder="Search" className="searchBar2" />
                            <button className="searchButton"><FaSearch style={{fontSize: 20}} /></button>
                        </div>
                        <p style={{fontFamily: 'Inter', fontWeight: 600, color: 'rgb(69,168,53)', paddingBottom: 0, marginBottom: 10}}>Ongoing Collection</p>
                        {CollectionListContent ()}
                    </div >
                 <div />
                 <div className="mapPage">
                    {isLoaded ? (
                <GoogleMap 
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={10}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                >{uncollectedReports.map((report, index) => (
                    <Marker 
                    key={index}
                    position={report.position}
                    onClick={() => handleMarkerClick(report)}
                    icon={{
                      
                        scaledSize: new window.google.maps.Size(20, 25)
                    }}
                />
                ))}
                 {selectedMarker && (
                    <InfoWindow
                    position={selectedMarker.position}
                    onCloseClick={handleInfoClose}
                >
                    <div style={{ width: 200 }}>
                        <img
                            src={selectedMarker.imageUrl} // Use the imageUrl fetched from Firebase Storage
                            alt="Report Image"
                            style={{ width: 80, height: 80 }}
                        />
                        <div>{selectedMarker.location}</div>
                    </div>
                </InfoWindow>
            )}
                    <></>
                </GoogleMap>
            ) : (
                
                <></>
            )}
            
            </div>
          </div>
       </div>
       
        </>
    );
} 