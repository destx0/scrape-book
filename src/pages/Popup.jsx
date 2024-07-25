import React, { useEffect, useState } from "react";
import "./Popup.css";

export default function Popup() {
	const [message, setMessage] = useState("");
	const [scrapedData, setScrapedData] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [port, setPort] = useState(null);

	useEffect(() => {
		const newPort = chrome.runtime.connect({ name: "popup" });
		setPort(newPort);

		newPort.onMessage.addListener(function (msg) {
			setIsLoading(false);
			if (msg.action === "clickNextResult") {
				setMessage(
					msg.success
						? "Next button clicked successfully"
						: "Failed to click next button"
				);
			} else if (msg.action === "scrapeQuestionResult") {
				if (msg.success) {
					setMessage("Question scraped successfully");
					setScrapedData(msg.data);
				} else {
					setMessage(`Failed to scrape question: ${msg.error}`);
				}
			} else if (msg.action === "checkModalResult") {
				setMessage(
					msg.isModalPresent ? "Modal is present" : "No modal found"
				);
			} else if (msg.action === "scrapeAllResult") {
				if (msg.success) {
					setMessage("All questions scraped successfully");
					setScrapedData(JSON.stringify(msg.data, null, 2));
				} else {
					setMessage(`Failed to scrape all questions: ${msg.error}`);
				}
			}
		});

		return () => {
			newPort.disconnect();
		};
	}, []);

	const sendMessage = (action) => {
		setIsLoading(true);
		setMessage("");
		setScrapedData("");
		port.postMessage({ action });
	};

	const handleNextQuestion = () => {
		sendMessage("clickNext");
	};

	const handleScrapeQuestion = () => {
		sendMessage("scrapeQuestion");
	};

	const handleCheckModal = () => {
		sendMessage("checkModal");
	};

	const handleScrapeAll = () => {
		sendMessage("scrapeAll");
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
				onClick={handleCheckModal}
				className="check-modal-button"
				disabled={isLoading}
			>
				Check for Modal
			</button>
			<button
				onClick={handleScrapeAll}
				className="scrape-all-button"
				disabled={isLoading}
			>
				Scrape All Questions
			</button>
			{isLoading && <p className="loading">Loading...</p>}
			{message && <p className="message">{message}</p>}
			{scrapedData && (
				<div className="scraped-data">
					<h2>Scraped Data:</h2>
					<pre>{scrapedData}</pre>
				</div>
			)}
		</div>
	);
}
