/**
 * Copyright (c) 2017
 *
 * lazy-load-element.js
 * dom element lazy load
 *
 * @author KimMinSoo
 * @date 2017/10/17
 */
var LazyLoadElement = (function() {
  "use strict";

  function LazyLoadElement(element, options, callbacks) {
    this.init(options, callbacks);
    var elements = element ? element.querySelectorAll('[lazy-load]:not([lazy-load-loaded])') : document.querySelectorAll('[lazy-load]:not([lazy-load-loaded])');

    if (elements.length) {
      this.addObserve(elements);
    }
    else {
      if (this.callbacks && this.callbacks.error) {
        this.callbacks.error(this.stateCodes['ERRORELEMENT']);
      }
    }
  }
  LazyLoadElement.prototype.init = function(options, callbacks) {
    this.debug = false;
    this.config = {
      root: options && options.root ? options.root : null,
      rootMargin: options && options.rootMargin ? options.rootMargin : '0px',
      threshold: options && options.threshold ? options.threshold : 0.01
    };
    this.isDisposable = options && undefined !== options.isDisposable ? options.isDisposable : true;
    this.callbacks = {
      load: callbacks ? callbacks.load : null,
      call: callbacks ? callbacks.call : null,
      error: callbacks ? callbacks.error : null
    }
    this.stateCodes = {
      NOTSUPPORT: {
        code: 0,
        msg: 'LazyLoadElement Not Support'
      },
      ERRORELEMENT: {
        code: 1,
        msg: 'LazyLoadElement Element Error'
      },
      LOAD: {
        code: 2,
        msg: 'LazyLoadElement load'
      },
      CALL: {
        code: 3,
        msg: 'LazyLoadElement call'
      }
    };
  },
  LazyLoadElement.prototype.addObserve = function(elements) {
    if (!('IntersectionObserver' in window)) {
      if (this.debug) console.log('IntersectionObserver not support');

      if (this.callbacks && this.callbacks.error) {
        this.callbacks.error(this.stateCodes['NOTSUPPORT']);
      }

      [].forEach.call(elements, function(element) {
        this.preLoad(element);
      }.bind(this));
    }
    else {
      if (this.debug) console.log('IntersectionObserver support');

      this.observer = new IntersectionObserver(function(entries, config) {
        entries.forEach(function(entry) {
          if (0 < entry.intersectionRatio) {
            this.preLoad(entry.target, entry, this.observer);
          }

          if (this.callbacks && this.callbacks.call) {
            this.callbacks.call(this.stateCodes['CALL'], { element: entry.target, isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio });
          }
        }.bind(this));
      }.bind(this), this.config);

      [].forEach.call(elements, function(element, index) {
        // samsung browser error
        setTimeout(function() {
          element.setAttribute('lazy-load-unloaded', '');
          this.observer.observe(element);
        }.bind(this), 1);
      }.bind(this));
    }
  };
  LazyLoadElement.prototype.preLoad = function(element, entry, observer) {
    if (!element.getAttribute('lazy-load-loaded')) {
      [].forEach.call(element.attributes, (function(attribute, index) {
        if (attribute.nodeName.match(/data-lazy/)) {
          var inputAttribute = attribute.nodeName.replace(/data-lazy-/, '');

          if ('class' == inputAttribute) {
            element.classList.add(element.getAttribute(attribute.nodeName));
          }
          else {
            element.onerror = function(e) { element.onerror = null; element.removeAttribute('src'); };
            element.setAttribute(inputAttribute, element.getAttribute(attribute.nodeName));
          }

          if (this.callbacks && this.callbacks.load) {
            this.callbacks.load(this.stateCodes['LOAD'], { element: element, attr: inputAttribute, isIntersecting: entry.isIntersecting, intersectionRatio: entry.intersectionRatio });
          }
        }
      }).bind(this));

      element.removeAttribute('lazy-load-unloaded');
      element.setAttribute('lazy-load-loaded', '');

      if (observer && this.isDisposable) {
        observer.unobserve(element);
      }
    }
  };
  
  return LazyLoadElement;
}());