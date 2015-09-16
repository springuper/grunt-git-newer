var path = require('path');

var helper = require('../helper');

var name = 'newer-modify-one';
var gruntfile = path.join(name, 'gruntfile.js');

describe(name, function () {
    it('runs the default task (see ' + gruntfile + ')', function (done) {
        this.timeout(6000);
        helper.buildFixture(name, function (error, dir) {
            done(error);
        });
    });

    after(function (done) {
        helper.afterFixture(name, done);
    });
});
