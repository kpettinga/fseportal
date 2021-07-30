import { 
    booleanPointInPolygon as turfBooleanPointInPolygon, 
    circle as turfCircle, 
    point as turfPoint 
} from '@turf/turf'
import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Button, Dropdown, Form, Grid, Header, Input, Table } from 'semantic-ui-react'
import Airport from './Airport'
import FseTable from './FseTable'
import { csvToJson, get, serializeObject } from './utilities'

const distances = [
    { ref: '10', text: '10 miles', value: 10 },
    { ref: '25', text: '25 miles', value: 25 },
    { ref: '50', text: '50 miles', value: 50 },
    { ref: '100', text: '100 miles', value: 100 },
    { ref: '250', text: '250 miles', value: 250 },
    { ref: '500', text: '500 miles', value: 500 },
]

const Airports = props => {

    const {icao: paramIcao} = useParams()
    const location = useLocation()

    const [searchBy, setSearchBy] = useState('icao')
    const [icao, setIcao] = useState(paramIcao || '')
    const [range, setRange] = useState(50)
    const [loading, setLoading] = useState(false)
    const [airports, setAirports] = useState(null)
    const [selectedAirport, setSelectedAirport] = useState(null)

    useEffect(() => {
        if ( paramIcao ) {
            getAirport(paramIcao).then( airport => setSelectedAirport(airport) )
        }
    }, [])

    useEffect(() => {
        console.log(location.pathname);
    }, [location.pathname])

    async function getAirport(icao) {
        let airport

        if ( typeof icao === 'string' ) {
            // get airport
            airport = await get(`http://localhost:3001/icaos/${icao}`)
        } else {
            airport = icao
        }

        // get aircraft
        const params = {
            icao: airport.icao,  
            format: 'csv',
            query: 'icao',
            userkey: window.localStorage.getItem('fseUserkey')
        }
        const aircraftCsv = await fetch(`https://server.fseconomy.net/data?${serializeObject(params)}&search=aircraft`)
            .then(res => res.text())
            .catch(err => console.error(err))
        let aircraftJson = csvToJson(aircraftCsv)
        aircraftJson = aircraftJson.filter(a => a.SerialNumber && a.Registration) // validation
        
        const fbosCsv = await fetch(`https://server.fseconomy.net/data?${serializeObject(params)}&search=fbo`)
            .then(res => res.text())
            .catch(err => console.error(err))
        let fbosJson = csvToJson(fbosCsv)
        fbosJson = fbosJson.filter(f => f.FboId && f.Location) // validation
        
        return {
            ...airport, 
            aircraft: aircraftJson, 
            fbos: fbosJson
        }

    }

    async function getAirportsInRange(icao, range) {
        let promises = []

        const allAirports = await get(`//localhost:3001/icaos`)
        const {lon,lat} = allAirports.find(a => a.icao === icao)
        const center = [parseFloat(lon), parseFloat(lat)]
        const area = turfCircle(center, parseInt(range), {steps: 64, units: 'miles'})
    
        allAirports
            .filter(airport => {
                const p = turfPoint([parseFloat(airport.lon), parseFloat(airport.lat)])
                return turfBooleanPointInPolygon(p, area)
            })
            .forEach( airport => {
                airport = {
                    ...airport,
                    ...getDirections([lon,lat], [airport.lon, airport.lat])
                }
                promises.push( getAirport(airport) )
            })

        return Promise.all(promises)
    }

    function getDirections(point1, point2) {
        
        return { bearing, distance }
    }

    async function handleSubmit(event, data) {
        
        setLoading(true)

        if ( searchBy === 'range' ) {
            setAirports( await getAirportsInRange(icao, range) )
        }
        else {
            setSelectedAirport( await getAirport(icao) )
        }

        setLoading(false)
    }

    return (
    <div className="Airports">

        <Form onSubmit={handleSubmit}>

            <Grid columns="equal" >
                <Grid.Column>
                    <Header size="tiny">Search by:</Header>
                    <Dropdown
                        selection fluid
                        value={searchBy}
                        placeholder="Search by ..."
                        onChange={(e,d) => setSearchBy(d.value)}
                        options={[
                            {
                                key: 'icao',
                                text: 'ICAO',
                                value: 'icao'
                            },
                            {
                                key: 'range',
                                text: 'Within range of ICAO',
                                value: 'range'
                            }
                        ]}
                        />
                </Grid.Column>
                { searchBy === 'range' &&
                    <Grid.Column>
                        <Header size="tiny">Range (miles):</Header>
                        <Dropdown 
                            fluid
                            selection
                            options={distances}
                            value={range}
                            onChange={(ev, data) => setRange(data.value)}
                            />
                    </Grid.Column>
                }
                <Grid.Column>
                    <Header size="tiny">Enter ICAO:</Header>
                    <Input
                        fluid
                        type="text"
                        control="input"
                        placeholder={`e.g. KORD`}
                        value={icao}
                        onChange={(e,d) => setIcao(d.value)}
                        />
                </Grid.Column>
            </Grid>
            
            <Button content="Search" 
                fluid 
                icon="search" 
                type="submit" 
                color="orange" 
                className="mt2"
                loading={loading}
                />

        </Form>

        { airports &&
            <FseTable 
                columns={[
                    { text: 'ICAO', value: 'icao' },
                    { text: 'Name', value: 'name' },
                    { text: 'Dist', value: 'distance', render(d) { return `${d}nm` } },
                    { text: 'Brg', value: 'bearing', render(b) { return `${b}°` } },
                ]}
                data={airports}
                onItemClick={ item => setSelectedAirport(item)}
                />
        }

        { selectedAirport && 
            <Airport {...selectedAirport} />
        }

    </div>
    )
}

export default Airports