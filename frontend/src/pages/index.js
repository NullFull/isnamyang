import './index.styl'
import React from 'react'
import {Helmet} from 'react-helmet'
import {BrowserBarcodeReader} from '@zxing/library'
import DecodeHintType from '@zxing/library/esm5/core/DecodeHintType'
import activeConfetti from '../lib/confetti.js'


const confettiColors = [
    '#E68F17',
    '#FAB005',
    '#FA5252',
    '#E64980',
    '#BE4BDB',
    '#0B7285',
    '#15AABF',
    '#EE1233',
    '#40C057'
]
const confettiConfig = {
    angle: 90,
    spread: 290,
    startVelocity: 50,
    elementCount: 120,
    decay: 0.8,
    delay: 4000,
    colors: confettiColors
}

const hints = new Map();
hints.set(DecodeHintType.TRY_HARDER, true)
hints.set(DecodeHintType.ASSUME_GS1, true)

const REPORT_TYPE = {
    '남양임': '%EB%82%A8%EC%96%91%EC%9D%B8%EB%8D%B0+%EB%82%A8%EC%96%91%EC%9D%B4+%EC%95%84%EB%8B%88%EB%9D%BC%EA%B3%A0+%EB%96%A0%EC%9A%94',
    '남양아님': '%EB%82%A8%EC%96%91%EC%9D%B4+%EC%95%84%EB%8B%8C%EB%8D%B0+%EB%82%A8%EC%96%91%EC%9D%B4%EB%9D%BC%EA%B3%A0+%EB%96%A0%EC%9A%94'
}


class Index extends React.Component {
    reader = new BrowserBarcodeReader(
        300
    )

    state = {
        entered: '',
        detected: '',
        isNamyang: null,
        itemInfo: null,
        streamNotSupported: false
    }

    confettiBox = React.createRef()

    async _isNamyang(code) {
        const response = await fetch(`https://isnamyang.appspot.com/api/isnamyang?barcode=${code}`)
        const result = response.status === 200
        const info = response.status === 200 ? await response.json() : {}

        return {result, info}
    }

    handleChange(event) {
        this.setState({ entered: event.target.value })
    }

    handleSubmit = async event => {
        event.preventDefault()
        const code = this.state.entered

        await this.fetchResult(code);
    }

    async fetchResult(code) {
        const {result, info} = await this._isNamyang(code)

        this.setState({
            detected: code,
            isNamyang: result,
            itemInfo: info
        }, () => {
            activeConfetti(this.confettiBox.current, confettiConfig)
        })

        window.ga && window.ga('send', 'event', 'Barcode', 'search', code)
    }

    onDetect = async data => {
        const code = data.text
        await this.fetchResult(code);
    }

    async startDetect() {
        const result = await this.reader.decodeFromInputVideoDevice(undefined, 'interactive')
        this.onDetect(result)
    }

    reset = () => {
        this.setState({
            entered: '',
            detected: '',
            isNamyang: null,
            itemInfo: null,
        }, async () => {
            await this.startDetect()
        })
    }

    async componentDidMount() {
        try {
            await this.startDetect()
        } catch (error) {
            this.setState({
                streamUnsupported: true
            })
        }
    }

    render() {
        const {detected, streamNotSupported, isNamyang} = this.state

        return (
            <div className="app">
                <Helmet>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                </Helmet>
                <header className="header">
                    <span className="logo">
                        <img src="isnamyang-logo.svg" alt="남양유없?"/>
                        <div className="beta"><span>BETA</span></div>
                    </span>
                </header>
                <main className="main">
                    <div ref={this.confettiBox} className="confetti" />
                    {!detected ?
                    <section className="search">
                        <h1>남양 제품인지 확인해보세요</h1>
                        {streamNotSupported ?
                          <form onSubmit={this.handleSubmit}>
                              <label htmlFor="barcode">바코드
                                  <input id="barcode" type="tel" pattern="[0-9]*" maxLength="13" value={this.state.entered} onChange={this.handleChange.bind(this)} placeholder="8801069173603"/>
                              </label>
                              <button type="submit">찾기</button>
                          </form> :
                          <div className="reader">
                              <p>아래 화면에 바코드가 나오도록 비춰주세요</p>
                              <video id="interactive" className="viewport"/>
                          </div>
                        }
                    </section> :
                    <section className="result">
                        {isNamyang ?
                            <>
                                <div className="message">
                                    <p>남양 제품이</p>
                                    <p className="truth">맞습니다!</p>
                                </div>
                                <dl>
                                    <dt className="product-title">제품명:</dt>
                                    <dd className="product-name">{this.state.itemInfo['제품명']}</dd>
                                </dl>
                            </> :
                            <>
                                <div className="message">
                                    <p>남양 제품이</p>
                                    <p className="truth">아닙니다!</p>
                                </div>
                                <dl>
                                    <dt className="barcode-title">바코드:</dt>
                                    <dd className="barcode-info">{detected}</dd>
                                </dl>
                            </>
                        }
                        <div className="actions">
                            <button className="reset" type="button" onClick={this.reset}>다른 제품 찾기</button>
                            <a className="report" href={this.getReportUrl(isNamyang, detected)}>오류 신고</a>
                        </div>
                    </section>
                }
                </main>
                <footer className="footer">
                    <span>
                        <a href="https://github.com/NullFull/isnamyang" target="_blank">
                            <img src="github-logo.png" alt="github" className="logo"/>
                        </a>
                    </span>
                    <span>
                        <a href="https://www.facebook.com/groupnullfull" target="_blank">
                            <img src="nullfull-logo.svg" alt="Null채움" className="logo"/>
                        </a>
                    </span>
                </footer>
            </div>
        )
    }

    getReportUrl(isNamyang, barcode) {
        const reportType = isNamyang ? REPORT_TYPE['남양아님'] : REPORT_TYPE['남양임']
        return `https://docs.google.com/forms/d/e/1FAIpQLSebCozKAt9f0hNqOaQ1BsieW39BdVfuOuz-9Tcpi-nXFzyNIQ/viewform?usp=pp_url&entry.651419076=${reportType}&entry.877829228=${barcode}`
    }
}


export default Index
