const fs = require('fs');
fs.appendFileSync('C:/Users/spide/OneDrive/Pictures/v0-ambulance-booking-platform/server_error.log', '\n' + new Date().toISOString() + ': ' + JSON.stringify(error) + '\n');
