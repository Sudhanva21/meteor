
UI.If = function (argFunc, contentBlock, elseContentBlock) {
  checkBlockHelperArguments('If', argFunc, contentBlock, elseContentBlock);

  return function () {
    if (getCondition(argFunc))
      return contentBlock;
    else
      return elseContentBlock || null;
  };
};


UI.Unless = function (argFunc, contentBlock, elseContentBlock) {
  checkBlockHelperArguments('Unless', argFunc, contentBlock, elseContentBlock);

  return function () {
    if (! getCondition(argFunc))
      return contentBlock;
    else
      return elseContentBlock || null;
  };
};

// Unlike Spacebars.With, there's no else case and no conditional logic.
//
// We don't do any reactive emboxing of `argFunc` here; it should be done
// by the caller if efficiency and/or number of calls to the data source
// is important.
UI.With = function (argFunc, contentBlock) {
  checkBlockHelperArguments('With', argFunc, contentBlock);

  var block = UI.block(function () {
    return contentBlock;
  });
  block.data = argFunc;

  return block;
};

UI.Each = function (argFunc, contentBlock, elseContentBlock) {
  checkBlockHelperArguments('Each', argFunc, contentBlock, elseContentBlock);

  return UI.EachImpl.extend({
    __sequence: argFunc,
    __content: contentBlock,
    __elseContent: elseContentBlock
  });
};

var checkBlockHelperArguments = function (which, argFunc, contentBlock, elseContentBlock) {
  if (typeof argFunc !== 'function')
    throw new Error('First argument to ' + which + ' must be a function');
  if (! UI.isComponent(contentBlock))
    throw new Error('Second argument to ' + which + ' must be a template or UI.block');
  if (elseContentBlock && ! UI.isComponent(elseContentBlock))
    throw new Error('Third argument to ' + which + ' must be a template or UI.block if present');
};

// Acts like `!! conditionFunc()` except:
//
// - Empty array is considered falsy
// - The result is Deps.isolated (doesn't trigger invalidation
//   as long as the condition stays truthy or stays falsy
var getCondition = function (conditionFunc) {
  return Deps.isolateValue(function () {
    // `condition` is emboxed; it is always a function,
    // and it only triggers invalidation if its return
    // value actually changes.  We still need to isolate
    // the calculation of whether it is truthy or falsy
    // in order to not re-render if it changes from one
    // truthy or falsy value to another.
    var cond = conditionFunc();

    // empty arrays are treated as falsey values
    if (cond instanceof Array && cond.length === 0)
      return false;
    else
      return !! cond;
  });
};
