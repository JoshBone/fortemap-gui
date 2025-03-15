import style from "./Stats.module.scss"
import {useEffect, useState} from "react";
import {Table, Tag} from "antd";
import useTranslation from "next-translate/useTranslation";

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

const Stats = () => {
    const [data, setData] = useState([])
    const { t, lang } = useTranslation('index')

    const columns = [
        {
            title: t('stats__editor'),
            dataIndex: 'editor',
            width: 400,
        },
        {
            title: () => <Tag color={'#333'}>{t('status__all')}</Tag>,
            dataIndex: 'total',
            render: (value) => (<div style={{textAlign: 'center'}}>{value}</div>)
        },
        {
            title: () => <Tag color={'#1ABC9C'}>{t('status__placed')}</Tag>,
            dataIndex: 'OK',
            render: (value) => (<div style={{textAlign: 'center'}}>{value}</div>)
        },
        {
            title: () => <Tag color={'#F4D03F'}>{t('status__waiting_for_placement')}</Tag>,
            dataIndex: 'ELH_VAR',
            render: (value) => (<div style={{textAlign: 'center'}}>{value}</div>)
        },
        {
            title:  () => <Tag color={'#F73E12'}>{t('status__no_coordinates')}</Tag>,
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
            <h2>{t('stats__where_we_stand')}</h2>
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