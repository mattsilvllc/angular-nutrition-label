# angular-nutrition-label

Installation
------------
Install via bower

```sh
bower install --save angular-nutrition-label
```

include lib into your index.html

*Note: it is jQuery dependant*

```html
<link rel="stylesheet" type="text/css" href="./bower_components/nutrition-label-jquery-plugin/dist/css/nutritionLabel-min.css"/>

<script type="text/javascript" src="./bower_components/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="./bower_components/nutrition-label-jquery-plugin/dist/js/nutritionLabel-min.js"></script>
<script type="text/javascript" src="./bower_components/angular/angular.js"></script>
<script type="text/javascript" src="./bower_components/angular-nutrition-label/angular-nutrition-label.min.js"></script>
```

and add dependency to your app

```js
angular.module('app', ['nutritionix.nutrition-label']);
```

Usage
-----

Directive proxies settings directly to the [original nutritionLabel library](https://github.com/Yurko-Fedoriv/nutrition-label).

You can set any of [settings](https://github.com/nutritionix/nutrition-label/blob/master/nutritionLabel.js#L76-L366)
with (merged in the following direction)

- [nutritionLabelGlobalOptions](https://github.com/mattsilvllc/angular-nutrition-label/blob/2.0.0/src/angular-nutrition-label.js#L13) service (just assign it properties in any place e.g. `app.run(callback)`)
- holding node's attributes (won't be evaluated)
- nutrition-label-options object
- nutrition-label object.

Any of the option values can be passed as a callable. 
It will be invoked to retrieve current value at the moment of the label rendering.

They are finally merged into the single options object and are only being the matter of convenience:
you are free to put all settings into nutrition-label object.
`nutritionLabelGlobalOptions` will affect all labels in the application.

```html
<div nutrition-label="vm.labelData"
     nutrition-label-options="{showDisclaimer: true}"
     hide-mode-switcher="false" <!-- if set to true disables version switcher on the bottom -->
     width="300"
></div>
```

Usage of the custom angular filters is suggested to prepare your data structures for using with this directive.

Package includes `$filter('trackFoodToLabelData')` to convert [Nutritionix Track](https://www.nutritionix.com/app) food into compatible data structure.
