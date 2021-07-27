import { Box, Heading } from 'grommet'
import { Map } from 'grommet-icons'
import React from 'react'

const Masthead = props => {
    return (
        <Box
			tag='header'
            direction='row'
            align='center'
            justify='between'
            background='brand'
            pad={{ left: 'medium', right: 'small', vertical: 'medium' }}
            elevation='medium'
            style={{ zIndex: '1' }}
        >
            <Box direction="row" align="center">
                <Map style={{marginRight:'1em'}} /> 
                <Heading level="4" style={{margin:0}} >FSE Portal</Heading>
            </Box>
        </Box>
    )
}

export default Masthead