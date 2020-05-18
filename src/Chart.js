import React from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import APIKEY from "./Apikey";

class Chart extends React.Component {
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
  _changeSelection(index) {
    const selected_copy = this.state.selected.slice();
    selected_copy[index] = !selected_copy[index];

    if (!this.state.selected[index]) {
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index}`,
        { headers: { "X-API-KEY": APIKEY } }
      )
        .then((response) => response.json())
        .then((res) => {
          const populations = [];
          const populationsYears = [];
          res.result.data[0].data.forEach((value, i) => {
            console.log(i);
            console.log(value);

            console.log(res.result.data[0].data[i] === value);
            populations.push(value["value"]);
            populationsYears.push(value["year"]);
          });

          const res_series = {
            name: this.state.prefectures[index].prefName,
            data: populations,
          };
          this.setState({
            selected: selected_copy,
            series: [...this.state.series, res_series],
            categories: populationsYears,
          });
        });
    } else {
      // チェック済みの場合は削除
      const series_copy = this.state.series.slice();

      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name === this.state.prefectures[index].prefName) {
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected: selected_copy,
        series: series_copy,
      });
    }
  }

  renderItem(props) {
    return (
      <div
        key={props.prefCode}
        style={{ margin: "5px", display: "inline-block" }}
      >
        <input
          type="checkbox"
          checked={this.state.selected[props.prefCode - 1]}
          onChange={() => this._changeSelection(props.prefCode - 1)}
        />
        {props.prefName}
      </div>
    );
  }

  render() {
    const prefectures = this.state.prefectures;
    const options = {
      title: {
        text: "都道府県",
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false,
          },
          pointStart: 1980,
        },
      },
      xAxis: {
        categories: this.state.categoeis,
        title: {
          text: "年",
        },
        max: 2020,
        tickInterval: 10,
      },
      yAxis: {
        categories: this.state.categoeis,
        title: {
          text: "人口数",
        },

        labels: {
          formatter: function () {
            return Highcharts.numberFormat(this.value, 0, ",", ",");
          },
        },
      },
      series: this.state.series,
    };
    return (
      <div style={{ margin: "30px" }}>
        <h1>都道府県別の総人口推移グラフ</h1>

        {Object.keys(prefectures).map((prefecture) =>
          this.renderItem(prefectures[prefecture])
        )}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
}

export default Chart;
