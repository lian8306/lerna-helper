const yargs = require('yargs/yargs');
const Command = require('./Command');

class LernaHelper {
    constructor(args) {
        Command(args);
    }
}

function factory(args) {
    return new LernaHelper(args);
}

module.exports = factory;