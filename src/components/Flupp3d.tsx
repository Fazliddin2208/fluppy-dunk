import React, {useEffect, useRef, useState} from "react";
import BallImg from "./flball.png";
import HoopFrontImg from "./hoop_front.png";
import FireImg from "./fire.png";
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
    const backImg = new Image();
    const ballImg = new Image();
    const fireImg = new Image();
    const frontImg = new Image();

    backImg.src = HoopBackImg;
    ballImg.src = BallImg;
    fireImg.src = FireImg;
    frontImg.src = HoopFrontImg;

    let loadedCount = 0;
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === 4) setImagesLoaded(true);
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
        const hoopBottom = hoop.y + 50; // ✅ Halqaning pastki chegarasi
        const hoopLeft = hoop.x;
        const hoopRight = hoop.x + 100;

        if (hoopBackImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopBackImg, hoop.x, hoop.y - 15, 100, 40);
        }

        if (boostingRef.current && fireImg instanceof HTMLImageElement) {
          ctx.drawImage(fireImg, ball.x - ball.radius * 1.25, ball.y + 12, ball.radius, 30);
        }

        if (ballImg instanceof HTMLImageElement) {
          ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
        }

        if (hoopFrontImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopFrontImg, hoop.x, hoop.y, 100, 40);
        }

        if (!hoop.passed && ball.prevY < hoopTop && ball.y >= hoopTop && ball.x > hoopLeft && ball.x < hoopRight) {
          hoop.passed = true;
          setScore((prev) => prev + 1);
        } else {
          const leftHalf = hoopLeft + 15; // Chap yarmi
          const rightHalf = hoopRight - 15; // O‘ng yarmi

          if (
            (ball.x - 10 <= leftHalf && ball.x + 10 > hoopLeft) ||
            (ball.x + 10 >= rightHalf && ball.x - 10 < hoopRight)
          ) {
            if (ball.y + ball.radius > hoopTop && ball.y - ball.radius < hoopBottom) {
              ball.dy = ball.lift * 0.7;
              hoopSpeed = 0.2;

              // 🏀 **Agar top chap chetning 1-yarmiga tegsa (orqaga qaytishi kerak)**
              if (ball.x < hoopLeft + 7.5) {
                hoopSpeed = -0.2;
                setTimeout(() => {
                  hoopSpeed = 0.4;
                }, 700);
              }

              // 🏀 **Agar top o‘ng chetning 1-yarmiga tegsa (orqaga qaytishi kerak)**
              if (ball.x > hoopRight - 12 && ball.x < hoopRight - 6) {
                hoopSpeed = -0.2;
                setTimeout(() => {
                  hoopSpeed = 0.4;
                }, 300);
              }
              setTimeout(() => {
                hoopSpeed = 0.4;
              }, 1000);
            }
          }

        }
        if (
          ball.prevY > hoopBottom && ball.y <= hoopBottom && ball.x > hoopLeft && ball.x < hoopRight
        ) {
          // ball.dy = Math.abs(ball.dy); // 🔥 Pastga tushish uchun dy ijobiy bo‘lishi kerak
          console.log("past");
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

export default Flappy3D;

// ✅ Ochko qo‘shish (agar to‘p yuqoridan halqaga kelsa va ichidan o‘tsa)
// if (!hoop.passed && ball.prevY < hoopTop && ball.y >= hoopTop && ball.x > hoopLeft && ball.x < hoopRight) {
//   hoop.passed = true;
//   setScore((prev) => prev + 1);
// } else if (
//   (ball.x - 10 <= hoopLeft + 15 && ball.x + 10 > hoopLeft) ||
//   (ball.x + 10 >= hoopRight - 15 && ball.x - 10 < hoopRight)
// ) {
//   if (ball.y + ball.radius > hoopTop && ball.y - ball.radius < hoopBottom) {
//     ball.dy = ball.lift * 0.7;
//     ball.x = ball.x - 3
//     console.log('dx: ', ball.dx, ball.x);
//     // ball.y = hoopTop - ball.radius;
//     hoopSpeed = 0;
//     setTimeout(() => {
//       hoopSpeed = 0.4;
//     }, 1000);
//   }
// } else if (
//   (ball.x - 10 < hoopLeft + 15 && ball.x + 10 > hoopLeft) ||
//   (ball.x + 10 > hoopRight - 15 && ball.x - 10 < hoopRight)
// ) {
//   if (ball.y + ball.radius >= hoopTop && ball.y - ball.radius <= hoopBottom) {
//     ball.dy = ball.lift * 0.7;
//     ball.x = ball.x - 3
//     console.log('dx: ', ball.dx);
//     // ball.y = hoopTop - ball.radius;
//     hoopSpeed = 0;
//     setTimeout(() => {
//       hoopSpeed = 0.4;
//     }, 1000);
//   }
// }
