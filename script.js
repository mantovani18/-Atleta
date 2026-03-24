// =========================
// Configurações globais
// =========================
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// =========================
// Navegação e estado da navbar
// =========================
const header = document.querySelector(".header");
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

const updateHeaderOnScroll = () => {
  if (!header) return;
  header.classList.toggle("scrolled", window.scrollY > 10);
};

updateHeaderOnScroll();
window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });

if (menuToggle && navLinks) {
  const closeMenu = () => {
    navLinks.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  };

  menuToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    menuToggle.classList.toggle("active", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
}

// =========================
// Reveal on scroll (Intersection Observer)
// =========================
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && revealElements.length > 0) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// =========================
// Parallax leve com requestAnimationFrame
// =========================
const parallaxHero = document.querySelector(".parallax");
let parallaxTicking = false;

const updateParallax = () => {
  if (!parallaxHero || prefersReducedMotion || window.innerWidth <= 768) return;
  const offset = window.pageYOffset;
  parallaxHero.style.backgroundPositionY = `${offset * 0.28}px`;
};

window.addEventListener(
  "scroll",
  () => {
    if (parallaxTicking) return;
    parallaxTicking = true;

    window.requestAnimationFrame(() => {
      updateParallax();
      parallaxTicking = false;
    });
  },
  { passive: true }
);

// =========================
// Contadores animados
// =========================
const counters = document.querySelectorAll(".counter");

if (counters.length > 0) {
  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || 0);
    const duration = 1300;
    const startTime = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const current = Math.floor(progress * target);
      counter.textContent = `+${current}`;

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        counter.textContent = `+${target}`;
      }
    };

    requestAnimationFrame(frame);
  };

  const counterObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => counterObserver.observe(counter));
}

// =========================
// Ripple em botões
// =========================
document.querySelectorAll(".ripple").forEach((button) => {
  button.addEventListener("click", (event) => {
    const circle = document.createElement("span");
    circle.classList.add("ripple-effect");

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    circle.style.width = `${size}px`;
    circle.style.height = `${size}px`;
    circle.style.left = `${event.clientX - rect.left}px`;
    circle.style.top = `${event.clientY - rect.top}px`;

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  });
});

// =========================
// Formulário + WhatsApp
// =========================
const scheduleForm = document.getElementById("scheduleForm");
const timeAnteriorGroup = document.getElementById("timeAnteriorGroup");
const loaderOverlay = document.getElementById("loaderOverlay");
const submitBtn = document.getElementById("submitBtn");

