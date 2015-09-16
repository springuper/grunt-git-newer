var path = require('path');
var cp = require('child_process');
var fs = require('fs');

var chai = require('chai');
var tmp = require('tmp');
var wrench = require('wrench');

var fixtures = path.join(__dirname, 'integration', 'fixtures');
var tmpDir = 'tmp';

/**
 * Spawn a Grunt process.
 * @param {string} dir Directory with gruntfile.js.
 * @param {function(Error, Process)} done Callback.
 */
function spawnGrunt(dir, done) {
    var gruntfile = path.join(dir, 'gruntfile.js');
    if (!fs.existsSync(gruntfile)) {
        done(new Error('Cannot find gruntfile.js: ' + gruntfile));
    } else {
        var node = process.argv[0];
        var grunt = process.argv[1]; // assumes grunt drives these tests
        var child = cp.spawn(node, [grunt, '--verbose', '--stack'], {cwd: dir});
        done(null, child);
    }
}

/**
 * Clone a fixture and run the default Grunt task in it.
 * @param {string} name Fixture name.
 * @param {function(Error)} done Called with an error if the task
 *     fails.
 */
exports.buildFixture = function (name, done) {
    var fixture = path.join(fixtures, name);
    spawnGrunt(fixture, function (error, child) {
        if (error) {
            return done(error);
        }
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
    });
};

/**
 * Clean up after running tests.
 * @param {string} name Fixture name.
 * @param {function} done Callback.
 */
exports.afterFixture = function(name, done) {
    var fixture = path.join(fixtures, name);
    var child = cp.spawn(node, [grunt, '--verbose', '--stack'], {cwd: dir});
    grunt.util.spawn({
        cmd: 'git',
        args: ['co', fixture]
    }, function (error, result) {
        done(error);
    });
};

/** @type {boolean} */
chai.config.includeStack = true;

/**
 * Chai's assert function configured to include stacks on failure.
 * @type {function}
 */
exports.assert = chai.assert;
