import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
    analyser: AnalyserNode;
    is_recording: boolean;
}

export default function AudioVisualizer({ analyser, is_recording }: AudioVisualizerProps) {
    const canvas_ref = useRef<HTMLCanvasElement>(null);
    const animation_id_ref = useRef<number | null>(null);

    useEffect(() => {
        if (!canvas_ref.current || !analyser) return;

        const canvas = canvas_ref.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const buffer_length = analyser.frequencyBinCount;
        const data_array = new Uint8Array(buffer_length);

        const draw = () => {
            animation_id_ref.current = requestAnimationFrame(draw);

            analyser.getByteFrequencyData(data_array);

            ctx.fillStyle = 'rgb(0, 0, 0, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const bar_width = (canvas.width / buffer_length) * 2.5;
            let bar_height;
            let x = 0;

            for (let i = 0; i < buffer_length; i++) {
                bar_height = (data_array[i] / 255) * canvas.height * 0.8;

                // Different colors for recording vs monitoring
                if (is_recording) {
                    // Red when recording
                    const red = (data_array[i] / 255) * 255;
                    const green = 50;
                    const blue = 50;
                    ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
                } else {
                    // Grayscale when monitoring (not recording)
                    const gray_value = (data_array[i] / 255) * 200 + 55; // Range from 55-255 for visibility
                    ctx.fillStyle = `rgb(${gray_value}, ${gray_value}, ${gray_value})`;
                }

                ctx.fillRect(x, canvas.height - bar_height, bar_width, bar_height);

                x += bar_width + 1;
            }
        };

        const resizeCanvas = () => {
            if (canvas && canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth;
                canvas.height = canvas.parentElement.clientHeight;
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Always start the visualization
        draw();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            if (animation_id_ref.current) {
                cancelAnimationFrame(animation_id_ref.current);
            }
        };
    }, [analyser, is_recording]);

    return <canvas ref={canvas_ref} className="w-full h-full bg-gray-100 rounded-lg dark:bg-gray-800" />;
}
