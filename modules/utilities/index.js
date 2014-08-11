var fs 			= require('fs');
var path 		= require('path');
var winston 	= require('winston');
var express    	= require('express');
var moment		= require('moment');
var capn		= require('./capn');

module.exports = {
	getFilesizeInBytes: function (filename) {
		var stats = fs.statSync(filename)
		var fileSizeInBytes = stats["size"]
		return fileSizeInBytes
	},
	getFileExtension: function(filename) {
		var ext = path.extname(filename||'').split('.');
		return ext[ext.length - 1];
	},
	randomCharacterString: function(stringlength){
	    var text = "";
	    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	    for( var i=0; i < stringlength; i++ )
	        text += possible.charAt(Math.floor(Math.random() * possible.length));

	    return text;
	},
	globalHeaders: function(res) {
	    return res.setHeader("X-Powered-By", "Logomatic.io");
	},
	iLog: function(module) {

	    var myLabel = module.filename.split('/').slice(-3).join('/'); //using filename in log statements
	    var myLabel2 = module.filename.split('/').slice(-3).join('/')+" line: "+capn.line+" stack: "+capn.stack;
	    
	    return new winston.Logger({
	        transports : [
	            new winston.transports.Console({
	                colorize: true,
	                name: 'debug_console',
	                level: 'debug',
	                label: myLabel
	            }),
	            new winston.transports.Console({
	                colorize: true,
	                name: 'error_console',
	                level: 'error',
	                label: myLabel2
	            }),
	            new winston.transports.File({ 
	            	filename: 'mrak_errors.log',
	            	name: 'error', 
	            	level: 'error',
	            	label: myLabel2
	            }),
	            new winston.transports.File({ 
	            	filename: 'mrak.log', 
	            	name: 'all_higher',
	            	level: 'info error',
	            	label: myLabel
	            })
	        ],
	        exceptionHandlers: [
	        	new winston.transports.Console({
	                colorize: true,
	                name: 'console app crash',
	                //json: false,
	                //label: myLabel2
	            }),
				new winston.transports.File({ filename: 'mrak-exeptions.log', name: 'file app crash' })
		    ]
	    });
	},
	parseUrlEncoded: function(data){
		if (data == "") return {};
		data = data.split('&');
		var buffer = {};
		for (var i = 0; i < data.length; ++i){
	            var p=data[i].split('=');
	            if (p.length != 2) continue;
	            buffer[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
	    }
		return buffer;
	},
	dates: {
	    convert:function(d) {
	        // Converts the date in d to a date-object. The input can be:
	        //   a date object: returned without modification
	        //  an array      : Interpreted as [year,month,day]. NOTE: month is 0-11.
	        //   a number     : Interpreted as number of milliseconds
	        //                  since 1 Jan 1970 (a timestamp) 
	        //   a string     : Any format supported by the javascript engine, like
	        //                  "YYYY/MM/DD", "MM/DD/YYYY", "Jan 31 2009" etc.
	        //  an object     : Interpreted as an object with year, month and date
	        //                  attributes.  **NOTE** month is 0-11.
	        return (
	            d.constructor === Date ? d :
	            d.constructor === Array ? new Date(d[0],d[1],d[2]) :
	            d.constructor === Number ? new Date(d) :
	            d.constructor === String ? new Date(d) :
	            typeof d === "object" ? new Date(d.year,d.month,d.date) :
	            NaN
	        );
	    },
	    compare:function(a,b) {
	        // Compare two dates (could be of any type supported by the convert
	        // function above) and returns:
	        //  -1 : if a < b
	        //   0 : if a = b
	        //   1 : if a > b
	        // NaN : if a or b is an illegal date
	        // NOTE: The code inside isFinite does an assignment (=).
	        return (
	            isFinite(a=this.convert(a).valueOf()) &&
	            isFinite(b=this.convert(b).valueOf()) ?
	            (a>b)-(a<b) :
	            NaN
	        );
	    },
	    inRange:function(d,start,end) {
	        // Checks if date in d is between dates in start and end.
	        // Returns a boolean or NaN:
	        //    true  : if d is between start and end (inclusive)
	        //    false : if d is before start or after end
	        //    NaN   : if one or more of the dates is illegal.
	        // NOTE: The code inside isFinite does an assignment (=).
	       return (
	            isFinite(d=this.convert(d).valueOf()) &&
	            isFinite(start=this.convert(start).valueOf()) &&
	            isFinite(end=this.convert(end).valueOf()) ?
	            start <= d && d <= end :
	            NaN
	        );
	    }
	}
}