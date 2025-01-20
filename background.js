chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, ([currentTab]) => {
        chrome.tabs.create({ url: 'https://cobalt.tools/' }, (newTab) => {
            chrome.tabs.onUpdated.addListener(function onTabUpdated(tabId, changeInfo) {
                if (tabId !== newTab.id || changeInfo.status !== 'complete') return;
                chrome.scripting.executeScript({
                    target: { tabId },
                    args: [currentTab.url],
                    func: (url) => {
                        new Promise((resolve, reject) => {
                            const observer = new MutationObserver((_, obs) => {
                                const e = document.querySelector('#link-area');
                                e && (obs.disconnect(), resolve(e));
                            });
                            observer.observe(document.body, { childList: true, subtree: true });
                            setTimeout(() => {
                                observer.disconnect();
                                reject(new Error("Element \"#link-area\" not found within 10000ms."));
                            }, 10000);
                        })
                        .then((inputElement) => {
                            inputElement.value = url;
                            inputElement.dispatchEvent(new Event('input', { bubbles: true }));
                        })
                        .catch((error) => console.error(error.message));
                    }
                });
                chrome.tabs.onUpdated.removeListener(onTabUpdated);
            });
        });
    });
});