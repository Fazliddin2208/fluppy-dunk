import React, {useEffect, useRef, useState} from "react";
import BallImg from "./flball.png";
import FiredBallImg from "./fired_ball.png";
import FireImg from "./fire.png";
import HoopFrontImg from "./hoop_front.png";
import HoopBackImg from "./hoop_back.png";

const FlappyDunk: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  // Load hoop front and back images
  const [hoopFrontImg, setHoopFrontImg] = useState<HTMLImageElement | null>(null);
  const [hoopBackImg, setHoopBackImg] = useState<HTMLImageElement | null>(null);
  const [ballImg, setBallImg] = useState<HTMLImageElement | null>(null);
  const [fireImg, setFireImg] = useState<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const boostingRef = useRef(false);

  useEffect(() => {
    const frontImg = new Image();
    const backImg = new Image();
    const ballImg = new Image();
    const firedBallImg = new Image();
    const fireImg = new Image();

    frontImg.src = HoopFrontImg;
    backImg.src = HoopBackImg;
    ballImg.src = BallImg;
    firedBallImg.src = FiredBallImg;
    fireImg.src = FireImg;

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === 4) {
        setImagesLoaded(true);
      }
    };

    frontImg.onload = () => {
      setHoopFrontImg(frontImg);
      checkAllLoaded();
    };

    backImg.onload = () => {
      setHoopBackImg(backImg);
      checkAllLoaded();
    };
    ballImg.onload = () => {
      setBallImg(ballImg);
      checkAllLoaded();
    };
    fireImg.onload = () => {
      setFireImg(fireImg);
      checkAllLoaded();
    };
  }, []);

  // Ball properties
  let ball = {x: 100, y: 200, prevY: 200, radius: 20, dy: 0, gravity: 0.05, lift: -3};

  // Hoops array
  let hoops: {x: number; y: number}[] = [];
  let frameCount = 0;

  useEffect(() => {
    if (!imagesLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 400;
    canvas.height = 500;

    // Reset game state
    setGameOver(false);
    setScore(0);
    hoops = [];
    ball.y = 200;
    ball.dy = 0;

    const update = () => {
      if (gameOver) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ball physics
      ball.prevY = ball.y; // 🆕 Oldingi joylashuvni saqlaymiz
      ball.dy += ball.gravity;
      ball.y += ball.dy;
      if (ball.y + ball.radius > canvas.height) setGameOver(true);

      if (frameCount % 100 === 0) {
        const lastHoop = hoops[hoops.length - 1]; // Oxirgi halqani olish
        let newX = canvas.width; // Yangi halqa ekrandan tashqarida boshlanadi
        let newY = Math.random() * (canvas.height - 200) + 100; // Yangi halqa uchun tasodifiy y koordinata

        if (lastHoop) {
          newX = Math.max(lastHoop.x + 200, canvas.width); // X o‘qi bo‘yicha 150px oraliq

          // Y o‘qi bo‘yicha oraliqni ta'minlash
          const minY = Math.max(lastHoop.y - 150, 100); // Pastga 150px
          const maxY = Math.min(lastHoop.y + 150, canvas.height - 100); // Yuqoriga 150px

          newY = Math.random() * (maxY - minY) + minY; // Yangi halqa uchun Y koordinata
        }

        hoops.push({x: newX, y: newY});
      }

      frameCount++;

      // Draw & move hoops
      hoops.forEach((hoop, index) => {
        hoop.x -= 1;
        // Draw BACK side of the hoop first
        if (hoopBackImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopBackImg, hoop.x, hoop.y, 90, 70); // Adjust size as needed
        }

        if (boostingRef.current && fireImg instanceof HTMLImageElement) {
          ctx.drawImage(fireImg, ball.x - ball.radius * 1.3, ball.y, ball.radius, 30);
          console.log("🔥 Fire effect drawn");
        } else {
          console.log("❌ Fire image still not ready");
        }

        if (ballImg instanceof HTMLImageElement) {
          ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
        }

        // Draw FRONT side of the hoop (on top of the ball)
        if (hoopFrontImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopFrontImg, hoop.x, hoop.y, 90, 70);
        } else {
          console.log("Hoop image not loaded yet, drawing fallback");
        }

        console.log("ball x:", ball.x, "ball y:", ball.y, "prevY:", ball.prevY, "hoop x:", hoop.x, "hoop y:", hoop.y);

        const hoopTop = hoop.y + 10; // ✅ Halqaning yuqori chegarasi
        const hoopBottom = hoop.y + 50; // ✅ Halqaning pastki chegarasi

        // Collision detection
        if (
          //   ball.x + ball.radius > hoop.x &&
          //   ball.x - ball.radius < hoop.x + 50 &&
          //   ball.y + ball.radius > hoop.y &&
          //   ball.y - ball.radius < hoop.y + 10

          ball.x + ball.radius > hoop.x && // ✅ Gorizontal kesishish bor
          ball.x - ball.radius < hoop.x + 90 && // ✅ To‘p butun halqa ichida
          ball.prevY + ball.radius < hoopTop && // ✅ To‘p halqaning ustida edi
          ball.y + ball.radius >= hoopTop && // ✅ Endi esa pastga tushdi
          ball.y + ball.radius < hoopBottom // ✅ To‘p halqaning ichida
        ) {
          setScore((prev) => prev + 1);
          hoops.splice(index, 1);
        }
      });
      // Remove off-screen hoops
      hoops = hoops.filter((hoop) => hoop.x > -50);

      requestAnimationFrame(update);
    };
    update();

    const handleJump = () => {
      if (!gameOver) {
        ball.dy = ball.lift;
        boostingRef.current = true; // 🔥 Activate boost effect

        setTimeout(() => {
          boostingRef.current = false; // ⏳ Remove fire effect after delay
        }, 200);
      } else window.location.reload();
    };
    window.addEventListener("keydown", handleJump);
    window.addEventListener("click", handleJump);

    return () => {
      window.removeEventListener("keydown", handleJump);
      window.removeEventListener("click", handleJump);
    };
  }, [gameOver, imagesLoaded]);

  return (
    <div style={{textAlign: "center"}}>
      <h2>Flappy Dunk</h2>
      <p>Score: {score}</p>
      {imagesLoaded && <canvas ref={canvasRef} style={{border: "2px solid black"}} />}
      {gameOver && <h2>Game Over! Click to Restart</h2>}
    </div>
  );
};

export default FlappyDunk;
