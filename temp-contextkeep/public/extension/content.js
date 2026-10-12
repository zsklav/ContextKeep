(() => {
  if (window.__contextKeepInitialized) return;
  window.__contextKeepInitialized = true;

  const ANSWER_SELECTOR = '[data-chatgpt-search-unit-key$=":assistant"]';

  const CONTENT_SELECTOR = '[data-markdown-text-style="assistant-message"]';

  const BUTTON_CLASS = "contextkeep-save-button";

  function addSaveButton(wrapper) {
    const contentElement = wrapper.querySelector(CONTENT_SELECTOR);

    if (!contentElement) return;
    if (wrapper.querySelector(`.${BUTTON_CLASS}`)) return;

    const button = document.createElement("button");
    button.className = BUTTON_CLASS;
    button.type = "button";
    button.textContent = "☆ Save to ContextKeep";

    Object.assign(button.style, {
      display: "inline-block",
      marginTop: "12px",
      padding: "8px 14px",
      border: "1px solid #5eead4",
      borderRadius: "8px",
      background: "#11182a",
      color: "#5eead4",
      fontSize: "13px",
      cursor: "pointer",
      fontFamily: "system-ui, sans-serif",
    });

    button.addEventListener("click", async () => {
      const content = (contentElement.innerText || "").trim();

      if (!content) {
        button.textContent = "No answer found";
        return;
      }

      button.disabled = true;
      button.textContent = "Saving...";

      try {
        const key = "contextkeep.answers";
        const result = await chrome.storage.local.get(key);
        const answers = Array.isArray(result[key]) ? result[key] : [];

        const messageId = wrapper.getAttribute(
          "data-chatgpt-selection-message-id",
        );

        const answer = {
          id: crypto.randomUUID(),
          title:
            content
              .split("\n")
              .find((line) => line.trim())
              ?.slice(0, 100) || "Saved ChatGPT answer",
          content,
          tags: [],
          source: "ChatGPT",
          url: window.location.href,
          messageId,
          createdAt: new Date().toISOString(),
        };

        await chrome.storage.local.set({
          [key]: [answer, ...answers],
        });

        button.textContent = "✓ Saved!";
      } catch (error) {
        console.error("ContextKeep save failed:", error);
        button.disabled = false;
        button.textContent = "Retry saving";
      }
    });

    contentElement.insertAdjacentElement("afterend", button);
  }

  function scanAnswers() {
    document.querySelectorAll(ANSWER_SELECTOR).forEach(addSaveButton);
  }

  scanAnswers();

  const observer = new MutationObserver(scanAnswers);
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
