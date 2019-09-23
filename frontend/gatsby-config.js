module.exports = {
    sitemetadata: {
        title: "남양유없",
        description: "바코드만 찍으면 남양의 손길이 닿은 제품인지 알 수 있는 남양유없입니다!",
        url: "https://isnamyang.nullfull.kr",
        image: "/isnamyang-logo.png"
    },
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