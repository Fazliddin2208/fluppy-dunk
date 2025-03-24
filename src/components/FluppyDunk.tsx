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
    const [firedBallImg, setFiredBallImg] = useState<HTMLImageElement | null>(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    const [boosting, setBoosting] = useState(false);
    const boostingRef = useRef(false);

    console.log(boosting);

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
                console.log("All images loaded");
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
        firedBallImg.onload = () => {
            setFiredBallImg(firedBallImg);
            checkAllLoaded();
        };
        fireImg.onload = () => {
            setFireImg(fireImg);
            checkAllLoaded();
        };
    }, []);

    // Ball properties
    let ball = {x: 100, y: 200, radius: 20, dy: 0, gravity: 0.05, lift: -3};

    // Hoops array
    let hoops: {x: number; y: number}[] = [];
    let frameCount = 0;

    useEffect(() => {
        if (!imagesLoaded) return;

        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // canvas.width = 600;
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
            ball.dy += ball.gravity;
            ball.y += ball.dy;
            if (ball.y + ball.radius > canvas.height) setGameOver(true);

            // Generate hoops
            if (frameCount % 100 === 0) {
                hoops.push({x: canvas.width, y: Math.random() * (canvas.height - 200) + 100});
            }
            frameCount++;

            // Draw & move hoops
            hoops.forEach((hoop, index) => {
                hoop.x -= 1;
                // Draw BACK side of the hoop first
                if (hoopBackImg instanceof HTMLImageElement) {
                    ctx.drawImage(hoopBackImg, hoop.x, hoop.y, 90, 60); // Adjust size as needed
                }

                if (boostingRef.current && fireImg instanceof HTMLImageElement) {
                    ctx.drawImage(fireImg, ball.x - ball.radius * 1.3, ball.y, ball.radius, ball.radius);
                    console.log("🔥 Fire effect drawn");
                } else {
                    console.log("❌ Fire image still not ready");
                }

                // Draw the ball (so it's "inside" the hoop)
                // if (boostingRef.current) {
                //     if (firedBallImg) {
                //         ctx.drawImage(
                //             firedBallImg,
                //             ball.x - ball.radius,
                //             ball.y - ball.radius,
                //             ball.radius * 2,
                //             ball.radius * 2
                //         );
                //     }
                // } else {
                //     if (ballImg) {
                //         ctx.drawImage(
                //             ballImg,
                //             ball.x - ball.radius,
                //             ball.y - ball.radius,
                //             ball.radius * 2,
                //             ball.radius * 2
                //         );
                //     }
                // }

                if (ballImg instanceof HTMLImageElement) {
                    ctx.drawImage(
                        ballImg,
                        ball.x - ball.radius,
                        ball.y - ball.radius,
                        ball.radius * 2,
                        ball.radius * 2
                    );
                }

                // Draw FRONT side of the hoop (on top of the ball)
                if (hoopFrontImg instanceof HTMLImageElement) {
                    ctx.drawImage(hoopFrontImg, hoop.x, hoop.y, 60, 20);
                } else {
                    console.log("Hoop image not loaded yet, drawing fallback");
                }

                // Collision detection
                if (
                    ball.x + ball.radius > hoop.x &&
                    ball.x - ball.radius < hoop.x + 50 &&
                    ball.y + ball.radius > hoop.y &&
                    ball.y - ball.radius < hoop.y + 10
                ) {
                    setScore((prev) => prev + 1);
                    hoops.splice(index, 1);
                }
            });
            // Remove off-screen hoops
            hoops = hoops.filter((hoop) => hoop.x > -50);

            // Draw ball with image
            // if (ballImg?.complete && ballImg.naturalWidth !== 0) {
            //     ctx.drawImage(ballImg, ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);
            // } else {
            //     console.log("Ball image not loaded yet, drawing fallback");
            // }

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
                setBoosting(true);
                // setInterval(() => {
                //     setBoosting(false);
                // }, 2000)
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
            {imagesLoaded &&
            <canvas ref={canvasRef} style={{border: "2px solid black"}} />
            }
            {gameOver && <h2>Game Over! Click to Restart</h2>}
        </div>
    );
};

export default FlappyDunk;
