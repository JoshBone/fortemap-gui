import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import style from "./LocationsMapComponent.module.scss";
import {useEffect, useState} from "react";
import {message} from "antd";

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const LocationsMapComponent = ({locationsData, selectedLocation, height}) => {
    const [position, setPosition] = useState([47.4983, 19.0408])
    const [messageApi, contextHolder] = message.useMessage();

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
        if (locationsData) {
            setPosition([47.4983, 19.0408])
        }
    }, [locationsData])

    useEffect(() => {
        if (Object.keys(selectedLocation).length > 0 && selectedLocation['lat'] !== null) {
            setPosition([selectedLocation['lat'], selectedLocation['lon']])
        } else {
            setPosition([47.4983, 19.0408])
        }
        // markerRef.current.openPopup()
    }, [selectedLocation])

    const getIcon = (p) => {
        return detectEqual(p) ? redIcon : greyIcon
    }

    const detectEqual = (p) => {
        return (p['place_id'] === selectedLocation['place_id'])
    }

    const renderMarkers = () => {
        if (locationsData) {
            return locationsData.map((p, idx) => {
                if (p['lat'] && p['lon']) {
                    return (
                        <Marker
                            icon={getIcon(p)}
                            key={idx}
                            opacity={detectEqual(p) ? 1 : 0.7}
                            position={[p['lat'], p['lon']]}
                        />
                    )
                }
            })
        }
    }

    return (
        <div className={style.MapWrapper}>
            {contextHolder}
            <MapContainer
                className={style.MapContainer}
                center={position}
                zoom={14}
                style={{height: height ? height : undefined}}
                scrollWheelZoom={true}
            >
                <ChangeView center={position} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {locationsData && renderMarkers()}
            </MapContainer>
        </div>
    )
}

export default LocationsMapComponent;