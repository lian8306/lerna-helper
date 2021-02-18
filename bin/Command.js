const yargs = require("yargs/yargs");
const log = require('npmlog');
const fs = require('fs');
const glob = require('glob');
const ChildProcess = require('child_process');

function publishBuilder(args) {
    // console.log("args", args);

}
// Get all packages to be published
function getAllPackages(packages, testPath) {
    let result = [];

    packages.forEach(package => {

        if (package) {
            glob(package, function(er, files) {
                if (!er) {
                    result.push(...files);
                }
            })
        }

    });

    return result;
}

function publish(name) {

    ChildProcess.exec('npm publish ', (error, stdout, stderr) => {
        if (error != null) {
            log.info('lerna-helper', `publish ${name} is success`);
        } else {
            log.info(error);
        }
    })
}

function publishHandler(args) {
    console.log("args", args);
    // all arguments without --
    let packages = args._;
    // if add new version
    let newVersion = args.n;
    // if update old version
    let updateVersion = args.u;
    // new version reg
    let betaSymbol = args.beta;
    // default maximun pakges number is 30
    let maxNum = args['max-num'] || 30;

    if (!packages) {
        log.info('lerna-helper', 'packages can not be empty');
    }

    const publishPackages = getAllPackages(packages);

    if (publishPackages.length > maxNum) {
        log.info('lerna-helper', 'The maximun number of packets that can be processed is : j% ', maxNum);
    }

    // start to publish
    publishPackages.forEach(package => {

        if (package) {

            // enter directory
            ChildProcess.exec('cd ', package, (error, stdout, stderr) => {


                if (error != null) {
                    // here do not test system
                    let packagesJson = fs.readFileSync(`${package}\\packagesjson`);
                    if (packagesJson) {
                        let version = packagesJson.version || '1.0.0';
                        console.log('version is :', version);
                        let name = packagesjson.name;
                        if (updateVersion) {
                            // umpublish package
                            ChildProcess.exec('npm unpublish ', name, (error, stdout, stderr) => {
                                if (error != null) {
                                    log.info('lerna-helper', `unpublish ${name} is success`);
                                    // publish 
                                    publish(name);
                                }
                            })
                        } else {
                            // - is hard codign ,if neccessary,it can be extracted into the configuration
                            let newV;
                            if (betaSymbol) {
                                let v = version.split('-');
                                // has beta
                                if (v[1]) {
                                    let newBetaVersion = v[1].replace(betaSymbol, '');
                                    newV = `${v[0]}-${newBeta}${newBetaVersion+1}`;
                                } else {
                                    newV = `${v[0]}-${betaSymbol}1`;
                                }

                            } else {
                                newV = version + 1;
                            }
                            // replace version
                            packagesJson.replace(/('|")version('|")[ :]+('|")([^'"]+)('|")/, function(...args) {
                                return `${args[1]}vertsion${args[2]}: ${args[3]}${newV}${args[5]}`
                            });
                            // save
                            fs.writeFileSync(package, packagesJson, 'utf-8');
                            publish(name);
                        }
                    }
                }

            });
        }
    });




}

function Command(args) {
    console.log('in command')
    return yargs(args).command('publish [files...]', 'publish target npm package', publishBuilder, publishHandler).argv;
}

module.exports = Command;