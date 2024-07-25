import { scrapeQuestionAndOptions } from "./questionScraper.js";

console.log("Background script loaded");

let port;
let allQuestions = [];

chrome.runtime.onConnect.addListener(function (p) {
	port = p;
	console.log("Connected to popup");

	port.onMessage.addListener(function (msg) {
		console.log("Message received in background script:", msg);
		if (msg.action === "clickNext") {
			executeScriptInActiveTab(clickNextButton);
		} else if (msg.action === "scrapeQuestion") {
			executeScriptInActiveTab(scrapeQuestionAndOptions);
		} else if (msg.action === "scrapeAll") {
			scrapeAllQuestions();
		}
	});
});

function executeScriptInActiveTab(func) {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		chrome.scripting.executeScript(
			{
				target: { tabId: tabs[0].id },
				function: func,
			},
			function (results) {
				if (
					results &&
					results[0] &&
					results[0].result &&
					results[0].result.parsedContent
				) {
					allQuestions.push(results[0].result.parsedContent);
					port.postMessage({
						action: "updateScrapedData",
						data: allQuestions,
					});
				}
			}
		);
	});
}

function clickNextButton() {
	const nextButton = document.querySelector(
		'button.btn.btn-info-test.pull-right.mar-t0.ng-binding[ng-click="navBtnPressed(true)"]'
	);
	if (nextButton) {
		nextButton.click();
		return true;
	}
	return false;
}

function checkForModal() {
	const modal = document.querySelector(".modal-backdrop");
	return !!modal;
}

async function scrapeAllQuestions() {
	allQuestions = [];
	let isModalPresent = false;

	while (!isModalPresent) {
		try {
			const results = await chrome.tabs.query({
				active: true,
				currentWindow: true,
			});
			const tab = results[0];

			const scrapeResult = await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				function: scrapeQuestionAndOptions,
			});

			if (
				scrapeResult &&
				scrapeResult[0] &&
				scrapeResult[0].result &&
				scrapeResult[0].result.parsedContent
			) {
				allQuestions.push(scrapeResult[0].result.parsedContent);
				port.postMessage({
					action: "updateScrapedData",
					data: allQuestions,
				});
			}

			const clickResult = await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				function: clickNextButton,
			});

			if (!clickResult || !clickResult[0] || !clickResult[0].result) {
				break; // Break if next button click fails
			}

			// Wait for the page to load
			await new Promise((resolve) => setTimeout(resolve, 1));

			const modalCheckResult = await chrome.scripting.executeScript({
				target: { tabId: tab.id },
				function: checkForModal,
			});

			isModalPresent =
				modalCheckResult &&
				modalCheckResult[0] &&
				modalCheckResult[0].result;
		} catch (error) {
			console.error("Error in scrapeAllQuestions:", error);
			break;
		}
	}

	port.postMessage({
		action: "scrapeAllComplete",
		data: allQuestions,
	});
}
