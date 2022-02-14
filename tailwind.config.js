module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./tw/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': 'rgb(174,82,227)',
        'primary-dark': "#aa00ff",
        'default-bg': 'rgb(5,6,16)',
        'paper-bg': 'rgb(27,30,65)',
        'secondary': '#1de9b6'
      },
      fontFamily:{
        oxa: "Oxanium",
        zeb: "Zebulon",
        zc: "Zebulon-Condensed",
        zch: "Zebulon-Condensed-Hollow",
        zho: "Zebulon-Hollow",
        mars: "MarsAttacks"
      }
    },
  },
  plugins: [],
}
