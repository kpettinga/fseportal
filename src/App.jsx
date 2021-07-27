import React, { useEffect, useState } from 'react'
import {Box, DataTable, Grommet} from 'grommet'
import theme from './grommettheme'
import Masthead from './Masthead'
import {csvToJson, formatCurrency} from './utilities'

function App() {
	const [assignments, setAssignments] = useState(null)
	const [sort, setSort] = useState({
		property: 'FromIcao',
		direction: 'asc'
	})
	const columns = [
		{
			property: 'FromIcao',
			header: 'From'
		},
		{
			property: 'ToIcao',
			header: 'To'
		},
		{
			property: 'Pay',
			header: 'Pay',
			render: datum => formatCurrency(datum.Pay)
		},
	]

	const getAssignments = () => {
		const url = "https://server.fseconomy.net/data?userkey=A2333C345F640AE0&format=csv&query=icao&search=jobsfrom&icaos=CZFA-CEX4-CYMA"
		fetch(url).then( res => res.text() ).then( csv => setAssignments( cleanData( csvToJson(csv) ) ) )

		function cleanData(data) {
			return data.map(d => {
				return {
					...d,
					Amount: parseFloat(d.Amount),
					Pay: parseFloat(d.Pay),
				}
			})
		}
	}

	useEffect( () => {
		getAssignments()
	}, [] )

	return (
		<Grommet theme={theme}>
			<Masthead />

			<Box align="center">
				{ assignments && <DataTable
					columns={columns}
					data={assignments}
					sort={sort}
					onSort={setSort}
					/>
				}
			</Box>

		</Grommet>
	)
}

export default App
