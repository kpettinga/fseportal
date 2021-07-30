import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { Button, Dropdown, Form, Grid, Header, Input } from 'semantic-ui-react'
import Airport from './Airport'
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
    const [range, setRange] = useState(null)
    const [loading, setLoading] = useState(false)
    const [selectedAirport, setSelectedAirport] = useState(null)

    useEffect(() => {
        if ( paramIcao ) {
            search(paramIcao)
        }
    }, [])

    useEffect(() => {
        console.log(location.pathname);
    }, [location.pathname])

    async function search(icao) {

        setLoading(true)

        // get airport
        let airport = await get(`http://localhost:3001/icaos/${icao}`)

        // get aircraft
        const params = {
            icao,  
            format: 'csv',
            query: 'icao',
            userkey: window.localStorage.getItem('fseUserkey')
        }
        const aircraftCsv = await fetch(`https://server.fseconomy.net/data?${serializeObject(params)}&search=aircraft`)
            .then(res => res.text())
            .catch(err => console.error(err))
        let aircraftJson = csvToJson(aircraftCsv)
        aircraftJson = aircraftJson.filter(a => a.SerialNumber && a.Registration)
        
        const fbosCsv = await fetch(`https://server.fseconomy.net/data?${serializeObject(params)}&search=fbo`)
            .then(res => res.text())
            .catch(err => console.error(err))
        let fbosJson = csvToJson(fbosCsv)
        fbosJson = fbosJson.filter(f => f.FboId && f.Location)
        
        setSelectedAirport({...airport, aircraft: aircraftJson, fbos: fbosJson})
        setLoading(false)

        // icao data
        // http://localhost:3001/icaos/CZFA

        // icao aircraft
        // https://server.fseconomy.net/data?userkey=A2333C345F640AE0&format=csv&query=icao&search=aircraft&icao=CZFA
        
        // icao FBOs
        // https://server.fseconomy.net/data?userkey=A2333C345F640AE0&format=csv&query=icao&search=fbo&icao=CZFA

    }

    return (
    <div className="Airports">

        <Form onSubmit={() => search(icao)}>

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

        { selectedAirport && 
            <Airport {...selectedAirport} />
        }

    </div>
    )
}

export default Airports