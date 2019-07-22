import './index.styl'
import React from 'react'
import {BrowserBarcodeReader} from '@zxing/library'
import DecodeHintType from '@zxing/library/esm5/core/DecodeHintType';

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
        streamUnsupported: false,
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
                        <img src="" alt="남양유없?"/>
                    </span>
                </header>
                <main className="main">
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
                                <p>
                                    남양 제품이<strong> 맞습니다~ <span className="emoji">&#x1F389;</span></strong>
                                </p>
                                <dl>
                                  <dt>제품명:</dt>
                                  <dd>{this.state.itemInfo['제품명']}</dd>
                                </dl>
                            </> :
                            <>
                                <p>
                                    남양 제품이
                                    <strong> 아닙니다.. <span className="emoji">&#x1F625;</span></strong><br/>
                                </p>
                                <dl>
                                    <dt>바코드:</dt>
                                    <dd>{this.state.detected}</dd>
                                </dl>
                            </>
                        }
                        <div className="result__actions">
                            <button type="button" onClick={this.reset.bind(this)}>다른 제품 찾기</button>
                            <a href={this.getReportUrl(this.state.isNamyang, this.state.detected)}>오류 신고</a>
                        </div>
                    </section>
                }
                </main>
                <footer className="footer">
                    <span>
                        <a href="https://github.com/NullFull/isnamyang">Github</a>
                    </span>
                    <span>
                        <a href="https://www.facebook.com/groupnullfull">Null채움</a>
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
