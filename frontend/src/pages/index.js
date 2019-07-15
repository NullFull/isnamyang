import './index.styl'
import React from 'react'
import {BrowserBarcodeReader} from '@zxing/library'


const REPORT_TYPE = {
    '남양임': '%EB%82%A8%EC%96%91%EC%9D%B8%EB%8D%B0+%EB%82%A8%EC%96%91%EC%9D%B4+%EC%95%84%EB%8B%88%EB%9D%BC%EA%B3%A0+%EB%96%A0%EC%9A%94',
    '남양아님': '%EB%82%A8%EC%96%91%EC%9D%B4+%EC%95%84%EB%8B%8C%EB%8D%B0+%EB%82%A8%EC%96%91%EC%9D%B4%EB%9D%BC%EA%B3%A0+%EB%96%A0%EC%9A%94'
}

class Index extends React.Component {
    reader = new BrowserBarcodeReader()

    state = {
        detected: '',
        isNamyang: null,
        itemInfo: null
    }

    async _isNamyang(code) {
        const response = await fetch(`https://isnamyang.appspot.com/api/isnamyang?barcode=${code}`)
        const result = response.status === 200
        const info = response.status === 200 ? response.json() : {}

        return {result, info}
    }

    _onDetect = async data => {
        const code = data.text
        const {result, info} = await this._isNamyang(code)

        this.setState({
            detected: code,
            isNamyang: result,
            itemInfo: info
        })
    }

    async _startDetect() {
        const result = await this.reader.decodeFromInputVideoDevice(undefined, 'interactive')
        this._onDetect(result)
    }

    componentDidMount() {
        this._startDetect()
    }

    render() {
        return (
            <div className="app">
                <h1>남양유없?</h1>
                <div className="body">
                {!this.state.detected ?
                    <div>
                        <p>아래 화면에 바코드가 나오도록 비춰주세요</p>
                        <div>
                            <video id="interactive" className="viewport"/>
                        </div>
                    </div> : <>
                        {this.state.isNamyang ?
                            <div>
                                <h2>이 제품은 남양 제품이</h2>
                                <h1>맞습니다</h1>
                                <p>{this.state.itemInfo['제품명']}</p>
                                <p><a href={this.getReportUrl(this.state.isNamyang, this.state.detected)}>오류 신고</a></p>
                            </div> :
                            <div>
                                <h2>이 제품은 남양 제품이</h2>
                                <h1>아닙니다</h1>
                                <p>{this.state.detected}</p>
                                <p><a href={this.getReportUrl(this.state.isNamyang, this.state.detected)}>오류 신고</a></p>
                            </div>
                        }
                    </>
                }
                </div>
            </div>
        )
    }

    getReportUrl(isNamyang, barcode) {
        const reportType = isNamyang ? REPORT_TYPE['남양아님'] : REPORT_TYPE['남양임']
        return `https://docs.google.com/forms/d/e/1FAIpQLSebCozKAt9f0hNqOaQ1BsieW39BdVfuOuz-9Tcpi-nXFzyNIQ/viewform?usp=pp_url&entry.651419076=${reportType}&entry.877829228=${barcode}`
    }
}


export default Index
