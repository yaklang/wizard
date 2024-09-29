import type { FC } from "react";
import { useRef, useEffect, memo } from "react";

import { useUpdateEffect } from "ahooks";

interface CaptchaProps {
    onChange: (captchaText: string) => void;
    value?: string;
    onGenerateCaptcha?: (fn: () => void) => void;
}

const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 *
 * @param onChange 收集获取验证码
 * @param value 验证码
 * @param onGenerateCaptcha 获取生成验证码回调函数引用
 * @returns
 */
const Captcha: FC<CaptchaProps> = memo(
    ({ onChange, value, onGenerateCaptcha }) => {
        const canvasRef = useRef<HTMLCanvasElement | null>(null);
        const captchaTextRef = useRef<string>("");

        // 随机生成验证码的函数
        const generateCaptcha = () => {
            let captchaText = "";
            for (let i = 0; i < 4; i++) {
                captchaText += chars[Math.floor(Math.random() * chars.length)]; // 从 chars 中随机选择字符b
            }

            // 将输入验证码全转为小写
            const toLowerCaseCaptchaText =
                captchaText &&
                captchaText.replace(/[A-Za-z]/g, (char) => char.toLowerCase());
            captchaTextRef.current = toLowerCaseCaptchaText;

            drawCaptcha(toLowerCaseCaptchaText);
        };

        // 绘制验证码的函数
        const drawCaptcha = (captchaText: string) => {
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext("2d");

                // 获取设备像素比（高分辨率屏幕支持）
                const dpr = window.devicePixelRatio || 1;
                const width = 90;
                const height = 32;

                // 设置 Canvas 尺寸为 CSS 尺寸的 dpr 倍
                canvas.width = width * dpr;
                canvas.height = height * dpr;

                // 缩放 Canvas，使其显示为正确的尺寸
                canvas.style.width = `${width}px`;
                canvas.style.height = `${height}px`;

                // 将 Canvas 缩放到实际绘图尺寸
                ctx?.scale(dpr, dpr);

                // 清空画布
                ctx?.clearRect(0, 0, width, height);

                // 设置背景颜色
                ctx!.fillStyle = "#fff"; // 背景色
                ctx!.fillRect(0, 0, width, height);

                // 设置文本样式
                ctx!.font = "600 20px YouSheBiaoTiHei"; // 字体大小和字体类型
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

        // 组件首次加载时生成验证码
        useEffect(() => {
            generateCaptcha();
            if (onGenerateCaptcha) {
                onGenerateCaptcha(() => generateCaptcha);
            }
        }, []);

        useUpdateEffect(() => {
            onChange(captchaTextRef.current); // 将验证码传递给父组件
        }, [value, captchaTextRef.current]);

        return (
            <canvas
                ref={canvasRef}
                width="90"
                height="32"
                onClick={generateCaptcha} // 点击 Canvas 刷新验证码
                className="cursor-pointer rounded-2 font-YouSheBiaoTiHei"
            />
        );
    },
);

export default Captcha;
