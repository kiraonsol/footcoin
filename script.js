const particlesConfig = {
  particles: {
    number: { value: 100 },
    color: { value: "#ffffff" }, // White sparkles
    opacity: { value: 0.3, random: true }, // Subtle visibility
    size: { value: 3, random: true },
    move: { enable: true, speed: 0.5, direction: "bottom" }
  },
  interactivity: { events: { onhover: { enable: false }, onclick: { enable: false } } },
  retina_detect: true
};
tsParticles.load("tsparticles", particlesConfig);
