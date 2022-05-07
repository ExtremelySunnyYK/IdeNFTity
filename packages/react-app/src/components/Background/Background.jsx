import { React, useRef, useEffect } from "react";
import { useThemeSwitcher } from "react-css-theme-switcher";

import "./Background.scss";
export default function Background({
    style
}) {
  const { currentTheme } = useThemeSwitcher();
  let w, m, c, C, W, H, HW, HH, diameter, r;
  const canvasRef = useRef();
  const init = () => {
    w = window;
    m = Math;
    c = canvasRef.current;
    c.style.background = "black";
    C = c.getContext("2d");
  };

  const config = () => {
    W = c.width = w.innerWidth;
    H = c.height = w.innerHeight;
    HW = W / 2;
    HH = H / 2;
    diameter = 20;
  };

  const animLoop = (t) => {
    t /= 3000;
    C.clearRect(0, 0, W, H);
    C.globalCompositeOperation = "lighter";
    for (var k = 0; k < 3; k++) {
      if (k === 0) C.fillStyle = "#FF0000";
      if (k === 1) C.fillStyle = "#00FF00";
      if (k === 2) C.fillStyle = "#0000FF";
      for (var i = 0; i < H; i += diameter) {
        for (var j = 0; j < W / 2; j += diameter) {
          var index = i * W + j;
          C.globalAlpha = m.tan(index * index - t);
          C.fillRect(
            m.tan(i * j - m.sin(index + k / 100) + t) * j + HW - diameter / 2,
            i,
            ((m.tan(index + i / j + t + k / 100) / 2) * diameter) / 2,
            (m.tan(index * index - t) * diameter) / 2,
          );
        }
      }
    }
    r = requestAnimationFrame(animLoop);
  };

  const handleResize = () => {
    w.onresize = function () {
      cancelAnimationFrame(r);
      config();
      animLoop();
    };
  };

  useEffect(() => {
    init();
    config();
    animLoop();
    handleResize();
  }, []);
  return (
    <div className="Background" style={style}>
      <canvas ref={canvasRef}></canvas>
      <div className="EasyOverlay" style={{height:"100%", width:"100%"}}></div>
    </div>
  );
}
