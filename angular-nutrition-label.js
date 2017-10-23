'use strict';

/**
 * @name Angular Nutrition Label
 * (c) 2017 Nutritionix, LLC. http://www.nutritionix.com
 * @license MIT
 *
 * @version 2.1.2
 */

(function () {
  'use strict';

  angular.module('nutritionix.nutrition-label', []).constant('nutritionLabelGlobalOptions', { overrides: {} })
  /**
   * @ngdoc directive
   * @name nutritionix.nutrition-label.directive:nutritionLabel
   * @param {object} nutritionLabel Values passed to nutritionLabel jquery plugin
   * @param {object} nutritionLabelOptions [OPTIONAL] Extra values defaulting the item object.
   * @description
   * Angular wrapper for {@link https://github.com/nutritionix/nutrition-label}
   * Options attribute names are the same as in original plugin.
   * Option values can be passed as functions, then they will be executed to fetch value before initialising the plugin.
   */
  .directive('nutritionLabel', ["$log", "nutritionLabelGlobalOptions", function nutritionLabel($log, nutritionLabelGlobalOptions) {
    function round(value) {
      if (!value) {
        return value;
      }

      var precision = void 0;

      if (value < 1) {
        precision = 2;
      } else if (value < 10) {
        precision = 1;
      } else {
        precision = 0;
      }

      var multiplier = Math.pow(10, precision);

      return Math.round(value * multiplier) / multiplier;
    }

    return {
      restrict: 'A',
      template: '\n        <div>\n          <div class="label-container"></div>\n          <div class="label-mode-switch" ng-if="!settings.hideModeSwitcher">\n            FDA Label Style:\n            <label class="radio-inline">\n              <input type="radio" name="labelMode" ng-value="false" ng-model="vm.showLegacyVersion"> 2018 Version\n            </label>\n            <label class="radio-inline">\n              <input type="radio" name="labelMode" ng-value="true" ng-model="vm.showLegacyVersion"> Legacy Version\n            </label>\n          </div>\n        </div>\n      ',
      scope: {
        item: '=nutritionLabel',
        options: '=?nutritionLabelOptions',
        hideModeSwitcher: '=?'
      },
      link: function postLink(scope, element, attributes) {
        var labelContainer = element.find('.label-container');

        function watcher() {
          return JSON.stringify(mergeOptions());
        }

        function mergeOptions() {
          var options = angular.extend({}, nutritionLabelGlobalOptions, attributes, scope.options || {}, scope.item, nutritionLabelGlobalOptions.overrides, scope.vm || {});

          angular.forEach(options, function (value, key) {
            if (key[0] === '$') {
              delete options[key];
            } else if (key.indexOf('userFunction') === -1 && angular.isFunction(value)) {
              options[key] = value();
            }
          });

          return options;
        }

        function renderer() {
          var label = void 0,
              options = void 0;

          labelContainer.html('');

          if (angular.isObject(scope.item)) {
            label = angular.element('<div>').attr('id', 'label-' + Math.random().toString(36).substring(2));
            label.appendTo(labelContainer);

            options = mergeOptions();

            if (typeof options.userFunctionOnQuantityChange === 'function') {
              var handler = options.userFunctionOnQuantityChange;
              options.userFunctionOnQuantityChange = function () {
                handler.apply(options, arguments);
                scope.$apply();
              };
            }

            if (options.applyMathRounding) {
              ['valueServingWeightGrams', 'valueServingPerContainer', 'valueCalories', 'valueFatCalories', 'valueTotalFat', 'valueSatFat', 'valueTransFat', 'valuePolyFat', 'valueMonoFat', 'valueCholesterol', 'valueSodium', 'valuePotassium', 'valueTotalCarb', 'valueFibers', 'valueSugars', 'valueAddedSugars', 'valueProteins', 'valueVitaminA', 'valueVitaminC', 'valueVitaminD', 'valueCalcium', 'valueIron'].forEach(function (attribute) {
                if (!angular.isUndefined(options[attribute])) {
                  options[attribute] = round(options[attribute]);
                }
              });
            }

            $log.debug('nutritionLabel: Final options:', options);

            scope.settings = options;

            label.nutritionLabel(options);
          }
        }

        var options = mergeOptions();

        scope.vm = {
          showLegacyVersion: angular.isUndefined(options.showLegacyVersion) ? true : !!options.showLegacyVersion
        };

        scope.$watch(watcher, function (newVal, oldVal) {
          //noinspection JSValidateTypes
          if (newVal !== oldVal) {
            renderer();
          }
        });

        renderer();
      }
    };
  }]).filter('trackFoodToLabelData', ["$log", "nutritionLabelGlobalOptions", function ($log, nutritionLabelGlobalOptions) {
    function nutrient(fullNutrients, attrId) {
      attrId = attrId.toString();
      for (var i = 0; i < fullNutrients.length; i += 1) {
        if (fullNutrients[i].attr_id.toString() === attrId) {
          return fullNutrients[i].value;
        }
      }

      return undefined;
    }

    var defaults = {
      itemName: 'Item',
      brandName: 'Nutritionix',
      allowFDARounding: false,
      applyMathRounding: true,
      valueServingUnitQuantity: 1,
      valueServingSizeUnit: 'Serving',
      showIngredients: false
    };

    var map = [{ labelAttribute: 'valueCalories', attrId: 208 }, { labelAttribute: 'valueFatCalories', attrId: 204, adapter: function adapter(v) {
        return v * 9;
      } }, { labelAttribute: 'valueTotalFat', attrId: 204 }, { labelAttribute: 'valueSatFat', attrId: 606 }, { labelAttribute: 'valueTransFat', attrId: 605 }, { labelAttribute: 'valueMonoFat', attrId: 645 }, { labelAttribute: 'valuePolyFat', attrId: 646 }, { labelAttribute: 'valueCholesterol', attrId: 601 }, { labelAttribute: 'valueSodium', attrId: 307 }, { labelAttribute: 'valuePotassium', attrId: 306 }, { labelAttribute: 'valuePotassium_2018', attrId: 306, dailyValue: 3500 }, { labelAttribute: 'valueTotalCarb', attrId: 205 }, { labelAttribute: 'valueFibers', attrId: 291 }, { labelAttribute: 'valueSugars', attrId: 269 },
    // {labelAttribute: 'valueAddedSugars', attrId: undefined},
    { labelAttribute: 'valueProteins', attrId: 203 }, { labelAttribute: 'valueVitaminA', attrId: 318, dailyValue: 5000 }, { labelAttribute: 'valueVitaminC', attrId: 401, dailyValue: 60 }, { labelAttribute: 'valueVitaminD', attrId: 324, dailyValue: 400 }, { labelAttribute: 'valueCalcium', attrId: 301, dailyValue: 1000 }, { labelAttribute: 'valueIron', attrId: 303, dailyValue: 18 }];

    return function (food) {
      var attributes = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var externalServingQty = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;

      var labelData = {
        full_nutrients: angular.copy(food.full_nutrients)
      };

      labelData.itemName = (food.food_name || '').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
        return $1.toUpperCase();
      });
      labelData.brandName = food.brand_name;

      labelData.valueServingUnitQuantity = food.serving_qty;
      labelData.valueServingSizeUnit = food.serving_unit;
      labelData.valueServingWeightGrams = food.serving_weight_grams / externalServingQty;

      map.forEach(function (definition) {
        var value = nutrient(labelData.full_nutrients, definition.attrId);
        if (!angular.isUndefined(value)) {
          if (angular.isFunction(definition.adapter)) {
            value = definition.adapter(value);
          }

          if (externalServingQty && externalServingQty !== 1) {
            value = value / externalServingQty;
          }

          if (definition.dailyValue) {
            value = 100 / definition.dailyValue * value;
          }

          labelData[definition.labelAttribute] = value;
          labelData[definition.labelAttribute.replace('value', 'show')] = true;
        } else {
          labelData[definition.labelAttribute.replace('value', 'show')] = false;
        }
      });

      if (externalServingQty && externalServingQty !== 1) {
        angular.forEach(labelData.full_nutrients, function (nutrient) {
          nutrient.value /= externalServingQty;
        });
      }

      angular.extend(labelData, attributes);
      angular.forEach(defaults, function (value, key) {
        if (angular.isUndefined(labelData[key]) && angular.isUndefined(nutritionLabelGlobalOptions[key])) {
          labelData[key] = value;
        }
      });

      $log.debug('trackFoodToLabelData', labelData);

      return labelData;
    };
  }]);
})();