var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var versionSchema   = new Schema({
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	origFileName: {
		type: String,
		required: true
	},
	virtualPath: {
		type: String,
		required: true	
	},
	versions: [{
		fileid: {
			type: Schema.Types.ObjectId,
			ref: 'File',
			required: true 
		},
		cDate: {
			type: Date,
			required: true 	
		}
	}]
});

module.exports = mongoose.model('Versions', versionSchema);