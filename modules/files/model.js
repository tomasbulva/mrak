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
		virtualPath: {
			type: String,
			required: true
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
				unique: true,
				required: true
			},
			createDate: {
				type: Date,
				required: true 	
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