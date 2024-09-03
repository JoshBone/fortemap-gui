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
    const res = await fetch(`${FORTEPAN_API}/photos/${id}/`)

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
    
    return (
        <React.Fragment>
            <Head>
                <title>Fortemap Geotagger - Photo ID: {data['fortepan_id']}</title>
            </Head>
            <Row>
                <Col span={14}>
                    <InfoPanel
                        photoData={data}
                        onLocationSelect={handleLocationSelect}
                        onLocationEdit={handleLocationEdit}
                        onLocationEditClose={handleLocationEditClose}
                    />
                </Col>
                <Col span={10}>
                    <MapComponent
                        photoData={data}
                        selectedLocation={selectedLocation}
                        editing={editing}
                    /></Col>
            </Row>
        </React.Fragment>
    )
}