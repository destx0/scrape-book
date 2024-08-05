export function scrapeQuestionAndOptions() {
	try {
		console.log("Starting scrape function");

		let result = {
			question: "",
			options: [],
			correctAnswer: null,
			explanation: "",
		};

		function cleanHtml(html) {
			return html
				.replace(/\s+/g, " ") // Replace multiple spaces with a single space
				.replace(/>\s+</g, "><") // Remove spaces between tags
				.trim(); // Remove leading and trailing whitespace
		}

		// Check for aei-comprehension elements
		const comprehensionElements =
			document.querySelectorAll(".aei-comprehension");
		console.log(
			`Found ${comprehensionElements.length} elements with class 'aei-comprehension'`
		);

		if (comprehensionElements.length > 0) {
			let comprehensionText = "";
			comprehensionElements.forEach((element) => {
				const divs = element.querySelectorAll("div");
				if (divs.length >= 2) {
					comprehensionText += cleanHtml(divs[1].innerHTML);
				}
			});
			result.question = comprehensionText + "\n\n";
		}

		const elements = Array.from(document.querySelectorAll(".qns-view-box"));
		console.log(
			`Found ${elements.length} elements with class 'qns-view-box'`
		);

		if (elements.length > 0) {
			let current = elements[1];
			let ultimateParentUl = null;

			while (current.parentElement) {
				if (current.tagName.toLowerCase() === "ul") {
					ultimateParentUl = current;
					break;
				}
				current = current.parentElement;
			}

			if (ultimateParentUl) {
				console.log("Found ultimate parent UL");
				const listItems = ultimateParentUl.querySelectorAll("li");
				console.log(`Found ${listItems.length} list items`);

				listItems.forEach((item, index) => {
					if (item.querySelector(".correctness")) {
						result.correctAnswer = index;
					}
				});

				elements.forEach((element, j) => {
					if (j === 0) {
						result.question += cleanHtml(element.innerHTML);
					} else if (j >= 1 && j <= 4) {
						result.options.push(cleanHtml(element.innerHTML));
					} else if (j === 5) {
						result.explanation = cleanHtml(element.innerHTML);
					}
				});
			}
		}

		console.log("Scraped data:", result);
		return {
			parsedContent: result,
			error: null,
		};
	} catch (error) {
		console.error("Error in scrapeQuestionAndOptions:", error);
		return {
			parsedContent: null,
			error: error.message,
		};
	}
}
