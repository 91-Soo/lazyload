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

    var elements = this.makeElementNodeList(element);

    if(elements.length) {
      this.addObserve(elements);
    }
    else {
      if(this.callbacks && this.callbacks.error) {
        this.callbacks.error(this.stateCodes['ERRORELEMENT'], this.makeResult(null, null, null));
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
  LazyLoadElement.prototype.makeElementNodeList = function(element) {
    var elements = null;

    if(element) {
      if(element instanceof Element) {
        elements = element.querySelectorAll('[lazy-load]:not([lazy-load-loaded])');
      }
      else if(element instanceof NodeList) {
        elements = element;
      }
      else {
        if(this.callbacks && this.callbacks.error) {
          this.callbacks.error(this.stateCodes['ERRORELEMENT'], this.makeResult(null, null, null));
        }
      }
    }
    else {
      elements = document.querySelectorAll('[lazy-load]:not([lazy-load-loaded])');
    }

    return elements;
  },
  LazyLoadElement.prototype.addObserve = function(elements) {
    if(!('IntersectionObserver' in window)) {
      if(this.debug) console.log('IntersectionObserver not support');

      if(this.callbacks && this.callbacks.error) {
        this.callbacks.error(this.stateCodes['NOTSUPPORT'], this.makeResult(null, null, null));
      }

      [].forEach.call(elements, function(element) {
        this.preLoad(element);
      }.bind(this));
    }
    else {
      if(this.debug) console.log('IntersectionObserver support');

      this.observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if(0 < entry.intersectionRatio) {
            this.preLoad(entry.target, entry, this.observer);
          }

          if(this.callbacks && this.callbacks.call) {
            this.callbacks.call(this.stateCodes['CALL'], this.makeResult(entry.target, null, entry));
          }
        }.bind(this));
      }.bind(this), this.config);

      [].forEach.call(elements, function(element) {
        // samsung browser error
        setTimeout(function() {
          element.setAttribute('lazy-load-unloaded', '');
          this.observer.observe(element);
        }.bind(this), 1);
      }.bind(this));
    }
  };
  LazyLoadElement.prototype.preLoad = function(element, entry, observer) {
    if(!element.getAttribute('lazy-load-loaded')) {
      [].forEach.call(element.attributes, (function(attribute) {
        if(attribute.nodeName.match(/data-lazy/)) {
          var inputAttribute = attribute.nodeName.replace(/data-lazy-/, '');
          var inputValue = element.getAttribute(attribute.nodeName);

          switch(inputAttribute) {
            case "class":
              element.classList.add(inputValue);
            break;
            case "style":
              element.setAttribute(inputAttribute, (element.getAttribute('style') || '') + inputValue);
            break;
            case "src":
              element.onerror = function () { element.onerror = null; element.removeAttribute('src'); };
              element.setAttribute(inputAttribute, inputValue);
            break;
            default:
              element.setAttribute(inputAttribute, inputValue);
            break;
          }

          if(this.callbacks && this.callbacks.load) {
            this.callbacks.load(this.stateCodes['LOAD'], this.makeResult(element, inputAttribute, entry));
          }
        }
      }).bind(this));

      element.removeAttribute('lazy-load-unloaded');
      element.setAttribute('lazy-load-loaded', '');

      if(observer && this.isDisposable) {
        observer.unobserve(element);
      }
    }
  };
  LazyLoadElement.prototype.makeResult = function(element, attr, entry) {
    return {
      element: element,
      attr: attr,
      isIntersecting: entry ? entry.isIntersecting : null,
      intersectionRatio: entry ? entry.intersectionRatio : null,
    }
  };

  return LazyLoadElement;
}());