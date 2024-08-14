import useSWR from "swr";
import {useRouter} from "next/router";
import clientFetcher from "@/utils/clientFetcher";
import {useEffect, useState} from "react";
import {Input, Select, Table, Tag} from "antd";
import {addQueryParam, removeQueryParam} from "@/utils/queryModifiers";

import style from "./photos.module.scss";
import {useEffectOnce, usePrevious} from "react-use";
import Head from "next/head";

const { Search } = Input;

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

export default function Photos() {
    const router = useRouter()
    const {page, limit, query, geocodes, status, place} = router.query

    const getInitialPagination = () => {
        const p = {}
        p['current'] = page ? Number(page) : 1;
        p['pageSize'] = limit ? Number(limit) : 50
        return p
    }

    const [pagination, setPagination] = useState(getInitialPagination)

    const [filterStatus, setFilterStatus] = useState(status)
    const prevFilterStatus = usePrevious(filterStatus);

    const [filterPlace, setFilterPlace] = useState(place)
    const prevFilterPlace = usePrevious(filterPlace);

    const [searchGeocodesValue, setSearchGeocodesValue] = useState(geocodes)
    const [filterGeocodes, setFilterGeocodes] = useState(geocodes)
    const prevFilterGeocodes = usePrevious(filterGeocodes);

    const [searchInputValue, setSearchInputValue] = useState('')
    const [search, setSearch] = useState('')
    const prevSearch = usePrevious(search);

    const [data, setData] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    /*
    const { data, isLoading } = useSWR(['photos', pagination, filterStatus, filterPlace, filterGeocodes, search],
        ([url, pagination, filterStatus, filterPlace, filterGeocodes, search]) => {

        const params = {
            offset: (pagination.current-1) * pagination.pageSize,
            limit: pagination.pageSize,
            search: search,
            status: filterStatus ? filterStatus : '',
            place: filterPlace ? filterPlace : '',
            locations_count: filterGeocodes ? filterGeocodes : ''
        }

        return clientFetcher(url, params)
    })
    */

    useEffect(() => {
        setIsLoading(true);
        let resetPage = false;

        if (filterGeocodes !== prevFilterGeocodes) {
            resetPage = true
            addQueryParam('page', 1, router)

            if (filterGeocodes) {
                addQueryParam('geocodes', filterGeocodes, router)
            } else {
                removeQueryParam('geocodes', router)
            }
        }

        if (filterPlace !== prevFilterPlace) {
            resetPage = true
            addQueryParam('page', 1, router)

            if (filterPlace) {
                addQueryParam('place', filterPlace, router)
            } else {
                removeQueryParam('place', router)
            }
        }

        if (filterStatus !== prevFilterStatus) {
            resetPage = true
            addQueryParam('page', 1, router)

            if (filterStatus) {
                addQueryParam('status', filterStatus, router)
            } else {
                removeQueryParam('status', router)
            }
        }

        if (search !== prevSearch) {
            resetPage = true
            addQueryParam('page', 1, router)
        }

        const params = {
            offset: resetPage ? 0 : (pagination.current - 1) * pagination.pageSize,
            limit: pagination.pageSize,
            search: search,
            status: filterStatus ? filterStatus : '',
            place: filterPlace ? filterPlace : '',
            locations_count: filterGeocodes ? filterGeocodes : ''
        }
        clientFetcher('photos', params).then(
            ({results, count}) => {
                setData(results);
                setIsLoading(false);
                setPagination({
                    ...pagination,
                    current: resetPage ? 1 : pagination.current,
                    total: count
                })
            }
        )
    }, [
        pagination.current,
        pagination.pageSize,
        filterGeocodes,
        filterPlace,
        filterStatus,
        query
    ])

    const photoRender = (photo) => {
        const url = `https://fortepan.download/file/fortepan-eu/480/fortepan_${photo}.jpg`

        return (
            <div style={{textAlign: 'center'}}>
                <img src={url}
                     alt={`Fortepan photo no. ${photo}`}
                     height={150}
                />
            </div>
        )
    }

    const renderStatus = (status) => {
        const getColor = () => {
            switch (status) {
                case 'ELL_VAR':
                    return '#F73E12'
                case 'ELH_VAR':
                    return '#F4D03F'
                case 'OK':
                    return '#1ABC9C'
                case 'NK':
                    return '#F73E12'
            }
        }

        const getText = () => {
            switch (status) {
                case 'ELL_VAR':
                    return 'Ellenőrzésre vár'
                case 'ELH_VAR':
                    return 'Elhelyezésre vár'
                case 'OK':
                    return 'Elhelyezve'
                case 'NK':
                    return 'Nincs koordináta'
            }
        }

        return <Tag color={getColor()}>{getText()}</Tag>
    }

    const columns = [
        {
            title: 'Fénykép',
            dataIndex: 'fortepan_id',
            render: photoRender,
            width: 400
        },
        {
            title: 'Leírás',
            dataIndex: 'description_original',
        },
        {
            title: 'Település',
            dataIndex: 'place',
            width: 150,
        },
        {
            title: 'Geokódok',
            dataIndex: 'locations_count',
            render: (count) => (<div style={{textAlign: 'center'}}>{count}</div>),
            width: 120
        },
        {
            title: 'Státusz',
            dataIndex: 'status',
            width: 150,
            render: renderStatus
        },
    ];

    const onStatusChange = (value) => {
        setFilterStatus(value)
    }

    const onPlaceChange = (value) => {
        setFilterPlace(value)
    }

    const onGeocodeSearch = (value) => {
        setFilterGeocodes(value)
    }


    const renderTableHeader = () => {
        return (
            <div className={style.TableHeader}>
                <div className={style.Search}>
                    <Search
                        defaultValue={query}
                        allowClear={true}
                        placeholder="Keresés..."
                        value={searchInputValue}
                        onChange={(e) => setSearchInputValue(e.target.value)}
                        onSearch={handleSearch}
                    />
                </div>
                <div className={style.Filters}>
                    <Select
                        showSearch
                        allowClear
                        placeholder="- Szűrés státusz szerint -"
                        optionFilterProp="label"
                        value={filterStatus}
                        onChange={onStatusChange}
                        style={{width: '230px'}}
                        options={[
                            { label: 'Ellenőrzésre vár', value: 'ELL_VAR' },
                            { label: 'Elhelyezésre vár', value: 'ELH_VAR' },
                            { label: 'Elhelyezve', value: 'OK' },
                            { label: 'Nincs koordináta', value: 'NK' },
                        ]}
                    />
                    <Select
                        showSearch
                        allowClear
                        placeholder="- Szűrés település szerint -"
                        optionFilterProp="label"
                        value={filterPlace}
                        onChange={onPlaceChange}
                        style={{width: '250px'}}
                        options={[
                            { label: 'Budapest', value: 'Budapest' },
                            { label: 'Győr', value: 'Győr' },
                        ]}
                    />
                    <Search
                        defaultValue={filterGeocodes}
                        allowClear={true}
                        placeholder="Geokódok száma"
                        value={searchGeocodesValue}
                        onChange={(e) => {setSearchGeocodesValue(e.target.value)}}
                        style={{width: '200px'}}
                        onSearch={onGeocodeSearch}
                />
                </div>
            </div>
        )
    }

    const handleSearch = (query) => {
        setSearch(query)

        if (query !== '') {
            addQueryParam('query', query, router)
        } else {
            removeQueryParam('query', router)
        }
    }

    const handleTableChange = (pagination, filters, sorter, extra) => {
        switch (extra['action']) {
            case 'paginate':
                setPagination(pagination);
                addQueryParam('page', pagination.current, router)
                addQueryParam('limit', pagination.pageSize, router)
                break;
        }
    };

    return (
        <>
            <Head>
                <title>Fortemap Geotagger - Fényképek listája</title>
            </Head>
          <div style={{padding: '10px'}}>
              <Table
                  rowKey={'fortepan_id'}
                  columns={columns}
                  dataSource={data}
                  loading={isLoading}
                  pagination={pagination}
                  title={renderTableHeader}
                  bordered
                  onRow={(record, rowIndex) => {
                      return {
                          onClick: (event) => {
                              router.push(`/photo/${record['fortepan_id']}`)
                          } // click row
                      };
                  }}
                  scroll={{
                      y: '72vh',
                  }}
                  onChange={handleTableChange}
                  size="small"
              />
          </div>
        </>
      );
}
