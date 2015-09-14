/* globals $, chrome */
var usedOn = {};
var openedOn = {};
var accessed = {};
var activeTabId;
var timeout;
var activeInterval = 2500;

function _debug() {
    // console.log.apply(console, arguments);
}

function _getMax() {
    return parseInt(localStorage.max || 20);
}

function _getAlgo() {
    return localStorage.algo || 'used';
}

function _markActive(tabId) {
    _debug('marked active', tabId);
    usedOn[tabId] = new Date().getTime();
    accessed[tabId] += 1;
}

function _handleTabActivated(data) {
    var tabId = data.tabId;
    activeTabId = tabId;
    _debug('activated', tabId);

    clearTimeout(timeout);

    // after 3 seconds mark this tab as active
    // this is so if you are quickly switching tabs
    // they are not considered active
    timeout = setTimeout(function() {
        _markActive(tabId);
    }, activeInterval);
}

function _handleTabRemoved(tabId) {
    clearTimeout(timeout);

    _debug('removed', tabId);
    delete usedOn[tabId];
    delete openedOn[tabId];
    delete accessed[tabId];
}

function _handleTabReplaced(newTabId, oldTabId) {
    if (usedOn[oldTabId]) {
        usedOn[newTabId] = usedOn[oldTabId];
    }

    if (openedOn[oldTabId]) {
        openedOn[newTabId] = openedOn[oldTabId];
    }

    if (accessed[oldTabId]) {
        accessed[newTabId] = accessed[oldTabId];
    }

    delete usedOn[oldTabId];
    delete openedOn[oldTabId];
    delete accessed[oldTabId];
}

function _removeTab(tabId) {
    _debug('_removeTab', tabId);
    if (tabId) {
        chrome.tabs.remove(tabId, function() {});
        // _handleTabRemoved(tabId);
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
        if (!usedOn.hasOwnProperty(tabId) || !data.hasOwnProperty(tabId)) {
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
            return !tab.pinned && tab.id != tabId;
        });

        _debug('Total tabs', tabs.length);
        _debug('Max tabs', _getMax());

        if (tabs.length >= _getMax()) {

            // If this is set to block just immediately remove this tab before
            // even adding info about it
            if (_getAlgo() === 'block') {
                _removeTab(tabId);
                return;
            }

            _removeTabs(tabs);
        }

        openedOn[tabId] = new Date().getTime();
        accessed[tabId] = 0;
    });
}

function _bindEvents() {
    chrome.tabs.onActivated.addListener(_handleTabActivated);
    chrome.tabs.onCreated.addListener(_handleTabAdded);
    chrome.tabs.onAttached.addListener(_handleTabAdded);
    chrome.tabs.onRemoved.addListener(_handleTabRemoved);
    chrome.tabs.onDetached.addListener(_handleTabRemoved);
    chrome.tabs.onReplaced.addListener(_handleTabReplaced);
}

function _init() {

    // on startup loop through all existing tabs and set them to active
    // this is only needed so that if you first install the extension
    // or bring a bunch of tabs in on startup it will work
    //
    // setting the time to their tab id ensures they will be closed in
    // the order they were opened in and there is no way to figure
    // out what time a tab was opened from chrome apis
    chrome.tabs.query({}, function(tabs) {
        for (var i = 0; i < tabs.length; i++) {
            if (!usedOn.hasOwnProperty(tabs[i].id)) {
                openedOn[tabs[i].id] = tabs[i].id;
                usedOn[tabs[i].id] = tabs[i].id;
                accessed[tabs[i].id] = 0;
            }
        }

        _bindEvents();
    });
}

$.ready(_init);
