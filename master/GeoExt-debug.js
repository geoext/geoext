var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.ASSUME_ES5 = false;
$jscomp.ASSUME_NO_NATIVE_MAP = false;
$jscomp.ASSUME_NO_NATIVE_SET = false;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || typeof Object.defineProperties == 'function' ? Object.defineProperty : function(target, property, descriptor) {
  descriptor = descriptor;
  if (target == Array.prototype || target == Object.prototype) {
    return;
  }
  target[property] = descriptor.value;
};
$jscomp.getGlobal = function(maybeGlobal) {
  return typeof window != 'undefined' && window === maybeGlobal ? maybeGlobal : typeof global != 'undefined' && global != null ? global : maybeGlobal;
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function(target, polyfill, fromLang, toLang) {
  if (!polyfill) {
    return;
  }
  var obj = $jscomp.global;
  var split = target.split('.');
  for (var i = 0; i < split.length - 1; i++) {
    var key = split[i];
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }
  var property = split[split.length - 1];
  var orig = obj[property];
  var impl = polyfill(orig);
  if (impl == orig || impl == null) {
    return;
  }
  $jscomp.defineProperty(obj, property, {configurable:true, writable:true, value:impl});
};
$jscomp.polyfill('Array.prototype.copyWithin', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, start, opt_end) {
    var len = this.length;
    target = Number(target);
    start = Number(start);
    opt_end = Number(opt_end != null ? opt_end : len);
    if (target < start) {
      opt_end = Math.min(opt_end, len);
      while (start < opt_end) {
        if (start in this) {
          this[target++] = this[start++];
        } else {
          delete this[target++];
          start++;
        }
      }
    } else {
      opt_end = Math.min(opt_end, len + start - target);
      target += opt_end - start;
      while (opt_end > start) {
        if (--opt_end in this) {
          this[--target] = this[opt_end];
        } else {
          delete this[target];
        }
      }
    }
    return this;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.SYMBOL_PREFIX = 'jscomp_symbol_';
$jscomp.initSymbol = function() {
  $jscomp.initSymbol = function() {
  };
  if (!$jscomp.global['Symbol']) {
    $jscomp.global['Symbol'] = $jscomp.Symbol;
  }
};
$jscomp.Symbol = function() {
  var counter = 0;
  function Symbol(opt_description) {
    return $jscomp.SYMBOL_PREFIX + (opt_description || '') + counter++;
  }
  return Symbol;
}();
$jscomp.initSymbolIterator = function() {
  $jscomp.initSymbol();
  var symbolIterator = $jscomp.global['Symbol'].iterator;
  if (!symbolIterator) {
    symbolIterator = $jscomp.global['Symbol'].iterator = $jscomp.global['Symbol']('iterator');
  }
  if (typeof Array.prototype[symbolIterator] != 'function') {
    $jscomp.defineProperty(Array.prototype, symbolIterator, {configurable:true, writable:true, value:function() {
      return $jscomp.arrayIterator(this);
    }});
  }
  $jscomp.initSymbolIterator = function() {
  };
};
$jscomp.arrayIterator = function(array) {
  var index = 0;
  return $jscomp.iteratorPrototype(function() {
    if (index < array.length) {
      return {done:false, value:array[index++]};
    } else {
      return {done:true};
    }
  });
};
$jscomp.iteratorPrototype = function(next) {
  $jscomp.initSymbolIterator();
  var iterator = {next:next};
  iterator[$jscomp.global['Symbol'].iterator] = function() {
    return this;
  };
  return iterator;
};
$jscomp.iteratorFromArray = function(array, transform) {
  $jscomp.initSymbolIterator();
  if (array instanceof String) {
    array = array + '';
  }
  var i = 0;
  var iter = {next:function() {
    if (i < array.length) {
      var index = i++;
      return {value:transform(index, array[index]), done:false};
    }
    iter.next = function() {
      return {done:true, value:void 0};
    };
    return iter.next();
  }};
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  iter[Symbol.iterator] = function() {
    return iter;
  };
  return iter;
};
$jscomp.polyfill('Array.prototype.entries', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function() {
    return $jscomp.iteratorFromArray(this, function(i, v) {
      return [i, v];
    });
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.fill', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(value, opt_start, opt_end) {
    var length = this.length || 0;
    if (opt_start < 0) {
      opt_start = Math.max(0, length + opt_start);
    }
    if (opt_end == null || opt_end > length) {
      opt_end = length;
    }
    opt_end = Number(opt_end);
    if (opt_end < 0) {
      opt_end = Math.max(0, length + opt_end);
    }
    for (var i = Number(opt_start || 0); i < opt_end; i++) {
      this[i] = value;
    }
    return this;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.findInternal = function(array, callback, thisArg) {
  if (array instanceof String) {
    array = String(array);
  }
  var len = array.length;
  for (var i = 0; i < len; i++) {
    var value = array[i];
    if (callback.call(thisArg, value, i, array)) {
      return {i:i, v:value};
    }
  }
  return {i:-1, v:void 0};
};
$jscomp.polyfill('Array.prototype.find', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(callback, opt_thisArg) {
    return $jscomp.findInternal(this, callback, opt_thisArg).v;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.findIndex', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(callback, opt_thisArg) {
    return $jscomp.findInternal(this, callback, opt_thisArg).i;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.from', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(arrayLike, opt_mapFn, opt_thisArg) {
    $jscomp.initSymbolIterator();
    opt_mapFn = opt_mapFn != null ? opt_mapFn : function(x) {
      return x;
    };
    var result = [];
    $jscomp.initSymbol();
    $jscomp.initSymbolIterator();
    var iteratorFunction = arrayLike[Symbol.iterator];
    if (typeof iteratorFunction == 'function') {
      arrayLike = iteratorFunction.call(arrayLike);
      var next;
      var k = 0;
      while (!(next = arrayLike.next()).done) {
        result.push(opt_mapFn.call(opt_thisArg, next.value, k++));
      }
    } else {
      var len = arrayLike.length;
      for (var i = 0; i < len; i++) {
        result.push(opt_mapFn.call(opt_thisArg, arrayLike[i], i));
      }
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Object.is', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(left, right) {
    if (left === right) {
      return left !== 0 || 1 / left === 1 / right;
    } else {
      return left !== left && right !== right;
    }
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.includes', function(orig) {
  if (orig) {
    return orig;
  }
  var includes = function(searchElement, opt_fromIndex) {
    var array = this;
    if (array instanceof String) {
      array = String(array);
    }
    var len = array.length;
    var i = opt_fromIndex || 0;
    if (i < 0) {
      i = Math.max(i + len, 0);
    }
    for (; i < len; i++) {
      var element = array[i];
      if (element === searchElement || Object.is(element, searchElement)) {
        return true;
      }
    }
    return false;
  };
  return includes;
}, 'es7', 'es3');
$jscomp.polyfill('Array.prototype.keys', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function() {
    return $jscomp.iteratorFromArray(this, function(i) {
      return i;
    });
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.of', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(var_args) {
    return Array.from(arguments);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Array.prototype.values', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function() {
    return $jscomp.iteratorFromArray(this, function(k, v) {
      return v;
    });
  };
  return polyfill;
}, 'es8', 'es3');
$jscomp.makeIterator = function(iterable) {
  $jscomp.initSymbolIterator();
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  var iteratorFunction = iterable[Symbol.iterator];
  return iteratorFunction ? iteratorFunction.call(iterable) : $jscomp.arrayIterator(iterable);
};
$jscomp.FORCE_POLYFILL_PROMISE = false;
$jscomp.polyfill('Promise', function(NativePromise) {
  if (NativePromise && !$jscomp.FORCE_POLYFILL_PROMISE) {
    return NativePromise;
  }
  function AsyncExecutor() {
    this.batch_ = null;
  }
  AsyncExecutor.prototype.asyncExecute = function(f) {
    if (this.batch_ == null) {
      this.batch_ = [];
      this.asyncExecuteBatch_();
    }
    this.batch_.push(f);
    return this;
  };
  AsyncExecutor.prototype.asyncExecuteBatch_ = function() {
    var self = this;
    this.asyncExecuteFunction(function() {
      self.executeBatch_();
    });
  };
  var nativeSetTimeout = $jscomp.global['setTimeout'];
  AsyncExecutor.prototype.asyncExecuteFunction = function(f) {
    nativeSetTimeout(f, 0);
  };
  AsyncExecutor.prototype.executeBatch_ = function() {
    while (this.batch_ && this.batch_.length) {
      var executingBatch = this.batch_;
      this.batch_ = [];
      for (var i = 0; i < executingBatch.length; ++i) {
        var f = executingBatch[i];
        executingBatch[i] = null;
        try {
          f();
        } catch (error) {
          this.asyncThrow_(error);
        }
      }
    }
    this.batch_ = null;
  };
  AsyncExecutor.prototype.asyncThrow_ = function(exception) {
    this.asyncExecuteFunction(function() {
      throw exception;
    });
  };
  var PromiseState = {PENDING:0, FULFILLED:1, REJECTED:2};
  var PolyfillPromise = function(executor) {
    this.state_ = PromiseState.PENDING;
    this.result_ = undefined;
    this.onSettledCallbacks_ = [];
    var resolveAndReject = this.createResolveAndReject_();
    try {
      executor(resolveAndReject.resolve, resolveAndReject.reject);
    } catch (e) {
      resolveAndReject.reject(e);
    }
  };
  PolyfillPromise.prototype.createResolveAndReject_ = function() {
    var thisPromise = this;
    var alreadyCalled = false;
    function firstCallWins(method) {
      return function(x) {
        if (!alreadyCalled) {
          alreadyCalled = true;
          method.call(thisPromise, x);
        }
      };
    }
    return {resolve:firstCallWins(this.resolveTo_), reject:firstCallWins(this.reject_)};
  };
  PolyfillPromise.prototype.resolveTo_ = function(value) {
    if (value === this) {
      this.reject_(new TypeError('A Promise cannot resolve to itself'));
    } else {
      if (value instanceof PolyfillPromise) {
        this.settleSameAsPromise_(value);
      } else {
        if (isObject(value)) {
          this.resolveToNonPromiseObj_(value);
        } else {
          this.fulfill_(value);
        }
      }
    }
  };
  PolyfillPromise.prototype.resolveToNonPromiseObj_ = function(obj) {
    var thenMethod = undefined;
    try {
      thenMethod = obj.then;
    } catch (error) {
      this.reject_(error);
      return;
    }
    if (typeof thenMethod == 'function') {
      this.settleSameAsThenable_(thenMethod, obj);
    } else {
      this.fulfill_(obj);
    }
  };
  function isObject(value) {
    switch(typeof value) {
      case 'object':
        return value != null;
      case 'function':
        return true;
      default:
        return false;
    }
  }
  PolyfillPromise.prototype.reject_ = function(reason) {
    this.settle_(PromiseState.REJECTED, reason);
  };
  PolyfillPromise.prototype.fulfill_ = function(value) {
    this.settle_(PromiseState.FULFILLED, value);
  };
  PolyfillPromise.prototype.settle_ = function(settledState, valueOrReason) {
    if (this.state_ != PromiseState.PENDING) {
      throw new Error('Cannot settle(' + settledState + ', ' + valueOrReason + '): Promise already settled in state' + this.state_);
    }
    this.state_ = settledState;
    this.result_ = valueOrReason;
    this.executeOnSettledCallbacks_();
  };
  PolyfillPromise.prototype.executeOnSettledCallbacks_ = function() {
    if (this.onSettledCallbacks_ != null) {
      for (var i = 0; i < this.onSettledCallbacks_.length; ++i) {
        asyncExecutor.asyncExecute(this.onSettledCallbacks_[i]);
      }
      this.onSettledCallbacks_ = null;
    }
  };
  var asyncExecutor = new AsyncExecutor;
  PolyfillPromise.prototype.settleSameAsPromise_ = function(promise) {
    var methods = this.createResolveAndReject_();
    promise.callWhenSettled_(methods.resolve, methods.reject);
  };
  PolyfillPromise.prototype.settleSameAsThenable_ = function(thenMethod, thenable) {
    var methods = this.createResolveAndReject_();
    try {
      thenMethod.call(thenable, methods.resolve, methods.reject);
    } catch (error) {
      methods.reject(error);
    }
  };
  PolyfillPromise.prototype.then = function(onFulfilled, onRejected) {
    var resolveChild;
    var rejectChild;
    var childPromise = new PolyfillPromise(function(resolve, reject) {
      resolveChild = resolve;
      rejectChild = reject;
    });
    function createCallback(paramF, defaultF) {
      if (typeof paramF == 'function') {
        return function(x) {
          try {
            resolveChild(paramF(x));
          } catch (error) {
            rejectChild(error);
          }
        };
      } else {
        return defaultF;
      }
    }
    this.callWhenSettled_(createCallback(onFulfilled, resolveChild), createCallback(onRejected, rejectChild));
    return childPromise;
  };
  PolyfillPromise.prototype['catch'] = function(onRejected) {
    return this.then(undefined, onRejected);
  };
  PolyfillPromise.prototype.callWhenSettled_ = function(onFulfilled, onRejected) {
    var thisPromise = this;
    function callback() {
      switch(thisPromise.state_) {
        case PromiseState.FULFILLED:
          onFulfilled(thisPromise.result_);
          break;
        case PromiseState.REJECTED:
          onRejected(thisPromise.result_);
          break;
        default:
          throw new Error('Unexpected state: ' + thisPromise.state_);
      }
    }
    if (this.onSettledCallbacks_ == null) {
      asyncExecutor.asyncExecute(callback);
    } else {
      this.onSettledCallbacks_.push(callback);
    }
  };
  function resolvingPromise(opt_value) {
    if (opt_value instanceof PolyfillPromise) {
      return opt_value;
    } else {
      return new PolyfillPromise(function(resolve, reject) {
        resolve(opt_value);
      });
    }
  }
  PolyfillPromise['resolve'] = resolvingPromise;
  PolyfillPromise['reject'] = function(opt_reason) {
    return new PolyfillPromise(function(resolve, reject) {
      reject(opt_reason);
    });
  };
  PolyfillPromise['race'] = function(thenablesOrValues) {
    return new PolyfillPromise(function(resolve, reject) {
      var iterator = $jscomp.makeIterator(thenablesOrValues);
      for (var iterRec = iterator.next(); !iterRec.done; iterRec = iterator.next()) {
        resolvingPromise(iterRec.value).callWhenSettled_(resolve, reject);
      }
    });
  };
  PolyfillPromise['all'] = function(thenablesOrValues) {
    var iterator = $jscomp.makeIterator(thenablesOrValues);
    var iterRec = iterator.next();
    if (iterRec.done) {
      return resolvingPromise([]);
    } else {
      return new PolyfillPromise(function(resolveAll, rejectAll) {
        var resultsArray = [];
        var unresolvedCount = 0;
        function onFulfilled(i) {
          return function(ithResult) {
            resultsArray[i] = ithResult;
            unresolvedCount--;
            if (unresolvedCount == 0) {
              resolveAll(resultsArray);
            }
          };
        }
        do {
          resultsArray.push(undefined);
          unresolvedCount++;
          resolvingPromise(iterRec.value).callWhenSettled_(onFulfilled(resultsArray.length - 1), rejectAll);
          iterRec = iterator.next();
        } while (!iterRec.done);
      });
    }
  };
  return PolyfillPromise;
}, 'es6', 'es3');
$jscomp.polyfill('Promise.prototype.finally', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(onFinally) {
    return this.then(function(value) {
      var promise = Promise.resolve(onFinally());
      return promise.then(function() {
        return value;
      });
    }, function(reason) {
      var promise = Promise.resolve(onFinally());
      return promise.then(function() {
        throw reason;
      });
    });
  };
  return polyfill;
}, 'es9', 'es3');
$jscomp.underscoreProtoCanBeSet = function() {
  var x = {a:true};
  var y = {};
  try {
    y.__proto__ = x;
    return y.a;
  } catch (e) {
  }
  return false;
};
$jscomp.setPrototypeOf = typeof Object.setPrototypeOf == 'function' ? Object.setPrototypeOf : $jscomp.underscoreProtoCanBeSet() ? function(target, proto) {
  target.__proto__ = proto;
  if (target.__proto__ !== proto) {
    throw new TypeError(target + ' is not extensible');
  }
  return target;
} : null;
$jscomp.generator = {};
$jscomp.generator.ensureIteratorResultIsObject_ = function(result) {
  if (result instanceof Object) {
    return;
  }
  throw new TypeError('Iterator result ' + result + ' is not an object');
};
$jscomp.generator.Context = function() {
  this.isRunning_ = false;
  this.yieldAllIterator_ = null;
  this.yieldResult = undefined;
  this.nextAddress = 1;
  this.catchAddress_ = 0;
  this.finallyAddress_ = 0;
  this.abruptCompletion_ = null;
  this.finallyContexts_ = null;
};
$jscomp.generator.Context.prototype.start_ = function() {
  if (this.isRunning_) {
    throw new TypeError('Generator is already running');
  }
  this.isRunning_ = true;
};
$jscomp.generator.Context.prototype.stop_ = function() {
  this.isRunning_ = false;
};
$jscomp.generator.Context.prototype.jumpToErrorHandler_ = function() {
  this.nextAddress = this.catchAddress_ || this.finallyAddress_;
};
$jscomp.generator.Context.prototype.next_ = function(value) {
  this.yieldResult = value;
};
$jscomp.generator.Context.prototype.throw_ = function(e) {
  this.abruptCompletion_ = {exception:e, isException:true};
  this.jumpToErrorHandler_();
};
$jscomp.generator.Context.prototype['return'] = function(value) {
  this.abruptCompletion_ = {'return':value};
  this.nextAddress = this.finallyAddress_;
};
$jscomp.generator.Context.prototype.jumpThroughFinallyBlocks = function(nextAddress) {
  this.abruptCompletion_ = {jumpTo:nextAddress};
  this.nextAddress = this.finallyAddress_;
};
$jscomp.generator.Context.prototype.yield = function(value, resumeAddress) {
  this.nextAddress = resumeAddress;
  return {value:value};
};
$jscomp.generator.Context.prototype.yieldAll = function(iterable, resumeAddress) {
  var iterator = $jscomp.makeIterator(iterable);
  var result = iterator.next();
  $jscomp.generator.ensureIteratorResultIsObject_(result);
  if (result.done) {
    this.yieldResult = result.value;
    this.nextAddress = resumeAddress;
    return;
  }
  this.yieldAllIterator_ = iterator;
  return this.yield(result.value, resumeAddress);
};
$jscomp.generator.Context.prototype.jumpTo = function(nextAddress) {
  this.nextAddress = nextAddress;
};
$jscomp.generator.Context.prototype.jumpToEnd = function() {
  this.nextAddress = 0;
};
$jscomp.generator.Context.prototype.setCatchFinallyBlocks = function(catchAddress, finallyAddress) {
  this.catchAddress_ = catchAddress;
  if (finallyAddress != undefined) {
    this.finallyAddress_ = finallyAddress;
  }
};
$jscomp.generator.Context.prototype.setFinallyBlock = function(finallyAddress) {
  this.catchAddress_ = 0;
  this.finallyAddress_ = finallyAddress || 0;
};
$jscomp.generator.Context.prototype.leaveTryBlock = function(nextAddress, catchAddress) {
  this.nextAddress = nextAddress;
  this.catchAddress_ = catchAddress || 0;
};
$jscomp.generator.Context.prototype.enterCatchBlock = function(nextCatchBlockAddress) {
  this.catchAddress_ = nextCatchBlockAddress || 0;
  var exception = this.abruptCompletion_.exception;
  this.abruptCompletion_ = null;
  return exception;
};
$jscomp.generator.Context.prototype.enterFinallyBlock = function(nextCatchAddress, nextFinallyAddress, finallyDepth) {
  if (!finallyDepth) {
    this.finallyContexts_ = [this.abruptCompletion_];
  } else {
    this.finallyContexts_[finallyDepth] = this.abruptCompletion_;
  }
  this.catchAddress_ = nextCatchAddress || 0;
  this.finallyAddress_ = nextFinallyAddress || 0;
};
$jscomp.generator.Context.prototype.leaveFinallyBlock = function(nextAddress, finallyDepth) {
  var preservedContext = this.finallyContexts_.splice(finallyDepth || 0)[0];
  var abruptCompletion = this.abruptCompletion_ = this.abruptCompletion_ || preservedContext;
  if (abruptCompletion) {
    if (abruptCompletion.isException) {
      return this.jumpToErrorHandler_();
    }
    if (abruptCompletion.jumpTo != undefined && this.finallyAddress_ < abruptCompletion.jumpTo) {
      this.nextAddress = abruptCompletion.jumpTo;
      this.abruptCompletion_ = null;
    } else {
      this.nextAddress = this.finallyAddress_;
    }
  } else {
    this.nextAddress = nextAddress;
  }
};
$jscomp.generator.Context.prototype.forIn = function(object) {
  return new $jscomp.generator.Context.PropertyIterator(object);
};
$jscomp.generator.Context.PropertyIterator = function(object) {
  this.object_ = object;
  this.properties_ = [];
  for (var property in object) {
    this.properties_.push(property);
  }
  this.properties_.reverse();
};
$jscomp.generator.Context.PropertyIterator.prototype.getNext = function() {
  while (this.properties_.length > 0) {
    var property = this.properties_.pop();
    if (property in this.object_) {
      return property;
    }
  }
  return null;
};
$jscomp.generator.Engine_ = function(program) {
  this.context_ = new $jscomp.generator.Context;
  this.program_ = program;
};
$jscomp.generator.Engine_.prototype.next_ = function(value) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_) {
    return this.yieldAllStep_(this.context_.yieldAllIterator_.next, value, this.context_.next_);
  }
  this.context_.next_(value);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.return_ = function(value) {
  this.context_.start_();
  var yieldAllIterator = this.context_.yieldAllIterator_;
  if (yieldAllIterator) {
    var returnFunction = 'return' in yieldAllIterator ? yieldAllIterator['return'] : function(v) {
      return {value:v, done:true};
    };
    return this.yieldAllStep_(returnFunction, value, this.context_['return']);
  }
  this.context_['return'](value);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.throw_ = function(exception) {
  this.context_.start_();
  if (this.context_.yieldAllIterator_) {
    return this.yieldAllStep_(this.context_.yieldAllIterator_['throw'], exception, this.context_.next_);
  }
  this.context_.throw_(exception);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.yieldAllStep_ = function(action, value, nextAction) {
  try {
    var result = action.call(this.context_.yieldAllIterator_, value);
    $jscomp.generator.ensureIteratorResultIsObject_(result);
    if (!result.done) {
      this.context_.stop_();
      return result;
    }
    var resultValue = result.value;
  } catch (e) {
    this.context_.yieldAllIterator_ = null;
    this.context_.throw_(e);
    return this.nextStep_();
  }
  this.context_.yieldAllIterator_ = null;
  nextAction.call(this.context_, resultValue);
  return this.nextStep_();
};
$jscomp.generator.Engine_.prototype.nextStep_ = function() {
  while (this.context_.nextAddress) {
    try {
      var yieldValue = this.program_(this.context_);
      if (yieldValue) {
        this.context_.stop_();
        return {value:yieldValue.value, done:false};
      }
    } catch (e) {
      this.context_.yieldResult = undefined;
      this.context_.throw_(e);
    }
  }
  this.context_.stop_();
  if (this.context_.abruptCompletion_) {
    var abruptCompletion = this.context_.abruptCompletion_;
    this.context_.abruptCompletion_ = null;
    if (abruptCompletion.isException) {
      throw abruptCompletion.exception;
    }
    return {value:abruptCompletion['return'], done:true};
  }
  return {value:undefined, done:true};
};
$jscomp.generator.Generator_ = function(engine) {
  this.next = function(opt_value) {
    return engine.next_(opt_value);
  };
  this['throw'] = function(exception) {
    return engine.throw_(exception);
  };
  this['return'] = function(value) {
    return engine.return_(value);
  };
  $jscomp.initSymbolIterator();
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  this[Symbol.iterator] = function() {
    return this;
  };
};
$jscomp.generator.createGenerator = function(generator, program) {
  var result = new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(program));
  if ($jscomp.setPrototypeOf) {
    $jscomp.setPrototypeOf(result, generator.prototype);
  }
  return result;
};
$jscomp.asyncExecutePromiseGenerator = function(generator) {
  function passValueToGenerator(value) {
    return generator.next(value);
  }
  function passErrorToGenerator(error) {
    return generator['throw'](error);
  }
  return new Promise(function(resolve, reject) {
    function handleGeneratorRecord(genRec) {
      if (genRec.done) {
        resolve(genRec.value);
      } else {
        Promise.resolve(genRec.value).then(passValueToGenerator, passErrorToGenerator).then(handleGeneratorRecord, reject);
      }
    }
    handleGeneratorRecord(generator.next());
  });
};
$jscomp.asyncExecutePromiseGeneratorFunction = function(generatorFunction) {
  return $jscomp.asyncExecutePromiseGenerator(generatorFunction());
};
$jscomp.asyncExecutePromiseGeneratorProgram = function(program) {
  return $jscomp.asyncExecutePromiseGenerator(new $jscomp.generator.Generator_(new $jscomp.generator.Engine_(program)));
};
$jscomp.checkEs6ConformanceViaProxy = function() {
  try {
    var proxied = {};
    var proxy = Object.create(new $jscomp.global['Proxy'](proxied, {'get':function(target, key, receiver) {
      return target == proxied && key == 'q' && receiver == proxy;
    }}));
    return proxy['q'] === true;
  } catch (err) {
    return false;
  }
};
$jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS = false;
$jscomp.ES6_CONFORMANCE = $jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS && $jscomp.checkEs6ConformanceViaProxy();
$jscomp.owns = function(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};
$jscomp.polyfill('WeakMap', function(NativeWeakMap) {
  function isConformant() {
    if (!NativeWeakMap || !Object.seal) {
      return false;
    }
    try {
      var x = Object.seal({});
      var y = Object.seal({});
      var map = new NativeWeakMap([[x, 2], [y, 3]]);
      if (map.get(x) != 2 || map.get(y) != 3) {
        return false;
      }
      map['delete'](x);
      map.set(y, 4);
      return !map.has(x) && map.get(y) == 4;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeWeakMap && $jscomp.ES6_CONFORMANCE) {
      return NativeWeakMap;
    }
  } else {
    if (isConformant()) {
      return NativeWeakMap;
    }
  }
  var prop = '$jscomp_hidden_' + Math.random();
  function insert(target) {
    if (!$jscomp.owns(target, prop)) {
      var obj = {};
      $jscomp.defineProperty(target, prop, {value:obj});
    }
  }
  function patch(name) {
    var prev = Object[name];
    if (prev) {
      Object[name] = function(target) {
        insert(target);
        return prev(target);
      };
    }
  }
  patch('freeze');
  patch('preventExtensions');
  patch('seal');
  var index = 0;
  var PolyfillWeakMap = function(opt_iterable) {
    this.id_ = (index += Math.random() + 1).toString();
    if (opt_iterable) {
      $jscomp.initSymbol();
      $jscomp.initSymbolIterator();
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillWeakMap.prototype.set = function(key, value) {
    insert(key);
    if (!$jscomp.owns(key, prop)) {
      throw new Error('WeakMap key fail: ' + key);
    }
    key[prop][this.id_] = value;
    return this;
  };
  PolyfillWeakMap.prototype.get = function(key) {
    return $jscomp.owns(key, prop) ? key[prop][this.id_] : undefined;
  };
  PolyfillWeakMap.prototype.has = function(key) {
    return $jscomp.owns(key, prop) && $jscomp.owns(key[prop], this.id_);
  };
  PolyfillWeakMap.prototype['delete'] = function(key) {
    if (!$jscomp.owns(key, prop) || !$jscomp.owns(key[prop], this.id_)) {
      return false;
    }
    return delete key[prop][this.id_];
  };
  return PolyfillWeakMap;
}, 'es6', 'es3');
$jscomp.MapEntry = function() {
  this.previous;
  this.next;
  this.head;
  this.key;
  this.value;
};
$jscomp.polyfill('Map', function(NativeMap) {
  function isConformant() {
    if ($jscomp.ASSUME_NO_NATIVE_MAP || !NativeMap || typeof NativeMap != 'function' || !NativeMap.prototype.entries || typeof Object.seal != 'function') {
      return false;
    }
    try {
      NativeMap = NativeMap;
      var key = Object.seal({x:4});
      var map = new NativeMap($jscomp.makeIterator([[key, 's']]));
      if (map.get(key) != 's' || map.size != 1 || map.get({x:4}) || map.set({x:4}, 't') != map || map.size != 2) {
        return false;
      }
      var iter = map.entries();
      var item = iter.next();
      if (item.done || item.value[0] != key || item.value[1] != 's') {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0].x != 4 || item.value[1] != 't' || !iter.next().done) {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeMap && $jscomp.ES6_CONFORMANCE) {
      return NativeMap;
    }
  } else {
    if (isConformant()) {
      return NativeMap;
    }
  }
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  var idMap = new WeakMap;
  var PolyfillMap = function(opt_iterable) {
    this.data_ = {};
    this.head_ = createHead();
    this.size = 0;
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.set(item[0], item[1]);
      }
    }
  };
  PolyfillMap.prototype.set = function(key, value) {
    key = key === 0 ? 0 : key;
    var r = maybeGetEntry(this, key);
    if (!r.list) {
      r.list = this.data_[r.id] = [];
    }
    if (!r.entry) {
      r.entry = {next:this.head_, previous:this.head_.previous, head:this.head_, key:key, value:value};
      r.list.push(r.entry);
      this.head_.previous.next = r.entry;
      this.head_.previous = r.entry;
      this.size++;
    } else {
      r.entry.value = value;
    }
    return this;
  };
  PolyfillMap.prototype['delete'] = function(key) {
    var r = maybeGetEntry(this, key);
    if (r.entry && r.list) {
      r.list.splice(r.index, 1);
      if (!r.list.length) {
        delete this.data_[r.id];
      }
      r.entry.previous.next = r.entry.next;
      r.entry.next.previous = r.entry.previous;
      r.entry.head = null;
      this.size--;
      return true;
    }
    return false;
  };
  PolyfillMap.prototype.clear = function() {
    this.data_ = {};
    this.head_ = this.head_.previous = createHead();
    this.size = 0;
  };
  PolyfillMap.prototype.has = function(key) {
    return !!maybeGetEntry(this, key).entry;
  };
  PolyfillMap.prototype.get = function(key) {
    var entry = maybeGetEntry(this, key).entry;
    return entry && entry.value;
  };
  PolyfillMap.prototype.entries = function() {
    return makeIterator(this, function(entry) {
      return [entry.key, entry.value];
    });
  };
  PolyfillMap.prototype.keys = function() {
    return makeIterator(this, function(entry) {
      return entry.key;
    });
  };
  PolyfillMap.prototype.values = function() {
    return makeIterator(this, function(entry) {
      return entry.value;
    });
  };
  PolyfillMap.prototype.forEach = function(callback, opt_thisArg) {
    var iter = this.entries();
    var item;
    while (!(item = iter.next()).done) {
      var entry = item.value;
      callback.call(opt_thisArg, entry[1], entry[0], this);
    }
  };
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  PolyfillMap.prototype[Symbol.iterator] = PolyfillMap.prototype.entries;
  var maybeGetEntry = function(map, key) {
    var id = getId(key);
    var list = map.data_[id];
    if (list && $jscomp.owns(map.data_, id)) {
      for (var index = 0; index < list.length; index++) {
        var entry = list[index];
        if (key !== key && entry.key !== entry.key || key === entry.key) {
          return {id:id, list:list, index:index, entry:entry};
        }
      }
    }
    return {id:id, list:list, index:-1, entry:undefined};
  };
  var makeIterator = function(map, func) {
    var entry = map.head_;
    return $jscomp.iteratorPrototype(function() {
      if (entry) {
        while (entry.head != map.head_) {
          entry = entry.previous;
        }
        while (entry.next != entry.head) {
          entry = entry.next;
          return {done:false, value:func(entry)};
        }
        entry = null;
      }
      return {done:true, value:void 0};
    });
  };
  var createHead = function() {
    var head = {};
    head.previous = head.next = head.head = head;
    return head;
  };
  var mapIndex = 0;
  var getId = function(obj) {
    var type = obj && typeof obj;
    if (type == 'object' || type == 'function') {
      obj = obj;
      if (!idMap.has(obj)) {
        var id = '' + ++mapIndex;
        idMap.set(obj, id);
        return id;
      }
      return idMap.get(obj);
    }
    return 'p_' + obj;
  };
  return PolyfillMap;
}, 'es6', 'es3');
$jscomp.polyfill('Math.acosh', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    return Math.log(x + Math.sqrt(x * x - 1));
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.asinh', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x === 0) {
      return x;
    }
    var y = Math.log(Math.abs(x) + Math.sqrt(x * x + 1));
    return x < 0 ? -y : y;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.log1p', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x < 0.25 && x > -0.25) {
      var y = x;
      var d = 1;
      var z = x;
      var zPrev = 0;
      var s = 1;
      while (zPrev != z) {
        y *= x;
        s *= -1;
        z = (zPrev = z) + s * y / ++d;
      }
      return z;
    }
    return Math.log(1 + x);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.atanh', function(orig) {
  if (orig) {
    return orig;
  }
  var log1p = Math.log1p;
  var polyfill = function(x) {
    x = Number(x);
    return (log1p(x) - log1p(-x)) / 2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.cbrt', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    if (x === 0) {
      return x;
    }
    x = Number(x);
    var y = Math.pow(Math.abs(x), 1 / 3);
    return x < 0 ? -y : y;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.clz32', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x) >>> 0;
    if (x === 0) {
      return 32;
    }
    var result = 0;
    if ((x & 4294901760) === 0) {
      x <<= 16;
      result += 16;
    }
    if ((x & 4278190080) === 0) {
      x <<= 8;
      result += 8;
    }
    if ((x & 4026531840) === 0) {
      x <<= 4;
      result += 4;
    }
    if ((x & 3221225472) === 0) {
      x <<= 2;
      result += 2;
    }
    if ((x & 2147483648) === 0) {
      result++;
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.cosh', function(orig) {
  if (orig) {
    return orig;
  }
  var exp = Math.exp;
  var polyfill = function(x) {
    x = Number(x);
    return (exp(x) + exp(-x)) / 2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.expm1', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x < .25 && x > -.25) {
      var y = x;
      var d = 1;
      var z = x;
      var zPrev = 0;
      while (zPrev != z) {
        y *= x / ++d;
        z = (zPrev = z) + y;
      }
      return z;
    }
    return Math.exp(x) - 1;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.hypot', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x, y, var_args) {
    x = Number(x);
    y = Number(y);
    var i, z, sum;
    var max = Math.max(Math.abs(x), Math.abs(y));
    for (i = 2; i < arguments.length; i++) {
      max = Math.max(max, Math.abs(arguments[i]));
    }
    if (max > 1e100 || max < 1e-100) {
      if (!max) {
        return max;
      }
      x = x / max;
      y = y / max;
      sum = x * x + y * y;
      for (i = 2; i < arguments.length; i++) {
        z = Number(arguments[i]) / max;
        sum += z * z;
      }
      return Math.sqrt(sum) * max;
    } else {
      sum = x * x + y * y;
      for (i = 2; i < arguments.length; i++) {
        z = Number(arguments[i]);
        sum += z * z;
      }
      return Math.sqrt(sum);
    }
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.imul', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(a, b) {
    a = Number(a);
    b = Number(b);
    var ah = a >>> 16 & 65535;
    var al = a & 65535;
    var bh = b >>> 16 & 65535;
    var bl = b & 65535;
    var lh = ah * bl + al * bh << 16 >>> 0;
    return al * bl + lh | 0;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.log10', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return Math.log(x) / Math.LN10;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.log2', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return Math.log(x) / Math.LN2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.sign', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    return x === 0 || isNaN(x) ? x : x > 0 ? 1 : -1;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.sinh', function(orig) {
  if (orig) {
    return orig;
  }
  var exp = Math.exp;
  var polyfill = function(x) {
    x = Number(x);
    if (x === 0) {
      return x;
    }
    return (exp(x) - exp(-x)) / 2;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.tanh', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (x === 0) {
      return x;
    }
    var y = Math.exp(-2 * Math.abs(x));
    var z = (1 - y) / (1 + y);
    return x < 0 ? -z : z;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Math.trunc', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    x = Number(x);
    if (isNaN(x) || x === Infinity || x === -Infinity || x === 0) {
      return x;
    }
    var y = Math.floor(Math.abs(x));
    return x < 0 ? -y : y;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.EPSILON', function(orig) {
  return Math.pow(2, -52);
}, 'es6', 'es3');
$jscomp.polyfill('Number.MAX_SAFE_INTEGER', function() {
  return 9007199254740991;
}, 'es6', 'es3');
$jscomp.polyfill('Number.MIN_SAFE_INTEGER', function() {
  return -9007199254740991;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isFinite', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    if (typeof x !== 'number') {
      return false;
    }
    return !isNaN(x) && x !== Infinity && x !== -Infinity;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isInteger', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    if (!Number.isFinite(x)) {
      return false;
    }
    return x === Math.floor(x);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isNaN', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return typeof x === 'number' && isNaN(x);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.isSafeInteger', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(x) {
    return Number.isInteger(x) && Math.abs(x) <= Number.MAX_SAFE_INTEGER;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Number.parseFloat', function(orig) {
  return orig || parseFloat;
}, 'es6', 'es3');
$jscomp.polyfill('Number.parseInt', function(orig) {
  return orig || parseInt;
}, 'es6', 'es3');
$jscomp.assign = typeof Object.assign == 'function' ? Object.assign : function(target, var_args) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    if (!source) {
      continue;
    }
    for (var key in source) {
      if ($jscomp.owns(source, key)) {
        target[key] = source[key];
      }
    }
  }
  return target;
};
$jscomp.polyfill('Object.assign', function(orig) {
  return orig || $jscomp.assign;
}, 'es6', 'es3');
$jscomp.polyfill('Object.entries', function(orig) {
  if (orig) {
    return orig;
  }
  var entries = function(obj) {
    var result = [];
    for (var key in obj) {
      if ($jscomp.owns(obj, key)) {
        result.push([key, obj[key]]);
      }
    }
    return result;
  };
  return entries;
}, 'es8', 'es3');
$jscomp.polyfill('Object.getOwnPropertySymbols', function(orig) {
  if (orig) {
    return orig;
  }
  return function() {
    return [];
  };
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.ownKeys', function(orig) {
  if (orig) {
    return orig;
  }
  var symbolPrefix = 'jscomp_symbol_';
  function isSymbol(key) {
    return key.substring(0, symbolPrefix.length) == symbolPrefix;
  }
  var polyfill = function(target) {
    var keys = [];
    var names = Object.getOwnPropertyNames(target);
    var symbols = Object.getOwnPropertySymbols(target);
    for (var i = 0; i < names.length; i++) {
      (isSymbol(names[i]) ? symbols : keys).push(names[i]);
    }
    return keys.concat(symbols);
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Object.getOwnPropertyDescriptors', function(orig) {
  if (orig) {
    return orig;
  }
  var getOwnPropertyDescriptors = function(obj) {
    var result = {};
    var keys = Reflect.ownKeys(obj);
    for (var i = 0; i < keys.length; i++) {
      result[keys[i]] = Object.getOwnPropertyDescriptor(obj, keys[i]);
    }
    return result;
  };
  return getOwnPropertyDescriptors;
}, 'es8', 'es5');
$jscomp.polyfill('Object.setPrototypeOf', function(orig) {
  return orig || $jscomp.setPrototypeOf;
}, 'es6', 'es5');
$jscomp.polyfill('Object.values', function(orig) {
  if (orig) {
    return orig;
  }
  var values = function(obj) {
    var result = [];
    for (var key in obj) {
      if ($jscomp.owns(obj, key)) {
        result.push(obj[key]);
      }
    }
    return result;
  };
  return values;
}, 'es8', 'es3');
$jscomp.polyfill('Reflect.apply', function(orig) {
  if (orig) {
    return orig;
  }
  var apply = Function.prototype.apply;
  var polyfill = function(target, thisArg, argList) {
    return apply.call(target, thisArg, argList);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.objectCreate = $jscomp.ASSUME_ES5 || typeof Object.create == 'function' ? Object.create : function(prototype) {
  var ctor = function() {
  };
  ctor.prototype = prototype;
  return new ctor;
};
$jscomp.construct = function() {
  function reflectConstructWorks() {
    function Base() {
    }
    function Derived() {
    }
    new Base;
    Reflect.construct(Base, [], Derived);
    return new Base instanceof Base;
  }
  if (typeof Reflect != 'undefined' && Reflect.construct) {
    if (reflectConstructWorks()) {
      return Reflect.construct;
    }
    var brokenConstruct = Reflect.construct;
    var patchedConstruct = function(target, argList, opt_newTarget) {
      var out = brokenConstruct(target, argList);
      if (opt_newTarget) {
        Reflect.setPrototypeOf(out, opt_newTarget.prototype);
      }
      return out;
    };
    return patchedConstruct;
  }
  function construct(target, argList, opt_newTarget) {
    if (opt_newTarget === undefined) {
      opt_newTarget = target;
    }
    var proto = opt_newTarget.prototype || Object.prototype;
    var obj = $jscomp.objectCreate(proto);
    var apply = Function.prototype.apply;
    var out = apply.call(target, obj, argList);
    return out || obj;
  }
  return construct;
}();
$jscomp.polyfill('Reflect.construct', function(orig) {
  return $jscomp.construct;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.defineProperty', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey, attributes) {
    try {
      Object.defineProperty(target, propertyKey, attributes);
      var desc = Object.getOwnPropertyDescriptor(target, propertyKey);
      if (!desc) {
        return false;
      }
      return desc.configurable === (attributes.configurable || false) && desc.enumerable === (attributes.enumerable || false) && ('value' in desc ? desc.value === attributes.value && desc.writable === (attributes.writable || false) : desc.get === attributes.get && desc.set === attributes.set);
    } catch (err) {
      return false;
    }
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.deleteProperty', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey) {
    if (!$jscomp.owns(target, propertyKey)) {
      return true;
    }
    try {
      return delete target[propertyKey];
    } catch (err) {
      return false;
    }
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.getOwnPropertyDescriptor', function(orig) {
  return orig || Object.getOwnPropertyDescriptor;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.getPrototypeOf', function(orig) {
  return orig || Object.getPrototypeOf;
}, 'es6', 'es5');
$jscomp.findDescriptor = function(target, propertyKey) {
  var obj = target;
  while (obj) {
    var property = Reflect.getOwnPropertyDescriptor(obj, propertyKey);
    if (property) {
      return property;
    }
    obj = Reflect.getPrototypeOf(obj);
  }
  return undefined;
};
$jscomp.polyfill('Reflect.get', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey, opt_receiver) {
    if (arguments.length <= 2) {
      return target[propertyKey];
    }
    var property = $jscomp.findDescriptor(target, propertyKey);
    if (property) {
      return property.get ? property.get.call(opt_receiver) : property.value;
    }
    return undefined;
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.has', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey) {
    return propertyKey in target;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.isExtensible', function(orig) {
  if (orig) {
    return orig;
  }
  if ($jscomp.ASSUME_ES5 || typeof Object.isExtensible == 'function') {
    return Object.isExtensible;
  }
  return function() {
    return true;
  };
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.preventExtensions', function(orig) {
  if (orig) {
    return orig;
  }
  if (!($jscomp.ASSUME_ES5 || typeof Object.preventExtensions == 'function')) {
    return function() {
      return false;
    };
  }
  var polyfill = function(target) {
    Object.preventExtensions(target);
    return !Object.isExtensible(target);
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('Reflect.set', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(target, propertyKey, value, opt_receiver) {
    var property = $jscomp.findDescriptor(target, propertyKey);
    if (!property) {
      if (Reflect.isExtensible(target)) {
        target[propertyKey] = value;
        return true;
      }
      return false;
    }
    if (property.set) {
      property.set.call(arguments.length > 3 ? opt_receiver : target, value);
      return true;
    } else {
      if (property.writable && !Object.isFrozen(target)) {
        target[propertyKey] = value;
        return true;
      }
    }
    return false;
  };
  return polyfill;
}, 'es6', 'es5');
$jscomp.polyfill('Reflect.setPrototypeOf', function(orig) {
  if (orig) {
    return orig;
  } else {
    if ($jscomp.setPrototypeOf) {
      var setPrototypeOf = $jscomp.setPrototypeOf;
      var polyfill = function(target, proto) {
        try {
          setPrototypeOf(target, proto);
          return true;
        } catch (e) {
          return false;
        }
      };
      return polyfill;
    } else {
      return null;
    }
  }
}, 'es6', 'es5');
$jscomp.polyfill('Set', function(NativeSet) {
  function isConformant() {
    if ($jscomp.ASSUME_NO_NATIVE_SET || !NativeSet || typeof NativeSet != 'function' || !NativeSet.prototype.entries || typeof Object.seal != 'function') {
      return false;
    }
    try {
      NativeSet = NativeSet;
      var value = Object.seal({x:4});
      var set = new NativeSet($jscomp.makeIterator([value]));
      if (!set.has(value) || set.size != 1 || set.add(value) != set || set.size != 1 || set.add({x:4}) != set || set.size != 2) {
        return false;
      }
      var iter = set.entries();
      var item = iter.next();
      if (item.done || item.value[0] != value || item.value[1] != value) {
        return false;
      }
      item = iter.next();
      if (item.done || item.value[0] == value || item.value[0].x != 4 || item.value[1] != item.value[0]) {
        return false;
      }
      return iter.next().done;
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeSet && $jscomp.ES6_CONFORMANCE) {
      return NativeSet;
    }
  } else {
    if (isConformant()) {
      return NativeSet;
    }
  }
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  var PolyfillSet = function(opt_iterable) {
    this.map_ = new Map;
    if (opt_iterable) {
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.add(item);
      }
    }
    this.size = this.map_.size;
  };
  PolyfillSet.prototype.add = function(value) {
    value = value === 0 ? 0 : value;
    this.map_.set(value, value);
    this.size = this.map_.size;
    return this;
  };
  PolyfillSet.prototype['delete'] = function(value) {
    var result = this.map_['delete'](value);
    this.size = this.map_.size;
    return result;
  };
  PolyfillSet.prototype.clear = function() {
    this.map_.clear();
    this.size = 0;
  };
  PolyfillSet.prototype.has = function(value) {
    return this.map_.has(value);
  };
  PolyfillSet.prototype.entries = function() {
    return this.map_.entries();
  };
  PolyfillSet.prototype.values = function() {
    return this.map_.values();
  };
  PolyfillSet.prototype.keys = PolyfillSet.prototype.values;
  $jscomp.initSymbol();
  $jscomp.initSymbolIterator();
  PolyfillSet.prototype[Symbol.iterator] = PolyfillSet.prototype.values;
  PolyfillSet.prototype.forEach = function(callback, opt_thisArg) {
    var set = this;
    this.map_.forEach(function(value) {
      return callback.call(opt_thisArg, value, value, set);
    });
  };
  return PolyfillSet;
}, 'es6', 'es3');
$jscomp.checkStringArgs = function(thisArg, arg, func) {
  if (thisArg == null) {
    throw new TypeError("The 'this' value for String.prototype." + func + ' must not be null or undefined');
  }
  if (arg instanceof RegExp) {
    throw new TypeError('First argument to String.prototype.' + func + ' must not be a regular expression');
  }
  return thisArg + '';
};
$jscomp.polyfill('String.prototype.codePointAt', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(position) {
    var string = $jscomp.checkStringArgs(this, null, 'codePointAt');
    var size = string.length;
    position = Number(position) || 0;
    if (!(position >= 0 && position < size)) {
      return void 0;
    }
    position = position | 0;
    var first = string.charCodeAt(position);
    if (first < 55296 || first > 56319 || position + 1 === size) {
      return first;
    }
    var second = string.charCodeAt(position + 1);
    if (second < 56320 || second > 57343) {
      return first;
    }
    return (first - 55296) * 1024 + second + 9216;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.endsWith', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(searchString, opt_position) {
    var string = $jscomp.checkStringArgs(this, searchString, 'endsWith');
    searchString = searchString + '';
    if (opt_position === void 0) {
      opt_position = string.length;
    }
    var i = Math.max(0, Math.min(opt_position | 0, string.length));
    var j = searchString.length;
    while (j > 0 && i > 0) {
      if (string[--i] != searchString[--j]) {
        return false;
      }
    }
    return j <= 0;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.fromCodePoint', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(var_args) {
    var result = '';
    for (var i = 0; i < arguments.length; i++) {
      var code = Number(arguments[i]);
      if (code < 0 || code > 1114111 || code !== Math.floor(code)) {
        throw new RangeError('invalid_code_point ' + code);
      }
      if (code <= 65535) {
        result += String.fromCharCode(code);
      } else {
        code -= 65536;
        result += String.fromCharCode(code >>> 10 & 1023 | 55296);
        result += String.fromCharCode(code & 1023 | 56320);
      }
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.includes', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(searchString, opt_position) {
    var string = $jscomp.checkStringArgs(this, searchString, 'includes');
    return string.indexOf(searchString, opt_position || 0) !== -1;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.polyfill('String.prototype.repeat', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(copies) {
    var string = $jscomp.checkStringArgs(this, null, 'repeat');
    if (copies < 0 || copies > 1342177279) {
      throw new RangeError('Invalid count value');
    }
    copies = copies | 0;
    var result = '';
    while (copies) {
      if (copies & 1) {
        result += string;
      }
      if (copies >>>= 1) {
        string += string;
      }
    }
    return result;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.stringPadding = function(padString, padLength) {
  var padding = padString !== undefined ? String(padString) : ' ';
  if (!(padLength > 0) || !padding) {
    return '';
  }
  var repeats = Math.ceil(padLength / padding.length);
  return padding.repeat(repeats).substring(0, padLength);
};
$jscomp.polyfill('String.prototype.padEnd', function(orig) {
  if (orig) {
    return orig;
  }
  var padEnd = function(targetLength, opt_padString) {
    var string = $jscomp.checkStringArgs(this, null, 'padStart');
    var padLength = targetLength - string.length;
    return string + $jscomp.stringPadding(opt_padString, padLength);
  };
  return padEnd;
}, 'es8', 'es3');
$jscomp.polyfill('String.prototype.padStart', function(orig) {
  if (orig) {
    return orig;
  }
  var padStart = function(targetLength, opt_padString) {
    var string = $jscomp.checkStringArgs(this, null, 'padStart');
    var padLength = targetLength - string.length;
    return $jscomp.stringPadding(opt_padString, padLength) + string;
  };
  return padStart;
}, 'es8', 'es3');
$jscomp.polyfill('String.prototype.startsWith', function(orig) {
  if (orig) {
    return orig;
  }
  var polyfill = function(searchString, opt_position) {
    var string = $jscomp.checkStringArgs(this, searchString, 'startsWith');
    searchString = searchString + '';
    var strLen = string.length;
    var searchLen = searchString.length;
    var i = Math.max(0, Math.min(opt_position | 0, string.length));
    var j = 0;
    while (j < searchLen && i < strLen) {
      if (string[i++] != searchString[j++]) {
        return false;
      }
    }
    return j >= searchLen;
  };
  return polyfill;
}, 'es6', 'es3');
$jscomp.arrayFromIterator = function(iterator) {
  var i;
  var arr = [];
  while (!(i = iterator.next()).done) {
    arr.push(i.value);
  }
  return arr;
};
$jscomp.arrayFromIterable = function(iterable) {
  if (iterable instanceof Array) {
    return iterable;
  } else {
    return $jscomp.arrayFromIterator($jscomp.makeIterator(iterable));
  }
};
$jscomp.inherits = function(childCtor, parentCtor) {
  childCtor.prototype = $jscomp.objectCreate(parentCtor.prototype);
  childCtor.prototype.constructor = childCtor;
  if ($jscomp.setPrototypeOf) {
    var setPrototypeOf = $jscomp.setPrototypeOf;
    setPrototypeOf(childCtor, parentCtor);
  } else {
    for (var p in parentCtor) {
      if (p == 'prototype') {
        continue;
      }
      if (Object.defineProperties) {
        var descriptor = Object.getOwnPropertyDescriptor(parentCtor, p);
        if (descriptor) {
          Object.defineProperty(childCtor, p, descriptor);
        }
      } else {
        childCtor[p] = parentCtor[p];
      }
    }
  }
  childCtor.superClass_ = parentCtor.prototype;
};
$jscomp.polyfill('WeakSet', function(NativeWeakSet) {
  function isConformant() {
    if (!NativeWeakSet || !Object.seal) {
      return false;
    }
    try {
      var x = Object.seal({});
      var y = Object.seal({});
      var set = new NativeWeakSet([x]);
      if (!set.has(x) || set.has(y)) {
        return false;
      }
      set['delete'](x);
      set.add(y);
      return !set.has(x) && set.has(y);
    } catch (err) {
      return false;
    }
  }
  if ($jscomp.USE_PROXY_FOR_ES6_CONFORMANCE_CHECKS) {
    if (NativeWeakSet && $jscomp.ES6_CONFORMANCE) {
      return NativeWeakSet;
    }
  } else {
    if (isConformant()) {
      return NativeWeakSet;
    }
  }
  var PolyfillWeakSet = function(opt_iterable) {
    this.map_ = new WeakMap;
    if (opt_iterable) {
      $jscomp.initSymbol();
      $jscomp.initSymbolIterator();
      var iter = $jscomp.makeIterator(opt_iterable);
      var entry;
      while (!(entry = iter.next()).done) {
        var item = entry.value;
        this.add(item);
      }
    }
  };
  PolyfillWeakSet.prototype.add = function(elem) {
    this.map_.set(elem, true);
    return this;
  };
  PolyfillWeakSet.prototype.has = function(elem) {
    return this.map_.has(elem);
  };
  PolyfillWeakSet.prototype['delete'] = function(elem) {
    return this.map_['delete'](elem);
  };
  return PolyfillWeakSet;
}, 'es6', 'es3');
try {
  if (Array.prototype.values.toString().indexOf('[native code]') == -1) {
    delete Array.prototype.values;
  }
} catch (e) {
}
Ext.define('GeoExt.util.Version', {statics:{isOl3:function() {
  return !!(ol.animation && ol.Map.prototype.beforeRender);
}, isOl4:function() {
  return !this.isOl3();
}}});
Ext.define('GeoExt.mixin.SymbolCheck', {extend:'Ext.Mixin', inheritableStatics:{_checked:{}, check:function(cls) {
  var me = this;
  var proto = cls.prototype;
  var olSymbols = proto && proto.symbols;
  var clsName = proto && proto['$className'];
  if (!olSymbols) {
    return;
  }
  Ext.each(olSymbols, function(olSymbol) {
    olSymbol = me.normalizeSymbol(olSymbol);
    me.checkSymbol(olSymbol, clsName);
  });
}, normalizeSymbol:function() {
  var hashRegEx = /#/;
  var colonRegEx = /::/;
  var normalizeFunction = function(symbolStr) {
    if (hashRegEx.test(symbolStr)) {
      symbolStr = symbolStr.replace(hashRegEx, '.prototype.');
    } else {
      if (colonRegEx.test(symbolStr)) {
        symbolStr = symbolStr.replace(colonRegEx, '.');
      }
    }
    return symbolStr;
  };
  return normalizeFunction;
}(), checkSymbol:function(symbolStr, clsName) {
  var isDefined = this.isDefinedSymbol(symbolStr);
  if (!isDefined) {
    Ext.log.warn('The class "' + (clsName || 'unknown') + '" ' + 'depends on the external symbol "' + symbolStr + '", ' + 'which does not seem to exist.');
  }
}, isDefinedSymbol:function(symbolStr) {
  var checkedCache = this._checked;
  if (Ext.isDefined(checkedCache[symbolStr])) {
    return checkedCache[symbolStr];
  }
  var parts = symbolStr.split('.');
  var lastIdx = parts.length - 1;
  var curSymbol = Ext.getWin().dom;
  var isDefined = false;
  var intermediateSymb = '';
  Ext.each(parts, function(part, idx) {
    if (intermediateSymb !== '') {
      intermediateSymb += '.';
    }
    intermediateSymb += part;
    if (curSymbol[part]) {
      checkedCache[intermediateSymb] = true;
      curSymbol = curSymbol[part];
      if (lastIdx === idx) {
        isDefined = true;
      }
    } else {
      if (lastIdx === idx) {
        try {
          var parentObj = Ext.Object.chain(curSymbol);
          var instance = new parentObj.constructor;
          if (typeof instance[part] === 'function') {
            checkedCache[intermediateSymb] = true;
            isDefined = true;
          }
        } catch (e$0) {
          Ext.log.warn('Unable to create instance or access method: ' + intermediateSymb, e$0);
          checkedCache[intermediateSymb] = false;
        }
      } else {
        checkedCache[intermediateSymb] = false;
        return false;
      }
    }
  });
  checkedCache[symbolStr] = isDefined;
  return isDefined;
}}, onClassMixedIn:function(cls) {
  GeoExt.mixin.SymbolCheck.check(cls);
}});
Ext.define('GeoExt.component.FeatureRenderer', {extend:'Ext.Component', alias:'widget.gx_renderer', requires:['GeoExt.util.Version'], mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.extent.getCenter', 'ol.extent.getWidth', 'ol.extent.getHeight', 'ol.Feature', 'ol.Feature#getGeometry', 'ol.Feature#setStyle', 'ol.geom.Geometry#getExtent', 'ol.geom.Point', 'ol.geom.LineString', 'ol.geom.Polygon', 'ol.layer.Vector', 'ol.layer.Vector#getSource', 'ol.Map#getSize', 'ol.Map#getView', 'ol.Map#setView', 
'ol.Map#updateSize', 'ol.proj.Projection', 'ol.source.Vector', 'ol.source.Vector#addFeature', 'ol.View', 'ol.View#fit'], config:{imgCls:'', minWidth:20, minHeight:20, resolution:1, feature:undefined, pointFeature:undefined, lineFeature:undefined, polygonFeature:undefined, textFeature:undefined, symbolizers:undefined, symbolType:'Polygon'}, inheritableStatics:{determineStyle:function(record) {
  var feature = record.getFeature();
  return feature.getStyle() || feature.getStyleFunction() || (record.store ? record.store.layer.getStyle() : null);
}}, initComponent:function() {
  var me = this;
  var id = me.getId();
  me.autoEl = {id:id, tag:'div', 'class':this.getImgCls()};
  if (!me.getLineFeature()) {
    me.setLineFeature(new ol.Feature({geometry:new ol.geom.LineString([[-8, -3], [-3, 3], [3, -3], [8, 3]])}));
  }
  if (!me.getPointFeature()) {
    me.setPointFeature(new ol.Feature({geometry:new ol.geom.Point([0, 0])}));
  }
  if (!me.getPolygonFeature()) {
    me.setPolygonFeature(new ol.Feature({geometry:new ol.geom.Polygon([[[-8, -4], [-6, -6], [6, -6], [8, -4], [8, 4], [6, 6], [-6, 6], [-8, 4]]])}));
  }
  if (!me.getTextFeature()) {
    me.setTextFeature(new ol.Feature({geometry:new ol.geom.Point([0, 0])}));
  }
  me.map = new ol.Map({controls:[], interactions:[], layers:[new ol.layer.Vector({source:new ol.source.Vector})]});
  var feature = me.getFeature();
  if (!feature) {
    me.setFeature(me['get' + me.getSymbolType() + 'Feature']());
  } else {
    me.applyFeature(feature);
  }
  me.callParent();
}, onRender:function() {
  this.callParent(arguments);
  this.drawFeature();
}, afterRender:function() {
  this.callParent(arguments);
  this.initCustomEvents();
}, initCustomEvents:function() {
  var me = this;
  me.clearCustomEvents();
  me.el.on('click', me.onClick, me);
}, clearCustomEvents:function() {
  var el = this.el;
  if (el && el.clearListeners) {
    el.clearListeners();
  }
}, onClick:function() {
  this.fireEvent('click', this);
}, beforeDestroy:function() {
  var me = this;
  me.clearCustomEvents();
  if (me.map) {
    me.map.setTarget(null);
  }
}, onResize:function() {
  this.setRendererDimensions();
  this.callParent(arguments);
}, drawFeature:function() {
  var me = this;
  me.map.setTarget(me.el.id);
  me.setRendererDimensions();
}, setRendererDimensions:function() {
  var me = this;
  var gb = me.feature.getGeometry().getExtent();
  var gw = ol.extent.getWidth(gb);
  var gh = ol.extent.getHeight(gb);
  var resolution = me.initialConfig.resolution;
  if (!resolution) {
    resolution = Math.max(gw / me.width || 0, gh / me.height || 0) || 1;
  }
  me.map.setView(new ol.View({minResolution:resolution, maxResolution:resolution, projection:new ol.proj.Projection({code:'', units:'pixels'})}));
  var width = Math.max(me.width || me.getMinWidth(), gw / resolution);
  var height = Math.max(me.height || me.getMinHeight(), gh / resolution);
  var center = ol.extent.getCenter(gb);
  var bhalfw = width * resolution / 2;
  var bhalfh = height * resolution / 2;
  var bounds = [center[0] - bhalfw, center[1] - bhalfh, center[0] + bhalfw, center[1] + bhalfh];
  me.el.setSize(Math.round(width), Math.round(height));
  me.map.updateSize();
  if (GeoExt.util.Version.isOl3()) {
    me.map.getView().fit(bounds, me.map.getSize());
  } else {
    me.map.getView().fit(bounds);
  }
}, applySymbolizers:function(symbolizers) {
  var feature = this.getFeature();
  if (feature && symbolizers) {
    feature.setStyle(symbolizers);
  }
  return symbolizers;
}, applyFeature:function(feature) {
  var symbolizers = this.getSymbolizers();
  if (feature && symbolizers) {
    feature.setStyle(symbolizers);
  }
  if (this.map) {
    var source = this.map.getLayers().item(0).getSource();
    source.clear();
    source.addFeature(feature);
  }
  return feature;
}, update:function(options) {
  if (options.feature) {
    this.setFeature(options.feature);
  }
  if (options.symbolizers) {
    this.setSymbolizers(options.symbolizers);
  }
}});
Ext.define('GeoExt.data.model.Base', {extend:'Ext.data.Model', requires:['Ext.data.identifier.Uuid'], identifier:'uuid', schema:{id:'geoext-schema', namespace:'GeoExt.data.model'}, inheritableStatics:{loadRawData:function(data) {
  var me = this;
  var result = me.getProxy().getReader().readRecords(data || {});
  var records = result.getRecords();
  var success = result.getSuccess();
  if (success && records.length) {
    return records[0];
  }
}}});
Ext.define('GeoExt.data.model.Layer', {extend:'GeoExt.data.model.Base', mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.layer.Group', 'ol.layer.Base', 'ol.layer.Base#get'], textProperty:'name', descriptionProperty:'description', unnamedLayerText:'Unnamed Layer', unnamedGroupLayerText:'Unnamed Group Layer', synchronizedProperties:['title'], fields:[{name:'isLayerGroup', type:'boolean', persist:false, convert:function(v, record) {
  var layer = record.getOlLayer();
  if (layer) {
    return layer instanceof ol.layer.Group;
  }
  return undefined;
}}, {name:'text', type:'string', persist:false, convert:function(v, record) {
  var name = v;
  var defaultName;
  var textProp;
  if (!name) {
    textProp = record.textProperty;
    defaultName = record.get('isLayerGroup') ? record.unnamedGroupLayerText : record.unnamedLayerText;
    name = record.getOlLayerProp(textProp, defaultName);
  }
  return name;
}}, {name:'opacity', type:'number', persist:false, convert:function(v, record) {
  return record.getOlLayerProp('opacity');
}}, {name:'minResolution', type:'number', persist:false, convert:function(v, record) {
  return record.getOlLayerProp('minResolution');
}}, {name:'maxResolution', type:'number', persist:false, convert:function(v, record) {
  return record.getOlLayerProp('maxResolution');
}}, {name:'qtip', type:'string', persist:false, convert:function(v, record) {
  return record.getOlLayerProp(record.descriptionProperty, '');
}}, {name:'qtitle', type:'string', persist:false, convert:function(v, record) {
  return record.get('text');
}}], proxy:{type:'memory', reader:{type:'json'}}, getOlLayer:function() {
  if (this.data instanceof ol.layer.Base) {
    return this.data;
  }
}, getOlLayerProp:function(prop, defaultValue) {
  var layer = this.getOlLayer();
  var value = layer ? layer.get(prop) : undefined;
  return value !== undefined ? value : defaultValue;
}});
Ext.define('GeoExt.data.store.Layers', {extend:'Ext.data.Store', alternateClassName:['GeoExt.data.LayerStore'], requires:['GeoExt.data.model.Layer'], mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.Collection#clear', 'ol.Collection#forEach', 'ol.Collection#getArray', 'ol.Collection#insertAt', 'ol.Collection#push', 'ol.Collection#remove', 'ol.layer.Layer', 'ol.layer.Layer#get', 'ol.layer.Layer#set', 'ol.Map', 'ol.Map#getLayers'], model:'GeoExt.data.model.Layer', config:{map:null, layers:null, changeLayerFilterFn:null}, 
constructor:function(config) {
  var me = this;
  me.onAddLayer = me.onAddLayer.bind(me);
  me.onRemoveLayer = me.onRemoveLayer.bind(me);
  me.onChangeLayer = me.onChangeLayer.bind(me);
  me.callParent([config]);
  if (config.map) {
    this.bindMap(config.map);
  } else {
    if (config.layers) {
      this.bindLayers(config.layers);
    }
  }
}, bindLayers:function(layers, map) {
  var me = this;
  if (!me.layers) {
    me.layers = layers;
  }
  if (me.layers instanceof ol.layer.Group) {
    me.layers = me.layers.getLayers();
  }
  var mapLayers = me.layers;
  mapLayers.forEach(function(layer) {
    me.loadRawData(layer, true);
  });
  mapLayers.forEach(function(layer) {
    me.bindLayer(layer, me.getByLayer(layer));
  });
  mapLayers.on('add', me.onAddLayer);
  mapLayers.on('remove', me.onRemoveLayer);
  me.on({load:me.onLoad, clear:me.onClear, add:me.onAdd, remove:me.onRemove, update:me.onStoreUpdate, scope:me});
  me.data.on({replace:me.onReplace, scope:me});
  me.fireEvent('bind', me, map);
}, bindMap:function(map) {
  var me = this;
  if (!me.map) {
    me.map = map;
  }
  if (map instanceof ol.Map) {
    var mapLayers = map.getLayers();
    me.bindLayers(mapLayers, map);
  }
}, bindLayer:function(layer, record) {
  var me = this;
  layer.on('propertychange', me.onChangeLayer);
  Ext.Array.forEach(record.synchronizedProperties, function(prop) {
    me.synchronize(record, layer, prop);
  });
}, unbindLayers:function() {
  var me = this;
  if (me.layers) {
    me.layers.un('add', me.onAddLayer);
    me.layers.un('remove', me.onRemoveLayer);
  }
  me.un('load', me.onLoad, me);
  me.un('clear', me.onClear, me);
  me.un('add', me.onAdd, me);
  me.un('remove', me.onRemove, me);
  me.un('update', me.onStoreUpdate, me);
  me.data.un('replace', me.onReplace, me);
}, unbindMap:function() {
  var me = this;
  me.unbindLayers();
  me.map = null;
}, onChangeLayer:function(evt) {
  var layer = evt.target;
  var filter = this.changeLayerFilterFn ? this.changeLayerFilterFn.bind(layer) : undefined;
  var record = this.getByLayer(layer, filter);
  if (record !== undefined) {
    if (evt.key === 'description') {
      record.set('qtip', layer.get('description'));
      if (record.synchronizedProperties.indexOf('description') > -1) {
        this.synchronize(record, layer, 'description');
      }
    } else {
      if (record.synchronizedProperties.indexOf(evt.key) > -1) {
        this.synchronize(record, layer, evt.key);
      } else {
        this.fireEvent('update', this, record, Ext.data.Record.EDIT, null, {});
      }
    }
  }
}, onAddLayer:function(evt) {
  var layer = evt.element;
  var index = this.layers.getArray().indexOf(layer);
  var me = this;
  if (!me._adding) {
    me._adding = true;
    var result = me.proxy.reader.read(layer);
    me.insert(index, result.records);
    delete me._adding;
  }
  me.bindLayer(layer, me.getByLayer(layer));
}, onRemoveLayer:function(evt) {
  var me = this;
  if (!me._removing) {
    var layer = evt.element;
    var rec = me.getByLayer(layer);
    if (rec) {
      me._removing = true;
      layer.un('propertychange', me.onChangeLayer);
      me.remove(rec);
      delete me._removing;
    }
  }
}, onLoad:function(store, records, successful) {
  var me = this;
  if (successful) {
    if (!Ext.isArray(records)) {
      records = [records];
    }
    if (!me._addRecords) {
      me._removing = true;
      me.layers.forEach(function(layer) {
        layer.un('propertychange', me.onChangeLayer);
      });
      me.layers.getLayers().clear();
      delete me._removing;
    }
    var len = records.length;
    if (len > 0) {
      var layers = new Array(len);
      for (var i = 0; i < len; i++) {
        var record = records[i];
        layers[i] = record.getOlLayer();
        me.bindLayer(layers[i], record);
      }
      me._adding = true;
      me.layers.extend(layers);
      delete me._adding;
    }
  }
  delete me._addRecords;
}, onClear:function() {
  var me = this;
  me._removing = true;
  me.layers.forEach(function(layer) {
    layer.un('propertychange', me.onChangeLayer);
  });
  me.layers.clear();
  delete me._removing;
}, onAdd:function(store, records, index) {
  var me = this;
  if (!me._adding) {
    me._adding = true;
    var layer;
    for (var i = 0, ii = records.length; i < ii; ++i) {
      layer = records[i].getOlLayer();
      me.bindLayer(layer, records[i]);
      if (index === 0) {
        me.layers.push(layer);
      } else {
        me.layers.insertAt(index, layer);
      }
    }
    delete me._adding;
  }
}, onRemove:function(store, records) {
  var me = this;
  var record;
  var layer;
  var found;
  var i;
  var ii;
  if (!me._removing) {
    var compareFunc = function(el) {
      if (el === layer) {
        found = true;
      }
    };
    for (i = 0, ii = records.length; i < ii; ++i) {
      record = records[i];
      layer = record.getOlLayer();
      found = false;
      layer.un('propertychange', me.onChangeLayer);
      me.layers.forEach(compareFunc);
      if (found) {
        me._removing = true;
        me.removeMapLayer(record);
        delete me._removing;
      }
    }
  }
}, onStoreUpdate:function(store, record, operation, modifiedFieldNames) {
  var me = this;
  if (operation === Ext.data.Record.EDIT) {
    if (modifiedFieldNames) {
      var layer = record.getOlLayer();
      Ext.Array.forEach(modifiedFieldNames, function(prop) {
        if (record.synchronizedProperties.indexOf(prop) > -1) {
          me.synchronize(layer, record, prop);
        }
      });
    }
  }
}, removeMapLayer:function(record) {
  this.layers.remove(record.getOlLayer());
}, onReplace:function(key, oldRecord) {
  this.removeMapLayer(oldRecord);
}, getByLayer:function(layer, filterFn) {
  var me = this;
  var index;
  if (me.getData()) {
    if (Ext.isFunction(filterFn)) {
      index = me.findBy(filterFn);
    } else {
      index = me.findBy(function(rec) {
        return rec.getOlLayer() === layer;
      });
    }
    if (index > -1) {
      return me.getAt(index);
    }
  }
}, destroy:function() {
  this.unbindMap();
  this.callParent();
}, loadRecords:function(records, options) {
  if (options && options.addRecords) {
    this._addRecords = true;
  }
  this.callParent(arguments);
}, loadRawData:function(data, append) {
  var me = this;
  var result = me.proxy.reader.read(data);
  var records = result.records;
  if (result.success) {
    me.totalCount = result.total;
    me.loadRecords(records, append ? me.addRecordsOptions : undefined);
    me.fireEvent('load', me, records, true);
  }
}, synchronize:function(destination, source, prop) {
  var value = source.get(prop);
  if (value !== destination.get(prop)) {
    destination.set(prop, value);
  }
}});
Ext.define('GeoExt.component.Map', {extend:'Ext.Component', alias:['widget.gx_map', 'widget.gx_component_map'], requires:['GeoExt.data.store.Layers', 'GeoExt.util.Version'], mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.layer.Base', 'ol.Map', 'ol.Map#addLayer', 'ol.Map#getLayers', 'ol.Map#getSize', 'ol.Map#getView', 'ol.Map#removeLayer', 'ol.Map#setTarget', 'ol.Map#setView', 'ol.Map#updateSize', 'ol.View', 'ol.View#calculateExtent', 'ol.View#fit', 'ol.View#getCenter', 'ol.View#setCenter'], stateEvents:['aftermapmove'], 
config:{map:null, pointerRest:false, pointerRestInterval:1000, pointerRestPixelTolerance:3, ignorePointerRestSelectors:[]}, mapRendered:false, layerStore:null, lastPointerPixel:null, isMouseOverMapEl:null, constructor:function(config) {
  var me = this;
  me.callParent([config]);
  if (!(me.getMap() instanceof ol.Map)) {
    var olMap = new ol.Map({view:new ol.View({center:[0, 0], zoom:2})});
    me.setMap(olMap);
  }
  me.layerStore = Ext.create('GeoExt.data.store.Layers', {storeId:me.getId() + '-store', map:me.getMap()});
  me.bindStateOlEvents();
  me.on('resize', me.onResize, me);
}, onResize:function() {
  var me = this;
  if (!me.mapRendered) {
    var el = me.getTargetEl ? me.getTargetEl() : me.element;
    me.getMap().setTarget(el.dom);
    me.mapRendered = true;
  } else {
    me.getMap().updateSize();
  }
}, bufferedPointerMove:Ext.emptyFn, unbufferedPointerMove:function(olEvt) {
  var me = this;
  var tolerance = me.getPointerRestPixelTolerance();
  var pixel = olEvt.pixel;
  if (me.isMouseOverIgnoreEl(olEvt)) {
    return;
  }
  if (!me.isMouseOverMapEl) {
    me.fireEvent('pointerrestout', olEvt);
    return;
  }
  if (me.lastPointerPixel) {
    var deltaX = Math.abs(me.lastPointerPixel[0] - pixel[0]);
    var deltaY = Math.abs(me.lastPointerPixel[1] - pixel[1]);
    if (deltaX > tolerance || deltaY > tolerance) {
      me.lastPointerPixel = pixel;
    } else {
      me.fireEvent('pointerrest', olEvt, me.lastPointerPixel);
      return;
    }
  } else {
    me.lastPointerPixel = pixel;
  }
  me.fireEvent('pointerrest', olEvt, null);
}, isMouseOverIgnoreEl:function() {
  var me = this;
  var selectors = me.getIgnorePointerRestSelectors();
  if (selectors === undefined || selectors.length === 0) {
    return false;
  }
  var hoverEls = Ext.query(':hover');
  return hoverEls.some(function(el) {
    return selectors.some(function(sel) {
      return el.matches(sel);
    });
  });
}, registerPointerRestEvents:function() {
  var me = this;
  var map = me.getMap();
  if (me.bufferedPointerMove === Ext.emptyFn) {
    me.bufferedPointerMove = Ext.Function.createBuffered(me.unbufferedPointerMove, me.getPointerRestInterval(), me);
  }
  map.on('pointermove', me.bufferedPointerMove);
  if (!me.rendered) {
    me.on('afterrender', me.bindOverOutListeners, me);
  } else {
    me.bindOverOutListeners();
  }
}, bindOverOutListeners:function() {
  var me = this;
  var mapEl = me.getTargetEl ? me.getTargetEl() : me.element;
  if (mapEl) {
    mapEl.on({mouseover:me.onMouseOver, mouseout:me.onMouseOut, scope:me});
  }
}, unbindOverOutListeners:function() {
  var me = this;
  var mapEl = me.getTargetEl ? me.getTargetEl() : me.element;
  if (mapEl) {
    mapEl.un({mouseover:me.onMouseOver, mouseout:me.onMouseOut, scope:me});
  }
}, onMouseOver:function() {
  this.isMouseOverMapEl = true;
}, onMouseOut:function() {
  this.isMouseOverMapEl = false;
}, unregisterPointerRestEvents:function() {
  var me = this;
  var map = me.getMap();
  me.unbindOverOutListeners();
  if (map) {
    map.un('pointermove', me.bufferedPointerMove);
  }
  me.bufferedPointerMove = Ext.emptyFn;
}, applyPointerRest:function(val) {
  if (val) {
    this.registerPointerRestEvents();
  } else {
    this.unregisterPointerRestEvents();
  }
  return val;
}, applyPointerRestInterval:function(val) {
  var me = this;
  var isEnabled = me.getPointerRest();
  if (isEnabled) {
    me.setPointerRest(false);
    me.setPointerRest(isEnabled);
  }
  return val;
}, getCenter:function() {
  return this.getMap().getView().getCenter();
}, setCenter:function(center) {
  this.getMap().getView().setCenter(center);
}, getExtent:function() {
  return this.getView().calculateExtent(this.getMap().getSize());
}, setExtent:function(extent) {
  if (GeoExt.util.Version.isOl3()) {
    this.getView().fit(extent, this.getMap().getSize());
  } else {
    this.getView().fit(extent);
  }
}, getLayers:function() {
  return this.getMap().getLayers();
}, addLayer:function(layer) {
  if (layer instanceof ol.layer.Base) {
    this.getMap().addLayer(layer);
  } else {
    Ext.Error.raise('Can not add layer ' + layer + ' as it is not ' + 'an instance of ol.layer.Base');
  }
}, removeLayer:function(layer) {
  if (layer instanceof ol.layer.Base) {
    if (Ext.Array.contains(this.getLayers().getArray(), layer)) {
      this.getMap().removeLayer(layer);
    }
  } else {
    Ext.Error.raise('Can not remove layer ' + layer + ' as it is not ' + 'an instance of ol.layer.Base');
  }
}, getStore:function() {
  return this.layerStore;
}, getView:function() {
  return this.getMap().getView();
}, setView:function(view) {
  this.getMap().setView(view);
}, bindStateOlEvents:function() {
  var me = this;
  var olMap = me.getMap();
  olMap.on('moveend', function(evt) {
    me.fireEvent('aftermapmove', me, olMap, evt);
  });
}, getState:function() {
  var me = this;
  var view = me.getMap().getView();
  return {zoom:view.getZoom(), center:view.getCenter(), rotation:view.getRotation()};
}, applyState:function(mapState) {
  if (!Ext.isObject(mapState)) {
    return;
  }
  var me = this;
  var view = me.getMap().getView();
  view.setCenter(mapState.center);
  view.setZoom(mapState.zoom);
  view.setRotation(mapState.rotation);
}});
Ext.define('GeoExt.util.Layer', {inheritableStatics:{cascadeLayers:function(lyrGroup, fn) {
  if (!(lyrGroup instanceof ol.layer.Group)) {
    Ext.Logger.warn('No ol.layer.Group given to ' + 'BasiGX.util.Layer.cascadeLayers. It is unlikely that ' + 'this will work properly. Skipping!');
    return;
  }
  if (!Ext.isFunction(fn)) {
    Ext.Logger.warn('No function passed ' + 'this will not work. Skipping!');
    return;
  }
  lyrGroup.getLayers().forEach(function(layerOrGroup) {
    fn(layerOrGroup);
    if (layerOrGroup instanceof ol.layer.Group) {
      GeoExt.util.Layer.cascadeLayers(layerOrGroup, fn);
    }
  });
}, findParentGroup:function(childLayer, startGroup) {
  var parentGroup;
  var findParentGroup = GeoExt.util.Layer.findParentGroup;
  var getLayerIndex = GeoExt.util.Layer.getLayerIndex;
  if (getLayerIndex(childLayer, startGroup) !== -1) {
    parentGroup = startGroup;
  } else {
    startGroup.getLayers().forEach(function(layer) {
      if (!parentGroup && layer instanceof ol.layer.Group) {
        parentGroup = findParentGroup(childLayer, layer);
      }
    });
  }
  return parentGroup;
}, getLayerIndex:function(layer, group) {
  var index = -1;
  group.getLayers().forEach(function(candidate, idx) {
    if (index === -1 && candidate === layer) {
      index = idx;
    }
  });
  return index;
}}});
Ext.define('GeoExt.component.OverviewMap', {extend:'Ext.Component', alias:['widget.gx_overview', 'widget.gx_overviewmap', 'widget.gx_component_overviewmap'], requires:['GeoExt.util.Version', 'GeoExt.util.Layer'], mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.Collection', 'ol.Feature', 'ol.Feature#setGeometry', 'ol.Feature#setStyle', 'ol.geom.Point', 'ol.geom.Point#getCoordinates', 'ol.geom.Point#setCoordinates', 'ol.geom.Polygon', 'ol.geom.Polygon#getCoordinates', 'ol.geom.Polygon#setCoordinates', 
'ol.interaction.Translate', 'ol.layer.Image', 'ol.layer.Tile', 'ol.layer.Vector', 'ol.layer.Vector#getSource', 'ol.Map', 'ol.Map#addLayer', 'ol.Map#getView', 'ol.Map#on', 'ol.Map#updateSize', 'ol.Map#un', 'ol.source.Vector', 'ol.source.Vector#addFeatures', 'ol.View', 'ol.View#calculateExtent', 'ol.View#getCenter', 'ol.View#getProjection', 'ol.View#getRotation', 'ol.View#getZoom', 'ol.View#on', 'ol.View#set', 'ol.View#setCenter', 'ol.View#un'], inheritableStatics:{getVisibleExtentGeometries:function(map) {
  var mapSize = map && map.getSize();
  var w = mapSize && mapSize[0];
  var h = mapSize && mapSize[1];
  if (!mapSize || isNaN(w) || isNaN(h)) {
    return;
  }
  var pixels = [[0, 0], [w, 0], [w, h], [0, h], [0, 0]];
  var extentCoords = [];
  Ext.each(pixels, function(pixel) {
    var coord = map.getCoordinateFromPixel(pixel);
    if (coord === null) {
      return false;
    }
    extentCoords.push(coord);
  });
  if (extentCoords.length !== 5) {
    return;
  }
  var geom = new ol.geom.Polygon([extentCoords]);
  var anchor = new ol.geom.Point(extentCoords[0]);
  return {extent:geom, topLeft:anchor};
}}, config:{anchorStyle:null, boxStyle:null, layers:[], magnification:5, map:null, parentMap:null, recenterOnClick:true, enableBoxDrag:true, recenterDuration:500}, boxFeature:null, anchorFeature:null, extentLayer:null, dragInteraction:null, mapRendered:false, constructor:function() {
  this.initOverviewFeatures();
  this.callParent(arguments);
}, initComponent:function() {
  var me = this;
  if (!me.getParentMap()) {
    Ext.Error.raise('No parentMap defined for overviewMap');
  } else {
    if (!(me.getParentMap() instanceof ol.Map)) {
      Ext.Error.raise('parentMap is not an instance of ol.Map');
    }
  }
  me.initOverviewMap();
  me.on('beforedestroy', me.onBeforeDestroy, me);
  me.on('resize', me.onResize, me);
  me.on('afterrender', me.updateBox, me);
  me.callParent();
}, initOverviewFeatures:function() {
  var me = this;
  me.boxFeature = new ol.Feature;
  me.anchorFeature = new ol.Feature;
  me.extentLayer = new ol.layer.Vector({source:new ol.source.Vector});
}, initOverviewMap:function() {
  var me = this;
  var parentMap = me.getParentMap();
  var ovMap = me.getMap();
  me.getLayers().push(me.extentLayer);
  if (!ovMap) {
    var parentView = parentMap.getView();
    var olMap = new ol.Map({controls:new ol.Collection, interactions:new ol.Collection, view:new ol.View({center:parentView.getCenter(), zoom:parentView.getZoom(), projection:parentView.getProjection()})});
    me.setMap(olMap);
  } else {
    if (ovMap.getView() && !ovMap.getView().getCenter()) {
      ovMap.getView().setCenter([0, 0]);
    }
  }
  GeoExt.util.Layer.cascadeLayers(parentMap.getLayerGroup(), function(layer) {
    if (me.getLayers().indexOf(layer) > -1) {
      throw new Error('OverviewMap cannot use layers of the ' + 'parent map. (Since ol v6.0.0 maps cannot share ' + 'layers anymore)');
    }
  });
  Ext.each(me.getLayers(), function(layer) {
    me.getMap().addLayer(layer);
  });
  parentMap.getView().on('propertychange', me.onParentViewPropChange.bind(me));
  me.enableBoxUpdate();
  me.setOverviewMapProperty('center');
  me.setOverviewMapProperty('resolution');
  me.extentLayer.getSource().addFeatures([me.boxFeature, me.anchorFeature]);
}, setupDragBehaviour:function() {
  var me = this;
  var dragInteraction = new ol.interaction.Translate({features:new ol.Collection([me.boxFeature])});
  me.getMap().addInteraction(dragInteraction);
  dragInteraction.setActive(true);
  dragInteraction.on('translatestart', me.disableBoxUpdate.bind(me));
  dragInteraction.on('translating', me.repositionAnchorFeature.bind(me));
  dragInteraction.on('translateend', me.recenterParentFromBox.bind(me));
  dragInteraction.on('translateend', me.enableBoxUpdate.bind(me));
  me.dragInteraction = dragInteraction;
}, disableBoxUpdate:function() {
  var me = this;
  var parentMap = me.getParentMap();
  if (parentMap) {
    parentMap.un('postrender', me.updateBox, me);
  }
}, enableBoxUpdate:function() {
  var me = this;
  var parentMap = me.getParentMap();
  if (parentMap) {
    parentMap.on('postrender', me.updateBox.bind(me));
  }
}, destroyDragBehaviour:function() {
  var me = this;
  var dragInteraction = me.dragInteraction;
  if (!dragInteraction) {
    return;
  }
  dragInteraction.setActive(false);
  me.getMap().removeInteraction(dragInteraction);
  dragInteraction.un('translatestart', me.disableBoxUpdate, me);
  dragInteraction.un('translating', me.repositionAnchorFeature, me);
  dragInteraction.un('translateend', me.recenterParentFromBox, me);
  dragInteraction.un('translateend', me.enableBoxUpdate, me);
  me.dragInteraction = null;
}, repositionAnchorFeature:function() {
  var me = this;
  var boxCoords = me.boxFeature.getGeometry().getCoordinates();
  var topLeftCoord = boxCoords[0][0];
  var newAnchorGeom = new ol.geom.Point(topLeftCoord);
  me.anchorFeature.setGeometry(newAnchorGeom);
}, recenterParentFromBox:function() {
  var me = this;
  var parentMap = me.getParentMap();
  var parentView = parentMap.getView();
  var parentProjection = parentView.getProjection();
  var overviewMap = me.getMap();
  var overviewView = overviewMap.getView();
  var overviewProjection = overviewView.getProjection();
  var currentMapCenter = parentView.getCenter();
  var boxExtent = me.boxFeature.getGeometry().getExtent();
  var boxCenter = ol.extent.getCenter(boxExtent);
  if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
    boxCenter = ol.proj.transform(boxCenter, overviewProjection, parentProjection);
  }
  if (GeoExt.util.Version.isOl3()) {
    var panAnimation = ol.animation.pan({duration:me.getRecenterDuration(), source:currentMapCenter});
    parentMap.beforeRender(panAnimation);
    parentView.setCenter(boxCenter);
  } else {
    parentView.animate({center:boxCenter});
  }
}, onParentViewPropChange:function(evt) {
  if (evt.key === 'center' || evt.key === 'resolution') {
    this.setOverviewMapProperty(evt.key);
  }
}, overviewMapClicked:function(evt) {
  var me = this;
  var parentMap = me.getParentMap();
  var parentView = parentMap.getView();
  var parentProjection = parentView.getProjection();
  var currentMapCenter = parentView.getCenter();
  var overviewMap = me.getMap();
  var overviewView = overviewMap.getView();
  var overviewProjection = overviewView.getProjection();
  var newCenter = evt.coordinate;
  if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
    newCenter = ol.proj.transform(newCenter, overviewProjection, parentProjection);
  }
  if (GeoExt.util.Version.isOl3()) {
    var panAnimation = ol.animation.pan({duration:me.getRecenterDuration(), source:currentMapCenter});
    parentMap.beforeRender(panAnimation);
    parentView.setCenter(newCenter);
  } else {
    parentView.animate({center:newCenter});
  }
}, updateBox:function() {
  var me = this;
  var parentMap = me.getParentMap();
  var extentGeometries = me.self.getVisibleExtentGeometries(parentMap);
  if (!extentGeometries) {
    return;
  }
  var geom = extentGeometries.extent;
  var anchor = extentGeometries.topLeft;
  var parentMapProjection = parentMap.getView().getProjection();
  var overviewProjection = me.getMap().getView().getProjection();
  if (!ol.proj.equivalent(parentMapProjection, overviewProjection)) {
    geom.transform(parentMapProjection, overviewProjection);
    anchor.transform(parentMapProjection, overviewProjection);
  }
  me.boxFeature.setGeometry(geom);
  me.anchorFeature.setGeometry(anchor);
}, setOverviewMapProperty:function(key) {
  var me = this;
  var parentView = me.getParentMap().getView();
  var parentProjection = parentView.getProjection();
  var overviewView = me.getMap().getView();
  var overviewProjection = overviewView.getProjection();
  var overviewCenter = parentView.getCenter();
  if (key === 'center') {
    if (!ol.proj.equivalent(parentProjection, overviewProjection)) {
      overviewCenter = ol.proj.transform(overviewCenter, parentProjection, overviewProjection);
    }
    overviewView.set('center', overviewCenter);
  }
  if (key === 'resolution') {
    if (ol.proj.equivalent(parentProjection, overviewProjection)) {
      overviewView.set('resolution', me.getMagnification() * parentView.getResolution());
    } else {
      if (me.mapRendered === true) {
        var parentExtent = parentView.calculateExtent(me.getParentMap().getSize());
        var parentExtentProjected = ol.proj.transformExtent(parentExtent, parentProjection, overviewProjection);
        overviewView.fit(parentExtentProjected);
        overviewView.set('resolution', me.getMagnification() * overviewView.getResolution());
      }
    }
  }
}, applyRecenterOnClick:function(shallRecenter) {
  var me = this;
  var map = me.getMap();
  if (!map) {
    me.addListener('afterrender', function() {
      me.setRecenterOnClick(shallRecenter);
    }, me, {single:true});
    return shallRecenter;
  }
  if (shallRecenter) {
    map.on('click', me.overviewMapClicked.bind(me));
  } else {
    map.un('click', me.overviewMapClicked.bind(me));
  }
  return shallRecenter;
}, applyEnableBoxDrag:function(shallEnableBoxDrag) {
  var me = this;
  var map = me.getMap();
  if (!map) {
    me.addListener('afterrender', function() {
      me.setEnableBoxDrag(shallEnableBoxDrag);
    }, me, {single:true});
    return shallEnableBoxDrag;
  }
  if (shallEnableBoxDrag) {
    me.setupDragBehaviour();
  } else {
    me.destroyDragBehaviour();
  }
  return shallEnableBoxDrag;
}, onBeforeDestroy:function() {
  var me = this;
  var map = me.getMap();
  var parentMap = me.getParentMap();
  var parentView = parentMap && parentMap.getView();
  if (map) {
    map.un('click', me.overviewMapClicked, me);
  }
  me.destroyDragBehaviour();
  if (parentMap) {
    me.disableBoxUpdate();
    parentView.un('propertychange', me.onParentViewPropChange, me);
  }
}, onResize:function() {
  var me = this;
  var div = me.getEl().dom;
  var map = me.getMap();
  if (!me.mapRendered) {
    map.setTarget(div);
    me.mapRendered = true;
    me.setOverviewMapProperty('resolution');
  } else {
    me.getMap().updateSize();
  }
}, applyAnchorStyle:function(style) {
  this.anchorFeature.setStyle(style);
  return style;
}, applyBoxStyle:function(style) {
  this.boxFeature.setStyle(style);
  return style;
}});
Ext.define('GeoExt.component.Popup', {requires:[], extend:'Ext.Component', alias:['widget.gx_popup', 'widget.gx_component_popup'], config:{overlay:null, map:null}, overlayElement:null, overlayElementCreated:false, cls:'gx-popup', constructor:function(config) {
  var me = this;
  var cfg = config || {};
  var overlayElement;
  if (!Ext.isDefined(cfg.map)) {
    Ext.Error.raise("Required configuration 'map' not passed");
  }
  if (Ext.isDefined(cfg.renderTo)) {
    overlayElement = Ext.get(cfg.renderTo).dom;
  } else {
    overlayElement = Ext.dom.Helper.append(Ext.getBody(), '\x3cdiv\x3e');
    me.overlayElementCreated = true;
  }
  cfg.renderTo = overlayElement;
  me.overlayElement = overlayElement;
  me.callParent([cfg]);
}, initComponent:function() {
  var me = this;
  me.updateLayout = me.updateLayout.bind(me);
  me.on({afterrender:me.setOverlayElement, beforedestroy:me.onBeforeDestroy, scope:me});
  me.callParent();
  me.setupOverlay();
}, setupOverlay:function() {
  var me = this;
  var overlay = new ol.Overlay({autoPan:true, autoPanAnimation:{duration:250}});
  me.getMap().addOverlay(overlay);
  overlay.on('change:position', me.updateLayout);
  me.setOverlay(overlay);
}, setOverlayElement:function() {
  this.getOverlay().set('element', this.overlayElement);
}, position:function(coordinate) {
  var me = this;
  me.getOverlay().setPosition(coordinate);
}, onBeforeDestroy:function() {
  var me = this;
  if (me.overlayElementCreated && me.overlayElement) {
    var parent = me.overlayElement.parentNode;
    parent.removeChild(me.overlayElement);
  }
  me.getOverlay().un('change:position', me.doLayout);
}});
Ext.define('GeoExt.data.model.print.LayoutAttribute', {extend:'GeoExt.data.model.Base', fields:[{name:'name', type:'string'}, {name:'type', type:'string'}, {name:'clientInfo', type:'auto'}, {name:'layoutId', reference:{type:'print.Layout', inverse:'attributes'}}]});
Ext.define('GeoExt.data.model.print.Layout', {extend:'GeoExt.data.model.Base', requires:['GeoExt.data.model.print.LayoutAttribute'], fields:[{name:'name', type:'string'}, {name:'capabilityId', reference:{type:'print.Capability', inverse:'layouts'}}]});
Ext.define('GeoExt.data.model.print.Capability', {extend:'GeoExt.data.model.Base', requires:['GeoExt.data.model.print.Layout'], fields:[{name:'app', type:'string'}, {name:'formats', type:'auto', defaultValue:[]}]});
Ext.define('GeoExt.data.MapfishPrintProvider', {extend:'Ext.Base', mixins:['Ext.mixin.Observable', 'GeoExt.mixin.SymbolCheck'], requires:['GeoExt.data.model.print.Capability', 'Ext.data.JsonStore', 'Ext.data.Store', 'Ext.data.proxy.Ajax', 'Ext.data.proxy.JsonP'], symbols:['ol.Collection', 'ol.geom.Polygon.fromExtent', 'ol.Feature', 'ol.layer.Layer#getSource', 'ol.layer.Group', 'ol.source.Vector.prototype.addFeature', 'ol.View#calculateExtent'], config:{capabilities:null, url:'', useJsonp:true}, inheritableStatics:{_serializers:[], 
registerSerializer:function(olSourceCls, serializerCls) {
  var staticMe = GeoExt.data.MapfishPrintProvider;
  staticMe._serializers.push({olSourceCls:olSourceCls, serializerCls:serializerCls});
}, unregisterSerializer:function(serializerCls) {
  var available = GeoExt.data.MapfishPrintProvider._serializers;
  var index;
  Ext.each(available, function(candidate, idx) {
    if (candidate.serializerCls === serializerCls) {
      index = idx;
      return false;
    }
  });
  if (Ext.isDefined(index)) {
    Ext.Array.removeAt(available, index);
    return true;
  }
  return false;
}, findSerializerBySource:function(source) {
  var available = GeoExt.data.MapfishPrintProvider._serializers;
  var serializer;
  Ext.each(available, function(candidate) {
    if (source instanceof candidate.olSourceCls) {
      serializer = candidate.serializerCls;
      return false;
    }
  });
  if (!serializer) {
    Ext.log.warn("Couldn't find a suitable serializer for source." + ' Did you require() an appropriate serializer class?');
  }
  return serializer;
}, getLayerArray:function(coll) {
  var me = this;
  var inputLayers = [];
  var outputLayers = [];
  if (coll instanceof GeoExt.data.store.Layers) {
    coll.each(function(layerRec) {
      var layer = layerRec.getOlLayer();
      inputLayers.push(layer);
    });
  } else {
    if (coll instanceof ol.Collection) {
      inputLayers = Ext.clone(coll.getArray());
    } else {
      inputLayers = Ext.clone(coll);
    }
  }
  inputLayers.forEach(function(layer) {
    if (layer instanceof ol.layer.Group) {
      Ext.each(me.getLayerArray(layer.getLayers()), function(subLayer) {
        outputLayers.push(subLayer);
      });
    } else {
      outputLayers.push(layer);
    }
  });
  return outputLayers;
}, getSerializedLayers:function(mapComponent, filterFn, filterScope) {
  var layers = mapComponent.getLayers();
  var viewRes = mapComponent.getView().getResolution();
  var serializedLayers = [];
  var inputLayers = this.getLayerArray(layers);
  if (Ext.isDefined(filterFn)) {
    inputLayers = Ext.Array.filter(inputLayers, filterFn, filterScope);
  }
  Ext.each(inputLayers, function(layer) {
    var source = layer.getSource();
    var serialized = {};
    var serializer = this.findSerializerBySource(source);
    if (serializer) {
      serialized = serializer.serialize(layer, source, viewRes, mapComponent.map);
      serializedLayers.push(serialized);
    }
  }, this);
  return serializedLayers;
}, renderPrintExtent:function(mapComponent, extentLayer, clientInfo) {
  var mapComponentWidth = mapComponent.getWidth();
  var mapComponentHeight = mapComponent.getHeight();
  var currentMapRatio = mapComponentWidth / mapComponentHeight;
  var scaleFactor = 0.6;
  var desiredPrintRatio = clientInfo.width / clientInfo.height;
  var targetWidth;
  var targetHeight;
  var geomExtent;
  var feat;
  if (desiredPrintRatio >= currentMapRatio) {
    targetWidth = mapComponentWidth * scaleFactor;
    targetHeight = targetWidth / desiredPrintRatio;
  } else {
    targetHeight = mapComponentHeight * scaleFactor;
    targetWidth = targetHeight * desiredPrintRatio;
  }
  geomExtent = mapComponent.getView().calculateExtent([targetWidth, targetHeight]);
  feat = new ol.Feature(ol.geom.Polygon.fromExtent(geomExtent));
  extentLayer.getSource().addFeature(feat);
  return feat;
}}, capabilityRec:null, constructor:function(cfg) {
  this.mixins.observable.constructor.call(this, cfg);
  if (!cfg.capabilities && !cfg.url) {
    Ext.Error.raise('Print capabilities or Url required');
  }
  this.initConfig(cfg);
  this.fillCapabilityRec();
}, fillCapabilityRec:function() {
  var store;
  var capabilities = this.getCapabilities();
  var url = this.getUrl();
  var fillRecordAndFireEvent = function() {
    this.capabilityRec = store.getAt(0);
    if (!this.capabilityRec) {
      this.fireEvent('error', this);
    } else {
      this.fireEvent('ready', this);
    }
  };
  if (capabilities) {
    store = Ext.create('Ext.data.JsonStore', {model:'GeoExt.data.model.print.Capability', listeners:{datachanged:fillRecordAndFireEvent, scope:this}});
    store.loadRawData(capabilities);
  } else {
    if (url) {
      var proxy = {url:url};
      if (this.getUseJsonp()) {
        proxy.type = 'jsonp';
        proxy.callbackKey = 'jsonp';
      } else {
        proxy.type = 'ajax';
        proxy.reader = {type:'json'};
      }
      store = Ext.create('Ext.data.Store', {autoLoad:true, model:'GeoExt.data.model.print.Capability', proxy:proxy, listeners:{load:fillRecordAndFireEvent, scope:this}});
    }
  }
}});
Ext.define('GeoExt.data.model.ArcGISRestServiceLayer', {extend:'GeoExt.data.model.Base', fields:[{name:'layerId', type:'int'}, {name:'name', type:'string'}, {name:'defaultVisibility', type:'boolean'}, {name:'visibility', type:'boolean'}]});
Ext.define('GeoExt.data.model.OlObject', {extend:'GeoExt.data.model.Base', mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol', 'ol.Object', 'ol.Object#on', 'ol.Object#get', 'ol.Object#set'], inheritableStatics:{getOlCLassRef:function(str) {
  var ref = ol;
  var members;
  if (Ext.isString(str)) {
    members = str.split('.');
    if (Ext.Array.indexOf(members, 'ol') === 0) {
      members.shift();
    }
    Ext.Array.each(members, function(member) {
      ref = ref[member];
    });
  }
  return ref;
}}, olClass:'ol.Object', olObject:null, proxy:{type:'memory', reader:'json'}, constructor:function(data) {
  var me = this;
  var statics = this.statics();
  var OlClass = statics.getOlCLassRef(this.olClass);
  data = data || {};
  if (!(data instanceof OlClass)) {
    data = new OlClass(data);
  }
  me.olObject = data;
  me.callParent([this.olObject.getProperties()]);
  me.onPropertychange = me.onPropertychange.bind(me);
  me.olObject.on('propertychange', me.onPropertychange);
}, onPropertychange:function(evt) {
  var target = evt.target;
  var key = evt.key;
  if (!this.__updating) {
    this.set(key, target.get(key));
  }
}, set:function(key, newValue) {
  var o = {};
  this.callParent(arguments);
  this.__updating = true;
  if (Ext.isString(key)) {
    o[key] = newValue;
  } else {
    o = key;
  }
  Ext.Object.each(o, function(k, v) {
    if (this.olObject.get(k) !== v) {
      this.olObject.set(k, v);
    }
  }, this);
  this.__updating = false;
}, destroy:function() {
  this.olObject.un('propertychange', this.onPropertychange);
  this.callParent(arguments);
}});
Ext.define('GeoExt.data.model.Feature', {extend:'GeoExt.data.model.OlObject', getFeature:function() {
  return this.olObject;
}});
Ext.define('GeoExt.data.model.LayerTreeNode', {extend:'GeoExt.data.model.Layer', requires:['Ext.data.NodeInterface'], mixins:['Ext.mixin.Queryable', 'GeoExt.mixin.SymbolCheck'], symbols:['ol.layer.Base', 'ol.Object#get', 'ol.Object#set'], fields:[{name:'leaf', type:'boolean', convert:function(v, record) {
  var isGroup = record.get('isLayerGroup');
  if (isGroup === undefined || isGroup) {
    return false;
  }
  return true;
}}, {name:'__toggleMode', type:'string', defaultValue:'classic'}, {name:'iconCls', type:'string', convert:function(v, record) {
  return record.getOlLayerProp('iconCls');
}}], proxy:{type:'memory', reader:{type:'json'}}, constructor:function() {
  var layer;
  this.callParent(arguments);
  layer = this.getOlLayer();
  if (layer instanceof ol.layer.Base) {
    this.set('checked', layer.get('visible'));
    layer.on('change:visible', this.onLayerVisibleChange.bind(this));
  }
}, onLayerVisibleChange:function(evt) {
  var target = evt.target;
  if (!this.__updating) {
    this.set('checked', target.get('visible'));
  }
}, set:function(key, newValue) {
  var me = this;
  var classicMode = me.get('__toggleMode') === 'classic';
  me.callParent(arguments);
  if (key === 'checked') {
    if (me.get('__toggleMode') === 'ol3') {
      me.getOlLayer().set('visible', newValue);
      return;
    }
    me.__updating = true;
    if (me.get('isLayerGroup') && classicMode) {
      me.getOlLayer().set('visible', newValue);
      if (me.childNodes) {
        me.eachChild(function(child) {
          child.getOlLayer().set('visible', newValue);
        });
      }
    } else {
      me.getOlLayer().set('visible', newValue);
    }
    me.__updating = false;
    if (classicMode) {
      me.toggleParentNodes(newValue);
    }
  }
}, toggleParentNodes:function(newValue) {
  var me = this;
  if (newValue === true) {
    me.__updating = true;
    me.bubble(function(parent) {
      if (!parent.isRoot()) {
        parent.set('__toggleMode', 'ol3');
        parent.set('checked', true);
        parent.set('__toggleMode', 'classic');
      }
    });
    me.__updating = false;
  }
  if (newValue === false) {
    me.__updating = true;
    me.bubble(function(parent) {
      if (!parent.isRoot()) {
        var allUnchecked = true;
        parent.eachChild(function(child) {
          if (child.get('checked')) {
            allUnchecked = false;
          }
        });
        if (allUnchecked) {
          parent.set('__toggleMode', 'ol3');
          parent.set('checked', false);
          parent.set('__toggleMode', 'classic');
        }
      }
    });
    me.__updating = false;
  }
}, getRefItems:function() {
  return this.childNodes;
}, getRefOwner:function() {
  return this.parentNode;
}}, function() {
  Ext.data.NodeInterface.decorate(this);
});
Ext.define('GeoExt.data.serializer.Base', {extend:'Ext.Base', requires:['GeoExt.data.MapfishPrintProvider'], mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.layer.Layer', 'ol.source.Source'], inheritableStatics:{sourceCls:null, serialize:function() {
  Ext.raise('This method must be overridden by subclasses.');
  return null;
}, register:function(subCls) {
  GeoExt.data.MapfishPrintProvider.registerSerializer(subCls.sourceCls, subCls);
}, validateSource:function(source) {
  if (!(source instanceof this.sourceCls)) {
    Ext.raise('Cannot serialize this source with this serializer');
  }
}}});
Ext.define('GeoExt.data.serializer.ImageWMS', {extend:'GeoExt.data.serializer.Base', mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.layer.Layer#getOpacity', 'ol.source.ImageWMS', 'ol.source.ImageWMS#getUrl', 'ol.source.ImageWMS#getParams'], inheritableStatics:{sourceCls:ol.source.ImageWMS, serialize:function(layer, source) {
  this.validateSource(source);
  var styles = source.getParams().STYLES;
  var stylesArray;
  if (Ext.isArray(styles)) {
    stylesArray = styles;
  } else {
    stylesArray = styles ? styles.split(',') : [''];
  }
  var serialized = {baseURL:source.getUrl(), customParams:source.getParams(), layers:[source.getParams().LAYERS], opacity:layer.getOpacity(), styles:stylesArray, type:'WMS'};
  return serialized;
}}}, function(cls) {
  cls.register(cls);
});
Ext.define('GeoExt.data.serializer.TileWMS', {extend:'GeoExt.data.serializer.Base', mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.layer.Layer#getOpacity', 'ol.source.TileWMS', 'ol.source.TileWMS#getUrls', 'ol.source.TileWMS#getParams'], inheritableStatics:{sourceCls:ol.source.TileWMS, serialize:function(layer, source) {
  this.validateSource(source);
  var styles = source.getParams().STYLES;
  var stylesArray;
  if (Ext.isArray(styles)) {
    stylesArray = styles;
  } else {
    stylesArray = styles ? styles.split(',') : [''];
  }
  var serialized = {baseURL:source.getUrls()[0], customParams:source.getParams(), layers:[source.getParams().LAYERS], opacity:layer.getOpacity(), styles:stylesArray, type:'WMS'};
  return serialized;
}}}, function(cls) {
  cls.register(cls);
});
Ext.define('GeoExt.data.serializer.Vector', {extend:'GeoExt.data.serializer.Base', mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.color.asArray', 'ol.Feature', 'ol.Feature#getGeometry', 'ol.Feature#getStyleFunction', 'ol.format.GeoJSON', 'ol.format.GeoJSON#writeFeatureObject', 'ol.geom.Geometry', 'ol.geom.LineString#getType', 'ol.geom.MultiLineString#getType', 'ol.geom.MultiPoint#getType', 'ol.geom.MultiPolygon#getType', 'ol.geom.Point#getType', 'ol.geom.Polygon#getType', 'ol.layer.Vector#getOpacity', 
'ol.layer.Vector#getStyleFunction', 'ol.source.Vector', 'ol.source.Vector#getFeatures', 'ol.style.Circle', 'ol.style.Circle#getRadius', 'ol.style.Circle#getFill', 'ol.style.Fill', 'ol.style.Fill#getColor', 'ol.style.Icon', 'ol.style.Icon#getSrc', 'ol.style.Icon#getRotation', 'ol.style.Stroke', 'ol.style.Stroke#getColor', 'ol.style.Stroke#getWidth', 'ol.style.Style', 'ol.style.Style#getFill', 'ol.style.Style#getImage', 'ol.style.Style#getStroke', 'ol.style.Style#getText', 'ol.style.Text', 'ol.style.Text#getFont', 
'ol.style.Text#getOffsetX', 'ol.style.Text#getOffsetY', 'ol.style.Text#getRotation', 'ol.style.Text#getText', 'ol.style.Text#getTextAlign'], inheritableStatics:{PRINTSTYLE_TYPES:{POINT:'Point', LINE_STRING:'LineString', POLYGON:'Polygon'}, GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE:{}, FALLBACK_SERIALIZATION:{geoJson:{type:'FeatureCollection', features:[]}, opacity:1, style:{'version':'2', '*':{symbolizers:[{type:'point', strokeColor:'white', strokeOpacity:1, strokeWidth:4, strokeDashstyle:'solid', fillColor:'red'}]}}, 
type:'geojson'}, FEAT_STYLE_PREFIX:'_gx3_style_', GX_UID_PROPERTY:'__gx_uid__', format:new ol.format.GeoJSON, sourceCls:ol.source.Vector, serialize:function(layer, source, viewRes, map) {
  var me = this;
  me.validateSource(source);
  var extent;
  if (map) {
    extent = map.getView().calculateExtent();
  }
  var format = me.format;
  var geoJsonFeatures = [];
  var mapfishStyleObject = {version:2};
  var processFeatures = function(feature) {
    var geometry = feature.getGeometry();
    if (Ext.isEmpty(geometry)) {
      return;
    }
    var geometryType = geometry.getType();
    var geojsonFeature = format.writeFeatureObject(feature);
    if (geojsonFeature.properties && geojsonFeature.properties.parentFeature) {
      geojsonFeature.properties.parentFeature = undefined;
    }
    var styles = null;
    var styleFunction = feature.getStyleFunction();
    if (Ext.isDefined(styleFunction)) {
      styles = styleFunction(feature, viewRes);
    } else {
      styleFunction = layer.getStyleFunction();
      if (Ext.isDefined(styleFunction)) {
        styles = styleFunction(feature, viewRes);
      }
    }
    if (!Ext.isArray(styles)) {
      styles = [styles];
    }
    if (!Ext.isEmpty(styles)) {
      geoJsonFeatures.push(geojsonFeature);
      if (Ext.isEmpty(geojsonFeature.properties)) {
        geojsonFeature.properties = {};
      }
      Ext.each(styles, function(style, j) {
        var styleId = me.getUid(style, geometryType);
        var featureStyleProp = me.FEAT_STYLE_PREFIX + j;
        me.encodeVectorStyle(mapfishStyleObject, geometryType, style, styleId, featureStyleProp);
        geojsonFeature.properties[featureStyleProp] = styleId;
      });
    }
  };
  if (extent) {
    source.forEachFeatureInExtent(extent, processFeatures);
  } else {
    Ext.each(source.getFeatures(), processFeatures);
  }
  var serialized;
  if (geoJsonFeatures.length > 0) {
    var geojsonFeatureCollection = {type:'FeatureCollection', features:geoJsonFeatures};
    serialized = {geoJson:geojsonFeatureCollection, opacity:layer.getOpacity(), style:mapfishStyleObject, type:'geojson'};
  } else {
    serialized = this.FALLBACK_SERIALIZATION;
  }
  return serialized;
}, encodeVectorStyle:function(object, geometryType, style, styleId, featureStyleProp) {
  var me = this;
  var printTypes = me.PRINTSTYLE_TYPES;
  var printStyleLookup = me.GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE;
  if (!Ext.isDefined(printStyleLookup[geometryType])) {
    return;
  }
  var styleType = printStyleLookup[geometryType];
  var key = '[' + featureStyleProp + " \x3d '" + styleId + "']";
  if (Ext.isDefined(object[key])) {
    return;
  }
  var styleObject = {symbolizers:[]};
  object[key] = styleObject;
  var fillStyle = style.getFill();
  var imageStyle = style.getImage();
  var strokeStyle = style.getStroke();
  var textStyle = style.getText();
  var hasFillStyle = !Ext.isEmpty(fillStyle);
  var hasImageStyle = !Ext.isEmpty(imageStyle);
  var hasStrokeStyle = !Ext.isEmpty(strokeStyle);
  var hasTextStyle = !Ext.isEmpty(textStyle);
  var POLYTYPE = printTypes.POLYGON;
  var LINETYPE = printTypes.LINE_STRING;
  var POINTTYPE = printTypes.POINT;
  if (styleType === POLYTYPE && hasFillStyle) {
    me.encodeVectorStylePolygon(styleObject.symbolizers, fillStyle, strokeStyle);
  } else {
    if (styleType === LINETYPE && hasStrokeStyle) {
      me.encodeVectorStyleLine(styleObject.symbolizers, strokeStyle);
    } else {
      if (styleType === POINTTYPE && hasImageStyle) {
        me.encodeVectorStylePoint(styleObject.symbolizers, imageStyle);
      }
    }
  }
  if (hasTextStyle) {
    me.encodeTextStyle(styleObject.symbolizers, textStyle);
  }
}, encodeVectorStylePolygon:function(symbolizers, fillStyle, strokeStyle) {
  var symbolizer = {type:'polygon'};
  this.encodeVectorStyleFill(symbolizer, fillStyle);
  if (strokeStyle !== null) {
    this.encodeVectorStyleStroke(symbolizer, strokeStyle);
  }
  symbolizers.push(symbolizer);
}, encodeVectorStyleLine:function(symbolizers, strokeStyle) {
  var symbolizer = {type:'line'};
  this.encodeVectorStyleStroke(symbolizer, strokeStyle);
  symbolizers.push(symbolizer);
}, encodeVectorStylePoint:function(symbolizers, imageStyle) {
  var symbolizer;
  if (imageStyle instanceof ol.style.Circle) {
    symbolizer = {type:'point'};
    symbolizer.pointRadius = imageStyle.getRadius();
    var fillStyle = imageStyle.getFill();
    if (fillStyle !== null) {
      this.encodeVectorStyleFill(symbolizer, fillStyle);
    }
    var strokeStyle = imageStyle.getStroke();
    if (strokeStyle !== null) {
      this.encodeVectorStyleStroke(symbolizer, strokeStyle);
    }
  } else {
    if (imageStyle instanceof ol.style.Icon) {
      var src = imageStyle.getSrc();
      if (Ext.isDefined(src)) {
        var img = imageStyle.getImage(window.devicePixelRatio || 1);
        var canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        var format = 'image/' + src.match(/\.(\w+)$/)[1];
        symbolizer = {type:'point', externalGraphic:canvas.toDataURL(), graphicFormat:format};
        var rotation = imageStyle.getRotation();
        if (rotation !== 0) {
          var degreesRotation = rotation * 180 / Math.PI;
          symbolizer.rotation = degreesRotation;
        }
      }
    }
  }
  if (Ext.isDefined(symbolizer)) {
    symbolizers.push(symbolizer);
  }
}, encodeTextStyle:function(symbolizers, textStyle) {
  var symbolizer = {type:'Text'};
  var label = textStyle.getText();
  if (!Ext.isDefined(label)) {
    return;
  }
  symbolizer.label = label;
  var labelAlign = textStyle.getTextAlign();
  if (Ext.isDefined(labelAlign)) {
    symbolizer.labelAlign = labelAlign;
  }
  var labelRotation = textStyle.getRotation();
  if (Ext.isDefined(labelRotation)) {
    var strRotationDeg = labelRotation * 180 / Math.PI + '';
    symbolizer.labelRotation = strRotationDeg;
  }
  var offsetX = textStyle.getOffsetX();
  var offsetY = textStyle.getOffsetY();
  if (offsetX) {
    symbolizer.labelXOffset = offsetX;
  }
  if (offsetY) {
    symbolizer.labelYOffset = -offsetY;
  }
  var fontStyle = textStyle.getFont();
  if (Ext.isDefined(fontStyle)) {
    var el = document.createElement('span');
    el.style.font = fontStyle;
    symbolizer.fontWeight = el.style.fontWeight;
    symbolizer.fontSize = el.style.fontSize;
    symbolizer.fontFamily = el.style.fontFamily;
    symbolizer.fontStyle = el.style.fontStyle;
  }
  var strokeStyle = textStyle.getStroke();
  if (strokeStyle !== null && strokeStyle.getColor()) {
    var strokeColor = strokeStyle.getColor();
    var strokeColorRgba = ol.color.asArray(strokeColor);
    symbolizer.haloColor = this.rgbArrayToHex(strokeColorRgba);
    symbolizer.haloOpacity = strokeColorRgba[3];
    var width = strokeStyle.getWidth();
    if (Ext.isDefined(width)) {
      symbolizer.haloRadius = width;
    }
  }
  var fillStyle = textStyle.getFill();
  if (fillStyle !== null && fillStyle.getColor()) {
    var fillColorRgba = ol.color.asArray(fillStyle.getColor());
    symbolizer.fontColor = this.rgbArrayToHex(fillColorRgba);
  }
  if (Ext.isDefined(symbolizer.labelAlign)) {
    symbolizer.labelXOffset = textStyle.getOffsetX();
    symbolizer.labelYOffset = -textStyle.getOffsetY();
  }
  symbolizers.push(symbolizer);
}, encodeVectorStyleFill:function(symbolizer, fillStyle) {
  var fillColor = fillStyle.getColor();
  if (fillColor !== null) {
    var fillColorRgba = ol.color.asArray(fillColor);
    symbolizer.fillColor = this.rgbArrayToHex(fillColorRgba);
    symbolizer.fillOpacity = fillColorRgba[3];
  }
}, encodeVectorStyleStroke:function(symbolizer, strokeStyle) {
  var strokeColor = strokeStyle.getColor();
  if (strokeColor !== null) {
    var strokeColorRgba = ol.color.asArray(strokeColor);
    symbolizer.strokeColor = this.rgbArrayToHex(strokeColorRgba);
    symbolizer.strokeOpacity = strokeColorRgba[3];
  }
  var strokeWidth = strokeStyle.getWidth();
  if (Ext.isDefined(strokeWidth)) {
    symbolizer.strokeWidth = strokeWidth;
  }
}, padHexValue:function(hex) {
  return hex.length === 1 ? '0' + hex : hex;
}, rgbToHex:function(r, g, b) {
  r = Number(r);
  g = Number(g);
  b = Number(b);
  if (isNaN(r) || r < 0 || r > 255 || isNaN(g) || g < 0 || g > 255 || isNaN(b) || b < 0 || b > 255) {
    Ext.raise('"(' + r + ',' + g + ',' + b + '") is not a valid ' + ' RGB color');
  }
  var hexR = this.padHexValue(r.toString(16));
  var hexG = this.padHexValue(g.toString(16));
  var hexB = this.padHexValue(b.toString(16));
  return '#' + hexR + hexG + hexB;
}, rgbArrayToHex:function(rgbArr) {
  return this.rgbToHex(rgbArr[0], rgbArr[1], rgbArr[2]);
}, getUid:function(obj, geometryType) {
  if (!Ext.isObject(obj)) {
    Ext.raise('Cannot get uid of non-object.');
  }
  var key = this.GX_UID_PROPERTY;
  if (geometryType) {
    key += '-' + geometryType;
  }
  if (!Ext.isDefined(obj[key])) {
    obj[key] = Ext.id();
  }
  return obj[key];
}}}, function(cls) {
  var olGeomTypes = {POINT:'Point', LINE_STRING:'LineString', LINEAR_RING:'LinearRing', POLYGON:'Polygon', MULTI_POINT:'MultiPoint', MULTI_LINE_STRING:'MultiLineString', MULTI_POLYGON:'MultiPolygon', GEOMETRY_COLLECTION:'GeometryCollection', CIRCLE:'Circle'};
  var printStyleTypes = cls.PRINTSTYLE_TYPES;
  var geom2print = {};
  geom2print[olGeomTypes.POINT] = printStyleTypes.POINT;
  geom2print[olGeomTypes.MULTI_POINT] = printStyleTypes.POINT;
  geom2print[olGeomTypes.LINE_STRING] = printStyleTypes.LINE_STRING;
  geom2print[olGeomTypes.MULTI_LINE_STRING] = printStyleTypes.LINE_STRING;
  geom2print[olGeomTypes.POLYGON] = printStyleTypes.POLYGON;
  geom2print[olGeomTypes.MULTI_POLYGON] = printStyleTypes.POLYGON;
  cls.GEOMETRY_TYPE_TO_PRINTSTYLE_TYPE = geom2print;
  cls.register(cls);
});
Ext.define('GeoExt.data.serializer.WMTS', {extend:'GeoExt.data.serializer.Base', mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.proj.Projection#getMetersPerUnit', 'ol.size.toSize', 'ol.source.WMTS', 'ol.source.WMTS#getDimensions', 'ol.source.WMTS#getFormat', 'ol.source.WMTS#getLayer', 'ol.source.WMTS#getMatrixSet', 'ol.source.WMTS#getProjection', 'ol.source.WMTS#getRequestEncoding', 'ol.source.WMTS#getStyle', 'ol.source.WMTS#getTileGrid', 'ol.source.WMTS#getUrls', 'ol.source.WMTS#getVersion', 
'ol.tilegrid.WMTS#getMatrixIds', 'ol.tilegrid.WMTS#getOrigin', 'ol.tilegrid.WMTS#getResolution'], inheritableStatics:{sourceCls:ol.source.WMTS, serialize:function(layer, source) {
  this.validateSource(source);
  var projection = source.getProjection();
  var tileGrid = source.getTileGrid();
  var dimensions = source.getDimensions();
  var dimensionKeys = Ext.Object.getKeys(dimensions);
  var matrixIds = tileGrid.getMatrixIds();
  var matrices = [];
  Ext.each(matrixIds, function(matrix, idx) {
    var sqrZ = Math.pow(2, idx);
    matrices.push({identifier:matrix, scaleDenominator:tileGrid.getResolution(idx) * projection.getMetersPerUnit() / 2.8E-4, tileSize:ol.size.toSize(tileGrid.getTileSize(idx)), topLeftCorner:tileGrid.getOrigin(idx), matrixSize:[sqrZ, sqrZ]});
  });
  var serialized = {baseURL:source.getUrls()[0], dimensions:dimensionKeys, dimensionParams:dimensions, imageFormat:source.getFormat(), layer:source.getLayer(), matrices:matrices, matrixSet:source.getMatrixSet(), opacity:layer.getOpacity(), requestEncoding:source.getRequestEncoding(), style:source.getStyle(), type:'WMTS', version:source.getVersion()};
  return serialized;
}}}, function(cls) {
  cls.register(cls);
});
Ext.define('GeoExt.data.serializer.XYZ', {extend:'GeoExt.data.serializer.Base', mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.layer.Base#getOpacity', 'ol.size.toSize', 'ol.source.XYZ', 'ol.source.XYZ#getTileGrid', 'ol.source.XYZ#getUrls', 'ol.tilegrid.TileGrid#getResolutions', 'ol.tilegrid.TileGrid#getTileSize'], inheritableStatics:{allowedImageExtensions:['png', 'jpg', 'gif'], sourceCls:ol.source.XYZ, validateSource:function(source) {
  if (!(source instanceof this.sourceCls)) {
    Ext.raise('Cannot serialize this source with this serializer');
  }
  if (source.getUrls() === null) {
    Ext.raise('Cannot serialize this source without an URL. ' + 'Usage of tileUrlFunction is not yet supported');
  }
}, serialize:function(layer, source) {
  this.validateSource(source);
  var tileGrid = source.getTileGrid();
  var serialized = {baseURL:source.getUrls()[0], opacity:layer.getOpacity(), imageExtension:this.getImageExtensionFromSource(source) || 'png', resolutions:tileGrid.getResolutions(), tileSize:ol.size.toSize(tileGrid.getTileSize()), type:'OSM'};
  return serialized;
}, getImageExtensionFromSource:function(source) {
  var urls = source.getUrls();
  var url = urls ? urls[0] : '';
  var extension = url.substr(url.length - 3);
  if (Ext.isDefined(url) && Ext.Array.contains(this.allowedImageExtensions, extension)) {
    return extension;
  }
  Ext.raise('No url(s) supplied for ', source);
  return false;
}}}, function(cls) {
  cls.register(cls);
});
Ext.define('GeoExt.data.store.ArcGISRestServiceLayer', {extend:'Ext.data.Store', requires:['GeoExt.data.model.ArcGISRestServiceLayer'], model:'GeoExt.data.model.ArcGISRestServiceLayer'});
Ext.define('GeoExt.data.store.OlObjects', {extend:'Ext.data.Store', requires:['GeoExt.data.model.OlObject'], mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.Collection', 'ol.Collection#getArray', 'ol.Collection#insertAt', 'ol.Collection#removeAt'], olCollection:null, model:'GeoExt.data.model.OlObject', proxy:{type:'memory', reader:'json'}, listeners:{add:function(store, records, index) {
  var coll = store.olCollection;
  var length = records.length;
  var i;
  store.__updating = true;
  for (i = 0; i < length; i++) {
    if (!Ext.Array.contains(store.olCollection.getArray(), records[i].olObject)) {
      coll.insertAt(index + i, records[i].olObject);
    }
  }
  store.__updating = false;
}, remove:function(store, records, index) {
  var coll = store.olCollection;
  store.__updating = true;
  Ext.each(records, function(rec) {
    coll.remove(rec.olObject);
  });
  store.__updating = false;
}}, constructor:function(config) {
  config = config || {};
  if (config.data instanceof ol.Collection) {
    this.olCollection = config.data;
  } else {
    this.olCollection = new ol.Collection(config.data || []);
  }
  delete config.data;
  config.data = this.olCollection.getArray();
  this.callParent([config]);
}, destroy:function() {
  delete this.olCollection;
  this.callParent(arguments);
}});
Ext.define('GeoExt.data.store.Features', {extend:'GeoExt.data.store.OlObjects', mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.Collection', 'ol.layer.Vector', 'ol.Map', 'ol.Map#addLayer', 'ol.Map#removeLayer', 'ol.source.Vector', 'ol.source.Vector#getFeatures', 'ol.source.Vector#on', 'ol.source.Vector#un', 'ol.style.Circle', 'ol.style.Fill', 'ol.style.Stroke', 'ol.style.Style'], model:'GeoExt.data.model.Feature', config:{layer:null}, map:null, createLayer:false, layerCreated:false, style:null, 
features:null, passThroughFilter:false, constructor:function(config) {
  var me = this;
  me.onOlCollectionAdd = me.onOlCollectionAdd.bind(me);
  me.onOlCollectionRemove = me.onOlCollectionRemove.bind(me);
  var cfg = config || {};
  if (me.style === null) {
    me.style = new ol.style.Style({image:new ol.style.Circle({radius:6, fill:new ol.style.Fill({color:'#3399CC'}), stroke:new ol.style.Stroke({color:'#fff', width:2})})});
  }
  if (cfg.features !== undefined && cfg.layer !== undefined) {
    throw new Error('GeoExt.data.store.Features should only be' + ' configured with one or less of `features` and `layer`.');
  }
  var configErrorMessage = 'GeoExt.data.store.Features needs to be' + ' configured with a feature collection or with a layer with a' + ' source with a feature collection.';
  if (cfg.features === undefined && cfg.layer === undefined) {
    cfg.data = new ol.Collection;
  } else {
    if (cfg.features !== undefined) {
      if (!(cfg.features instanceof ol.Collection)) {
        throw new Error('Features are not a collection. ' + configErrorMessage);
      }
      cfg.data = cfg.features;
    } else {
      if (!(cfg.layer instanceof ol.layer.BaseVector)) {
        throw new Error('Layer is no vector layer. ' + configErrorMessage);
      }
      if (!cfg.layer.getSource()) {
        throw new Error('Layer has no source. ' + configErrorMessage);
      }
      var features = cfg.layer.getSource().getFeaturesCollection();
      if (!features) {
        throw new Error('Source has no collection. ' + configErrorMessage);
      }
      cfg.data = features;
    }
  }
  me.callParent([cfg]);
  if (me.createLayer === true && !me.layer) {
    me.drawFeaturesOnMap();
  }
  this.olCollection.on('add', this.onOlCollectionAdd);
  this.olCollection.on('remove', this.onOlCollectionRemove);
  if (me.passThroughFilter === true) {
    me.on('filterchange', me.onFilterChange);
  }
}, onOlCollectionAdd:function(evt) {
  var target = evt.target;
  var element = evt.element;
  var idx = Ext.Array.indexOf(target.getArray(), element);
  if (!this.__updating) {
    this.insert(idx, element);
  }
}, onOlCollectionRemove:function(evt) {
  var element = evt.element;
  var idx = this.findBy(function(rec) {
    return rec.olObject === element;
  });
  if (idx !== -1) {
    if (!this.__updating) {
      this.removeAt(idx);
    }
  }
}, applyFields:function(fields) {
  var me = this;
  if (fields) {
    this.setModel(Ext.data.schema.Schema.lookupEntity(me.config.model));
  }
}, getFeatures:function() {
  return this.olCollection;
}, getByFeature:function(feature) {
  return this.getAt(this.findBy(function(record) {
    return record.getFeature() === feature;
  }));
}, destroy:function() {
  this.olCollection.un('add', this.onCollectionAdd);
  this.olCollection.un('remove', this.onCollectionRemove);
  var me = this;
  if (me.map && me.layerCreated === true) {
    me.map.removeLayer(me.layer);
  }
  me.callParent(arguments);
}, drawFeaturesOnMap:function() {
  var me = this;
  me.source = new ol.source.Vector({features:me.getFeatures()});
  me.layer = new ol.layer.Vector({source:me.source, style:me.style});
  if (me.map) {
    me.map.addLayer(me.layer);
  }
  me.layerCreated = true;
}, onFilterChange:function() {
  var me = this;
  if (me.layer && me.layer.getSource() instanceof ol.source.Vector) {
    if (!me.__updating) {
      me.__updating = true;
      me.olCollection.clear();
      me.each(function(rec) {
        me.olCollection.push(rec.getFeature());
      });
      delete me.__updating;
    }
  }
}});
Ext.define('GeoExt.data.store.LayersTree', {extend:'Ext.data.TreeStore', alternateClassName:['GeoExt.data.TreeStore'], requires:['GeoExt.util.Layer'], mixins:['GeoExt.mixin.SymbolCheck'], symbols:['ol.Collection', 'ol.Collection#getArray', 'ol.Collection#once', 'ol.Collection#un', 'ol.layer.Base', 'ol.layer.Base#get', 'ol.layer.Group', 'ol.layer.Group#get', 'ol.layer.Group#getLayers'], model:'GeoExt.data.model.LayerTreeNode', config:{layerGroup:null, folderToggleMode:'classic'}, statics:{KEY_COLLAPSE_REMOVE_OPT_OUT:'__remove_by_collapse__'}, 
inverseLayerOrder:true, collectionEventsSuspended:false, proxy:{type:'memory', reader:{type:'json'}}, root:{expanded:true}, constructor:function() {
  var me = this;
  me.onLayerCollectionRemove = me.onLayerCollectionRemove.bind(me);
  me.onLayerCollectionAdd = me.onLayerCollectionAdd.bind(me);
  me.bindGroupLayerCollectionEvents = me.bindGroupLayerCollectionEvents.bind(me);
  me.unbindGroupLayerCollectionEvents = me.unbindGroupLayerCollectionEvents.bind(me);
  me.callParent(arguments);
  var collection = me.layerGroup.getLayers();
  Ext.each(collection.getArray(), function(layer) {
    me.addLayerNode(layer);
  }, me, me.inverseLayerOrder);
  me.bindGroupLayerCollectionEvents(me.layerGroup);
  me.on({remove:me.handleRemove, noderemove:me.handleNodeRemove, nodeappend:me.handleNodeAppend, nodeinsert:me.handleNodeInsert, scope:me});
}, applyFolderToggleMode:function(folderToggleMode) {
  if (folderToggleMode === 'classic' || folderToggleMode === 'ol3') {
    var rootNode = this.getRootNode();
    if (rootNode) {
      rootNode.cascadeBy({before:function(child) {
        child.set('__toggleMode', folderToggleMode);
      }});
    }
    return folderToggleMode;
  }
  Ext.raise('Invalid folderToggleMode set in ' + this.self.getName() + ': ' + folderToggleMode + "; 'classic' or 'ol3' are valid.");
}, handleRemove:function(store, records) {
  var me = this;
  var keyRemoveOptOut = me.self.KEY_COLLAPSE_REMOVE_OPT_OUT;
  me.suspendCollectionEvents();
  Ext.each(records, function(record) {
    if (keyRemoveOptOut in record && record[keyRemoveOptOut] === true) {
      delete record[keyRemoveOptOut];
      return;
    }
    var layerOrGroup = record.getOlLayer();
    if (layerOrGroup instanceof ol.layer.Group) {
      me.unbindGroupLayerCollectionEvents(layerOrGroup);
    }
    var group = GeoExt.util.Layer.findParentGroup(layerOrGroup, me.getLayerGroup());
    if (!group) {
      group = me.getLayerGroup();
    }
    if (group) {
      group.getLayers().remove(layerOrGroup);
    }
  });
  me.resumeCollectionEvents();
}, handleNodeRemove:function(parentNode, removedNode) {
  var me = this;
  var layerOrGroup = removedNode.getOlLayer();
  if (!layerOrGroup) {
    layerOrGroup = me.getLayerGroup();
  }
  if (layerOrGroup instanceof ol.layer.Group) {
    removedNode.un('beforeexpand', me.onBeforeGroupNodeToggle);
    removedNode.un('beforecollapse', me.onBeforeGroupNodeToggle);
    me.unbindGroupLayerCollectionEvents(layerOrGroup);
  }
  var group = GeoExt.util.Layer.findParentGroup(layerOrGroup, me.getLayerGroup());
  if (group) {
    me.suspendCollectionEvents();
    group.getLayers().remove(layerOrGroup);
    me.resumeCollectionEvents();
  }
}, handleNodeAppend:function(parentNode, appendedNode) {
  var me = this;
  var group = parentNode.getOlLayer();
  var layer = appendedNode.getOlLayer();
  if (!group) {
    group = me.getLayerGroup();
  }
  var layerInGroupIdx = GeoExt.util.Layer.getLayerIndex(layer, group);
  if (layerInGroupIdx === -1) {
    me.suspendCollectionEvents();
    if (me.inverseLayerOrder) {
      group.getLayers().insertAt(0, layer);
    } else {
      group.getLayers().push(layer);
    }
    me.resumeCollectionEvents();
  }
}, handleNodeInsert:function(parentNode, insertedNode, insertedBefore) {
  var me = this;
  var group = parentNode.getOlLayer();
  if (!group) {
    group = me.getLayerGroup();
  }
  var layer = insertedNode.getOlLayer();
  var beforeLayer = insertedBefore.getOlLayer();
  var groupLayers = group.getLayers();
  var beforeIdx = GeoExt.util.Layer.getLayerIndex(beforeLayer, group);
  var insertIdx = beforeIdx;
  if (me.inverseLayerOrder) {
    insertIdx += 1;
  }
  var currentLayerInGroupIdx = GeoExt.util.Layer.getLayerIndex(layer, group);
  if (currentLayerInGroupIdx !== insertIdx && !Ext.Array.contains(groupLayers.getArray(), layer)) {
    me.suspendCollectionEvents();
    groupLayers.insertAt(insertIdx, layer);
    me.resumeCollectionEvents();
  }
}, addLayerNode:function(layerOrGroup) {
  var me = this;
  var group = GeoExt.util.Layer.findParentGroup(layerOrGroup, me.getLayerGroup());
  var layerIdx = GeoExt.util.Layer.getLayerIndex(layerOrGroup, group);
  if (me.inverseLayerOrder) {
    var totalInGroup = group.getLayers().getLength();
    layerIdx = totalInGroup - layerIdx - 1;
  }
  var parentNode;
  if (group === me.getLayerGroup()) {
    parentNode = me.getRootNode();
  } else {
    parentNode = me.getRootNode().findChildBy(function(candidate) {
      return candidate.getOlLayer() === group;
    }, me, true);
  }
  if (!parentNode) {
    return;
  }
  var layerNode = parentNode.insertChild(layerIdx, layerOrGroup);
  if (layerOrGroup instanceof ol.layer.Group) {
    layerNode.on('beforeexpand', me.onBeforeGroupNodeToggle, me);
    layerNode.on('beforecollapse', me.onBeforeGroupNodeToggle, me);
    var childLayers = layerOrGroup.getLayers().getArray();
    Ext.each(childLayers, me.addLayerNode, me, me.inverseLayerOrder);
  }
}, onBeforeGroupNodeToggle:function(node) {
  var keyRemoveOptOut = this.self.KEY_COLLAPSE_REMOVE_OPT_OUT;
  node.cascadeBy(function(child) {
    child[keyRemoveOptOut] = true;
  });
}, bindGroupLayerCollectionEvents:function(layerOrGroup) {
  var me = this;
  if (layerOrGroup instanceof ol.layer.Group) {
    var collection = layerOrGroup.getLayers();
    collection.on('remove', me.onLayerCollectionRemove);
    collection.on('add', me.onLayerCollectionAdd);
    collection.forEach(me.bindGroupLayerCollectionEvents);
  }
}, unbindGroupLayerCollectionEvents:function(layerOrGroup) {
  var me = this;
  if (layerOrGroup instanceof ol.layer.Group) {
    var collection = layerOrGroup.getLayers();
    collection.un('remove', me.onLayerCollectionRemove);
    collection.un('add', me.onLayerCollectionAdd);
    collection.forEach(me.unbindGroupLayerCollectionEvents);
  }
}, onLayerCollectionAdd:function(evt) {
  var me = this;
  if (me.collectionEventsSuspended) {
    return;
  }
  var layerOrGroup = evt.element;
  me.addLayerNode(layerOrGroup);
  me.bindGroupLayerCollectionEvents(layerOrGroup);
}, onLayerCollectionRemove:function(evt) {
  var me = this;
  if (me.collectionEventsSuspended) {
    return;
  }
  var layerOrGroup = evt.element;
  var node = me.getRootNode().findChildBy(function(candidate) {
    return candidate.getOlLayer() === layerOrGroup;
  }, me, true);
  if (!node) {
    return;
  }
  if (layerOrGroup instanceof ol.layer.Group) {
    me.unbindGroupLayerCollectionEvents(layerOrGroup);
  }
  var parent = node.parentNode;
  parent.removeChild(node);
}, suspendCollectionEvents:function() {
  this.collectionEventsSuspended = true;
}, resumeCollectionEvents:function() {
  this.collectionEventsSuspended = false;
}});
Ext.define('GeoExt.util.OGCFilter', {statics:{wfs100GetFeatureXmlTpl:'\x3cwfs:GetFeature service\x3d"WFS" version\x3d"1.0.0"' + ' outputFormat\x3d"JSON"' + ' xmlns:wfs\x3d"http://www.opengis.net/wfs"' + ' xmlns\x3d"http://www.opengis.net/ogc"' + ' xmlns:gml\x3d"http://www.opengis.net/gml"' + ' xmlns:xsi\x3d"http://www.w3.org/2001/XMLSchema-instance"' + ' xsi:schemaLocation\x3d"http://www.opengis.net/wfs' + ' http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"\x3e' + '\x3cwfs:Query typeName\x3d"{0}"\x3e{1}' + 
'\x3c/wfs:Query\x3e' + '\x3c/wfs:GetFeature\x3e', wfs110GetFeatureXmlTpl:'\x3cwfs:GetFeature service\x3d"WFS" version\x3d"1.1.0"' + ' outputFormat\x3d"JSON"' + ' xmlns:wfs\x3d"http://www.opengis.net/wfs"' + ' xmlns\x3d"http://www.opengis.net/ogc"' + ' xmlns:gml\x3d"http://www.opengis.net/gml"' + ' xmlns:xsi\x3d"http://www.w3.org/2001/XMLSchema-instance"' + ' xsi:schemaLocation\x3d"http://www.opengis.net/wfs' + ' http://schemas.opengis.net/wfs/1.0.0/WFS-basic.xsd"\x3e' + '\x3cwfs:Query typeName\x3d"{0}"\x3e{1}' + 
'\x3c/wfs:Query\x3e' + '\x3c/wfs:GetFeature\x3e', wfs200GetFeatureXmlTpl:'\x3cwfs:GetFeature service\x3d"WFS" version\x3d"2.0.0" ' + 'xmlns:wfs\x3d"http://www.opengis.net/wfs/2.0" ' + 'xmlns:fes\x3d"http://www.opengis.net/fes/2.0" ' + 'xmlns:gml\x3d"http://www.opengis.net/gml/3.2" ' + 'xmlns:sf\x3d"http://www.openplans.org/spearfish" ' + 'xmlns:xsi\x3d"http://www.w3.org/2001/XMLSchema-instance" ' + 'xsi:schemaLocation\x3d"http://www.opengis.net/wfs/2.0 ' + 'http://schemas.opengis.net/wfs/2.0/wfs.xsd ' + 
'http://www.opengis.net/gml/3.2 ' + 'http://schemas.opengis.net/gml/3.2.1/gml.xsd"\x3e' + '\x3cwfs:Query typeName\x3d"{0}"\x3e{1}' + '\x3c/wfs:Query\x3e' + '\x3c/wfs:GetFeature\x3e', spatialFilterWfs1xXmlTpl:'\x3c{0}\x3e' + '\x3cPropertyName\x3e{1}\x3c/PropertyName\x3e' + '{2}' + '\x3c/{0}\x3e', spatialFilterWfs2xXmlTpl:'\x3cfes:{0}\x3e' + '\x3cfes:ValueReference\x3e{1}\x3c/fes:ValueReference\x3e' + '{2}' + '\x3c/fes:{0}\x3e', spatialFilterBBoxTpl:'\x3cBBOX\x3e' + '    \x3cPropertyName\x3e{0}\x3c/PropertyName\x3e' + 
'    \x3cgml:Envelope' + '        xmlns:gml\x3d"http://www.opengis.net/gml" srsName\x3d"{1}"\x3e' + '        \x3cgml:lowerCorner\x3e{2} {3}\x3c/gml:lowerCorner\x3e' + '        \x3cgml:upperCorner\x3e{4} {5}\x3c/gml:upperCorner\x3e' + '    \x3c/gml:Envelope\x3e' + '\x3c/BBOX\x3e', gml32PolygonTpl:'\x3cgml:Polygon gml:id\x3d"P1" ' + 'srsName\x3d"urn:ogc:def:crs:{0}" srsDimension\x3d"2"\x3e' + '\x3cgml:exterior\x3e' + '\x3cgml:LinearRing\x3e' + '\x3cgml:posList\x3e{1}\x3c/gml:posList\x3e' + '\x3c/gml:LinearRing\x3e' + 
'\x3c/gml:exterior\x3e' + '\x3c/gml:Polygon\x3e', gml32LineStringTpl:'\x3cgml:LineString gml:id\x3d"L1" ' + 'srsName\x3d"urn:ogc:def:crs:{0}" srsDimension\x3d"2"\x3e' + '\x3cgml:posList\x3e{1}\x3c/gml:posList\x3e' + '\x3c/gml:LineString\x3e', gml32PointTpl:'\x3cgml:Point gml:id\x3d"Pt1" ' + 'srsName\x3d"urn:ogc:def:crs:{0}" srsDimension\x3d"2"\x3e' + '\x3cgml:pos\x3e{1}\x3c/gml:pos\x3e' + '\x3c/gml:Point\x3e', filter20StartElementStr:'\x3cfes:Filter ' + 'xsi:schemaLocation\x3d"http://www.opengis.net/fes/2.0 ' + 
'http://schemas.opengis.net/filter/2.0/filterAll.xsd ' + 'http://www.opengis.net/gml/3.2 ' + 'http://schemas.opengis.net/gml/3.2.1/gml.xsd" ' + 'xmlns:fes\x3d"http://www.opengis.net/fes/2.0" ' + 'xmlns:gml\x3d"http://www.opengis.net/gml/3.2" ' + 'xmlns:xsi\x3d"http://www.w3.org/2001/XMLSchema-instance"\x3e', topologicalOrSpatialFilterOperators:['intersect', 'within', 'contains', 'equals', 'disjoint', 'crosses', 'touches', 'overlaps', 'bbox'], getOgcWmsFilterFromExtJsFilter:function(filters, combinator) {
  return GeoExt.util.OGCFilter.getOgcFilterFromExtJsFilter(filters, 'wms', combinator);
}, getOgcWfsFilterFromExtJsFilter:function(filters, combinator, wfsVersion) {
  return GeoExt.util.OGCFilter.getOgcFilterFromExtJsFilter(filters, 'wfs', combinator, wfsVersion);
}, getOgcFilterFromExtJsFilter:function(filters, type, combinator, wfsVersion) {
  if (!Ext.isDefined(filters) || !Ext.isArray(filters)) {
    Ext.Logger.error('Invalid filter argument given to ' + 'GeoExt.util.OGCFilter. You need to pass an array of ' + '"Ext.util.Filter"');
    return;
  }
  if (Ext.isEmpty(filters)) {
    return null;
  }
  var omitNamespaces = false;
  if (!Ext.isEmpty(type) && type.toLowerCase() === 'wms') {
    omitNamespaces = true;
  }
  var ogcFilters = [];
  var ogcUtil = GeoExt.util.OGCFilter;
  var filterBody;
  Ext.each(filters, function(filter) {
    filterBody = ogcUtil.getOgcFilterBodyFromExtJsFilterObject(filter, wfsVersion);
    if (filterBody) {
      ogcFilters.push(filterBody);
    }
  });
  return ogcUtil.combineFilters(ogcFilters, combinator, omitNamespaces, wfsVersion);
}, getOgcFilterBodyFromExtJsFilterObject:function(filter, wfsVersion) {
  if (!Ext.isDefined(filter)) {
    Ext.Logger.error('Invalid filter argument given to ' + 'GeoExt.util.OGCFilter. You need to pass an instance of ' + '"Ext.util.Filter"');
    return;
  }
  var property = filter.getProperty();
  var operator = filter.getOperator();
  var value = filter.getValue();
  var srsName;
  if (filter.type === 'spatial') {
    srsName = filter.srsName;
  }
  if (Ext.isEmpty(property) || Ext.isEmpty(operator) || Ext.isEmpty(value)) {
    Ext.Logger.warn('Skipping a filter as some values ' + 'seem to be undefined');
    return;
  }
  if (filter.isDateValue) {
    if (filter.getDateFormat) {
      value = Ext.Date.format(filter.getValue(), filter.getDateFormat());
    } else {
      value = Ext.Date.format(filter.getValue(), 'Y-m-d');
    }
  }
  return GeoExt.util.OGCFilter.getOgcFilter(property, operator, value, wfsVersion, srsName);
}, buildWfsGetFeatureWithFilter:function(filters, combinator, wfsVersion, typeName) {
  var filter = GeoExt.util.OGCFilter.getOgcWfsFilterFromExtJsFilter(filters, combinator, wfsVersion);
  var tpl = GeoExt.util.OGCFilter.wfs100GetFeatureXmlTpl;
  if (wfsVersion && wfsVersion === '1.1.0') {
    tpl = GeoExt.util.OGCFilter.wfs110GetFeatureXmlTpl;
  } else {
    if (wfsVersion && wfsVersion === '2.0.0') {
      tpl = GeoExt.util.OGCFilter.wfs200GetFeatureXmlTpl;
    }
  }
  return Ext.String.format(tpl, typeName, filter);
}, getOgcFilter:function(property, operator, value, wfsVersion, srsName) {
  if (Ext.isEmpty(property) || Ext.isEmpty(operator) || Ext.isEmpty(value)) {
    Ext.Logger.error('Invalid argument given to method ' + '`getOgcFilter`. You need to supply property, ' + 'operator and value.');
    return;
  }
  var ogcFilterType;
  var closingTag;
  var propName = 'PropertyName';
  var isWfs20 = !Ext.isEmpty(wfsVersion) && wfsVersion === '2.0.0';
  if (isWfs20) {
    propName = 'fes:ValueReference';
  }
  if (!(value instanceof ol.geom.Geometry)) {
    value = value.toString().replace(/(^['])/g, '');
    value = value.toString().replace(/([']$)/g, '');
  }
  var wfsPrefix = isWfs20 ? 'fes:' : '';
  switch(operator) {
    case '\x3d\x3d':
    case '\x3d':
    case 'eq':
      ogcFilterType = wfsPrefix + 'PropertyIsEqualTo';
      break;
    case '!\x3d\x3d':
    case '!\x3d':
    case 'ne':
      ogcFilterType = wfsPrefix + 'PropertyIsNotEqualTo';
      break;
    case 'lt':
    case '\x3c':
      ogcFilterType = wfsPrefix + 'PropertyIsLessThan';
      break;
    case 'lte':
    case '\x3c\x3d':
      ogcFilterType = wfsPrefix + 'PropertyIsLessThanOrEqualTo';
      break;
    case 'gt':
    case '\x3e':
      ogcFilterType = wfsPrefix + 'PropertyIsGreaterThan';
      break;
    case 'gte':
    case '\x3e\x3d':
      ogcFilterType = wfsPrefix + 'PropertyIsGreaterThanOrEqualTo';
      break;
    case 'like':
      value = '*' + value + '*';
      var likeFilterTpl = '\x3c{0}PropertyIsLike wildCard\x3d"*" singleChar\x3d"."' + ' escape\x3d"!" matchCase\x3d"false"\x3e' + '\x3c' + propName + '\x3e' + property + '\x3c/' + propName + '\x3e' + '\x3c{0}Literal\x3e' + value + '\x3c/{0}Literal\x3e' + '\x3c/{0}PropertyIsLike\x3e';
      return Ext.String.format(likeFilterTpl, wfsPrefix);
    case 'in':
      ogcFilterType = wfsPrefix + 'Or';
      var values = value;
      if (!Ext.isArray(value)) {
        value = value.replace(/([()'])/g, '');
        values = value.split(',');
      }
      var filters = '';
      Ext.each(values || value, function(val) {
        filters += '\x3c' + wfsPrefix + 'PropertyIsEqualTo\x3e' + '\x3c' + propName + '\x3e' + property + '\x3c/' + propName + '\x3e' + '\x3c' + wfsPrefix + 'Literal\x3e' + val + '\x3c/' + wfsPrefix + 'Literal\x3e' + '\x3c/' + wfsPrefix + 'PropertyIsEqualTo\x3e';
      });
      ogcFilterType = '\x3c' + ogcFilterType + '\x3e';
      var inFilter;
      closingTag = Ext.String.insert(ogcFilterType, '/', 1);
      if (values.length > 1) {
        inFilter = ogcFilterType + filters + closingTag;
      } else {
        inFilter = filters;
      }
      return inFilter;
    case 'intersect':
    case 'within':
    case 'contains':
    case 'equals':
    case 'disjoint':
    case 'crosses':
    case 'touches':
    case 'overlaps':
      switch(operator) {
        case 'equals':
          ogcFilterType = 'Equals';
          break;
        case 'contains':
          ogcFilterType = 'Contains';
          break;
        case 'within':
          ogcFilterType = 'Within';
          break;
        case 'disjoint':
          ogcFilterType = 'Disjoint';
          break;
        case 'touches':
          ogcFilterType = 'Touches';
          break;
        case 'crosses':
          ogcFilterType = 'Crosses';
          break;
        case 'overlaps':
          ogcFilterType = 'Overlaps';
          break;
        case 'intersect':
          ogcFilterType = 'Intersects';
          break;
        default:
          Ext.Logger.warn('Method `getOgcFilter` could not ' + 'handle the given topological operator: ' + operator);
          return;
      }var gmlElement = GeoExt.util.OGCFilter.getGmlElementForGeometry(value, srsName, wfsVersion);
      var spatialTpl = wfsVersion !== '2.0.0' ? GeoExt.util.OGCFilter.spatialFilterWfs1xXmlTpl : GeoExt.util.OGCFilter.spatialFilterWfs2xXmlTpl;
      return Ext.String.format(spatialTpl, ogcFilterType, property, gmlElement);
    case 'bbox':
      var llx;
      var lly;
      var urx;
      var ury;
      value = value.getExtent();
      llx = value[0];
      lly = value[1];
      urx = value[2];
      ury = value[3];
      return Ext.String.format(GeoExt.util.OGCFilter.spatialFilterBBoxTpl, property, srsName, llx, lly, urx, ury);
    default:
      Ext.Logger.warn('Method `getOgcFilter` could not ' + 'handle the given operator: ' + operator);
      return;
  }
  ogcFilterType = '\x3c' + ogcFilterType + '\x3e';
  closingTag = Ext.String.insert(ogcFilterType, '/', 1);
  var literalStr = isWfs20 ? '\x3cfes:Literal\x3e{2}\x3c/fes:Literal\x3e' : '\x3cLiteral\x3e{2}\x3c/Literal\x3e';
  var tpl = '' + '{0}' + '\x3c' + propName + '\x3e{1}\x3c/' + propName + '\x3e' + literalStr + '{3}';
  var filter = Ext.String.format(tpl, ogcFilterType, property, value, closingTag);
  return filter;
}, getGmlElementForGeometry:function(geometry, srsName, wfsVersion) {
  if (wfsVersion === '2.0.0') {
    var geometryType = geometry.getType();
    var staticMe = GeoExt.util.OGCFilter;
    var isMulti = geometryType.indexOf('Multi') > -1;
    switch(geometryType) {
      case 'Polygon':
      case 'MultiPolygon':
        var coordsPoly = geometry.getCoordinates()[0];
        if (isMulti) {
          coordsPoly = coordsPoly[0];
        }
        return Ext.String.format(staticMe.gml32PolygonTpl, srsName, staticMe.flattenCoordinates(coordsPoly));
      case 'LineString':
      case 'MultiLineString':
        var coordsLine = geometry.getCoordinates();
        if (isMulti) {
          coordsLine = coordsLine[0];
        }
        return Ext.String.format(staticMe.gml32LineStringTpl, srsName, staticMe.flattenCoordinates(coordsLine));
      case 'Point':
      case 'MultiPoint':
        var coordsPt = geometry.getCoordinates();
        if (isMulti) {
          coordsPt = coordsPt[0];
        }
        return Ext.String.format(staticMe.gml32PointTpl, srsName, staticMe.flattenCoordinates(coordsPt));
      default:
        return '';
    }
  } else {
    var format = new ol.format.GML3({srsName:srsName});
    var geometryNode = format.writeGeometryNode(geometry, {dataProjection:srsName});
    if (!geometryNode) {
      Ext.Logger.warn('Could not serialize geometry');
      return null;
    }
    var childNodes = geometryNode.children || geometryNode.childNodes;
    var serializer = new XMLSerializer;
    var geomNode = childNodes[0];
    var serializedValue = serializer.serializeToString(geomNode);
    return serializedValue;
  }
}, flattenCoordinates:function(coordArray) {
  return Ext.Array.map(coordArray, function(cp) {
    return cp.join(' ');
  }).join(' ');
}, combineFilterBodies:function(filterBodies, combinator, wfsVersion) {
  if (!Ext.isDefined(filterBodies) || !Ext.isArray(filterBodies) || filterBodies.length === 0) {
    Ext.Logger.error('Invalid "filterBodies" argument given to ' + 'GeoExt.util.OGCFilter. You need to pass an array of ' + 'OGC filter bodies as XML string');
    return;
  }
  var combineWith = combinator || 'And';
  var isWfs20 = !Ext.isEmpty(wfsVersion) && wfsVersion === '2.0.0';
  var wfsPrefix = isWfs20 ? 'fes:' : '';
  var ogcFilterType = wfsPrefix + combineWith;
  var openingTag = ogcFilterType = '\x3c' + ogcFilterType + '\x3e';
  var closingTag = Ext.String.insert(openingTag, '/', 1);
  var combinedFilterBodies = '';
  if (filterBodies.length > 1) {
    Ext.each(filterBodies, function(filterBody) {
      combinedFilterBodies += filterBody;
    });
    combinedFilterBodies = openingTag + combinedFilterBodies + closingTag;
  } else {
    combinedFilterBodies = filterBodies[0];
  }
  return combinedFilterBodies;
}, combineFilters:function(filters, combinator, omitNamespaces, wfsVersion) {
  var staticMe = GeoExt.util.OGCFilter;
  var defaultCombineWith = 'And';
  var combineWith = combinator || defaultCombineWith;
  var numFilters = filters.length;
  var parts = [];
  var ns = omitNamespaces ? '' : 'ogc';
  var omitNamespaceFromWfsVersion = !wfsVersion || wfsVersion === '1.0.0';
  if (!Ext.isEmpty(wfsVersion) && wfsVersion === '2.0.0' && !omitNamespaces) {
    parts.push(staticMe.filter20StartElementStr);
  } else {
    parts.push('\x3cFilter' + (omitNamespaces ? '' : ' xmlns\x3d"http://www.opengis.net/' + ns + '"' + ' xmlns:gml\x3d"http://www.opengis.net/gml"') + '\x3e');
    omitNamespaceFromWfsVersion = true;
  }
  parts.push();
  if (numFilters > 1) {
    parts.push('\x3c' + (omitNamespaces || omitNamespaceFromWfsVersion ? '' : 'fes:') + combineWith + '\x3e');
  }
  Ext.each(filters, function(filter) {
    parts.push(filter);
  });
  if (numFilters > 1) {
    parts.push('\x3c/' + (omitNamespaces || omitNamespaceFromWfsVersion ? '' : 'fes:') + combineWith + '\x3e');
  }
  parts.push('\x3c/' + (omitNamespaces || omitNamespaceFromWfsVersion ? '' : 'fes:') + 'Filter\x3e');
  return parts.join('');
}, createSpatialFilter:function(operator, typeName, value, srsName) {
  if (!Ext.Array.contains(GeoExt.util.OGCFilter.topologicalOrSpatialFilterOperators, operator)) {
    return null;
  }
  return new Ext.util.Filter({type:'spatial', srsName:srsName, operator:operator, property:typeName, value:value});
}}});
Ext.define('GeoExt.data.store.WfsFeatures', {extend:'GeoExt.data.store.Features', mixins:['GeoExt.mixin.SymbolCheck', 'GeoExt.util.OGCFilter'], autoLoad:true, remoteSort:true, remoteFilter:true, logicalFilterCombinator:'And', requestMethod:'GET', service:'WFS', version:'2.0.0', request:'GetFeature', typeName:null, srsName:null, outputFormat:'application/json', startIndex:0, count:null, propertyName:null, startIndexOffset:0, format:null, layerAttribution:null, layerOptions:null, cacheFeatureCount:false, 
featureCountOutputFormat:'gml3', debounce:300, constructor:function(config) {
  var me = this;
  config = config || {};
  config.pageSize = config.count || me.count;
  if (config.pageSize > 0) {
    var startIndex = config.startIndex || me.startIndex;
    config.currentPage = Math.floor(startIndex / config.pageSize) + 1;
  }
  var createLayer = config.createLayer;
  config.createLayer = false;
  config.passThroughFilter = false;
  me.callParent([config]);
  me.loadWfsTask_ = new Ext.util.DelayedTask;
  if (!me.url) {
    Ext.raise('No URL given to WfsFeaturesStore');
  }
  if (createLayer) {
    me.source = new ol.source.Vector({features:new ol.Collection, attributions:me.layerAttribution});
    var layerOptions = {source:me.source, style:me.style};
    if (me.layerOptions) {
      Ext.applyIf(layerOptions, me.layerOptions);
    }
    me.layer = new ol.layer.Vector(layerOptions);
    me.layerCreated = true;
  }
  if (me.cacheFeatureCount === true) {
    me.cacheTotalFeatureCount(!me.autoLoad);
  } else {
    if (me.autoLoad) {
      me.loadWfs();
    }
  }
  me.on('beforeload', me.loadWfs, me);
  if (me.map && me.layer) {
    me.map.addLayer(me.layer);
  }
}, getTotalFeatureCount:function(wfsResponse) {
  var totalCount = -1;
  var contentType = wfsResponse.getResponseHeader('Content-Type');
  try {
    if (contentType.indexOf('application/json') !== -1) {
      var respJson = Ext.decode(wfsResponse.responseText);
      totalCount = respJson.numberMatched;
    } else {
      var xml = wfsResponse.responseXML;
      if (xml && xml.firstChild) {
        var total = xml.firstChild.getAttribute('numberMatched');
        totalCount = parseInt(total, 10);
      }
    }
  } catch (e$1) {
    Ext.Logger.warn('Error while detecting total feature count from ' + 'WFS response');
  }
  return totalCount;
}, createSortByParameter:function() {
  var me = this;
  var sortStrings = [];
  var direction;
  var property;
  me.getSorters().each(function(sorter) {
    direction = sorter.getDirection();
    property = sorter.getProperty();
    sortStrings.push(Ext.String.format('{0} {1}', property, direction));
  });
  return sortStrings.join(',');
}, createOgcFilter:function() {
  var me = this;
  var filters = [];
  me.getFilters().each(function(item) {
    filters.push(item);
  });
  if (filters.length === 0) {
    return null;
  }
  return GeoExt.util.OGCFilter.getOgcWfsFilterFromExtJsFilter(filters, me.logicalFilterCombinator, me.version);
}, cacheTotalFeatureCount:function(skipLoad) {
  var me = this;
  var url = me.url;
  me.cachedTotalCount = 0;
  var params = {service:me.service, version:me.version, request:me.request, typeName:me.typeName, outputFormat:me.featureCountOutputFormat, resultType:'hits'};
  Ext.Ajax.request({url:url, method:me.requestMethod, params:params, success:function(resp) {
    me.cachedTotalCount = me.getTotalFeatureCount(resp);
    if (!skipLoad) {
      me.loadWfs();
    }
  }, failure:function(resp) {
    Ext.Logger.warn('Error while requesting features from WFS: ' + resp.responseText + ' Status: ' + resp.status);
  }});
}, onFilterChange:function() {
  var me = this;
  if (me.getFilters() && me.getFilters().length > 0) {
    me.loadWfs();
  }
}, createParameters:function() {
  var me = this;
  var params = {service:me.service, version:me.version, request:me.request, typeName:me.typeName, outputFormat:me.outputFormat};
  if (me.propertyName !== null) {
    params.propertyName = me.propertyName;
  }
  if (me.srsName) {
    params.srsName = me.srsName;
  } else {
    if (me.map) {
      params.srsName = me.map.getView().getProjection().getCode();
    }
  }
  if (me.remoteSort === true) {
    var sortBy = me.createSortByParameter();
    if (sortBy) {
      params.sortBy = sortBy;
    }
  }
  if (me.remoteFilter === true) {
    var filter = me.createOgcFilter();
    if (filter) {
      params.filter = filter;
    }
  }
  if (me.pageSize) {
    me.startIndex = (me.currentPage - 1) * me.pageSize + me.startIndexOffset;
    params.startIndex = me.startIndex;
    params.count = me.pageSize;
  }
  return params;
}, loadWfs:function() {
  var me = this;
  if (me.loadWfsTask_.id === null) {
    me.loadWfsTask_.delay(me.debounce, function() {
    });
    me.loadWfsInternal();
  } else {
    me.loadWfsTask_.delay(me.debounce, function() {
      me.loadWfsInternal();
    });
  }
}, loadWfsInternal:function() {
  var me = this;
  var url = me.url;
  var params = me.createParameters();
  if (me.fireEvent('gx-wfsstoreload-beforeload', me, params) === false) {
    return;
  }
  Ext.Ajax.request({url:url, method:me.requestMethod, params:params, success:function(resp) {
    if (!me.format) {
      Ext.Logger.warn('No format given for WfsFeatureStore. ' + 'Skip parsing feature data.');
      return;
    }
    if (me.cacheFeatureCount === true) {
      me.totalCount = me.cachedTotalCount;
    } else {
      me.totalCount = me.getTotalFeatureCount(resp);
    }
    var wfsFeats = [];
    try {
      wfsFeats = me.format.readFeatures(resp.responseText);
    } catch (error) {
      Ext.Logger.warn('Error parsing features into the ' + 'OpenLayers format. Check the server response.');
    }
    me.setData(wfsFeats);
    if (me.layer) {
      me.source.clear();
      me.source.addFeatures(wfsFeats);
    }
    me.fireEvent('gx-wfsstoreload', me, wfsFeats, true);
  }, failure:function(resp) {
    if (resp.aborted !== true) {
      Ext.Logger.warn('Error while requesting features from WFS: ' + resp.responseText + ' Status: ' + resp.status);
    }
    me.fireEvent('gx-wfsstoreload', me, null, false);
  }});
}, doDestroy:function() {
  var me = this;
  if (me.loadWfsTask_.id !== null) {
    me.loadWfsTask_.cancel();
  }
  me.callParent(arguments);
}});
Ext.define('GeoExt.plugin.layertreenode.ContextMenu', {extend:'Ext.plugin.Abstract', alias:'plugin.gx_layertreenode_contextmenu', contextUi:null, recreateContextUi:true, init:function(treeColumn) {
  var me = this;
  if (!(treeColumn instanceof Ext.tree.Column)) {
    Ext.log.warn('Plugin shall only be applied to instances of' + ' Ext.tree.Column');
    return;
  }
  treeColumn.on('contextmenu', me.onContextMenu, me);
}, onContextMenu:function(treeView, td, rowIdx, colIdx, evt, layerTreeNode) {
  var me = this;
  evt.preventDefault();
  if (me.contextUi && me.recreateContextUi) {
    me.contextUi.destroy();
    me.contextUi = null;
  }
  if (!me.contextUi) {
    me.contextUi = me.createContextUi(layerTreeNode);
  }
  me.showContextUi(evt.getXY());
}, createContextUi:function(layerTreeNode) {
  Ext.Logger.warn('gx_layertreenode_contextmenu: createContextUi is ' + "not overwritten. It is very likely that the plugin won't work");
  return null;
}, showContextUi:function(clickPos) {
  var me = this;
  if (me.contextUi && clickPos) {
    me.contextUi.showAt(clickPos);
  }
}});
Ext.define('GeoExt.form.field.GeocoderComboBox', {extend:'Ext.form.field.ComboBox', alias:['widget.gx_geocoder_combo', 'widget.gx_geocoder_combobox', 'widget.gx_geocoder_field'], requires:['Ext.data.JsonStore'], mixins:['GeoExt.mixin.SymbolCheck'], map:null, locationLayer:null, locationLayerStyle:null, store:null, proxyRootProperty:null, displayField:'name', displayValueMapping:'display_name', valueField:'extent', queryParam:'q', emptyText:'Search for a location', minChars:3, queryDelay:100, url:'https://nominatim.openstreetmap.org/search?format\x3djson', 
srs:'EPSG:4326', zoom:10, showLocationOnMap:true, restrictToMapExtent:false, initComponent:function() {
  var me = this;
  me.updateExtraParams = me.updateExtraParams.bind(me);
  if (!me.store) {
    me.store = Ext.create('Ext.data.JsonStore', {fields:[{name:'name', mapping:me.displayValueMapping}, {name:'extent', convert:me.convertToExtent}, {name:'coordinate', convert:me.convertToCoordinate}], proxy:{type:'ajax', url:me.url, reader:{type:'json', rootProperty:me.proxyRootProperty}}});
  }
  if (!me.locationLayer) {
    me.locationLayer = new ol.layer.Vector({source:new ol.source.Vector, style:me.locationLayerStyle !== null ? me.locationLayerStyle : undefined});
    if (me.map) {
      me.map.addLayer(me.locationLayer);
    }
  }
  me.callParent(arguments);
  me.on({unRestrictMapExtent:me.unRestrictExtent, restrictToMapExtent:me.restrictExtent, select:me.onSelect, focus:me.onFocus, scope:me});
  if (me.restrictToMapExtent) {
    me.restrictExtent();
  }
}, restrictExtent:function() {
  var me = this;
  me.map.on('moveend', me.updateExtraParams);
  me.updateExtraParams();
}, updateExtraParams:function() {
  var me = this;
  var mapSize = me.map.getSize();
  var mv = me.map.getView();
  var extent = mv.calculateExtent(mapSize);
  me.addMapExtentParams(extent, mv.getProjection());
}, addMapExtentParams:function(extent, projection) {
  var me = this;
  if (!projection) {
    projection = me.map.getView().getProjection();
  }
  var ll = ol.proj.transform([extent[0], extent[1]], projection, 'EPSG:4326');
  var ur = ol.proj.transform([extent[2], extent[3]], projection, 'EPSG:4326');
  ll = Ext.Array.map(ll, function(val) {
    return Math.min(Math.max(val, -180), 180);
  });
  ur = Ext.Array.map(ur, function(val) {
    return Math.min(Math.max(val, -180), 180);
  });
  var viewBoxStr = [ll.join(','), ur.join(',')].join(',');
  if (me.store && me.store.getProxy()) {
    me.store.getProxy().setExtraParam('viewbox', viewBoxStr);
    me.store.getProxy().setExtraParam('bounded', '1');
  }
}, unRestrictExtent:function() {
  var me = this;
  me.map.un('moveend', me.updateExtraParams);
  me.removeMapExtentParams();
}, removeMapExtentParams:function() {
  var me = this;
  if (me.store && me.store.getProxy()) {
    me.store.getProxy().setExtraParam('viewbox', undefined);
    me.store.getProxy().setExtraParam('bounded', undefined);
  }
}, convertToExtent:function(v, rec) {
  var rawExtent = rec.get('boundingbox');
  var minx = parseFloat(rawExtent[2], 10);
  var miny = parseFloat(rawExtent[0], 10);
  var maxx = parseFloat(rawExtent[3], 10);
  var maxy = parseFloat(rawExtent[1], 10);
  return [minx, miny, maxx, maxy];
}, convertToCoordinate:function(v, rec) {
  return [parseFloat(rec.get('lon'), 10), parseFloat(rec.get('lat'), 10)];
}, drawLocationFeatureOnMap:function(coordOrExtent) {
  var me = this;
  var geom;
  if (coordOrExtent.length === 2) {
    geom = new ol.geom.Point(coordOrExtent);
  } else {
    if (coordOrExtent.length === 4) {
      geom = ol.geom.Polygon.fromExtent(coordOrExtent);
    }
  }
  if (geom) {
    var feat = new ol.Feature({geometry:geom});
    me.locationLayer.getSource().clear();
    me.locationLayer.getSource().addFeature(feat);
  }
}, removeLocationFeature:function() {
  this.locationLayer.getSource().clear();
}, onFocus:function() {
  var me = this;
  me.clearValue();
  me.removeLocationFeature();
}, onSelect:function(combo, record) {
  var me = this;
  if (!me.map) {
    Ext.Logger.warn('No map configured in ' + 'GeoExt.form.field.GeocoderComboBox. Skip zoom to selection.');
    return;
  }
  var value = record.get(me.valueField);
  var projValue;
  var olMapView = me.map.getView();
  var targetProj = olMapView.getProjection().getCode();
  if (value.length === 2) {
    projValue = ol.proj.transform(value, me.srs, targetProj);
    olMapView.setCenter(projValue);
    olMapView.setZoom(me.zoom);
  } else {
    if (value.length === 4) {
      projValue = ol.proj.transformExtent(value, me.srs, targetProj);
      olMapView.fit(projValue);
    }
  }
  if (me.showLocationOnMap) {
    me.drawLocationFeatureOnMap(projValue);
  }
}});
Ext.define('GeoExt.selection.FeatureModelMixin', {extend:'Ext.Mixin', mixinConfig:{after:{bindComponent:'bindFeatureModel'}, before:{destroy:'unbindOlEvents', constructor:'onConstruct', onSelectChange:'beforeSelectChange'}}, config:{layer:null, map:null, mapSelection:false, selectionTolerance:12, selectStyle:new ol.style.Style({image:new ol.style.Circle({radius:6, fill:new ol.style.Fill({color:'rgba(255,255,255,0.8)'}), stroke:new ol.style.Stroke({color:'darkblue', width:2})}), fill:new ol.style.Fill({color:'rgba(255,255,255,0.8)'}), 
stroke:new ol.style.Stroke({color:'darkblue', width:2})})}, existingFeatStyles:{}, mapClickRegistered:false, selectedFeatureAttr:'gx_selected', selectedFeatures:null, onConstruct:function() {
  var me = this;
  me.onSelectFeatAdd = me.onSelectFeatAdd.bind(me);
  me.onSelectFeatRemove = me.onSelectFeatRemove.bind(me);
  me.onFeatureClick = me.onFeatureClick.bind(me);
}, bindFeatureModel:function() {
  var me = this;
  if (!me.layer || !(me.layer instanceof ol.layer.Vector)) {
    var store = me.getStore();
    if (store && store.getLayer && store.getLayer() && store.getLayer() instanceof ol.layer.Vector) {
      me.layer = store.getLayer();
    }
  }
  me.bindOlEvents();
}, bindOlEvents:function() {
  if (!this.bound_) {
    var me = this;
    me.selectedFeatures = new ol.Collection;
    me.selectedFeatures.on('add', me.onSelectFeatAdd);
    me.selectedFeatures.on('remove', me.onSelectFeatRemove);
    if (me.mapSelection && me.layer && me.map) {
      me.map.on('singleclick', me.onFeatureClick);
      me.mapClickRegistered = true;
    }
    this.bound_ = true;
  }
}, unbindOlEvents:function() {
  var me = this;
  if (me.selectedFeatures) {
    me.selectedFeatures.un('add', me.onSelectFeatAdd);
    me.selectedFeatures.un('remove', me.onSelectFeatRemove);
  }
  if (me.mapClickRegistered) {
    me.map.un('singleclick', me.onFeatureClick);
    me.mapClickRegistered = false;
  }
}, onSelectFeatAdd:function(evt) {
  var me = this;
  var feat = evt.element;
  if (feat) {
    if (feat.getStyle()) {
      var fid = feat.getId() || me.getRandomFid();
      me.existingFeatStyles[fid] = feat.getStyle();
      feat.setId(fid);
    }
    feat.setStyle(me.selectStyle);
  }
}, onSelectFeatRemove:function(evt) {
  var me = this;
  var feat = evt.element;
  if (feat) {
    var fid = feat.getId();
    if (fid && me.existingFeatStyles[fid]) {
      feat.setStyle(me.existingFeatStyles[fid]);
      delete me.existingFeatStyles[fid];
    } else {
      feat.setStyle();
    }
  }
}, onFeatureClick:function(evt) {
  var me = this;
  var feat = me.map.forEachFeatureAtPixel(evt.pixel, function(feature) {
    return feature;
  }, {layerFilter:function(layer) {
    return layer === me.layer;
  }, hitTolerance:me.selectionTolerance});
  if (feat) {
    me.selectMapFeature(feat);
  }
}, selectMapFeature:function(feature) {
  var me = this;
  var row = me.store.findBy(function(record, id) {
    return record.getFeature() === feature;
  });
  if (me.getSelectionMode() === 'SINGLE') {
    me.deselectAll();
  }
  if (feature.get(me.selectedFeatureAttr)) {
    me.deselect(row);
  } else {
    if (row !== -1 && !me.isSelected(row)) {
      me.select(row, !this.singleSelect);
      me.view.focusRow(row);
    }
  }
}, beforeSelectChange:function(record, isSelected) {
  var me = this;
  var selFeature = record.getFeature();
  var silent = true;
  selFeature.set(me.selectedFeatureAttr, isSelected, silent);
  if (isSelected) {
    me.selectedFeatures.push(selFeature);
  } else {
    me.selectedFeatures.remove(selFeature);
  }
}, getRandomFid:function() {
  return (new Date).getTime() + '' + Math.floor(Math.random() * 11);
}});
Ext.define('GeoExt.selection.FeatureCheckboxModel', {extend:'Ext.selection.CheckboxModel', alias:['selection.featurecheckboxmodel'], mixins:['GeoExt.selection.FeatureModelMixin']});
Ext.define('GeoExt.selection.FeatureRowModel', {alternateClassName:'GeoExt.selection.FeatureModel', extend:'Ext.selection.RowModel', alias:['selection.featuremodel', 'selection.featurerowmodel'], mixins:['GeoExt.selection.FeatureModelMixin']});
Ext.define('GeoExt.state.PermalinkProvider', {extend:'Ext.state.Provider', requires:[], alias:'state.gx_permalinkprovider', mapState:null, constructor:function() {
  var me = this;
  me.callParent(arguments);
  if (window.location.hash !== '') {
    me.mapState = me.readPermalinkHash(window.location.hash);
  }
}, readPermalinkHash:function(plHash) {
  var mapState;
  var hash = plHash.replace('#map\x3d', '');
  var parts = hash.split('/');
  if (parts.length === 4) {
    mapState = {zoom:parseInt(parts[0], 10), center:[parseFloat(parts[1]), parseFloat(parts[2])], rotation:parseFloat(parts[3])};
  }
  return mapState;
}, getPermalinkHash:function(doRound) {
  var me = this;
  var mapState = me.mapState;
  var centerX = mapState.center[0];
  var centerY = mapState.center[1];
  if (doRound) {
    centerX = Math.round(centerX * 100) / 100;
    centerY = Math.round(centerY * 100) / 100;
  }
  var hash = '#map\x3d' + mapState.zoom + '/' + centerX + '/' + centerY + '/' + mapState.rotation;
  return hash;
}, set:function(name, value) {
  var me = this;
  me.mapState = value;
  me.callParent(arguments);
}});
Ext.define('GeoExt.toolbar.WfsPaging', {extend:'Ext.toolbar.Paging', xtype:'gx_wfspaging_toolbar', onBindStore:function() {
  var me = this;
  me.callParent(arguments);
  me.store.on('gx-wfsstoreload', me.onLoad, me);
}});
