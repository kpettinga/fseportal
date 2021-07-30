import { uniq } from 'lodash-es'
import React, { useEffect, useState } from 'react'
import { Button, Checkbox, Divider, Grid, Header, Icon, Input, Message, Modal, Segment } from 'semantic-ui-react'
import JobsTable from './JobsTable'
import {csvToJson, get, getNauticalMiles, serializeObject} from './utilities'
import { distance as turfDistance, point as turfPoint, bearing as turfBearing } from '@turf/turf'
import { Link, useLocation, useParams } from 'react-router-dom'

const Jobs = props => {

    const { jobs, onUpdateJobs } = props
    const {icaos: paramIcaos} = useParams()
    const location = useLocation()

    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('jobsfrom')
	const [icaos, setIcaos] = useState(paramIcaos)
    const [selectedJob, setSelectedJob] = useState(null)
    const [error, setError] = useState(false)

    useEffect(() => {
        if ( paramIcaos ) {
            getAssignments(paramIcaos, search)
        }
    }, [])

    useEffect(() => {
        console.log(location.pathname);
    }, [location.pathname])

    async function getAssignments(icaos, search) {

		setLoading(true)

        const params = {
            icaos, 
            search, 
            format: 'csv',
            query: 'icao',
            userkey: window.localStorage.getItem('fseUserkey')
        }
		
		const url = `https://server.fseconomy.net/data?${serializeObject(params)}`
		
        const jobsCsv = await fetch(url)
            .then(res => res.text())
            .catch(err => setError(err))

        let jobsJson = __cleanData(csvToJson(jobsCsv)),
            fromAirportIcaos,
            toAirportIcaos,
            fromPromises = [],
            toPromises = [],
            fromAirports,
            toAirports

        // assemble list of ICAOs
        fromAirportIcaos = uniq(jobsJson.map(job => job.FromIcao))
        toAirportIcaos = uniq(jobsJson.map(job => job.ToIcao))

        // get "from" airports
        fromAirportIcaos.forEach(icao => {
            fromPromises.push( get(`http://localhost:3001/icaos/${icao}`) )
        })
        
        // get "to" airports
        toAirportIcaos.forEach(icao => {
            toPromises.push( get(`http://localhost:3001/icaos/${icao}`) )
        })

        // await arrays of airport objects
        fromAirports = await Promise.all(fromPromises)
        toAirports = await Promise.all(toPromises)

        // populate jobs with new data
        jobsJson = jobsJson.map(job => {
            // get trip distance
            const FromAirport = fromAirports.find(a => a.icao === job.FromIcao)
            const ToAirport = toAirports.find(a => a.icao === job.ToIcao)
            const fromPoint = turfPoint([FromAirport.lon, FromAirport.lat])
            const toPoint = turfPoint([ToAirport.lon, ToAirport.lat])
            const distance = turfDistance(fromPoint, toPoint)
            const bearingDegrees = parseInt(turfBearing(fromPoint, toPoint))
            const bearingCompass = bearingDegrees < 0 ? bearingDegrees + 360 : bearingDegrees
            return {
                ...job,
                distance: getNauticalMiles(distance),
                bearingDegrees,
                bearingCompass,
                FromAirport,
                ToAirport,
            }
        })

        onUpdateJobs(jobsJson)
        setLoading(false)

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

    return (
    <div className="Jobs">

        <Header size="tiny">Enter ICAO(s):</Header>
        <Input
            fluid
            type="text"
            control="input"
            value={icaos}
            placeholder={`KORD  -or-  KORD-KLGA-KJFK`}
            onChange={(ev, data) => setIcaos(data.value)}
            />
        <p className="faded mt_nudge"><small><strong>Tip:</strong> Find jobs from multiple airports by entering a series of ICAOs, separated by "-"</small></p>

        <div style={{textAlign:'center', marginTop:'2em'}}>
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

        <Button content="Search" fluid 
            loading={loading} 
            color="orange"
            icon="search"
            style={{marginTop:'2em'}}
            onClick={ () => getAssignments(icaos, search) }
            />

        { jobs && <>
            <Segment basic vertical className="my2">
                <Grid columns={2} verticalAlign="middle">
                    <Grid.Column><Header>Found <u>{jobs.length}</u> jobs</Header></Grid.Column>
                    <Grid.Column textAlign="right"><Button basic content="Filter" icon="filter" color="orange" style={{marginLeft:'auto'}}/></Grid.Column>
                </Grid>
                <Divider />
            </Segment>
        </>}
        
        { error && 
            <Message negative>{error}</Message>
        }

        { jobs && ! error &&
            <JobsTable 
                jobs={jobs} 
                onSelect={ job => setSelectedJob(job) }
                />
        }

        { selectedJob instanceof Object &&
            <Modal open={true} onClose={() => setSelectedJob(null)} closeIcon>
                <Modal.Header>
                    <Button circular as={Link} to={`/airports/${selectedJob.FromIcao}`} color="orange" icon="plane" content={selectedJob.FromIcao} />
                    <small className="faded"> - - - - <Icon name="plane" /> - - - - </small>
                    <Button circular as={Link} to={`/airports/${selectedJob.ToIcao}`} color="blue" icon="map marker alternate" content={selectedJob.ToIcao} />
                </Modal.Header>
                <Modal.Content>
                    <pre>{JSON.stringify(selectedJob, null, '\t')}</pre>
                </Modal.Content>
                <Modal.Actions>
                    <Button as="a"
                        href={`https://skyvector.com/?chart=301&fpl=%20${selectedJob.FromIcao}%20undefined%20${selectedJob.ToIcao}`} 
                        target="_blank"
                        color="orange" basic
                        content="SkyVector" 
                        />
                    <Button as="a" 
                        href={`https://server.fseconomy.net/airport.jsp?icao=${selectedJob.FromIcao}`} 
                        target="_blank"
                        color="orange" 
                        content="Select Job" 
                        />
                </Modal.Actions>
            </Modal>
        }

    </div>
    )
}

export default Jobs