import style from "./Stats.module.scss"
import {useEffect, useState} from "react";
import {Table, Tag} from "antd";

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

const Stats = () => {
    const [data, setData] = useState([])

    const columns = [
        {
            title: 'Szerkesztő',
            dataIndex: 'editor',
            width: 400,
        },
        {
            title: () => <Tag color={'#333'}>Összes</Tag>,
            dataIndex: 'total',
            render: (value) => (<div style={{textAlign: 'center'}}>{value}</div>)
        },
        {
            title: () => <Tag color={'#1ABC9C'}>Elhelyezve</Tag>,
            dataIndex: 'OK',
            render: (value) => (<div style={{textAlign: 'center'}}>{value}</div>)
        },
        {
            title: () => <Tag color={'#F4D03F'}>Elhelyezésre vár</Tag>,
            dataIndex: 'ELH_VAR',
            render: (value) => (<div style={{textAlign: 'center'}}>{value}</div>)
        },
        {
            title:  () => <Tag color={'#F73E12'}>Nincs koordináta</Tag>,
            dataIndex: 'NK',
            render: (value) => (<div style={{textAlign: 'center'}}>{value}</div>)
        }
    ]

    useEffect(() => {
        fetch(`${FORTEPAN_API}/photos/stats/`)
            .then(r => r.json())
            .then(d => {
                setData(d)
            });
    }, [])

    return (
        <div style={{padding: '20px 20px 20px 0px' }}>
            <h2>Így állunk</h2>
            <Table
                rowKey={'editor'}
                columns={columns}
                dataSource={data}
                pagination={false}
                size={'small'}
                loading={data.length === 0}
            />
        </div>
    )
}

export default Stats;