import './index.styl'
import React from 'react'
import {BrowserBarcodeReader} from '@zxing/library'
import DecodeHintType from '@zxing/library/esm5/core/DecodeHintType';
import activeConfetti from '../lib/confetti.js'

let confettiColors = [
    '#E68F17',
    '#FAB005',
    '#FA5252',
    '#E64980',
    '#BE4BDB',
    '#0B7285',
    '#15AABF',
    '#EE1233',
    '#40C057'
];
let confettiConfig = {
    angle: 90,
    spread: 290,
    startVelocity: 50,
    elementCount: 120,
    decay: 0.8,
    delay: 4000,
    colors: confettiColors
}

const hint = new Map();
hint.set(DecodeHintType.TRY_HARDER, true)
hint.set(DecodeHintType.ASSUME_GS1, true)

const REPORT_TYPE = {
    '남양임': '%EB%82%A8%EC%96%91%EC%9D%B8%EB%8D%B0+%EB%82%A8%EC%96%91%EC%9D%B4+%EC%95%84%EB%8B%88%EB%9D%BC%EA%B3%A0+%EB%96%A0%EC%9A%94',
    '남양아님': '%EB%82%A8%EC%96%91%EC%9D%B4+%EC%95%84%EB%8B%8C%EB%8D%B0+%EB%82%A8%EC%96%91%EC%9D%B4%EB%9D%BC%EA%B3%A0+%EB%96%A0%EC%9A%94'
}

class Index extends React.Component {
    reader = new BrowserBarcodeReader(
      500,
      hint
    )

    state = {
        entered: '',
        detected: '',
        isNamyang: null,
        itemInfo: null,
        streamUnsupported: false
    }

    async _isNamyang(code) {
        const response = await fetch(`https://isnamyang.appspot.com/api/isnamyang?barcode=${code}`)
        const result = response.status === 200
        const info = response.status === 200 ? await response.json() : {}

        return {result, info}
    }

    handleChange(event) {
        this.setState({ entered: event.target.value })
    }

    async handleSubmit(event) {
        event.preventDefault()
        const code = this.state.entered

        await this.fetchResult(code);
    }

    async fetchResult(code) {
        const {result, info} = await this._isNamyang(code)

        this.setState({
            detected: code,
            isNamyang: result,
            itemInfo: info,
        })
        let confettiBox = document.getElementsByClassName('confetti')[0];
        activeConfetti(confettiBox, confettiConfig);
    }

    _onDetect = async data => {
        const code = data.text

        await this.fetchResult(code);
    }

    async _startDetect() {
        const result = await this.reader.decodeFromInputVideoDevice(undefined, 'interactive')
        this._onDetect(result)
    }

    reset() {
        this.setState({
            entered: '',
            detected: '',
            isNamyang: null,
            itemInfo: null,
        })
    }

    async componentDidMount() {
        try {
            await this._startDetect()
        } catch (error) {
            this.setState({ streamUnsupported: true })
        }
    }

    render() {
        return (
            <div className="wrapper">
                <header className="header">
                    <span className="logo">
                        <img src="isnamyang-logo.svg" alt="남양유없?"/>
                    </span>
                </header>
                <main className="main">
                    <div className="confetti" />
                    {!this.state.detected ?
                    <section className="search">
                        <h1>남양 제품인지 확인해보세요</h1>
                        {this.state.streamUnsupported ?
                          <form onSubmit={this.handleSubmit.bind(this)}>
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
                        {this.state.isNamyang ?
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
                                    <dd className="barcode-info">{this.state.detected}</dd>
                                </dl>
                            </>
                        }
                        <div className="actions">
                            <button type="button" onClick={this.reset.bind(this)}>다른 제품 찾기</button>
                            <a href={this.getReportUrl(this.state.isNamyang, this.state.detected)} className="report-link">오류 신고</a>
                        </div>
                    </section>
                }
                </main>
                <footer className="footer">
                    <div className="container">
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
                    </div>
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
