const canvas = document.querySelector('#game-canvas');
const ctx = canvas.getContext('2d');

const keys = new Set();
const player = { x: 80, y: 80, size: 28, speed: 4 };
const orb = { x: 520, y: 260, radius: 14 };
let score = 0;

function placeOrb() {
  orb.x = 40 + Math.random() * (canvas.width - 80);
  orb.y = 40 + Math.random() * (canvas.height - 80);
}

function update() {
  if (keys.has('ArrowLeft') || keys.has('a')) player.x -= player.speed;
  if (keys.has('ArrowRight') || keys.has('d')) player.x += player.speed;
  if (keys.has('ArrowUp') || keys.has('w')) player.y -= player.speed;
  if (keys.has('ArrowDown') || keys.has('s')) player.y += player.speed;

  player.x = Math.max(0, Math.min(canvas.width - player.size, player.x));
  player.y = Math.max(0, Math.min(canvas.height - player.size, player.y));

  const dx = player.x + player.size / 2 - orb.x;
  const dy = player.y + player.size / 2 - orb.y;
  if (Math.hypot(dx, dy) < player.size / 2 + orb.radius) {
    score += 1;
    placeOrb();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#111827');
  gradient.addColorStop(1, '#312e81');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
  for (let x = 0; x < canvas.width; x += 48) ctx.fillRect(x, 0, 1, canvas.height);
  for (let y = 0; y < canvas.height; y += 48) ctx.fillRect(0, y, canvas.width, 1);

  ctx.shadowColor = '#22d3ee';
  ctx.shadowBlur = 22;
  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = '#8b5cf6';
  ctx.shadowBlur = 24;
  ctx.fillStyle = '#a78bfa';
  ctx.fillRect(player.x, player.y, player.size, player.size);
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#f8fafc';
  ctx.font = '700 28px system-ui, sans-serif';
  ctx.fillText(`Score: ${score}`, 24, 42);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

window.addEventListener('keydown', (event) => keys.add(event.key));
window.addEventListener('keyup', (event) => keys.delete(event.key));
loop();
