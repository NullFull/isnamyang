import React from 'react'
import Quagga from 'quagga'


class Index extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            detected: []
        }
    }

    _onDetect = data => {
        let appended = this.state.detected.concat(data);
        this.setState({
            detected: appended
        })
    }

    componentDidMount() {
        Quagga.init({
            inputStream : {
                name : "Live",
                type : "LiveStream",
                constraints: {
                    width: 640,
                    height: 640
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
            <div>
                <h1>Is Namyang?</h1>
                <div>
                    <ul>
                    {this.state.detected.map(data => <li>
                        {data.codeResult.code}
                    </li>)}
                    </ul>
                </div>
                <div>
                    <div id="interactive" className="viewport"/>
                </div>
            </div>
        )
    }
}


export default Index

