import React from 'react'
import { Link } from 'react-router-dom'
import { Button, Grid, Header, Icon, Image, Segment } from 'semantic-ui-react'

const Airport = props => {

    const {
        icao,
        name,
        city, 
        state,
        country,
        lon,
        lat,
        type,
        aircraft,
        fbos
    } = props

    function getImageCode(icao) {
        if (icao.length === 4 && icao[0] === "K") {
            icao = icao.substring(1)
        }
        return icao
    }

    return (
    <div className="Airport mt2">
        <Segment>
            <Header dividing size="huge">{icao} | <small>{name}</small></Header>
            <Grid divided columns={2}>
                <Grid.Column>
                    <p>
                        <Icon name="map marker alternate" />
                        { city }{ state && `, ${state}` }{`, ${country}`}
                        <br/><Icon name="map outline" />
                        { lon }{ lon < 0 ? 'W' : 'E' }, { lat }{ lat < 0 ? 'S' : 'N' }
                        <br/>Type: {type}
                    </p>
                </Grid.Column>
                <Grid.Column>
                    <Button content="Find Jobs" icon="search" as={Link} to={`/jobs/${icao}`} basic fluid color="orange" />
                    <Button content="FSEconomy" 
                        icon="external" 
                        as="a" 
                        href={`https://server.fseconomy.net/airport.jsp?icao=${icao}`}
                        target="_blank" 
                        className="mt-nudge"
                        basic fluid
                        />
                    <Button content="SkyVector" 
                        icon="external" 
                        as="a" 
                        href={`https://skyvector.com/?ll=${lat},${lon}&chart=301&zoom=2`}
                        target="_blank" 
                        className="mt-nudge"
                        basic fluid
                        />
                </Grid.Column>
            </Grid>
            <Header>Aircraft</Header>
            { aircraft && aircraft.length ? 
                aircraft.map( (aircraft,a) => (
                    <Segment key={a} size="mini" basic vertical color="black">
                        <strong>{aircraft.MakeModel}</strong> ({aircraft.Registration})
                    </Segment>
                ) ) 
                :
                <Segment size="mini" basic vertical color="black">
                    <strong>No aircraft</strong>
                </Segment>
            }
            <Header>FBOs</Header>
            { fbos && fbos.length ? 
                fbos.map( (fbo,f) => (
                    <Segment key={f} size="mini" basic vertical color="black">
                        <strong>{fbo.Name}</strong> ({fbo.Owner})
                    </Segment>
                ) ) 
                :
                <Segment size="mini" basic vertical color="black">
                    <strong>No FBOs</strong>
                </Segment>
            }
            <Header>Information</Header>
            <p><strong>Source:</strong> <a href="https://www.skyvector.com">SkyVector.com</a></p>
            <Image fluid className="mt2" src={`https://skyvector.com/files/tpp/2106/afd/${getImageCode(icao)}.gif`} />
        </Segment>
        <Segment>
            <pre style={{overflow:'auto'}}>{JSON.stringify(props, null, '\t')}</pre>
        </Segment>
    </div>)
}

export default Airport