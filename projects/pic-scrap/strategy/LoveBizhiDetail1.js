/**
 * 本策略仅针对  m.lovebizhi.com/share/199977  这类页面生效
 * 
 */

var util = require('util');
var nodeio = require('node.io');
var http = require('http');
var jsdom = require('jsdom');
var child_process = require('child_process');
var _ = require('underscore');
var StrategyClass = require('../interface/StrategyClass');
var dataStore = require('../dataStore');


function Strategy( url ){
    this.url = url;
}

util.inherits( Strategy, StrategyClass );

/*
_.extend( Strategy.prototype, {
    run : function(){
	console.log( 'run in ' + __filename );
	var that = this;
	var methods = {
	    input : false, 
	    encoding : 'utf8', 
	    run : function(){
		this.getHtml( that.url, function( err, $, data ){
		    if( err ){
			this.exit(err);
		    }
		    try{

			var title = ( $('.pic .hd .breadcrumbs a').last().text );
			var img = $('.pic .hd img#show');
			var picURL = img.attribs.src;

			dataStore.save( {
			    title : title, 
			    fromURL : that.url, 
			    objURLArray : [ picURL ]
			} );
		    }catch(e){
			//TODO  error log 
			console.log('[StrategyFail]: url(' + that.url + ') strategy(' + __filename + ') message(' + e.message + ')');
		    }
		} );
	    }
	};
	var job = new nodeio.Job( { timeout : 10 }, methods );
	nodeio.start(job);;

    }
} );
*/

//test use jsdom to retrieve the naturalWidth and naturalHeight of <img>
/*
jsdom.defaultDocumentFeatures  = {
    FetchExternalResources : [ 'img', 'script']
    
};
Strategy.prototype.run = function(){
    jsdom.env({
	url : this.url, 
	scripts: ["http://code.jquery.com/jquery.js"],
	done : function( err, window){
	    if(err){
		console.error(err);
		return;
	    }
	    var $ = window.$;
	    console.log( $('.pic .hd img#show').width() );
	    var img = window.document.querySelector('.pic .hd img#show');
	    console.log(img.naturalWidth);
	}
    });
};
*/

//test casperjs to retrieve img width/height
Strategy.prototype.run = function(){
    var dirPath = __dirname;
    var that = this;
//console.log(dirPath);
    var process = child_process.spawn( 'casperjs', [ dirPath + '/casperjs/LoveBizhiDetail1.js', this.url ] );
    process.stdout.on( 'data', function(data){
	console.log( 'in stdout: ' + data );
	var jsonObj;
	try{
	    jsonObj = JSON.parse( data );
	    dataStore.save( {
                title : jsonObj.title, 
                fromURL : jsonObj.fromURL, 
                objURLArray : [ jsonObj.objURL ], 
		width : jsonObj.width, 
		height : jsonObj.height
	    } );
	}catch(e){
	    console.log('[StrategyFail]: url(' + that.url + ') strategy(' + __filename + ') message(' + e.message + ')');
	}
    });
    process.stderr.on( 'data', function(data){
	console.error( 'in stderr: ' + data);
    });
    process.on( 'close', function(code){
//	console.log( 'exit code: ' + code);
    });
};


module.exports = Strategy;
