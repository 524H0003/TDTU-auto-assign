import { LocalStorage } from "./types";

const TDTURegex = /^https?:\/\/dkmh\.tdtu\.edu\.vn(:\d+)?\/.*$/;

// Enable logging with timestamp
const originalLog = console.log;
console.log = function (...args) {
  originalLog.apply(console, [`[${new Date().toISOString()}]`, ...args]);
};

function executeScript(tab: chrome.tabs.Tab) {
  const target = new URL(tab.url!).searchParams.get("go") || 'dkmhdkdd';

  chrome.storage.local.get<LocalStorage>(
    ["active", "password"],
    async ({ active, password }) => {
      if (!active) return;

      await chrome.scripting
        .executeScript({
          world: "MAIN",
          target: { tabId: tab.id! },
          files: ["./dist/context/" + target + ".js"],
        })
        .then(() => {
          console.log("Đã chèn thành công!");
        })
        .catch((err) => {
          console.error("Lỗi khi chèn script\n", err);
        });

      await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        world: "MAIN",
        args: [{ password }],
        func: (creds) => {
          if (typeof window.executeKit === "function") {
            window.executeKit(creds);
          }
        },
      });
    },
  );
}

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url || !TDTURegex.test(tab.url))
    return;

  executeScript(tab);
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (tab.url && TDTURegex.test(tab.url)) {
      executeScript(tab);
    }
  } catch (error) {
    console.error("Lỗi khi lấy thông tin tab:", error);
  }
});
