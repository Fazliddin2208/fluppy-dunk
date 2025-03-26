import React, {useEffect, useRef, useState} from "react";
import BallImg from "./flball.png";
import FireImg from "./fire.png";
import HoopFrontImg from "./hoop_front.png";
import HoopBackImg from "./hoop_back.png";

const Flappy3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
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
    const fireImg = new Image();

    frontImg.src = HoopFrontImg;
    backImg.src = HoopBackImg;
    ballImg.src = BallImg;
    fireImg.src = FireImg;

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === 4) setImagesLoaded(true);
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

  let ball = {x: 100, y: 200, prevY: 200, radius: 20, dy: 0, gravity: 0.02, lift: -1.5};
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

    setGameOver(false);
    setScore(0);
    hoops = [];
    ball.y = 200;
    ball.dy = 0;

    function isBallHittingHoopEdge(hoop: any) {
      const edgeOffset = 10; // ✅ 10px chekkaga tegish limiti
      const leftEdge = hoop.x - hoop.width / 2 + edgeOffset;
      const rightEdge = hoop.x + hoop.width / 2 - edgeOffset;
      const ballBottom = ball.y + ball.radius;
    
      return (
        (ball.x >= leftEdge && ball.x <= leftEdge + 5 && ballBottom >= hoop.y) || 
        (ball.x >= rightEdge - 5 && ball.x <= rightEdge && ballBottom >= hoop.y)
      );
    }

    const isBallPassedHoop = (hoop: {x: number; y: number}) => {
      return (
        ball.y > hoop.y + 35 && // ✅ To‘p halqaning pastki qismidan o‘tgan
        ball.prevY < hoop.y + 35 && // ✅ Oldingi joylashuvi hali o‘tmagan edi
        ball.x + ball.radius > hoop.x && // ✅ X koordinatasi bo‘yicha halqa ichida
        ball.x - ball.radius < hoop.x + 90
      );
    };

    const update = () => {
      if (gameOver) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ball.prevY = ball.y;
      ball.dy += ball.gravity;
      ball.y += ball.dy;

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

        hoops.push({x: newX, y: newY});
      }

      frameCount++;

      hoops.forEach((hoop, index) => {
        hoop.x -= 0.3;

        if (hoopBackImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopBackImg, hoop.x, hoop.y - 15, 100, 40);
        }

        if (boostingRef.current && fireImg instanceof HTMLImageElement) {
          ctx.drawImage(fireImg, ball.x - ball.radius * 1.3, ball.y, ball.radius, 30);
        }

        if (ballImg instanceof HTMLImageElement) {
          ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
        }

        if (hoopFrontImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopFrontImg, hoop.x, hoop.y, 100, 40);
        }

        if (isBallHittingHoopEdge(hoop)) {
          ball.dy = 0; // ✅ Faqat ikki chekkaga tegsa to‘xtaydi
          ball.y = hoop.y + 35; // ✅ To‘p halqadan o‘tgan joyda joylashadi
        }
        //  else {
        //   ball.dy += ball.gravity; // ✅ Gravityni tabiiy holatda saqlaymiz
        // }
      });

      hoops = hoops.filter((hoop) => hoop.x > -50);
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

export default Flappy3D;
