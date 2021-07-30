import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input, Menu, Segment } from 'semantic-ui-react'
import Clock from './Clock'
import Logo from './Logo'
import UserKeyForm from './UserKeyForm'

const Masthead = props => {

    const [userkey, setUserkey] = useState(window.localStorage.getItem('fseUserkey'))

    useEffect(() => {
        window.localStorage.setItem('fseUserkey', userkey)
    }, [userkey])

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
                        <Input inverted placeholder="User Key" onChange={(e,d) => setUserkey(d.value)} value={userkey} />
                    </Menu.Item>
                    <Menu.Item as="a" href="https://server.fseconomy.com" icon="external alternate" content="FSEconomy" />
                </Menu.Menu>
            </Menu>

            <UserKeyForm open={!userkey} onSubmit={setUserkey} />

        </Segment>
    )
}

export default Masthead