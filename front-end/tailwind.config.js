/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      mode: 'jit',
      screens: {
        'vxl': {'raw': '(min-height: 1280px)'},
        // => @media (max-height: 1279px) { ... }
  
        'vlg': {'raw': '(min-height: 1024px)'},
        // => @media (max-height: 1023px) { ... }
  
        'vmd': {'raw': '(min-height: 880px)'},
        // => @media (max-height: 767px) { ... }
  
        'vsm': {'raw': '(max-height: 375px)'},
        // => @media (max-height: 639px) { ... }
      },
      fontFamily: {
        Noir: ["Noir", "sans-serif"],
        BPNeon:["Neon"],
      },
      minHeight: {
        '81': '325px',
      },
      minWidth: {
        '1/10': '10%',
        '8/10': '80%',
        '104': '26rem',
        '96': '24rem',
        '36': '9rem',
      },
    },
  },
  plugins: [],
};
