/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        syne: ['Syne', 'sans-serif'],
        instrument: ['Instrument Sans', 'sans-serif'],
      },
      colors: {
        bg: '#F4F2EE',
        bg2: '#ECEAE4',
        bg3: '#E4E1D8',
        card: '#FFFFFF',
        text1: '#1C1A16',
        text2: '#5A5750',
        text3: '#9E9B93',
        accent: '#C8622A',
        accent2: '#A34D1E',
        'accent-lt': '#FDF1EB',
        blue: '#1E4DA8',
        'blue-lt': '#EBF0FC',
        teal: '#0A5E49',
        'teal-lt': '#E2F5EF',
        amber: '#8A5A00',
        'amber-lt': '#FDF5E0',
        rose: '#9B2042',
        'rose-lt': '#FDEDF1',
        green: '#2E9E5B',
      },
      borderRadius: {
        sm: '8px',
        DEFAULT: '12px',
        lg: '20px',
        xl: '28px',
      },
      boxShadow: {
        card: '0 1px 4px rgba(0,0,0,0.07),0 4px 16px rgba(0,0,0,0.04)',
        md: '0 2px 12px rgba(0,0,0,0.09),0 8px 32px rgba(0,0,0,0.05)',
        lg: '0 8px 40px rgba(0,0,0,0.13)',
      },
    },
  },
  plugins: [],
}
