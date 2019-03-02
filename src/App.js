import React, { Component } from 'react';
import ReactTable from 'react-table';
import logo from './logo.png';
import './App.css';
import 'react-table/react-table.css';
import TxChart from './TxChart';
import addressList from './address-list.json';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.fetchStatuses = [
      "req",
      "freshen",
      "export",
      "complete"
    ]

    this.state = {
      inputAddress: "",
      currentAddress: "",
      isLoaded: false,
      data: [],
      error: null,
      nodeSync: 7245315,
      indexSync: 7201241,
      fetchStatus: "",
      startBlock: "0000000",
      endBlock: "7201241",
      nav: "summary"
    };
  }

  componentDidMount = () => {
    this.fakeSystemSync();
  }

  fakeSystemSync = () => {
    let item = Math.random() < .7 ? "indexSync" : "nodeSync";
    this.setState({[item]: this.state[item]+1});
    setTimeout(this.fakeSystemSync.bind(this), 1000);
  }

  // handleSubmit = (e) => {
  //   this.fetchData("export", this.state.inputAddress);
  //   e.preventDefault();
  // }

  handleInputChange = (e) => {
    this.setState({[e.target.name]: e.target.value}, 
      () => this.fetchData("export", this.state.inputAddress))  
  }

  delay = (t, v) => {
    return new Promise(function(resolve) { 
        setTimeout(resolve.bind(null, v), t)
    });
    }
 
  fetchData = (command, address) => {
    this.setState({fetchStatus: "req"});
    console.log(address);
    this.delay(700).then(() => fetch(`http://localhost:8090/export?address=${address}`))
    .then(res => {
      this.setState({fetchStatus: "freshen"});
      return this.delay(1000, res)})
    .then(res => {
      this.setState({fetchStatus: "export", currentAddress: address})
      return this.delay(500, res.json())})
    .then((res) => {
      res = res.map(tx => {
        if(tx.to.toUpperCase() === address.toUpperCase() | tx.from.toUpperCase() === address.toUpperCase()) {
          tx.type = "toplevel";
        } else if(tx.receipt.logs.articulatedLog &&
          tx.receipt.logs.articulatedLog.inputs.filter(input => input.val.toUpperCase() === address.toUpperCase()).length) {
            tx.type = "log"
          } else {
            tx.type = "misc"
          }
        return tx;
      })
      console.log(res)
      this.setState({data: res, isLoaded: true, fetchStatus: "complete"});
    })
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>TrueBlocks (demo)</h1>
          <div className="system-monitors">
            <div className="monitor">
              <div className="heading">RPC provider sync</div>
              <div className="info">#{this.state.nodeSync}</div>
            </div>
            <div className="monitor">
              <div className="heading">Index sync</div>
              <div className="info">#{this.state.indexSync}</div>
            </div>
          </div>
        </div>
        <div className="command-center">
        <form className="address-selector" onSubmit={this.handleSubmit}>
          <select className="address-input" name="inputAddress" value={this.state.inputAddress} onChange={this.handleInputChange}>
            <option value="">Select a monitor...</option>
            {addressList.map((monitor) => {return monitor.visible &&
              <option value={monitor.address}>{monitor.name}</option>
            })}
          </select>
        </form>
        <div className={"fetch-progress " + (this.state.fetchStatus === "complete" ? "complete" : "")}>
          <div className={"status-box " + (this.state.fetchStatus === "req" ? "active" : "")}>
            <div className="blip"></div>
            <div className="info">{this.fetchStatuses.indexOf(this.state.fetchStatus) < 1 ? "Initializing..." : "Cache initialized"}</div>

          </div>
          <div className="arrows">→</div>
          <div className={"status-box " + (this.state.fetchStatus === "freshen" ? "active" : "")}>
           <div className="blip"></div>
           <div className="info">{this.fetchStatuses.indexOf(this.state.fetchStatus) < 2 ? "Freshening cache..." : "Freshened cache"}</div>
          </div>
          <div className="arrows">→</div>
          <div className={"status-box " + (this.state.fetchStatus === "export" ? "active" : "")}>
            <div className="blip"></div>
            <div className="info">{this.fetchStatuses.indexOf(this.state.fetchStatus) < 3 ? "Exporting from RPC..." : "Exported from RPC"}</div>
          </div>
        </div>
        </div>
        {this.state.currentAddress &&
        <div className="main-content">

        <h2>Export Results</h2>
        <p>(Block range: {this.state.startBlock} - {this.state.endBlock})</p>
        <div className="tab-nav">
          <a className={this.state.nav === "summary" ? "selected" : ""} onClick={() => this.setState({nav: "summary"})}>Summary</a>
          <a className={this.state.nav === "detail" ? "selected" : ""} onClick={() => this.setState({nav: "detail"})}>Detail</a>
          <a className="download" href={'data:application/json;charset=utf-8;,' + encodeURIComponent(JSON.stringify(this.props.data))} download={this.props.currentAddress+this.state.startBlock+"-"+this.state.endBlock+".json"}>Download JSON</a>
          <a className="download">Download CSV</a>
        </div>
        {this.state.nav === "summary" &&
        <SummaryView currentAddress={this.state.currentAddress}
          data={this.state.data}
          startBlock={this.state.startBlock}
          endBlock={this.state.endBlock}
          fetchStatus={this.state.fetchStatus}/>
          }
        {this.state.nav === "detail" &&
          <DetailView data={this.state.data}/>
        }
        </div>
        }
      </div>
    );
  }
}

class SummaryView extends Component {
  constructor(props) {
    super(props);

  }

  shouldComponentUpdate = (nextProps) => {
    return this.props.fetchStatus !== "complete"
  }

  componentDidMount = () => {
  }
  
  render() {
    return (
      <div>
         <div>
          <div className="data-description">
          {this.props.currentAddress &&
          <div>
              <p>Total appearances: {this.props.data.reduce((prev) => prev+1, 0)}</p>
          </div>
          }
              </div>
        </div>
        <div><TxChart data={this.props.data} width="500" height="250"/></div>
      </div>
    )
  }
}

const DetailView = (props) => {
  return (
    <Table data={props.data}/>
  )
}

class Table extends Component {
  constructor(props) {
    super(props);

    this.state = {
      
    }

  this.columns = [
    {
      id: 'timestamp',
      Header: 'Timestamp (UTC)',
      accessor: d => new Date(d.timestamp*1000).toLocaleString('en-US', {timeZone:'UTC'})
    }, {
      Header: 'Block Number',
      accessor: "blockNumber"
    }, {
      Header: 'Tx Index',
      accessor: "transactionIndex"
    }, {
      Header: 'Tx Hash',
      accessor: "hash",
    },
    {
      Header: 'From',
      accessor: 'from',
    }, {
      Header: 'To',
      accessor: 'to',
    }, {
      Header: 'Type',
      accessor: 'type',
    }
  ]
}

render() {
  return (
    <div>
      <ReactTable data={this.props.data} columns={this.columns}/>
    </div>
  );
}

}