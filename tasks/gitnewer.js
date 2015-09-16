var fs = require('fs');
var path = require('path');
var async = require('async');

var counter = 0;
var configCache = {};

function cacheConfig(config) {
    ++counter;
    configCache[counter] = config;
    return counter;
}

function pluckConfig(id) {
    if (!configCache.hasOwnProperty(id)) {
        throw new Error('Failed to find id in cache');
    }
    var config = configCache[id];
    delete configCache[id];
    return config;
}

function createTask(grunt, pattern) {
    function filterFiles(files, modifiedFiles) {
        return grunt.file.expand(files).filter(function (file) {
            var fullpath = path.resolve(file);
            if (pattern === 'prefix') {
                return modifiedFiles.some(function (modFile) {
                    return modFile.indexOf(fullpath) === 0;
                });
            } else {
                return modifiedFiles.indexOf(fullpath) !== -1;
            }
        });
    }

    return function (taskName, targetName) {
        var tasks = [];
        var prefix = this.name;
        var options = this.options({
            diffFilter: 'ACM'
        });
        if (!targetName) {
            if (!grunt.config(taskName)) {
                grunt.fatal('The "' + prefix + '" prefix is not supported for aliases');
                return;
            }
            Object.keys(grunt.config(taskName)).forEach(function (targetName) {
                if (!/^_|^options$/.test(targetName)) {
                    tasks.push(prefix + ':' + taskName + ':' + targetName);
                }
            });
            return grunt.task.run(tasks);
        }

        var args = Array.prototype.slice.call(arguments, 2).join(':');
        var done = this.async();
        var originalConfig = grunt.config.get([taskName, targetName]);
        var id = cacheConfig(originalConfig);
        var config = grunt.util._.clone(originalConfig);

        /**
         * Special handling for tasks that expect the `files` config to be a string
         * or array of string source paths.
         */
        var srcFiles = true;
        if (typeof config.files === 'string') {
            config.src = [config.files];
            delete config.files;
            srcFiles = false;
        } else if (Array.isArray(config.files) &&
            typeof config.files[0] === 'string') {
            config.src = config.files;
            delete config.files;
            srcFiles = false;
        }

        var files = grunt.task.normalizeMultiTaskFiles(config, targetName);

        // git newer files
        grunt.util.spawn({
            cmd: 'git',
            args: ['rev-parse', '--show-toplevel']
        }, function (error, result) {
            var base = result.stdout.toString().trim();

            grunt.util.spawn({
                cmd: 'git',
                args: ['diff', 'HEAD', '--name-only', '--diff-filter=' + options.diffFilter]
            }, function (error, result) {
                console.log('@result', result);
                var modifiedFiles = grunt.util._.compact(
                    result.stdout.toString().split(grunt.util.linefeed)
                ).map(function (file) {
                    return path.join(base, file);
                });
                grunt.verbose.writeln('Modified files:' + modifiedFiles);

                if (config.src) {
                    config.src = filterFiles(config.src, modifiedFiles);
                } else if (grunt.util._.isString(config.files)) {
                    config.files = filterFiles([config.files], modifiedFiles).join(',');
                } else if (Array.isArray(config.files) && grunt.util._.isString(config.files[0])) {
                    config.files = filterFiles(config.files, modifiedFiles);
                } else if (grunt.util._.isObject(config.files.src)) {
                    config.files.src = filterFiles(config.files.src, modifiedFiles);
                }
                console.log('@config', config);
                grunt.config.set([taskName, targetName], config);

                // run the task, and attend to postrun tasks
                var qualified = taskName + ':' + targetName;
                var tasks = [
                    qualified + (args ? ':' + args : ''),
                    'gitnewer-postrun:' + qualified + ':' + id
                ];
                grunt.task.run(tasks);

                done();
            });
        });
    };
}

/**
 * @param {Object} grunt Grunt.
 */
module.exports = function (grunt) {
    grunt.registerTask(
        'gitnewer',
        'Run a task with only those source files that have been modified since last git commit.',
        createTask(grunt));
    grunt.registerTask(
        'gitnewer-prefix',
        'Run a task with only those source files that have been modified since last git commit.',
        createTask(grunt, 'prefix'));

    grunt.registerTask(
        'gitnewer-postrun',
        'Internal task.',
        function (taskName, targetName, id) {
            // reconfigure task with original config
            grunt.config.set([taskName, targetName], pluckConfig(id));
        });
};
