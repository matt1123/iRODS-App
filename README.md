Startup Guide
====

This app was developed using Onsen UI, Cordova, & Node.js.

## Requirement

 * Node.js  - [Install Node.js](http://nodejs.org)
 * Cordova  - Install by `npm install cordova`
 * Onsen UI - Install by `$ bower install onsenui`


### Directory Layout

    README.md     --> This file
    gulpfile.js   --> Gulp tasks definition
    www/          --> Asset files for app
      index.html  --> App entry point (login page)
      app.html    --> Main App
      img/        --> Images and Icons Used 
      js/
      styles/
      lib/onsen/
        stylus/   --> Stylus files for onsen-css-components.css
        js/       --> JS files for Onsen UI
        css/      --> CSS files for Onsen UI
    platforms/    --> Cordova platform directory
    plugins/      --> Cordova plugin directory
    merges/       --> Cordova merge directory
    hooks/        --> Cordova hook directory


