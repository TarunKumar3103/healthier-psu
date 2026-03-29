import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#070F1E',   // deep Penn State navy
        surface: '#0D1F3C',      // dark navy surface
        border: '#1A3A6B',       // Penn State blue border
        amber: '#009CDE',        // PSU sky blue — primary CTA
        'green-accent': '#4DAFD4', // lighter sky blue
        coral: '#E05C7A',        // rose — delete / danger
        cream: '#FFFFFF',        // white
        muted: '#B0C4D8',        // light muted
        'psu-navy': '#1E407C',   // official Penn State navy
        'psu-sky': '#009CDE',    // official Penn State sky blue
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        dm: ['var(--font-dm)', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
