import React, {useEffect, useRef, useState} from "react";
import BallImg from "./flball.png";
import HoopFrontImg from "./hoop_front.png";
import FireImg from "./fire.png";
import HoopBackImg from "./hoop_back.png";
import HoopLeftImg from "./hoop_left.png";
import HoopRightImg from "./hoop_right.png";

const FlappyFinal: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [hoopFrontImg, setHoopFrontImg] = useState<HTMLImageElement | null>(null);
  const [hoopBackImg, setHoopBackImg] = useState<HTMLImageElement | null>(null);
  const [hoopLeftImg, setHoopLeftImg] = useState<HTMLImageElement | null>(null);
  const [hoopRightImg, setHoopRightImg] = useState<HTMLImageElement | null>(null);
  const [ballImg, setBallImg] = useState<HTMLImageElement | null>(null);
  const [fireImg, setFireImg] = useState<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const boostingRef = useRef(false);

  useEffect(() => {
    const backImg = new Image();
    const ballImg = new Image();
    const fireImg = new Image();
    const leftImg = new Image();
    const rightImg = new Image();
    const frontImg = new Image();

    backImg.src = HoopBackImg;
    ballImg.src = BallImg;
    fireImg.src = FireImg;
    leftImg.src = HoopLeftImg;
    rightImg.src = HoopRightImg;
    frontImg.src = HoopFrontImg;

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === 6) setImagesLoaded(true);
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
    leftImg.onload = () => {
      setHoopLeftImg(leftImg);
      checkAllLoaded();
    };
    rightImg.onload = () => {
      setHoopRightImg(rightImg);
      checkAllLoaded();
    };
    frontImg.onload = () => {
      setHoopFrontImg(frontImg);
      checkAllLoaded();
    };
  }, []);

  let ball = {x: 100, y: 200, prevY: 200, radius: 23, dx: 0, dy: 0, gravity: 0.03, lift: -1.7, startX: 100};
  let hoops: {x: number; y: number; passed: boolean}[] = [];
  let frameCount = 0;
  let hoopSpeed = 0.4;

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
    hoops = [];
    ball.y = 200;
    ball.dy = 0;
    // ball.x += ball.dx;

    const update = () => {
      if (gameOver) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ball.prevY = ball.y;
      ball.dy += ball.gravity;
      ball.y += ball.dy;
      ball.x += ball.dx;

      if (ball.y + ball.radius > canvas.height) setGameOver(true);

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

      frameCount++;

      hoops.forEach((hoop, index) => {
        hoop.x -= hoopSpeed;
        const hoopTop = hoop.y + 20; // ✅ Halqaning yuqori chegarasi
        const hoopBottom = hoop.y; // ✅ Halqaning pastki chegarasi
        const hoopLeft = hoop.x - 50;
        const hoopRight = hoop.x + 50;
        const ballTop = ball.y - ball.radius;
        const ballBottom = ball.y + ball.radius;
        const ballLeft = ball.x - ball.radius;
        const ballRight = ball.x + ball.radius;

        // if (hoopBackImg instanceof HTMLImageElement) {
        //   ctx.drawImage(hoopBackImg, hoop.x + 7, hoop.y - 10, 100, 40);
        // }

        if (hoopLeftImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopLeftImg, hoop.x + 3, hoop.y + 2.5, 15, 37);
        }

        if (hoopRightImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopRightImg, hoop.x + 94, hoop.y + 2.5, 15, 37);
        }

        if (hoopFrontImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopFrontImg, hoop.x + 7, hoop.y + 10, 100, 40);
        }
        if (boostingRef.current && fireImg instanceof HTMLImageElement) {
          ctx.drawImage(fireImg, ball.x - ball.radius * 1.25, ball.y + 12, ball.radius, 30);
        }

        if (ballImg instanceof HTMLImageElement) {
          ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
        }

        // collision

        if (ballTop <= hoopBottom && ballBottom > hoopTop && ballRight > hoopLeft && ballLeft < hoopRight) {
          // Agar top halqaning o‘rtasida yoki pastki qismiga tegsa, to‘qnashuv
          if (ball.prevY > ball.y) {
            // Top halqaning pastki chetiga urildi
            ball.dy = -ball.lift * 0.2; // Topni yuqoriga qarab turishi uchun
          }
        }
      });

      hoops = hoops.filter((hoop) => hoop.x > -50 && !hoop.passed);
      requestAnimationFrame(update);
    };
    update();

    const handleJump = () => {
      if (!gameOver) {
        ball.dy = ball.lift;
        boostingRef.current = true;
        setTimeout(() => {
          boostingRef.current = false;
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

export default FlappyFinal;
