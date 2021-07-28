import { now } from 'lodash-es'
import React, { useEffect, useState } from 'react'

const getNow = () => {
    const now = new Date()

    let hours = __format(now.getUTCHours())
    let minutes = __format(now.getUTCMinutes())
    let seconds = __format(now.getUTCSeconds())

    function __format(t) {
        return t.toString().length === 1 ? `0${t}` : t
    }

    return {
        hours,
        minutes,
        seconds,
    }
}

const Clock = props => {

    const [time, setTime] = useState(getNow())

    useEffect(() => {
        setInterval(() => {
            setTime(getNow())
        }, 1000)
    }, [])

    return (
        <span className="Clock"><span style={{display:"inline-block",minWidth:60}}>{`${time.hours}:${time.minutes}:${time.seconds}`}</span> ZULU</span>
    )
}

export default Clock