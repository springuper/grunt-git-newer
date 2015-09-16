var path = require('path');

var helper = require('../helper');

var name = 'newer-modify-one';
var gruntfile = path.join(name, 'gruntfile.js');

describe(name, function () {
    beforeEach(function (done) {
        helper.cleanFixture(name, done);
    });

    it('runs the default task (see ' + gruntfile + ')', function (done) {
        this.timeout(6000);
        helper.buildFixture(name, function (error, dir) {
            done(error);
        });
    });

    afterEach(function (done) {
        helper.cleanFixture(name, done);
    });
});
