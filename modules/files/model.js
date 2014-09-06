var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var fileSchema   = new Schema({
		filenameOrig: {
			type: String,
			required: true
		},
		filePath: {
			type: String,
			required: true
		},
		parent: {
			type: Schema.Types.ObjectId,
		    ref: 'Folder',
			required: true
		},
		isLive:{
			type: Boolean,
			required: true,
			default: true	
		},
		users: {
			owner: {
				type: Schema.Types.ObjectId,
		        ref: 'User',
		        required: true
			},
			sharee: [{
					type: Schema.Types.ObjectId,
		        	ref: 'User'
			}]
		},
		versions: [{
			filenameTmp: {
				type: String,
				required: true
			},
			created: {
				type: Date,
				required: true 	
			},
			deleted: {
				type: Boolean,
				required: true,
				default: false
			}
		}],
		meta: {
			size: {
				type: Number
			},
			mime: {
				type: String
			}, 
			publ: {
				type: Boolean,
				default: true
			}, 
			hash: {
				type: String,
				required: true
			},
			ext: {
				type: String
			}
		},
	    created: {
	        type: Date,
	        default: Date.now
	    }

});

module.exports = mongoose.model('File', fileSchema);