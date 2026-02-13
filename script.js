document.addEventListener("DOMContentLoaded", () => {
    const header = document.querySelector(".site-header");
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const navLinks = document.querySelectorAll(".menu a");
    const menuLinks = document.querySelectorAll('.menu a[href^="#"]');
    const sectionNodes = document.querySelectorAll("main section[id]");
    const form = document.querySelector(".contact-form");
    const toggleLineButtons = document.querySelectorAll("[data-toggle-line]");

    const closeMenu = () => {
        if (!menu || !menuToggle) return;
        menu.classList.remove("open");
        menuToggle.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
    };

    if (menuToggle && menu) {
        menuToggle.addEventListener("click", () => {
            const isOpen = menu.classList.toggle("open");
            menuToggle.classList.toggle("open", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            document.body.style.overflow = isOpen ? "hidden" : "";
        });

        document.addEventListener("click", (event) => {
            if (!menu.classList.contains("open")) return;
            if (menu.contains(event.target) || menuToggle.contains(event.target)) return;
            closeMenu();
        });
    }

    const getHeaderOffset = () => {
        if (!header) return 0;
        return header.getBoundingClientRect().height + 12;
    };

    navLinks.forEach((link) => {
        link.addEventListener("click", () => closeMenu());
    });

    menuLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            if (!targetId || targetId === "#") return;
            const target = document.querySelector(targetId);
            if (!target) return;

            event.preventDefault();
            const targetY = target.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
            window.scrollTo({ top: targetY, behavior: "smooth" });
            closeMenu();
        });
    });

    const setActiveLink = () => {
        const currentPath = window.location.pathname.split("/").pop() || "index.html";
        navLinks.forEach((link) => {
            const href = link.getAttribute("href");
            if (!href || href.startsWith("#") || href.startsWith("http")) return;
            const linkPath = href.split("/").pop() || "index.html";
            link.classList.toggle("active", linkPath === currentPath);
        });

        if (!menuLinks.length || !sectionNodes.length) return;

        const offset = getHeaderOffset() + 24;
        let currentId = "#hero";

        sectionNodes.forEach((section) => {
            const top = section.offsetTop - offset;
            if (window.scrollY >= top) {
                currentId = `#${section.id}`;
            }
        });

        menuLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === currentId);
        });
    };

    setActiveLink();
    window.addEventListener("scroll", setActiveLink, { passive: true });
    window.addEventListener("resize", setActiveLink);

    const revealNodes = document.querySelectorAll("[data-reveal]");
    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.18, rootMargin: "0px 0px -10% 0px" }
        );

        revealNodes.forEach((node) => revealObserver.observe(node));
    } else {
        revealNodes.forEach((node) => node.classList.add("in-view"));
    }

    if (form) {
        form.addEventListener("submit", async (event) => {
            event.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            const statusEl = form.querySelector(".form-status");
            const endpoint = form.getAttribute("action");
            if (!submitButton || !statusEl || !endpoint) return;

            const originalLabel = submitButton.textContent;
            submitButton.textContent = "Sending...";
            submitButton.disabled = true;
            statusEl.textContent = "";

            try {
                const payload = new FormData(form);
                const response = await fetch(endpoint, {
                    method: "POST",
                    body: payload,
                    headers: { Accept: "application/json" }
                });

                if (response.ok) {
                    statusEl.textContent = "Thanks. We will send a scoped response shortly.";
                    submitButton.textContent = "Inquiry Sent";
                    form.reset();
                } else {
                    statusEl.textContent = "Submission failed. Please try again.";
                    submitButton.textContent = "Send Inquiry";
                }
            } catch (_error) {
                statusEl.textContent = "Network error. Please try again.";
                submitButton.textContent = "Send Inquiry";
            } finally {
                window.setTimeout(() => {
                    submitButton.textContent = originalLabel;
                    submitButton.disabled = false;
                }, 2500);
            }
        });
    }

    const hlsVideos = document.querySelectorAll("video[data-hls-src]");
    const hlsInstances = [];

    const renderVideoFallback = (video) => {
        const fallbackSrc = video.getAttribute("data-fallback-src");
        if (!fallbackSrc) return;

        const fallback = document.createElement("img");
        fallback.className = video.className.replace("cor-media-video", "").trim();
        fallback.src = fallbackSrc;
        fallback.alt = "COR dashboard preview";
        fallback.loading = "lazy";
        video.replaceWith(fallback);
    };

    const tryAutoPlay = (video) => {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
        }
    };

    hlsVideos.forEach((video) => {
        const source = video.getAttribute("data-hls-src");
        if (!source) return;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
            video.addEventListener("loadedmetadata", () => tryAutoPlay(video), { once: true });
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            const hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, () => tryAutoPlay(video));
            hls.on(window.Hls.Events.ERROR, (_event, data) => {
                if (!data.fatal) return;
                hls.destroy();
                renderVideoFallback(video);
            });
            hlsInstances.push(hls);
            return;
        }

        renderVideoFallback(video);
    });

    window.addEventListener("beforeunload", () => {
        hlsInstances.forEach((instance) => instance.destroy());
    });

    toggleLineButtons.forEach((button) => {
        const lineA = (button.getAttribute("data-line-a") || "").trim();
        const lineB = (button.getAttribute("data-line-b") || "").trim();
        if (!lineA || !lineB) return;

        const textNode = button.querySelector(".toggle-line-text");
        let showPrimary = true;

        if (textNode) {
            textNode.textContent = lineA;
        } else {
            button.textContent = lineA;
        }

        button.addEventListener("click", () => {
            showPrimary = !showPrimary;
            const nextLine = showPrimary ? lineA : lineB;

            if (textNode) {
                textNode.textContent = nextLine;
            } else {
                button.textContent = nextLine;
            }

            button.classList.toggle("is-alt", !showPrimary);
        });
    });
});
