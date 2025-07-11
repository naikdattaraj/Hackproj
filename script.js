// ============ Typing Animation =============
const text = "AccessiLearn_";
let i = 0;

function typeTitle() {
  const titleEl = document.getElementById("typing-title");
  titleEl.innerHTML = "";

  function type() {
    if (i < text.length) {
      titleEl.innerHTML += text.charAt(i);
      i++;
      setTimeout(type, 100);
    }
  }

  type();
}

// ============ Accessibility Toggles ============
function toggleContrast() {
  document.getElementById("content").classList.toggle("high-contrast");
}

function toggleFontSize() {
  document.getElementById("content").classList.toggle("large-font");
}

function toggleDyslexiaFont() {
  document.getElementById("content").classList.toggle("dyslexia-font");
}

function toggleNightMode() {
  document.body.classList.toggle("night-mode");
  document.getElementById("content").classList.toggle("night-mode");
}

// ============ Read Aloud ============
function readText() {
  const content = document.getElementById("content").innerText;
  const speech = new SpeechSynthesisUtterance(content);
  speechSynthesis.speak(speech);
}

// ============ Add Draggable Sticky Note ============
function addStickyNote(x = null, y = null, content = "", id = `note-${Date.now()}`) {
  const note = document.createElement("textarea");
  note.className = "sticky-note";
  note.placeholder = "Write something...";
  note.dataset.id = id;
  note.value = content;

  // Target the container/card
  const container = document.querySelector(".main-container");
  const containerRect = container.getBoundingClientRect();

  // Center horizontally above the container
  const centerX = containerRect.left + containerRect.width / 2;
  const topY = containerRect.top - 60 + window.scrollY;

  note.style.left = `${centerX - 150}px`; // adjust based on note width (300px)
  note.style.top = `${topY}px`;
  note.style.width = "300px";

  // Save on input
  note.addEventListener("input", () => {
    saveNote(id, note.value, note.style.left, note.style.top);
  });

  // Right-click to delete
  note.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (confirm("Delete this sticky note?")) {
      localStorage.removeItem(note.dataset.id);
      note.remove();
    }
  });

  makeDraggable(note, id);
  document.body.appendChild(note);
}


function saveNote(id, content, left, top) {
  const data = { content, left, top };
  localStorage.setItem(id, JSON.stringify(data));
}

function makeDraggable(el, id) {
  let isDragging = false;
  let offsetX = 0, offsetY = 0;

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
    el.style.zIndex = 10000;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    el.style.left = `${e.clientX - offsetX}px`;
    el.style.top = `${e.clientY - offsetY}px`;
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      el.style.zIndex = 9999;
      saveNote(el.dataset.id, el.value, el.style.left, el.style.top);
    }
  });
}

// ============ Load Sticky Notes on Start ============
window.addEventListener("DOMContentLoaded", () => {
  for (let key in localStorage) {
    if (key.startsWith("note-")) {
      const saved = JSON.parse(localStorage.getItem(key));
      if (saved) {
        const content = saved.content || "";
        const left = parseInt(saved.left) || 100;
        const top = parseInt(saved.top) || 100;
        addStickyNote(left, top, content, key);
      }
    }
  }

  // Start typing animation
  i = 0;
  typeTitle();
});
function scrollToSummary() {
  document.getElementById("summary-box").scrollIntoView({ behavior: "smooth" });
}
// ============ AI Summarizer =============
async function summarizeText() {
  const content = document.getElementById("content").innerText.trim();
  const summaryBox = document.getElementById("summary-box");

  if (!content) {
    summaryBox.innerHTML = "<h3>Summary</h3><p>❗ No content to summarize.</p>";
    document.getElementById("copySummaryBtn").style.display = "none";
    document.getElementById("readSummaryBtn").style.display = "none";
    return;
  }

  summaryBox.innerHTML = "<h3>🧠 Summary</h3><p>⏳ Summarizing using AI... Please wait.</p>";

  try {
    const response = await fetch("https://api-inference.huggingface.co/models/facebook/bart-large-cnn", {
      method: "POST",
      headers: {
        "Authorization": "Bearer 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",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: content.slice(0, 1024)
      })
    });

    if (!response.ok) {
      summaryBox.innerHTML = `<p>⚠️ Error: ${response.status} ${response.statusText}</p>`;
      document.getElementById("copySummaryBtn").style.display = "none";
      document.getElementById("readSummaryBtn").style.display = "none";
      return;
    }

    const result = await response.json();
    const summary = result[0]?.summary_text || "⚠️ No summary returned.";

    summaryBox.innerHTML = `<h3>🧠 Summary</h3><p>${summary}</p>`;
    document.getElementById("copySummaryBtn").style.display = "inline-block";
    document.getElementById("readSummaryBtn").style.display = "inline-block";
    scrollToSummary(); 

  } catch (error) {
    summaryBox.innerHTML = `<p>❌ AI summarization failed: ${error.message}</p>`;
    document.getElementById("copySummaryBtn").style.display = "none";
    document.getElementById("readSummaryBtn").style.display = "none";
  }
}

// ============ Copy Summary =============
function copySummary() {
  const summaryBox = document.getElementById("summary-box");
  const button = document.getElementById("copySummaryBtn");

  const tempTextArea = document.createElement("textarea");
  tempTextArea.value = summaryBox.innerText.replace("🧠 Summary", "").trim();
  document.body.appendChild(tempTextArea);
  tempTextArea.select();
  document.execCommand("copy");
  document.body.removeChild(tempTextArea);

  button.innerText = "✅ Copied!";
  setTimeout(() => {
    button.innerText = "📋 Copy Summary";
  }, 1500);
}

// ============ Read Summary =============
function readSummary() {
  const summaryBox = document.getElementById("summary-box");
  const summaryText = summaryBox.innerText.replace("🧠 Summary", "").trim();

  if (!summaryText) return;

  const speech = new SpeechSynthesisUtterance(summaryText);
  speechSynthesis.speak(speech);
}

// ============ Highlight Line ============
document.addEventListener("mousemove", function (e) {
  const highlight = document.getElementById("highlight-line");
  if (highlight) {
    highlight.style.top = `${e.clientY - highlight.offsetHeight / 2}px`;
  }
});
