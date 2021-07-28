import React, { useState } from 'react'
import { Button, Checkbox, Dropdown, Grid, Input, Modal, Segment } from 'semantic-ui-react'
import JobsTable from './JobsTable'
import {csvToJson, serializeObject} from './utilities'

const Jobs = props => {

    const { jobs, onUpdateJobs, userkey } = props

    const [loading, setLoading] = useState(false)
    const [format, setFormat] = useState('csv')
	const [query, setQuery] = useState('icao')
	const [search, setSearch] = useState('jobsfrom')
	const [icaos, setIcaos] = useState('')
	const [searchBy, setSearchBy] = useState('icao')
	const [region, setRegion] = useState()
    const [selectedJob, setSelectedJob] = useState(null)

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
				let jobsJson = csvToJson(csv) // convert to a JS array
				jobsJson = __cleanData(jobsJson) // data processing
				onUpdateJobs(jobsJson)
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

    return (
    <div className="Jobs">

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

        <Button content="Search" fluid 
            loading={loading} 
            color="orange"
            icon="search"
            style={{marginTop:'2em'}}
            onClick={ () => getAssignments() }
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