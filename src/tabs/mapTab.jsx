import { React, useState, useEffect , useCallback} from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/mapTabStyle.css'
import { FaSearch, FaBell } from 'react-icons/fa';
import { GiMineTruck } from 'react-icons/gi';
import { BsFillPersonFill } from 'react-icons/bs';
import { useJsApiLoader, GoogleMap, Marker ,  InfoWindow} from '@react-google-maps/api';
import { db , storage} from '../firebase-config';
import { collection, getDocs, where, query, doc, getDoc } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { AdvancedMarkerElement } from 'google-maps'; // Updated import statement

const containerStyle = {
    width: '650px',
    height: '500px'
};

const center = {
    lat: 10.3157,
    lng: 123.8854
};

async function fetchReportsByStatus(status) {
    const q = query(collection(db, 'generalUsersReports'), where('status', '==', status));
    const querySnapshot = await getDocs(q);
    const reports = [];
    querySnapshot.forEach((doc) => {
        const reportData = doc.data();
        reports.push({
            id: doc.id,
            latitude: reportData.latitude,
            longitude: reportData.longitude,
            associatedImage: reportData.associatedImage,
            location: reportData.location,
            status: reportData.status,
            userId: reportData.userId,
        });
    });
    return reports;
}


async function fetchTruckDetails() {
    const q = query(collection(db, 'trucks')); // Assuming 'trucks' is the collection name
    const querySnapshot = await getDocs(q);
    const truckDetails = [];
    querySnapshot.forEach((doc) => {
        const truckData = doc.data();
        truckDetails.push({
            plateNo: truckData.plateNo,
            driverID: truckData.driverID
        });
    });
    return truckDetails;
}

async function fetchDriverName(driverID) {
    const userRef = doc(db, 'users', driverID); 
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
        const userData = userDoc.data();
        return `${userData.firstName} ${userData.lastName}`;
    } else {
        console.log(`No user found with ID: ${driverID}`);
        return null;
    }
}

async function fetchUsername(userId) {
    try {
        const userRef = doc(db, 'users', userId);

        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            const userData = userDoc.data();
            const username = userData.username; 
            return username;
        } else {
            console.log(`No user found with ID: ${userId}`);
            return null;
        }
    } catch (error) {
        console.error('Error fetching username:', error);
        return null;
    }
}


async function fetchUncollectedReports() {
    const q = query(collection(db, 'generalUsersReports'), where('status', '==', 'uncollected'));
    const querySnapshot = await getDocs(q);
    const uncollectedReports = [];
    querySnapshot.forEach((doc) => {
        const reportData = doc.data();
        uncollectedReports.push({
            id: doc.id,
            latitude: reportData.latitude,
            longitude: reportData.longitude,
            associatedImage: reportData.associatedImage,
            location: reportData.location,
            status: reportData.status,
            userId: reportData.userId,
        });
    });
    return uncollectedReports;
}
async function fetchAndLogUncollectedReports() {
    try {
        const uncollectedReportsData = await fetchUncollectedReports();
        console.log("Uncollected Reports:", uncollectedReportsData);
    } catch (error) {
        console.error('Error fetching uncollected reports:', error);
    }
}

fetchAndLogUncollectedReports();


