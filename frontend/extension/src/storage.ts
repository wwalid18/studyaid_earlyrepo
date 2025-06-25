export const getToken = async (): Promise<string | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(['access_token'], (result) => {
      resolve(result.access_token || null);
    });
  });
};

export const getAccessToken = getToken;
