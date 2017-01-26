var app = angular.module('open-vts', []);

app.directive('ovtsRangeSlider', function() {

  return {

    restrict: 'A',

    require: 'ngModel',

    template: '<div class="ovts-range-slider noselect">' +
                '<div class="ovts-range-slider-bar">' +
                  '<div class="ovts-range-slider-line"></div>' +
                  '<div class="ovts-range-slider-knob ovts-range-slider-knob-min" ng-mousedown="minMousedownListener($event)"></div>' +
                  '<div class="ovts-range-slider-knob ovts-range-slider-knob-max" ng-mousedown="maxMousedownListener($event)"></div>' +
                '</div>' +
                '<div class="ovts-range-slider-inputs">' +
                  '<input name="rangeMin" type="text" ng-change="minRangeOnChange()" placeholder="{{placeHolderMin}}" ng-model="minRange" ng-model-options="{ debounce: 400 }" class="ovts-range-slider-input ovts-range-slider-input-min"/>' +
                  '<div class="ovts-range-slider-dash">-</div>' +
                  '<input name="rangeMax" type="text" ng-change="maxRangeOnChange()" placeholder="{{placeHolderMax}}" ng-model="maxRange" ng-model-options="{ debounce: 400 }" class="ovts-range-slider-input ovts-range-slider-input-max"/>' +
                '</div>' +
              '</div>',

    link: function($scope, ele, attrs, ngModel, $document) {

      var options, range;

      $scope.$watch(function(){
        options = $scope.options = $scope.$eval(attrs.ovtsRangeSlider);
        range = parseFloat(options.max - options.min);
        return options;
      }, function(val) {
        ngModel.$render();
        $scope.placeHolderMin = commaFormatter(val.min);
        $scope.placeHolderMax = commaFormatter(val.max);
      }, true);

      var knobs = ele[0].querySelectorAll('.ovts-range-slider-knob');

      var bar = ele[0].querySelector('.ovts-range-slider-line');

      var activeKnobEle, activeKnob, inactiveKnob, inactiveKnobEle;

      ngModel.$render = function(animate){
        var min, max;
        if(ngModel.$viewValue) {
          min = $scope.minRange = ngModel.$viewValue.min;
          max = $scope.maxRange = ngModel.$viewValue.max;
          if($scope.options && $scope.options.max < parseInt(max)) {
            // prevent slider from going outside its actual max
            max = $scope.maxRange = $scope.options.max;
          }
        }else if(options) {
          min = options.min;
          max = options.max;
        }
        knobs[0].style.left = ( (min / range) * (ele[0].clientWidth - 18) ) + 'px';
        knobs[1].style.left = ( (max / range) * (ele[0].clientWidth - 18) ) + 'px';
        var gradientMinStop = (min / range) * 100;
        var gradientMaxStop = (max / range) * 100;
        bar.style.background = '-webkit-linear-gradient(left, #475265 0%, #475265 '+ gradientMinStop +'%, white '+ gradientMinStop +'%, white '+ gradientMaxStop +'%, #475265 '+ gradientMaxStop +'%)';
        bar.style.background = '-moz-linear-gradient(left, #475265 0%, #475265 '+ gradientMinStop +'%, white '+ gradientMinStop +'%, white '+ gradientMaxStop +'%, #475265 '+ gradientMaxStop +'%)';
        bar.style.background = '-o-linear-gradient(left, #475265 0%, #475265 '+ gradientMinStop +'%, white '+ gradientMinStop +'%, white '+ gradientMaxStop +'%, #475265 '+ gradientMaxStop +'%)';
        bar.style.background = '-ms-linear-gradient(left, #475265 0%, #475265 '+ gradientMinStop +'%, white '+ gradientMinStop +'%, white '+ gradientMaxStop +'%, #475265 '+ gradientMaxStop +'%)';
        bar.style.background = 'linear-gradient(left, #475265 0%, #475265 '+ gradientMinStop +'%, white '+ gradientMinStop +'%, white '+ gradientMaxStop +'%, #475265 '+ gradientMaxStop +'%)';

      }

      function commaFormatter(val){
        if (typeof val !== 'undefined'){
          return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        }
      }

      function removeComma(val){
        if (typeof val !== 'undefined'){
          return parseInt(val.toString().replace(",", ""));
        }
      }

      function minRangeMaxRangeValid(minRange, maxRange) {
        return removeComma(minRange) <= removeComma(maxRange);
      }

      var inputFormatter = function(val){
        if(!options || (val !== parseInt(options.min) && val !== parseInt(options.max))) {
          return commaFormatter(val);
        }
      }

      angular.element(document.querySelector('.ovts-range-slider-input-min')).controller('ngModel').$formatters.push(inputFormatter);
      angular.element(document.querySelector('.ovts-range-slider-input-max')).controller('ngModel').$formatters.push(inputFormatter);

      ngModel.$formatters.push(function(modelValue) {
        if(modelValue){
          return { min: modelValue.split('-')[0], max: modelValue.split('-')[1] };
        }
      });

      ngModel.$parsers.push(function(viewValue) {
        return (viewValue.min || options.min) + '-' + (viewValue.max || options.max);
      });

      $scope.minRangeOnChange = function(min, max) {
        if (minRangeMaxRangeValid(this.minRange, this.maxRange) || (removeComma(this.minRange) && !removeComma(this.maxRange)) || this.minRange == '') {
          setMinActive();
          rangeOnChange(min, max);
        }
      }

      $scope.maxRangeOnChange = function(min, max) {
        if (minRangeMaxRangeValid(this.minRange, this.maxRange) || (removeComma(this.maxRange) && !removeComma(this.minRange)) || this.maxRange == '')  {
          setMaxActive();
          rangeOnChange(min, max);
        }
      }

      $scope.minMousedownListener = function() {
        setMinActive();
        mousedownListener()
      }

      $scope.maxMousedownListener = function() {
        setMaxActive();
        mousedownListener();
      }

      var createViewValue = function(min, max) {
        if(typeof min === 'string' || min instanceof String) min = parseInt(min.replace(/,/g, ''));
        if(typeof max === 'string' || max instanceof String) max = parseInt(max.replace(/,/g, ''));
        var viewValue = { min:  Math.max(min, options.min), max:  Math.min(max, options.max) };
        return viewValue;
      }

      var rangeOnChange = function(min, max) {
        activeKnobEle.classList.add('ovts-range-slider-transition');
        var viewValue = createViewValue($scope.minRange || options.min, $scope.maxRange || options.max);
        ngModel.$setViewValue( viewValue );
        ngModel.$render();
      }

      var setMinActive = function() {
        activeKnob = 'min';
        activeKnobEle = knobs[0];
        inactiveKnob = 'max';
        inactiveKnobEle = knobs[1];
      }

      var setMaxActive = function() {
        activeKnob = 'max';
        activeKnobEle = knobs[1];
        inactiveKnob = 'min';
        inactiveKnobEle = knobs[0];
      }

      var mousemoveListener = function(event) {
        event.stopPropagation();
        var leftBound = ele[0].offsetLeft;
        var kbobRadiusOffset = activeKnob === 'min' ? -12 : -2;
        var viewValue = { min: $scope.minRange  || options.min, max: $scope.maxRange || options.max };
        viewValue[activeKnob] = Math.floor(((event.clientX - leftBound + kbobRadiusOffset) / ele[0].clientWidth) * range);
        viewValue.min = $scope.minRange = Math.round(Math.max(viewValue.min, options.min) / 500) * 500;
        viewValue.max = $scope.maxRange = Math.round(Math.min(viewValue.max, options.max) / 500) * 500;
        if(viewValue.max < viewValue.min) $scope.minRange = $scope.maxRange= viewValue.min = viewValue.max = viewValue[inactiveKnob];
        ngModel.$setViewValue(viewValue);
        window.requestAnimationFrame(ngModel.$render)
      }

      var mouseupListener = function() {
        document.removeEventListener('mousemove', mousemoveListener );
        activeKnobEle.classList.remove('ovts-range-slider-knob-expanded');
      }

      var mousedownListener = function() {
        knobs[0].classList.remove('ovts-range-slider-transition');
        knobs[1].classList.remove('ovts-range-slider-transition');
        activeKnobEle.classList.add('ovts-range-slider-knob-expanded');
        document.addEventListener('mousemove', mousemoveListener );
        document.addEventListener('mouseup', mouseupListener );
      }

    }

  }

});
