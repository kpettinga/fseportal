import React from 'react'
import { Card, Grid, Icon, Segment } from 'semantic-ui-react'
import { formatCurrency } from './utilities'

const JobsTable = props => {

    const { jobs, onSelect } = props

    return (
        <div className="JobsTable">
            <Segment size="mini" color="blue">
                <Grid>
                    <Grid.Column width={2}><a href="#"><strong>From</strong></a></Grid.Column>
                    <Grid.Column width={2}><a href="#"><strong>To</strong></a></Grid.Column>
                    <Grid.Column width={1}><a href="#"><strong>NM</strong></a></Grid.Column>
                    <Grid.Column width={2}><a href="#"><strong>BRG</strong></a></Grid.Column>
                    <Grid.Column width={5}><a href="#"><strong>Cargo</strong></a></Grid.Column>
                    <Grid.Column width={2}><a href="#"><strong>Pay</strong></a></Grid.Column>
                    <Grid.Column width={2}><a href="#"><strong>Expires</strong></a></Grid.Column>
                </Grid>
            </Segment>
            { jobs && jobs.map( (job, a) => (
                <Card as="div" key={a} link fluid onClick={() => onSelect(job)}>
                    <Card.Content>
                        <Grid>
                            <Grid.Column width={2}><small><strong>{job.FromIcao}</strong></small></Grid.Column>
                            <Grid.Column width={2}><small><strong>{job.ToIcao}</strong></small></Grid.Column>
                            <Grid.Column width={1}><small>{job.distance}</small></Grid.Column>
                            <Grid.Column width={2} style={{whiteSpace:'nowrap'}}><small><Icon name="location arrow" size="small" style={{transform:`rotate(${job.bearingDegrees}deg)`}}/>{job.bearingCompass}</small></Grid.Column>
                            <Grid.Column width={5}><small>{job.Amount + ' ' + job.Commodity}</small></Grid.Column>
                            <Grid.Column width={2}><small><strong>{formatCurrency(job.Pay)}</strong></small></Grid.Column>
                            <Grid.Column width={2} style={{whiteSpace:'nowrap'}}><small>{job.Expires}</small></Grid.Column>
                        </Grid>
                    </Card.Content>
                </Card>
            ) ) }
        </div>
    )
}

export default JobsTable