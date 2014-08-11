var utilities       = require('../utilities');
var log             = utilities.iLog(module);

var mongoose        = require('mongoose');
var Schema          = mongoose.Schema;


var tokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accessToken: {
        type: String,
        unique: true,
        required: true
    },
    expiration: {
        type: Date,
        required: true
    }
});

tokenSchema.methods.checkToken = function(cb) {
    //log.debug("this.tokentocheck ",this.tokentocheck);
    this.model('Token').findOne({ accessToken: this.tokentocheck }, 'accessToken expiration', function(err,result){
        if(err) log.error(err);
        //log.debug("result.accessToken ",result.accessToken);
        cb(result);
    }); 
};

module.exports = mongoose.model('Token', tokenSchema);