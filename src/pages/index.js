import {Col, Row} from "antd";
import Stats from "@/components/Stats/Stats";


export default function Start() {
    return (
        <Row style={{fontFamily: 'unset'}}>
            <Col style={{fontFamily: 'unset'}} span={12}>
                <div style={{padding: '20px'}}>
                    <h2>Üdvözöl a Fortemap Geotagger!</h2>
                    <p>Ide jön majd statisztika, miből mennyi van, de egyelőre ugorjunk oda, hogy:</p>
                    <ul>
                        <li><a href={'/fortemap/photos'}>Az összes fénykép</a></li>
                    </ul>
                    <h3>Fényképek települések szerint</h3>
                    <ul>
                        <li><a href={'/fortemap/photos?filter_place=Győr'}>Fényképek Győrből</a></li>
                        <li><a href={'/fortemap/photos?filter_place=Budapest V.'}>Fényképek Budapestről</a></li>
                    </ul>
                    <h3>A beazonosított térképpontok szerint</h3>
                    <ul>
                        <li><a href={'/fortemap/photos?filter_locations_count=0'}>Geolokáció nélküli fényképek</a></li>
                    </ul>
                    <h3>Felhasználói kézikönyv</h3>
                    <ul>
                        <li>
                            <a href={'https://docs.google.com/document/d/1UOBgILDzzj75jG8QGO3YqyflI8CZ0BJFlrCorYH8oOQ/edit?usp=sharing'}>Kézikönyv
                                megnyitása</a>
                        </li>
                    </ul>
                </div>
            </Col>
            <Col span={12}>
                <Stats />
            </Col>
        </Row>
)
}
