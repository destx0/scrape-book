import React, { useEffect, useState } from "react";
import "./Popup.css";

export default function Popup() {
	const [scrapedData, setScrapedData] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [port, setPort] = useState(null);

	useEffect(() => {
		const newPort = chrome.runtime.connect({ name: "popup" });
		setPort(newPort);

		newPort.onMessage.addListener(function (msg) {
			if (
				msg.action === "updateScrapedData" ||
				msg.action === "scrapeAllComplete"
			) {
				setScrapedData(msg.data);
				setIsLoading(false);
			}
		});

		return () => {
			newPort.disconnect();
		};
	}, []);

	const sendMessage = (action) => {
		setIsLoading(true);
		port.postMessage({ action });
	};

	const handleNextQuestion = () => {
		sendMessage("clickNext");
	};

	const handleScrapeQuestion = () => {
		sendMessage("scrapeQuestion");
	};

	const handleScrapeAll = () => {
		sendMessage("scrapeAll");
	};

	const handleDownloadData = () => {
		chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
			chrome.scripting.executeScript(
				{
					target: { tabId: tabs[0].id },
					func: () => {
						const element = document.querySelector(
							".left-box.back-to-mytests.top-header.ng-scope .d-inline-block h6"
						);
						return element
							? element.textContent.trim()
							: "scraped_data";
					},
				},
				(results) => {
					const testName = results[0].result || "ssc_cgl_full_test_1";
					const sanitizedName = testName
						.replace(/[^a-z0-9]/gi, "_")
						.toLowerCase();

					const jsonString = JSON.stringify(scrapedData, null, 2);
					const blob = new Blob([jsonString], {
						type: "application/json",
					});
					const url = URL.createObjectURL(blob);

					chrome.downloads.download(
						{
							url: url,
							filename: `${sanitizedName}.json`,
							saveAs: true,
						},
						() => {
							URL.revokeObjectURL(url);
						}
					);
				}
			);
		});
	};

	return (
		<div className="popup-container">
			<img
				src="/icon-with-shadow.svg"
				alt="Extension icon"
				className="popup-icon"
			/>
			<h1 className="popup-title">Testbook Automation</h1>
			<button
				onClick={handleNextQuestion}
				className="next-button"
				disabled={isLoading}
			>
				Go to Next Question
			</button>
			<button
				onClick={handleScrapeQuestion}
				className="scrape-button"
				disabled={isLoading}
			>
				Scrape Question
			</button>
			<button
				onClick={handleScrapeAll}
				className="scrape-all-button"
				disabled={isLoading}
			>
				Scrape All Questions
			</button>
			<button
				onClick={handleDownloadData}
				className="download-button"
				disabled={isLoading || scrapedData.length === 0}
			>
				Download Scraped Data
			</button>
			{isLoading && <p className="loading">Loading...</p>}
			{scrapedData.length > 0 && (
				<div className="scraped-data">
					<h2>Scraped Questions: {scrapedData.length}</h2>
				</div>
			)}
		</div>
	);
}
