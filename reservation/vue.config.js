module.exports = {
  devServer: {
    proxy: {
      '/api': { 
        target: 'http://localhost:2303', 
        ws: true, 
        changeOrigin: true
      }
    }
  }
};