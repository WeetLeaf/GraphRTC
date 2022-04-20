module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        theme: {
          DEFAULT: "#FC6C26",
          50: "#FFE7DB",
          100: "#FED9C7",
          200: "#FEBE9F",
          300: "#FDA376",
          400: "#FD874E",
          500: "#FC6C26",
          600: "#E74E03",
          700: "#AF3B02",
          800: "#782802",
          900: "#411601",
        },
      },
      fontFamily: {
        Inter: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
