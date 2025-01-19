chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentTab = tabs[0];
        const currentTabUrl = currentTab.url;

        // Open the new tab
        chrome.tabs.create({ url: 'https://cobalt.tools/' }, (newTab) => {
            const newTabId = newTab.id;

            // Add a listener to wait for the tab to finish loading
            const onTabUpdated = (tabId, changeInfo) => {
                if (tabId === newTabId && changeInfo.status === 'complete') {
                    // Inject the script once the page is fully loaded
                    chrome.scripting.executeScript({
                        target: { tabId: newTabId },
                        func: (url) => {
                            const waitForElement = (selector, timeout) => {
                                return new Promise((resolve, reject) => {
                                    const observer = new MutationObserver((_, obs) => {
                                        const element = document.querySelector(selector);
                                        if (element) {
                                            obs.disconnect();
                                            resolve(element);
                                        }
                                    });

                                    observer.observe(document.body, { childList: true, subtree: true });

                                    // Timeout if the element isn't found
                                    setTimeout(() => {
                                        observer.disconnect();
                                        reject(new Error(`Element with selector "${selector}" not found within ${timeout}ms.`));
                                    }, timeout);
                                });
                            };

                            waitForElement('#link-area', 10000)
                                .then((inputElement) => {
                                    inputElement.value = url; // Insert the URL
                                    console.log('URL inserted into input:', url);
                                })
                                .catch((error) => {
                                    console.error(`Error while waiting for link-area element: ${error.message}`);
                                });
                        },
                        args: [currentTabUrl],
                    });

                    // Remove the listener once the script is injected
                    chrome.tabs.onUpdated.removeListener(onTabUpdated);
                }
            };

            chrome.tabs.onUpdated.addListener(onTabUpdated);
        });
    });
});
