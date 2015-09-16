# grunt-git-newer

Run Grunt tasks with only those source files modified since the last git commit.

It's very like [grunt-newer](https://github.com/tschaub/grunt-newer), but for git commit.

## Usage

### The `gitnewer` task

The most common use case. If some files changed from last git commit, and exactly match with one or more task, then those tasks will run with only those files.

```js
grunt.initConfig({
    uglify: {
        all: {
            files: {
                'dest/app.min.js': ['src/**/*.js']
            }
        }
    }
});

grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-gitnewer');

grunt.registerTask('minify', ['gitnewer:uglify:all']);
```

### The `gitnewer-prefix` task

The only differece from `gitnewer` task is `gitnewer-prefix` uses prefix match, this is useful when src of task is a list of directories.

### Options

#### `diffFilter`='ACM'

Internally, the following command is used to detect changed files from last git commit:

```
git diff HEAD --name-only --diff-filter=ACM
```

you can config the last argument as your wish.
