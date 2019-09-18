module.exports = {
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-stylus',
    {
      resolve: 'gatsby-plugin-google-analytics',
      options: {
        trackingId: 'UA-143097345-1'
      }
    },
    'gatsby-plugin-offline'
  ]
}
