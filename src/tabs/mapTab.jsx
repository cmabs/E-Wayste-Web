import { React, useState, useEffect , useCallback} from "react";
import { NavLink } from "react-router-dom";
import '../styleSheet/mapTabStyle.css'

import { FaSearch, FaBell } from 'react-icons/fa';
import { GiMineTruck } from 'react-icons/gi';
import { BsFillPersonFill, BsGeoAlt } from 'react-icons/bs';
import { useJsApiLoader, GoogleMap, Marker ,  InfoWindow} from '@react-google-maps/api';
import { db , storage} from '../firebase-config';
import { collection, getDocs, where, query } from 'firebase/firestore';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';


const containerStyle = {
    width: '700px',
    height: '580px',
   
};


const center = {
    lat: 10.3156992,
    lng: 123.88543660000005,
};

async function fetchAllUncollectedReports() {
    const querySnapshot = await getDocs(collection(db, 'generalUsersReports'));
    const uncollectedReports = [];
    querySnapshot.forEach((doc) => {
        const reportData = doc.data();
        if (reportData.status === 'uncollected') {
            uncollectedReports.push({
                id: doc.id,
                position: {
                    lat: reportData.latitude,
                    lng: reportData.longitude
                },
                associatedImage: reportData.associatedImage,
                location: reportData.location,
                dateTime: reportData.dateTime
            });
        }
    });
    return uncollectedReports;
}

async function getDriverNames(driverIDs) {
    try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const driverNames = driverIDs.map(driverID => {
            const driver = usersData.find(user => user.id === driverID);
            return driver ? `${driver.firstName} ${driver.lastName}` : '';
        });
        return driverNames;

    } catch (error) {
        console.error('Error fetching users data:', error);
        return [];
    }
}

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
    const [trucksData, setTrucksData] = useState([]);

    useEffect(() => {
        const fetchTrucksData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'trucks'));
                const trucksArray = [];
                querySnapshot.forEach(async (doc) => {
                    const truckData = doc.data();
                    trucksArray.push(truckData);
                });

                // Extracting driver IDs from trucks data
                const driverIDs = trucksArray.map(truck => truck.driverID);

                // Fetching driver names for all driver IDs
                const driverNames = await getDriverNames(driverIDs);

                // Adding driver names to trucks data
                trucksArray.forEach((truck, index) => {
                    truck.driverName = driverNames[index];
                });


                setTrucksData(trucksArray);
            } catch (error) {
                console.error('Error fetching trucks data:', error);
            }
        };

        fetchTrucksData();
    }, []);

     useEffect(() => {
        const fetchTrucksData = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, 'trucks'));
                const trucksArray = [];
                querySnapshot.forEach((doc) => {
                    const truckData = doc.data();
                    trucksArray.push(truckData);
                });
                setTrucksData(trucksArray);
            } catch (error) {
                console.error('Error fetching trucks data:', error);
            }
        };

        fetchTrucksData();
    }, []);

    
    const handleMarkerClick = useCallback((marker) => {
        setSelectedMarker(marker);
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
                const uncollectedReportsData = await fetchAllUncollectedReports();
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
            {trucksData.map((truck, index) => (
                <div className="collectionB" key={index}>
                    <button>
                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
                            <div style={{ display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start' }}>
                                <p style={{ padding: 0, margin: 0, marginBottom: 3, fontWeight: 600, color: 'rgb(120,120,120)' }}>Plate Number</p>
                                <p style={{ padding: 0, margin: 0, fontSize: '1.1em', fontWeight: 800 }}>{truck.plateNo}</p>
                            </div>
                            <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <GiMineTruck style={{ fontSize: 50, color: 'rgb(110,170,46)' }} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start', textAlign: 'left', paddingTop: 45, borderStyle: 'solid', borderWidth: 0, borderBottomWidth: 1, borderColor: 'rgb(13,86,1)' }}>
                            <p style={{ padding: 0, margin: 0, marginBottom: 3, fontWeight: 600, color: 'rgb(120,120,120)' }}>Location</p>
                            <p style={{ padding: 0, margin: 0, marginBottom: 15, fontSize: '1.3em', fontWeight: 800, color: 'rgb(13,86,1)' }}>{truck.location}</p>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'row', width: '100%', alignItems: 'center', textAlign: 'left', paddingTop: 8 }}>
                            <div style={{ display: 'flex', height: 40, width: 40, backgroundColor: 'rgb(249, 227, 181)', borderRadius: 100, borderStyle: 'solid', borderWidth: 1, borderColor: 'rgb(226,160,43)', justifyContent: 'center', alignItems: 'center', marginLeft: 10 }}>
                                <BsFillPersonFill style={{ fontSize: 30, color: 'rgb(226,160,43)' }} />
                            </div>
                            <div style={{ display: 'flex', flex: 5, flexDirection: 'column', alignItems: 'flex-start', marginLeft: 10 }}>
                                <p style={{ padding: 0, margin: 0, fontSize: '1.1em', fontWeight: 800 }}>{truck.driverName}</p>
                                <p style={{ padding: 0, margin: 0, fontWeight: 600, color: 'rgb(120,120,120)' }}>location</p>

                            </div>
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
                  {selectedMarker && imageURL && (
                    <InfoWindow
                        position={selectedMarker.position}
                        onCloseClick={handleInfoClose}
                       
                    >
                        <div style={{ width: '300px', display: 'flex', flexDirection: 'row' }}>
                            <img
                                src={imageURL}
                                alt="Report Image"
                                style={{ backgroundColor: '#E5F7E7', padding: 10,borderRadius:10, width: '230px', height: '100px', marginRight: '10px' }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <div style={{color:'green', fontSize: 20, fontWeight:'bold', marginTop: 0}}>name</div>
                                <div  style={{ marginBottom: 10}}>{selectedMarker.dateTime}</div>
                                <div>
                                <BsGeoAlt style={{ color: 'red', marginRight: '5px' }} />
                                    {selectedMarker.location}
                                </div>
                                <button style={{ marginTop: 13, borderRadius: 10, backgroundColor: 'green',borderColor:'white', color: 'white', fontWeight: 'bold'}}>Collect</button>
                            </div>
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