import React, {useEffect, useRef, useState} from "react";
import BallImg from "./flball.png";
import HoopFrontImg from "./front.png";
import FireImg from "./fire.png";
import HoopBackImg from "./hoop_back.png";
import HoopLeftImg from "./hoop_left.png";
import HoopRightImg from "./hoop_right.png";
import FireWorkImg from "./firework.png";
import RingFireImg from "./ring-fire.png";

const Flappy3D: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [hoopFrontImg, setHoopFrontImg] = useState<HTMLImageElement | null>(null);
  const [hoopBackImg, setHoopBackImg] = useState<HTMLImageElement | null>(null);
  const [hoopLeftImg, setHoopLeftImg] = useState<HTMLImageElement | null>(null);
  const [hoopRightImg, setHoopRightImg] = useState<HTMLImageElement | null>(null);
  const [ballImg, setBallImg] = useState<HTMLImageElement | null>(null);
  const [fireImg, setFireImg] = useState<HTMLImageElement | null>(null);
  // const [fireworkImg, setFireworkImg] = useState<HTMLImageElement | null>(null);
  // const [ringFireImg, setRingFireImg] = useState<HTMLImageElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const boostingRef = useRef(false);

  const [cleanStreak, setCleanStreak] = useState(0);

  useEffect(() => {
    const backImg = new Image();
    const ballImg = new Image();
    const fireImg = new Image();
    const leftImg = new Image();
    const rightImg = new Image();
    const frontImg = new Image();
    const fireworkImg = new Image();
    const ringFireImg = new Image();

    backImg.src = HoopBackImg;
    ballImg.src = BallImg;
    fireImg.src = FireImg;
    leftImg.src = HoopLeftImg;
    rightImg.src = HoopRightImg;
    frontImg.src = HoopFrontImg;
    fireworkImg.src = FireWorkImg;
    ringFireImg.src = RingFireImg;

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

    // fireworkImg.onload = () => {
    //   setFireworkImg(fireworkImg);
    //   checkAllLoaded();
    // };

    // ringFireImg.onload = () => {
    //   setRingFireImg(ringFireImg);
    //   checkAllLoaded();
    // };
  }, []);

  let ball = {
    x: 100,
    y: 200,
    prevY: 200,
    radius: 23,
    width: 70,
    height: 50,
    dx: 0,
    dy: 0,
    gravity: 0.03,
    lift: -1.7,
    startX: 100,
  };
  let hoops: {x: number; y: number; passed: boolean; hitEdge: boolean}[] = [];
  let frameCount = 0;
  let hoopSpeed = 0.4;

  const cleanStreakRef = useRef(0); // yangi ref
  const effectRef = useRef<number | null>(null); // yangi ref
  const effectMapRef = useRef<{[key: number]: boolean}>({});

  // Clean streak uchun effekt
  const triggerCleanEffect = (value: number, hoopIndex: number) => {
    // Bu yerda siz effektni trigger qilasiz
    console.log(hoops[hoopIndex], !hoops[hoopIndex].hitEdge, "🔥 Perfect Clean!", value, hoopIndex, effectRef.current);

    effectMapRef.current[hoopIndex] = true;
    setTimeout(() => {
      delete effectMapRef.current[hoopIndex];
    }, 200); // 2 sekund

    // if (hoops[hoopIndex] && !hoops[hoopIndex].hitEdge) {
    //   effectRef.current = hoopIndex;
    //   console.log("ichkari", effectRef.current);

    //   // Effektni 2 sekunddan keyin o'chirish
    //   setTimeout(() => {
    //     effectRef.current = null;
    //   }, 1000);
    // }

    // Misol uchun matn animatsiyasi ko‘rsatish uchun DOM elementga class qo‘shish mumkin
    const text = document.getElementById("cleanEffectText");
    if (text) {
      text.classList.add("show");
      setTimeout(() => {
        text.classList.remove("show");
      }, 200);
    }

    // Yoki particle/fx ga signal jo‘natish
  };

  const checkBallPassed = (hoops: any, hoop: any, index: number) => {
    console.log(hoops, hoop, index);
  };

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

        hoops.push({x: newX, y: newY, passed: false, hitEdge: false});
      }

      frameCount++;

      hoops.forEach((hoop, index) => {
        hoop.x -= hoopSpeed;
        const hoopTop = hoop.y + 20; // ✅ Halqaning yuqori chegarasi
        const hoopBottom = hoop.y + 30; // ✅ Halqaning pastki chegarasi
        const hoopLeft = hoop.x;
        const hoopRight = hoop.x + 100;

        ctx.strokeStyle = "yellow";
        ctx.strokeRect(ball.x + 22.5, ball.y - ball.height / 2, 2, ball.height / 2);

        // ctx.strokeStyle = "brown";
        // ctx.strokeRect(ball.x + 45, ball.y - ball.height / 2, 22.5, ball.height / 2);

        ctx.strokeStyle = "pink";
        ctx.strokeRect(ball.x + 22.5, ball.y, 2, ball.height / 2);

        ctx.strokeStyle = "blue";
        ctx.strokeRect(hoop.x + 100, hoop.y, 18, 40);

        ctx.strokeStyle = "green";
        ctx.strokeRect(hoop.x + 82, hoop.y, 18, 40);

        ctx.strokeStyle = "white";
        ctx.strokeRect(hoop.x - 8, hoop.y, 18, 40);

        // ctx.strokeStyle = "BLACK";
        // ctx.strokeRect(hoop.x - 5, hoop.y + ball.height / 5, 13, ball.height / 2);

        ctx.strokeStyle = "yellow";
        ctx.strokeRect(hoop.x + 10, hoop.y, 18, 40);

        // if (effectMapRef.current[index] && ringFireImg instanceof HTMLImageElement) {
        //   ctx.drawImage(ringFireImg, hoop.x - 15, hoop.y - 122, 165, 280);
        // }

        if (hoopFrontImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopFrontImg, hoop.x + 5, hoop.y + 10, 100, 40);
        }

        // if (effectMapRef.current[index] && fireworkImg instanceof HTMLImageElement) {
        //   ctx.drawImage(fireworkImg, hoop.x - 30, hoop.y - 65, 165, 165);
        // }

        if (boostingRef.current && fireImg instanceof HTMLImageElement) {
          ctx.drawImage(fireImg, ball.x - ball.radius * 1.25, ball.y + 12, ball.radius, 30);
        }

        if (ballImg instanceof HTMLImageElement) {
          // ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
          ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.width, ball.height);
        }
        if (hoopLeftImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopLeftImg, hoop.x + 3, hoop.y + 2.5, 15, 37);
        }

        if (hoopRightImg instanceof HTMLImageElement) {
          ctx.drawImage(hoopRightImg, hoop.x + 94, hoop.y + 2.5, 15, 37);
        }

        if (hoopBackImg instanceof HTMLImageElement) {
          ctx.globalCompositeOperation = "destination-over";
          // ctx.drawImage(hoopBackImg, hoop.x, hoop.y - 12, 100, 40);
          ctx.drawImage(hoopBackImg, hoop.x + 5, hoop.y - 9, 100, 40);
          // ctx.drawImage(hoopBackImg, hoop.x + 7, hoop.y - 10, 100, 40);
        }

        // collision

        if (
          ball.y >= hoop.y + ball.height / 5 &&
          ball.y <= ball.height / 5 + ball.height / 2 &&
          ball.x + 45 >= hoop.x - 5
        ) {
          hoopSpeed = -2;
          ball.dy = -ball.lift * 2;
          setTimeout(() => {
            hoopSpeed = 0.4;
          }, 700);
        }

        if (!hoop.passed && ball.prevY < hoopTop && ball.y >= hoopTop && ball.x > hoopLeft && ball.x < hoopRight) {
          if (!hoop.hitEdge) {
            setCleanStreak((prev) => prev + 1); // yangi state kerak
            cleanStreakRef.current++;
            triggerCleanEffect(cleanStreakRef.current, index);
          } else {
            setCleanStreak(0);
          }
          setTimeout(() => {
            hoop.passed = true;
            setScore((prev) => prev + 1);
            checkBallPassed(hoops, hoop, index);
          }, 200);
        } else {
          if (ball.prevY > ball.y) {
            const isCollisionByY =
              ball.y - ball.height / 2 <= hoopBottom + 10 && ball.y - ball.height / 2 >= hoopBottom;

            if (isCollisionByY && ball.x + 22.5 >= hoop.x - 8 && ball.x + 22.5 <= hoop.x + 10) {
              ball.dy = -ball.lift * 0.04;
              hoop.hitEdge = true;
              hoopSpeed = -0.4;
              setTimeout(() => {
                hoopSpeed = 0.4;
              }, 700);
            } else if (isCollisionByY && ball.x + 22.5 > hoop.x + 10 && ball.x + 22.5 <= hoop.x + 28) {
              ball.dy = -ball.lift * 0.04;
              hoop.hitEdge = true;
            } else if (isCollisionByY && ball.x + 22.5 >= hoop.x + 82 && ball.x + 22.5 <= hoop.x + 100) {
              ball.dy = -ball.lift * 0.04;
              hoop.hitEdge = true;
            } else if (isCollisionByY && ball.x + 22.5 > hoop.x + 100 && ball.x + 22.5 <= hoop.x + 118) {
              ball.dy = -ball.lift * 0.04;
              hoop.hitEdge = true;
            }
          } else {
            const isCollisionByY = ball.y + ball.height / 2 >= hoopTop && ball.y - ball.height / 2 <= hoopBottom;

            if (isCollisionByY && ball.x + 22.5 >= hoop.x - 8 && ball.x + 22.5 <= hoop.x + 10) {
              // left first edge
              ball.dy = ball.lift * 0.7;
              hoop.hitEdge = true;
              hoopSpeed = -0.4;
              setTimeout(() => {
                hoopSpeed = 0.4;
              }, 700);
            } else if (isCollisionByY && ball.x + 22.5 > hoop.x + 10 && ball.x + 22.5 <= hoop.x + 28) {
              // left second edge
              ball.dy = ball.lift * 0.7;
              hoop.hitEdge = true;
              hoopSpeed = 0.4;
            } else if (isCollisionByY && ball.x + 22.5 >= hoop.x + 82 && ball.x + 22.5 <= hoop.x + 100) {
              // right first edge
              ball.dy = ball.lift * 0.7;
              hoop.hitEdge = true;
              hoopSpeed = -0.4;
              setTimeout(() => {
                hoopSpeed = 0.4;
              }, 700);
            } else if (isCollisionByY && ball.x + 22.5 > hoop.x + 100 && ball.x + 22.5 <= hoop.x + 118) {
              // right second edge
              ball.dy = ball.lift * 0.7;
              hoop.hitEdge = true;
            }
          }
        }
        if (ball.prevY > hoopBottom && ball.y <= hoopBottom && ball.x > hoopLeft && ball.x < hoopRight) {
          ball.dy = -ball.lift * 0.4;
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
      <p>Clean Streak: {cleanStreak}</p>
      {imagesLoaded && <canvas ref={canvasRef} style={{border: "2px solid black"}} />}
      {gameOver && <h2>Game Over! Click to Restart</h2>}
    </div>
  );
};

export default Flappy3D;
