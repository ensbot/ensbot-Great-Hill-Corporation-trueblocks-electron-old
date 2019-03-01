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
      startBlock: 0,
      endBlock: 7201241
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

  // downloadData = () => {
  //   let filename = `${this.state.address}.json`;
  //   let contentType = "application/json;charset=utf-8;";
  //   'data:' + contentType + ',' + encodeURIComponent(JSON.stringify(this.state.data));
  // }

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
      console.log(res);
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
            }
          )}
        </select>
          {/* <input className="address-input" type="text" name="inputAddress" placeholder="Enter an address" value={this.state.val} onChange={this.handleInputChange}/> */}
          {/* <input className="submit" type="submit" value="Fetch"/> */}
          </form>
        {console.log(this.state.fetchStatus)}
        <div className={"fetch-progress " + (this.state.fetchStatus === "complete" ? "complete" : "")}>
          <div className={"status-box " + (this.state.fetchStatus === "req" ? "active" : "")}>
            <div className="blip"></div>
            <div className="info">{this.fetchStatuses.indexOf(this.state.fetchStatus) < 1 ? "Initializing..." : "Cache initialized"}</div>
          </div>
          <div className={"status-box " + (this.state.fetchStatus === "freshen" ? "active" : "")}>
           <div className="blip"></div>
           <div className="info">{this.fetchStatuses.indexOf(this.state.fetchStatus) < 2 ? "Freshening cache..." : "Freshened cache"}</div>
          </div>
          <div className={"status-box " + (this.state.fetchStatus === "export" ? "active" : "")}>
            <div className="blip"></div>
            <div className="info">{this.fetchStatuses.indexOf(this.state.fetchStatus) < 3 ? "Exporting from RPC..." : "Exported from RPC"}</div>
          </div>
        </div>
        </div>
        <div className="tab-nav">
        <a>Summary</a>
        <a>Detail</a>
        </div>
        <div className="main-content">
            <SummaryView {...this.state}/>
        </div>
      </div>
    );
  }
}

const SummaryView = (props) => {
  return (
    <div>
      <div><TxChart data={props.data} width="500" height="250"/></div>
      <div>
        <div className="data-description">
        {props.currentAddress &&
        <div>
            <h5>Appearances for address {props.currentAddress}.</h5>
            <p>Start block: {props.startBlock}</p>
            <p>End block: {props.endBlock}</p>
            <a href={'data:application/json;charset=utf-8;,' + encodeURIComponent(JSON.stringify(props.data))} download={props.address+".json"}>Download</a>
        </div>
        }
            </div>
      </div>
    </div>
  )
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
      Header: 'UTC Timestamp',
      accessor: d => new Date(d.timestamp*1000).toLocaleString('en-US', {timeZone:'UTC'})
    }, {
      Header: 'Block Number',
      accessor: "blockNumber"
    },
    {
      Header: 'From',
      accessor: 'from',
    }, {
      Header: 'To',
      accessor: 'to',
    }, {
      Header: 'Value (wei)',
      accessor: 'value',
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