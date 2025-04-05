import React, {useEffect, useRef, useState} from "react";
import Matter, {Engine, Render, World, Bodies, Body, Events} from "matter-js";
import BallImg from "./flball.png";
import HoopFrontImg from "./hoop_front.png";
import HoopBackImg from "./hoop_back.png";
import HoopLeftImg from "./hoop_left.png"; // Halqani chap tomoni uchun rasm
import HoopRightImg from "./hoop_right.png"; // Halqani o'ng tomoni uchun rasm
import FireImg from "./fire.png";

const Flappy3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const boostingRef = useRef(false);

  const [hoopFrontImg, setHoopFrontImg] = useState<HTMLImageElement | null>(null);
  const [hoopBackImg, setHoopBackImg] = useState<HTMLImageElement | null>(null);
  const [hoopLeftImg, setHoopLeftImg] = useState<HTMLImageElement | null>(null);
  const [hoopRightImg, setHoopRightImg] = useState<HTMLImageElement | null>(null);
  const [ballImg, setBallImg] = useState<HTMLImageElement | null>(null);
  const [fireImg, setFireImg] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const backImg = new Image();
    const frontImg = new Image();
    const leftImg = new Image();
    const rightImg = new Image();
    const ballImg = new Image();
    const fireImg = new Image();

    backImg.src = HoopBackImg;
    frontImg.src = HoopFrontImg;
    leftImg.src = HoopLeftImg;
    rightImg.src = HoopRightImg;
    ballImg.src = BallImg;
    fireImg.src = FireImg;

    let loaded = 0;
    const onLoad = () => {
      loaded++;
      if (loaded === 6) setImagesLoaded(true);
    };

    backImg.onload = () => {
      setHoopBackImg(backImg);
      onLoad();
    };
    frontImg.onload = () => {
      setHoopFrontImg(frontImg);
      onLoad();
    };
    leftImg.onload = () => {
      setHoopLeftImg(leftImg);
      onLoad();
    };
    rightImg.onload = () => {
      setHoopRightImg(rightImg);
      onLoad();
    };
    ballImg.onload = () => {
      setBallImg(ballImg);
      onLoad();
    };
    fireImg.onload = () => {
      setFireImg(fireImg);
      onLoad();
    };
  }, []);

  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 500;

    setGameOver(false);
    setScore(0);

    const engine = Engine.create();
    engine.gravity.y = 0.5;
    const world = engine.world;

    const ball = Bodies.circle(100, 200, 23, {
      restitution: 0.2,
      frictionAir: 0.02,
      mass: 0.5,
    });

    World.add(world, [ball]);

    const ground = Bodies.rectangle(200, 500 + 30, 400, 60, {
      isStatic: true,
    });
    World.add(world, ground);

    const hoops: {x: number; y: number; passed: boolean}[] = [];
    let frameCount = 0;
    let hoopSpeed = 0.4;

    const update = () => {
      Engine.update(engine, 1000 / 60);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const ballX = ball.position.x;
      const ballY = ball.position.y;

      if (boostingRef.current && fireImg) {
        ctx.drawImage(fireImg, ballX - 23 * 1.25, ballY + 12, 23, 30);
      }

      if (ballImg) {
        ctx.drawImage(ballImg, ballX - 23, ballY - 23, 46, 46);
      }

      frameCount++;
      if (frameCount % 100 === 0) {
        const lastHoop = hoops[hoops.length - 1];
        let newX = canvas.width;
        let newY = Math.random() * (canvas.height - 200) + 100;

        if (lastHoop) {
          newX = Math.max(lastHoop.x + 200, canvas.width);
          const minY = Math.max(lastHoop.y - 150, 100);
          const maxY = Math.min(lastHoop.y + 150, canvas.height - 100);
          newY = Math.random() * (maxY - minY) + minY;
        }

        hoops.push({x: newX, y: newY, passed: false});
      }

      hoops.forEach((hoop) => {
        hoop.x -= hoopSpeed;

        const hoopTop = hoop.y + 20;
        const hoopBottom = hoop.y + 50;
        const hoopLeft = hoop.x;
        const hoopRight = hoop.x + 100;

        // Halqaning orqa, old, chap va o'ng qismlarini chizish
        if (hoopBackImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopBackImg, hoop.x + 7, hoop.y - 10, 100, 40);
        }

        if (hoopFrontImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopFrontImg, hoop.x + 7, hoop.y + 10, 100, 40);
        }

        if (hoopLeftImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopLeftImg, hoop.x + 3, hoop.y + 2.5, 15, 37);
        }

        if (hoopRightImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopRightImg, hoop.x + 97, hoop.y + 2.5, 15, 37);
        }

        // To'pni chizish
        if (
          ball.position.x > hoopLeft &&
          ball.position.x < hoopRight &&
          ball.position.y >= hoopTop &&
          ball.position.y <= hoopBottom &&
          ballImg instanceof HTMLImageElement
        ) {
          ctx.drawImage(ballImg, ballX - 23, ballY - 23, 46, 46);
        }

        // Ball passed check
        if (
          !hoop.passed &&
          ball.position.y >= hoopTop &&
          ball.position.y < hoopBottom &&
          ball.position.x > hoopLeft &&
          ball.position.x < hoopRight
        ) {
          hoop.passed = true;
          setScore((prev) => prev + 1);
        }
      });
      hoops.splice(
        0,
        hoops.findIndex((h) => h.x > -100)
      );

      if (ballY + 23 > canvas.height) {
        setGameOver(true);
      }

      if (!gameOver) {
        requestAnimationFrame(update);
      }
    };

    update();

    const handleJump = () => {
      if (!gameOver) {
        Body.setVelocity(ball, {x: 0, y: -5});
        boostingRef.current = true;
        setTimeout(() => (boostingRef.current = false), 200);
      } else {
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handleJump);
    window.addEventListener("click", handleJump);

    return () => {
      window.removeEventListener("keydown", handleJump);
      window.removeEventListener("click", handleJump);
    };
  }, [imagesLoaded, gameOver]);

  return (
    <div style={{textAlign: "center"}}>
      <h2>Flappy Dunk</h2>
      <p>Score: {score}</p>
      {imagesLoaded && <canvas ref={canvasRef} style={{border: "2px solid black"}} />}
      {gameOver && <h2>Game Over! Click to Restart</h2>}
    </div>
  );
};

export default Flappy3D;
