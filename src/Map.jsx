import React, { useEffect, useState } from 'react'
import ReactMapGl, {Marker, Popup, WebMercatorViewport} from 'react-map-gl'
import { Header, Icon, Label } from 'semantic-ui-react'
import { point, featureCollection } from '@turf/helpers'
import bbox from '@turf/bbox'
import { uniq, uniqBy } from 'lodash'
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

        let fromMarkers = jobs.map(job => {
			return {
				...job,
				title: job.FromIcao,
				description: `${job.FromAirport.name} (${job.distance}nm)`,
                lon: job.FromAirport.lon,
                lat: job.FromAirport.lat,
				label: { icon: 'plane', color: 'orange' },
			}
		})
        fromMarkers = uniqBy(fromMarkers, 'title')

        let toMarkers = jobs.map(job => {
            return {
                ...job,
                title: job.ToIcao,
                description: `${job.ToAirport.name} (${job.distance}nm)`,
                lon: job.ToAirport.lon,
                lat: job.ToAirport.lat,
                label: { circular: true, icon: 'map marker alternate', color: 'blue', size: 'mini' },
            }
        })
        toMarkers = uniqBy(toMarkers, 'title')

		// set markers
        const markers = [...toMarkers, ...fromMarkers]
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