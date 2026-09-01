/// <reference types="chrome"/>

// Enable side panel behavior
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

console.log("Background script initialized!");
