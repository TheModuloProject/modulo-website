(() => {
  const canvas = document.getElementById("modulo-orbit");

  if (!canvas) {
    return;
  }

  const ctx = canvas.getContext("2d", {
    alpha: true
  });

  const multiplierText = document.getElementById("modulo-multiplier");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const POINT_COUNT = 97;
  const STAR_COUNT = 120;
  const MAX_DPR = 2;

  let width = 0;
  let height = 0;
  let dpr = 1;

  let centerX = 0;
  let centerY = 0;
  let radius = 0;

  let time = 0;

  let pointerTarget = 0;
  let pointerInfluence = 0;

  let animationVisible = true;

  const circlePoints = [];
  const stars = [];

  function seededRandom(seed) {
    const value = Math.sin(seed * 9283.117) * 43758.5453;

    return value - Math.floor(value);
  }

  function createStars() {
    stars.length = 0;

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: seededRandom(i + 1),
        y: seededRandom(i + 301),
        radius: 0.25 + seededRandom(i + 701) * 1.15,
        alpha: 0.08 + seededRandom(i + 1101) * 0.42,
        speed: 0.18 + seededRandom(i + 1501) * 0.65,
        phase: seededRandom(i + 1901) * Math.PI * 2
      });
    }
  }

  function resizeCanvas() {
    const bounds = canvas.getBoundingClientRect();

    width = Math.max(bounds.width, 1);
    height = Math.max(bounds.height, 1);

    dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);

    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    centerX = width * 0.5;
    centerY = height * 0.52;

    radius = Math.min(width, height) * 0.29;

    circlePoints.length = 0;

    for (let i = 0; i < POINT_COUNT; i++) {
      const angle =
        -Math.PI / 2 +
        (i / POINT_COUNT) * Math.PI * 2;

      circlePoints.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      });
    }
  }

  function drawStars() {
    ctx.save();

    for (const star of stars) {
      const twinkle =
        0.55 +
        Math.sin(time * star.speed + star.phase) * 0.45;

      const x = star.x * width;
      const y = star.y * height;

      ctx.fillStyle =
        `rgba(244, 241, 234, ${star.alpha * twinkle})`;

      ctx.beginPath();
      ctx.arc(
        x,
        y,
        star.radius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      if (star.radius > 1.05 && twinkle > 0.78) {
        ctx.strokeStyle =
          `rgba(244, 241, 234, ${star.alpha * 0.35})`;

        ctx.lineWidth = 0.45;

        ctx.beginPath();

        ctx.moveTo(x - 3.5, y);
        ctx.lineTo(x + 3.5, y);

        ctx.moveTo(x, y - 3.5);
        ctx.lineTo(x, y + 3.5);

        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawAmbientGlow() {
    ctx.save();

    ctx.globalCompositeOperation = "screen";

    const outerGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      radius * 0.18,

      centerX,
      centerY,
      radius * 1.85
    );

    outerGlow.addColorStop(
      0,
      "rgba(255,255,255,0.045)"
    );

    outerGlow.addColorStop(
      0.35,
      "rgba(255,255,255,0.025)"
    );

    outerGlow.addColorStop(
      0.66,
      "rgba(255,255,255,0.012)"
    );

    outerGlow.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.fillStyle = outerGlow;

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius * 1.85,
      0,
      Math.PI * 2
    );
    ctx.fill();

    const haloGlow = ctx.createRadialGradient(
      centerX - radius * 0.15,
      centerY - radius * 0.12,
      radius * 0.5,

      centerX,
      centerY,
      radius * 1.18
    );

    haloGlow.addColorStop(
      0,
      "rgba(255,255,255,0)"
    );

    haloGlow.addColorStop(
      0.72,
      "rgba(255,255,255,0.01)"
    );

    haloGlow.addColorStop(
      0.9,
      "rgba(255,255,255,0.16)"
    );

    haloGlow.addColorStop(
      0.97,
      "rgba(255,255,255,0.035)"
    );

    haloGlow.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.fillStyle = haloGlow;

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius * 1.18,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.restore();
  }

  function drawOrb() {
    ctx.save();

    const orbGradient = ctx.createRadialGradient(
      centerX - radius * 0.27,
      centerY - radius * 0.22,
      radius * 0.08,

      centerX,
      centerY,
      radius
    );

    orbGradient.addColorStop(
      0,
      "rgba(255,255,255,0.025)"
    );

    orbGradient.addColorStop(
      0.58,
      "rgba(0,0,0,0)"
    );

    orbGradient.addColorStop(
      0.83,
      "rgba(255,255,255,0.025)"
    );

    orbGradient.addColorStop(
      0.94,
      "rgba(255,255,255,0.20)"
    );

    orbGradient.addColorStop(
      0.985,
      "rgba(255,255,255,0.78)"
    );

    orbGradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.fillStyle = orbGradient;

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius * 0.96,
      0,
      Math.PI * 2
    );
    ctx.fill();

    ctx.globalCompositeOperation = "screen";

    ctx.shadowBlur = 34;
    ctx.shadowColor = "rgba(255,255,255,0.72)";

    ctx.strokeStyle = "rgba(244,241,234,0.70)";
    ctx.lineWidth = 1.25;

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius * 0.96,
      0,
      Math.PI * 2
    );
    ctx.stroke();

    ctx.shadowBlur = 72;

    ctx.strokeStyle = "rgba(244,241,234,0.17)";
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.arc(
      centerX,
      centerY,
      radius * 0.97,
      0.08,
      Math.PI * 1.2
    );
    ctx.stroke();

    ctx.restore();
  }

  function drawGuideOrbits() {
    const orbits = [
      [1.48, 0.57, -0.2, 0.16],
      [1.28, 0.79, 0.18, 0.12],
      [1.02, 1.17, -0.1, 0.10]
    ];

    ctx.save();

    ctx.translate(
      centerX,
      centerY
    );

    orbits.forEach(
      ([radiusX, radiusY, rotation, alpha], index) => {
        ctx.save();

        ctx.rotate(rotation);

        ctx.strokeStyle =
          `rgba(244,241,234,${alpha})`;

        ctx.lineWidth =
          index === 0 ? 0.9 : 0.7;

        if (index === 1) {
          ctx.setLineDash([2, 7]);
        }

        ctx.beginPath();

        ctx.ellipse(
          0,
          0,
          radius * radiusX,
          radius * radiusY,
          0,
          0,
          Math.PI * 2
        );

        ctx.stroke();

        ctx.restore();
      }
    );

    ctx.restore();

    ctx.setLineDash([]);
  }

  function drawModularPattern(multiplier) {
    ctx.save();

    ctx.globalCompositeOperation = "screen";

    ctx.shadowBlur = 3;
    ctx.shadowColor = "rgba(255,255,255,0.22)";

    for (let i = 0; i < POINT_COUNT; i++) {
      const startPoint = circlePoints[i];

      const mappedIndex =
        (i * multiplier) % POINT_COUNT;

      const mappedLow =
        Math.floor(mappedIndex);

      const mappedHigh =
        (mappedLow + 1) % POINT_COUNT;

      const interpolation =
        mappedIndex - mappedLow;

      const mappedPointA =
        circlePoints[mappedLow];

      const mappedPointB =
        circlePoints[mappedHigh];

      const endX =
        mappedPointA.x +
        (
          mappedPointB.x -
          mappedPointA.x
        ) * interpolation;

      const endY =
        mappedPointA.y +
        (
          mappedPointB.y -
          mappedPointA.y
        ) * interpolation;

      const pulse =
        0.5 +
        Math.sin(
          i * 0.19 +
          time * 0.7
        ) * 0.5;

      const alpha =
        0.045 +
        pulse * 0.065;

      ctx.strokeStyle =
        `rgba(244,241,234,${alpha})`;

      ctx.lineWidth = 0.6;

      ctx.beginPath();

      ctx.moveTo(
        startPoint.x,
        startPoint.y
      );

      const centerPull = 0.1;

      ctx.bezierCurveTo(
        startPoint.x +
          (centerX - startPoint.x) *
          centerPull,

        startPoint.y +
          (centerY - startPoint.y) *
          centerPull,

        endX +
          (centerX - endX) *
          centerPull,

        endY +
          (centerY - endY) *
          centerPull,

        endX,
        endY
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  function drawMovingPoint(multiplier) {
    const orbitProgress =
      (time * 0.052) % 1;

    const pointIndex =
      orbitProgress * POINT_COUNT;

    const pointLow =
      Math.floor(pointIndex);

    const pointHigh =
      (pointLow + 1) % POINT_COUNT;

    const pointInterpolation =
      pointIndex - pointLow;

    const pointA =
      circlePoints[pointLow];

    const pointB =
      circlePoints[pointHigh];

    const pointX =
      pointA.x +
      (
        pointB.x -
        pointA.x
      ) * pointInterpolation;

    const pointY =
      pointA.y +
      (
        pointB.y -
        pointA.y
      ) * pointInterpolation;

    const mappedIndex =
      (pointIndex * multiplier) % POINT_COUNT;

    const mappedLow =
      Math.floor(mappedIndex);

    const mappedHigh =
      (mappedLow + 1) % POINT_COUNT;

    const mappedInterpolation =
      mappedIndex - mappedLow;

    const mappedPointA =
      circlePoints[mappedLow];

    const mappedPointB =
      circlePoints[mappedHigh];

    const mappedX =
      mappedPointA.x +
      (
        mappedPointB.x -
        mappedPointA.x
      ) * mappedInterpolation;

    const mappedY =
      mappedPointA.y +
      (
        mappedPointB.y -
        mappedPointA.y
      ) * mappedInterpolation;

    ctx.save();

    ctx.globalCompositeOperation = "screen";

    ctx.shadowBlur = 9;
    ctx.shadowColor = "rgba(255,255,255,0.38)";

    ctx.strokeStyle = "rgba(244,241,234,0.48)";
    ctx.lineWidth = 0.9;

    ctx.beginPath();

    ctx.moveTo(
      pointX,
      pointY
    );

    ctx.lineTo(
      mappedX,
      mappedY
    );

    ctx.stroke();

    const glowingPoints = [
      [pointX, pointY, 3],
      [mappedX, mappedY, 4]
    ];

    for (const [x, y, pointRadius] of glowingPoints) {
      ctx.shadowBlur = 24;
      ctx.shadowColor = "rgba(255,255,255,1)";

      ctx.fillStyle = "rgba(255,255,255,1)";

      ctx.beginPath();

      ctx.arc(
        x,
        y,
        pointRadius,
        0,
        Math.PI * 2
      );

      ctx.fill();
    }

    ctx.restore();
  }

  function drawTicks() {
    ctx.save();

    for (
      let i = 0;
      i < POINT_COUNT;
      i += 3
    ) {
      const point =
        circlePoints[i];

      const normalX =
        (point.x - centerX) / radius;

      const normalY =
        (point.y - centerY) / radius;

      const tickLength =
        i % 12 === 0 ? 5 : 2.5;

      ctx.strokeStyle =
        i % 12 === 0
          ? "rgba(244,241,234,0.30)"
          : "rgba(244,241,234,0.12)";

      ctx.lineWidth = 0.7;

      ctx.beginPath();

      ctx.moveTo(
        point.x + normalX * 5,
        point.y + normalY * 5
      );

      ctx.lineTo(
        point.x +
          normalX *
          (5 + tickLength),

        point.y +
          normalY *
          (5 + tickLength)
      );

      ctx.stroke();
    }

    ctx.restore();
  }

  function render() {
    if (!animationVisible) {
      requestAnimationFrame(render);
      return;
    }

    if (!prefersReducedMotion) {
      time += 0.016;
    }

    pointerInfluence +=
      (
        pointerTarget -
        pointerInfluence
      ) * 0.035;

    const baseMultiplier =
      2 +
      (
        Math.sin(time * 0.18) +
        1
      ) * 8.5;

    const multiplier =
      baseMultiplier +
      pointerInfluence * 13;

    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    drawStars();
    drawAmbientGlow();
    drawGuideOrbits();
    drawOrb();
    drawModularPattern(multiplier);
    drawTicks();
    drawMovingPoint(multiplier);

    if (multiplierText) {
      multiplierText.textContent =
        `× ${multiplier.toFixed(2)}`;
    }

    requestAnimationFrame(render);
  }

  canvas.addEventListener(
    "pointermove",
    event => {
      const bounds =
        canvas.getBoundingClientRect();

      pointerTarget =
        (
          event.clientX -
          bounds.left
        ) /
        bounds.width -
        0.5;
    }
  );

  canvas.addEventListener(
    "pointerleave",
    () => {
      pointerTarget = 0;
    }
  );

  const resizeObserver =
    new ResizeObserver(() => {
      resizeCanvas();
    });

  resizeObserver.observe(canvas);

  const visibilityObserver =
    new IntersectionObserver(
      entries => {
        const entry =
          entries[0];

        animationVisible =
          entry.isIntersecting;
      },
      {
        threshold: 0.05
      }
    );

  visibilityObserver.observe(canvas);

  createStars();
  resizeCanvas();
  render();
})();