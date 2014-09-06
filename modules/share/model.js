var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;
				  
var shareSchema   = new Schema({
	fileId: {
		type: Schema.Types.ObjectId,
        ref: 'File'
	},
	folderId: {
		type: Schema.Types.ObjectId,
        ref: 'Folder'
	},
	// User that issued the share link
	issuer: {
		type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
	},
	// share link could be password protected: if Null/False -> no pass || String/True -> pass
	password: String,
	myIdHash: {
		type: String,
		unique: true
	}
});

module.exports = mongoose.model('Share', shareSchema);