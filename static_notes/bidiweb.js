// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License

// This stuff is taken from http://closure-library.googlecode.com/svn-history/r27/trunk/closure/goog/docs/closure_goog_i18n_bidi.js.source.html
// with modifications

bidi = {}

/**
 * Directionality enum.
 * @enum {number}
 */
bidi.Dir = {
  RTL: -1,
  UNKNOWN: 0,
  LTR: 1
};

/**
 * Unicode formatting characters and directionality string constants.
 * @enum {string}
 */
bidi.Format = {
  /** Unicode "Left-To-Right Embedding" (LRE) character. */
  LRE: '\u202A',
  /** Unicode "Right-To-Left Embedding" (RLE) character. */
  RLE: '\u202B',
  /** Unicode "Pop Directional Formatting" (PDF) character. */
  PDF: '\u202C',
  /** Unicode "Left-To-Right Mark" (LRM) character. */
  LRM: '\u200E',
  /** Unicode "Right-To-Left Mark" (RLM) character. */
  RLM: '\u200F'
};


/**
 * A practical pattern to identify strong LTR characters. This pattern is not
 * theoretically correct according to the Unicode standard. It is simplified for
 * performance and small code size.
 * @type {string}
 * @private
 */
bidi.ltrChars_ =
    'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02B8\u0300-\u0590\u0800-\u1FFF' +
    '\u2C00-\uFB1C\uFE00-\uFE6F\uFEFD-\uFFFF';


/**
 * A practical pattern to identify strong RTL character. This pattern is not
 * theoretically correct according to the Unicode standard. It is simplified
 * for performance and small code size.
 * @type {string}
 * @private
 */
bidi.rtlChars_ = '\u0591-\u07FF\uFB1D-\uFDFF\uFE70-\uFEFC';

/**
 * Regular expressions to check if a piece of text if of LTR directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
bidi.ltrDirCheckRe_ = new RegExp(
    '^[^' + bidi.rtlChars_ + ']*[' + bidi.ltrChars_ + ']');

/**
 * Regular expression to check for LTR characters.
 * @type {RegExp}
 * @private
 */
bidi.ltrCharReg_ = new RegExp('[' + bidi.ltrChars_ + ']');

/**
 * Test whether the given string has any LTR characters in it.
 * @param {string} text The given string that need to be tested.
 * @return {boolean} Whether the string contains LTR characters.
 */
bidi.hasAnyLtr = function(text) {
  return bidi.ltrCharReg_.test(text);
};


/**
 * Regular expressions to check if a piece of text if of RTL directionality
 * on first character with strong directionality.
 * @type {RegExp}
 * @private
 */
bidi.rtlDirCheckRe_ = new RegExp(
    '^[^' + bidi.ltrChars_ + ']*[' + bidi.rtlChars_ + ']');

bidi.rtlRe = bidi.rtlDirCheckRe_;


/**
 * Check whether the first strongly directional character (if any) is RTL.
 * @param {text} str String being checked.
 * @return {boolean} Whether RTL directionality is detected using the first
 *     strongly-directional character method.
 */
bidi.isRtlText = function(text) {
    return bidi.rtlDirCheckRe_.test(text);
}

/**
 * Check whether the first strongly directional character (if any) is LTR.
 * @param {text} str String being checked.
 * @return {boolean} Whether LTR directionality is detected using the first
 *     strongly-directional character method.
 */
bidi.isLtrText = function(text) {
    return bidi.ltrDirCheckRe_.test(text);
}

/**
 * Regular expression to check if a string looks like something that must
 * always be LTR even in RTL text, e.g. a URL. When estimating the
 * directionality of text containing these, we treat these as weakly LTR,
 * like numbers.
 * @type {RegExp}
 * @private
 */
bidi.isRequiredLtrRe_ = /^http:\/\/.*/;

/**
 * Regular expression to check if a string contains any numerals. Used to
 * differentiate between completely neutral strings and those containing
 * numbers, which are weakly LTR.
 * @type {RegExp}
 * @private
 */
bidi.hasNumeralsRe_ = /\d/;

