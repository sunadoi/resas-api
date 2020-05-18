import React, { Component } from "react";
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
    this._changeSelection = this._changeSelection.bind(this); //this._changeSelectionで37行目を読み込むので多分ですが、不要な気がします。。
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
    selected_copy[index] = !selected_copy[index]; //ここの2行を削ってsetStateの中でselected: !this.state.selectedとした方が簡潔で分かりやすい気がしましたが好みの問題です。

    if (!this.state.selected[index]) {
      fetch(
        `https://opendata.resas-portal.go.jp/api/v1/population/composition/perYear?cityCode=-&prefCode=${index}`,
        { headers: { "X-API-KEY": APIKEY } }
      )
        .then((response) => response.json())
        .then((res) => {
          const tmp = []; //tmpだけだと何を表すか分かりにくいので、populations?とかの方がいい気がしますがどうでしょう？
          const tmpYears = [];
          // Object.keys(res.result.data[0]).forEach((i) => {
          res.result.data[0].data.forEach((value, i) => {
            // console.log(i);
            // console.log(value);

            console.log(res.result.data[0].data[i] === value);
            tmp.push(value["value"]);
            tmpYears.push(value["year"]);
          });
          console.log(tmp, tmpYears);

          console.log(this.state.series);
          const res_series = {
            //changeSelection関数を呼び出す時にprops.prefNameを渡してやって、ここでprefNameとした方がすっきりする気がしました。好みの問題なのでこのままでも大丈夫です
            name: this.state.prefectures[index].prefName,
            data: tmp,
          };
          this.setState({
            selected: selected_copy, //!this.state.selectedの方が分かりやすい気がしますがどうでしょう？
            series: [...this.state.series, res_series],
            categories: tmpYears,
          });
        });
    } else {
      // チェック済みの場合は削除
      const series_copy = this.state.series.slice(); //スプレッド構文でコピーする方がメジャーな気がします [...this.state.series]

      for (let i = 0; i < series_copy.length; i++) {
        if (series_copy[i].name == this.state.prefectures[index].prefName) { //63行目と同様。あとJSでは==ではなく===を使った方がいいと思います。
          series_copy.splice(i, 1);
        }
      }
      this.setState({
        selected: selected_copy, //!this.state.selectedの方が分かりやすい気がしますがどうでしょう？
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
    //間違いではないですが、objよりもprefecturesの方が分かりやすい気がします。const { prefectures } = this.state;とやるとprefecturesだけでthis.state.prefecturesと同義になります。
    const obj = this.state.prefectures;
    const options = {
      title: {
        text: "都道府県",
      },
      plotOptions: {
        series: {
          label: {
            connectorAllowed: false,
          },
          pointInterval: 10,
          pointStart: 1980,
        },
      },
      xAxis: {
        categories: this.state.categoeis,
      },
      series: this.state.series,
    };
    //間違いではないですが、107行目でobjをprefecturesとして131行目のobjをprefectures, iをprefectureにした方が可読性が上がると思いました
    return (
      <div style={{ margin: "30px" }}>
        <h1>都道府県別の総人口推移グラフ</h1>

        {Object.keys(obj).map((i) => this.renderItem(obj[i]))}
        <HighchartsReact highcharts={Highcharts} options={options} />
      </div>
    );
  }
}

export default Chart;
