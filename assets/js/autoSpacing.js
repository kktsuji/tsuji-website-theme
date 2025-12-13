// Automatically add spacing between Japanese and English text (CSS-based)
(function() {
  'use strict';

  function addSpacingBetweenJapaneseAndEnglish() {
    // Target elements (adjust as needed)
    const targetSelectors = 'p, h1, h2, h3, h4, h5, h6, li, td, th, blockquote, figcaption';
    const elements = document.querySelectorAll(targetSelectors);

    elements.forEach(element => {
      processNode(element);
      addSpacingBetweenElements(element);
    });
  }

  function processNode(node) {
    const childNodes = Array.from(node.childNodes);
    
    childNodes.forEach(child => {
      if (child.nodeType === Node.TEXT_NODE) {
        const newNodes = addSpacingMarkers(child.textContent);
        if (newNodes.length > 0) {
          const fragment = document.createDocumentFragment();
          newNodes.forEach(item => {
            if (typeof item === 'string') {
              fragment.appendChild(document.createTextNode(item));
            } else {
              fragment.appendChild(item);
            }
          });
          child.replaceWith(fragment);
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        // Skip code, pre, script, style, kbd, samp tags for recursion
        if (!['CODE', 'PRE', 'SCRIPT', 'STYLE', 'KBD', 'SAMP'].includes(child.tagName)) {
          processNode(child);
        }
      }
    });
  }

  // Add spacing between elements (e.g., before/after <code>, <a> tags)
  function addSpacingBetweenElements(node) {
    const childNodes = Array.from(node.childNodes);
    
    for (let i = 0; i < childNodes.length - 1; i++) {
      const current = childNodes[i];
      const next = childNodes[i + 1];
      
      const lastChar = getLastChar(current);
      const firstChar = getFirstChar(next);
      
      if (lastChar && firstChar && needsSpacing(lastChar, firstChar)) {
        const spacer = document.createElement('span');
        spacer.className = 'ja-en-space';
        next.parentNode.insertBefore(spacer, next);
      }
    }
    
    // Recursively process child elements
    childNodes.forEach(child => {
      if (child.nodeType === Node.ELEMENT_NODE && 
          !['CODE', 'PRE', 'SCRIPT', 'STYLE', 'KBD', 'SAMP'].includes(child.tagName)) {
        addSpacingBetweenElements(child);
      }
    });
  }

  function getLastChar(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.trim().slice(-1);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const text = node.textContent.trim();
      return text.slice(-1);
    }
    return null;
  }

  function getFirstChar(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.trim().charAt(0);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const text = node.textContent.trim();
      return text.charAt(0);
    }
    return null;
  }

  function needsSpacing(char1, char2) {
    const isJapanese = (c) => /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF]/.test(c);
    const isEnglishOrSymbol = (c) => /[a-zA-Z0-9"'`()[\]{}<>*_=+\-!?@#$%^&|\\/:;.,]/.test(c);
    
    return (isJapanese(char1) && isEnglishOrSymbol(char2)) || (isEnglishOrSymbol(char1) && isJapanese(char2));
  }

  function addSpacingMarkers(text) {
    const result = [];
    let lastIndex = 0;
    
    // Pattern: Japanese followed by English/Number/Symbol
    // Pattern: English/Number/Symbol followed by Japanese
    // Include common symbols: quotes, parentheses, brackets, etc.
    const combinedPattern = /([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF])([a-zA-Z0-9"'`()[\]{}<>*_=+\-!?@#$%^&|\\/:;.,])|([a-zA-Z0-9"'`()[\]{}<>*_=+\-!?@#$%^&|\\/:;.,])([\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\uFF00-\uFFEF])/g;
    
    let match;
    while ((match = combinedPattern.exec(text)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        result.push(text.substring(lastIndex, match.index));
      }
      
      // Add the first character
      result.push(match[1] || match[3]);
      
      // Add spacing span (invisible but styled with CSS)
      const spacer = document.createElement('span');
      spacer.className = 'ja-en-space';
      result.push(spacer);
      
      // Add the second character
      result.push(match[2] || match[4]);
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.substring(lastIndex));
    }
    
    return result.length > 0 ? result : [];
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addSpacingBetweenJapaneseAndEnglish);
  } else {
    addSpacingBetweenJapaneseAndEnglish();
  }
})();
