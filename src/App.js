import React, { useState, useEffect } from "react";
import "./App.css";
import config from "./config.json";

const getRandomCoordinates = () => {
  const minX = config.grid.minX;
  const maxX = config.grid.maxX;
  const minY = config.grid.minY;
  const maxY = config.grid.maxY;
  const step = config.grid.step;
  let x = Math.floor(Math.random() * ((maxX - minX) / step + 1)) * step + minX;
  let y = Math.floor(Math.random() * ((maxY - minY) / step + 1)) * step + minY;
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
      let newDirection = direction;
      switch (e.keyCode) {
        case 38: // Yukarı ok tuşu
        case 87: // W tuşu
          if (direction !== "DOWN") newDirection = "UP";
          break;
        case 40: // Aşağı ok tuşu
        case 83: // S tuşu
          if (direction !== "UP") newDirection = "DOWN";
          break;
        case 37: // Sol ok tuşu
        case 65: // A tuşu
          if (direction !== "RIGHT") newDirection = "LEFT";
          break;
        case 39: // Sağ ok tuşu
        case 68: // D tuşu
          if (direction !== "LEFT") newDirection = "RIGHT";
          break;
        default:
          break;
      }
      setDirection(newDirection);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [direction]);

  // Dokunmatik kontrolleri ekleyelim
  useEffect(() => {
    const handleSwipe = () => {
      let touchStartX = 0;
      let touchStartY = 0;
      let touchEndX = 0;
      let touchEndY = 0;

      const minSwipeDistance = 30;

      const onTouchStart = (e) => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
      };

      const onTouchEnd = (e) => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;

        const deltaX = touchEndX - touchStartX;
        const deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
          if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0 && direction !== "LEFT") {
              setDirection("RIGHT");
            } else if (deltaX < 0 && direction !== "RIGHT") {
              setDirection("LEFT");
            }
          }
        } else {
          if (Math.abs(deltaY) > minSwipeDistance) {
            if (deltaY > 0 && direction !== "UP") {
              setDirection("DOWN");
            } else if (deltaY < 0 && direction !== "DOWN") {
              setDirection("UP");
            }
          }
        }
      };

      document.addEventListener("touchstart", onTouchStart);
      document.addEventListener("touchend", onTouchEnd);

      return () => {
        document.removeEventListener("touchstart", onTouchStart);
        document.removeEventListener("touchend", onTouchEnd);
      };
    };

    handleSwipe();
  }, [direction]);

  useEffect(() => {
    const moveSnake = () => {
      setSnakeDots((prevSnakeDots) => {
        let dots = [...prevSnakeDots];
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
        return dots;
      });
    };

    const interval = setInterval(moveSnake, speed);
    return () => clearInterval(interval);
  }, [direction, speed]);

  useEffect(() => {
    checkIfCollapsed();
    checkIfEat();
    handleBorders();
  }, [snakeDots]);

  const handleBorders = () => {
    setSnakeDots((prevSnakeDots) => {
      let dots = [...prevSnakeDots];
      let head = dots[dots.length - 1];
      const maxX = 100; // Yüzde olarak
      const maxY = 100;

      // Yatay eksen
      if (head[0] >= maxX) {
        head[0] = 0;
      } else if (head[0] < 0) {
        head[0] = maxX - config.grid.step;
      }

      // Dikey eksen
      if (head[1] >= maxY) {
        head[1] = 0;
      } else if (head[1] < 0) {
        head[1] = maxY - config.grid.step;
      }

      dots[dots.length - 1] = head;
      return dots;
    });
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
    setSnakeDots((prevSnakeDots) => {
      let newSnake = [...prevSnakeDots];
      newSnake.unshift([]);
      return newSnake;
    });
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
          width: `${config.snake.dotSize}%`,
          height: `${config.snake.dotSize}%`,
          backgroundColor: config.snake.color,
          position: "absolute",
        };
        return <div key={i} style={style}></div>;
      })}
    </div>
  );
};

const Food = ({ dot }) => {
  const style = {
    left: `${dot[0]}%`,
    top: `${dot[1]}%`,
    width: `${config.food.size}%`,
    height: `${config.food.size}%`,
    backgroundColor: config.food.color,
    position: "absolute",
  };
  return <div style={style}></div>;
};

export default App;
