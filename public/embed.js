(function () {
  "use strict";

  var scripts = document.querySelectorAll("script[data-form-id]");
  scripts.forEach(function (script) {
    var formId = script.getAttribute("data-form-id");
    if (!formId) return;

    var origin = script.src.replace(/\/embed\.js.*$/, "");

    var wrapper = document.createElement("div");
    wrapper.style.width = "100%";
    wrapper.style.maxWidth = "600px";
    wrapper.style.margin = "0 auto";

    var iframe = document.createElement("iframe");
    iframe.src = origin + "/f/" + formId;
    iframe.style.width = "100%";
    iframe.style.height = "600px";
    iframe.style.border = "none";
    iframe.style.borderRadius = "16px";
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("title", "SheetForm");

    // Auto-resize iframe based on content height messages
    window.addEventListener("message", function (event) {
      if (event.data && event.data.type === "sheetform-resize" && event.data.formId === formId) {
        iframe.style.height = event.data.height + "px";
      }
    });

    wrapper.appendChild(iframe);
    script.parentNode.insertBefore(wrapper, script.nextSibling);
  });
})();
