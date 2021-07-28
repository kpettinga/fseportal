import React from 'react'
import { Header, Icon } from 'semantic-ui-react'

const Logo = props => {
    return (
        <Header {...props}>
            FSE Portal
            <span style={{marginLeft: "0.8em", opacity:0.6}}>
                <Icon name="plane" />
                - - - - - - - -
                <Icon name="map marker alternate" />
            </span>
        </Header>
    )
}

export default Logo