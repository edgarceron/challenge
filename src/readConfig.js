/**
 * Read the configuration from the options files
 * requireAuth: 2 If authetication is required, otherwise 0
 * @returns {Object} An object contained the options and its respective
 * values.
 */
function readOptions(){
    const fs = require('fs');
    var data = fs.readFileSync('./config/options.json');
    var options = JSON.parse(data.toString());
    return options;
}

module.exports = {
    readOptions
}
