const fetch = require('isomorphic-unfetch')
const Papa = require('papaparse')
const { REST, Routes } = require('discord.js')

const DISCORD_TOKEN = process.env.DISCORD_TOKEN
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/12FCPzW-O2SJ2Qw7RECrJ0QlKIFSrHpyHHELEUgRRuLA/edit'

const fetchCSV = async () => {
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTP2hfZRIJhjK0TV5tsEV3Jvh2AJCYD-r3dVPOIrQMHqB6lB1PQcj3TSrTZGz70WtADLWxIHvihtgi2/pub?gid=246889512&single=true&output=csv'
  const response = await fetch(CSV_URL)
  const text = await response.text()
  return Papa.parse(text).data
}

const main = async () => {
  const data = await fetchCSV()
  // 6번 컬럼이 '확인'
  const newReports = data.slice(1).filter(row => !row[6] || row[6] !== 'O')

  if (newReports.length < 1) {
    return
  }

  const client = new REST({ version: '10' }).setToken(DISCORD_TOKEN)
  const channelId = '1027028634382372894'
  await client.post(Routes.channelMessages(channelId), {
    body: {
      content: `확인 안 한 신고가 있어요. [신고 확인하기](${SHEET_URL})`,
    }
  })
}

main()
