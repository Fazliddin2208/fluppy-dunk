import React, { useEffect, useRef, useState } from 'react';
import { Engine, Render, World, Bodies, Body, Events, Runner } from 'matter-js';

interface GameProps {
  width?: number;
  height?: number;
}

const FluppyDunk: React.FC<GameProps> = ({ width = 800, height = 600 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const birdRef = useRef<Matter.Body | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    // Create engine
    const engine = Engine.create({
      gravity: { x: 0, y: 1 } // Adjust gravity as needed
    });
    engineRef.current = engine;

    // Create renderer
    const render = Render.create({
      element: document.body,
      engine: engine,
      canvas: canvasRef.current || undefined,
      options: {
        width,
        height,
        wireframes: false,
        background: '#87CEEB' // Sky blue background
      }
    });
    renderRef.current = render;

    // Create bird (player)
    const bird = Bodies.circle(150, height / 2, 20, {
      label: 'bird',
      restitution: 0.5,
      render: {
        fillStyle: 'yellow'
      }
    });
    birdRef.current = bird;

    // Create ground and ceiling
    const ground = Bodies.rectangle(width / 2, height - 10, width, 20, { 
      isStatic: true,
      label: 'ground',
      render: {
        fillStyle: '#654321' // Brown color for ground
      }
    });
    
    const ceiling = Bodies.rectangle(width / 2, 10, width, 20, { 
      isStatic: true,
      label: 'ceiling',
      render: {
        fillStyle: '#87CEEB' // Same as background to blend in
      }
    });

    // Add all bodies to the world
    World.add(engine.world, [bird, ground, ceiling]);

    // Create obstacles
    const obstacles: Matter.Body[] = [];
    const createObstacle = () => {
      const gapHeight = 150;
      const gapPosition = Math.random() * (height - gapHeight - 100) + 50;
      
      const topPipe = Bodies.rectangle(
        width + 50, 
        gapPosition - gapHeight / 2, 
        50, 
        gapPosition * 2, 
        { 
          isStatic: true,
          label: 'obstacle',
          render: {
            fillStyle: 'green'
          }
        }
      );
      
      const bottomPipe = Bodies.rectangle(
        width + 50, 
        gapPosition + gapHeight / 2 + (height - gapPosition - gapHeight / 2) / 2, 
        50, 
        height - gapPosition - gapHeight, 
        { 
          isStatic: true,
          label: 'obstacle',
          render: {
            fillStyle: 'green'
          }
        }
      );
      
      obstacles.push(topPipe, bottomPipe);
      World.add(engine.world, [topPipe, bottomPipe]);
    };

    // Start the engine and renderer
    Runner.run(engine);
    Render.run(render);
    const runner = Runner.create();
    Runner.run(runner, engine);
    runnerRef.current = runner;

    // Generate obstacles periodically
    const obstacleInterval = setInterval(() => {
      if (!gameOver) {
        createObstacle();
      }
    }, 2000);

    // Move obstacles and check for score
    const updateInterval = setInterval(() => {
      if (gameOver) return;
      
      obstacles.forEach(obstacle => {
        Body.translate(obstacle, { x: -5, y: 0 });
        
        // Remove obstacles that are off-screen
        if (obstacle.position.x < -50) {
          World.remove(engine.world, obstacle);
          const index = obstacles.indexOf(obstacle);
          if (index > -1) {
            obstacles.splice(index, 1);
          }
          
          // Increase score when passing obstacles
          if (obstacle.position.y < height / 2) {
            setScore(prevScore => prevScore + 0.5); // Half point per pipe (top and bottom make 1 point)
          }
        }
      });
    }, 16);

    // Handle collisions
    Events.on(engine, 'collisionStart', (event) => {
      const pairs = event.pairs;
      
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        
        if ((pair.bodyA.label === 'bird' && pair.bodyB.label === 'obstacle') ||
            (pair.bodyA.label === 'obstacle' && pair.bodyB.label === 'bird') ||
            (pair.bodyA.label === 'bird' && pair.bodyB.label === 'ground') ||
            (pair.bodyA.label === 'ground' && pair.bodyB.label === 'bird') ||
            (pair.bodyA.label === 'bird' && pair.bodyB.label === 'ceiling') ||
            (pair.bodyA.label === 'ceiling' && pair.bodyB.label === 'bird')) {
          setGameOver(true);
        }
      }
    });

    // Clean up
    return () => {
      clearInterval(obstacleInterval);
      clearInterval(updateInterval);
      if (renderRef.current) Render.stop(renderRef.current);
      if (runnerRef.current) Runner.stop(runnerRef.current);
      if (engineRef.current) World.clear(engineRef.current.world, false);
      Events.off(engineRef.current);
    };
  }, [width, height, gameOver]);

  // Handle jump
  const handleJump = () => {
    if (gameOver) return;
    
    if (birdRef.current) {
      Body.setVelocity(birdRef.current, { x: 0, y: -7 });
    }
  };

  // Restart game
  const restartGame = () => {
    window.location.reload();
  };

  return (
    <div className="game-container">
      <div className="game-ui">
        <div className="score">Score: {Math.floor(score)}</div>
        {gameOver && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>Your score: {Math.floor(score)}</p>
            <button onClick={restartGame}>Play Again</button>
          </div>
        )}
      </div>
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        onClick={handleJump}
        onTouchStart={handleJump}
        style={{ border: '1px solid black' }}
      />
    </div>
  );
};

export default FluppyDunk;