import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Image, Text } from "react-konva";
import Matter from "matter-js";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "./store";
import { updateBallPosition } from "./gameSlice";
import ballImageSrc from "./ball.png"; // Ensure correct image path

interface HoopBody extends Matter.Body {
  scored?: boolean;
}

const useLoadImage = (src: string) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image(); // Fix TypeScript issue
    img.src = src;
    img.onload = () => {
      console.log("Image loaded:", src);
      setImage(img);
    };
    img.onerror = (err) => console.error("Image failed to load:", err);
  }, [src]);

  return image;
};

const Game = () => {
  const dispatch = useDispatch();
  const ballPosition = useSelector((state: RootState) => state.game.ballPosition);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const engine = useRef(Matter.Engine.create());
  const runner = useRef(Matter.Runner.create());
  const ball = useRef<Matter.Body | null>(null);
  const hoops = useRef<HoopBody[]>([]);
  const ballImage = useLoadImage(ballImageSrc);

  useEffect(() => {
    const world = engine.current.world;
    const render = Matter.Render.create({
      element: document.body,
      engine: engine.current,
      options: { width: 400, height: 600, wireframes: false },
    });

    // Create ball with fixed X position
    ball.current = Matter.Bodies.circle(100, 300, 20, { restitution: 0.8 });
    Matter.World.add(world, ball.current);

    // Create ground (for game over condition)
    const ground = Matter.Bodies.rectangle(200, 610, 400, 20, { isStatic: true });
    Matter.World.add(world, ground);

    // Create hoops moving from right to left
    for (let i = 0; i < 3; i++) {
      const hoop = Matter.Bodies.rectangle(400 + i * 200, 150 * (i + 1), 100, 10, { isStatic: false }) as HoopBody;
      hoop.scored = false;
      hoops.current.push(hoop);
      Matter.World.add(world, hoop);
    }

    // Run physics engine using Matter.Runner
    Matter.Runner.run(runner.current, engine.current);
    Matter.Render.run(render);

    // Check for game over
    Matter.Events.on(engine.current, "collisionStart", (event) => {
      event.pairs.forEach((pair) => {
        if (ball.current && (pair.bodyA === ground || pair.bodyB === ground)) {
          setGameOver(true);
        }
      });
    });

    // Update ball position and move hoops
    const update = setInterval(() => {
      if (ball.current) {
        dispatch(updateBallPosition({ x: ball.current.position.x, y: ball.current.position.y }));
      }

      hoops.current.forEach((hoop) => {
        Matter.Body.translate(hoop, { x: -2, y: 0 }); // Move hoops left
        if (hoop.position.x < -50) {
          Matter.Body.setPosition(hoop, { x: 450, y: 100 + Math.random() * 300 });
          hoop.scored = false;
          setScore((prev) => prev + 1);
        }
      });
    }, 16);

    return () => {
      clearInterval(update);
      Matter.Render.stop(render);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine.current);
      Matter.Runner.stop(runner.current);
    };
  }, [dispatch]);
  // Handle user click to apply an upward force (flap effect)
  const handleFlap = () => {
    if (ball.current && !gameOver) {
      Matter.Body.applyForce(ball.current, ball.current.position, { x: 0, y: -0.05 });
    }
  };

  return (
    <Stage width={400} height={600} onClick={handleFlap} onTouchStart={handleFlap}>
      <Layer>
        <Text text={`Score: ${score}`} fontSize={24} fill="white" x={10} y={10} />
        {gameOver && <Text text="Game Over!" fontSize={32} fill="red" x={120} y={250} />}
        {ballImage && !gameOver && (
          <Image image={ballImage} x={ballPosition.x - 20} y={ballPosition.y - 20} width={40} height={40} />
        )}
        {hoops.current.map((hoop, index) => (
          <Rect key={index} x={hoop.position.x - 50} y={hoop.position.y} width={100} height={10} fill="blue" />
        ))}
      </Layer>
    </Stage>
  );
};

export default Game;
