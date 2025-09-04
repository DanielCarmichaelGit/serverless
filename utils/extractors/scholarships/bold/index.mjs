/**
 * Extract scholarships from the current page (shared by both functions).
 */

export async function extractor(page) {
  return await page.evaluate(() => {
    let results = [];

    const mainScholarships = document.querySelectorAll(
      "body > div.relative.flex.min-h-screen.flex-col > main > div > div.bg-gray-50.pb-10 > div > div > div > div.relative:not([data-testid*='scholarship'])"
    );

    const sponsoredScholarships = document.querySelectorAll(
      "body > div.relative.flex.min-h-screen.flex-col > main > div > div.bg-gray-50.pb-10 > div > div > div > div.relative[data-testid*='scholarship']"
    );

    const extract = (el, selectors) =>
      selectors.map((s) => el.querySelector(s)?.textContent.trim() || null);

    mainScholarships.forEach((el) => {
      const [
        title,
        description,
        sponsor,
        deadline,
        awardCount,
        amount,
        gradeLevel,
      ] = extract(el, [
        "div > div > a > div.relative.flex.flex-wrap > div.flex.flex-1.flex-col.self-center > p",
        "div > div > a > div.relative.flex.flex-wrap > div.flex.flex-1.flex-col.self-center > div > div.border-t.border-t-gray-200.pt-5.text-sm.leading-tight.opacity-50",
        "div > div > a > div.relative.flex.flex-wrap > div.flex.flex-1.flex-col.self-center > div > div.no-underline.text-inherit > div > div.text-text.flex.items-center.text-sm.leading-none",
        "div > div > a > div.mt-7.flex.flex-wrap.justify-between > div:nth-child(4) > div.flex.items-center > div.text-text.text-center.font-semibold",
        "div > div > a > div.mt-7.flex.flex-wrap.justify-between > div:nth-child(3) > div.flex.items-center > div.text-text.text-center.font-semibold",
        "div > div > a > div.mt-7.flex.flex-wrap.justify-between > div:nth-child(2) > div.flex.items-center > div.text-text.text-center.font-semibold",
        "div > div > a > div.mt-7.flex.flex-wrap.justify-between > div:nth-child(1) > div.flex.items-center > div.text-text.text-center.font-semibold",
      ]);

      let link = el.querySelector("div > div > div > a")?.href || null;
      if (link?.startsWith("/")) link = "https://bold.org" + link;

      results.push({
        name: title,
        link,
        sponsor,
        description,
        application_close_date: deadline,
        award_count: awardCount,
        amount,
        education_level: gradeLevel,
      });
    });

    sponsoredScholarships.forEach((el) => {
      const leftEl = el.querySelector("div > div > a");
      const title =
        leftEl
          ?.querySelector("p.text-lg.font-semibold.leading-6.text-inherit")
          ?.textContent.trim() || null;

      const [description, sponsor, deadline, awardCount, amount, gradeLevel] =
        extract(el, [
          "div.mt-5.text-sm.leading-5.opacity-50",
          "div.text-text.flex.items-center.text-sm.leading-none",
          "div > div > a > div.mt-7.flex.flex-wrap.justify-between > div:nth-child(4) > div.flex.items-center > div.text-text.text-center.font-semibold",
          "div > div > a > div.mt-7.flex.flex-wrap.justify-between > div:nth-child(3) > div.flex.items-center > div.text-text.text-center.font-semibold",
          "div > div > a > div.mt-7.flex.flex-wrap.justify-between > div:nth-child(2) > div.flex.items-center > div.text-text.text-center.font-semibold",
          "div > div > a > div.mt-7.flex.flex-wrap.justify-between > div:nth-child(1) > div.flex.items-center > div.text-text.text-center.font-semibold",
        ]);

      let link = el.querySelector("div > div > div > a")?.href || null;
      if (link?.startsWith("/")) link = "https://bold.org" + link;

      results.push({
        name: title,
        link,
        sponsor,
        description,
        application_close_date: deadline,
        award_count: awardCount,
        amount,
        education_level: gradeLevel,
      });
    });

    results = results.filter(scholarship => {
      if (!scholarship.application_close_date) return false;
      const deadlineDate = new Date(scholarship.application_close_date);
      const currentDate = new Date();
      return deadlineDate > currentDate;
    })

    return results;
  });
}
