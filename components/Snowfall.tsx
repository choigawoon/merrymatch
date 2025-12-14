import React, { useEffect, useRef } from 'react';

const Snowfall: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const snowflakes: { x: number; y: number; r: number; d: number }[] = [];
    const maxFlakes = 100;

    for (let i = 0; i < maxFlakes; i++) {
      snowflakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1,
        d: Math.random() * maxFlakes,
      });
    }

    let animationFrameId: number;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.beginPath();
      
      for (let i = 0; i < maxFlakes; i++) {
        const f = snowflakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      }
      
      ctx.fill();
      update();
      animationFrameId = requestAnimationFrame(draw);
    };

    let angle = 0;
    const update = () => {
      angle += 0.01;
      for (let i = 0; i < maxFlakes; i++) {
        const f = snowflakes[i];
        // Updating X and Y coordinates
        // We will add 1 to the cos function to prevent negative values which will lead flakes to move upwards
        // Every particle has its own density which can be used to make the downward movement different for each flake
        // Lets make it more random by adding in the radius
        f.y += Math.cos(angle + f.d) + 1 + f.r / 2;
        f.x += Math.sin(angle) * 2;

        // Sending flakes back from the top when it exits
        if (f.x > width + 5 || f.x < -5 || f.y > height) {
          if (i % 3 > 0) {
            snowflakes[i] = { x: Math.random() * width, y: -10, r: f.r, d: f.d };
          } else {
            // If the flake is exitting from the right
            if (Math.sin(angle) > 0) {
              snowflakes[i] = { x: -5, y: Math.random() * height, r: f.r, d: f.d };
            } else {
              snowflakes[i] = { x: width + 5, y: Math.random() * height, r: f.r, d: f.d };
            }
          }
        }
      }
    };

    draw();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-40"
    />
  );
};

export default Snowfall;