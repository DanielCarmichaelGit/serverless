export async function extractor(page) {
  return await page.evaluate(() => {
    const container = document.querySelector(
      ".container:last-of-type > .row.cb-no-gutter > div.col-md-10.offset-md-1.col-lg-8"
    );

    if (!container) return {};

    const subheading = container
      .querySelector(".row > .col-sm-8 > div:first-of-type")
      ?.textContent.trim();
    const description = container
      .querySelector('[data-testid="about-para"]')
      ?.textContent.trim();

    const eligCriterias = [];
    const furtherDetails = [];

    const eligibility = container.querySelector("#eligibility-criteria");
    if (eligibility) {
      const eligCriteria = eligibility.querySelectorAll("li");
      if (eligCriteria) {
        eligCriterias.push(
          ...Array.from(eligCriteria).map((li) => li.textContent.trim())
        );
      }
    }

    const accordion = container.querySelector(".cb-accordion");
    if (accordion) {
      const accordionItems = accordion.querySelectorAll(
        ".cb-accordion-container"
      );
      if (accordionItems) {
        accordionItems.forEach((item) => {
          const title = item
            .querySelector(".cb-accordion-heading-title > span")
            ?.textContent.trim();
          const content = item
            .querySelector(".cb-accordion-panel-content > div > span")
            ?.textContent.trim();

          if (title && content) {
            furtherDetails.push({ title, content });
          }
        });
      }
    }

    return {
      subheading,
      description,
      eligCriterias,
      furtherDetails,
    };
  });
}
