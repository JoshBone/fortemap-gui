

export default function Start() {

    return (
        <>
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
            </div>
        </>
    );
}
