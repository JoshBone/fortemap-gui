import {Alert, Col, Row} from "antd";
import Stats from "@/components/Stats/Stats";
import MolIcon from "../../public/MOL_uj_eu_grey.svg"
import React from "react";
import Image from 'next/image';

export default function Start() {
    return (
        <Row style={{fontFamily: 'unset'}}>
            <Col style={{fontFamily: 'unset'}} span={12}>
                <div style={{padding: '20px'}}>
                    <h2>Üdvözöl a Fortemap Geotagger!</h2>
                    <Alert
                        message="Figyelem!"
                        description="Ez a már aktív közösségi Fortemap geotagger oldal demo verziója. Az adatmódosítási lehetőségeket
                        kiszedtük ebből a verzióból, de önkénteseink folyamatosan dolgoznak a képek ellenőrzésén!"
                        type="warning"
                    />
                    <p>Ide jön majd statisztika, miből mennyi van, de egyelőre ugorjunk oda, hogy:</p>
                    <ul>
                        <li><a href={`${process.env.NEXT_PUBLIC_ROUTE_PREFIX}/photos`}>Az összes fénykép</a></li>
                    </ul>
                    <h3>Fényképek települések szerint</h3>
                    <ul>
                        <li><a href={`${process.env.NEXT_PUBLIC_ROUTE_PREFIX}/photos?filter_place=Győr`}>Fényképek Győrből</a></li>
                        <li><a href={`${process.env.NEXT_PUBLIC_ROUTE_PREFIX}/photos?filter_place=Budapest V.`}>Fényképek Budapestről</a></li>
                    </ul>
                    <h3>A beazonosított térképpontok szerint</h3>
                    <ul>
                        <li><a href={`${process.env.NEXT_PUBLIC_ROUTE_PREFIX}/photos?filter_locations_count=0`}>Geolokáció nélküli fényképek</a></li>
                    </ul>
                    <h3>Felhasználói kézikönyv</h3>
                    <ul>
                        <li>
                            <a href={'https://docs.google.com/document/d/1UOBgILDzzj75jG8QGO3YqyflI8CZ0BJFlrCorYH8oOQ/edit?usp=sharing'}>Kézikönyv
                                megnyitása</a>
                        </li>
                    </ul>
                    <h3>A projekt támogatója</h3>
                    <Image
                        width={400}
                        priority
                        src={MolIcon}
                        alt="MOL"
                    />
                </div>
            </Col>
            <Col span={12}>
                <Stats />
            </Col>
        </Row>
)
}
