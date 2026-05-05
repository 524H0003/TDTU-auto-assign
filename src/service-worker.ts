import { LocalStorage } from "./types";

const TDTURegex = /^https?:\/\/dkmh\.tdtu\.edu\.vn(:\d+)?\/.*$/;

// Enable logging with timestamp
const originalLog = console.log;
console.log = function (...args) {
  originalLog.apply(console, [`[${new Date().toISOString()}]`, ...args]);
};

const executingTabs = new Set<number>();

function executeScript(tab: chrome.tabs.Tab) {
  if (!tab.id || executingTabs.has(tab.id)) {
    console.log("Script đang chạy trên tab này hoặc tab không hợp lệ, bỏ qua.");
    return;
  }

  executingTabs.add(tab.id);

  const target = new URL(tab.url!).searchParams.get("go") || "dkmhdkdd";

  chrome.storage.local.get<LocalStorage>(
    ["active", "password", "plan"],
    async (input) => {
      try {
        if (!input.active) return;

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
          args: [input],
          func: (creds) => {
            if (typeof window.executeKit === "function") {
              window.executeKit(creds);
            }
          },
        });

        console.log("Đã thực thi login thành công!");
      } catch (err) {
        console.error("Lỗi khi chèn/thực thi script\n", err);
      } finally {
        executingTabs.delete(tab.id!);
      }
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

const RULE_ID = 1001;

async function syncBlockingRule(): Promise<void> {
  const data = await chrome.storage.local.get<LocalStorage>(["blockResource"]);
  const shouldBlock = data.blockResource === true;

  if (shouldBlock) {
    const rule: chrome.declarativeNetRequest.Rule = {
      id: RULE_ID,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.BLOCK,
      },
      condition: {
        urlFilter: "*://dkmh.tdtu.edu.vn/*",
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.STYLESHEET,
          chrome.declarativeNetRequest.ResourceType.FONT,
          chrome.declarativeNetRequest.ResourceType.IMAGE,
        ],
      },
    };

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [rule],
      removeRuleIds: [RULE_ID],
    });
    console.log("Đã kích hoạt chặn CSS/Images trên *.tdtu.edu.vn");
  } else {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [RULE_ID],
    });

    console.log("Đã gỡ chặn trên *.tdtu.edu.vn");
  }
}

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.blockResource) {
    syncBlockingRule();
  }
});

chrome.runtime.onInstalled.addListener(syncBlockingRule);
chrome.runtime.onStartup.addListener(syncBlockingRule);
