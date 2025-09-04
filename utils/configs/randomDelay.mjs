export async function randomDelay(min = 1000, max = 3000) {

  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, delay));
}
