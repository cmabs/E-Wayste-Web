import { useJsApiLoader } from '@react-google-maps/api';

export const libraries = ["places"];

export const useGoogleMapsLoader = () => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyCCKJQavilVTZguPP8Bxy0GCPVasd3Ravg",
        libraries: libraries,
        language: 'en'
    });

    return { isLoaded };
};  