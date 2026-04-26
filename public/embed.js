(function () {
  "use strict";

  var scripts = document.querySelectorAll("script[data-form-id]");
  scripts.forEach(function (script) {
    var formId = script.getAttribute("data-form-id");
    if (!formId) return;

    var origin = script.src.replace(/\/embed\.js.*$/, "");
    var mode = script.getAttribute("data-mode") || "inline";

    if (mode === "dialog") {
      initDialog(origin, formId, script);
    } else {
      initInline(origin, formId, script);
    }
  });

  // ── Inline mode ─────────────────────────────────────────────────────────────
  function initInline(origin, formId, script) {
    var wrapper = document.createElement("div");
    wrapper.style.cssText = "width:100%;max-width:600px;margin:0 auto;";

    var iframe = document.createElement("iframe");
    iframe.src = origin + "/f/" + formId + "?embed=inline";
    iframe.style.cssText = "width:100%;height:600px;border:none;border-radius:16px;display:block;";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("title", "SheetForm");

    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "sheetform-resize" && event.data.formId === formId) {
        iframe.style.height = (event.data.height + 32) + "px";
      }
    });

    wrapper.appendChild(iframe);
    script.parentNode.insertBefore(wrapper, script.nextSibling);
  }

  // ── Dialog mode ─────────────────────────────────────────────────────────────
  function initDialog(origin, formId, script) {
    var buttonText  = script.getAttribute("data-button-text")  || "Open Form";
    var buttonColor = script.getAttribute("data-button-color") || "#7c3aed";

    // Transition styles (injected once)
    var style = document.createElement("style");
    style.textContent =
      ".sf-overlay{transition:opacity 0.22s ease;}" +
      ".sf-modal{transition:opacity 0.22s ease,transform 0.22s cubic-bezier(0.34,1.3,0.64,1);}" +
      ".sf-open-btn:hover{filter:brightness(1.12);box-shadow:0 6px 28px rgba(0,0,0,0.28)!important;}" +
      ".sf-close-btn:hover{background:#f3f4f6!important;color:#111!important;}";
    document.head.appendChild(style);

    // ── Floating trigger button ──────────────────────────────────────────────
    var btn = document.createElement("button");
    btn.className = "sf-open-btn";
    btn.setAttribute("aria-label", buttonText);
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="margin-right:8px;flex-shrink:0">' +
        '<rect x="1" y="3" width="14" height="10" rx="2" stroke="white" stroke-width="1.5"/>' +
        '<path d="M4 7.5h4M4 10.5h7" stroke="white" stroke-width="1.4" stroke-linecap="round"/>' +
      '</svg>' + buttonText;
    btn.style.cssText =
      "position:fixed;bottom:24px;right:24px;z-index:999998;" +
      "display:flex;align-items:center;" +
      "background:" + buttonColor + ";color:#fff;" +
      "border:none;border-radius:100px;" +
      "padding:13px 22px;" +
      "font-size:15px;font-weight:600;" +
      "font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;" +
      "cursor:pointer;" +
      "box-shadow:0 4px 20px rgba(0,0,0,0.22);" +
      "transition:filter 0.15s ease,box-shadow 0.15s ease;";

    // ── Full-screen overlay ──────────────────────────────────────────────────
    var overlay = document.createElement("div");
    overlay.className = "sf-overlay";
    overlay.style.cssText =
      "position:fixed;inset:0;z-index:999999;" +
      "background:rgba(0,0,0,0.48);" +
      "display:flex;align-items:center;justify-content:center;padding:24px;" +
      "opacity:0;pointer-events:none;";

    // ── Modal card — flex column so header + body stack cleanly ─────────────
    var modal = document.createElement("div");
    modal.className = "sf-modal";
    modal.style.cssText =
      "display:flex;flex-direction:column;" +
      "max-width:520px;width:100%;" +
      "max-height:min(680px,calc(100vh - 64px));" +
      "background:#fff;border-radius:20px;overflow:hidden;" +
      "box-shadow:0 24px 80px rgba(0,0,0,0.22);" +
      "opacity:0;transform:scale(0.94);";

    // ── Modal header — close button lives here, never overlaps form ──────────
    var header = document.createElement("div");
    header.style.cssText =
      "display:flex;align-items:center;justify-content:flex-end;" +
      "padding:10px 12px 0;flex-shrink:0;";

    var closeBtn = document.createElement("button");
    closeBtn.className = "sf-close-btn";
    closeBtn.innerHTML = "&#x2715;";
    closeBtn.setAttribute("aria-label", "Close form");
    closeBtn.style.cssText =
      "background:transparent;border:none;" +
      "width:32px;height:32px;border-radius:8px;" +
      "display:flex;align-items:center;justify-content:center;" +
      "font-size:16px;color:#9ca3af;cursor:pointer;" +
      "transition:background 0.12s ease,color 0.12s ease;";

    // ── Scrollable body — iframe grows to content via postMessage ────────────
    var body = document.createElement("div");
    body.style.cssText =
      "flex:1;overflow-y:auto;overflow-x:hidden;min-height:0;";

    var iframe = document.createElement("iframe");
    iframe.src = origin + "/f/" + formId + "?embed=dialog";
    iframe.style.cssText = "width:100%;height:480px;border:none;display:block;";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("title", "SheetForm");

    // Resize iframe to its content height so the modal body decides scrolling
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "sheetform-resize" && event.data.formId === formId) {
        iframe.style.height = event.data.height + "px";
      }
    });

    // ── Open / close ─────────────────────────────────────────────────────────
    function openModal() {
      overlay.style.pointerEvents = "auto";
      overlay.style.opacity = "1";
      modal.style.opacity = "1";
      modal.style.transform = "scale(1)";
      document.body.style.overflow = "hidden";
    }

    function closeModal() {
      overlay.style.opacity = "0";
      modal.style.opacity = "0";
      modal.style.transform = "scale(0.94)";
      document.body.style.overflow = "";
      setTimeout(function () { overlay.style.pointerEvents = "none"; }, 240);
    }

    btn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", function (e) { e.stopPropagation(); closeModal(); });
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });

    // ── Assemble ─────────────────────────────────────────────────────────────
    header.appendChild(closeBtn);
    body.appendChild(iframe);
    modal.appendChild(header);
    modal.appendChild(body);
    overlay.appendChild(modal);
    document.body.appendChild(btn);
    document.body.appendChild(overlay);
  }
})();
