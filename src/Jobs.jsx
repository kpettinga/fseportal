import { uniq } from 'lodash-es'
import React, { useState } from 'react'
import { Button, Checkbox, Dropdown, Grid, GridColumn, Header, Input, Modal, Segment } from 'semantic-ui-react'
import JobsTable from './JobsTable'
import {csvToJson, get, getNauticalMiles, serializeObject} from './utilities'
import { distance as turfDistance, point as turfPoint, bearing as turfBearing } from '@turf/turf'

const Jobs = props => {

    const { jobs, onUpdateJobs, userkey } = props

    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('jobsfrom')
	const [icaos, setIcaos] = useState('')
    const [selectedJob, setSelectedJob] = useState(null)

    const getAssignments = async (params) => {

		setLoading(true)

        const format = 'csv'
	    const query = 'icao'
        params = {...params, format, query}
		
		const url = `https://server.fseconomy.net/data?${serializeObject(params)}`
		
        const jobsCsv = await fetch(url).then(res => res.text())

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

    const onSearch = async () => {
        getAssignments({
            userkey,
            search,
            icaos,
        })
    }

    return (
    <div className="Jobs">

        <Header size="tiny">Enter ICAO(s):</Header>
        <Input
            fluid
            type="text"
            control="input"
            placeholder={`KORD  -or-  KORD-KLGA-KJFK`}
            onChange={(ev, data) => setIcaos(data.value)}
            />
        <p className="faded mt_nudge"><small>Find jobs from multiple airports by entering a series of ICAOs, separated by "-"</small></p>

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
            onClick={ () => onSearch() }
            />

        { jobs && <>
            <Segment basic color="black" size="mini" style={{display:'flex', alignItems:'center'}}>
                <strong>Found <u>{jobs.length}</u> jobs</strong>
                <Button size="tiny" content="Filter" icon="filter" color="orange" style={{marginLeft:'auto'}}/>
            </Segment>
        </>}
        
        { jobs && 
            <JobsTable 
                jobs={jobs} 
                onSelect={ job => setSelectedJob(job) }
                />
        }

        { selectedJob instanceof Object &&
            <Modal open={true} onClose={() => setSelectedJob(null)} closeIcon>
                <Modal.Header>{`${selectedJob.FromIcao} to ${selectedJob.ToIcao}`}</Modal.Header>
                <Modal.Content>
                    <pre>{JSON.stringify(selectedJob)}</pre>
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