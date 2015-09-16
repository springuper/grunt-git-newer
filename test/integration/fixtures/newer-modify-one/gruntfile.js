var path = require('path');

/**
 * @param {Object} grunt Grunt.
 */
module.exports = function(grunt) {
    var log = [];

    grunt.initConfig({
        modified: {
            one: {
                src: 'src/one.js'
            },
            all: {
                src: 'src/**/*.js'
            },
            none: {
                src: []
            }
        },
        log: {
            all: {
                src: 'src/**/*.js',
                getLog: function () {
                    return log;
                }
            }
        },
        assert: {
            that: {
                getLog: function () {
                    return log;
                }
            }
        }
    });

    grunt.loadTasks('../../../../tasks');
    grunt.loadTasks('../../../../test/integration/tasks');

    grunt.registerTask('default', function () {
        grunt.task.run([
            // run the assert task with gitnewer, expect all files
            'gitnewer:log',
            'assert:that:modified:none',

            // HFS+ filesystem mtime resolution
            'wait:1001',

            // modify one file
            'modified:one',

            // run assert task again, expect one file
            'gitnewer:log',
            'assert:that:modified:one',

            // HFS+ filesystem mtime resolution
            'wait:1001',

            // modify nothing, expect no files
            'gitnewer:log',
            'assert:that:modified:one'
        ]);
    });
};
