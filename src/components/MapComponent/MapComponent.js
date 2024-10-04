import {MapContainer, Marker, Popup, TileLayer, useMap} from "react-leaflet";
import style from "./MapComponent.module.scss";
import {useEffect, useMemo, useRef, useState} from "react";
import DraggableMarker from "@/components/MapComponent/DraggableMarker";
import {message} from "antd";
import axios from "axios";

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

const ChangeView = ({ center, zoom }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
}

const MapComponent = ({photoData, onPointsUpdate, selectedLocation, editing, height, type = 'page'}) => {
    const [position, setPosition] = useState([47.4983, 19.0408])
    const [messageApi, contextHolder] = message.useMessage();
    const [locations, setLocations] = useState(type === 'page' ? photoData['locations'] : photoData)

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
        if (selectedLocation['latitude'] !== null) {
            setPosition([selectedLocation['latitude'], selectedLocation['longitude']])
        } else {
            setPosition([47.4983, 19.0408])
        }
        // markerRef.current.openPopup()
    }, [selectedLocation])

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

    const getIcon = (p) => {
        return detectEqual(p) ? redIcon : greyIcon
    }

    const detectEqual = (p) => {
        return (p['id'] === selectedLocation['id'])
    }

    const onMarkerUpdate = (id, points, oldLocationData) => {
        const getNewAddress = () =>  {
            if (oldLocationData['geocoded_address'].indexOf('[Módosítva]') >= 0) {
                return oldLocationData['geocoded_address']
            } else {
                return `[Módosítva] ${oldLocationData['geocoded_address']}`
            }
        }

        const data = {
            latitude: points.lat,
            longitude: points.lng,
            geocoded_address: getNewAddress(),
            geotag_provider: 'GUI'
        }

        axios.patch(`${FORTEPAN_API}/photos/locations/${id}/`, data).then(response => {
            setLocations(locations.map(loc => {
                if (loc['id'] === id) {
                    return {
                        ... loc,
                        latitude: points.lat,
                        longitude: points.lng,
                    }
                } else {
                    return loc
                }
            }))

            onPointsUpdate(points, id, getNewAddress())

            messageApi.open({
                type: 'success',
                content: 'Az új lokáció sikeresen elmentve!',
            });
        }).catch(error => console.error(error));
    }

    const renderMarkers = () => {
        if (locations) {
            return locations.map((p, idx) => {
                if (p['latitude'] && p['longitude']) {
                    if (detectEqual(p) && editing) {
                        return (
                            <DraggableMarker
                                key={idx}
                                markerKey={idx}
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
        <div className={editing ? `${style.MapWrapper} ${style.Editing}`: style.MapWrapper}>
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
                {photoData && renderMarkers()}
            </MapContainer>
        </div>
    )
}

export default MapComponent;