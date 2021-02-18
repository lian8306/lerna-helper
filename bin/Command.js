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
            let files = glob.sync(package);
            result.push(...files);
        }

    });

    return result;
}

function publish(name, package) {

    ChildProcess.exec('npm publish ', {
        cwd: package
    }, (error, stdout, stderr) => {
        if (error == null) {
            log.info('lerna-helper', `publish ${name} is success`);
        } else {
            log.info(error);
        }
    })
}

function changeVersion(version, changeLevel) {
    let v = version.split('.');

    if (changeLevel === 'major') {
        return `${Number(v[0])+1}.${v[1]}.${v[2]}`
    } else if (changeLevel === 'minor') {
        return `${v[0]}.${Number(v[1])+1}.${v[2]}`
    } else {
        return `${v[0]}.${v[1]}.${Number(v[2])+1}`
    }
}

function publishHandler(args) {
    console.log("args", args);
    // all arguments without --
    let packages = args.files;
    // if add new version
    let newVersion = args.n;
    // if update old version
    let updateVersion = args.u;
    // new version reg
    let betaSymbol = args.beta;
    // 'major', 'minor', 'patch'
    let changeLevel = args.level || 'patch';
    // default maximun pakges number is 30
    let maxNum = args['max-num'] || 30;
    
    if (!packages) {
        log.info('lerna-helper', 'packages can not be empty');
    }

    // const publishPackages = getAllPackages(packages);
    const publishPackages = packages;
    if (publishPackages.length > maxNum) {
        log.info('lerna-helper', 'The maximun number of packets that can be processed is : j% ', maxNum);
    }

    // start to publish
    publishPackages.forEach(package => {
        // 修改路径
        if (!/^(\\|\/)/.test(package)) {
            package = process.cwd() + '/' + package;
        }
        if (package) {
            // enter directory
            // ChildProcess.exec('cd ', package, (error, stdout, stderr) => {
            //     if (error == null) {
            // here do not test system
            let packagesJsonDir = `${package}/package.json`;
            let packagesText = fs.readFileSync(packagesJsonDir, 'utf-8');

            if (packagesText) {

                let packagesJson = JSON.parse(packagesText);
                let version = packagesJson.version || '1.0.0';
                console.log('version is :', version);
                let name = packagesJson.name;
                if (updateVersion) {
                    // umpublish package
                    ChildProcess.exec('"npm unpublish" name', {
                        cwd: package
                    }, (error, stdout, stderr) => {
                        if (error == null) {
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
                            newV = `${v[0]}-${newBetaVersion+1}`;
                        } else {
                            newV = `${v[0]}-${betaSymbol}1`;
                        }

                    } else {
                        newV = changeVersion(version, changeLevel);
                    }
                    log.info('lerna-helper', `${name} new version is ${newV}`)
                    // replace version
                    packagesText = packagesText.replace(/('|")version('|")[ :]+('|")([^'"]+)('|")/, function(...args) {
                        return `${args[1]}version${args[2]}: ${args[3]}${newV}${args[5]}`
                    });
                    // save
                    fs.writeFileSync(packagesJsonDir, packagesText, 'utf-8');
                    publish(name, package);
                }
            }
            // }

            // });
        }
    });




}

function Command(args) {
    console.log('in command')
    return yargs(args).command('publish [files...]', 'publish target npm package', publishBuilder, publishHandler).argv;
}

module.exports = Command;