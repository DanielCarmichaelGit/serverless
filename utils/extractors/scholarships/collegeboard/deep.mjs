export async function extractor(page) {
    return await page.evaluate(() => {
        const results = [];

        const mainScholarships = document.querySelectorAll(
            "body > div.relative.flex.min-h-screen.flex-col > main > div > div.bg-gray-50.pb-10 > div > div > div > div.relative:not([data-testid*='scholarship'])"
        );
    });
}