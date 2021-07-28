import React, { useState } from 'react'
import ReactMapGl, {Marker, Popup, WebMercatorViewport} from 'react-map-gl'
import { Header, Icon, Label } from 'semantic-ui-react'

const mapboxApiAccessToken="pk.eyJ1Ijoia2lya3BldHRpbmdhIiwiYSI6ImFXZTFFRUUifQ.K4Ia5hM1_o8Wogg3_rYovg"
const mapStyle="mapbox://styles/kirkpettinga/ckf2ex38g065d19o17dnmsot8"

const Map = props => {

    const { viewport, markers, onViewportChange } = props
    const [popup, setPopup] = useState(null)

    const onClickMarker = marker => {
        setPopup({ ...marker })
    }

    return (
        <ReactMapGl
            {...viewport}
            onViewportChange={onViewportChange}
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
                        <Header size="tiny" style={{marginTop:"0.75em"}}>{popup.title}</Header>
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