export default function Map() {

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyCCKJQavilVTZguPP8Bxy0GCPVasd3Ravg" 
    });

    const [map, setMap] = useState(null);
    const [markers, setMarkers] = useState([]);
    const [uncollectedReports, setUncollectedReports] = useState([]); 
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [imageURL, setImageURL] = useState(null);
    const [truckList, setTruckList] = useState([]); 
    const [reports, setReports] = useState([]);
    const [filter, setFilter] = useState('uncollected');

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

    useEffect(() => {
        async function fetchTruckList() {
            try {
                const truckListData = await fetchTruckDetails();
                const truckListWithDriverNames = await Promise.all(truckListData.map(async (truck) => {
                    const driverName = await fetchDriverName(truck.driverID);
                    return { ...truck, driverName };
                }));
                setTruckList(truckListWithDriverNames);
            } catch (error) {
                console.error('Error fetching truck list:', error);
            }
        }
        fetchTruckList();
    }, []);
      
    useEffect(() => {
        async function fetchData() {
            try {
                const reportsData = await fetchReportsByStatus(filter);
                setReports(reportsData);
            } catch (error) {
                console.error(`Error fetching ${filter} reports:`, error);
            }
        }
        fetchData();
    }, [filter]);

    const handleMarkerClick = useCallback((marker) => {
        setSelectedMarker(marker);
    }, []);

    const handleFilterButtonClick = useCallback((status) => {
        setFilter(status);
    }, []);

      useEffect(() => {
        const fetchImageURL = async () => {
            if (selectedMarker) {
                try {
                    const url = await getDownloadURL(ref(storage, `postImages/${selectedMarker.associatedImage}`));
                    setImageURL(url);
                } catch (error) {
                    console.error('Error fetching image URL:', error);
                }
            }
        };
        fetchImageURL();
    }, [selectedMarker]);

      useEffect(() => {
        const fetchImageURL = async () => {
            if (selectedMarker) {
                try {
                    const url = await getDownloadURL(ref(storage, `postImages/${selectedMarker.associatedImage}`));
                    setImageURL(url);
                } catch (error) {
                    console.error('Error fetching image URL:', error);
                }
            }
        };
        fetchImageURL();
    }, [selectedMarker]);
      
    const handleInfoClose = () => {
        setSelectedMarker(null);
    };

    const onLoad = useCallback(function callback(map) {
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
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {truckList.map((truck, index) => (
                    <div className="collectionB" key={index}>
                        <button>
                            <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                                <div style={{ display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start' }}>
                                    <p style={{ padding: 0, margin: 0, marginBottom: 3, fontWeight: 600, fontSize: 20, color: 'rgb(120,120,120)' }}>Plate Number</p>
                                    <p style={{ padding: 0, margin: 0, fontSize: 25, fontWeight: 800 }}>{truck.plateNo}</p>
                                </div>
                                <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                    <GiMineTruck style={{ fontSize: 80, color: 'rgb(110,170,46)' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start', textAlign: 'left', paddingTop: 20, borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderColor: 'rgb(13,86,1)' }}>
                                <p style={{ padding: 0, margin: 0, marginBottom: 3, fontWeight: 600, color: 'rgb(120,120,120)' }}>Driver Name</p>
                                <p style={{ padding: 0, margin: 0, marginBottom: 15, fontSize: '1.3em', fontWeight: 800, color: 'rgb(13,86,1)' }}>{truck.driverName}</p>
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div style={{ marginLeft: 40, marginTop: 40, width: 1030 }}>
            <div style={{ display: 'flex', flexDirection: 'row', marginBottom: 0, alignItems: 'center' }}>
                    <h1 style={{ fontFamily: 'Inter', color: 'rgb(13, 86, 1)', fontSize: 40, fontWeight: 800, marginBottom: 0, width: 650 }}>Map</h1>
                    <div className="map-filter-buttons"> 
                        <button className={filter === 'uncollected' ? 'uncollected' : 'collected'} onClick={() => handleFilterButtonClick('uncollected')}>Uncollected</button>
                        <button className={filter === 'collected' ? 'uncollected' : 'collected'} onClick={() => handleFilterButtonClick('collected')}>Collected</button>
                    </div>
                </div>
                <div style={{ marginTop: 20, display: 'flex', flexDirection: 'row', gap: 20, width: 1020 }}>
                    <div className="mapList">
                        <div style={{display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'flex-end'}}>
                            <input type="text" placeholder="Search" className="searchBar2" />
                            <button className="searchButton"><FaSearch style={{fontSize: 20}} /></button>
                        </div>
                        <p style={{fontFamily: 'Inter', fontWeight: 600, color: 'rgb(69,168,53)', paddingBottom: 0, marginBottom: 10}}></p>
                        {CollectionListContent ()}
                    </div >
                 <div/>
                    <div/>
                    <div className="mapPage">
                        {isLoaded ? (
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={center}
                                zoom={10}
                            >
                                {reports.map((report, index) => (
                                    <Marker
                                        key={index}
                                        position={{
                                            lat: parseFloat(report.latitude),
                                            lng: parseFloat(report.longitude)
                                        }}
                                        onClick={() => handleMarkerClick(report)}
                                    />
                                ))}
                                {selectedMarker && (
                                    <InfoWindow
                                        position={{
                                            lat: parseFloat(selectedMarker.latitude),
                                            lng: parseFloat(selectedMarker.longitude)
                                        }}
                                        onCloseClick={handleInfoClose}
                                    >
                                        <div style={{ width: 200, height: 100 }}>
                                            <img
                                                src={`https://firebasestorage.googleapis.com/v0/b/e-wayste.appspot.com/o/postImages%2F${selectedMarker.associatedImage}?alt=media`}
                                                alt="Report Image"
                                                style={{ width: 100, height: 100 }}
                                            />
                                            <div style={{ marginLeft: 10 }}>
                                                <p>Location: {selectedMarker.location}</p>
                                                <p>Status: {selectedMarker.status}</p>
                                            </div>
                                        </div>
                                    </InfoWindow>
                                )}
                            </GoogleMap>
                        ) : (
                            <div>Loading...</div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}