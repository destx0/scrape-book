export function scrapeQuestionAndOptions() {
	try {
		console.log("Starting scrape function");

		let result = "";

		// Check for aei-comprehension elements
		const comprehensionElements =
			document.querySelectorAll(".aei-comprehension");
		console.log(
			`Found ${comprehensionElements.length} elements with class 'aei-comprehension'`
		);

		if (comprehensionElements.length > 0) {
			const comprehensionElement =
				document.createElement("comprehension");
			comprehensionElements.forEach((element) => {
				const divs = element.querySelectorAll("div");
				if (divs.length >= 2) {
					comprehensionElement.innerHTML += divs[1].innerHTML;
				}
			});
			result += comprehensionElement.outerHTML + "\n\n";
		}

		const elements = Array.from(document.querySelectorAll(".qns-view-box"));
		console.log(
			`Found ${elements.length} elements with class 'qns-view-box'`
		);

		const newTags = ["question", "opta", "optb", "optc", "optd", "soln"];
		let correctOption = null;

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
						correctOption = index;
					}
				});

				elements.forEach((element, j) => {
					if (j < newTags.length) {
						const newElement = document.createElement(newTags[j]);
						newElement.innerHTML = element.innerHTML;
						result += newElement.outerHTML + "\n\n";
					}
				});

				if (correctOption !== null) {
					result += `<correctOption>${correctOption}</correctOption>\n\n`;
				}
			}
		}

		console.log("Scraped data:", result);
		return {
			parsedContent: result || null,
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
