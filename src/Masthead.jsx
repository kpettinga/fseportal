import React from 'react'
import { Link } from 'react-router-dom'
import { Input, Menu, Segment } from 'semantic-ui-react'
import Clock from './Clock'
import Logo from './Logo'

const Masthead = props => {

    const { onChangeUserkey, userkey } = props

    const evChangeUserkey = (event, data) => {
        if ( typeof onChangeUserkey === 'function' ) {
            onChangeUserkey(data.value)
        }
    }

    return (
        <Segment basic inverted color="orange" style={{margin:0}}>
            <Menu borderless secondary inverted>
                <Menu.Item as={Link} to="/">
                    <Logo inverted/>
                </Menu.Item>
                <Menu.Menu position="right">
                    <Menu.Item><Clock /></Menu.Item>
                    <Menu.Item>
                        <strong style={{whiteSpace:'nowrap', marginRight:'1em'}}>User Key:</strong>
                        <Input inverted placeholder="User Key" onChange={ evChangeUserkey } value={userkey} />
                    </Menu.Item>
                    <Menu.Item as="a" href="https://server.fseconomy.com" icon="external alternate" content="FSEconomy" />
                </Menu.Menu>
            </Menu>
        </Segment>
    )
}

export default Masthead