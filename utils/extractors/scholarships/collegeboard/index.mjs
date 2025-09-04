/**
 * Extract scholarships from the current page (shared by both functions).
 */

export async function extractor(page) {
  return await page.evaluate(() => {
    const results = [];

    // Try multiple possible selectors for the container
    const container = document.querySelector(
      '[class*="ResultsSectionstyles__ResultsCardGrid"]'
    );

    if (!container) {
      return results;
    }

    // Try multiple possible selectors for scholarship cards
    let scholarships = container.querySelectorAll(
      '[class^="SearchResultCardstyles__StyledCardContainer-scholarship-search-ui"]'
    );

    if (!scholarships) {
      return results;
    }

    const extractDetails = (detailContainer) => {
      const refinedDetails = {};

      if (!detailContainer) return refinedDetails;

      const detailsList = detailContainer.querySelectorAll(".details");

      for (const detail of detailsList) {
        const key = detail.querySelector(".detailitem")?.textContent.trim();
        const value = detail.querySelector(".detailvalue")?.textContent.trim();

        if (key && value) {
          refinedDetails[key] = value;
        }
      }

      return refinedDetails;
    };

    scholarships.forEach((el, index) => {
      try {
        const secondaryContainer = el.querySelector(".secondarycontainer");

        const title = secondaryContainer
          .querySelector("h3.title")
          ?.textContent.trim();
        const openDate = secondaryContainer
          .querySelector(".dates > .opens > span.datevalue")
          ?.textContent.trim();
        const deadline = secondaryContainer
          .querySelector(".dates > .closes > span.datevalue")
          ?.textContent.trim();
        const amount = el
          .querySelector("span.card-container-amount.cb-unbounded")
          ?.textContent.trim();
        const link = el.querySelector("a")?.href || null;
        const detailContainer =
          secondaryContainer.querySelector(".detailsList");
        const details = extractDetails(detailContainer);

        if (title) {
          // Only add if we have at least a title
          results.push({
            name: title,
            link,
            application_open_date: openDate,
            application_close_date: deadline,
            amount,
            ...(details || {}),
          });
        }
      } catch (error) {
        console.log(`Error processing scholarship ${index}:`, error.message);
      }

      // Remove the element from the DOM to free up memory
      el.remove();
    });

    return results;
  });
}
