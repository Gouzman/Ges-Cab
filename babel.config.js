module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        browsers: '> 0.25%, not dead',
        node: 'current'
      },
      useBuiltIns: 'usage',
      corejs: 3,
      modules: false
    }]
  ],
  plugins: [
    ['transform-async-to-promises', {
      inlineHelpers: true,
      externalHelpers: false
    }]
  ]
};
