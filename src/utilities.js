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
    return fetch(url, params).then( res => res.json() )
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