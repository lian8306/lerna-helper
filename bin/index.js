const yargs = require('yargs/yargs');
const Command = require('./Command');

class LernaHelper {
    constructor(args) {
        Command(args);
        console.log('in LernaHelper')
    }
    // publish() {

    // }
}

function factory(args) {
    console.log("in factory")
    return new LernaHelper(args);
}

module.exports = factory;