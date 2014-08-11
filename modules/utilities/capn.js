var Capn = Object.create({});

var define = Object.defineProperty.bind(undefined, Capn);

define('stack', {
  get: function(){
    var originalStack = Error.prepareStackTrace;
    Error.prepareStackTrace = function(_, stack){ return stack; };
    var err = new Error();
    Error.captureStackTrace(err, arguments.callee);
    var stack = err.stack;
    Error.prepareStackTrace = originalStack;
    return stack;
  }
});

define('line', {
  get: function(){
    return this.stack[1].getLineNumber();
  }
});

define('typeName', {
  get: function(){
    return this.stack[1].getTypeName();
  }
});

define('fileName', {
  get: function(){
    return this.callingContext.getFileName();
  }
});

module.exports = Capn;