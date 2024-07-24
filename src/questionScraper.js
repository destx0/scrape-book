// questionScraper.js

export function scrapeQuestionAndOptions() {
	try {
		console.log("Starting scrape function");

		const elements = Array.from(document.querySelectorAll(".qns-view-box"));
		console.log(
			`Found ${elements.length} elements with class 'qns-view-box'`
		);

		if (elements.length === 0) {
			return { error: "No elements found with class 'qns-view-box'" };
		}

		const newTags = ["question", "opta", "optb", "optc", "optd", "soln"];
		let result = "";

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

				let correctOptionFound = false;
				for (let i = 0; i < listItems.length; i++) {
					if (listItems[i].querySelector(".correctness")) {
						correctOptionFound = true;
						elements.forEach((element, j) => {
							if (j < newTags.length) {
								const newElement = document.createElement(
									newTags[j]
								);
								newElement.innerHTML = element.innerHTML;
								result += newElement.outerHTML + "\n\n";
							}
						});
						result += `<correctOption>${i}</correctOption>\n\n`;
						break;
					}
				}

				if (!correctOptionFound) {
					return { error: "No correct option found" };
				}
			} else {
				return { error: "Could not find parent UL element" };
			}
		}

		if (result === "") {
			return { error: "No data was scraped" };
		}

		console.log("Scraped data:", result);
		return {
			parsedContent: result,
		};
	} catch (error) {
		console.error("Error in scrapeQuestionAndOptions:", error);
		return { error: error.message };
	}
}
