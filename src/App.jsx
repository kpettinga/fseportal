import React, { useState, useEffect } from 'react'
import Masthead from './Masthead'
import {csvToJson, formatCurrency, get, serializeObject} from './utilities'
import { Button, Card, Checkbox, Dropdown, Grid, Input, Menu, Segment } from 'semantic-ui-react'
import {WebMercatorViewport} from 'react-map-gl'
import './css/semantic.twitter.min.css'
import 'mapbox-gl/dist/mapbox-gl.css';
import { point, featureCollection } from '@turf/helpers'
import bbox from '@turf/bbox'
import { uniqBy } from 'lodash'
import UserKeyForm from './UserKeyForm'
import Map from './Map'

const appStyle = {
	display: "flex",
    flexDirection: "column",
    height: "100vh",
	overflow: 'hidden'
}

function App() {
	const [assignments, setAssignments] = useState(null)
	const [loading, setLoading] = useState(false)
	const [userkey, setUserkey] = useState('')
	const [format, setFormat] = useState('csv')
	const [query, setQuery] = useState('icao')
	const [search, setSearch] = useState('jobsfrom')
	const [icaos, setIcaos] = useState('')
	const [searchBy, setSearchBy] = useState('icao')
	const [region, setRegion] = useState()
	const [markers, setMarkers] = useState([])
	const [viewport, setViewport] = useState({
		width: '100%',
        height: '100%',
        latitude: 40.78343,
        longitude: -73.96625,
        zoom: 11
	})

	useEffect(() => {
		const existingKey = window.localStorage.getItem('fseUserkey')
		if ( ! userkey && existingKey ) {
			setUserkey(existingKey)
		}
	}, [])

	useEffect(() => {
		window.localStorage.setItem('fseUserkey', userkey)
	}, [userkey])

	const updateMapData = async (_icaos, _assignments) => {
		setMarkers([])
		let promises = [],
			markers = []
		
		if ( _assignments ) {
			// add assignment destination airports
			_assignments.forEach(assign => {
				promises.push( get(`http://localhost:3001/icaos/${assign.ToIcao}`) )
			})
			let assignmentAirports = await Promise.all(promises)
			assignmentAirports = assignmentAirports.map(assign => {
				return {
					...assign,
					title: assign.icao,
					description: assign.name,
					label: { circular: true, icon: 'map marker alternate', color: 'blue', size: 'mini' },
				}
			})
			markers = uniqBy(assignmentAirports, 'icao')
		}

		// reset promises
		promises = []
		
		// add airports
		_icaos.split('-').forEach( icao => {
			promises.push( get(`http://localhost:3001/icaos/${icao}`) )
		})
		let airports = await Promise.all(promises)
		airports = airports.map(apt => {
			return {
				...apt,
				title: apt.icao,
				description: apt.name,
				label: { icon: 'plane', color: 'orange' },
			}
		})
		markers = [...markers, ...airports]

		// set markers
		setMarkers(markers)

		// fit the map to relevant data
		const collection = featureCollection(markers.map(marker => {
			return point([marker.lon, marker.lat], marker);
		}));
		const box = bbox(collection).map( b => parseFloat(b) )

		const newViewport = new WebMercatorViewport({width:900, height:692})
			.fitBounds([[box[2],box[1]], [box[0],box[3]]], {
				padding: 40
			})
		setViewport({
			...viewport,
			...newViewport,
		})
	}

	const getAssignments = () => {
		setLoading(true)
		const params = {
			userkey,
			format,
			query,
			search,
			icaos,
		}
		const url = `https://server.fseconomy.net/data?${serializeObject(params)}`
		fetch(url)
			.then( res => res.text() )
			.then( csv => {
				let assignmentsJson = csvToJson(csv) // convert to a JS array
				assignmentsJson = __cleanData(assignmentsJson) // data processing
				setAssignments(assignmentsJson)  // update state 
				return updateMapData(icaos, assignmentsJson)
			})
			.finally(() => setLoading(false))

		function __cleanData(data) {
			return data
					.map(d => {
						return {
							...d,
							Amount: parseFloat(d.Amount),
							Pay: parseFloat(d.Pay),
						}
					})
					.filter(d => d && d.FromIcao)
		}
	}

	const onSearch = () => {
		getAssignments()
	}

	return (
		<div className="App" style={appStyle}>
			<Masthead 
				userkey={userkey}
				onChangeUserkey={ key => setUserkey(key) }
				/>

			<Segment basic vertical 
				style={{margin:0, padding:0, height:'calc(100% - 72px)'}}
				loading={loading}>

				<Grid padded style={{height:'100%'}}>
					<Grid.Column mobile={16} computer={6} style={{overflow:'auto', height:'100%', paddingBottom:100}}>
						
						<Menu secondary pointing widths={4} style={{margin:'0.5em 0 2em'}}>
							<Menu.Item active icon="search" content="Search Jobs" />
							<Menu.Item disabled icon="clipboard" content="Flight Planner" />
							<Menu.Item disabled icon="plane" content="ICAO Lookup" />
							<Menu.Item disabled icon="user" content="My FSE" />
						</Menu>

						<Grid columns={2}>
							<Grid.Column>
								<Dropdown
									selection fluid
									value={searchBy}
									placeholder="Search by ..."
									onChange={(event,data) => setSearchBy(data.value)}
									options={[
										{
											key: 'icao',
											text: 'Search by ICAO(s)',
											value: 'icao'
										},
										{
											key: 'region',
											text: 'Search by Region',
											value: 'region'
										},
									]}
									/>
							</Grid.Column>
							<Grid.Column>
								{ searchBy === 'icao' && <>
									<Input
										fluid
										type="text"
										control="input"
										placeholder={`"KORD" or "KORD-KLGA-KJFK"`}
										onChange={(ev, data) => setIcaos(data.value)}
										/>
									<div style={{opacity:0.6, marginTop:'0.25em'}}>
										<Checkbox type="radio"
											label='Jobs From'
											value='jobsfrom'
											checked={search === 'jobsfrom'}
											name="search"
											style={{marginRight:'1em'}}
											onChange={() => setSearch('jobsfrom')}
											/>
										<Checkbox type="radio"
											label='Jobs To'
											value='jobsto'
											checked={search === 'jobsto'}
											name="search"
											onChange={() => setSearch('jobsto')}
											/>
									</div>
								</>} 
								{ searchBy === 'region' &&
									<Dropdown
										selection fluid
										value={region}
										placeholder="Select Region ..."
										onChange={(event,data) => setRegion(data.value)}
										options={[
											{
												key: 'pacnw',
												text: 'Pacific Northwest',
												value: 'pacnw'
											},
											{
												key: 'centralrockies',
												text: 'Central Rockies',
												value: 'centralrockies'
											},
										]}
										/>
								} 
							</Grid.Column>
						</Grid>
						<Button fluid color="orange"
							content="Search"
							icon="search"
							style={{marginTop:'2em'}}
							onClick={ () => onSearch() }
							/>

						{ assignments && <>
							<Segment attached="top" basic color="black" size="mini" style={{display:'flex', alignItems:'center'}}>
								<span>{`Found ${assignments.length} assignments`}</span>
								<Button size="tiny" content="Filter" icon="filter" color="orange" style={{marginLeft:'auto'}}/>
							</Segment>
							<Segment attached="bottom" size="mini" inverted>
								<Grid>
									<Grid.Column width={2}><strong>From</strong></Grid.Column>
									<Grid.Column width={2}><strong>To</strong></Grid.Column>
									<Grid.Column width={6}><strong>Cargo</strong></Grid.Column>
									<Grid.Column width={3}><strong>Pay</strong></Grid.Column>
									<Grid.Column width={3}><strong>Expires</strong></Grid.Column>
								</Grid>
							</Segment>
						</>}
						{ assignments && assignments.map( (assign, a) => (
							<Card as="div" link fluid onClick={() => console.log(assign)}>
								<Card.Content>
									<Grid>
										<Grid.Column width={2}>{assign.FromIcao}</Grid.Column>
										<Grid.Column width={2}>{assign.ToIcao}</Grid.Column>
										<Grid.Column width={6}>{assign.Amount + ' ' + assign.Commodity}</Grid.Column>
										<Grid.Column width={3}>{formatCurrency(assign.Pay)}</Grid.Column>
										<Grid.Column width={3}>{assign.Expires}</Grid.Column>
									</Grid>
								</Card.Content>
							</Card>
						) ) }

					</Grid.Column>
					<Grid.Column mobile={16} computer={10} style={{padding:0}}>
						<Map
							markers={markers}
							viewport={viewport}
							onViewportChange={vprt => setViewport(vprt)}
							/>
					</Grid.Column>
				</Grid>
				
			</Segment>

			<UserKeyForm open={!userkey} onSubmit={key => setUserkey(key)} />

		</div>
	)
}

export default App
