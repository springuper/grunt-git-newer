var path = require('path');
var cp = require('child_process');
var fs = require('fs');

var chai = require('chai');
var tmp = require('tmp');
var wrench = require('wrench');

var fixtures = path.join(__dirname, 'integration', 'fixtures');
var tmpDir = 'tmp';

/**
 * Spawn a process.
 * @param {string} cmd The command to run.
 * @param {array} args List of string arguments.
 * @param {object} options Config.
 * @param {function(Error)} done Callback.
 */
function spawn(cmd, args, options, done) {
    var child = cp.spawn(cmd, args, options);
    var messages = [];
    child.stderr.on('data', function (chunk) {
        messages.push(chunk.toString());
    });
    child.stdout.on('data', function (chunk) {
        messages.push(chunk.toString());
    });
    child.on('close', function (code) {
        if (code !== 0) {
            done(new Error('Task failed: ' + messages.join('')));
        } else {
            done(null);
        }
    });
}

/**
 * Clone a fixture and run the default Grunt task in it.
 * @param {string} name Fixture name.
 * @param {function(Error)} done Called with an error if the task
 *     fails.
 */
exports.buildFixture = function (name, done) {
    var fixture = path.join(fixtures, name);
    var gruntfile = path.join(fixture, 'gruntfile.js');
    if (!fs.existsSync(gruntfile)) {
        done(new Error('Cannot find gruntfile.js: ' + gruntfile));
    } else {
        var node = process.argv[0];
        var grunt = process.argv[1]; // assumes grunt drives these tests
        spawn(node, [grunt, '--verbose', '--stack'], { cwd: fixture }, done);
    }
};

/**
 * Clean up after running tests.
 * @param {string} name Fixture name.
 * @param {function} done Callback.
 */
exports.cleanFixture = function (name, done) {
    var fixture = path.join(fixtures, name);
    spawn('git', ['checkout', fixture], { cwd: fixture }, done);
};

/** @type {boolean} */
chai.config.includeStack = true;

/**
 * Chai's assert function configured to include stacks on failure.
 * @type {function}
 */
exports.assert = chai.assert;
