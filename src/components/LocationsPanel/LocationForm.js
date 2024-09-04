import {Button, Col, Input, Row, Space} from "antd";
import { HiOutlineLocationMarker } from "react-icons/hi";

const LocationForm = ({action, record}) => {
    return (
        <Row>
           <Col xs={24}>
               <Space.Compact style={{ width: '100%' }}>
                   <Input
                      style={{width: '100%'}}
                      value={action === 'edit' ? record['original_address'] : ''} />
                   <Button icon={<HiOutlineLocationMarker />} type="default" />
               </Space.Compact>
           </Col>
        </Row>
    )
}

export default LocationForm;