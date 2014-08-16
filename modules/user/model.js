var crypto      = require('crypto');
var utilities   = require('../utilities');
var Validations = require('./validations.js');
var log         = utilities.iLog(module);
var config      = require('../config');

var mongoose    = require('mongoose');
var Schema      = mongoose.Schema;


var userSchema  = new Schema({
    firstName: String,
    middleName: String,
    lastName: String,
    email: {
        type: String,
        required: 'email is required', 
        unique: true, 
        trim: true, 
        lowercase: true
    },
    username: {
        type: String,
        unique: true,
        required: 'Username is required'
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    }, 
    isloggedin: {
        type: Boolean
    }
});

//console.dir(userSchema);

userSchema.path('username').validate( Validations.uniqueFieldInsensitive('User', 'username' ), 'unique' )
userSchema.path('email').validate( Validations.uniqueFieldInsensitive('User', 'email' ), 'unique' )
userSchema.path('email').validate( Validations.emailFormat, 'format' )
//userSchema.path('hashedPassword').validate( Validations.cannotBeEmpty, 'hashedPassword' )

userSchema.methods.encryptPassword = function(password) {
    //thesalt = (salt !== undefined) ? salt : this.salt;
    //log.debug('encryptPassword ',thesalt);
    return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    //more secure – return crypto.pbkdf2Sync(password, this.salt, 10000, 512);
};

userSchema.virtual('userId')
    .get(function () {
        return this.id;
    });

userSchema.virtual('password')
    .set(function(password) {
        this._plainPassword = password;
        this.salt = crypto.randomBytes(32).toString('base64');
        //more secure - this.salt = crypto.randomBytes(128).toString('base64');
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function() { return this._plainPassword; });


userSchema.methods.checkPassword = function(cb) {
    //log.debug("this.encryptPassword(this.password) ",this.encryptPassword(this.password));
    //log.debug("this.id ",this.id);
    return (this.encryptPassword(this.password) === this.hashedPassword) ? true : false;
};


module.exports = mongoose.model('User', userSchema);