import React, { useState, useEffect } from "react";
import "./App.css";
import config from "./config.json";

const getRandomCoordinates = () => {
  const min = config.grid.min;
  const max = config.grid.max;
  const step = config.grid.step;
  let x = Math.floor((Math.random() * (max - min + 1) + min) / step) * step;
  let y = Math.floor((Math.random() * (max - min + 1) + min) / step) * step;
  return [x, y];
};

const App = () => {
  const [snakeDots, setSnakeDots] = useState(config.snake.initialPosition);
  const [food, setFood] = useState(getRandomCoordinates());
  const [direction, setDirection] = useState(config.snake.initialDirection);
  const [speed, setSpeed] = useState(config.snake.initialSpeed);

  useEffect(() => {
    const onKeyDown = (e) => {
      e = e || window.event;
      switch (e.keyCode) {
        case 38:
          setDirection("UP");
          break;
        case 40:
          setDirection("DOWN");
          break;
        case 37:
          setDirection("LEFT");
          break;
        case 39:
          setDirection("RIGHT");
          break;
        default:
          break;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const moveSnake = () => {
      let dots = [...snakeDots];
      let head = dots[dots.length - 1];

      switch (direction) {
        case "RIGHT":
          head = [head[0] + config.grid.step, head[1]];
          break;
        case "LEFT":
          head = [head[0] - config.grid.step, head[1]];
          break;
        case "DOWN":
          head = [head[0], head[1] + config.grid.step];
          break;
        case "UP":
          head = [head[0], head[1] - config.grid.step];
          break;
        default:
          break;
      }
      dots.push(head);
      dots.shift();
      setSnakeDots(dots);
    };

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [snakeDots, direction, speed]);

  useEffect(() => {
    checkIfOutOfBorders();
    checkIfCollapsed();
    checkIfEat();
  });

  const checkIfOutOfBorders = () => {
    let head = snakeDots[snakeDots.length - 1];
    if (head[0] >= 100 || head[0] < 0 || head[1] >= 100 || head[1] < 0) {
      onGameOver();
    }
  };

  const checkIfCollapsed = () => {
    let snake = [...snakeDots];
    let head = snake[snake.length - 1];
    snake.pop();
    snake.forEach((dot) => {
      if (head[0] === dot[0] && head[1] === dot[1]) {
        onGameOver();
      }
    });
  };

  const checkIfEat = () => {
    let head = snakeDots[snakeDots.length - 1];
    if (head[0] === food[0] && head[1] === food[1]) {
      setFood(getRandomCoordinates());
      enlargeSnake();
      increaseSpeed();
    }
  };

  const enlargeSnake = () => {
    let newSnake = [...snakeDots];
    newSnake.unshift([]);
    setSnakeDots(newSnake);
  };

  const increaseSpeed = () => {
    if (speed > config.snake.minSpeed) {
      setSpeed(speed - config.snake.speedIncrement);
    }
  };

  const onGameOver = () => {
    alert(`Oyun Bitti. Skorunuz: ${snakeDots.length}`);
    setSnakeDots(config.snake.initialPosition);
    setFood(getRandomCoordinates());
    setDirection(config.snake.initialDirection);
    setSpeed(config.snake.initialSpeed);
  };

  return (
    <div className="game-area">
      <Snake snakeDots={snakeDots} />
      <Food dot={food} />
    </div>
  );
};

const Snake = ({ snakeDots }) => {
  return (
    <div>
      {snakeDots.map((dot, i) => {
        const style = {
          left: `${dot[0]}%`,
          top: `${dot[1]}%`,
          width: config.snake.dotSize,
          height: config.snake.dotSize,
          backgroundColor: config.snake.color,
        };
        return <div className="snake-dot" key={i} style={style}></div>;
      })}
    </div>
  );
};

const Food = ({ dot }) => {
  const style = {
    left: `${dot[0]}%`,
    top: `${dot[1]}%`,
    width: config.food.size,
    height: config.food.size,
    backgroundColor: config.food.color,
  };
  return <div className="snake-food" style={style}></div>;
};

export default App;
