import './index.styl'
import React from 'react'
import {BrowserBarcodeReader} from '@zxing/library'


class Index extends React.Component {
    reader = new BrowserBarcodeReader()

    candidates = []

    state = {
        detected: '',
        isNamyang: null,
        itemInfo: null
    }

    _getMostFrequent(candidates) {
        const counts = {}

        candidates.forEach(code => {
            if (counts.hasOwnProperty(code)) {
                counts[code]++
            } else {
                counts[code] = 1
            }
        })

        const countKeys = Object.keys(counts)
        let mostFrequent = countKeys[0]

        countKeys.forEach(code => {
            if (counts[code] >= counts[mostFrequent]) mostFrequent = code
        })

        return mostFrequent
    }

    async _isNamyang(code) {
        const response = await fetch(`https://isnamyang.appspot.com/api/isnamyang?barcode=${code}`)
        const result = response.status === 200
        const info = response.status === 200 ? response.json() : {}

        return {result, info}
    }

    _onDetect = async data => {
        if (this.candidates.length < 10) {
            this.candidates.push(data.text)
            this._startDetect()
        } else {
            const code = this._getMostFrequent(this.candidates)
            const {result, info} = await this._isNamyang(code)

            this.setState({
                detected: code,
                isNamyang: result,
                itemInfo: info
            })
        }
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
                            </div> :
                            <div>
                                <h2>이 제품은 남양 제품이</h2>
                                <h1>아닙니다</h1>
                            </div>
                        }
                    </>
                }
                </div>
            </div>
        )
    }
}


export default Index
