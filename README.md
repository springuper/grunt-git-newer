# grunt-gitnewer

[Build Status Images](https://travis-ci.org/springuper/grunt-git-newer.svg)

Run Grunt tasks with only those source files modified since the last git commit.

It's very like [grunt-newer](https://github.com/tschaub/grunt-newer), but for git commit.

## Usage

### The `gitnewer` task

The most common use case. If some files changed from last git commit, and exactly match with one or more task, then those tasks will run with only those files.

```js
grunt.initConfig({
    jshint: {
        all: {
            src: ['src/**/*.js']
        }
    }
});

grunt.loadNpmTasks('grunt-contrib-jshint');
grunt.loadNpmTasks('grunt-gitnewer');

grunt.registerTask('lint', ['gitnewer:jshint:all']);
```

### The `gitnewer-prefix` task

The only differece from `gitnewer` task is `gitnewer-prefix` uses prefix match, this is useful when src of task is a list of directories.

### Options

#### `branch`='HEAD', `diffFilter`='ACM'

Internally, the following command is executed to detect changed files from some git commit:

```
git diff ${branch} --name-only --diff-filter=${diffFilter}
```

`branch` and `diffFilter` can be configured to meet your needs.
