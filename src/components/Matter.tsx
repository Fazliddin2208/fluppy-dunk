import { useEffect, useRef } from "react";
import Matter from "matter-js";

const FlappyDunkMatter: React.FC = () => {
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const engine = Matter.Engine.create();
    const world = engine.world;

    const render = Matter.Render.create({
      element: sceneRef.current!,
      engine: engine,
      options: { width: 800, height: 600, wireframes: false },
    });

    // To‘p va yer yaratish
    const ball = Matter.Bodies.circle(400, 200, 20, { restitution: 0.8 });
    const ground = Matter.Bodies.rectangle(400, 580, 810, 60, { isStatic: true });

    Matter.World.add(world, [ball, ground]);

    Matter.Runner.run(engine);
    Matter.Render.run(render);

    return () => {
      Matter.Render.stop(render);
      Matter.World.clear(world, false);
      Matter.Engine.clear(engine);
    };
  }, []);

  return <div ref={sceneRef} />;
};

export default FlappyDunkMatter;