if (scheduleForm) {
  const nomeInput = document.getElementById("nome");
  const idadeInput = document.getElementById("idade");
  const telefoneInput = document.getElementById("telefone");
  const timeAnteriorInput = document.getElementById("timeAnterior");
  const radiosJogou = scheduleForm.querySelectorAll('input[name="jogou"]');

  const setError = (inputOrGroup, message) => {
    const group = inputOrGroup.closest(".form-group") || inputOrGroup;
    const errorText = group.querySelector(".error-text");
    group.classList.add("has-error");
    if (errorText) errorText.textContent = message;
  };

  const clearError = (inputOrGroup) => {
    const group = inputOrGroup.closest(".form-group") || inputOrGroup;
    const errorText = group.querySelector(".error-text");
    group.classList.remove("has-error");
    if (errorText) errorText.textContent = "";
  };

  const toggleTimeAnterior = () => {
    const selected = scheduleForm.querySelector('input[name="jogou"]:checked')?.value;
    const shouldShow = selected === "Sim";

    timeAnteriorGroup.classList.toggle("hidden", !shouldShow);
    timeAnteriorInput.toggleAttribute("required", shouldShow);

    if (!shouldShow) {
      timeAnteriorInput.value = "";
      clearError(timeAnteriorInput);
    }
  };

  const maskPhone = (value) => {
    const numbers = value.replace(/\D/g, "").slice(0, 11);
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }

    return numbers
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  const validateForm = () => {
    let isValid = true;

    scheduleForm.querySelectorAll(".form-group").forEach((group) => clearError(group));

    if (!nomeInput.value.trim()) {
      setError(nomeInput, "Informe o nome completo.");
      isValid = false;
    }

    if (!idadeInput.value || Number(idadeInput.value) < 4) {
      setError(idadeInput, "Informe uma idade válida.");
      isValid = false;
    }

    const jogouSelecionado = scheduleForm.querySelector('input[name="jogou"]:checked');
    if (!jogouSelecionado) {
      const radioGroup = scheduleForm.querySelector('input[name="jogou"]').closest(".form-group");
      setError(radioGroup, "Selecione uma opção.");
      isValid = false;
    }

    if (jogouSelecionado?.value === "Sim" && !timeAnteriorInput.value.trim()) {
      setError(timeAnteriorInput, "Informe o time anterior.");
      isValid = false;
    }

    if (!telefoneInput.value.trim()) {
      setError(telefoneInput, "Informe o telefone.");
      isValid = false;
    }

    return isValid;
  };

  radiosJogou.forEach((radio) => radio.addEventListener("change", toggleTimeAnterior));
  toggleTimeAnterior();

  [nomeInput, idadeInput, telefoneInput, timeAnteriorInput].forEach((input) => {
    input?.addEventListener("input", () => clearError(input));
  });

  telefoneInput?.addEventListener("input", () => {
    telefoneInput.value = maskPhone(telefoneInput.value);
  });

  scheduleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const nome = nomeInput.value.trim();
    const idade = idadeInput.value.trim();
    const jogou = scheduleForm.querySelector('input[name="jogou"]:checked').value;
    const timeAnterior = timeAnteriorInput.value.trim() || "Não informado";
    const telefone = telefoneInput.value.trim();

    const mensagem = `Olá, gostaria de agendar uma aula no +Atleta.\n\nNome: ${nome}\nIdade: ${idade}\nJá jogou em outro time: ${jogou}\nQual time: ${jogou === "Sim" ? timeAnterior : "Não se aplica"}\nTelefone: ${telefone}`;
    const link = `https://wa.me/5543996212570?text=${encodeURIComponent(mensagem)}`;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.8";
    }

    if (loaderOverlay) loaderOverlay.classList.add("active");

    setTimeout(() => {
      window.location.href = link;
    }, 850);
  });
}

// =========================
// Eventos + inscrição no Google Sheets
// =========================
const GOOGLE_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwZ6yvGEt_UGZfAUL8MLfa5PJUMCFpefmGGVSOVf38hVAOV_muCu6MhzEnj3nit8SY1/exec";
const eventCards = document.querySelectorAll(".event-card");
const eventSignupWrap = document.getElementById("eventSignupWrap");
const eventSignupForm = document.getElementById("eventSignupForm");
const selectedEventText = document.getElementById("selectedEventText");
const eventSubmitBtn = document.getElementById("eventSubmitBtn");

const eventoNomeInput = document.getElementById("eventoNome");
const eventoDataInput = document.getElementById("eventoData");
const eventoHorarioInput = document.getElementById("eventoHorario");

const inscricaoNomeInput = document.getElementById("inscricaoNome");
const inscricaoIdadeInput = document.getElementById("inscricaoIdade");
const inscricaoNumeroInput = document.getElementById("inscricaoNumero");
const inscricaoPosicaoInput = document.getElementById("inscricaoPosicao");

const sendEventRegistration = async (payload) => {
  if (!GOOGLE_SHEETS_WEBAPP_URL || GOOGLE_SHEETS_WEBAPP_URL.includes("COLE_AQUI")) {
    alert("Configure a URL do Google Apps Script em script.js para salvar inscrições no Sheets.");
    return false;
  }

  try {
    await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      mode: "no-cors",
    });

    return true;
  } catch (error) {
    console.error("Erro ao enviar inscrição:", error);
    return false;
  }
};

