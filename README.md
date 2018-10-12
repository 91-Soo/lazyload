# lazyload

공부
```js
var lazyloadOptions = {}
var lazyloadCallback = {
  load: function(state, result) { {
    console.log('state', state);
    console.log('result', result);
  },
  call: function(state, result) {
    console.log('state', state);
    console.log('result', result);
  },
  error: (state: LazyLoadElementState, result: LazyLoadElementResult): void => {
    console.log('state', state);
    console.log('result', result);
  }
}
var lazyLoadElement = new LazyLoadElement(null, lazyloadOptions, lazyloadCallback);
```
```js
var lazyloadElement = new LazyLoadElement();
```
**data-lazy-..., lazy-load**
```html
<div data-lazy-class="eff-fade-in" lazy-load></div>
<img data-lazy-src="/images/0.jpg" data-lazy-class="eff-fade-in" lazy-load>
<div data-lazy-style="background: url(/images/0.jpg)" data-lazy-class="eff-fade-in" lazy-load></div>
```
