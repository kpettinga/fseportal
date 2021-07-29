import React from 'react'
import { Dropdown, Grid, Header, Input } from 'semantic-ui-react'

const Airports = props => {
    return (
        <Grid columns="equal" >
            <Grid.Column>
                <Header size="tiny">Search by:</Header>
                <Dropdown
                    selection fluid
                    value={searchBy}
                    placeholder="Search by ..."
                    onChange={(event,data) => setSearchBy(data.value)}
                    options={[
                        {
                            key: 'icao',
                            text: 'ICAO(s)',
                            value: 'icao'
                        },
                        {
                            key: 'range',
                            text: 'Within range of ICAO',
                            value: 'range'
                        },
                        {
                            key: 'region',
                            text: 'Region',
                            value: 'region'
                        },
                    ]}
                    />
            </Grid.Column>
            { searchBy === 'range' &&
                <Grid.Column>
                    <Header size="tiny">Range (miles):</Header>
                    <Input
                        fluid
                        type="number"
                        min={0}
                        max={150}
                        step={1}
                        control="input"
                        placeholder={`e.g. "50"`}
                        onChange={(ev, data) => setRange(data.value)}
                        />
                </Grid.Column>
            }
            <Grid.Column>
                { (searchBy === 'icao' || searchBy === 'range') && <>
                    <Header size="tiny">Enter ICAO(s):</Header>
                    <Input
                        fluid
                        type="text"
                        control="input"
                        placeholder={`KORD  -or-  KORD-KLGA-KJFK`}
                        onChange={(ev, data) => setIcaos(data.value)}
                        />
                </>}
            </Grid.Column>
        </Grid>
    )
}

export default Airports