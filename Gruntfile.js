'use strict';
module.exports = function (grunt) {
  // Show elapsed time at the end
  require('time-grunt')(grunt);
  // Load all grunt tasks
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      gruntfile: {
        src: ['Gruntfile.js']
      },
      js: {
        src: ['*.js']
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      js: {
        files: '<%= jshint.js.src %>',
        tasks: ['jshint:js', 'mochacli']
      },
      mochaTest: {
        files: ['lib/**/*.spec.js'],
        tasks: ['mochaTest']
      }
    },
    mochaTest: {
      options: {
        reporter: 'nyan',
        require: [
          function(){ should = require('chai').should() }
        ]
      },
      all: {
        src: [
          'lib/**/*.spec.js'
        ]
      }
    }
  });

  grunt.registerTask('default', ['jshint', 'mochaTest']);
  grunt.registerTask('test', [
    'mochaTest'
  ]);
};
