/* globals $, chrome */
var usedOn = {};
var openedOn = {};
var accessed = {};
var activeTabId;

function _debug() {
    // console.log.apply(console, arguments);
}

function _getMax() {
    return parseInt(localStorage.max || 20);
}

function _getAlgo() {
    return localStorage.algo || 'used';
}

function _handleTabActivated(data) {
    var tabId = data.tabId;
    activeTabId = tabId;
    _debug('activated', tabId);

    usedOn[tabId] = new Date().getTime();
    accessed[tabId] += 1;
}

function _handleTabRemoved(tabId) {
    _debug('removed', tabId);
    delete usedOn[tabId];
    delete openedOn[tabId];
    delete accessed[tabId];
}

function _removeTab(tabId) {
    _debug('_removeTab', tabId);
    if (tabId) {
        chrome.tabs.remove(tabId, function() {});
        _handleTabRemoved(tabId);
    }
}

function _getLowestIn(data, tabs) {
    var lowest;
    var lowestIndex;
    var tabId;
    var value;
    for (var i = 0; i < tabs.length; i++) {
        tabId = tabs[i].id;

        // never close the currently active tab
        if (tabId === activeTabId) {
            continue;
        }

        // if you have never been to this tab then skip it
        if (!data.hasOwnProperty(tabId)) {
            continue;
        }

        value = data[tabId] || 0;

        if (lowest === undefined) {
            lowest = value;
        }

        if (value <= lowest) {
            lowestIndex = i;
            lowest = value;
        }
    }

    return lowestIndex;
}

function _removeLeastAccessed(tabs) {
    var removeTabIndex = _getLowestIn(accessed, tabs);
    if (removeTabIndex >= 0) {
        _removeTab(tabs[removeTabIndex].id);
        tabs.splice(removeTabIndex, 1);
    }
    return tabs;
}

function _removeOldest(tabs) {
    var removeTabIndex = _getLowestIn(openedOn, tabs);
    if (removeTabIndex >= 0) {
        _removeTab(tabs[removeTabIndex].id);
        tabs.splice(removeTabIndex, 1);
    }
    return tabs;
}

function _removeLeastRecentlyUsed(tabs) {
    var removeTabIndex = _getLowestIn(usedOn, tabs);
    if (removeTabIndex >= 0) {
        _removeTab(tabs[removeTabIndex].id);
        tabs.splice(removeTabIndex, 1);
    }
    return tabs;
}

function _removeTabs(tabs) {
    var length = tabs.length;
    _debug('there are', tabs.length, 'tabs open');
    _debug('max is', _getMax());
    while (length >= _getMax()) {
        _debug('removing a tab with length', length);
        switch (_getAlgo()) {
            case 'oldest':
                tabs = _removeOldest(tabs);
                break;
            case 'accessed':
                tabs = _removeLeastAccessed(tabs);
                break;
            default:
                tabs = _removeLeastRecentlyUsed(tabs);
                break;
        }
        length -= 1;
    }
}

function _handleTabAdded(data) {
    var tabId = data.id || data;

    _debug('added', tabId);

    // find tab to remove
    chrome.tabs.query({currentWindow: true}, function(tabs) {
        tabs = tabs.filter(function(tab) {
            return !tab.pinned;
        });

        tabs = tabs.filter(function(tab) {
            return tab.id != tabId;
        });

        if (tabs.length >= parseInt(localStorage.max, 10)) {
            _removeTabs(tabs);
        }

        openedOn[tabId] = new Date().getTime();
        accessed[tabId] = 1;
    });
}

function _init() {
    chrome.tabs.onActivated.addListener(_handleTabActivated);
    chrome.tabs.onCreated.addListener(_handleTabAdded);
    chrome.tabs.onAttached.addListener(_handleTabAdded);
    chrome.tabs.onRemoved.addListener(_handleTabRemoved);
    chrome.tabs.onDetached.addListener(_handleTabRemoved);
}

$.ready(_init);
