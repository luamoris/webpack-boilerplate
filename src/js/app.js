/* == == == == Style == == == == */
require('../css/style.css');

// require('../less/style.less');
// require('../scss/style.scss');

/* = == == == Modules == == == = */
const script = require('./script');

/* == == == == CODE == == == == */

document.querySelector('h1').innerHTML = script.hello;
