import { getIn } from "final-form";

var isPromise = function (obj) {
  return (
    !!obj &&
    (typeof obj === "object" || typeof obj === "function") &&
    typeof obj.then === "function"
  );
};

//

var tripleEquals = function tripleEquals(a, b) {
  return a === b;
};

var createDecorator = function createDecorator() {
  for (
    var _len = arguments.length, calculations = new Array(_len), _key = 0;
    _key < _len;
    _key++
  ) {
    calculations[_key] = arguments[_key];
  }

  return function (form) {
    var previousValues = {};
    var unsubscribe = form.subscribe(
      function (_ref) {
        var values = _ref.values;
        form.batch(function () {
          var runUpdates = function runUpdates(field, isEqual, updates) {
            var next = values && getIn(values, field);
            var previous = previousValues && getIn(previousValues, field);

            if (!isEqual(next, previous)) {
              if (typeof updates === "function") {
                var results = updates(next, field, values, previousValues);

                if (isPromise(results)) {
                  results.then(function (resolved) {
                    Object.keys(resolved).forEach(function (destField) {
                      form.change(destField, resolved[destField]);
                    });
                  });
                } else {
                  Object.keys(results).forEach(function (destField) {
                    form.change(destField, results[destField]);
                  });
                }
              } else {
                Object.keys(updates).forEach(function (destField) {
                  var update = updates[destField];
                  var result = update(next, values, previousValues);

                  if (isPromise(result)) {
                    result.then(function (resolved) {
                      form.change(destField, resolved);
                    });
                  } else {
                    form.change(destField, result);
                  }
                });
              }
            }
          };

          var fields = form.getRegisteredFields();
          calculations.forEach(function (_ref2) {
            var field = _ref2.field,
              isEqual = _ref2.isEqual,
              updates = _ref2.updates;

            if (typeof field === "string") {
              runUpdates(field, isEqual || tripleEquals, updates);
            } else {
              // field is a either array or regex
              var matches = Array.isArray(field)
                ? function (name) {
                    return (
                      ~field.indexOf(name) ||
                      field.findIndex(function (f) {
                        return f instanceof RegExp && f.test(name);
                      }) !== -1
                    );
                  }
                : function (name) {
                    return field.test(name);
                  };
              fields.forEach(function (fieldName) {
                if (matches(fieldName)) {
                  runUpdates(fieldName, isEqual || tripleEquals, updates);
                }
              });
            }
          });
          previousValues = values;
        });
      },
      {
        values: true,
      }
    );
    return unsubscribe;
  };
};

//

export default createDecorator;