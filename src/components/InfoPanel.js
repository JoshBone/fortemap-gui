import {Button, Table} from "react-bootstrap";
import style from "./InfoPanel.module.scss";

const InfoPanel = ({photoData, onClose}) => {
    const renderLocations = (d) => {
        return d['locations'].map((location, idx) => {
            return (
                <tr>
                    <td style={{verticalAlign: "middle", textAlign: "center"}}>{location['original_address']}</td>
                    <td style={{verticalAlign: "middle"}}>{location['geocoded_address']}</td>
                    <td style={{verticalAlign: "middle", textAlign: "center"}}>{location['geotag_provider']}</td>
                </tr>
            )

        })
    }

    const encodeNER = (nerText) => {
        let txt = nerText;
        txt = txt.replaceAll('[LOC-B]', '<span class="LOC">')
        txt = txt.replaceAll('[LOC-E]', '</span>')
        txt = txt.replaceAll('[PER-B]', '<span class="PER">')
        txt = txt.replaceAll('[PER-E]', '</span>')
        txt = txt.replaceAll('[ORG-B]', '<span class="ORG">')
        txt = txt.replaceAll('[ORG-E]', '</span>')
        return txt
    }

    if (photoData) {
        const url = `https://fortepan.download/file/fortepan-eu/480/fortepan_${photoData['fortepan_id']}.jpg`

        return (
            <div className={style.InfoPanelWrapper}>
                <div className={style.Image}>
                    <img
                        src={url}
                        alt={`Fortepan photo no. ${photoData['fortepan_id']}`}
                    />
                </div>
                <div className={style.NER} dangerouslySetInnerHTML={{__html: encodeNER(photoData['description_geocoded'])}}></div>
                <Table striped bordered hover size="sm">
                    <thead>
                    <tr>
                        <th style={{width: '40%'}}>Eredeti cím</th>
                        <th style={{width: '40%'}}>Geokódolt cím</th>
                        <th style={{width: '10%'}}>Szolgáltató</th>
                    </tr>
                    </thead>
                    <tbody>
                        {photoData && renderLocations(photoData)}
                    </tbody>
                </Table>
                <div className={style.CloseButtonWrapper}>
                    <Button onClick={onClose}>Bezárás</Button>
                </div>
            </div>
        )
    }
}

export default InfoPanel