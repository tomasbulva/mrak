var mongoose      = require('mongoose');
var Schema        = mongoose.Schema;
				  
var shareSchema   = new Schema({
	fileId: {
		type: Schema.Types.ObjectId,
        ref: 'File',
        required: true
	},
	// User that issued the share link
	issuer: String{
		type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
	},
	// share link could be password protected: if Null/False -> no pass || String/True -> pass
	password: String,
	myIdHash: String
});

module.exports = mongoose.model('Share', shareSchema);