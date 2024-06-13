import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import style from "./MapComponent.module.scss";
import {useEffect, useState} from "react";

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const MapComponent = ({photoData}) => {
    const [position, setPosition] = useState([47.4983, 19.0408])

    useEffect(() => {
        if (photoData) {
            setPosition([photoData['mapcenter_lat'], photoData['mapcenter_long']])
        } else {
            setPosition([47.4983, 19.0408])
        }
    }, [photoData])

    const renderMarkers = () => {
        const {locations} = photoData;
        if (locations) {
            return locations.map((p, idx) => {
                if (p['latitude'] && p['longitude']) {
                    return (
                        <Marker key={idx} position={[p['latitude'], p['longitude']]}>
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
            <MapContainer className={style.MapContainer} center={position} zoom={14} scrollWheelZoom={true}>
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