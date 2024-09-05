import {Marker} from "react-leaflet";
import {useMemo, useRef, useState} from "react";

const DraggableMarker = ({markerKey, icon, point, onMarkerUpdate}) => {
    const markerRef = useRef(null)

    const [position, setPosition] = useState([point['latitude'], point['longitude']])

    const eventHandlers = useMemo(
        () => ({
            dragend() {
                const marker = markerRef.current
                if (marker != null) {
                    setPosition(marker.getLatLng())
                    onMarkerUpdate(point['id'], marker.getLatLng())
                }
            },
        }),
        [],
    )

    return (
        <Marker
            icon={icon}
            key={markerKey}
            ref={markerRef}
            eventHandlers={eventHandlers}
            draggable={true}
            position={position}
        />
    )
}

export default DraggableMarker