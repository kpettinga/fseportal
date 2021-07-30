/**
 * Pause code execution for a specified amount of time
 * @param {Number} ms : milliseconds to wait
 */
export const wait = (ms) => {
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
}

/**
 * Get the URL query parameters as an object
 * @returns {object}
 */
 export const getQueryObject = (search) => {
    search = search || window.location.search
	const queryParams = search.length ? search.substr(1).split('&') : []
	let o = {}
	queryParams.forEach( param => {
		const key = param.split('=')[0]
		const value = param.split('=')[1]
		o[key] = decodeURIComponent(value)
	} )
	return o
}

export const getNauticalMiles = (distance, units, decimals) => {
    units = units || 'kilometers'
    decimals = decimals || 0
    const conversions = {
        miles: 0.868976,
        kilometers: 0.5399566531479482
    }
    return parseInt((parseFloat(distance) * conversions[units]).toFixed(decimals))
}

export const get = (url, params) => {
    return fetch(url, params)
        .then( res => res.json() )
        .catch( err => console.error(err) )
}

/**
 * Serialize a plain object into a url-encoded string
 * @param {Object} obj
 */
 export const serializeObject = (obj) =>  {

	// Setup our serialized data
	var serialized = [];

	// Loop through each field in the obj
    Object.keys(obj).forEach( key => {
        serialized.push(encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]))
    } )

	return serialized.join('&');

};

export const formatCurrency = (num) => {
    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    })
    return formatter.format(num)
}

export const csvToJson = (csv) => {

    var lines=csv.split("\n");

    var result = [];

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    var headers=lines[0].split(",");

    for(var i=1;i<lines.length;i++){

        var obj = {};
        var currentline=lines[i].split(",");

        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    return result;
}