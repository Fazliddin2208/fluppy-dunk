import { useEffect, useRef, useState } from 'react';
import Matter, { Engine, Runner, World, Bodies, Body, Events } from 'matter-js';

const Game = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const ballRef = useRef<Matter.Body | null>(null);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const runGame = () => {
      const width = 400;
      const height = 600;

      // Matter.js engine va world yaratish
      const engine = Engine.create();
      const world = engine.world;

      // Canvas setup
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = width;
      canvas.height = height;

      // Ball fizikasi
      const ballRadius = 15;
      const ballBody = Bodies.circle(200, 300, ballRadius, { restitution: 0.6 });
      ballRef.current = ballBody;
      World.add(world, ballBody);

      // Ground (yer) yaratish
      const ground = Bodies.rectangle(200, height + 20, width, 40, { isStatic: true });
      World.add(world, ground);

      // Hoop (halqa) yaratish
      const hoops: {
        left: Matter.Body;
        right: Matter.Body;
        y: number;
      }[] = [];

      const createHoop = (y: number) => {
        const gap = 80;
        const postHeight = 40;
        const postThickness = 10;
        const left = Bodies.rectangle(200 - gap / 2 - postThickness / 2, y, postThickness, postHeight, { isStatic: true });
        const right = Bodies.rectangle(200 + gap / 2 + postThickness / 2, y, postThickness, postHeight, { isStatic: true });
        World.add(world, [left, right]);
        hoops.push({ left, right, y });
      };

      createHoop(200);

      // Jumping mekanizmi
      const jump = () => {
        if (ballRef.current) {
          Body.setVelocity(ballRef.current, { x: 0, y: -10 });
        }
      };

      window.addEventListener('click', jump);
      window.addEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });

      // Matter.js run
      const runner = Runner.create();
      Runner.run(runner, engine);

      // Collision detection
      Events.on(engine, 'collisionStart', (event) => {
        event.pairs.forEach((pair) => {
          hoops.forEach(({ left, right }) => {
            if (pair.bodyA === left || pair.bodyA === right || pair.bodyB === left || pair.bodyB === right) {
              const ballX = ballBody.position.x;
              const edgeX = pair.bodyA === left || pair.bodyB === left
                ? left.position.x + 5
                : right.position.x - 5;
              if (Math.abs(ballX - edgeX) <= 20) {
                Body.setVelocity(ballBody, { x: 0, y: -8 });
              }
            }
          });
        });
      });

      // Animation loop
      const updateGame = () => {
        if (gameOver) return;

        // Ballni canvasga chizish
        ctx.clearRect(0, 0, width, height);
        ctx.beginPath();
        ctx.arc(ballBody.position.x, ballBody.position.y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#ffcc00';
        ctx.fill();
        ctx.closePath();

        // Hooplarni chizish
        hoops.forEach(({ left, right, y }) => {
          ctx.beginPath();
          ctx.rect(left.position.x - 5, y - 20, 10, 40);
          ctx.rect(right.position.x - 5, y - 20, 10, 40);
          ctx.fillStyle = 'red';
          ctx.fill();
          ctx.closePath();
        });

        // Ball o'yinni tugatganini tekshirish
        if (ballBody.position.y > height + 30) {
          setGameOver(true);
          alert('Game Over! Your Score: ' + score);
        }

        // Ball va hoopni tekshirish va ochko qo‘shish
        hoops.forEach((hoop) => {
          if (!hoop.y) {
            hoop.y = 0;
          }

          if (ballBody.position.y < hoop.y) {
            setScore((prev) => prev + 1);
          }

          hoop.y += 2;
        });

        // Yangi hoop yaratish
        if (Math.random() < 0.02) createHoop(-50);

        // `requestAnimationFrame` orqali yangilash
        requestAnimationFrame(updateGame);
      };

      updateGame();

      return () => {
        window.removeEventListener('click', jump);
        window.removeEventListener('keydown', (e) => { if (e.code === 'Space') jump(); });
      };
    };

    runGame();
  }, [score, gameOver]);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      <div style={{
        color: 'white',
        position: 'absolute',
        top: 10,
        left: 10,
        fontSize: 20
      }}>
        Score: {score}
      </div>
    </div>
  );
};

export default Game;
