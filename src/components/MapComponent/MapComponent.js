import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import style from "./MapComponent.module.scss";
import {useEffect, useMemo, useRef, useState} from "react";
import DraggableMarker from "@/components/MapComponent/DraggableMarker";

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const MapComponent = ({photoData, selectedLocation, editing}) => {
    const [position, setPosition] = useState([47.4983, 19.0408])

    const [locations, setLocations] = useState(photoData['locations'])

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

    const onMarkerUpdate = (id, points) => {

    }

    const renderMarkers = () => {
        const {locations} = photoData;
        if (locations) {
            return locations.map((p, idx) => {
                if (p['latitude'] && p['longitude']) {
                    if (detectEqual(p) && editing) {
                        return (
                            <DraggableMarker
                                key={idx}
                                icon={getIcon(p)}
                                point={p}
                                onMarkerUpdate={onMarkerUpdate}
                            />
                        )
                    } else {
                        return (
                            <Marker
                                icon={getIcon(p)}
                                key={idx}
                                opacity={detectEqual(p) ? 1 : 0.7}
                                position={[p['latitude'], p['longitude']]}
                            />
                        )
                    }
                }
            })
        }
    }

    return (
        <div className={style.MapWrapper}>
            <MapContainer
                className={style.MapContainer}
                center={position}
                zoom={14}
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