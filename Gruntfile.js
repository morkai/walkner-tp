// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under CC BY-NC-SA 4.0 <http://creativecommons.org/licenses/by-nc-sa/4.0/>.
// Part of the walkner-wmes project <http://lukasz.walukiewicz.eu/p/walkner-wmes>

/*global module:false*/

'use strict';

var requirejsConfig = require('./config/require');

module.exports = function(grunt)
{
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    clean: {
      frontendBuild: [
        './build/frontend',
        './frontend-build'
      ],
      frontendBuilt: [
        './build/frontend',
        './frontend-build/**/*.ejs',
        './frontend-build/**/nls/*.json'
      ]
    },
    eslint: {
      backend: {
        src: [
          './backend/**/*.js'
        ],
        options: {
          configFile: '.eslintrc.json'
        }
      },
      frontend: {
        src: [
          './frontend/app/**/*.js'
        ],
        options: {
          configFile: 'frontend/.eslintrc.json'
        }
      }
    },
    copy: {
      frontend: {
        expand: true,
        cwd: './frontend',
        src: '**',
        dest: './build/frontend'
      }
    },
    ejsAmd: {
      frontend: {
        expand: true,
        cwd: './build/frontend',
        src: '**/*.ejs',
        dest: './build/frontend',
        ext: '.js',
        options: {
          helpers: require('./config/tp-frontend').express.ejsAmdHelpers
        }
      }
    },
    messageformatAmdLocale: {
      frontend: {
        options: {
          locales: ['en', 'pl'],
          destDir: './build/frontend/app/nls/locale'
        }
      }
    },
    messageformatAmd: {
      frontend: {
        expand: true,
        cwd: './build/frontend',
        src: 'app/**/nls/*.json',
        ext: '.js',
        options: {
          destDir: './build/frontend/app/nls',
          localeModulePrefix: 'app/nls/locale/',
          resolveLocaleAndDomain: function(jsonFile)
          {
            var matches = jsonFile.match(/app\/(.*?)\/nls\/(.*?)\.json/);

            if (matches === null)
            {
              throw new Error("Invalid MessageFormat JSON file: " + jsonFile);
            }

            return {
              locale: matches[2],
              domain: matches[1]
            };
          }
        }
      }
    },
    requirejs: {
      frontend: {
        options: {
          baseUrl: './build/frontend',
          dir: './frontend-build',
          optimize: 'uglify2',
          uglify2: {
            compress: {
              drop_console: true
            }
          },
          optimizeCss: 'standard',
          modules: [
            {name: 'tp-main'}
          ],
          paths: requirejsConfig.buildPaths,
          shim: requirejsConfig.buildShim,
          locale: 'pl'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-ejs-amd');
  grunt.loadNpmTasks('grunt-eslint');
  grunt.loadNpmTasks('grunt-messageformat-amd');

  grunt.registerTask('default', [
    'clean',
    'eslint:backend',
    'eslint:frontend'
  ]);

  grunt.registerTask('build-frontend', [
    'clean:frontendBuild',
    'copy:frontend',
    'ejsAmd:frontend',
    'messageformatAmdLocale:frontend',
    'messageformatAmd:frontend',
    'requirejs:frontend',
    'clean:frontendBuilt'
  ]);
};
