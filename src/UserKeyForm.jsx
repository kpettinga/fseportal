import React, { useState } from 'react'
import { Button, Header, Input, Modal, Icon } from 'semantic-ui-react'
import Logo from './Logo'

const UserKeyForm = props => {

    const {open, onSubmit} = props
    const [key, setKey] = useState('')

    return (
        <Modal size="tiny" open={open}>
            <Modal.Content>
                <Logo color="orange" />
                <Header size="tiny">Please enter your FSEconomy User Key:</Header>
                <Input value={key} fluid placeholder="Enter user key here..." onChange={(ev, data) => setKey(data.value)}/>
            </Modal.Content>
            <Modal.Actions>
                <a href="https://server.fseconomy.net/datafeeds.jsp" target="_blank"><Icon name="search" /> Find my user key</a>
                <Button color="orange" onClick={() => onSubmit(key)}>Submit</Button>
            </Modal.Actions>
        </Modal>
    )
}

export default UserKeyForm