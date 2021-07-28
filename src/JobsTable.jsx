import React from 'react'
import { Card, Grid, Segment } from 'semantic-ui-react'
import { formatCurrency } from './utilities'

const JobsTable = props => {

    const { jobs, onSelect } = props

    return (
        <div className="JobsTable">
            <Segment size="mini" inverted>
                <Grid>
                    <Grid.Column width={2}><strong>From</strong></Grid.Column>
                    <Grid.Column width={2}><strong>To</strong></Grid.Column>
                    <Grid.Column width={6}><strong>Cargo</strong></Grid.Column>
                    <Grid.Column width={3}><strong>Pay</strong></Grid.Column>
                    <Grid.Column width={3}><strong>Expires</strong></Grid.Column>
                </Grid>
            </Segment>
            { jobs && jobs.map( (job, a) => (
                <Card as="div" key={a} link fluid onClick={() => onSelect(job)}>
                    <Card.Content>
                        <Grid>
                            <Grid.Column width={2}>{job.FromIcao}</Grid.Column>
                            <Grid.Column width={2}>{job.ToIcao}</Grid.Column>
                            <Grid.Column width={6}>{job.Amount + ' ' + job.Commodity}</Grid.Column>
                            <Grid.Column width={3}>{formatCurrency(job.Pay)}</Grid.Column>
                            <Grid.Column width={3}>{job.Expires}</Grid.Column>
                        </Grid>
                    </Card.Content>
                </Card>
            ) ) }
        </div>
    )
}

export default JobsTable