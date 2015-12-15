/**
 * @license Angular Nutrition Label
 * (c) 2015 Nutritionix, LLC. http://nutritinix.com
 * License: MIT
 */

(function(){
  'use strict';

  /**
   * @ngdoc directive
   * @name nutritionix.nutrition-label.directive:nutritionLabel
   * @description
   * # nutritionLabel
   */
  angular.module('nutritionix.nutrition-label', [])
    .directive('nutritionLabel', ['$log', function nutritionLabel($log) {
      return {
        restrict: 'A',
        scope: {
          item: '=nutritionLabel',
          options: '=nutritionLabelOptions'
        },
        link: function postLink(scope, element, attributes) {
          function watcher() {
            return JSON.stringify(scope.item || null) + JSON.stringify(scope.options || null);
          }

          function renderer() {
            var label, options;

            element.html('');

            if (angular.isObject(scope.item)) {
              label = angular.element('<div>').attr('id', 'label-' + Math.random().toString(36).substring(2));
              label.appendTo(element);

              options = angular.extend({}, attributes, scope.options || {}, scope.item);

              $log.debug('Final options:', options);

              label.nutritionLabel(options);
            }
          }

          scope.$watch(watcher, renderer);
        }
      };
    }]);
}());


