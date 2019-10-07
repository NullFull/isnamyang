import './index.styl'
import React from 'react'
import {Helmet} from 'react-helmet'
import {BrowserBarcodeReader} from '@zxing/library'
import DecodeHintType from '@zxing/library/esm5/core/DecodeHintType'
import activeConfetti from '../lib/confetti.js'
import { setWebAppManifest } from '../lib/dynamicMenifest';


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
        setTimeout(() => {
            setWebAppManifest({
                userAgent: navigator.userAgent,
                selector: '#dynamic-manifest'
            })
        }, 1)

        try {
            await this.startDetect()
        } catch (error) {
            this.setState({
                streamNotSupported: true
            })
        }
    }

    render() {
        const {detected, streamNotSupported, isNamyang} = this.state

        return (
            <div className="app">
                <Helmet>
                    <title>남양유없</title>
                    <meta charSet="utf-8" />
                    <meta httpEquiv="x-ua-compatible" content="ie=edge" />
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <meta property="og:url" content="https://isnamyang.nullfull.kr" />
                    <meta property="og:type" content="website" />
                    <meta property="og:title" content="남양유없 | 널채움(nullfull)" />
                    <meta property="og:description" content="바코드만 찍으면 남양의 손길이 닿은 제품인지 알 수 있는 남양유없입니다! " />
                    <meta property="og:image" content="https://isnamyang.nullfull.kr/isnamyang-logo.png" />
                    <meta property="og:locale" content="ko_KR" />
                    <link rel="manifest" id="dynamic-manifest" />
                    <link rel="apple-touch-icon" sizes="72x72" href="/icons/icon-72x72.png" />
                    <link rel="apple-touch-icon" sizes="96x96" href="/icons/icon-96x96.png" />
                    <link rel="apple-touch-icon" sizes="128x128" href="/icons/icon-128x128.png" />
                    <link rel="apple-touch-icon" sizes="144x144" href="/icons/icon-144x144.png" />
                    <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
                    <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png" />
                    <link rel="apple-touch-icon" sizes="384x384" href="/icons/icon-384x384.png" />
                    <link rel="apple-touch-icon" sizes="512x512" href="/icons/icon-512x512.png" />
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
                              <button type="submit" className="submit-btn" disabled={this.state.entered.length < 13}>찾기</button>
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
                            <a className="report" href={this.getReportUrl(isNamyang, detected)} target="_blank">오류 신고</a>
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
