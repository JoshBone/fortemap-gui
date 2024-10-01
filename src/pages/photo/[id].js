import {Col, Row} from "antd";
import dynamic from "next/dynamic";
import InfoPanel from "@/components/InfoPanel/InfoPanel";
import React, {useState} from "react";
import Head from "next/head";

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

const MapComponent = dynamic(
    () => import('../../components/MapComponent/MapComponent'),
    {ssr: false}
);

export async function getServerSideProps(context) {
    const { id } = context.params;
    const url_params = new URLSearchParams(context.query)
    const src_url_params = url_params.has('src_url_params') ?  url_params.get('src_url_params') : ''
    let fetchURL = `${FORTEPAN_API}/photos/${id}/`

    const photo_table_filter = src_url_params
    
    if ( photo_table_filter.length > 0 ) { //} && photo_table_filter.length > 0) {
         fetchURL += `photo_table_filter=${encodeURIComponent(photo_table_filter)}`
     }
    const res = await fetch(fetchURL)
    if (!res.ok) {
        return {
            notFound: true
        }
    }

    const data = await res.json()

    return { props: {
        data
    }}
}

export default function PhotoPage({data}) {
    const [selectedLocation, setSelectedLocation] = useState({latitude: null, longitude: null})
    const [editing, setEditing] = useState(false)

    const [photoData, setPhotoData] = useState(data)

    const handleLocationSelect = (location) => {
        setSelectedLocation(location)
    }

    const handleLocationEdit = (location) => {
        setSelectedLocation(location)
        setEditing(true)
    }

    const handleLocationEditClose = () => {
        setEditing(false)
    }

    const onMarkerUpdate = (points, id, newAddress) => {
        const {locations, ...pData} = photoData
        const newLocations = locations.map(l => {
            if (l['id'] === id) {
                l['geocoded_address'] = newAddress
            }
        })

        setSelectedLocation({
            ...selectedLocation,
            latitude: points.lat,
            longitude: points.lng
        })

        setPhotoData({
            ...pData,
            locations: newLocations
        })
    }

    return (
        <React.Fragment>
            <Head>
                <title>Fortemap Geotagger - Photo ID: {photoData['fortepan_id']}</title>
            </Head>
            <Row>
                <Col span={14}>
                    <InfoPanel
                        photoData={photoData}
                        onLocationSelect={handleLocationSelect}
                        onLocationEdit={handleLocationEdit}
                        onLocationEditClose={handleLocationEditClose}
                    />
                </Col>
                <Col span={10}>
                    <MapComponent
                        onPointsUpdate={onMarkerUpdate}
                        photoData={photoData}
                        selectedLocation={selectedLocation}
                        editing={editing}
                    />
                </Col>
            </Row>
        </React.Fragment>
    )
}