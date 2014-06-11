"use strict";

var express = require( 'express' );
var path = require( 'path' );
var bodyParser = require( 'body-parser' );

var index = require( './routes/index' );
var surveys = require( './routes/surveys' );
var api = require( './routes/api' );
var pages = require( './routes/pages' );
var config = require( './config' );
var logger = require( 'morgan' );

var app = express();

// general 
for ( var item in config ) {
    app.set( item, app.get( item ) || config[ item ] );
}
app.set( 'port', process.env.PORT || app.get( "port" ) || 3000 );
app.set( 'env', process.env.NODE_ENV || 'production' );

// views
app.set( 'views', path.join( __dirname, 'views' ) );
app.set( 'view engine', 'jade' );

// pretty json API responses
app.set( 'json spaces', 4 );

// middleware
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded() );
app.use( express.static( path.join( __dirname, 'public' ) ) );

// set variables that should be accessible in all view templates
app.use( function( req, res, next ) {
    res.locals.livereload = req.app.get( 'env' ) === 'development';
    res.locals.environment = req.app.get( 'env' );
    res.locals.tracking = req.app.get( 'google analytics ua' ) ? req.app.get( 'google analytics ua' ) : false;
    res.locals.trackingDomain = req.app.get( 'google analytics domain' );
    res.locals.supportEmail = req.app.get( 'support email' );
    next();
} );

// routing
app.use( '/', index );
app.use( '/', pages );
app.use( '/', surveys );
app.use( '/api/v1', api );

// catch 404 and forwarding to error handler
app.use( function( req, res, next ) {
    var err = new Error( 'Page not Found' );
    err.status = 404;
    next( err );
} );

// logging
app.use( logger( {
    format: ( app.get( 'env' ) === 'development' ? 'dev' : 'tiny' )
} ) );

// development error handler
// will print stacktrace
if ( app.get( 'env' ) === 'development' ) {
    app.use( function( err, req, res, next ) {
        var body = {
            code: err.status,
            message: err.message,
            stack: err.stack
        };
        res.status( err.status || 500 );
        if ( res.get( 'Content-type' ) === 'application/json' ) {
            res.json( body );
        } else {
            res.render( 'error', body );
        }
    } );
}

// production error handler
// no stacktraces leaked to user
app.use( function( err, req, res, next ) {
    var body = {
        code: err.status,
        message: err.message
    };
    res.status( err.status || 500 );
    if ( res.get( 'Content-type' ) === 'application/json' ) {
        res.json( body );
    } else {
        res.render( 'error', body );
    }
} );

module.exports = app;