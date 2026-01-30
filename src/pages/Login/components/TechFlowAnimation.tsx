import { useEffect, useRef } from 'react';
import './TechFlowAnimation.scss';

const TechFlowAnimation = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        let animationFrameId: number;
        let progress = 0;

        const animate = () => {
            progress += 0.002;
            if (progress > 1) progress = 0;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = '#4a94f8';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;

            for (let i = 0; i < 5; i++) {
                const offset = (progress + i * 0.2) % 1;
                const x = canvas.width * offset;

                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="tech-flow-animation">
            <canvas ref={canvasRef} className="tech-flow-canvas" />

            <div className="tech-flow-content">
                <div className="tech-timeline" />
                
                <div className="tech-stage tech-stage-1">
                    <div className="stage-label">Step 1 · 源代码</div>
                    <div className="code-block">
                        <div className="code-line">
                            <span className="keyword">function</span>{' '}
                            <span className="function">exec</span>(
                            <span className="param">cmd</span>)
                        </div>
                        <div className="code-line">
                            {'  '}<span className="variable">x</span> = <span className="function">validate</span>(<span className="param">cmd</span>)
                        </div>
                        <div className="code-line">
                            {'  '}<span className="keyword">if</span> (<span className="variable">x</span>) <span className="function">shell</span>.<span className="function">run</span>(<span className="variable">x</span>)
                        </div>
                    </div>
                </div>

                <div className="tech-stage tech-stage-2">
                    <div className="stage-label">Step 2 · 控制流图</div>
                    <div className="ast-visualization">
                        <div className="ast-node ast-root">基本块</div>
                        <div className="ast-children">
                            <div className="ast-node">Entry</div>
                            <div className="ast-node">If/Loop</div>
                        </div>
                    </div>
                </div>

                <div className="tech-stage tech-stage-3">
                    <div className="stage-label">Step 3 · SSA 中间表示</div>
                    <div className="ssa-block">
                        <div className="ssa-line">cmd₁ = Param(0)</div>
                        <div className="ssa-line">x₁ = φ(validate(cmd₁))</div>
                        <div className="ssa-line">shell.run(x₁)                        </div>
                    </div>
                </div>

                <div className="tech-stage tech-stage-4">
                    <div className="stage-label">Step 4 · 数据流分析</div>
                    <div className="flow-visualization">
                        <div className="flow-text">
                            <div className="flow-item">Use-Def 链</div>
                            <div className="flow-item">跨过程分析</div>
                            <div className="flow-item">污点追踪</div>
                        </div>
                    </div>
                </div>

                <div className="tech-stage tech-stage-5">
                    <div className="stage-label">Step 5 · 漏洞检测结果</div>
                    <div className="result-container">
                        <div className="result-cards">
                            <div className="result-card result-safe">
                                <div className="result-icon">✓</div>
                                <div className="result-text">命令注入</div>
                            </div>
                            <div className="result-card result-analyzing">
                                <div className="result-icon">⚠</div>
                                <div className="result-text">SQL注入</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="scan-line" />
        </div>
    );
};

export default TechFlowAnimation;
