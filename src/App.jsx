import React, { useState, useEffect } from 'react'
import Masthead from './Masthead'
import { Grid, Menu, Segment } from 'semantic-ui-react'
import './css/semantic.flat.min.css'
import './css/main.css'
import 'mapbox-gl/dist/mapbox-gl.css';
import UserKeyForm from './UserKeyForm'
import Map from './Map'
import Jobs from './Jobs'
import {
	Switch,
	Route,
	Link,
	Redirect,
	useLocation
  } from "react-router-dom";
import Airports from './Airports';

const appStyle = {
	display: "flex",
    flexDirection: "column",
    height: "100vh",
	overflow: 'hidden'
}

function App() {
	const [jobs, setJobs] = useState(null)
	const [userkey, setUserkey] = useState('')
	const location = useLocation()

	useEffect(() => {
		const existingKey = window.localStorage.getItem('fseUserkey')
		if ( ! userkey && existingKey ) {
			setUserkey(existingKey)
		}
	}, [])

	useEffect(() => {
		window.localStorage.setItem('fseUserkey', userkey)
	}, [userkey])

	

	return (
		<div className="App" style={appStyle}>
			<Masthead 
				userkey={userkey}
				onChangeUserkey={ key => setUserkey(key) }
				/>

			<Segment basic vertical 
				style={{margin:0, padding:0, height:'calc(100% - 72px)'}}
				>

				<Grid padded style={{height:'100%'}}>
					<Grid.Column mobile={16} computer={6} style={{overflow:'auto', height:'100%', paddingBottom:100}}>
						
						<Menu secondary pointing widths={4} style={{margin:'0.5em 0 2em'}}>
							<Menu.Item as={Link} to="/jobs" active={location.pathname === '/jobs'} icon="search" content="Jobs" />
							{/* <Menu.Item disabled icon="clipboard" content="Flight Planner" /> */}
							<Menu.Item as={Link} to="/airports" active={location.pathname === '/airports'} icon="plane" content="Airports" />
							<Menu.Item as={Link} to="/myfse" active={location.pathname === '/myfse'} icon="user" content="My FSE" />
						</Menu>

						<Switch>
							<Route path="/jobs">
								<Jobs
									userkey={userkey} 
									jobs={jobs}
									onUpdateJobs={setJobs}
									/>
							</Route>
							<Route path="/airports">
								<Airports />
							</Route>
							<Route path="/myfse">
								{`Coming soon...`}
							</Route>
							<Route>
								<Redirect to="/jobs" />
							</Route>
						</Switch>

					</Grid.Column>
					<Grid.Column mobile={16} computer={10} style={{padding:0}}>
						<Map
							jobs={jobs}
							/>
					</Grid.Column>
				</Grid>
				
			</Segment>

			<UserKeyForm open={!userkey} onSubmit={key => setUserkey(key)} />

		</div>
	)
}

export default App
