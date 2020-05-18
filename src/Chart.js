import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import APIKEY from "./Apikey";

class Chart extends Component {
  constructor() {
    super();
    this.state = {
      selected: Array(47).fill(false),
      prefectures: {},
      series: [],
      categories: [],
    };
  }

  componentDidMount() {
    this.fetchChart();
    this._changeSelection = this._changeSelection.bind(this);
  }

  fetchChart() {
    // 47都道府県の一覧を取得
    const API_Call = "https://opendata.resas-portal.go.jp/api/v1/prefectures";

    fetch(API_Call, {
      //リクエストヘッダーにX-API-KEYを含める
      headers: { "X-API-KEY": APIKEY },
    })
      .then((response) => response.json())
      .then((res) => {
        this.setState({ prefectures: res.result });
      })
      .catch((error) => console.error(error));
  }
}

export default Chart;
