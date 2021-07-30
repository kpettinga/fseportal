import React, { useEffect, useState } from 'react'
import { Table } from 'semantic-ui-react'

const FseTable = props => {

    const { columns, data, className, style, onItemClick } = props
    
    const [sortBy, setSortBy] = useState(null)
    const [direction, setDirection] = useState(null)

    function handleSort(by) {
        setSortBy(by)
        setDirection( direction ? ( direction === 'ascending' ? 'descending' : 'ascending' ) : 'ascending' )
    }

    useEffect(() => {

    }, [sortBy, direction])

    return (
        <Table sortable selectable={!!onItemClick} className={className} style={style}>
            { columns && <>
                <Table.Header>
                    <Table.Row>
                        { columns.map( ({text, value}, c) => (
                            <Table.HeaderCell key={c}
                                content={text}
                                sorted={ sortBy === value ? direction : null }
                                onClick={() => handleSort(value)}
                                />
                        ) ) }
                    </Table.Row>
                </Table.Header>
            </>}
            { data && 
                <Table.Body>
                    { data.map((item, i) => (
                        <Table.Row key={i} onClick={() => onItemClick(item)}>
                            { columns.map( (col, c) => {
                                function render() {
                                    return col.render ? col.render(item[col.value]) : item[col.value]
                                }
                                return (
                                    <Table.Cell key={c}>
                                        {render()}
                                    </Table.Cell>
                                )
                            } ) }
                        </Table.Row>
                    ) ) }
                </Table.Body>
            }
        </Table>
    )
}

export default FseTable