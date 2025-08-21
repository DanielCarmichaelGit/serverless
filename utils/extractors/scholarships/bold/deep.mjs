export async function extractor(page) {
  return await page.evaluate(() => {
    console.log("extracting bold deep");
    // primary content
    const container = document.querySelector(
      "body > div.relative.flex.min-h-screen.flex-col > main > div > div > div:nth-child(1) > div > div:nth-child(1) > div.flex.flex-col.px-0 > div.px-5 > div:nth-child(3)"
    );
    const essayTopicContainer = document.querySelector(
      "body > div.relative.flex.min-h-screen.flex-col > main > div > div > div:nth-child(1) > div > div:nth-child(1) > div:nth-child(3) > div"
    );

    if (!container) return null;

    const safeText = (selector) =>
      container.querySelector(selector)?.textContent.trim() || null;

    const elContainer = container.querySelector(".mb-10 .flex.items-center");

    let elKeysContainer = null;
    let elKeysElements = null;
    let elKeys = null;
    let elValuesContainer = null;
    let elValuesElements = null;
    let elValues = null;
    let eligibility = null;

    if (elContainer) {
      elKeysContainer = elContainer.querySelector(".mr-5.hidden");
      elKeysElements = elKeysContainer.querySelectorAll(".mb-3 div.text-text");
      elKeys = Array.from(elKeysElements).map((el) => el?.textContent.trim());

      elValuesContainer = elContainer.querySelector(".hidden:not(.mr-5)");
      elValuesElements = elValuesContainer.querySelectorAll(
        ".mb-3 div.text-text"
      );
      elValues = Array.from(elValuesElements).map((el) =>
        el?.textContent.trim()
      );

      // items
      eligibility = elKeys.map((key, index) => ({
        [key]: elValues[index],
      }));
    }

    const description = Array.from(
      container.querySelectorAll("div.text-text.break-words.text-lg p")
    )
      .map((el) => el?.textContent.trim())
      .join("\n\n");
    const selectionCriteria = safeText(
      "div.mt-5.flex.flex-col.flex-wrap.pt-5 > div.text-text"
    );
    let essayTopic = null;
    let wordCount = null;

    if (essayTopicContainer) {
      essayTopic = essayTopicContainer
        .querySelector(".mb-5 .text-text.mx-auto p span")
        ?.textContent.trim();
      wordCount = essayTopicContainer.querySelector(
        ".text-center.text-sm.text-gray-600"
      );
    }
    const winningApplication = document
      .querySelector(
        "#winning-application > div:nth-child(2) > div:nth-child(2)"
      )
      ?.textContent.trim();

    // secondary content
    const secondaryContainer = document.querySelector(
      "body > div.relative.flex.min-h-screen.flex-col > main > div > div > div:nth-child(1) > div > div:nth-child(1) > div.flex.flex-col.px-0 > div.hidden > div > div"
    );
    let winnersAnnounced = null;
    if (secondaryContainer) {
      winnersAnnounced = secondaryContainer
        .querySelector(
          "div.mt-7.flex.flex-wrap.justify-between > div:nth-child(2) > div.text-text.text-sm.font-semibold.leading-tight"
        )
        ?.textContent.trim();
    }

    // Adjust selectors based on the actual page structure
    const data = {
      eligibility,
      description,
      selectionCriteria,
      essayTopic,
      wordCount,
      winningApplication,
      winnersAnnounced,
    };

    console.log("extracted bold deep", data);

    return data;
  });
}
