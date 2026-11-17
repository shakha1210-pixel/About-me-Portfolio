(() => {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");
  const year = document.querySelector("#year");

  if (year) year.textContent = new Date().getFullYear();

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
      nav.classList.toggle("is-open", !isOpen);
    });
    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation");
        nav.classList.remove("is-open");
      });
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px 0px" });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const sections = document.querySelectorAll("main section[id]");
  const navLinks = document.querySelectorAll('.nav a[href^="#"]');
  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === "#" + entry.target.id;
          link.classList.toggle("active", active);
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Local command engine. Keep this adapter isolated so a real assistant API
  // can replace it later without changing the terminal UI.
  const form = document.querySelector("#terminal-form");
  const input = document.querySelector("#terminal-input");
  const output = document.querySelector("#terminal-output");
  const state = document.querySelector("#terminal-state");
  const voiceInputButton = document.querySelector("#voice-input");
  const voiceOutputButton = document.querySelector("#voice-output");
  const commandHistory = [];
  let historyIndex = 0;
  let spokenResponses = false;

  const destinations = {
    projects: "#work",
    work: "#work",
    about: "#about",
    profile: "#about",
    journey: "#journey",
    contact: "#contact",
    collaboration: ".collaboration-section"
  };

  const helpText = "Available: help · projects · about · journey · contact · status · clear. Try: “show me your projects”.";
  const normalize = (value) => value.toLowerCase().trim().replace(/[?!.,]/g, "").replace(/\s+/g, " ");

  const commandEngine = {
    mode: "local",
    async execute(rawCommand) {
      const query = normalize(rawCommand);
      if (!query) return { message: "Enter a command to get started." };

      if (/^(help|commands|what can you do)$/.test(query) || query.includes("show commands")) {
        return { message: helpText };
      }
      if (/^(clear|cls)$/.test(query)) return { message: "", clear: true };
      if (/^(status|system status|are you online)$/.test(query)) {
        return { message: "Interface operational. Command engine: local. External AI: not connected. Voice features: browser-dependent." };
      }

      const routes = [
        { match: /\b(projects?|work|portfolio|repositories|github)\b|show me .*projects|what have you built/, key: "projects", message: "Opening selected work. Three project entries are available." },
        { match: /\b(about|profile|who are you|who is dilshodbek|operator)\b|tell me about yourself/, key: "about", message: "Opening operator profile and working approach." },
        { match: /\b(journey|education|background|timeline)\b/, key: "journey", message: "Opening the learning and project timeline." },
        { match: /\b(contact|email|reach|collaborat|hire)\b|talk to you/, key: "contact", message: "Contact channel selected. Let's start a conversation." }
      ];
      const route = routes.find((item) => item.match.test(query));
      if (route) return { message: route.message, destination: destinations[route.key] };
      if (/^(hello|hi|hey|jarvis|good morning|good evening)$/.test(query)) {
        return { message: "Hello, operator. Interface is ready. Type help to see what I can do." };
      }
      return { message: "Command not recognized. Try “projects”, “about”, “contact”, or “help”." };
    }
  };

  const speak = (message) => {
    if (!spokenResponses || !("speechSynthesis" in window) || !message) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message);
    utterance.rate = 1;
    utterance.pitch = 0.92;
    window.speechSynthesis.speak(utterance);
  };

  const runCommand = async (rawCommand) => {
    if (!output) return;
    const result = await commandEngine.execute(rawCommand);
    output.textContent = result.message;
    if (result.clear) {
      output.textContent = "Terminal cleared. Awaiting input.";
      if (input) input.value = "";
      return;
    }
    if (result.destination) {
      const target = document.querySelector(result.destination);
      if (target) target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    }
    speak(result.message);
  };

  if (form && input && output) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const command = input.value.trim();
      if (!command) return;
      commandHistory.push(command);
      historyIndex = commandHistory.length;
      runCommand(command);
      input.value = "";
    });

    document.querySelectorAll("[data-command]").forEach((button) => {
      button.addEventListener("click", () => runCommand(button.dataset.command));
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "ArrowUp" && commandHistory.length) {
        event.preventDefault();
        historyIndex = Math.max(0, historyIndex - 1);
        input.value = commandHistory[historyIndex];
      }
      if (event.key === "ArrowDown" && commandHistory.length) {
        event.preventDefault();
        historyIndex = Math.min(commandHistory.length, historyIndex + 1);
        input.value = commandHistory[historyIndex] || "";
      }
    });

    document.addEventListener("keydown", (event) => {
      const activeTag = document.activeElement?.tagName;
      const typing = activeTag === "INPUT" || activeTag === "TEXTAREA" || document.activeElement?.isContentEditable;
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        input.focus();
      }
      if (event.key === "Escape" && document.activeElement === input) input.blur();
    });
  }

  if (voiceOutputButton) {
    const supported = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
    voiceOutputButton.disabled = !supported;
    voiceOutputButton.addEventListener("click", () => {
      if (!supported) return;
      spokenResponses = !spokenResponses;
      voiceOutputButton.setAttribute("aria-pressed", String(spokenResponses));
      voiceOutputButton.innerHTML = spokenResponses ? 'VOICE <span>ON</span>' : 'VOICE <span>OFF</span>';
      if (!spokenResponses) window.speechSynthesis.cancel();
      else speak("Voice response enabled.");
    });
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (voiceInputButton) {
    if (!SpeechRecognition) {
      voiceInputButton.disabled = true;
      voiceInputButton.title = "Voice input is not supported in this browser.";
      voiceInputButton.setAttribute("aria-label", "Voice input is not supported in this browser");
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.addEventListener("start", () => {
        voiceInputButton.classList.add("is-listening");
        voiceInputButton.innerHTML = 'MIC <span>LISTENING…</span>';
        if (state) state.textContent = "MIC ACTIVE";
      });
      recognition.addEventListener("end", () => {
        voiceInputButton.classList.remove("is-listening");
        voiceInputButton.innerHTML = 'MIC <span>◉</span>';
        if (state) state.textContent = "LOCAL MODE / READY";
      });
      recognition.addEventListener("result", (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript || "";
        if (input) input.value = transcript;
        runCommand(transcript);
      });
      recognition.addEventListener("error", (event) => {
        if (output) output.textContent = event.error === "not-allowed"
          ? "Microphone permission was denied. You can still type commands."
          : "Voice input unavailable. Please type your command instead.";
      });
      voiceInputButton.addEventListener("click", () => {
        try { recognition.start(); }
        catch { if (output) output.textContent = "Microphone is already starting. Please wait."; }
      });
    }
  }
})();