if (eventCards.length > 0 && eventSignupForm) {
  const setEventError = (inputOrGroup, message) => {
    const group = inputOrGroup.closest(".form-group") || inputOrGroup;
    const errorText = group.querySelector(".error-text");
    group.classList.add("has-error");
    if (errorText) errorText.textContent = message;
  };

  const clearEventError = (inputOrGroup) => {
    const group = inputOrGroup.closest(".form-group") || inputOrGroup;
    const errorText = group.querySelector(".error-text");
    group.classList.remove("has-error");
    if (errorText) errorText.textContent = "";
  };

  const validateEventForm = () => {
    let isValid = true;

    eventSignupForm.querySelectorAll(".form-group").forEach((group) => clearEventError(group));

    if (!eventoNomeInput?.value) {
      alert("Selecione um evento antes de enviar a inscrição.");
      isValid = false;
    }

    if (!inscricaoNomeInput.value.trim()) {
      setEventError(inscricaoNomeInput, "Informe o nome completo.");
      isValid = false;
    }

    if (!inscricaoIdadeInput.value || Number(inscricaoIdadeInput.value) < 4) {
      setEventError(inscricaoIdadeInput, "Informe uma idade válida.");
      isValid = false;
    }

    if (!inscricaoNumeroInput.value.trim()) {
      setEventError(inscricaoNumeroInput, "Informe o número.");
      isValid = false;
    }

    if (!inscricaoPosicaoInput.value.trim()) {
      setEventError(inscricaoPosicaoInput, "Informe a posição que joga.");
      isValid = false;
    }

    return isValid;
  };

  [inscricaoNomeInput, inscricaoIdadeInput, inscricaoNumeroInput].forEach((input) => {
    input?.addEventListener("input", () => clearEventError(input));
  });

  inscricaoPosicaoInput?.addEventListener("change", () => clearEventError(inscricaoPosicaoInput));

  eventCards.forEach((card) => {
    card.addEventListener("click", () => {
      eventCards.forEach((eventCard) => eventCard.classList.remove("selected"));
      card.classList.add("selected");

      const evento = card.dataset.evento || "Evento +Atleta";
      const data = card.dataset.data || "";
      const horario = card.dataset.horario || "";

      eventoNomeInput.value = evento;
      eventoDataInput.value = data;
      eventoHorarioInput.value = horario;

      if (eventSignupWrap) {
        eventSignupWrap.classList.remove("hidden");
      }

      if (selectedEventText) {
        selectedEventText.textContent = `Evento selecionado: ${evento} • ${data} às ${horario}`;
      }

      if (eventSubmitBtn) {
        eventSubmitBtn.disabled = false;
      }
    });
  });

  eventSignupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!validateEventForm()) return;

    const payload = {
      nomeCompleto: inscricaoNomeInput.value.trim(),
      idade: inscricaoIdadeInput.value.trim(),
      numero: inscricaoNumeroInput.value.trim(),
      posicao: inscricaoPosicaoInput.value.trim(),
      evento: eventoNomeInput.value,
      data: eventoDataInput.value,
      horario: eventoHorarioInput.value,
      origem: "site",
      criadoEm: new Date().toISOString(),
    };

    if (eventSubmitBtn) {
      eventSubmitBtn.disabled = true;
      eventSubmitBtn.style.opacity = "0.8";
    }

    const sent = await sendEventRegistration(payload);

    if (sent) {
      alert("Inscrição realizada com sucesso! Seus dados foram enviados.");
      eventSignupForm.reset();

      eventoNomeInput.value = "";
      eventoDataInput.value = "";
      eventoHorarioInput.value = "";

      eventCards.forEach((eventCard) => eventCard.classList.remove("selected"));

      if (selectedEventText) {
        selectedEventText.textContent = "Selecione um evento para iniciar sua inscrição.";
      }
    } else {
      alert("Não foi possível enviar sua inscrição agora. Tente novamente em instantes.");
    }

    if (eventSubmitBtn) {
      eventSubmitBtn.disabled = false;
      eventSubmitBtn.style.opacity = "1";
    }
  });
}
