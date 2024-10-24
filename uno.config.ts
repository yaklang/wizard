// uno.config.ts
import {
    defineConfig,
    presetAttributify,
    presetIcons,
    presetTypography,
    presetUno,
    presetWebFonts,
    transformerDirectives,
    transformerVariantGroup,
} from 'unocss';

export default defineConfig({
    presets: [
        presetUno(),
        presetAttributify(),
        presetIcons(),
        presetTypography(),
        presetWebFonts({
            provider: 'none',
            fonts: {
                YouSheBiaoTiHei: 'YouSheBiaoTiHei',
            },
        }),
    ],
    transformers: [transformerDirectives(), transformerVariantGroup()],
});
