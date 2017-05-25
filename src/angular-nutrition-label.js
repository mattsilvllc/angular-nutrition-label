/**
 * @name Angular Nutrition Label
 * (c) 2017 Nutritionix, LLC. http://www.nutritionix.com
 * @license MIT
 *
 * @version 2.0.2
 */

(function () {
  'use strict';

  angular.module('nutritionix.nutrition-label', [])
    .constant('nutritionLabelGlobalOptions', {})
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
    .directive('nutritionLabel', function nutritionLabel($log, nutritionLabelGlobalOptions) {
      function round(value) {
        if (!value) {
          return value;
        }

        let precision;

        if (value < 1) {
          precision = 2;
        } else if (value < 10) {
          precision = 1;
        } else {
          precision = 0;
        }

        let multiplier = Math.pow(10, precision);

        return Math.round(value * multiplier) / multiplier;
      }

      return {
        restrict: 'A',
        template: `
        <div>
          <div class="label-container"></div>
          <div class="label-mode-switch" ng-if="!hideModeSwitcher">
            FDA Label Style:
            <label class="radio-inline">
              <input type="radio" name="labelMode" ng-value="false" ng-model="vm.showLegacyVersion"> 2018 Version
            </label>
            <label class="radio-inline">
              <input type="radio" name="labelMode" ng-value="true" ng-model="vm.showLegacyVersion"> Legacy Version
            </label>
          </div>
        </div>
      `,
        scope:    {
          item:             '=nutritionLabel',
          options:          '=?nutritionLabelOptions',
          hideModeSwitcher: '=?'
        },
        link:     function postLink(scope, element, attributes) {
          const labelContainer = element.find('.label-container');

          function watcher() {
            return JSON.stringify(mergeOptions());
          }

          function mergeOptions() {
            let options = angular.extend(
              {},
              nutritionLabelGlobalOptions,
              attributes,
              scope.options || {},
              scope.item,
              scope.vm || {}
            );

            angular.forEach(options, (value, key) => {
              if (key[0] === '$') {
                delete options[key];
              } else if (key.indexOf('userFunction') === -1 && angular.isFunction(value)) {
                options[key] = value();
              }
            });

            return options;
          }

          function renderer() {
            let label, options;

            labelContainer.html('');

            if (angular.isObject(scope.item)) {
              label = angular.element('<div>').attr('id', 'label-' + Math.random().toString(36).substring(2));
              label.appendTo(labelContainer);

              options = mergeOptions();

              if (typeof options.userFunctionOnQuantityChange === 'function') {
                let handler                          = options.userFunctionOnQuantityChange;
                options.userFunctionOnQuantityChange = function () {
                  handler.apply(options, arguments);
                  scope.$apply();
                };
              }

              if (options.userFunctionOnQuantityChange &&
                angular.isUndefined(jQuery.fn.nutritionLabel.defaultSettings.userFunctionOnQuantityChange)) {
                // support for version where userFunctionOnQuantityChange is not yet supported
                // this hack works because how the below code is written
                // https://github.com/nutritionix/nutrition-label/blob/v7.0.4/dist/js/nutritionLabel.js#L682-L683

                // this makes `typeof window[$localSettings.userFunctionNameOnQuantityChange] === 'function'` = true
                options.userFunctionOnQuantityChange.toString = () => 'toString';

                // this is then passed to eval, which does nothing with callable and returns it unchanged
                options.userFunctionNameOnQuantityChange = options.userFunctionOnQuantityChange;
              }

              if (options.applyMathRounding) {
                [
                  'valueServingWeightGrams',
                  'valueServingPerContainer',
                  'valueCalories',
                  'valueFatCalories',
                  'valueTotalFat',
                  'valueSatFat',
                  'valueTransFat',
                  'valuePolyFat',
                  'valueMonoFat',
                  'valueCholesterol',
                  'valueSodium',
                  'valuePotassium',
                  'valuePotassium_2018',
                  'valueTotalCarb',
                  'valueFibers',
                  'valueSugars',
                  'valueAddedSugars',
                  'valueProteins',
                  'valueVitaminA',
                  'valueVitaminC',
                  'valueVitaminD',
                  'valueCalcium',
                  'valueIron'
                ].forEach(attribute => {
                  if (!angular.isUndefined(options[attribute])) {
                    options[attribute] = round(options[attribute]);
                  }
                });
              }

              $log.debug('nutritionLabel: Final options:', options);

              label.nutritionLabel(options);
            }
          }

          let options = mergeOptions();

          scope.vm = {
            showLegacyVersion: angular.isUndefined(options.showLegacyVersion) ? true : !!options.showLegacyVersion
          };

          scope.$watch(watcher, (newVal, oldVal) => {
            //noinspection JSValidateTypes
            if (newVal !== oldVal) {
              renderer();
            }
          });

          renderer();
        }
      };
    })
    .filter('trackFoodToLabelData', function ($log, nutritionLabelGlobalOptions) {
      function nutrient(fullNutrients, attrId) {
        attrId = attrId.toString();
        for (let i = 0; i < fullNutrients.length; i += 1) {
          if (fullNutrients[i].attr_id.toString() === attrId) {
            return fullNutrients[i].value;
          }
        }

        return undefined;
      }

      const defaults = {
        itemName:          'Item',
        brandName:         'Nutritionix',
        allowFDARounding:  false,
        applyMathRounding: true,

        valueServingUnitQuantity: 1,
        valueServingSizeUnit:     'Serving'
      };

      const map = [
        {labelAttribute: 'valueCalories', attrId: 208},
        {labelAttribute: 'valueFatCalories', attrId: 204, adapter: v => v * 9},
        {labelAttribute: 'valueTotalFat', attrId: 204},
        {labelAttribute: 'valueSatFat', attrId: 606},
        {labelAttribute: 'valueTransFat', attrId: 605},
        {labelAttribute: 'valuePolyFat', attrId: 645},
        {labelAttribute: 'valueMonoFat', attrId: 646},
        {labelAttribute: 'valueCholesterol', attrId: 601},
        {labelAttribute: 'valueSodium', attrId: 307},
        {labelAttribute: 'valuePotassium', attrId: 306},
        {labelAttribute: 'valuePotassium_2018', attrId: 306, dailyValue: 3500},
        {labelAttribute: 'valueTotalCarb', attrId: 205},
        {labelAttribute: 'valueFibers', attrId: 291},
        {labelAttribute: 'valueSugars', attrId: 269},
        // {labelAttribute: 'valueAddedSugars', attrId: undefined},
        {labelAttribute: 'valueProteins', attrId: 203},
        {labelAttribute: 'valueVitaminA', attrId: 318, dailyValue: 5000},
        {labelAttribute: 'valueVitaminC', attrId: 401, dailyValue: 60},
        {labelAttribute: 'valueVitaminD', attrId: 324, dailyValue: 400},
        {labelAttribute: 'valueCalcium', attrId: 324, dailyValue: 1000},
        {labelAttribute: 'valueIron', attrId: 303, dailyValue: 18},
      ];

      return function (food, attributes = {}, externalServingQty = 1) {
        let labelData = {
          full_nutrients: angular.copy(food.full_nutrients)
        };

        labelData.itemName  = (food.food_name || '').replace(/^([a-z])|\s+([a-z])/g, $1 => $1.toUpperCase());
        labelData.brandName = food.brand_name;

        labelData.valueServingUnitQuantity = food.serving_qty;
        labelData.valueServingSizeUnit     = food.serving_unit;
        labelData.valueServingWeightGrams  = food.serving_weight_grams / externalServingQty;

        map.forEach(definition => {
          let value = nutrient(labelData.full_nutrients, definition.attrId);
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

            labelData[definition.labelAttribute]                          = value;
            labelData[definition.labelAttribute.replace('value', 'show')] = true;
          } else {
            labelData[definition.labelAttribute.replace('value', 'show')] = false;
          }
        });


        if (externalServingQty && externalServingQty !== 1) {
          angular.forEach(labelData.full_nutrients, (nutrient) => {
            nutrient.value /= externalServingQty;
          });
        }

        angular.extend(labelData, attributes);
        angular.forEach(defaults, (value, key) => {
          if (angular.isUndefined(labelData[key]) && angular.isUndefined(nutritionLabelGlobalOptions[key])) {
            labelData[key] = value;
          }
        });

        $log.debug('trackFoodToLabelData', labelData);

        return labelData;
      }
    });
}());