/**
 * Estimates the directionality of a string based on relative word counts.
 * If the number of RTL words is above a certain percentage of the total number
 * of strongly directional words, returns RTL.
 * Otherwise, if any words are strongly or weakly LTR, returns LTR.
 * Otherwise, returns UNKNOWN, which is used to mean "neutral".
 * Numbers are counted as weakly LTR.
 * @param {string} text The string to be checked.
 * @param {number} detectionThreshold A number from 0 to 1 representing the percentage
 * @return {bidi.Dir} Estimated overall directionality of {@code str}.
 */
bidi.estimateDirection = function(text, detectionThreshold) {
  var rtlCount = 0;
  var totalCount = 0;
  var hasWeaklyLtr = false;
  var tokens = text.split(/\s+/);
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];
    if (bidi.isRtlText(token)) {
      rtlCount++;
      totalCount++;
    } else if (bidi.isRequiredLtrRe_.test(token)) {
      hasWeaklyLtr = true;
    } else if (bidi.hasAnyLtr(token)) {
      totalCount++;
    } else if (bidi.hasNumeralsRe_.test(token)) {
      hasWeaklyLtr = true;
    }
  }

  return totalCount == 0 ?
      (hasWeaklyLtr ? bidi.Dir.LTR : bidi.Dir.UNKNOWN) :
      (rtlCount / totalCount > detectionThreshold ?
          bidi.Dir.RTL : bidi.Dir.LTR);
};

/**
    Hasen el Judy

    Automatically set the direction of paragraphs in RTL languages.

    The simplest way to use this module is to call:

        bidiweb.style(query)

    Where `query` is a selector string that will be passed to
    document.querySelectorAll.  Any element maching this query will have its
    text content inspected, and the 'direction' and 'text-align' attributes
    will be set according to whether the text in this element is RTL or LTR.

    The following will fix the direction of all elements inside
    '.content'

        bidiweb.style('.content *');

    `style` is actually a convenience function that calls `bidiweb.process_style`,
    which is itself a convenience function that calls `bidiweb.process`.

    The `process` function takes a selection query string and a processor. A
    processor is an object that knows how to "fix" a certain element to make
    it RTL or LTR.

    The reason we have a processor object is that there are different ways of
    processing an element:

    - Setting the values for the 'direction' and 'text-align' attributes
      directly.

    - Set only the direction, but not the text-align.

      Sometimes text alignment is part of the design and not related to the
      direction of the text. It's not uncommon for English text to be
      right-aligned or for Arabic text to be left-aligned.

    - Giving the element a css class that takes care of these attributes, along
      with other attributes.

      Perhaps the direction is not the only thing you want to change for RTL
      paragraphs. Maybe you want to use a different font, or change their size
      or color, or any number of things; depending on what's required by the
      design.

    If you don't care about any of that and just want to fix the paragraphs
    inside a specific container, just call do it with '.container *'

    Does not depend on jQuery or any other library.

    Not tested on IE and not developed for it. If it works on IE, it's by accident.

    This file is licensed under the WTFPL.
*/

