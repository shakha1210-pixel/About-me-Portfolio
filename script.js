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

  const helpText = [
    "LOCAL KNOWLEDGE BASE / AVAILABLE TOPICS",
    "• profile — role, focus, working style",
    "• apeiron — purpose, stack, current scope, limitations",
    "• nexus — purpose, stack, current scope, limitations",
    "• logic hub — modules and project scope",
    "• compare projects — how Apeiron and NEXUS differ",
    "• education — learning background",
    "• languages — communication",
    "• collaboration — contact details",
    "• status / clear — terminal controls",
    "Try natural questions such as: “What does NEXUS do?” or “What is Apeiron built with?”"
  ].join("\n");

  const normalize = (value) => value
    .toLowerCase()
    .trim()
    .replace(/[’']/g, "")
    .replace(/[?!.,]/g, "")
    .replace(/\s+/g, " ");

  // Verified portfolio facts only. This is a local knowledge base, not an LLM.
  const knowledge = {
    profile: [
      "DILSHODBEK QOSIMOV / PROFILE",
      "An aspiring product-focused developer interested in application architecture, AI-assisted engineering, and building software products.",
      "Primary contribution: structuring product work, mapping architecture, decomposing tasks, coordinating AI tools, reviewing integration points, and product-level validation.",
      "The portfolio is transparent that personal projects use substantial AI assistance; listed technologies describe project environments, not independent professional mastery of every tool."
    ].join("\n"),
    apeiron: [
      "APEIRON / AI WORKSPACE",
      "Purpose: a configurable AI workspace for connecting model providers and configuring personal agents.",
      "Current foundation: FastAPI, SQLAlchemy, Pydantic, HTTPX, HTML/CSS/Vanilla JavaScript, SQLite with PostgreSQL support.",
      "Implemented scope: provider registry and adapters, encrypted credential storage, agent configuration builder, and one-turn text generation.",
      "Important limits: not yet a complete workspace; the current agent run generates text and does not execute tools. A full sandbox and human-approval runtime are future work.",
      "Repository: https://github.com/shakha1210-pixel/AI-model"
    ].join("\n"),
    nexus: [
      "NEXUS / AI TERMINAL FOR OLLAMA",
      "Purpose: a desktop-oriented, local-first AI environment for model conversations and workspace tools.",
      "Current foundation: FastAPI, React 18, TypeScript, Vite, PyWebView, Ollama and OpenAI-compatible providers.",
      "Implemented scope: streaming chat, conversation history, Workspace Explorer, initial agent runtime with scoped permissions, and optional user-configured Kaggle integration.",
      "Important limits: not a full IDE; a complete editor, integrated terminal, language servers, debugger, mature Git UI, and full plugin SDK are not established features.",
      "Repository: https://github.com/shakha1210-pixel/Nexus-AI-Terminal-for-Ollama"
    ].join("\n"),
    logic: [
      "LOGIC-HUB / MODULAR JAVASCRIPT",
      "A modular JavaScript project organized around focused engines and a central core.",
      "Known modules: Achievement Engine, Challenge Engine, Event Engine, Logic-Hub Core, and Ranking Engine.",
      "Repository: https://github.com/shakha1210-pixel/Logic-Hub"
    ].join("\n"),
    technologies: [
      "TECHNOLOGY MAP",
      "APEIRON: Python, FastAPI, SQLAlchemy, Pydantic, HTTPX, SQLite/PostgreSQL, HTML, CSS, and Vanilla JavaScript.",
      "NEXUS: Python, FastAPI, React 18, TypeScript, Vite, PyWebView, Ollama, and OpenAI-compatible APIs.",
      "LOGIC-HUB: JavaScript with a modular engine/core structure.",
      "These are technologies used in the projects, not a claim of professional independent mastery in every tool."
    ].join("\n"),
    ai: [
      "AI-ASSISTED WORKFLOW",
      "Personal projects involve substantial AI assistance. AI tools help with implementation, review, and debugging.",
      "The portfolio owner's stated focus is product direction, architecture planning, task decomposition, coordination, integration review, and product-level validation.",
      "The interface's knowledge engine is local and rule-based. It is not connected to an external AI model."
    ].join("\n"),
    education: [
      "LEARNING BACKGROUND",
      "Rakhmonov IT School, Samarkand — Frontend Development, 2022.",
      "HTML and CSS certificates.",
      "District-level IT competition wins and regional-level participation."
    ].join("\n"),
    languages: "LANGUAGES: Uzbek — native. English — approximately B1, progressing toward B2.",
    collaboration: "COLLABORATION: Open to thoughtful early-stage products, practical AI workflows, and collaborative building. Email: shakha1210@gmail.com",
    approach: [
      "WORKING APPROACH",
      "1. Clarify the product goal and map architecture.",
      "2. Decompose complex work into ordered, verifiable tasks.",
      "3. Coordinate focused AI-assisted implementation and review.",
      "4. Inspect integration boundaries and validate real behavior.",
      "5. Document decisions, current status, and known limitations."
    ].join("\n")
  };

  const commandEngine = {
    mode: "local",
    async execute(rawCommand) {
      const query = normalize(rawCommand);
      if (!query) return { message: "Enter a question or command to get started." };

      if (/^(help|commands|what can you do)$/.test(query) || query.includes("show commands")) {
        return { message: helpText };
      }
      if (/^(clear|cls)$/.test(query)) return { message: "", clear: true };
      if (/^(status|system status|are you online)$/.test(query)) {
        return { message: "Interface operational. Knowledge mode: local and rule-based. External AI: not connected. Voice features: browser-dependent." };
      }

      if (/^(hello|hi|hey|jarvis|good morning|good evening)$/.test(query)) {
        return { message: "Hello. DQ interface is ready. Ask about the profile, projects, technology stacks, education, or collaboration." };
      }

      if (/\b(compare|difference|differentiate)\b/.test(query) && /\b(apeiron|nexus)\b/.test(query)) {
        return {
          message: [
            "APEIRON vs NEXUS",
            "APEIRON explores a configurable AI workspace, with a backend-led provider and agent-configuration foundation.",
            "NEXUS is a desktop-oriented, local-first AI terminal with React UI, streaming conversations, Workspace Explorer, and an initial agent runtime.",
            "They are separate projects today. A future unification is only an idea; they are not merged."
          ].join("\n"),
          destination: "#work"
        };
      }

      if (/\b(apeiron|ai workspace)\b/.test(query)) {
        return { message: knowledge.apeiron, destination: "#work" };
      }
      if (/\b(nexus|ollama terminal|ai terminal)\b/.test(query)) {
        return { message: knowledge.nexus, destination: "#work" };
      }
      if (/\b(logic hub|logic-hub|ranking engine|achievement engine|challenge engine)\b/.test(query)) {
        return { message: knowledge.logic, destination: "#work" };
      }
      if (/\b(technology|technologies|tech stack|stack|frameworks|programming languages)\b/.test(query)) {
        return { message: knowledge.technologies, destination: "#work" };
      }
      if (/\b(ai assistance|ai tools|artificial intelligence|use ai|ai workflow)\b/.test(query)) {
        return { message: knowledge.ai, destination: "#approach" };
      }
      if (/\b(education|school|study|studied|certificate|certification|competition|background)\b/.test(query)) {
        return { message: knowledge.education, destination: "#journey" };
      }
      if (/\b(language|languages|speak|english|uzbek)\b/.test(query)) {
        return { message: knowledge.languages, destination: "#about" };
      }
      if (/\b(email|contact|collaborat|hire|reach|work together)\b/.test(query)) {
        return { message: knowledge.collaboration, destination: "#contact" };
      }
      if (/\b(approach|workflow|how do you work|process|method)\b/.test(query)) {
        return { message: knowledge.approach, destination: "#approach" };
      }
      if (/\b(who are you|tell me about yourself|your role|what do you do|your focus|profile|about dilshodbek)\b/.test(query)) {
        return { message: knowledge.profile, destination: "#about" };
      }
      if (/\b(projects?|portfolio|repositories|github|what have you built|show me your work)\b/.test(query)) {
        return {
          message: "THREE PROJECTS / APEIRON — configurable AI workspace · NEXUS — local-first AI terminal · LOGIC-HUB — modular JavaScript engines. Ask for a project name to inspect its scope, stack, and current limitations.",
          destination: "#work"
        };
      }

      return {
        message: "I couldn't match that to the local knowledge base. Try asking about Apeiron, NEXUS, Logic-Hub, technology stacks, education, languages, or type help."
      };
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