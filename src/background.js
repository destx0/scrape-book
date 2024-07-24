import { scrapeQuestionAndOptions } from "./questionScraper.js";

console.log("Background script loaded");

let port;

chrome.runtime.onConnect.addListener(function (p) {
	port = p;
	console.log("Connected to popup");

	port.onMessage.addListener(function (msg) {
		console.log("Message received in background script:", msg);
		if (msg.action === "clickNext") {
			chrome.tabs.query(
				{ active: true, currentWindow: true },
				function (tabs) {
					chrome.scripting.executeScript(
						{
							target: { tabId: tabs[0].id },
							function: clickNextButton,
						},
						function (results) {
							console.log("Script execution results:", results);
							port.postMessage({
								action: "clickNextResult",
								success:
									results && results[0] && results[0].result,
							});
						}
					);
				}
			);
		} else if (msg.action === "scrapeQuestion") {
			chrome.tabs.query(
				{ active: true, currentWindow: true },
				function (tabs) {
					chrome.scripting.executeScript(
						{
							target: { tabId: tabs[0].id },
							function: scrapeQuestionAndOptions,
						},
						function (results) {
							console.log("Scrape results:", results);
							if (results && results[0] && results[0].result) {
								const data = results[0].result;
								if (data.error) {
									port.postMessage({
										action: "scrapeQuestionResult",
										success: false,
										error: data.error,
									});
								} else if (data.parsedContent) {
									port.postMessage({
										action: "scrapeQuestionResult",
										success: true,
										data: data.parsedContent,
									});
								} else {
									port.postMessage({
										action: "scrapeQuestionResult",
										success: false,
										error: "Unexpected result format",
									});
								}
							} else {
								port.postMessage({
									action: "scrapeQuestionResult",
									success: false,
									error: "Failed to execute script",
								});
							}
						}
					);
				}
			);
		} else if (msg.action === "checkModal") {
			chrome.tabs.query(
				{ active: true, currentWindow: true },
				function (tabs) {
					chrome.scripting.executeScript(
						{
							target: { tabId: tabs[0].id },
							function: checkForModal,
						},
						function (results) {
							console.log("Modal check results:", results);
							if (
								results &&
								results[0] &&
								results[0].result !== undefined
							) {
								port.postMessage({
									action: "checkModalResult",
									isModalPresent: results[0].result,
								});
							} else {
								port.postMessage({
									action: "checkModalResult",
									isModalPresent: false,
									error: "Failed to check for modal",
								});
							}
						}
					);
				}
			);
		}
	});
});

function clickNextButton() {
	const nextButton = document.querySelector(
		'button.btn.btn-info-test.pull-right.mar-t0.ng-binding[ng-click="navBtnPressed(true)"]'
	);
	if (nextButton) {
		nextButton.click();
		console.log("Next button clicked");
		return true;
	} else {
		console.log("Next button not found");
		return false;
	}
}

function checkForModal() {
	const modal = document.querySelector(".modal-backdrop");
	return !!modal;
}
