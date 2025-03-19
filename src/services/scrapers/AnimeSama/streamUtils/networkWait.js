export async function waitForNetworkIdle(
  page,
  timeout = 10000,
  maxInflightRequests = 0
) {
  try {
    await page.waitForNetworkIdle({
      timeout,
      idleTime: 500,
      maxInflightRequests,
    });
  } catch (error) {
    console.log("Network idle timeout reached:", error.message);
  }
}
