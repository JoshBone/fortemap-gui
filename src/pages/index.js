import useSWR from "swr";
import {useRouter} from "next/router";
import clientFetcher from "@/utils/clientFetcher";
import {useEffect, useState} from "react";
import {Input, Table} from "antd";
import {addQueryParam, removeQueryParam} from "@/utils/queryModifiers";

import style from "./index.module.scss";

const { Search } = Input;

const isProd = process.env.NODE_ENV === 'production'

export default function Start() {
    const router = useRouter()
    const {page, limit, query} = router.query

    const [dataSource, setDataSource] = useState([])

    const initialPagination = {
        current: 1,
        pageSize: 50
    }

    const [pagination, setPagination] = useState(initialPagination)
    const [search, setSearch] = useState('')
    const [searchInputValue, setSearchInputValue] = useState('')

    const { data, isLoading } = useSWR(['photos', pagination, search], ([url, pagination, search]) => clientFetcher(url, {
        offset: (pagination.current-1) * pagination.pageSize,
        limit: pagination.pageSize,
        search: search,
    }))

    useEffect(() => {
        const newPagination = {}

        if (page) {
            if (pagination.current !== page) {
                newPagination['current'] = page
            }
        }

        if (limit) {
            if (pagination.pageSize !== limit) {
                newPagination['pageSize'] = limit
            }
        }

        if (Object.keys(newPagination).length > 0) {
            setPagination({
                ...pagination,
                ...newPagination
            })
        }
    }, [page, limit])

    useEffect(() => {
        if (query) {
            if (query !== searchInputValue) {
                setSearch(query)
                setSearchInputValue(query)
            }
        }
    }, [query])

    useEffect(() => {
        if (data) {
            if (data['count'] > 0) {
                setPagination(prevState => ({
                    total: data['count'],
                    ...prevState
                }))
                setDataSource(data['results'])
            }
        }

    }, [data])

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
            title: 'Geokódok',
            dataIndex: 'locations_count',
            render: (count) => (<div style={{textAlign: 'center'}}>{count}</div>),
            width: 120,
            filters: Array.from(Array(10), (_,x) => {return {text: x, value: x}})
        },
        {
            title: 'Státusz',
            dataIndex: 'number',
            width: 150
        },
    ];

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
            </div>
        )
    }

    const handleSearch = (query) => {
        setPagination(initialPagination);
        setSearch(query)

        if (query !== '') {
            addQueryParam('query', query, router)
        } else {
            removeQueryParam('query', router)
        }
    }

    const handleTableChange = (pagination, filters, sorter) => {
        setPagination(pagination);

        addQueryParam('page', pagination.current, router)
        addQueryParam('limit', pagination.pageSize, router)
    };

    return (
        <>
          <div style={{padding: '10px'}}>
              <Table
                  rowKey={'fortepan_id'}
                  columns={columns}
                  dataSource={dataSource}
                  loading={isLoading}
                  pagination={pagination}
                  title={renderTableHeader}
                  bordered
                  onRow={(record, rowIndex) => {
                      return {
                          onClick: (event) => {
                              router.push(`${isProd ? '/fortemap/' : ''}/photo/${record['fortepan_id']}`)
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
