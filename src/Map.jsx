import React, { useEffect, useState } from 'react'
import ReactMapGl, {Marker, Popup, WebMercatorViewport} from 'react-map-gl'
import { Header, Icon, Label } from 'semantic-ui-react'
import { point, featureCollection } from '@turf/helpers'
import bbox from '@turf/bbox'
import { uniq } from 'lodash'
import { get } from './utilities'

const mapboxApiAccessToken="pk.eyJ1Ijoia2lya3BldHRpbmdhIiwiYSI6ImFXZTFFRUUifQ.K4Ia5hM1_o8Wogg3_rYovg"
const mapStyle="mapbox://styles/kirkpettinga/ckf2ex38g065d19o17dnmsot8"

const Map = props => {

    const { jobs } = props

    const [popup, setPopup] = useState(null)
    const [markers, setMarkers] = useState([])
    const [viewport, setViewport] = useState({
        width: '100%',
        height: '100%',
        latitude: 40.78343,
        longitude: -73.96625,
        zoom: 11
    })

    const onClickMarker = marker => {
        setPopup({ ...marker })
    }

    const displayJobs = async (jobs) => {
		setMarkers([])

        if ( ! jobs ) {
            return;
        }

        let fromAirportIcaos,
            toAirportIcaos,
            fromPromises = [],
            toPromises = [],
            fromAirports,
            toAirports,
            markers

        fromAirportIcaos = jobs.map(job => job.FromIcao)
        fromAirportIcaos = uniq(fromAirportIcaos)
        
        toAirportIcaos = jobs.map(job => job.ToIcao)
        toAirportIcaos = uniq(toAirportIcaos)

        // get "from" airports
        fromAirportIcaos.forEach(icao => {
            fromPromises.push( get(`http://localhost:3001/icaos/${icao}`) )
        })
        
        // get "to" airports
        toAirportIcaos.forEach(icao => {
            toPromises.push( get(`http://localhost:3001/icaos/${icao}`) )
        })

        fromAirports = await Promise.all(fromPromises)
        toAirports = await Promise.all(toPromises)


        fromAirports = fromAirports.map(apt => {
			return {
				...apt,
				title: apt.icao,
				description: apt.name,
				label: { icon: 'plane', color: 'orange' },
			}
		})
        toAirports = toAirports.map(airport => {
            return {
                ...airport,
                title: airport.icao,
                description: airport.name,
                label: { circular: true, icon: 'map marker alternate', color: 'blue', size: 'mini' },
            }
        })

		// set markers
        markers = [...toAirports, ...fromAirports]
		setMarkers(markers)

		// fit the map to relevant data
		const collection = featureCollection(markers.map(marker => {
			return point([marker.lon, marker.lat], marker);
		}));
		const box = bbox(collection).map( b => parseFloat(b) )

		const newViewport = new WebMercatorViewport({width:900, height:692})
			.fitBounds([[box[2],box[1]], [box[0],box[3]]], {
				padding: 40
			})

		setViewport({
			...viewport,
			...newViewport,
		})
	}

    useEffect(() => {
        displayJobs(jobs)
    }, [jobs])

    return (
        <ReactMapGl
            {...viewport}
            onViewportChange={setViewport}
            mapboxApiAccessToken={mapboxApiAccessToken}
            mapStyle={mapStyle}
            >
            { markers.map( (marker, m) => (
                <Marker
                    key={m}
                    longitude={parseFloat(marker.lon)}
                    latitude={parseFloat(marker.lat)}
                    offsetLeft={-12}
                    offsetTop={-15}
                    >
                    { marker.label &&
                        <Label as="a" href="#"
                            color={marker.label.color || "orange"} 
                            icon={marker.label.icon || undefined} 
                            content={marker.title} 
                            size={marker.label.size || undefined}
                            style={marker.style || undefined}
                            circular={marker.label.circular || undefined}
                            onClick={ ev => onClickMarker(marker) }
                            />
                    }
                    { marker.icon && 
                        <Icon
                            name={marker.icon.name || "map marker alternate"} 
                            color={marker.icon.color || "orange"} 
                            size={marker.icon.size || "big"} 
                            style={marker.style || undefined}
                            />
                    }
                </Marker>
            ) ) }

            { popup &&
                <Popup 
                    longitude={parseFloat(popup.lon)}
                    latitude={parseFloat(popup.lat)}
                    offsetTop={-16}
                    closeButton={true}
                    closeOnClick={false}
                    onClose={() => setPopup(null)}
                    >
                    { popup.title &&
                        <Header size="tiny" style={{margin:"0.75em 0 0"}}>{popup.title}</Header>
                    }
                    { popup.description &&
                        <p dangerouslySetInnerHTML={{__html: popup.description}}></p>
                    }
                </Popup>
            }

        </ReactMapGl>
    )
}

export default Map