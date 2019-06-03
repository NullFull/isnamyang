import './index.styl'
import React from 'react'
import Quagga from 'quagga'


class Index extends React.Component {
    detected = []

    state = {
        detected: '',
        fetched: null
    }

    constructor(props) {
        super(props)
    }

    _getFrequentlyDetected() {
        const counts = {}
        this.detected.forEach(code => {
            if (counts.hasOwnProperty(code)) {
                counts[code] += 1
            } else {
                counts[code] = 1
            }
        })

        let mostDetected

        Object.keys(counts).forEach(code => {
            if (!mostDetected) mostDetected = code
            if (counts[code] >= counts[mostDetected]) {
                mostDetected = code
            }
        })

        return mostDetected;
    }

    async _fetchAnswer(code) {
        const response = await fetch(`https://isnamyang.appspot.com/api/isnamyang?barcode=${code}`)

        if (response.status === 200) {
            const json = await response.json()
            this.setState({
                detected: code,
                fetched: json
            })
        } else if (response.status === 404) {
            this.setState({
                detected: code,
                fetched: null
            })
        }
    }

    _onDetect = async data => {
        this.detected.push(data.codeResult.code)

        if (this.detected.length === 20) {
            Quagga.stop()
            const code = this._getFrequentlyDetected()
            await this._fetchAnswer(code)
        }
    }

    componentDidMount() {
        Quagga.init({
            inputStream : {
                name : "Live",
                type : "LiveStream",
                constraints: {
                    width: 360,
                    height: 320
                },
                target: document.querySelector('#interactive')
            },
            decoder : {
                readers : ["ean_reader"]
            },
            locate: true
        }, function(err) {
            if (err) {
                return console.log(err);
            }
            Quagga.start();
        });
        Quagga.onDetected(this._onDetect)
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
                            <div id="interactive" className="viewport"/>
                        </div>
                    </div> : <>
                        {this.state.fetched ?
                            <div>
                                <h2>이 제품은 남양 제품이</h2>
                                <h1>맞습니다</h1>
                                <p>{this.state.detected}</p>
                            </div> :
                            <div>
                                <h2>이 제품은 남양 제품이</h2>
                                <h1>아닙니다</h1>
                                <p>{this.state.detected}</p>
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