// namespace
bidiweb = (function(){
var module = {};

// processor interface - for documentation purposes only
IProcessor = {
    makeRtl: function(element) { },
    makeLtr: function(element) { }
}

// processor based on css classes
// @param classes: a dictionary with 2 keys: 'rtl' and 'ltr', each specifying a css class to be used
// returns: a css based processors that uses the given class names
var css_processor = function(classes) {
    return {
        makeRtl: function(element) {
            element.classList.add(classes.rtl);
        },
        makeLtr: function(element) {
            element.classList.add(classes.ltr);
        }
    }
}

// processor that changes the style inline
// @param falign: a boolean indicating whether align is to be set
// @returns: an inline processor
var style_processor = function(falign) {
    return {
        makeRtl: function(element) {
            element.style.direction = "rtl";
            if(falign) {
                element.style.textAlign = "right";
            }
        },
        makeLtr: function(element) {
            element.style.direction = "ltr";
            if(falign) {
                element.style.textAlign = "left";
            }
        }
    }
}

module.processors = {
    css: css_processor,
    style: style_processor
}

// take a node and wrap it in a NodeList like object
var nodeListMock = function(node) {
    var list = [node];
    list.item = function(i) {
        return list[i];
    }
    return list;
}

/**
    Fix the directionality of elements matching `query` using the processor `processor`.

    `query` must conform to the selector api, as we use document.selectQueryAll(), and not jQuery.

    `query` may also be a NodeList

    `query` may also be a Node

    `processor` is an object that conforms to the processor interface; namely it must provide:
        makeRtl(element)
        makeLtr(element)

    @returns the processed elements
 */
module.process = function (query, processor) {
    var elements;
    console.log("bidiweb: process")
    if(query instanceof NodeList) {
console.log("bidiweb: process 1")
        elements = query;
    } else if (query instanceof Node) {
console.log("bidiweb: process 2")
        elements = nodeListMock(query);
    } else {
console.log("bidiweb: process 3")
        elements = document.querySelectorAll(query);
    }
    module.process_elements(elements, processor);
    return elements;
}

/**
    Lowest level core

    Fix the directionality of given elements using the processor `processor`.

    `elements` must be a NodeList
        see https://developer.mozilla.org/en-US/docs/DOM/NodeList

    `processor` is an object that conforms to the processor interface; namely it must provide:
        makeRtl(element)
        makeLtr(element)
 */
module.process_elements = function(elements, processor) {
    for (var index = 0; index < elements.length; index++) {
        var element = elements.item(index);
        // for normal elements, we get textContent
        // for form fields, we get the value, then placeholder if value is empty
        // and we put the last || "" so we never get a null or undefined
        var text = element.textContent || element.value || element.placeholder || "";
        var dir = bidi.estimateDirection(text, 0.4);
        if(dir == bidi.Dir.RTL) {
            processor.makeRtl(element);
        } else if(dir == bidi.Dir.LTR) {
            processor.makeLtr(element);
        }
    };
}

/**
    Example usage:

        bidiweb.process_css(".content *", {rtl: 'rtl', ltr: 'ltr'})
 */
module.process_css = function(query, classes) {
    var proc = module.processors.css(classes);
    return module.process(query, proc);
}

/**
    Example usage:

        // fix direction attribute but not text-align attribute
        bidiweb.process_style(".headers *", false);

        // fix both direction and text-align attribute
        bidiweb.process_style(".content *", true);
 */
module.process_style = function(query, falign) {
    var proc = module.processors.style(falign);
    return module.process(query, proc);
}

/**
    The simplest and most straight forward interface: just fix the given
    elements using the style processor
 */
module.style = function(query) {
    console.log('bidiweb processing style')
    return module.process_style(query, true);
}

/**
    The second simplest way to do it: just like do it, but instead of fixing
    the style attributes, apply css classes 'rtl' or 'ltr'
 */
module.css = function(query) {
    return module.process_css(query, {rtl: 'rtl', ltr: 'ltr'});
}

// helpers
/**
    Takes raw html and encapsulates it in a div

    Helper
 */
module.htmlToElement = function(html) {
    var container = document.createElement('div');
    container.innerHTML = html;
    return container
}

/**
    Process html text, i.e. when you need to process stuff before inserting it into the DOM

    Note: all actual text must be inside html tags. Any text not inside a tag will be removed.

    @returns: the html processed, with rtl/ltr tags added to elements.
 */
module.html_css = function(html) {
    var container = module.htmlToElement(html);
    var nodes = container.querySelectorAll('*');
    module.css(nodes);
    return container.innerHTML;
}

/**
    Process html text, i.e. when you need to process stuff before inserting it into the DOM

    Note: all actual text must be inside html tags. Any text not inside a tag will be removed.

    @returns: the html processed, with rtl/ltr tags added to elements.
 */
module.html_style = function(html) {
    var container = module.htmlToElement(html);
    var nodes = container.querySelectorAll('*');
    module.style(nodes);
    return container.innerHTML;
}

return module;
})();
