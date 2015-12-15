# angular-nutrition-label

Installation
------------
Install via bower

```sh
bower i angular-nutrition-label
```

include lib into your index.html

*Note: it is jQuery dependant*

```html
<script type="text/javascript" src="./bower_components/jquery/dist/jquery.js"></script>
<script type="text/javascript" src="./bower_components/nutrition-label/nutritionLabel.js"></script>
<script type="text/javascript" src="./bower_components/angular/angular.js"></script>
<script type="text/javascript" src="./bower_components/angular-nutrition-label.min.js"></script>
```

and add dependency to your app

```js
angular.module('app', ['nutritionix.nutrition-label']);
```

Usage
-----

Directive proxies settings directly to the [original nutritionLabel library](https://github.com/Yurko-Fedoriv/nutrition-label).

You can set any of [settings](https://github.com/Yurko-Fedoriv/nutrition-label/blob/master/nutritionLabel.js#L70-L308)
with 

- holding node's attributes
- nutrition-label-options object
- nutrition-label object.

They are finally merged into the single options object in the same order and are only being the matter of convenience:
you are free to put all settings into nutrition-label object

```html
<div nutrition-label="vm.labelData"
     nutrition-label-options="{showDisclaimer: true}"
     width="300"
></div>
```

I suggest using custom angular filters to prepare your data structures for using with this directive
