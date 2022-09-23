/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
        '2xl': '1536px',
        '3xl': '1600px',
      },
      backgroundImage: {
        'section-one': "url('/assets/Site_HEADER.png')",
        'main': "url('/assets/Site_Background.png')",
      },
      width: {
        '104': '28rem',
        '112': '32rem',
        '120': '36rem',
        '128': '40rem',
      },
      height: {
        '104': '28rem',
        '112': '32rem',
      },
      fontFamily: {
        saira: ['Saira Bold'],
        barlow: ['Barlow Medium']
      },
      colors: {
        uncommon: '#3EE66E',
        rare: '#2A78EF',
        limited: '#AC72FA',
        collectors: '#E25193',
        prototype: '#DDB540'
      }
    },
  },
  plugins: [],
}
