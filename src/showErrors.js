(function() {
  var showErrorsModule;

  showErrorsModule = angular.module('ui.bootstrap.showErrors', []);

  showErrorsModule.directive('showErrors', [
    '$timeout', 'showErrorsConfig', '$interpolate', function($timeout, showErrorsConfig, $interpolate) {
      var getShowSuccess, getTrigger, linkFn;
      getTrigger = function(options) {
        var trigger;
        trigger = showErrorsConfig.trigger;
        if (options && (options.trigger != null)) {
          trigger = options.trigger;
        }
        return trigger;
      };
      getShowSuccess = function(options) {
        var showSuccess;
        showSuccess = showErrorsConfig.showSuccess;
        if (options && (options.showSuccess != null)) {
          showSuccess = options.showSuccess;
        }
        return showSuccess;
      };
      linkFn = function(scope, el, attrs, formCtrl) {
        var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses, trigger;
        blurred = false;
        options = scope.$eval(attrs.showErrors);
        var onlyUpdate = options && options.onlyUpdate;
        showSuccess = getShowSuccess(options);
        trigger = getTrigger(options);
        var successTrigger = angular.isString(showSuccess) ? showSuccess : trigger;
        inputEl = el[0].querySelector('.form-control[name]');
        inputNgEl = angular.element(inputEl);
        inputName = $interpolate(inputNgEl.attr('name') || '')(scope);
        if (!inputName) {
          throw "show-errors element has no child input elements with a 'name' attribute and a 'form-control' class";
        }
        inputNgEl.bind(trigger, function() {
          if (
            // field has not been touched
            !formCtrl[inputName].$touched
            // or field has autofocus and has not been modified
            || inputNgEl.prop('autofocus') && !formCtrl[inputName].$dirty
          ) {
            // skip
            return;
          }
          blurred = true;
          return toggleClasses(formCtrl[inputName].$invalid);
        });
        if (showSuccess && successTrigger !== trigger) {
          inputNgEl.bind(successTrigger, function() {
            return toggleSuccess(formCtrl[inputName].$invalid);
          });
        }
        inputNgEl.bind('focus', function() {
          $timeout(function() {
            el.removeClass('has-error');
            blurred = false;
          }, 0, false);
        });
        scope.$watch(function() {
          var input = formCtrl[inputName];
          return input && input.$touched && input.$invalid;
        }, function(invalid) {
          var input = formCtrl[inputName];
          if (input && input.$touched && showSuccess) {
            toggleSuccess(invalid);
          }
          if (!blurred) {
            return;
          }
          return toggleClasses(invalid);
        });
        scope.$on('show-errors-check-validity', function() {
          return toggleClasses(formCtrl[inputName].$invalid);
        });
        scope.$on('show-errors-reset', function() {
          return $timeout(function() {
            el.removeClass('has-error');
            el.removeClass('has-success');
            return blurred = false;
          }, 0, false);
        });
        return toggleClasses = function(invalid) {
          if (onlyUpdate && formCtrl[inputName].$pristine) {
            return;
          }
          el.toggleClass('has-error', invalid);
          if (showSuccess) {
            return el.toggleClass('has-success', !invalid);
          }
        };
        function toggleSuccess(invalid) {
          if (onlyUpdate && formCtrl[inputName].$pristine) {
            return;
          }
          el.toggleClass('has-success', !invalid);
        }
      };
      return {
        restrict: 'A',
        require: '^form',
        compile: function(elem, attrs) {
          if (attrs['showErrors'].indexOf('skipFormGroupCheck') === -1) {
            if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
              throw "show-errors element does not have the 'form-group' or 'input-group' class";
            }
          }
          return linkFn;
        }
      };
    }
  ]);

  showErrorsModule.provider('showErrorsConfig', function() {
    var _showSuccess, _trigger;
    _showSuccess = false;
    _trigger = 'blur';
    this.showSuccess = function(showSuccess) {
      return _showSuccess = showSuccess;
    };
    this.trigger = function(trigger) {
      return _trigger = trigger;
    };
    this.$get = function() {
      return {
        showSuccess: _showSuccess,
        trigger: _trigger
      };
    };
  });

}).call(this);
