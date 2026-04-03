const revealItems = document.querySelectorAll(".reveal");
const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
  const syncHeaderState = () => {
    siteHeader.classList.toggle("is-elevated", window.scrollY > 20);
  };

  syncHeaderState();
  window.addEventListener("scroll", syncHeaderState, { passive: true });
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08, rootMargin: "0px 0px -5% 0px" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const carousels = document.querySelectorAll(".auto-carousel");
carousels.forEach((carousel) => {
  const slides = Array.from(carousel.querySelectorAll("img"));
  if (slides.length === 0) {
    return;
  }
  let index = 0;
  slides[index].classList.add("active");

  setInterval(() => {
    slides[index].classList.remove("active");
    index = (index + 1) % slides.length;
    slides[index].classList.add("active");
  }, 3000);
});

const lightbox = document.getElementById("lightbox");
if (lightbox) {
  const lightboxImage = lightbox.querySelector("img");
  const prevButton = lightbox.querySelector(".prev");
  const nextButton = lightbox.querySelector(".next");
  const allPhotos = Array.from(document.querySelectorAll("img[data-lightbox]"));
  let currentIndex = -1;
  let currentGroup = "default";
  let activePhotos = [];

  const openLightbox = (index) => {
    if (index < 0 || index >= activePhotos.length) {
      return;
    }
    currentIndex = index;
    const photo = activePhotos[currentIndex];
    lightboxImage.src = photo.src;
    lightboxImage.alt = photo.alt || "Imagen ampliada";
    lightbox.classList.add("active");
  };

  const closeLightbox = () => {
    lightbox.classList.remove("active");
    lightboxImage.src = "";
    currentIndex = -1;
  };

  const showNext = () => {
    if (activePhotos.length === 0) {
      return;
    }
    const nextIndex = (currentIndex + 1) % activePhotos.length;
    openLightbox(nextIndex);
  };

  const showPrev = () => {
    if (activePhotos.length === 0) {
      return;
    }
    const prevIndex = (currentIndex - 1 + activePhotos.length) % activePhotos.length;
    openLightbox(prevIndex);
  };

  allPhotos.forEach((photo) => {
    photo.addEventListener("click", (event) => {
      event.preventDefault();
      currentGroup = photo.dataset.lightbox || "default";
      activePhotos = allPhotos.filter(
        (item) => (item.dataset.lightbox || "default") === currentGroup
      );
      const clickedIndex = activePhotos.indexOf(photo);
      openLightbox(clickedIndex);
    });
  });

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  if (prevButton) {
    prevButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showPrev();
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", (event) => {
      event.stopPropagation();
      showNext();
    });
  }

  document.addEventListener("keydown", (event) => {
    if (!lightbox.classList.contains("active")) {
      return;
    }
    if (event.key === "Escape") {
      closeLightbox();
    }
    if (event.key === "ArrowRight") {
      showNext();
    }
    if (event.key === "ArrowLeft") {
      showPrev();
    }
  });

  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].screenX;
  });

  lightbox.addEventListener("touchend", (event) => {
    touchEndX = event.changedTouches[0].screenX;
    if (touchEndX - touchStartX > 50) {
      showPrev();
    }
    if (touchStartX - touchEndX > 50) {
      showNext();
    }
  });
}

const whatsappForm = document.getElementById("whatsapp-form");
if (whatsappForm) {
  const statusNode = whatsappForm.querySelector(".form-status");
  const setStatus = (text, isError = false) => {
    if (!statusNode) {
      return;
    }
    statusNode.textContent = text;
    statusNode.classList.toggle("is-visible", Boolean(text));
    statusNode.classList.toggle("is-error", isError);
  };

  whatsappForm.addEventListener("submit", (event) => {
    setStatus("");
    const formData = new FormData(whatsappForm);

    const nombre = (formData.get("nombre") || "").toString().trim();
    const telefono = (formData.get("telefono") || "").toString().trim();
    const email = (formData.get("email") || "").toString().trim();
    const fecha = (formData.get("fecha") || "").toString().trim();
    const adultos = (formData.get("adultos") || "").toString().trim();
    const ninos = (formData.get("ninos") || "").toString().trim();
    const descripcion = (formData.get("descripcion_evento") || "").toString().trim();

    const formato = formData.getAll("formato[]");
    const infraestructura = formData.getAll("infraestructura[]");
    const preferencias = formData.getAll("preferencias[]");
    const estilo = formData.getAll("estilo[]");

    const selectedOrFallback = (items) =>
      items.length > 0 ? items.join(", ") : "No especificado";

    const lines = [
      "1- Datos de contacto",
      `Nombre y apellido: ${nombre}`,
      `Telefono: ${telefono}`,
      `Email: ${email}`,
      "",
      "2- Informacion basica del evento",
      `Fecha del evento: ${fecha}`,
      `Cantidad de adultos: ${adultos}`,
      `Cantidad de ninos: ${ninos || "No especificado"}`,
      "",
      "3- Formato de experiencia buscada",
      selectedOrFallback(formato),
      "",
      "4- Infraestructura disponible",
      selectedOrFallback(infraestructura),
      "",
      "5- Preferencias alimentarias",
      selectedOrFallback(preferencias),
      "",
      "6- Estilo de evento",
      selectedOrFallback(estilo),
      "",
      "7- Descripcion del evento",
      descripcion || "No especificado",
    ];

    const resumen = lines.join("\n");

    const ensureHidden = (name, value) => {
      let field = whatsappForm.querySelector(`input[name="${name}"]`);
      if (!field) {
        field = document.createElement("input");
        field.type = "hidden";
        field.name = name;
        whatsappForm.appendChild(field);
      }
      field.value = value;
    };

    const descripcionField = whatsappForm.querySelector('textarea[name="descripcion_evento"]');

    const adultosInt = Number.parseInt(adultos, 10) || 0;
    const ninosInt = Number.parseInt(ninos, 10) || 0;
    ensureHidden("mensaje", resumen);
    ensureHidden("personas", String(adultosInt + ninosInt));
    ensureHidden("formato_texto", selectedOrFallback(formato));
    ensureHidden("infraestructura_texto", selectedOrFallback(infraestructura));
    ensureHidden("preferencias_texto", selectedOrFallback(preferencias));
    ensureHidden("estilo_texto", selectedOrFallback(estilo));

    const action = (whatsappForm.getAttribute("action") || "").toLowerCase();
    const submitsToWp = action.length > 0 || action.includes("wp") || action.includes("wordpress");

    if (submitsToWp) {
      if (descripcionField) {
        descripcionField.value = "";
      }
      setStatus("Enviado. Redirigiendo...", false);
      event.preventDefault();
      window.setTimeout(() => {
        whatsappForm.submit();
      }, 700);
      return;
    }

    event.preventDefault();
    const text = encodeURIComponent(
      ["Hola! Quiero solicitar una propuesta personalizada para un evento.", "", resumen].join("\n")
    );
    const whatsappNumber = "5491131394065";
    const url = `https://wa.me/${whatsappNumber}?text=${text}`;

    try {
      window.open(url, "_blank", "noopener,noreferrer");
      setStatus("Enviado. Se abrio WhatsApp.", false);
      whatsappForm.reset();
    } catch (error) {
      setStatus("No se pudo abrir WhatsApp. Intentalo nuevamente.", true);
    }
  });
}
