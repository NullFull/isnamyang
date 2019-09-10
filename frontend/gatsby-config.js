module.exports = {
  plugins: [
    `gatsby-plugin-react-helmet`,
    `gatsby-plugin-stylus`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: `UA-143097345-1`,
      },
    },
    `gatsby-plugin-offline`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `남양유없`,
        short_name: `남양유없`,
        start_url: `/`,
        background_color: `#ffffff`,
        display: `standalone`,
      },
    },
  ]
}
