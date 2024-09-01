import { useRouter } from "next/router";
import {useEffect, useState} from "react";
import {Input, Select, Table, Tag} from "antd";
import {addQueryParam, removeQueryParam} from "@/utils/queryModifiers";
import qs from 'query-string';

import style from "./photos.module.scss";
import Head from "next/head";

const { Search } = Input;

const FORTEPAN_API = process.env.NEXT_PUBLIC_FORTEPAN_API;

export default function Photos() {
    const router = useRouter();
    const { query } = router;

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [pagination, setPagination] = useState({
        current: parseInt(query.page),
        pageSize: parseInt(query.limit),
        total: 0,
    });
    const [filters, setFilters] = useState({
        place: query.filter_place,
        status: query.filter_status,
        geocodes: query.filter_locations_count,
    });
    const [search, setSearch] = useState(query.search);

    useEffect(() => {
        const parsedFilters = {};
        Object.keys(query).forEach((key) => {
            if (key.startsWith('filter_')) {
                parsedFilters[key.replace('filter_', '')] = query[key];
            }
        });
        setFilters(parsedFilters);

        fetchData({
            search: query.search,
            pagination: {
                current: parseInt(query.page || 1),
                pageSize: parseInt(query.limit || 50),
            },
            filters: parsedFilters,
        });
    }, [query]);

    const fetchData = async (params = {}) => {
        setLoading(true);

        try {
            const queryString = qs.stringify({
                search: search,
                offset: (params.pagination.current - 1) * params.pagination.pageSize,
                limit: params.pagination.pageSize,
                ...Object.keys(params.filters).reduce((acc, key) => {
                    acc[key] = params.filters[key];
                    return acc;
                }, {}),
            });

            const response = await fetch(`${FORTEPAN_API}/photos/?${queryString}`).then(r => r.json());

            setData(response.results);
            setPagination({
                ...params.pagination,
                total: response.count,
            });
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

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
            // sorter: true,
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

    const renderTableHeader = () => {
        return (
            <div className={style.TableHeader}>
                <div className={style.Search}>
                    <Search
                        allowClear={true}
                        placeholder="Keresés..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onSearch={handleSearch}
                    />
                </div>
                <div className={style.Filters}>
                    <Select
                        showSearch
                        allowClear
                        placeholder="- Szűrés státusz szerint -"
                        optionFilterProp="label"
                        value={filters['status']}
                        onChange={(value) => onFilterChange('status', value)}
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
                        value={filters['place']}
                        onChange={(value) => onFilterChange('place', value)}
                        style={{width: '250px'}}
                        options={[
                            { label: 'Budapest', value: 'Budapest' },
                            { label: 'Győr', value: 'Győr' },
                        ]}
                    />
                    <Search
                        allowClear={true}
                        placeholder="Geokódok száma"
                        value={filters['locations_count']}
                        // onChange={(e) => {setFilters({...filters, geocodes: e.target.value})}}
                        style={{width: '200px'}}
                        onSearch={(value) => onFilterChange('locations_count', value)}
                    />
                </div>
            </div>
        )
    }

    const onFilterChange = (filter, value) => {
        if (value) {
            setFilters({
                ...filters,
                [filter]: value,
            });
            handleTableChange(pagination, {
                ...filters,
                [filter]: value,
            });
        } else {
            setFilters({
                ...filters,
                [filter]: undefined,
            });
            handleTableChange(pagination, {
                ...filters,
                [filter]: undefined,
            });
        }
    }

    const handleSearch = (query) => {
        if (query && query !== '') {
            const newPagination = {
                current: 1,
                pageSize: pagination.pageSize,
            }
            handleTableChange(newPagination, filters)
        } else {
            handleTableChange(pagination, filters)
        }
    }

    const handleTableChange = (pagination, filters, sorter) => {
        const filterParams = {};
        Object.keys(filters).forEach((key) => {
            if (filters[key]) {
                filterParams[`filter_${key}`] = filters[key];
            }
        });

        const params = {
            page: pagination.current,
            limit: pagination.pageSize,
            ...filterParams,
        };

        /*
        if (sorter.order) {
            params['ordering'] = sorter.order === 'ascend' ? sorter.field : `-${sorter.field}`
        }
        */

        if (search) {
            params['search'] = search;
        }

        const queryString = qs.stringify(params);
        router.push(`?${queryString}`, undefined, { shallow: true });

        fetchData({
            pagination,
            filters,
            search: search,
        });
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
                  loading={loading}
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
                  onChange={(pagination, filterValues, sorter) =>
                      handleTableChange(pagination, filters, sorter)}
                  size="small"
              />
          </div>
        </>
      );
}
