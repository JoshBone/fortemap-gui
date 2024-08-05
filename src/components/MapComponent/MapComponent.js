import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import style from "./MapComponent.module.scss";
import {useEffect, useRef, useState} from "react";

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const MapComponent = ({photoData, selectedLocation}) => {
    const mapRef = useRef(null)
    const markerRef = useRef(null)

    const [position, setPosition] = useState([47.4983, 19.0408])

    const redIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const greyIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    useEffect(() => {
        if (photoData) {
            if (photoData['mapcenter_lat'] !== null) {
                setPosition([photoData['mapcenter_lat'], photoData['mapcenter_long']])
            } else {
                setPosition([47.4983, 19.0408])
            }
        } else {
            setPosition([47.4983, 19.0408])
        }
    }, [photoData])

    useEffect(() => {
        if (selectedLocation['latitude'] !== null) {
            setPosition([selectedLocation['latitude'], selectedLocation['longitude']])
        } else {
            setPosition([47.4983, 19.0408])
        }
        // markerRef.current.openPopup()
    }, [selectedLocation])

    const getIcon = (p) => {
        return detectEqual(p) ? redIcon : greyIcon
    }

    const detectEqual = (p) => {
        return (p['latitude'] === selectedLocation['latitude'] && p['longitude'] === selectedLocation['longitude'])
    }

    const renderMarkers = () => {
        const {locations} = photoData;
        if (locations) {
            return locations.map((p, idx) => {
                if (p['latitude'] && p['longitude']) {
                    return (
                        <Marker
                            ref={detectEqual(p) ? markerRef : undefined}
                            icon={getIcon(p)}
                            key={idx}
                            opacity={detectEqual(p) ? 1 : 0.7}
                            position={[p['latitude'], p['longitude']]}
                        >
                            <Popup>
                                {p['geocoded_address']}
                            </Popup>
                        </Marker>
                    )
                }
            })
        }
    }

    return (
        <div className={style.MapWrapper}>
            <MapContainer
                className={style.MapContainer}
                center={position}
                zoom={15}
                scrollWheelZoom={true}
            >
                <ChangeView center={position} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {photoData && renderMarkers()}
            </MapContainer>
        </div>
    )
}

export default MapComponent;