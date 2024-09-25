import { useRef, useEffect, FC } from "react";

type CaptchaProps = {
  onChange: (captchaText: string) => void;
};

// 生成随机验证码
const Captcha: FC<CaptchaProps> = ({ onChange }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 随机生成验证码的函数
  const generateCaptcha = () => {
    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let captchaText = "";
    for (let i = 0; i < 4; i++) {
      captchaText += chars[Math.floor(Math.random() * chars.length)]; // 从 chars 中随机选择字符
    }
    onChange(captchaText); // 将验证码传递给父组件

    drawCaptcha(captchaText);
  };

  // 绘制验证码的函数
  const drawCaptcha = (captchaText: string) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");

      // 清空画布
      ctx?.clearRect(0, 0, canvas.width, canvas.height);

      // 设置背景颜色
      ctx!.fillStyle = "#fff"; // 背景色
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      // 设置文本样式
      ctx!.font = "600 20px Arial"; // 字体大小和字体类型
      ctx!.fillStyle = "#4A94F8"; // 字体颜色
      // 绘制验证码文本
      for (let i = 0; i < captchaText.length; i++) {
        const angle = ((Math.random() * 60 - 30) * Math.PI) / 180; // 随机角度
        ctx!.save();
        const x = 12 + i * 20; // 调整 X 坐标以适应新宽度
        const y = 24; // 调整 Y 坐标以适应新高度
        ctx!.translate(x, y);
        ctx!.rotate(angle);
        ctx!.fillText(captchaText[i], 0, 0);
        ctx!.restore();
      }
    }
  };

  // 生成并绘制验证码
  const refreshCaptcha = () => {
    generateCaptcha();
  };

  // 组件首次加载时生成验证码
  useEffect(() => {
    refreshCaptcha();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width="90"
      height="32"
      onClick={refreshCaptcha} // 点击 Canvas 刷新验证码
      className="cursor-pointer rounded-2"
    />
  );
};

export default Captcha;
